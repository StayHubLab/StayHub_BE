/**
 * @fileoverview Database Configuration - Handles database connection
 * @created 2025-05-29
 * @file database.js
 * @description This file defines the database configuration for the application.
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    logger.info('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('MongoDB connection error:', {
      error: error.message,
      stack: error.stack,
      uri: process.env.MONGODB_URI ? 'URI is set' : 'URI is not set',
    });
    throw error;
  }
};

module.exports = connectDB;
