/**
 * @fileoverview Main Application File - Initializes the Express application and sets up middleware
 * @created 2025-05-29
 * @file app.ts
 * @description This file is the entry point for the application. It sets up the Express application,
 * connects to the database, and starts the server.
 */

import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'http';
import connectDB from './config/database';
import logger from './utils/logger';
import { errorHandler } from './middlewares/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import emailRoutes from './routes/email.routes';
import landlordRoutes from './routes/landlord.routes';
import renterRoutes from './routes/renter.routes';
import adminRoutes from './routes/admin.routes';
import buildingRoutes from './routes/building.routes';

// Import middleware
import { auth } from './middlewares/auth.middleware';

const app: Express = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['self'],
        scriptSrc: ['self', 'unsafe-inline'],
        styleSrc: ['self', 'unsafe-inline'],
        imgSrc: ['self', 'data:', 'https:'],
        connectSrc: ['self'],
      },
    },
  })
);

// Rate limiting with optimized settings
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// Extend Express Request interface to include rawBody
declare module 'express' {
  interface Request {
    rawBody?: Buffer;
  }
}

// Body parsing middleware with optimized settings
app.use(
  express.json({
    limit: '10mb',
    verify: (req: Request, res: Response, buf: Buffer) => {
      req.rawBody = buf;
    },
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 10000,
  })
);

// Health check endpoint with detailed status
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/email', auth, emailRoutes);
app.use('/api/landlord', auth, landlordRoutes);
app.use('/api/renter', auth, renterRoutes);
app.use('/api/admin', auth, adminRoutes);
app.use('/api/buildings', buildingRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server function with improved error handling
const startServer = async (): Promise<void> => {
  try {
    console.log('Starting server initialization...');
    console.log('Environment variables check:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI ? 'URI is set' : 'URI is not set',
      CORS_ORIGIN: process.env.CORS_ORIGIN,
    });

    await connectDB();
    const PORT = process.env.PORT || 3000;

    const server: Server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    server.on('error', (error: Error) => {
      logger.error('Server failed to start:', {
        error: error.message,
        stack: error.stack,
        code: (error as NodeJS.ErrnoException).code,
      });
      process.exit(1);
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Application startup failed:', {
      error: err.message,
      stack: err.stack,
      env: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        mongoUri: process.env.MONGODB_URI ? 'URI is set' : 'URI is not set',
      },
    });
    process.exit(1);
  }
};

// Start the application
startServer();

export default app;
