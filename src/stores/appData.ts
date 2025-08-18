import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateResumeFlow, ResumeGenerationParams, ResumeGenerationResult } from '@/lib/resumeService';
import { usePersistenceStore } from './persistenceStore';
import { performGreatnessCheck, logQualityAssessment } from '@/lib/qualityCheck';
import { supabase } from '@/integrations/supabase/client';

const stripComments = (s?: string) =>
  (s ?? '').replace(/<!--[\s\S]*?-->/g, '').trim();

const extractResume = (res: any): string => {
  if (!res) return '';
  if (typeof res === 'string') return stripComments(res);
  const candidates = [
    res.resume,
    res.final_resume,
    res.result,
    res.content,
    res.output?.resume,
    res.outputs?.resume,
    res.data?.resume,
  ].filter(Boolean);
  return stripComments(String(candidates[0] || ''));
};

interface AppSettings {
  mode: 'concise' | 'detailed' | 'executive';
  voice: 'first-person' | 'third-person';
  format: 'markdown' | 'plain_text' | 'json';
  includeTable: boolean;
  proofread: boolean;
}

interface AppInputs {
  resumeText: string;
  jobText: string;
  companySignal?: string;
  companyName?: string;
  companyUrl?: string;
}

interface AppOutputs {
  resume: string | null;
  coverLetter: string;
  highlights: string[];
  toolkit: {
    questions: string[];
    followUpEmail: string;
    skillGaps: string[];
  };
  weeklyKPITracker: string;
  metadata: {
    phase: string;
    optimizationScore: number;
    keywordsMatched: number;
    wordCount: number;
  };
}

interface AppStatus {
  hasRun: boolean;
  loading: boolean;
  lastGenerated?: Date;
}

interface AppFlags {
  hasRunResume: boolean;
  hasRunCoverLetter: boolean;
  hasRunHighlights: boolean;
  hasRunInterview: boolean;
}

interface AppDataStore {
  settings: AppSettings;
  inputs: AppInputs;
  outputs: AppOutputs | null;
  status: AppStatus;
  flags: AppFlags;
  loading: boolean;

  // hydration and generation
  hydrateFromDashboard: (payload: { resumeText: string; jobText: string; companySignal?: string }) => void;
  generateResume: () => Promise<void>;

  // Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateInputs: (newInputs: Partial<AppInputs>) => void;
  runGeneration: () => Promise<void>;
  clearData: () => void;
  loadToolkitIntoBuilder: (toolkitId: string) => Promise<void>;
  
  // Getters
  getWordCount: (content: string) => number;
  isOverLimit: (content: string, limit: number) => boolean;
  isReadyToGenerate: () => boolean;
  getFirstIncompleteStep: () => 'resume' | 'cover-letter' | 'highlights' | 'interview';
}

const defaultSettings: AppSettings = {
  mode: 'detailed',
  voice: 'first-person',
  format: 'plain_text',
  includeTable: false,
  proofread: true,
};

const defaultInputs: AppInputs = {
  resumeText: '',
  jobText: '',
  companySignal: '',
  companyName: '',
  companyUrl: '',
};

const defaultStatus: AppStatus = {
  hasRun: false,
  loading: false,
};

const defaultFlags: AppFlags = {
  hasRunResume: false,
  hasRunCoverLetter: false,
  hasRunHighlights: false,
  hasRunInterview: false,
};

