/**
 * @fileoverview Authentication Middleware - Handles user authentication
 * @created 2025-05-29
 * @file auth.middleware.js
 * @description This file defines the authentication middleware for the application.
 */

const jwt = require('jsonwebtoken');
const AuthService = require('../services/auth.service');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
      throw { code: 'UNAUTHORIZED', message: 'No token provided' };
    }

    // Check if token is blacklisted
    const isBlacklisted = await AuthService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw { code: 'UNAUTHORIZED', message: 'Token has been revoked' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    next(error);
  }
};

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

module.exports = {
  auth,
  roleMiddleware,
};
