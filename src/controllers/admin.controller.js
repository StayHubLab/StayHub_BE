/**
 * @fileoverview Admin Controller - Handles admin operations
 * @created 2025-11-06
 * @file admin.controller.js
 * @description This file defines the controller for admin operations including dashboard statistics.
 */

const adminService = require('../services/admin.service');
const { successResponse } = require('../utils/response');

/**
 * Get dashboard statistics
 * @route GET /api/admin/dashboard/stats
 * @access Private (Admin only)
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return successResponse(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics by role
 * @route GET /api/admin/dashboard/users
 * @access Private (Admin only)
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const userStats = await adminService.getUserStats();
    return successResponse(res, userStats, 'User statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get engagement metrics
 * @route GET /api/admin/dashboard/engagement
 * @access Private (Admin only)
 */
exports.getEngagementMetrics = async (req, res, next) => {
  try {
    const engagementMetrics = await adminService.getEngagementMetrics();
    return successResponse(res, engagementMetrics, 'Engagement metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly active users trend
 * @route GET /api/admin/dashboard/mau-trend
 * @access Private (Admin only)
 */
exports.getMAUTrend = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const mauTrend = await adminService.getMAUTrend(parseInt(months));
    return successResponse(res, mauTrend, 'MAU trend retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all dashboard data at once
 * @route GET /api/admin/dashboard
 * @access Private (Admin only)
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const dashboardData = await adminService.getDashboardData();
    return successResponse(res, dashboardData, 'Dashboard data retrieved successfully');
  } catch (error) {
    next(error);
  }
};
