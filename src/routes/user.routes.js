/**
 * @fileoverview User Routes - Handles user profile management
 * @created 2025-05-29
 * @file user.routes.js
 * @description This file defines the routes for user profile management.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

module.exports = router;
