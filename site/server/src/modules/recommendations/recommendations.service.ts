import { buildRecommendationInput, recommend } from "../../../../app/lib/recommendation-engine";
import type { CreateRecommendationsInput } from "./recommendations.validation";

export const recommendationsService = {
  create(input: CreateRecommendationsInput) {
    const profile = buildRecommendationInput(input.events, input.budgetMax);
    return { profile, run: recommend(profile) };
  },
};
