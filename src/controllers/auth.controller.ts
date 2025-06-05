/**
 * @fileoverview Authentication Controller - Handles HTTP requests for user authentication
 * @created 2025-05-29
 * @file auth.controller.ts
 * @description This controller manages user authentication endpoints including registration,
 * login, logout, profile management, and email verification. It handles request validation,
 * error responses, and coordinates with the AuthService for business logic.
 */

import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import logger from '../utils/logger';
import { validateEmail, validatePhone } from '../validations/validation';

interface ResponseData {
  success?: boolean;
  message: string;
  data?: any;
  status?: number;
}

interface ErrorResponse {
  code: string;
  message: string;
  stack?: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: 'renter' | 'landlord' | 'technician' | 'admin';
    email: string;
  };
}

const formatResponse = (
  res: Response,
  { success = true, message, data = null, status = 200 }: ResponseData
): Response => {
  return res.status(status).json({ success, message, ...(data && { data }) });
};

const handleError = (error: ErrorResponse, res: Response, context: string): Response => {
  logger.error(`${context} error:`, {
    error: error.message,
    stack: error.stack,
    code: error.code,
  });

  const errorMap: Record<string, { status: number; message: string; error?: string }> = {
    MISSING_FIELDS: { status: 400, message: error.message },
    INVALID_EMAIL: { status: 400, message: error.message },
    INVALID_PASSWORD: { status: 400, message: error.message },
    INVALID_TOKEN: { status: 400, message: error.message },
    INVALID_REFRESH_TOKEN: { status: 400, message: error.message },
    INVALID_PHONE: { status: 400, message: error.message },
    EMAIL_NOT_FOUND: { status: 404, message: error.message },
    TOKEN_EXPIRED: { status: 401, message: error.message },
    UNAUTHORIZED: { status: 401, message: error.message },
    INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
    USER_NOT_FOUND: { status: 404, message: error.message },
    USER_EXISTS: { status: 409, message: error.message },
    EMAIL_VERIFIED: { status: 400, message: error.message },
    RATE_LIMIT_EXCEEDED: { status: 429, message: error.message },
    DEFAULT: {
      status: 500,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    },
  };

  const errorResponse = errorMap[error.code] || errorMap.DEFAULT;

  return formatResponse(res, {
    success: false,
    message: errorResponse.message,
    ...(errorResponse.error && { error: errorResponse.error }),
    status: errorResponse.status,
  });
};

const validateToken = (req: Request): string => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  throw { code: 'INVALID_TOKEN', message: 'No token provided' };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  domain: process.env.COOKIE_DOMAIN || 'localhost',
};

/**
 * @route POST /api/auth/register
 * @category Auth Basic
 * @description Create new account
 * @param {Object} req.body - User registration data
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @returns {Object} Registration result
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, phone, name, address } = req.body;

    // Validate required fields
    if (!email || !password || !phone || !name || !address) {
      throw { code: 'MISSING_FIELDS', message: 'All fields are required' };
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw { code: 'INVALID_EMAIL', message: 'Invalid email format' };
    }

    // Validate phone format
    if (!validatePhone(phone)) {
      throw { code: 'INVALID_PHONE', message: 'Invalid phone format' };
    }

    // Validate password strength
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    ) {
      throw {
        code: 'INVALID_PASSWORD',
        message:
          'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
      };
    }

    const result = await AuthService.register(req.body);
    return formatResponse(res, {
      status: 201,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Registration');
  }
};

/**
 * @route POST /api/auth/login
 * @category Auth Basic
 * @description Login and receive JWT token
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @returns {Object} Login result with tokens
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    logger.info('Login attempt:', { email });

    // Validate required fields
    if (!email || !password) {
      logger.warn('Login failed: Missing fields', { email });
      throw { code: 'MISSING_FIELDS', message: 'Email and password are required' };
    }

    // Validate email format
    if (!validateEmail(email)) {
      logger.warn('Login failed: Invalid email format', { email });
      throw { code: 'INVALID_EMAIL', message: 'Invalid email format' };
    }

    try {
      const result = await AuthService.login(email, password);

      // Set secure cookies
      res.cookie('token', result.token, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info('Login successful:', { email });
      return formatResponse(res, {
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
          expiresIn: 15 * 60,
        },
      });
    } catch (error: any) {
      // Ensure the error has the correct structure
      if (!error.code) {
        error = {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          status: 401,
        };
      }
      throw error;
    }
  } catch (error: any) {
    logger.error('Login error:', {
      error: error.message,
      code: error.code,
      stack: error.stack,
    });
    return handleError(error as ErrorResponse, res, 'Login');
  }
};

/**
 * @route POST /api/auth/logout
 * @category Auth Basic
 * @description Logout (delete token on client or server if using refresh)
 * @param {Object} req.user - Authenticated user object
 * @returns {Object} Logout result
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user?._id) {
      throw { code: 'UNAUTHORIZED', message: 'User not authenticated' };
    }

    const token = validateToken(req);
    await AuthService.logout(req.user._id, token);

    // Clear cookies
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return formatResponse(res, { message: 'Logged out successfully' });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Logout');
  }
};

/**
 * @route GET /api/auth/me
 * @category Auth Basic
 * @description Get current account information
 * @param {Object} req.user - Authenticated user object
 * @returns {Object} User profile data
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user?._id) {
      throw { code: 'UNAUTHORIZED', message: 'User not authenticated' };
    }

    validateToken(req);
    const user = await AuthService.getUserProfile(req.user._id);
    return formatResponse(res, { message: 'Profile retrieved successfully', data: user });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Get profile');
  }
};

/**
 * @route PUT /api/auth/profile
 * @category Auth Basic
 * @description Update user profile
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.body - Profile update data
 * @returns {Object} Updated user profile
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user?._id) {
      throw { code: 'UNAUTHORIZED', message: 'User not authenticated' };
    }

    validateToken(req);

    // Validate phone if provided
    if (req.body.phone && !validatePhone(req.body.phone)) {
      throw { code: 'INVALID_PHONE', message: 'Invalid phone format' };
    }

    const updatedUser = await AuthService.updateProfile(req.user._id, req.body);
    return formatResponse(res, { message: 'Profile updated successfully', data: updatedUser });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Update profile');
  }
};

/**
 * @route POST /api/auth/verify-email
 * @category Authentication & Security
 * @description Verify account via OTP/link
 * @param {string} req.params.token - Email verification token
 * @returns {Object} Verification result
 */
