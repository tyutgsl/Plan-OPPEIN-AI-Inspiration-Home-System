import type { PreferenceEvent } from "./preferences";

export type DesignCase = {
  id: string;
  title: string;
  dataOrigin: string;
  publicCaseUrl: string | null;
  publicVerifiedFields: string;
  aiGeneratedFields: string;
  region: string;
  city: string;
  layout: string;
  areaM2: number;
  mainStyle: string;
  secondaryStyle: string;
  ambience: string;
  budgetMin: number;
  budgetMax: number;
  budgetTotal: number;
  householdType: string;
  specialNeeds: string[];
  primaryColors: string[];
  materials: string[];
  storageClosedRatio: number;
  lightingPreference: string;
  simulatedTransactionStatus: string;
  transactionEvidence: string;
  revisionCount: number;
  satisfaction5: number;
  deliveryDays: number;
  riskTags: string[];
  displayRight: string;
  trainingRight: string;
  anonymized: boolean;
  imageStatus: string;
  image: string | null;
  sourceUrl: string | null;
};

export type RecommendationInput = {
  city: string;
  layout: string;
  areaM2: number;
  budgetMin: number;
  budgetMax: number;
  householdType: string;
  preferredStyles: string[];
  ambience: string[];
  temperature: "暖" | "中性" | "冷" | "未确定";
  materials: string[];
  storageClosedRatio: number;
  lighting: string[];
  needs: string[];
  events?: PreferenceEvent[];
};

export type ScoreKey = "style" | "budget" | "layout" | "household" | "function" | "transaction" | "satisfaction";

export type ScoreBreakdown = {
  key: ScoreKey;
  label: string;
  score: number;
  weight: number;
  evidence: string;
};

export type RecommendationStrategy = "safe" | "personal" | "budget";

export type RecommendationResult = {
  strategy: RecommendationStrategy;
  strategyLabel: string;
  outputLabel: string;
  case: DesignCase;
  totalScore: number;
  strategyScore: number;
  breakdown: ScoreBreakdown[];
  reasons: string[];
  tradeoff: string;
  exploration: boolean;
};

export type RecommendationRun = {
  version: string;
  profileVersion: string;
  weights: Record<ScoreKey, number>;
  sourceCaseCount: number;
  eligibleCaseCount: number;
  candidateCount: number;
  expanded: boolean;
  results: RecommendationResult[];
};
