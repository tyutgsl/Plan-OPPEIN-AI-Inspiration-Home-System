import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createRecommendations } from "./recommendations.controller";
import { createRecommendationsSchema } from "./recommendations.validation";

export const recommendationsRouter = Router();
recommendationsRouter.post("/", validate(createRecommendationsSchema), createRecommendations);
