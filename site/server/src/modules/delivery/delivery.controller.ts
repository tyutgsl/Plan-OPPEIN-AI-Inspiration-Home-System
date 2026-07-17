import type { RequestHandler } from "express";
import { deliveryService } from "./delivery.service";

export const createDeliveryProject: RequestHandler = (req, res) => {
  res.json({ success: true, data: deliveryService.create(req.body) });
};
