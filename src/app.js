/**
 * @fileoverview Main Application File - Initializes the Express application and sets up middleware
 * @created 2025-05-29
 * @file app.js
 * @description This file is the entry point for the application. It sets up the Express application,
 * connects to the database, and starts the server.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const emailRoutes = require('./routes/email.routes');
const landlordRoutes = require('./routes/landlord.routes');
const renterRoutes = require('./routes/renter.routes');
const adminRoutes = require('./routes/admin.routes');
const buildingRoutes = require('./routes/building.routes');
const roomRoutes = require('./routes/room.routes');

// Import middleware
const { auth } = require('./middlewares/auth.middleware');

const app = express();

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

// Body parsing middleware with optimized settings
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
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

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    query: req.query,
    params: req.params,
    body: req.body,
  });
  next();
});

// Health check endpoint with detailed status
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API Routes - Order matters!
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/email', auth, emailRoutes);
app.use('/api/landlord', auth, landlordRoutes);
app.use('/api/renter', auth, renterRoutes);
app.use('/api/admin', auth, adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server function with improved error handling
const startServer = async () => {
  try {
    logger.info('Starting server initialization...');
    logger.info('Environment variables check:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI ? 'URI is set' : 'URI is not set',
      CORS_ORIGIN: process.env.CORS_ORIGIN,
    });

    await connectDB();
    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
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

    server.on('error', (error) => {
      logger.error('Server failed to start:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
      });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Application startup failed:', {
      error: error.message,
      stack: error.stack,
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

module.exports = app;
