import type { PreferenceEvent } from "./preferences";

export type Household = {
  adults: number;
  children: number;
  elders: number;
  pets: number;
};

export type CustomerRequest = {
  displayName: string;
  city: string;
  layout: string;
  areaM2: number;
  budgetMin: number;
  budgetMax: number;
  household: Household;
  moveInMonth?: string;
  freeText: string;
  specialNeeds: string[];
  demoMode: boolean;
};

export type CustomerWorkspace = {
  id: string;
  request: CustomerRequest;
  events: PreferenceEvent[];
  currentRound: number;
  showRecommendations: boolean;
  recommendationBudgetMax: number;
  selectedCaseId: string | null;
  resolvedRiskIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type CustomerStore = {
  version: 1;
  activeCustomerId: string | null;
  customers: CustomerWorkspace[];
};

export const householdLabel = (household: Household) => {
  const parts = [
    household.adults ? `${household.adults}位成人` : "",
    household.children ? `${household.children}名儿童` : "",
    household.elders ? `${household.elders}位老人` : "",
    household.pets ? `${household.pets}只宠物` : "",
  ].filter(Boolean);
  return parts.join("＋") || "未填写";
};

export const recommendationHouseholdLabel = (household: Household) => {
  if (household.elders > 0 && household.children > 0) return "三代同堂";
  if (household.elders > 0) return "夫妻+老人";
  if (household.children >= 2) return "夫妻+2名儿童";
  if (household.children === 1) return "夫妻+1名儿童";
  if (household.adults === 1 && household.pets > 0) return "单身+宠物";
  if (household.pets > 0) return "夫妻+宠物";
  return household.adults <= 1 ? "单身居住" : "新婚夫妻";
};
