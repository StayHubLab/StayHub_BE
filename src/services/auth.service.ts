/**
 * @fileoverview Authentication Service - Handles user authentication and authorization
 * @created 2025-05-29
 * @file auth.service.ts
 * @description This service provides methods for user registration, login, profile management,
 * and email verification. It handles password hashing, JWT token generation, and user data validation.
 */

import { Document } from 'mongoose';
import User from '../models/user.model';
import TokenBlacklist from '../models/token-blacklist.model';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validateEmail, validatePhone } from '../validations/validation';
import EmailService from './email.service';
import logger from '../utils/logger';

interface Address {
  street: string;
  ward: string;
  district: string;
  city: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: Address;
}

interface UpdateData {
  dob?: Date;
  gender?: string;
  preferredUtilities?: string[];
  preferredPriceRange?: {
    min: number;
    max: number;
  };
  avatar?: string;
  verificationDocument?: string;
}

interface UserResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address: Address;
  gender: string;
  avatar: string;
  isVerified: boolean;
  isBanned: boolean;
  rating: number;
  dob?: Date;
  preferredUtilities?: string[];
  preferredPriceRange?: {
    min: number;
    max: number;
  };
  verificationDocument?: string;
}

interface AuthResponse {
  user: UserResponse;
  token: string;
  refreshToken: string;
}

/**
 * @class AuthService
 * @classdesc Service class for handling authentication operations
 */
