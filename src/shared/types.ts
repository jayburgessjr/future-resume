export type Settings = {
  mode?: "concise" | "detailed" | "executive";
  voice?: "first-person" | "third-person";
  format?: "markdown" | "plain_text" | "json";
  includeTable?: boolean;
  proofread?: boolean;
};

export type Inputs = {
  resumeText: string;
  jobText: string;
  companySignal?: string;
  companyName?: string;
  companyUrl?: string;
};

export interface InterviewToolkit {
  questions: string[];
  followUpEmail: string;
  skillGaps: string[];
}

export interface Outputs {
  // Main generated content
  resume?: string;
  coverLetter?: string;
  highlights?: string[];
  toolkit?: InterviewToolkit;
  weeklyKPITracker?: string;

  // Metadata
  metadata?: {
    phase: string;
    optimizationScore: number;
    keywordsMatched: number;
    wordCount: number;
    grammarScore?: number;
  };

  // Back-compat fields (deprecated - use resume field)
  latest?: string;
  targetedResume?: string;
  variants?: { targeted?: string };
}

export type Status = {
  loading: boolean;
  lastGenerated?: string;
};
