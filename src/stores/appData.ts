import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateResumeFlow, ResumeGenerationParams, ResumeGenerationResult } from '@/lib/resumeService';

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
}

interface AppOutputs {
  resume: string;
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

interface AppDataStore {
  settings: AppSettings;
  inputs: AppInputs;
  outputs: AppOutputs | null;
  status: AppStatus;
  
  // Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateInputs: (newInputs: Partial<AppInputs>) => void;
  runGeneration: () => Promise<void>;
  clearData: () => void;
  
  // Getters
  getWordCount: (content: string) => number;
  isOverLimit: (content: string, limit: number) => boolean;
  isReadyToGenerate: () => boolean;
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
};

const defaultStatus: AppStatus = {
  hasRun: false,
  loading: false,
};

export const useAppDataStore = create<AppDataStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      inputs: defaultInputs,
      outputs: null,
      status: defaultStatus,

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
            resume: result.finalResume,
            coverLetter: result.coverLetter,
            highlights: result.recruiterHighlights,
            toolkit: result.interviewToolkit,
            weeklyKPITracker: result.weeklyKPITracker,
            metadata: result.metadata,
          };

          set((currentState) => ({
            outputs,
            status: {
              hasRun: true,
              loading: false,
              lastGenerated: new Date(),
            },
          }));

        } catch (error) {
          set((currentState) => ({
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
    }),
    {
      name: 'app-data-storage',
      partialize: (state) => ({
        settings: state.settings,
        inputs: state.inputs,
        outputs: state.outputs,
        status: { hasRun: state.status.hasRun, loading: false }, // Don't persist loading state
      }),
    }
  )
);