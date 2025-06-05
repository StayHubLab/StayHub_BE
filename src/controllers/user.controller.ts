/**
 * @fileoverview User Controller - Handles user profile management
 * @created 2025-05-29
 * @file user.controller.js
 * @description This file defines the controller for user profile management.
 */

import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import createError from 'http-errors';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: 'renter' | 'landlord' | 'technician' | 'admin';
    email: string;
  };
}

// Helper function for consistent response format
const sendResponse = (res: Response, data: any, message = 'Success'): Response => {
  return res.json({
    success: true,
    message,
    data,
  });
};

// Get all users
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    sendResponse(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      throw createError(404, 'User not found');
    }
    sendResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updateData = { ...req.body };
    delete updateData.password;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw createError(404, 'User not found');
    }

    sendResponse(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw createError(404, 'User not found');
    }
    sendResponse(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get user profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      throw createError(404, 'User not found');
    }
    sendResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updateData = { ...req.body };
    delete updateData.password;

    const user = await User.findByIdAndUpdate(req.user?._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw createError(404, 'User not found');
    }

    sendResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
