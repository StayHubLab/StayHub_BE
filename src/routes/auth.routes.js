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
// Temporary diagnostic: log which controller exports are undefined to debug "Route.put() requires a callback" crash
if (process.env.DEBUG_AUTH_ROUTES === 'true') {
  const requiredHandlers = [
    'sendVerificationCode',
    'register',
    'login',
    'verifyEmail',
    'resendVerificationEmail',
    'forgotPassword',
    'resetPassword',
    'refreshToken',
    'sendVerificationEmail',
    'logout',
    'getProfile',
    'updateProfile',
    'changePassword',
    'revokeToken',
  ];
  const missing = requiredHandlers.filter((h) => typeof authController[h] !== 'function');
  // eslint-disable-next-line no-console
  console.log('[DEBUG_AUTH_ROUTES] Missing handlers:', missing);
}
const { auth } = require('../middlewares/auth.middleware');

// Public routes
router.post(
  '/send-verification-code',
  authController.sendVerificationCode ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: sendVerificationCode' }))
);
router.post(
  '/register',
  authController.register ||
    ((req, res) => res.status(500).json({ success: false, message: 'Handler missing: register' }))
);
router.post(
  '/login',
  authController.login ||
    ((req, res) => res.status(500).json({ success: false, message: 'Handler missing: login' }))
);
router.post(
  '/google-login',
  authController.googleLogin ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: googleLogin' }))
);
router.get(
  '/verify-email/:token',
  authController.verifyEmail ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: verifyEmail' }))
);
router.post(
  '/resend-verification-email',
  authController.resendVerificationEmail ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: resendVerificationEmail' }))
);
router.post(
  '/forgot-password',
  authController.forgotPassword ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: forgotPassword' }))
);
router.post(
  '/reset-password',
  authController.resetPassword ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: resetPassword' }))
);
router.post(
  '/refresh-token',
  authController.refreshToken ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: refreshToken' }))
);

// Protected routes
router.post(
  '/send-verification-email',
  auth,
  authController.sendVerificationEmail ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: sendVerificationEmail' }))
);
router.post(
  '/logout',
  auth,
  authController.logout ||
    ((req, res) => res.status(500).json({ success: false, message: 'Handler missing: logout' }))
);
router.get(
  '/profile',
  auth,
  authController.getProfile ||
    ((req, res) => res.status(500).json({ success: false, message: 'Handler missing: getProfile' }))
);
router.put(
  '/profile',
  auth,
  authController.updateProfile ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: updateProfile' }))
);
router.post(
  '/change-password',
  auth,
  authController.changePassword ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: changePassword' }))
);
router.post(
  '/revoke-token',
  auth,
  authController.revokeToken ||
    ((req, res) =>
      res.status(500).json({ success: false, message: 'Handler missing: revokeToken' }))
);

module.exports = router;