class AuthService {
  /**
   * @route POST /api/auth/register
   * @description Register a new user
   * @param {UserData} userData - User registration data
   * @returns {Promise<AuthResponse>} User data with tokens
   * @throws {Error} If required fields are missing or invalid
   */
  static async register(userData: UserData): Promise<AuthResponse> {
    try {
      logger.info('Starting registration process:', { email: userData.email });

      const { name, email, phone, password, address } = userData;

      if (!name || !email || !phone || !password) {
        logger.error('Missing required fields:', {
          name: !!name,
          email: !!email,
          phone: !!phone,
          password: !!password,
        });
        throw new Error('Missing required fields: name, email, phone, password');
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
        role: 'renter',
        // Set default values for optional fields
        gender: 'other',
        avatar: 'https://example.com/default-avatar.png',
        isVerified: false,
        isBanned: false,
        rating: 0,
      });

      logger.info('Saving new user');
      await newUser.save();

      logger.info('Generating tokens');
      const token = this.generateToken(newUser._id);
      const refreshToken = this.generateRefreshToken(newUser._id);

      logger.info('Registration successful');
      const verificationToken = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '1h',
        }
      );
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/api/auth/verify-email/${verificationToken}`;

      await EmailService.sendTemplatedEmail(email, 'REGISTRATION', {
        name: newUser.name,
        verificationLink,
      });

      return {
        user: this.formatUserResponse(newUser),
        token,
        refreshToken,
      };
    } catch (error) {
      const err = error as Error;
      logger.error('Registration error:', {
        error: err.message,
        stack: err.stack,
        code: (err as any).code,
        name: err.name,
      });
      throw error;
    }
  }

  /**
   * @route PUT /api/auth/profile
   * @description Update user profile
   * @param {string} userId - User ID
   * @param {UpdateData} updateData - Update data
   * @returns {Promise<UserResponse>} Updated user data
   * @throws {Error} If user not found or validation fails
   */
  static async updateProfile(userId: string, updateData: UpdateData): Promise<UserResponse> {
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
          (user as any)[key] = updateData[key as keyof UpdateData];
        }
      });

      await user.save();
      return this.formatUserResponse(user);
    } catch (error) {
      const err = error as Error;
      logger.error('Profile update error:', {
        userId,
        error: err.message,
        stack: err.stack,
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
  static generateToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, options);
  }

  /**
   * @route POST /api/auth/refresh-token
   * @description Generate refresh token
   * @param {string} userId - User ID
   * @returns {string} Refresh token
   */
  static generateRefreshToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, options);
  }

  /**
   * @description Format user response
   * @param {Document} user - User document
   * @returns {UserResponse} Formatted user data
   */
  static formatUserResponse(user: Document): UserResponse {
    const userObj = user.toObject();
    delete userObj.password;
    return userObj as UserResponse;
  }

  /**
   * @route POST /api/auth/login
   * @description Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<AuthResponse>} User data with tokens
   * @throws {Error} If credentials are invalid
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', status: 401 };
      }

      if (!user.password) {
        logger.error('User found but password is undefined:', { email });
        throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', status: 401 };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', status: 401 };
      }

      const token = this.generateToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      return {
        user: this.formatUserResponse(user),
        token,
        refreshToken,
      };
    } catch (error) {
      const err = error as Error;
      logger.error('Login error:', {
        email,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @route GET /api/auth/profile
   * @description Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<UserResponse>} User profile data
   * @throws {Error} If user not found
   */
  static async getUserProfile(userId: string): Promise<UserResponse> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return this.formatUserResponse(user);
    } catch (error) {
      const err = error as Error;
      logger.error('Get profile error:', {
        userId,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/verify-email
   * @description Verify user email
   * @param {string} token - Verification token
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If token is invalid or expired
   */
  static async verifyEmail(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.isVerified = true;
      await user.save();
      return true;
    } catch (error) {
      const err = error as Error;
      logger.error('Email verification error:', {
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/logout
   * @description Logout user
   * @param {string} userId - User ID
   * @param {string} token - JWT token
   * @returns {Promise<boolean>} Success status
   */
  static async logout(userId: string, token: string): Promise<boolean> {
    try {
      await this.revokeToken(token);
      return true;
    } catch (error) {
      const err = error as Error;
      logger.error('Logout error:', {
        userId,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @description Check if token is blacklisted
   * @param {string} token - JWT token
   * @returns {Promise<boolean>} True if token is blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistedToken = await TokenBlacklist.findOne({ token });
      return !!blacklistedToken;
    } catch (error) {
      const err = error as Error;
      logger.error('Token blacklist check error:', {
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/send-verification
   * @description Send verification email
   * @param {string} email - User email
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If user not found or already verified
   */
  static async sendVerificationEmail(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('Email already verified');
      }

      const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/api/auth/verify-email/${verificationToken}`;

      await EmailService.sendTemplatedEmail(email, 'VERIFICATION', {
        name: user.name,
        verificationLink,
      });

      return true;
    } catch (error) {
      const err = error as Error;
      logger.error('Send verification email error:', {
        email,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/resend-verification
   * @description Resend verification email
   * @param {string} email - User email
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If user not found or already verified
   */
  static async resendVerificationEmail(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('Email already verified');
      }

      return this.sendVerificationEmail(email);
    } catch (error) {
      const err = error as Error;
      logger.error('Resend verification email error:', {
        email,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/change-password
   * @description Change user password
   * @param {string} email - User email
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If user not found or validation fails
   */
  static async changePassword(email: string, newPassword: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();

      return true;
    } catch (error) {
      const err = error as Error;
      logger.error('Change password error:', {
        email,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/forgot-password
   * @description Send password reset email
   * @param {string} email - User email
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If user not found
   */
  static async forgotPassword(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/api/auth/reset-password/${resetToken}`;

      await EmailService.sendTemplatedEmail(email, 'PASSWORD_RESET', {
        name: user.name,
        resetLink,
      });

      return true;
    } catch (error) {
      const err = error as Error;
      logger.error('Forgot password error:', {
        email,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/reset-password
   * @description Reset user password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If token is invalid or expired
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();

      return true;
    } catch (error) {
      const err = error as Error;
      logger.error('Reset password error:', {
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/auth/refresh-token
   * @description Refresh JWT token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{ token: string; refreshToken: string }>} New tokens
   * @throws {Error} If refresh token is invalid or expired
   */
  static async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
        userId: string;
      };
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const token = this.generateToken(user._id);
      const newRefreshToken = this.generateRefreshToken(user._id);

      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      const err = error as Error;
      logger.error('Refresh token error:', {
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * @description Revoke JWT token
   * @param {string} token - JWT token
   * @returns {Promise<boolean>} Success status
   */
  static async revokeToken(token: string): Promise<boolean> {
    try {
      const blacklistedToken = new TokenBlacklist({ token });
      await blacklistedToken.save();
      return true;
    } catch (error) {
      const err = error as Error;
      logger.error('Revoke token error:', {
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }
}

export default AuthService;
