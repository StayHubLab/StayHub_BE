/**
 * @fileoverview Authentication Service - Handles user authentication and authorization
 * @author TienTP
 * @created 2025-05-29
 * @file auth.service.js
 * @description This service provides methods for user registration, login, profile management,
 * and email verification. It handles password hashing, JWT token generation, and user data validation.
 */

const User = require('../models/user.model');
const TokenBlacklist = require('../models/token-blacklist.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validateEmail, validatePhone } = require('../validations/validation');

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
    const { name, email, phone, password, address } = userData;

    if (!name || !email || !phone || !password) {
      throw new Error('Missing required fields: name, email, phone, password');
    }

    if (!address || !address.street || !address.ward || !address.district || !address.city) {
      throw new Error('Missing required address fields: street, ward, district, city');
    }

    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (!validatePhone(phone)) {
      throw new Error('Invalid phone format');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    await newUser.save();

    const token = this.generateToken(newUser._id);
    const refreshToken = this.generateRefreshToken(newUser._id);

    return {
      user: this.formatUserResponse(newUser),
      token,
      refreshToken,
    };
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
  }

  /**
   * @route POST /api/auth/login
   * @description Generate JWT token
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  static generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
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
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  /**
   * @route POST /api/auth/login
   * @description Authenticate user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Login result
   */
  static async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    return {
      user: this.formatUserResponse(user),
      token,
      refreshToken,
    };
  }

  /**
   * @route GET /api/auth/me
   * @description Get user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  static async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return this.formatUserResponse(user);
  }

  /**
   * @route POST /api/auth/verify-email
   * @description Verify user email
   * @param {string} token - Verification token
   * @returns {Object} Verification result
   */
  static async verifyEmail(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.isVerified = true;
    await user.save();
    return this.formatUserResponse(user);
  }

  /**
   * @route POST /api/auth/logout
   * @description Logout user
   * @param {string} userId - User ID
   * @param {string} token - JWT token
   * @returns {Object} Logout result
   */
  static async logout(userId, token) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    try {
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
      throw new Error('Failed to logout: ' + error.message);
    }
  }

  /**
   * @route POST /api/auth/verify-token
   * @description Verify if token is blacklisted
   * @param {string} token - JWT token to verify
   * @returns {boolean} True if token is valid
   */
  static async isTokenBlacklisted(token) {
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    return !!blacklistedToken;
  }
}

module.exports = AuthService;