export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.params.token) {
      throw { code: 'INVALID_TOKEN', message: 'Verification token is required' };
    }

    const result = await AuthService.verifyEmail(req.params.token);
    return formatResponse(res, { message: 'Email verified successfully', data: result });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Email verification');
  }
};

/**
 * @route POST /api/auth/send-verification
 * @category Authentication & Security
 * @description Send verification email
 * @param {Object} req.body - Email data
 * @param {string} req.body.email - User email
 * @returns {Object} Email sending result
 */
export const sendVerificationEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw { code: 'MISSING_FIELDS', message: 'Email is required' };
    }

    if (!validateEmail(email)) {
      throw { code: 'INVALID_EMAIL', message: 'Invalid email format' };
    }

    const result = await AuthService.sendVerificationEmail(email);
    return formatResponse(res, { message: 'Verification email sent successfully', data: result });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Send verification email');
  }
};

/**
 * @route POST /api/auth/resend-verification
 * @category Authentication & Security
 * @description Resend verification code
 * @param {Object} req.body - Email data
 * @param {string} req.body.email - User email
 * @returns {Object} Email sending result
 */
export const resendVerificationEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw { code: 'MISSING_FIELDS', message: 'Email is required' };
    }

    if (!validateEmail(email)) {
      throw { code: 'INVALID_EMAIL', message: 'Invalid email format' };
    }

    const result = await AuthService.resendVerificationEmail(email);
    return formatResponse(res, { message: 'Verification email sent successfully', data: result });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Resend verification email');
  }
};

/**
 * @route PUT /api/auth/change-password
 * @category Authentication & Security
 * @description Change password when logged in
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.body - Password data
 * @param {string} req.body.oldPassword - Current password
 * @param {string} req.body.newPassword - New password
 * @returns {Object} Password change result
 */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user?._id) {
      throw { code: 'UNAUTHORIZED', message: 'User not authenticated' };
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw { code: 'MISSING_FIELDS', message: 'Old password and new password are required' };
    }

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[!@#$%^&*]/.test(newPassword)
    ) {
      throw {
        code: 'INVALID_PASSWORD',
        message:
          'New password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
      };
    }

    validateToken(req);
    const result = await AuthService.changePassword(req.user._id, oldPassword);

    // Clear cookies after password change
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return formatResponse(res, { message: 'Password changed successfully', data: result });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Change password');
  }
};

/**
 * @route POST /api/auth/forgot-password
 * @category Forgot Password
 * @description Send password reset email
 * @param {Object} req.body - Email data
 * @param {string} req.body.email - User email
 * @returns {Object} Password reset request result
 */
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw { code: 'MISSING_FIELDS', message: 'Email is required' };
    }

    if (!validateEmail(email)) {
      throw { code: 'INVALID_EMAIL', message: 'Invalid email format' };
    }

    const result = await AuthService.forgotPassword(email);
    return formatResponse(res, { message: 'Password reset email sent successfully', data: result });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Forgot password');
  }
};

/**
 * @route POST /api/auth/reset-password
 * @category Forgot Password
 * @description Reset password with email token
 * @param {Object} req.body - Reset data
 * @param {string} req.body.token - Reset token
 * @param {string} req.body.newPassword - New password
 * @returns {Object} Password reset result
 */
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw { code: 'MISSING_FIELDS', message: 'Token and new password are required' };
    }

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[!@#$%^&*]/.test(newPassword)
    ) {
      throw {
        code: 'INVALID_PASSWORD',
        message:
          'New password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
      };
    }

    const result = await AuthService.resetPassword(token, newPassword);

    // Clear cookies after password reset
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return formatResponse(res, { message: 'Password reset successfully', data: result });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Reset password');
  }
};

/**
 * @route POST /api/auth/refresh-token
 * @category Token
 * @description Get new access token from refresh token
 * @param {Object} req.body - Token data
 * @param {string} req.body.refreshToken - Refresh token
 * @returns {Object} New access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw { code: 'MISSING_FIELDS', message: 'Refresh token is required' };
    }

    const result = await AuthService.refreshToken(refreshToken);

    // Set new cookies
    res.cookie('token', result.token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return formatResponse(res, {
      message: 'Token refreshed successfully',
      data: {
        token: result.token,
        expiresIn: 15 * 60,
      },
    });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Refresh token');
  }
};

/**
 * @route POST /api/auth/revoke-token
 * @category Token
 * @description Revoke refresh token
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.body.token - Token to revoke
 * @returns {Object} Revoke token result
 */
export const revokeToken = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user?._id) {
      throw { code: 'UNAUTHORIZED', message: 'User not authenticated' };
    }

    const token = validateToken(req);
    const result = await AuthService.revokeToken(token);

    // Clear cookies
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return formatResponse(res, { message: 'Token revoked successfully', data: result });
  } catch (error) {
    return handleError(error as ErrorResponse, res, 'Revoke token');
  }
};
