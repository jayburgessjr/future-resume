import { create } from "zustand";
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

  // MUST return the generated resume string
  runGeneration: () => Promise<string>;

  getWordCount: (s: string) => number;
  isOverLimit: (s: string, limit: number) => boolean;
  isReadyToGenerate: () => boolean;
};

let genToken = 0;

export const useAppDataStore = create<AppDataStore>((set, get) => ({
  settings: { format: "plain_text", includeTable: false, proofread: true },
  inputs: { resumeText: "", jobText: "" },
  outputs: {},
  status: { loading: false },

  updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
  updateInputs: (p) => set((s) => ({ inputs: { ...s.inputs, ...p } })),

  runGeneration: async () => {
    const token = ++genToken;
    const { inputs, settings } = get();
    set((s) => ({ status: { ...s.status, loading: true } }));
    try {
      // TODO: keep your real backend call; map it to a string:
      // const res = await fetch("/api/generate", {...});
      // const data = await res.json();
      // const textRaw = data.resumeText ?? data.text ?? "";
      // const text = String(textRaw ?? "").trim();

      // TEMP stub so wiring always works even without backend:
      const text = `Targeted résumé — mode=${settings.mode} voice=${settings.voice}\n\n${(inputs.resumeText || "").slice(0, 300)}...`.trim();

      if (token !== genToken) return text; // drop stale result

      set((s) => ({
        outputs: {
          ...s.outputs,
          resume: text,                // canonical
          latest: text,                // back-compat
          variants: { ...(s.outputs?.variants || {}), targeted: text },
        },
        status: { loading: false, lastGenerated: new Date().toISOString() },
      }));
      return text;
    } catch (e) {
      if (token === genToken) set((s) => ({ status: { ...s.status, loading: false } }));
      throw e;
    }
  },

  getWordCount: (s) => (s ? (s.match(/\S+/g) || []).length : 0),
  isOverLimit: (s, limit) => (s ? (s.match(/\S+/g) || []).length > limit : false),

  isReadyToGenerate: () => {
    const { inputs } = get();
    return inputs.resumeText.trim().length >= 50 && inputs.jobText.trim().length >= 50;
  },
}));
