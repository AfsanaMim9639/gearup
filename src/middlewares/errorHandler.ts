import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";

// 404 handler - for routes that don't exist
export const notFoundHandler = (req: Request, res: Response) => {
  return errorResponse(res, 404, `Route ${req.originalUrl} not found`);
};

// Global error handler - catches any unhandled errors
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return errorResponse(res, statusCode, message, err);
};