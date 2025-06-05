/**
 * @fileoverview Email Templates - Contains all email templates used in the application
 * @created 2025-05-31
 * @file email.templates.js
 * @description This file defines all email templates used in the application.
 */

interface EmailTemplate {
  subject: string;
  getContent: (data: Record<string, any>) => string;
}

const emailTemplates: Record<string, EmailTemplate> = {
  /**
   * Test email template
   */
  TEST: {
    subject: 'Test Email from StayHub',
    getContent: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Welcome to StayHub!</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #34495e; margin: 0;">This is a test email sent from StayHub application.</p>
          <p style="color: #34495e; margin: 10px 0 0 0;">If you received this email, it means our email service is working correctly.</p>
        </div>
        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p style="margin: 0;">Best regards,<br>StayHub Team</p>
        </div>
      </div>
    `,
  },

  /**
   * Welcome email template
   */
  WELCOME: {
    subject: 'Welcome to StayHub!',
    getContent: (userName) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Welcome to StayHub, ${userName}!</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #34495e; margin: 0;">Thank you for joining our community. We're excited to have you on board!</p>
          <p style="color: #34495e; margin: 15px 0 0 0;">With StayHub, you can:</p>
          <ul style="color: #34495e; margin: 10px 0; padding-left: 20px;">
            <li>Find the perfect accommodation for your stay</li>
            <li>Book rooms with ease</li>
            <li>Manage your bookings efficiently</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
        </div>
        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p style="margin: 0;">If you have any questions, feel free to contact our support team.</p>
          <p style="margin: 10px 0 0 0;">Best regards,<br>StayHub Team</p>
        </div>
      </div>
    `,
  },

  /**
   * Verification email template
   */
  REGISTRATION: {
    subject: 'Registration Confirmation - StayHub',
    getContent: ({ verificationLink, name }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Verify Your Email Address</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #34495e; margin: 0;">Dear ${name},</p>
          <p style="color: #34495e; margin: 15px 0 0 0;">Thank you for signing up with StayHub. To complete your registration and access all features, please verify your email address by clicking the button below:</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
        </div>
        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p style="margin: 0;">If you didn't request this, please ignore this email.</p>
          <p style="margin: 10px 0 0 0;">This verification link will expire in 1 hour.</p>
          <p style="margin: 10px 0 0 0;">Best regards,<br>StayHub Team</p>
        </div>
      </div>
    `,
  },

  /**
   * Verification email template
   */
  VERIFICATION: {
    subject: 'Verify Your Email Address - StayHub',
    getContent: ({ verificationLink, name }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Verify Your Email Address</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #34495e; margin: 0;">Dear ${name},</p>
          <p style="color: #34495e; margin: 15px 0 0 0;">Thank you for signing up with StayHub. To complete your registration and access all features, please verify your email address by clicking the button below:</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
        </div>
        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p style="margin: 0;">If you didn't request this, please ignore this email.</p>
          <p style="margin: 10px 0 0 0;">This verification link will expire in 1 hour.</p>
          <p style="margin: 10px 0 0 0;">Best regards,<br>StayHub Team</p>
        </div>
      </div>
    `,
  },

  /**
   * Password reset email template
   */
  PASSWORD_RESET: {
    subject: 'Password Reset Request - StayHub',
    getContent: ({ resetLink, name }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #34495e; margin: 0;">Dear ${name},</p>
          <p style="color: #34495e; margin: 15px 0 0 0;">We received a request to reset your password.</p>
          <p style="color: #34495e; margin: 15px 0 0 0;">Click the button below to reset your password:</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p style="margin: 0;">If you didn't request this, please ignore this email.</p>
          <p style="margin: 10px 0 0 0;">This link will expire in 1 hour.</p>
          <p style="margin: 10px 0 0 0;">Best regards,<br>StayHub Team</p>
        </div>
      </div>
    `,
  },
};

export default emailTemplates;
