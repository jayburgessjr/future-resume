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

export type Outputs = {
  // Canonical preview key (must always be set on successful generation)
  resume?: string;

  // Back-compat fields (keep writing these to avoid breaking older code)
  latest?: string;
  targetedResume?: string;
  variants?: { targeted?: string };
  coverLetter?: string;
  highlights?: string[];
  toolkit?: unknown;
};

export type Status = {
  loading: boolean;
  lastGenerated?: string;
};
