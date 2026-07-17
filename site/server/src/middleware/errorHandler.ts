import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;
  if (error instanceof ZodError) {
    res.status(422).json({ success: false, error: "VALIDATION_ERROR", details: error.flatten() });
    return;
  }
  const status = error instanceof AppError ? error.statusCode : 500;
  res.status(status).json({ success: false, error: status === 500 ? "INTERNAL_ERROR" : error.name, message: error.message });
};
