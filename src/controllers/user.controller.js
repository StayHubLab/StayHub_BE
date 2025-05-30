/**
 * @fileoverview User Controller - Handles user profile management
 * @author TienTP
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

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    sendResponse(res, users, 'Users retrieved successfully');
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
