/**
 * @fileoverview Error Middleware - Handles error responses for the application
 * @created 2025-05-29
 * @file error.middleware.js
 * @description This file defines the error middleware for the application.
 */

const errorHandler = (err, req, res, _next) => {
  // Log error for debugging
  console.error(err.stack);

  // Determine status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  });
};

module.exports = errorHandler;
