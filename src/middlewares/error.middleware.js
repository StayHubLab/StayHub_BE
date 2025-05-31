/**
 * @fileoverview Error Middleware - Handles error responses for the application
 * @created 2025-05-29
 * @file error.middleware.js
 * @description This file defines the error middleware for the application.
 */

const logger = require('../utils/logger');

// Custom error types
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

const errorHandler = (err, req, res, _next) => {
  // Log error with additional context
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    errorType: err.name,
  });

  // Determine status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Prepare error response
  const errorResponse = {
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

module.exports = {
  errorHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
};
