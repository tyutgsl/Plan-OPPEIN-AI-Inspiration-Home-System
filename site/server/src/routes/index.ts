import { Router } from "express";
import { preferencesRouter } from "../modules/preferences/preferences.routes";
import { recommendationsRouter } from "../modules/recommendations/recommendations.routes";
import { deliveryRouter } from "../modules/delivery/delivery.routes";

export const apiRouter = Router();
apiRouter.get("/health", (_req, res) => res.json({ success: true, service: "oppein-inspiration-api" }));
apiRouter.use("/preferences", preferencesRouter);
apiRouter.use("/recommendations", recommendationsRouter);
apiRouter.use("/delivery", deliveryRouter);
