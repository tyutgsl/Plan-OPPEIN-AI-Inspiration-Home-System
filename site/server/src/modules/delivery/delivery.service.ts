import { createDeliveryProject } from "../../../../app/lib/delivery-engine";
import type { CreateDeliveryProjectInput } from "./delivery.validation";

export const deliveryService = {
  create(input: CreateDeliveryProjectInput) {
    return createDeliveryProject(input.caseId, input.resolvedRiskIds);
  },
};
