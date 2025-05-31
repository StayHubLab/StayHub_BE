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

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const emailRoutes = require('./routes/email.routes');
const { auth } = require('./middlewares/auth.middleware');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middlewares
app.use(helmet());
app.use(limiter); // Apply rate limiting to all routes
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/email', emailRoutes);

// Error handling
app.use((err, req, res, _next) => {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    const PORT = process.env.PORT || 3000;
    app
      .listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
      })
      .on('error', (error) => {
        logger.error('Server failed to start:', { error: error.message, stack: error.stack });
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
