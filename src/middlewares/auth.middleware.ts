/**
 * @fileoverview Authentication Middleware - Handles user authentication
 * @created 2025-05-29
 * @file auth.middleware.ts
 * @description This file defines the authentication middleware for the application.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service';

interface JwtPayload {
  userId: string;
  role: 'renter' | 'landlord' | 'technician' | 'admin';
  email: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: 'renter' | 'landlord' | 'technician' | 'admin';
    email: string;
  };
}

const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = {
      _id: decoded.userId,
      role: decoded.role as 'renter' | 'landlord' | 'technician' | 'admin',
      email: decoded.email,
    };
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
        return;
      }
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Token expired',
        });
        return;
      }
    }
    next(error);
  }
};

const roleMiddleware = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
      return;
    }
    next();
  };
};

export { auth, roleMiddleware };
