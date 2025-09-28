/**
 * @fileoverview Viewing Controller - Handles viewing appointment HTTP requests
 * @created 2025-09-25
 * @file viewing.controller.js
 * @description Controller for managing viewing appointment API endpoints
 */

const ViewingService = require('../services/viewing.service');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * @class ViewingController
 * @classdesc Controller class for handling viewing appointment HTTP requests
 */
class ViewingController {
  /**
   * @route POST /api/viewings
   * @description Create a new viewing appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async createViewing(req, res, next) {
    try {
      logger.info('ViewingController: Create viewing appointment request', {
        body: req.body,
        userId: req.user?.id,
      });

      const viewingData = {
        ...req.body,
        userId: req.user?.id || req.body.userId, // Get user ID from auth middleware or body
      };

      const viewing = await ViewingService.createViewing(viewingData);

      res.status(201).json({
        success: true,
        message: 'Viewing appointment created successfully',
        data: viewing,
      });
    } catch (error) {
      logger.error('Error in createViewing controller:', error);
      next(error);
    }
  }

  /**
   * @route GET /api/viewings
   * @description Get viewing appointments with pagination and filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getViewings(req, res, next) {
    try {
      const { page = 1, limit = 10, status, userId, landlordId, roomId } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (userId) filters.userId = userId;
      if (landlordId) filters.landlordId = landlordId;
      if (roomId) filters.roomId = roomId;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        filters,
      };

      const result = await ViewingService.getViewings(options);

      res.status(200).json({
        success: true,
        message: 'Viewing appointments retrieved successfully',
        data: result.viewings,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in getViewings controller:', error);
      next(error);
    }
  }

  /**
   * @route GET /api/viewings/:id
   * @description Get a viewing appointment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getViewingById(req, res, next) {
    try {
      const { id } = req.params;

      const viewing = await ViewingService.getViewingById(id);

      res.status(200).json({
        success: true,
        message: 'Viewing appointment retrieved successfully',
        data: viewing,
      });
    } catch (error) {
      logger.error('Error in getViewingById controller:', error);
      next(error);
    }
  }

  /**
   * @route PUT /api/viewings/:id/status
   * @description Update viewing appointment status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async updateViewingStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, message } = req.body;

      if (!status) {
        throw new AppError('Status is required', 400);
      }

      const viewing = await ViewingService.updateViewingStatus(id, status, message);

      res.status(200).json({
        success: true,
        message: 'Viewing appointment status updated successfully',
        data: viewing,
      });
    } catch (error) {
      logger.error('Error in updateViewingStatus controller:', error);
      next(error);
    }
  }

  /**
   * @route GET /api/viewings/user/:userId
   * @description Get viewing appointments for a specific user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getViewingsByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      };

      const result = await ViewingService.getViewingsByUser(userId, options);

      res.status(200).json({
        success: true,
        message: 'User viewing appointments retrieved successfully',
        data: result.viewings,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in getViewingsByUser controller:', error);
      next(error);
    }
  }

  /**
   * @route GET /api/viewings/landlord/:landlordId
   * @description Get viewing appointments for a specific landlord
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getViewingsByLandlord(req, res, next) {
    try {
      const { landlordId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      };

      const result = await ViewingService.getViewingsByLandlord(landlordId, options);

      res.status(200).json({
        success: true,
        message: 'Landlord viewing appointments retrieved successfully',
        data: result.viewings,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in getViewingsByLandlord controller:', error);
      next(error);
    }
  }

  /**
   * @route GET /api/viewings/me
   * @description Get viewing appointments for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getMyViewings(req, res, next) {
    try {
      const userId = req.user?.id;

      // For testing purposes, get all viewing appointments if not authenticated
      // In production, this should be protected with auth middleware
      let result;

      if (!userId) {
        logger.warn(
          'getMyViewings called without authentication - returning all viewings for development'
        );
        // Get all viewings for testing (since we have userId: null in test data)
        result = await ViewingService.getViewings({ page: 1, limit: 10 });
      } else {
        const { page = 1, limit = 10, status } = req.query;
        const options = {
          page: parseInt(page),
          limit: parseInt(limit),
          status,
        };
        result = await ViewingService.getViewingsByUser(userId, options);
      }

      res.status(200).json({
        success: true,
        message: userId
          ? 'Your viewing appointments retrieved successfully'
          : 'Test viewing appointments retrieved successfully',
        data: result.viewings,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in getMyViewings controller:', error);
      next(error);
    }
  }

  /**
   * @route DELETE /api/viewings/:id
   * @description Delete a viewing appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async deleteViewing(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ViewingService.deleteViewing(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error('Error in deleteViewing controller:', error);
      next(error);
    }
  }

  /**
   * @route POST /api/viewings/:id/confirm
   * @description Confirm a viewing appointment (landlord only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async confirmViewing(req, res, next) {
    try {
      const { id } = req.params;
      const { message } = req.body;

      const viewing = await ViewingService.updateViewingStatus(id, 'confirmed', message);

      res.status(200).json({
        success: true,
        message: 'Viewing appointment confirmed successfully',
        data: viewing,
      });
    } catch (error) {
      logger.error('Error in confirmViewing controller:', error);
      next(error);
    }
  }

  /**
   * @route POST /api/viewings/:id/cancel
   * @description Cancel a viewing appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async cancelViewing(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const viewing = await ViewingService.updateViewingStatus(id, 'cancelled', reason);

      res.status(200).json({
        success: true,
        message: 'Viewing appointment cancelled successfully',
        data: viewing,
      });
    } catch (error) {
      logger.error('Error in cancelViewing controller:', error);
      next(error);
    }
  }

  /**
   * @route POST /api/viewings/:id/complete
   * @description Mark a viewing appointment as completed
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async completeViewing(req, res, next) {
    try {
      const { id } = req.params;

      const viewing = await ViewingService.updateViewingStatus(id, 'completed');

      res.status(200).json({
        success: true,
        message: 'Viewing appointment marked as completed',
        data: viewing,
      });
    } catch (error) {
      logger.error('Error in completeViewing controller:', error);
      next(error);
    }
  }
}

module.exports = ViewingController;
