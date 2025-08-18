import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';

interface ResumeVersion {
  id: string;
  resume_id: string;
  inputs: {
    resumeText: string;
    jobText: string;
    companySignal?: string;
    companyName?: string;
    companyUrl?: string;
  };
  outputs: {
    resume: string;
    coverLetter: string;
    highlights: string[];
    toolkit: any;
    weeklyKPITracker: string;
    metadata: any;
  };
  settings: {
    mode: string;
    voice: string;
    format: string;
    includeTable: boolean;
    proofread: boolean;
  };
  created_at: string;
}

interface Resume {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface PersistenceStore {
  profileId: string | null;
  currentResumeId: string | null;
  versions: ResumeVersion[];
  resumes: Resume[];
  loading: boolean;
  
  // Actions
  saveDraft: (inputs: any, outputs: any, settings: any, title?: string) => Promise<void>;
  loadVersions: (resumeId?: string) => Promise<void>;
  loadResumes: () => Promise<void>;
  restoreVersion: (versionId: string) => Promise<ResumeVersion | null>;
  createNewResume: (title: string) => Promise<string>;
  setCurrentResume: (resumeId: string) => void;
}

export const usePersistenceStore = create<PersistenceStore>((set, get) => {
  // Helper to fetch and cache the profile ID
  async function fetchProfileId(userId: string): Promise<string> {
    const { profileId } = get();
    if (profileId) return profileId;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error || !profile) throw new Error('Profile not found');

    set({ profileId: profile.id });
    return profile.id;
  }

  return {
    profileId: null,
    currentResumeId: null,
    versions: [],
    resumes: [],
    loading: false,

  saveDraft: async (inputs, outputs, settings, title = 'Untitled Resume') => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');

    set({ loading: true });
    
    try {
      // Get or create current resume
      let resumeId = get().currentResumeId;
      
      if (!resumeId) {
        resumeId = await get().createNewResume(title);
      }

      // Save version
      const { error } = await supabase
        .from('resume_versions')
        .insert({
          resume_id: resumeId,
          inputs,
          outputs,
          settings
        });

      if (error) throw error;

      // Reload versions
      await get().loadVersions(resumeId);
      
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadVersions: async (resumeId) => {
    const targetResumeId = resumeId || get().currentResumeId;
    if (!targetResumeId) return;

    set({ loading: true });
    
    try {
      const { data, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('resume_id', targetResumeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ versions: (data || []) as ResumeVersion[] });
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      set({ loading: false });
    }
  },

  loadResumes: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true });
    
    try {
      const profileId = await fetchProfileId(user.id);

      // Get resumes
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('profile_id', profileId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      set({ resumes: data || [] });

      // Set current resume if none selected
      if (!get().currentResumeId && data && data.length > 0) {
        set({ currentResumeId: data[0].id });
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      set({ loading: false });
    }
  },

  restoreVersion: async (versionId) => {
    try {
      const { data, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (error) throw error;
      return data as ResumeVersion;
    } catch (error) {
      console.error('Error restoring version:', error);
      return null;
    }
  },

  createNewResume: async (title) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');

    const profileId = await fetchProfileId(user.id);

    // Create resume
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        profile_id: profileId,
        title
      })
      .select()
      .single();

    if (error) throw error;

    set({ currentResumeId: data.id });
    await get().loadResumes();
    
    return data.id;
  },

  setCurrentResume: (resumeId) => {
    set({ currentResumeId: resumeId });
    get().loadVersions(resumeId);
  },
};
});