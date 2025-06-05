/**
 * @fileoverview Logger Utility - Handles logging for the application
 * @created 2025-05-29
 * @file logger.ts
 * @description This file defines the logger utility for the application.
 */

import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file';

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
      maxsize: 20 * 1024 * 1024, // 20MB in bytes
      maxFiles: 14,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log'),
      maxsize: 20 * 1024 * 1024,
      maxFiles: 14,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log'),
      maxsize: 20 * 1024 * 1024,
      maxFiles: 14,
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
interface Stream {
  write: (message: string) => void;
}

(logger as any).stream = {
  write: (message: string) => logger.info(message.trim()),
} as Stream;

export default logger;
