import { z } from "zod";

export const evaluatePreferencesSchema = z.object({
  body: z.object({
    events: z.array(z.object({
      round: z.enum(["mood", "style", "temperature", "material", "storage", "lighting", "personality"]),
      optionId: z.string().min(1).optional(),
      value: z.string().min(1).optional(),
      action: z.enum(["like", "dislike", "neutral", "skip"]),
    })).max(100),
    context: z.object({
      childSafety: z.boolean(),
      easyCleaning: z.boolean(),
      visualNeatness: z.boolean(),
    }),
  }),
});

export type EvaluatePreferencesInput = z.infer<typeof evaluatePreferencesSchema>["body"];
