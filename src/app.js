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
const { verifyConfig } = require('./config/cloudinary');
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
const contactRequestRoutes = require('./routes/contact-request.routes');
const bookingRoutes = require('./routes/booking.routes');
const contractRoutes = require('./routes/contract.routes');
const billRoutes = require('./routes/bill.routes');
const paymentRoutes = require('./routes/payment.routes');
const viewingRoutes = require('./routes/viewing.routes');
const savedRoomRoutes = require('./routes/saved-room.routes');
const chatRoutes = require('./routes/chat.routes');
const reviewRoutes = require('./routes/review.routes');
// Import middleware
const { auth } = require('./middlewares/auth.middleware');

const app = express();

// Security middleware
// Helmet (CSP: must use quoted keywords like '\'self\'')
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
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, _res) => {
    // Skip rate limiting in development for localhost
    if (
      process.env.NODE_ENV !== 'production' &&
      (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('localhost'))
    ) {
      return true;
    }
    return false;
  },
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
app.use('/api/contact-requests', contactRequestRoutes);
app.use('/api/viewings', viewingRoutes);
app.use('/api/saved-rooms', savedRoomRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', auth, emailRoutes);
app.use('/api/landlord', auth, landlordRoutes);
app.use('/api/renter', auth, renterRoutes);
app.use('/api/admin', auth, adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);

// DEBUG: list all registered routes (temp) -----------------
if (process.env.LIST_ROUTES === 'true') {
  const listRoutes = () => {
    const table = [];
    const pushRoute = (method, path) => table.push({ method, path });
    app._router.stack.forEach((layer) => {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods);
        methods.forEach((m) => pushRoute(m.toUpperCase(), layer.route.path));
      } else if (layer.name === 'router' && layer.handle.stack) {
        const base =
          layer.regexp &&
          layer.regexp.source
            .replace('^\\', '/')
            .replace('\\/?(?=\\/|$)', '')
            .replace('(?=\\/|$)', '')
            .replace('^', '')
            .replace('$', '');
        layer.handle.stack.forEach((r) => {
          if (r.route && r.route.path) {
            const methods = Object.keys(r.route.methods);
            methods.forEach((m) => pushRoute(m.toUpperCase(), `${base}${r.route.path}`));
          }
        });
      }
    });
    if (process.env.LIST_ROUTES_TABLE === 'true') {
      // optional table dump
      // eslint-disable-next-line no-console
      console.table(table);
    }
  };
  listRoutes();
}
// ---------------------------------------------------------

// Add explicit 404 fallback before error handler if missing
app.use((req, res, next) => {
  if (res.headersSent) return next();
  return res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    method: req.method,
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server function with improved error handling
// Global crash diagnostics (keep lightweight)
process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('[UNHANDLED_REJECTION]', err);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('[UNCAUGHT_EXCEPTION]', err);
});

const startServer = async () => {
  try {
    logger.info('Starting server initialization...');
    logger.info('Environment variables check:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI ? 'URI is set' : 'URI is not set',
      CORS_ORIGIN: process.env.CORS_ORIGIN,
    });

    // Optionally skip DB for debugging (set SKIP_DB=1)
    if (process.env.SKIP_DB === '1') {
      logger.warn('SKIP_DB=1 set -> Skipping MongoDB connection (debug mode)');
    } else {
      if (!process.env.MONGODB_URI) {
        logger.error(
          'MONGODB_URI is missing. Set it in .env or export before starting the server.'
        );
        return process.exit(1);
      }
      await connectDB();
    }
    const PORT = process.env.PORT || 5000;

  // Khởi tạo HTTP server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Tạo socket server gắn vào server HTTP
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// 👇 Gắn io vào app để controller có thể lấy bằng req.app.get('io')
app.set('io', io);

// Import file quản lý socket
const initSocket = require('./socket/socket');
initSocket(io);


    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    server.on('error', (error) => {
      logger.error('Database connection error:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
      });
      process.exit(1);
    });

    // Verify Cloudinary configuration
    verifyConfig();
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
