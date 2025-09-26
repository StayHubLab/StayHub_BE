/**
 * @fileoverview User Routes - Handles user profile management
 * @created 2025-05-29
 * @file user.routes.js
 * @description This file defines the routes for user profile management.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth } = require('../middlewares/auth.middleware');
const { uploadSingleImage, handleUploadError } = require('../middlewares/cloudinary.middleware');

// Basic user routes
router.get('/profile', auth, userController.getProfile);
router.put(
  '/profile',
  auth,
  uploadSingleImage('avatar', 'stayhub/users'),
  userController.updateProfile
);

// Realtime search users by email/name
router.get('/search', auth, userController.searchUsers);

// Error handling middleware
router.use(handleUploadError);

module.exports = router;
