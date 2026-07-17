import type { RequestHandler } from "express";
import { preferencesService } from "./preferences.service";

export const evaluatePreferences: RequestHandler = (req, res) => {
  res.json({ success: true, data: preferencesService.evaluate(req.body) });
};
