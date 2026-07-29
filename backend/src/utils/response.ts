import { Response } from "express";

interface ApiResponseOptions<T = any> {
  res: Response;
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

export function sendResponse<T>({
  res,
  statusCode = 200,
  success = true,
  message = "Operation successful",
  data,
  pagination = null,
}: ApiResponseOptions<T>): void {
  res.status(statusCode).json({
    success,
    message,
    data: data !== undefined ? data : null,
    pagination,
    timestamp: new Date().toISOString(),
  });
}
