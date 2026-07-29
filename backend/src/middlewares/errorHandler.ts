import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(`[ErrorHandler] Error message: ${err.message}\nStack: ${err.stack}`);

  let statusCode = (err as { statusCode?: number }).statusCode || 500;
  let message = err.message || "Internal Server Error";
  let validationErrors: any = null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Request validation failed";
    validationErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: validationErrors ? { errors: validationErrors } : null,
    pagination: null,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
