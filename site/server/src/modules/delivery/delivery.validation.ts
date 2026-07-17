import { z } from "zod";

export const createDeliveryProjectSchema = z.object({
  body: z.object({
    caseId: z.string().regex(/^OP-(PUB|AI)-\d{3}$/),
    resolvedRiskIds: z.array(z.enum(["RISK-QUOTE-001", "RISK-DELIVERY-001"])).max(2).default([]),
  }),
});

export type CreateDeliveryProjectInput = z.infer<typeof createDeliveryProjectSchema>["body"];
