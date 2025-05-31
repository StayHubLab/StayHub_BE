/**
 * @fileoverview Authentication Routes - Handles user authentication and authorization
 * @created 2025-05-29
 * @file auth.routes.js
 * @description This file defines the routes for user authentication and authorization.
 * It includes routes for user registration, login, logout, profile management, and email verification.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification-email', authController.resendVerificationEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/send-verification-email', auth, authController.sendVerificationEmail);
router.post('/logout', auth, authController.logout);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.post('/change-password', auth, authController.changePassword);
router.post('/revoke-token', auth, authController.revokeToken);

module.exports = router;
