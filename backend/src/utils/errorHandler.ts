/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  data?: null;
  errors?: Record<string, string[]>;
}

/**
 * Format error response
 */
export const formatErrorResponse = (
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>,
): ErrorResponse => {
  return {
    success: false,
    message,
    statusCode,
    data: null,
    ...(errors && { errors }),
  };
};

/**
 * Get HTTP status code with default message
 */
export const getStatusMessage = (statusCode: number): string => {
  const messages: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    503: "Service Unavailable",
  };

  return messages[statusCode] || "Internal Server Error";
};

/**
 * Common error factory functions
 */

export const Errors = {
  BadRequest: (message: string) => new AppError(message, 400),
  Unauthorized: (message: string = "Unauthorized") =>
    new AppError(message, 401),
  Forbidden: (message: string = "Forbidden") => new AppError(message, 403),
  NotFound: (message: string = "Not Found") => new AppError(message, 404),
  Conflict: (message: string = "Conflict") => new AppError(message, 409),
  UnprocessableEntity: (message: string = "Unprocessable Entity") =>
    new AppError(message, 422),
  InternalServer: (message: string = "Internal Server Error") =>
    new AppError(message, 500),
};
