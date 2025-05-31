/**
 * @fileoverview Email Routes - Handles email routes
 * @created 2025-05-31
 * @file email.routes.js
 * @description This file defines the email routes for the application.
 */

const express = require('express');
const EmailController = require('../controllers/email.controller');
const { auth } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route POST /api/email/send
 * @desc Send an email
 * @access Private
 */
router.post('/send', auth, EmailController.sendTemplatedEmail);

/**
 * @route POST /api/email/test
 * @desc Test sending an email
 * @access Public
 */
router.post('/test', EmailController.sendTestEmail);

module.exports = router;
