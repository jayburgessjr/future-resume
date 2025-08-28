import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateResumeFlow } from "@/lib/resumeService";
import { resumeCache } from "@/lib/cache";
import { processInBackground } from "@/lib/backgroundProcessor";
import type { Inputs, Outputs, Settings, Status } from "@/shared/types";

export const selectGeneratedResume = (s: AppDataStore): string =>
  s.outputs?.resume
  || s.outputs?.targetedResume
  || s.outputs?.latest
  || s.outputs?.variants?.targeted
  || "";

type AppDataStore = {
  settings: Settings;
  inputs: Inputs;
  outputs: Outputs;
  status: Status;
  generationProgress: {
    phase: string;
    progress: number;
    phases: Array<{
      id: string;
      title: string;
      description: string;
      status: 'pending' | 'active' | 'completed' | 'error';
    }>;
  };

  updateSettings: (p: Partial<Settings>) => void;
  updateInputs: (p: Partial<Inputs>) => void;
  clearData: () => void;

  // Generate resume and return the result
  generateResume: () => Promise<string>;
  runGeneration: () => Promise<string>; // Alias for backward compatibility

  // Progress management
  updateGenerationProgress: (phase: string, progress: number) => void;
  setPhaseStatus: (phaseId: string, status: 'pending' | 'active' | 'completed' | 'error') => void;
  resetProgress: () => void;

  getWordCount: (s: string) => number;
  isOverLimit: (s: string, limit: number) => boolean;
  isReadyToGenerate: () => boolean;
  getFirstIncompleteStep: () => string | null;
  hydrateFromDashboard: (data: { resumeText: string; jobText: string; companySignal?: string }) => void;
  loadToolkitIntoBuilder: (toolkitId: string) => Promise<string | null>;
};

let genToken = 0;

