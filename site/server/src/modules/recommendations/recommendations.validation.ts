import { z } from "zod";

const eventSchema = z.object({
  id: z.string().min(1),
  round: z.enum(["mood", "style", "temperature", "material", "storage", "lighting", "personality"]),
  optionId: z.string().optional(),
  optionTitle: z.string().optional(),
  value: z.string().optional(),
  action: z.enum(["like", "dislike", "neutral", "skip"]),
  createdAt: z.number(),
});

export const createRecommendationsSchema = z.object({
  body: z.object({
    events: z.array(eventSchema).max(100),
    budgetMax: z.number().int().min(100_000).max(600_000),
  }),
});

export type CreateRecommendationsInput = z.infer<typeof createRecommendationsSchema>["body"];
