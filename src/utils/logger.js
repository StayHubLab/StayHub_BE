/**
 * @fileoverview Logger Utility - Handles logging for the application
 * @created 2025-05-29
 * @file logger.js
 * @description This file defines the logger utility for the application.
 */

const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    } ${stack ? '\n' + stack : ''}`;
  })
);

// Create rotating file transport
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', '%DATE%-error.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    fileRotateTransport,
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log'),
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log'),
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Create a stream object for Morgan
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
