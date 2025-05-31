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

// Basic user routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;
