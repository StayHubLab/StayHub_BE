/**
 * @fileoverview Email Routes - Handles email routes
 * @created 2025-05-31
 * @file email.routes.js
 * @description This file defines the email routes for the application.
 */

import express from 'express';
import { EmailController } from '../controllers/email.controller';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/send', auth, EmailController.sendTemplatedEmail);
router.post('/test', EmailController.sendTestEmail);

export default router;
