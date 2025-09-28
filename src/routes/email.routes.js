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

router.post('/send', auth, EmailController.sendTemplatedEmail);
router.post('/test', EmailController.sendTestEmail);

module.exports = router;
