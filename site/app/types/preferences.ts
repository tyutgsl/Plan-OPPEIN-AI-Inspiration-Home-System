export type PreferenceAction = "like" | "dislike" | "neutral" | "skip";

export type RoundKey =
  | "mood"
  | "style"
  | "temperature"
  | "material"
  | "storage"
  | "lighting"
  | "personality";

export type PreferenceOption = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  value: string;
};

export type PreferenceRound = {
  key: RoundKey;
  eyebrow: string;
  title: string;
  prompt: string;
  options: PreferenceOption[];
};

export type PreferenceEvent = {
  id: string;
  round: RoundKey;
  optionId?: string;
  optionTitle?: string;
  value?: string;
  action: PreferenceAction;
  createdAt: number;
};

export type ProfileDimension = {
  label: string;
  value: string;
  confidence: number;
  source: "客户明确选择" | "系统推断";
};

export type ConflictAdvice = {
  id: string;
  title: string;
  cause: string;
  impact: string;
  recommendation: string;
};
