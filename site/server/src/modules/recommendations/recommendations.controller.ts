import type { RequestHandler } from "express";
import { recommendationsService } from "./recommendations.service";

export const createRecommendations: RequestHandler = (req, res) => {
  res.json({ success: true, data: recommendationsService.create(req.body) });
};
