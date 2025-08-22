import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateResumeFlow } from "@/lib/resumeService";
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

  updateSettings: (p: Partial<Settings>) => void;
  updateInputs: (p: Partial<Inputs>) => void;
  clearData: () => void;

  // Generate resume and return the result
  generateResume: () => Promise<string>;
  runGeneration: () => Promise<string>; // Alias for backward compatibility

  getWordCount: (s: string) => number;
  isOverLimit: (s: string, limit: number) => boolean;
  isReadyToGenerate: () => boolean;
  getFirstIncompleteStep: () => string | null;
  hydrateFromDashboard: (data: { resumeText: string; jobText: string; companySignal?: string }) => void;
  loadToolkitIntoBuilder: (toolkitId: string) => Promise<string | null>;
};

let genToken = 0;

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

  updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
  updateInputs: (p) => {
    set((s) => ({ inputs: { ...s.inputs, ...p } }));
  },

  clearData: () => set({
    inputs: { resumeText: "", jobText: "" },
    outputs: {},
    status: { loading: false }
  }),

  generateResume: async () => {
    const token = ++genToken;
    const state = get();
    const { inputs, settings } = state;
    
    if (!inputs.resumeText.trim() || !inputs.jobText.trim()) {
      throw new Error("Resume content and job description are required");
    }

    set((s) => ({ status: { ...s.status, loading: true } }));
    
    try {
      const result = await generateResumeFlow({
        mode: settings.mode || "detailed",
        voice: settings.voice || "first-person",
        format: settings.format || "plain_text",
        includeTable: settings.includeTable || false,
        proofread: settings.proofread || true,
        resumeContent: inputs.resumeText,
        jobDescription: inputs.jobText,
        manualEntry: inputs.resumeText
      });

      if (token !== genToken) return result.finalResume; // Drop stale result

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
      if (token === genToken) {
        set((s) => ({ 
          status: { ...s.status, loading: false }
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
      outputs: {}, // Reset outputs to trigger fresh generation
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
