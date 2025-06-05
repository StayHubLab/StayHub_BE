/**
 * @fileoverview Email Service - Handles email sending functionality
 * @created 2025-05-31
 * @file email.service.ts
 * @description This file defines the email service for the application.
 */

import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import { emailConfig } from '../config/email.config';
import emailTemplates from '../templates/email.templates';
import logger from '../utils/logger';

// Initialize OAuth2Client with Client ID and Client Secret
const myOAuth2Client = new OAuth2Client(
  emailConfig.googleMailerClientId,
  emailConfig.googleMailerClientSecret
);

// Set Refresh Token in OAuth2Client Credentials
myOAuth2Client.setCredentials({
  refresh_token: emailConfig.googleMailerRefreshToken,
});

interface TemplateData {
  [key: string]: any;
}

/**
 * Service for sending emails using OAuth2 and Nodemailer
 */
class EmailService {
  /**
   * Send an email using a template
   * @param to - Recipient's email address
   * @param templateType - Type of email template to use
   * @param templateData - Data to be used in the template
   */
  static async sendTemplatedEmail(
    to: string,
    templateType: string,
    templateData: TemplateData = {}
  ): Promise<void> {
    try {
      if (!to) {
        throw new Error('Recipient email address is required');
      }

      const template = emailTemplates[templateType];
      if (!template) {
        throw new Error(`Email template '${templateType}' not found`);
      }

      const subject = template.subject;
      const content = template.getContent(templateData);

      await this.sendEmail(to, subject, content);
    } catch (error) {
      logger.error('Error sending templated email:', error);
      throw error;
    }
  }

  /**
   * Send a custom email
   * @param to - Recipient's email address
   * @param subject - Email subject
   * @param content - Email content
   */
  static async sendEmail(to: string, subject: string, content: string): Promise<void> {
    try {
      if (!to || !subject || !content) {
        throw new Error('Missing required email parameters');
      }

      // Get AccessToken from RefreshToken
      const myAccessTokenObject = await myOAuth2Client.getAccessToken();
      const myAccessToken = myAccessTokenObject?.token;

      // Create transporter
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: emailConfig.adminEmailAddress,
          clientId: emailConfig.googleMailerClientId,
          clientSecret: emailConfig.googleMailerClientSecret,
          refresh_token: emailConfig.googleMailerRefreshToken,
          accessToken: myAccessToken,
        },
      } as any);

      // Configure email
      const mailOptions = {
        from: emailConfig.adminEmailAddress,
        to,
        subject,
        html: content,
      };

      // Send email
      const info = await transport.sendMail(mailOptions);
      logger.info('Email sent:', info.messageId);
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }
}

export default EmailService;
