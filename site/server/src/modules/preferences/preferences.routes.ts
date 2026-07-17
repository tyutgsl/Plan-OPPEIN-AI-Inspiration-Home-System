import { Router } from "express";
import { validate } from "../../middleware/validate";
import { evaluatePreferences } from "./preferences.controller";
import { evaluatePreferencesSchema } from "./preferences.validation";

export const preferencesRouter = Router();
preferencesRouter.post("/evaluate", validate(evaluatePreferencesSchema), evaluatePreferences);
