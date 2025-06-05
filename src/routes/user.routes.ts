/**
 * @fileoverview User Routes - Handles user profile management
 * @created 2025-05-29
 * @file user.routes.js
 * @description This file defines the routes for user profile management.
 */

import express from 'express';
import * as userController from '../controllers/user.controller';
import { auth } from '../middlewares/auth.middleware';
const router = express.Router();

// Basic user routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

export default router;
