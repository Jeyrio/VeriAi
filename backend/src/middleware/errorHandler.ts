import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  details?: any;
}

export class ApiError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message, code = 'INTERNAL_ERROR', details } = err;

  // Log error
  logger.error('API Error:', {
    message: err.message,
    statusCode,
    code,
    details,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
    details = undefined;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Common error creators
export const createError = {
  badRequest: (message: string, details?: any) => 
    new ApiError(message, 400, 'BAD_REQUEST', details),
  
  unauthorized: (message: string = 'Unauthorized', details?: any) => 
    new ApiError(message, 401, 'UNAUTHORIZED', details),
  
  forbidden: (message: string = 'Forbidden', details?: any) => 
    new ApiError(message, 403, 'FORBIDDEN', details),
  
  notFound: (message: string = 'Resource not found', details?: any) => 
    new ApiError(message, 404, 'NOT_FOUND', details),
  
  conflict: (message: string, details?: any) => 
    new ApiError(message, 409, 'CONFLICT', details),
  
  internal: (message: string = 'Internal server error', details?: any) => 
    new ApiError(message, 500, 'INTERNAL_ERROR', details),
  
  validation: (message: string, details?: any) => 
    new ApiError(message, 422, 'VALIDATION_ERROR', details),
  
  rateLimit: (message: string = 'Rate limit exceeded', details?: any) => 
    new ApiError(message, 429, 'RATE_LIMIT_EXCEEDED', details),
};
