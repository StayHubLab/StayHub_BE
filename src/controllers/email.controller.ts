/**
 * @fileoverview Email Controller - Handles email-related requests
 * @created 2025-05-31
 * @file email.controller.ts
 * @description This file defines the email controller for the application.
 */

import { Request, Response } from 'express';
import EmailService from '../services/email.service';
import logger from '../utils/logger';

interface EmailRequest {
  email: string;
  templateType?: string;
  templateData?: Record<string, any>;
}

/**
 * Controller for handling email-related requests
 */
export class EmailController {
  /**
   * Send a templated email
   * @param req - Request object
   * @param res - Response object
   */
  static async sendTemplatedEmail(
    req: Request<Record<string, never>, Record<string, never>, EmailRequest>,
    res: Response
  ): Promise<void> {
    try {
      const { email, templateType, templateData } = req.body;

      if (!email || !templateType) {
        res.status(400).json({
          success: false,
          message: 'Please provide email and template type!',
        });
        return;
      }

      await EmailService.sendTemplatedEmail(email, templateType, templateData);

      res.status(200).json({
        success: true,
        message: 'Email sent successfully.',
      });
    } catch (error) {
      logger.error('Error in sendTemplatedEmail controller:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Send a test email
   * @param req - Request object
   * @param res - Response object
   */
  static async sendTestEmail(
    req: Request<Record<string, never>, Record<string, never>, { email: string }>,
    res: Response
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Please provide recipient email address!',
        });
        return;
      }

      await EmailService.sendTemplatedEmail(email, 'TEST');

      res.status(200).json({
        success: true,
        message: 'Test email sent successfully.',
      });
    } catch (error) {
      logger.error('Error in sendTestEmail controller:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}

export default EmailController;
