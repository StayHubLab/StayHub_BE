/**
 * @fileoverview Database Configuration - Handles database connection
 * @created 2025-05-29
 * @file database.ts
 * @description This file defines the database configuration for the application.
 */

import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (): Promise<typeof mongoose> => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    logger.info('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const err = error as Error;
    logger.error('MongoDB connection error:', {
      error: err.message,
      stack: err.stack,
      uri: process.env.MONGODB_URI ? 'URI is set' : 'URI is not set',
    });
    throw error;
  }
};

export default connectDB;
