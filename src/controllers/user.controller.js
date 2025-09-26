/**
 * @fileoverview User Controller - Handles user profile management
 * @created 2025-05-29
 * @file user.controller.js
 * @description This file defines the controller for user profile management.
 */

const User = require('../models/user.model');
const createError = require('http-errors');

// Helper function for consistent response format
const sendResponse = (res, data, message = 'Success') => {
  res.json({
    success: true,
    message,
    data,
  });
};

// Get all users (optionally filter by role)
exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const users = await User.find(filter).select('-password');
    sendResponse(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Search users by email/name (realtime support)
exports.searchUsers = async (req, res, next) => {
  try {
    const { q, email, name, limit = 10 } = req.query;
    const normalized = (email || q || '').trim();
    const nameQuery = (name || q || '').trim();

    const filters = [];
    if (normalized) filters.push({ email: { $regex: normalized, $options: 'i' } });
    if (nameQuery) filters.push({ name: { $regex: nameQuery, $options: 'i' } });

    const mongoFilter = filters.length > 0 ? { $or: filters } : {};

    const users = await User.find(mongoFilter)
      .limit(Math.max(1, Math.min(parseInt(limit, 10) || 10, 50)))
      .select('-password');

    sendResponse(res, users, 'Users search results');
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
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
exports.updateUser = async (req, res, next) => {
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
exports.deleteUser = async (req, res, next) => {
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
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      throw createError(404, 'User not found');
    }
    sendResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    delete updateData.password;

    // Handle avatar upload from Cloudinary
    if (req.cloudinaryResult) {
      // Get current user to delete old avatar
      const currentUser = await User.findById(req.user._id);

      // Delete old avatar if exists
      if (currentUser && currentUser.avatar && currentUser.avatar.public_id) {
        try {
          const CloudinaryService = require('../services/cloudinary.service');
          await CloudinaryService.deleteImage(currentUser.avatar.public_id);
        } catch (error) {
          // Log error but don't fail the update
          const logger = require('../utils/logger');
          logger.error('Failed to delete old avatar:', error);
        }
      }

      updateData.avatar = {
        url: req.cloudinaryResult.secure_url,
        public_id: req.cloudinaryResult.public_id,
        width: req.cloudinaryResult.width,
        height: req.cloudinaryResult.height,
        format: req.cloudinaryResult.format,
        size: req.cloudinaryResult.size,
        uploadedAt: new Date(),
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
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
