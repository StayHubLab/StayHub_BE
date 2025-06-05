/**
 * @fileoverview Error Middleware - Handles error responses for the application
 * @created 2025-05-29
 * @file error.middleware.ts
 * @description This file defines the error middleware for the application.
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Custom error types
interface CustomError extends Error {
  statusCode: number;
  errors?: Record<string, any>;
  code?: string;
}

class ValidationError extends Error implements CustomError {
  statusCode: number;
  errors?: Record<string, any>;

  constructor(message: string) {
    super(message);
    this.statusCode = 400;
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends Error implements CustomError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 401;
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends Error implements CustomError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 403;
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends Error implements CustomError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

interface ErrorResponse {
  success: boolean;
  message: string;
  error: string;
  stack?: string;
  errors?: Record<string, any>;
}

const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  // Log error with additional context
  logger.error({
    message: err.message || err.error?.message || 'Unknown error',
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
    errorType: err.name || err.code || 'Error',
  });

  // Handle plain error objects with code and message
  if (err.code && typeof err.code === 'string') {
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      message,
      error: err.code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle CustomError instances
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    error: err.name || 'Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Add validation errors if present
  if (err.name === 'ValidationError' && err.errors) {
    errorResponse.errors = err.errors;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

export { errorHandler, ValidationError, AuthenticationError, AuthorizationError, NotFoundError };
