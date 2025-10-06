/**
 * @fileoverview Authentication Service - Handles user authentication and authorization
 * @created 2025-05-29
 * @file auth.service.js
 * @description This service provides methods for user registration, login, profile management,
 * and email verification. It handles password hashing, JWT token generation, and user data validation.
 */

const User = require('../models/user.model');
const TokenBlacklist = require('../models/token-blacklist.model');
const VerificationCode = require('../models/verification-code.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validateEmail, validatePhone } = require('../validations/validation');
const EmailService = require('./email.service');
const logger = require('../utils/logger');

/**
 * @class AuthService
 * @classdesc Service class for handling authentication operations
 */
class AuthService {
  /**
   * @route POST /api/auth/register
   * @description Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email address
   * @param {string} userData.phone - User's phone number
   * @param {string} userData.password - User's password
   * @param {Object} userData.address - User's address information
   * @param {string} userData.address.street - Street address
   * @param {string} userData.address.ward - Ward/Commune
   * @param {string} userData.address.district - District
   * @param {string} userData.address.city - City
   * @returns {Object} User data with tokens
   * @throws {Error} If required fields are missing or invalid
   */
  static async register(userData) {
    try {
      logger.info('Starting registration process:', { email: userData.email });

      const { name, email, phone, password, address, role, verificationCode } = userData;

      if (!name || !email || !phone || !password || !role || !verificationCode) {
        logger.error('Missing required fields:', {
          name: !!name,
          email: !!email,
          phone: !!phone,
          password: !!password,
          role: !!role,
          verificationCode: !!verificationCode,
        });
        throw new Error(
          'Missing required fields: name, email, phone, password, role, verificationCode'
        );
      }

      if (!address || !address.street || !address.ward || !address.district || !address.city) {
        logger.error('Missing required address fields:', {
          street: !!address?.street,
          ward: !!address?.ward,
          district: !!address?.district,
          city: !!address?.city,
        });
        throw new Error('Missing required address fields: street, ward, district, city');
      }

      // Validate role
      if (!['landlord', 'tenant'].includes(role)) {
        throw new Error('Invalid role. Must be landlord or tenant');
      }

      // Verify verification code
      const isValidCode = await this.verifyCode(email, verificationCode);
      if (!isValidCode) {
        throw new Error('Invalid or expired verification code');
      }

      logger.info('Validating email and phone');
      if (!validateEmail(email)) {
        logger.error('Invalid email format:', { email });
        throw new Error('Invalid email format');
      }
      if (!validatePhone(phone)) {
        logger.error('Invalid phone format:', { phone });
        throw new Error('Invalid phone format');
      }

      logger.info('Checking for existing user');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.error('User already exists:', { email });
        throw new Error('User already exists');
      }

      logger.info('Hashing password');
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      logger.info('Creating new user');
      const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        address,
        role: role === 'tenant' ? 'renter' : role, // Map tenant to renter in DB
        // Set default values for optional fields
        gender: 'other',
        avatar: 'https://example.com/default-avatar.png',
        isVerified: true, // Set to true since verification code was verified
        isBanned: false,
        rating: 0,
      });

      logger.info('Saving new user');
      await newUser.save();

      logger.info('Generating tokens');
      const token = await this.generateToken(newUser._id);
      const refreshToken = this.generateRefreshToken(newUser._id);

      logger.info('Registration successful');

      return {
        user: this.formatUserResponse(newUser),
        token,
        refreshToken,
      };
    } catch (error) {
      logger.error('Registration error:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name,
      });
      throw error;
    }
  }

  /**
   * @route PUT /api/auth/profile
   * @description Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @param {Date} [updateData.dob] - Date of birth
   * @param {string} [updateData.gender] - Gender
   * @param {string[]} [updateData.preferredUtilities] - Preferred utilities
   * @param {Object} [updateData.preferredPriceRange] - Preferred price range
   * @param {string} [updateData.avatar] - Avatar URL
   * @param {string} [updateData.verificationDocument] - Verification document URL
   * @returns {Object} Updated user data
   * @throws {Error} If user not found or validation fails
   */
  static async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const allowedUpdates = [
        'dob',
        'gender',
        'preferredUtilities',
        'preferredPriceRange',
        'avatar',
        'verificationDocument',
      ];

      Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          user[key] = updateData[key];
        }
      });

      await user.save();
      return this.formatUserResponse(user);
    } catch (error) {
      logger.error('Profile update error:', {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/login
   * @description Generate JWT token
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  static async generateToken(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return jwt.sign({ userId, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  /**
   * @route POST /api/auth/refresh-token
   * @description Generate refresh token
   * @param {string} userId - User ID
   * @returns {string} Refresh token
   */
  static generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  }

  /**
   * @route GET /api/auth/me
   * @description Format user response
   * @param {Object} user - User data
   * @returns {Object} Formatted user data
   */
  static formatUserResponse(user) {
    if (!user) return null;

    // If it's a Mongoose document, convert to plain object
    const userObj = user.toObject ? user.toObject() : user;

    // Remove sensitive fields
    delete userObj.password;
    delete userObj.refreshToken;

    return userObj;
  }

  /**
   * @route POST /api/auth/login
   * @description Authenticate user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Login result
   */
  static async login(email, password) {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.isBanned) {
        throw new Error('Account has been banned');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = await this.generateToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      return {
        user: this.formatUserResponse(user),
        token,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error:', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/google-login
   * @description Login or create user using Google profile
   * @param {Object} googleData
   * @param {string} googleData.email
   * @param {string} googleData.name
   * @param {string} googleData.picture
   * @param {string} googleData.googleId
   * @param {boolean} googleData.emailVerified
   * @returns {Object} { user, token, refreshToken }
   */
  static async loginWithGoogle(googleData) {
    try {
      const { email, name, picture, googleId, emailVerified } = googleData;

      if (!email || !googleId) {
        throw new Error('Missing Google email or id');
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          name: name || email.split('@')[0],
          email,
          // Provide placeholder phone to satisfy schema (user can update later)
          phone: '0000000000',
          // Strong random-like password hash (not used for social login)
          password: bcrypt.hashSync(jwt.sign({ email, t: Date.now() }, process.env.JWT_SECRET), 10),
          // Provide non-empty address placeholders to satisfy schema
          address: { street: 'N/A', ward: 'N/A', district: 'N/A', city: 'N/A' },
          role: 'renter',
          gender: 'other',
          avatar: { url: picture || 'https://example.com/default-avatar.png' },
          isVerified: !!emailVerified,
          isBanned: false,
          rating: 0,
          googleId,
        });
        await user.save();
      } else {
        // Update minimal Google info if changed
        let changed = false;
        if (picture && user.avatar?.url !== picture) {
          user.avatar = { ...(user.avatar || {}), url: picture };
          changed = true;
        }
        if (typeof emailVerified === 'boolean' && user.isVerified !== emailVerified) {
          user.isVerified = emailVerified;
          changed = true;
        }
        if (!user.googleId && googleId) {
          user.googleId = googleId;
          changed = true;
        }
        if (changed) await user.save();
      }

      const token = await this.generateToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      return { user: this.formatUserResponse(user), token, refreshToken };
    } catch (error) {
      logger.error('Google login error:', {
        email: googleData?.email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route GET /api/auth/me
   * @description Get user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return this.formatUserResponse(user);
    } catch (error) {
      logger.error('Get profile error:', {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/verify-email
   * @description Verify user email
   * @param {string} token - Verification token
   * @returns {Object} Verification result
   */
  static async verifyEmail(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }
      user.isVerified = true;
      await user.save();
      return this.formatUserResponse(user);
    } catch (error) {
      logger.error('Email verification error:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/logout
   * @description Logout user
   * @param {string} userId - User ID
   * @param {string} token - JWT token
   * @returns {Object} Logout result
   */
  static async logout(userId, token) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Decode token to get expiration
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        throw new Error('Invalid token');
      }

      // Add token to blacklist
      await TokenBlacklist.create({
        token,
        expiresAt: new Date(decoded.exp * 1000), // Convert to milliseconds
      });

      return { success: true };
    } catch (error) {
      logger.error('Logout error:', {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/verify-token
   * @description Verify if token is blacklisted
   * @param {string} token - JWT token to verify
   * @returns {boolean} True if token is valid
   */
  static async isTokenBlacklisted(token) {
    try {
      const blacklistedToken = await TokenBlacklist.findOne({ token });
      return !!blacklistedToken;
    } catch (error) {
      logger.error('Token blacklist check error:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/send-verification-email
   * @description Send verification email
   * @param {string} email - User email
   * @returns {Object} Verification email result
   */
  static async sendVerificationEmail(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('User already verified');
      }

      const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/api/auth/verify-email/${verificationToken}`;

      await EmailService.sendTemplatedEmail(email, 'REGISTRATION', {
        name: user.name,
        verificationLink,
      });

      return { success: true };
    } catch (error) {
      logger.error('Send verification email error:', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/resend-verification-email
   * @description Resend verification email
   * @param {string} email - User email
   * @returns {Object} Verification email result
   */
  static async resendVerificationEmail(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('User already verified');
      }

      const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/api/auth/verify-email/${verificationToken}`;

      await EmailService.sendTemplatedEmail(email, 'VERIFICATION', {
        name: user.name,
        verificationLink,
      });

      return { success: true };
    } catch (error) {
      logger.error('Resend verification email error:', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/change-password
   * @description Change password
   * @param {string} email - User email
   * @returns {Object} Change password result
   */
  static async changePassword(email, newPassword) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();

      return { success: true };
    } catch (error) {
      logger.error('Change password error:', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/forgot-password
   * @description Send password reset email
   * @param {string} email - User email
   * @returns {Object} Password reset email result
   */
  static async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

      await EmailService.sendTemplatedEmail(email, 'PASSWORD_RESET', {
        name: user.name,
        resetLink,
      });

      return { success: true };
    } catch (error) {
      logger.error('Forgot password error:', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/reset-password
   * @description Reset password using token
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @returns {Object} Reset password result
   */
  static async resetPassword(token, newPassword) {
    try {
      if (!token || !newPassword) {
        throw new Error('Token and new password are required');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Validate password strength
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Reset password error:', {
        error: error.message,
        stack: error.stack,
      });
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid or expired reset token');
      }
      throw error;
    }
  }

  /**
   * Refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New access token
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = await this.generateToken(user._id);
      return { token: newAccessToken };
    } catch (error) {
      logger.error('Refresh token error:', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error('Failed to refresh token: ' + error.message);
    }
  }

  /**
   * Revoke token
   * @param {string} token - Token to revoke
   * @returns {Object} Revocation result
   */
  static async revokeToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      await TokenBlacklist.create({
        token,
        expiresAt: new Date(decoded.exp * 1000),
      });

      return { success: true };
    } catch (error) {
      logger.error('Revoke token error:', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error('Failed to revoke token: ' + error.message);
    }
  }

  /**
   * Send verification code to email before registration
   * @param {string} email - User email
   * @returns {Object} Code sending result
   */
  static async sendVerificationCode(email) {
    try {
      logger.info('Sending verification code:', { email });

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete any existing codes for this email
      await VerificationCode.deleteMany({ email });

      // Create new verification code
      const verificationCode = new VerificationCode({
        email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      await verificationCode.save();

      // Send email with verification code
      await EmailService.sendTemplatedEmail(email, 'VERIFICATION_CODE', {
        code,
        email,
      });

      logger.info('Verification code sent successfully:', { email });
      return { success: true };
    } catch (error) {
      logger.error('Send verification code error:', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Verify verification code
   * @param {string} email - User email
   * @param {string} code - Verification code
   * @returns {boolean} True if code is valid
   */
  static async verifyCode(email, code) {
    try {
      logger.info('Verifying code:', { email });

      const verificationCode = await VerificationCode.findOne({
        email,
        code,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      });

      if (!verificationCode) {
        logger.error('Invalid or expired verification code:', { email });
        return false;
      }

      // Mark code as used
      verificationCode.isUsed = true;
      await verificationCode.save();

      logger.info('Verification code verified successfully:', { email });
      return true;
    } catch (error) {
      logger.error('Verify code error:', {
        email,
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  }
}

module.exports = AuthService;