// Helper function to create content hash for caching
function createContentHash(content: string): string {
  let hash = 0;
  if (content.length === 0) return hash.toString();
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

const DEFAULT_GENERATION_PHASES = [
  {
    id: 'competency',
    title: 'Extracting Core Competencies',
    description: 'Analyzing job requirements and identifying key skills',
    status: 'pending' as const
  },
  {
    id: 'company-signals',
    title: 'Company Signal Analysis',
    description: 'Understanding company culture and values',
    status: 'pending' as const
  },
  {
    id: 'optimization',
    title: 'Resume Optimization',
    description: 'Rewriting content with keyword integration',
    status: 'pending' as const
  },
  {
    id: 'review',
    title: 'Quality Review',
    description: 'AI scoring and improvement suggestions',
    status: 'pending' as const
  },
  {
    id: 'generation',
    title: 'Final Generation',
    description: 'Creating polished resume output',
    status: 'pending' as const
  },
  {
    id: 'deliverables',
    title: 'Creating Deliverables',
    description: 'Generating cover letter and interview toolkit',
    status: 'pending' as const
  },
  {
    id: 'grammar',
    title: 'Grammar & Readability',
    description: 'Final proofreading and quality check',
    status: 'pending' as const
  }
];

export const useAppDataStore = create<AppDataStore>()(
  persist(
    (set, get) => ({
  settings: { 
    format: "plain_text", 
    includeTable: false, 
    proofread: true,
    mode: "detailed",
    voice: "first-person"
  },
  inputs: { resumeText: "", jobText: "" },
  outputs: {},
  status: { loading: false },
  generationProgress: {
    phase: '',
    progress: 0,
    phases: DEFAULT_GENERATION_PHASES
  },

  updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
  updateInputs: (p) => {
    set((s) => ({ inputs: { ...s.inputs, ...p } }));
  },

  clearData: () => set({
    inputs: { resumeText: "", jobText: "" },
    outputs: {},
    status: { loading: false },
    generationProgress: {
      phase: '',
      progress: 0,
      phases: DEFAULT_GENERATION_PHASES
    }
  }),

  updateGenerationProgress: (phase: string, progress: number) => set((s) => ({
    generationProgress: { ...s.generationProgress, phase, progress }
  })),

  setPhaseStatus: (phaseId: string, status: 'pending' | 'active' | 'completed' | 'error') => set((s) => ({
    generationProgress: {
      ...s.generationProgress,
      phases: s.generationProgress.phases.map(p => 
        p.id === phaseId ? { ...p, status } : p
      )
    }
  })),

  resetProgress: () => set((s) => ({
    generationProgress: {
      phase: '',
      progress: 0,
      phases: DEFAULT_GENERATION_PHASES.map(p => ({ ...p, status: 'pending' as const }))
    }
  })),

  generateResume: async () => {
    const token = ++genToken;
    const state = get();
    const { inputs, settings, resetProgress, setPhaseStatus, updateGenerationProgress } = state;
    
    if (!inputs.resumeText.trim() || !inputs.jobText.trim()) {
      throw new Error("Resume content and job description are required");
    }

    // Reset progress and start loading
    resetProgress();
    set((s) => ({ status: { ...s.status, loading: true } }));
    
    try {
      console.log('Starting resume generation with inputs:', {
        resumeLength: inputs.resumeText.length,
        jobLength: inputs.jobText.length,
        settings
      });

      // Create cache key from inputs and settings
      const cacheKey = createContentHash(
        JSON.stringify({
          resume: inputs.resumeText,
          job: inputs.jobText,
          settings: settings
        })
      );

      // Check cache first
      const cachedResult = resumeCache.getResume(cacheKey);
      if (cachedResult) {
        console.log('Using cached resume result');
        
        // Simulate quick progress for cached results
        updateGenerationProgress('Loading cached result...', 50);
        setPhaseStatus('competency', 'completed');
        setPhaseStatus('company-signals', 'completed');
        setPhaseStatus('optimization', 'completed');
        setPhaseStatus('review', 'completed');
        setPhaseStatus('generation', 'completed');
        setPhaseStatus('deliverables', 'completed');
        setPhaseStatus('grammar', 'completed');
        
        updateGenerationProgress('Cache hit - generation complete!', 100);

        // Parse cached result
        const parsedResult = JSON.parse(cachedResult);
        
        set((s) => ({
          outputs: {
            resume: parsedResult.finalResume,
            coverLetter: parsedResult.coverLetter,
            highlights: parsedResult.recruiterHighlights,
            toolkit: parsedResult.interviewToolkit,
            weeklyKPITracker: parsedResult.weeklyKPITracker,
            // Back-compat fields
            latest: parsedResult.finalResume,
            targetedResume: parsedResult.finalResume,
            variants: { targeted: parsedResult.finalResume }
          },
          status: { 
            loading: false, 
            lastGenerated: new Date().toISOString() 
          }
        }));

        return parsedResult.finalResume;
      }

      // Start background analysis for future optimizations
      processInBackground.analyzeResume(inputs.resumeText, inputs.jobText);

      // Start generation with progress tracking
      updateGenerationProgress('Starting AI optimization...', 0);

      const result = await generateResumeFlow({
        mode: settings.mode || "detailed",
        voice: settings.voice || "first-person",
        format: settings.format || "plain_text",
        includeTable: settings.includeTable || false,
        proofread: settings.proofread || true,
        resumeContent: inputs.resumeText,
        jobDescription: inputs.jobText,
        manualEntry: inputs.resumeText
      }, {
        onPhaseStart: (phaseId: string) => {
          if (token === genToken) setPhaseStatus(phaseId, 'active');
        },
        onPhaseComplete: (phaseId: string) => {
          if (token === genToken) setPhaseStatus(phaseId, 'completed');
        },
        onProgress: (phase: string, progress: number) => {
          if (token === genToken) updateGenerationProgress(phase, progress);
        }
      });

      if (token !== genToken) return result.finalResume; // Drop stale result

      console.log('Resume generation completed successfully');

      // Mark all phases as completed
      updateGenerationProgress('Generation complete!', 100);

      // Cache the result for future use
      resumeCache.setResume(cacheKey, JSON.stringify(result));

      // Update state with complete results
      set((s) => ({
        outputs: {
          resume: result.finalResume,
          coverLetter: result.coverLetter,
          highlights: result.recruiterHighlights,
          toolkit: result.interviewToolkit,
          weeklyKPITracker: result.weeklyKPITracker,
          // Back-compat fields
          latest: result.finalResume,
          targetedResume: result.finalResume,
          variants: { targeted: result.finalResume }
        },
        status: { 
          loading: false, 
          lastGenerated: new Date().toISOString() 
        }
      }));

      return result.finalResume;
    } catch (e) {
      console.error('Resume generation failed:', e);
      if (token === genToken) {
        set((s) => ({ 
          status: { ...s.status, loading: false },
          generationProgress: {
            ...s.generationProgress,
            phase: 'Generation failed',
            progress: 0
          }
        }));
      }
      throw e;
    }
  },

  runGeneration: async () => {
    return get().generateResume();
  },
  getWordCount: (s) => (s ? (s.match(/\S+/g) || []).length : 0),
  isOverLimit: (s, limit) => (s ? (s.match(/\S+/g) || []).length > limit : false),

  isReadyToGenerate: () => {
    const { inputs } = get();
    return inputs.resumeText.trim().length >= 50 && inputs.jobText.trim().length >= 50;
  },

  getFirstIncompleteStep: () => {
    const { outputs } = get();
    if (!outputs?.resume) return "resume";
    if (!outputs?.coverLetter) return "cover-letter";
    if (!outputs?.highlights?.length) return "highlights";
    if (!outputs?.toolkit) return "interview";
    return null;
  },

  hydrateFromDashboard: (data) => {
    set({
      inputs: {
        resumeText: data.resumeText,
        jobText: data.jobText,
        companySignal: data.companySignal,
        companyName: "",
        companyUrl: ""
      },
      outputs: null, // Reset outputs to trigger fresh generation
      status: { loading: false }
    });
  },

  loadToolkitIntoBuilder: async (toolkitId: string) => {
    // This would load a saved toolkit from the database
    // For now, return null to indicate no specific step
    return null;
  }
}),
{
  name: 'app-data-storage',
  partialize: (state) => ({
    settings: state.settings,
    inputs: state.inputs,
    // Don't persist outputs or status
  }),
}
)
);
