/**
 * @fileoverview Email Configuration - Handles email configuration
 * @created 2025-05-31
 * @file email.config.js
 * @description This file defines the email configuration for the application.
 */

const emailConfig = {
  googleMailerClientId: process.env.GOOGLE_MAILER_CLIENT_ID,
  googleMailerClientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
  googleMailerRefreshToken: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
  adminEmailAddress: process.env.ADMIN_EMAIL_ADDRESS,
};

module.exports = { emailConfig };
