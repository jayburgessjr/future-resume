import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  tags: string[];
  company_signal?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

export interface Resume {
  id: string;
  title: string;
  is_master: boolean;
  created_at: string;
  updated_at: string;
}

export interface Toolkit {
  id: string;
  title: string;
  job_title: string;
  company: string;
  settings: any;
  inputs: any;
  outputs: any;
  favorite: boolean;
  created_at: string;
}

export interface DashboardState {
  jobs: Job[];
  resumes: Resume[];
  toolkits: Toolkit[];
  masterResume: Resume | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadData: () => Promise<void>;
  createJob: (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  archiveJob: (id: string) => Promise<void>;
  
  createMasterResume: (title: string) => Promise<void>;
  setAsMaster: (resumeId: string) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  
  saveToolkit: (toolkit: {
    title: string;
    job_title: string;
    company: string;
    settings: any;
    inputs: any;
    outputs: any;
  }) => Promise<void>;
  
  // Toolkit actions
  loadToolkits: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  deleteToolkit: (id: string) => Promise<void>;
  
  // UI helpers
  getJobById: (id: string) => Job | undefined;
  getSkillGaps: (jobDescription: string, masterResumeText: string) => { missing: string[]; present: string[] };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  jobs: [],
  resumes: [],
  toolkits: [],
  masterResume: null,
  loading: false,
  error: null,

  loadData: async () => {
    try {
      set({ loading: true, error: null });
      
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Load jobs, resumes, and toolkits in parallel
      const [jobsResult, resumesResult, toolkitsResult] = await Promise.all([
        supabase
          .from('jobs')
          .select('*')
          .eq('profile_id', profile.id)
          .eq('archived', false)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('resumes')
          .select('id, title, is_master, created_at, updated_at')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false }),
          
        supabase
          .from('toolkits')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })
      ]);

      if (jobsResult.error) throw jobsResult.error;
      if (resumesResult.error) throw resumesResult.error;
      if (toolkitsResult.error) throw toolkitsResult.error;

      const resumes = resumesResult.data || [];
      const masterResume = resumes.find(r => r.is_master) || null;

      set({
        jobs: jobsResult.data || [],
        resumes,
        toolkits: toolkitsResult.data || [],
        masterResume,
        loading: false
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false 
      });
    }
  },

  createJob: async (jobData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('jobs')
        .insert([{ ...jobData, profile_id: profile.id }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        jobs: [data, ...state.jobs]
      }));

    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  updateJob: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        jobs: state.jobs.map(job => 
          job.id === id ? { ...job, ...updates } : job
        )
      }));
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  deleteJob: async (id) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        jobs: state.jobs.filter(job => job.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  archiveJob: async (id) => {
    try {
      await get().updateJob(id, { archived: true });
      set(state => ({
        jobs: state.jobs.filter(job => job.id !== id)
      }));
    } catch (error) {
      console.error('Error archiving job:', error);
      throw error;
    }
  },

  createMasterResume: async (title) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // First, unset any existing master resume
      await supabase
        .from('resumes')
        .update({ is_master: false })
        .eq('profile_id', profile.id)
        .eq('is_master', true);

      // Create new master resume
      const { data, error } = await supabase
        .from('resumes')
        .insert([{ 
          title, 
          profile_id: profile.id, 
          is_master: true 
        }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        resumes: [data, ...state.resumes.map(r => ({ ...r, is_master: false }))],
        masterResume: data
      }));
    } catch (error) {
      console.error('Error creating master resume:', error);
      throw error;
    }
  },

  setAsMaster: async (resumeId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Unset current master
      await supabase
        .from('resumes')
        .update({ is_master: false })
        .eq('profile_id', profile.id)
        .eq('is_master', true);

      // Set new master
      const { error } = await supabase
        .from('resumes')
        .update({ is_master: true })
        .eq('id', resumeId);

      if (error) throw error;

      set(state => {
        const updatedResumes = state.resumes.map(r => ({
          ...r,
          is_master: r.id === resumeId
        }));
        
        return {
          resumes: updatedResumes,
          masterResume: updatedResumes.find(r => r.is_master) || null
        };
      });
    } catch (error) {
      console.error('Error setting master resume:', error);
      throw error;
    }
  },

  deleteResume: async (id) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => {
        const remainingResumes = state.resumes.filter(r => r.id !== id);
        return {
          resumes: remainingResumes,
          masterResume: state.masterResume?.id === id ? null : state.masterResume
        };
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  },

  getJobById: (id) => {
    const state = get();
    return state.jobs.find(job => job.id === id);
  },

  getSkillGaps: (jobDescription, masterResumeText) => {
    // Simple skill extraction - in a real app this would be more sophisticated
    const extractSkills = (text: string): string[] => {
      const skillKeywords = [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
        'AWS', 'Docker', 'Kubernetes', 'Git', 'REST API', 'GraphQL', 'MongoDB',
        'PostgreSQL', 'Redis', 'Machine Learning', 'Data Science', 'DevOps',
        'CI/CD', 'Agile', 'Scrum', 'Project Management', 'Leadership', 'Communication'
      ];
      
      return skillKeywords.filter(skill => 
        text.toLowerCase().includes(skill.toLowerCase())
      );
    };

    const jobSkills = extractSkills(jobDescription);
    const resumeSkills = extractSkills(masterResumeText);
    
    const missing = jobSkills.filter(skill => 
      !resumeSkills.some(rSkill => rSkill.toLowerCase() === skill.toLowerCase())
    );
    
    const present = jobSkills.filter(skill => 
      resumeSkills.some(rSkill => rSkill.toLowerCase() === skill.toLowerCase())
    );

    return { missing, present };
  },

  saveToolkit: async (toolkit) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('toolkits')
        .insert({
          profile_id: profile.id,
          title: toolkit.title,
          job_title: toolkit.job_title,
          company: toolkit.company,
          settings: toolkit.settings,
          inputs: toolkit.inputs,
          outputs: toolkit.outputs,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      set(state => ({
        toolkits: [data, ...state.toolkits]
      }));
    } catch (error) {
      console.error('Error saving toolkit:', error);
      throw error;
    }
  },

  loadToolkits: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('toolkits')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ toolkits: data || [] });
    } catch (error) {
      console.error('Error loading toolkits:', error);
      throw error;
    }
  },

  toggleFavorite: async (id) => {
    try {
      const toolkit = get().toolkits.find(t => t.id === id);
      if (!toolkit) throw new Error('Toolkit not found');

      const { error } = await supabase
        .from('toolkits')
        .update({ favorite: !toolkit.favorite })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        toolkits: state.toolkits.map(t =>
          t.id === id ? { ...t, favorite: !t.favorite } : t
        )
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  deleteToolkit: async (id) => {
    try {
      const { error } = await supabase
        .from('toolkits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        toolkits: state.toolkits.filter(t => t.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting toolkit:', error);
      throw error;
    }
  }
}));