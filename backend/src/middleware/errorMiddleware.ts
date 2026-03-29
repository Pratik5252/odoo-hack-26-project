import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError, ErrorResponse } from "../utils/errorHandler";

/**
 * Global error handling middleware
 * Must be used after all other routes and middleware
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: Record<string, string[]> | undefined;

  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    statusCode = 400;
    message = "Validation error";
    errors = err.flatten().fieldErrors as Record<string, string[]>;

    const errorResponse: ErrorResponse = {
      success: false,
      message,
      statusCode,
      data: null,
      errors,
    };

    return res.status(statusCode).json(errorResponse);
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    const errorResponse: ErrorResponse = {
      success: false,
      message,
      statusCode,
      data: null,
    };

    return res.status(statusCode).json(errorResponse);
  }

  // Handle other errors
  console.error("Unhandled error:", err);

  const errorResponse: ErrorResponse = {
    success: false,
    message,
    statusCode,
    data: null,
  };

  res.status(statusCode).json(errorResponse);
};