export const useAppDataStore = create<AppDataStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      inputs: defaultInputs,
      outputs: null,
      status: defaultStatus,
      flags: defaultFlags,
      loading: false,

      hydrateFromDashboard: ({ resumeText, jobText, companySignal }) =>
        set((s) => ({
          inputs: {
            ...s.inputs,
            resumeText: resumeText ?? '',
            jobText: jobText ?? '',
            companySignal: companySignal ?? s.inputs.companySignal,
          },
          outputs: { ...(s.outputs || {}), resume: '' },
          flags: { ...s.flags, hasRunResume: false },
        })),

      generateResume: async () => {
        const { inputs, settings } = get();
        if (!inputs.resumeText?.trim() || !inputs.jobText?.trim()) return;
        set((s) => ({ loading: true, status: { ...s.status, loading: true } }));
        try {
          const params: ResumeGenerationParams = {
            ...settings,
            resumeContent: inputs.resumeText,
            jobDescription: inputs.jobText,
            manualEntry: inputs.companySignal,
          };
          const raw: ResumeGenerationResult = await generateResumeFlow(params);
          const txt = extractResume(raw);
          set((s) => ({
            outputs: { ...(s.outputs || {}), resume: txt, metadata: raw.metadata },
            flags: { ...s.flags, hasRunResume: txt.length > 0 },
            loading: false,
            status: { ...s.status, loading: false },
          }));
        } catch (e) {
          set((s) => ({ loading: false, status: { ...s.status, loading: false } }));
        }
      },

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      updateInputs: (newInputs) => {
        set((state) => ({
          inputs: { ...state.inputs, ...newInputs },
        }));
        
        // Store inputs for other pages to access
        const currentState = get();
        if (currentState.inputs.resumeText && currentState.inputs.jobText) {
          localStorage.setItem('resume-generation-inputs', JSON.stringify({
            resumeContent: currentState.inputs.resumeText,
            jobDescription: currentState.inputs.jobText,
          }));
        }
      },

      runGeneration: async () => {
        const state = get();

        if (!state.isReadyToGenerate()) {
          throw new Error('Missing required inputs');
        }

        set((currentState) => ({
          loading: true,
          status: { ...currentState.status, loading: true },
        }));

        try {
          const params: ResumeGenerationParams = {
            ...state.settings,
            resumeContent: state.inputs.resumeText,
            jobDescription: state.inputs.jobText,
            manualEntry: state.inputs.companySignal,
          };

          const result: ResumeGenerationResult = await generateResumeFlow(params);

          const outputs: AppOutputs = {
            resume: result.finalResume ?? result.resume,
            coverLetter: result.coverLetter,
            highlights: result.recruiterHighlights,
            toolkit: result.interviewToolkit,
            weeklyKPITracker: result.weeklyKPITracker,
            metadata: result.metadata,
          };

          // Perform Greatness Check and log results (dev-only)
          const qualityResult = performGreatnessCheck(
            result.finalResume,
            state.inputs.jobText,
            state.settings
          );
          
          logQualityAssessment(qualityResult, 'Resume Generation');

          set((currentState) => ({
            outputs,
            loading: false,
            status: {
              hasRun: true,
              loading: false,
              lastGenerated: new Date(),
            },
          }));

          // Save to database if user is authenticated
          try {
            await usePersistenceStore.getState().saveDraft(
              state.inputs,
              outputs,
              state.settings
            );
          } catch (error) {
            // Continue even if save fails (user might not be logged in)
            console.log('Could not save to database:', error);
          }

        } catch (error) {
          set((currentState) => ({
            loading: false,
            status: { ...currentState.status, loading: false },
          }));
          throw error;
        }
      },

      clearData: () => {
        set({
          inputs: defaultInputs,
          outputs: null,
          status: defaultStatus,
        });
        localStorage.removeItem('resume-generation-inputs');
      },

      getWordCount: (content: string) => {
        return content.split(/\s+/).filter(word => word.length > 0).length;
      },

      isOverLimit: (content: string, limit: number) => {
        const state = get();
        return state.getWordCount(content) > limit;
      },

      isReadyToGenerate: () => {
        const state = get();
        return (
          state.inputs.resumeText.trim().length >= 50 &&
          state.inputs.jobText.trim().length >= 50
        );
      },

      loadToolkitIntoBuilder: async (toolkitId: string) => {
        try {
          const { data: toolkit, error } = await supabase
            .from('toolkits')
            .select('*')
            .eq('id', toolkitId)
            .single();

          if (error) throw error;
          if (!toolkit) throw new Error('Toolkit not found');

          // Safely parse toolkit data
          const settings = (typeof toolkit.settings === 'object' && toolkit.settings !== null) 
            ? toolkit.settings as Record<string, any> 
            : {};
          const inputs = (typeof toolkit.inputs === 'object' && toolkit.inputs !== null) 
            ? toolkit.inputs as Record<string, any> 
            : {};
          const outputs = (typeof toolkit.outputs === 'object' && toolkit.outputs !== null) 
            ? toolkit.outputs as Record<string, any> 
            : {};

          // Convert toolkit outputs to app outputs format
          const appOutputs: AppOutputs = {
            resume: (typeof outputs.resume === 'string') ? outputs.resume : '',
            coverLetter: (typeof outputs.coverLetter === 'string') ? outputs.coverLetter : '',
            highlights: Array.isArray(outputs.highlights) ? outputs.highlights : [],
            toolkit: (typeof outputs.interviewToolkit === 'object' && outputs.interviewToolkit !== null) 
              ? outputs.interviewToolkit as any 
              : {
                  questions: [],
                  followUpEmail: '',
                  skillGaps: []
                },
            weeklyKPITracker: (typeof outputs.weeklyKPITracker === 'string') ? outputs.weeklyKPITracker : '',
            metadata: (typeof outputs.metadata === 'object' && outputs.metadata !== null) 
              ? outputs.metadata as any 
              : {
                  phase: 'complete',
                  optimizationScore: 0,
                  keywordsMatched: 0,
                  wordCount: 0
                }
          };

          set({
            settings: { ...defaultSettings, ...settings },
            inputs: { ...defaultInputs, ...inputs },
            outputs: appOutputs,
            status: {
              hasRun: true,
              loading: false,
              lastGenerated: new Date(toolkit.created_at)
            }
          });

        } catch (error) {
          console.error('Error loading toolkit into builder:', error);
          throw error;
        }
      },

      getFirstIncompleteStep: () => {
        const state = get();
        const outputs = state.outputs;

        if (!outputs || !outputs.resume) {
          return 'resume';
        }
        if (!outputs.coverLetter) {
          return 'cover-letter';
        }
        if (!outputs.highlights || outputs.highlights.length === 0) {
          return 'highlights';
        }
        if (!outputs.toolkit || (!outputs.toolkit.questions || outputs.toolkit.questions.length === 0)) {
          return 'interview';
        }
        
        // All steps complete, go to final step
        return 'interview';
      },
    }),
    {
      name: 'app-data-storage',
      partialize: (state) => ({
        settings: state.settings,
        inputs: state.inputs,
        outputs: state.outputs,
        status: { hasRun: state.status.hasRun, loading: false }, // Don't persist loading state
        flags: state.flags,
      }),
    }
  )
);

export const useAppData = useAppDataStore;