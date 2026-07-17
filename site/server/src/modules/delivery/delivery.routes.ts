import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createDeliveryProject } from "./delivery.controller";
import { createDeliveryProjectSchema } from "./delivery.validation";

export const deliveryRouter = Router();
deliveryRouter.post("/projects", validate(createDeliveryProjectSchema), createDeliveryProject);
