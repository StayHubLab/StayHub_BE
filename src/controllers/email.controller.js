/**
 * @fileoverview Email Controller - Handles email-related requests
 * @created 2025-05-31
 * @file email.controller.js
 * @description This file defines the email controller for the application.
 */

const EmailService = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * Controller for handling email-related requests
 */
class EmailController {
  /**
   * Send a templated email
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async sendTemplatedEmail(req, res) {
    try {
      const { email, templateType, templateData } = req.body;

      if (!email || !templateType) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and template type!',
        });
      }

      await EmailService.sendTemplatedEmail(email, templateType, templateData);

      return res.status(200).json({
        success: true,
        message: 'Email sent successfully.',
      });
    } catch (error) {
      logger.error('Error in sendTemplatedEmail controller:', {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Send a test email
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async sendTestEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Please provide recipient email address!',
        });
      }

      await EmailService.sendTemplatedEmail(email, 'TEST');

      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully.',
      });
    } catch (error) {
      logger.error('Error in sendTestEmail controller:', {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }
}

module.exports = EmailController;
