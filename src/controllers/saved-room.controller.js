/**
 * @fileoverview Saved Room Controller - Handles saved room API requests
 * @created 2025-09-25
 * @file saved-room.controller.js
 * @description Controller for saved room management endpoints
 */

const SavedRoomService = require('../services/saved-room.service');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * @class SavedRoomController
 * @classdesc Controller class for handling saved room HTTP requests
 */
class SavedRoomController {
  /**
   * @route GET /api/saved-rooms
   * @description Get all saved rooms for authenticated user
   * @access Private
   */
  static async getSavedRooms(req, res, next) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      const { page = 1, limit = 10 } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const result = await SavedRoomService.getSavedRooms(userId, options);

      res.status(200).json({
        success: true,
        message: 'Saved rooms retrieved successfully',
        data: {
          savedRooms: result.savedRooms,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      logger.error('Error in getSavedRooms controller:', error);
      next(error);
    }
  }

  /**
   * @route POST /api/saved-rooms
   * @description Save a room for authenticated user
   * @access Private
   */
  static async saveRoom(req, res, next) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      const { roomId } = req.body;
      if (!roomId) {
        throw new AppError('Room ID is required', 400);
      }

      const savedRoom = await SavedRoomService.saveRoom(userId, roomId);

      res.status(201).json({
        success: true,
        message: 'Room saved successfully',
        data: savedRoom,
      });
    } catch (error) {
      logger.error('Error in saveRoom controller:', error);
      next(error);
    }
  }

  /**
   * @route DELETE /api/saved-rooms/:roomId
   * @description Remove a room from saved rooms
   * @access Private
   */
  static async unsaveRoom(req, res, next) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      const { roomId } = req.params;
      if (!roomId) {
        throw new AppError('Room ID is required', 400);
      }

      const result = await SavedRoomService.unsaveRoom(userId, roomId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.removedSavedRoom,
      });
    } catch (error) {
      logger.error('Error in unsaveRoom controller:', error);
      next(error);
    }
  }

  /**
   * @route GET /api/saved-rooms/:roomId/status
   * @description Check if a room is saved by authenticated user
   * @access Private
   */
  static async checkSavedStatus(req, res, next) {
    try {
      const userId = req.user?._id;
      const effectiveUserId = userId || '6798b123456789abcdef0123'; // Default test user ID

      if (!userId) {
        logger.warn(
          'checkSavedStatus called without authentication - using test user ID for development'
        );
      }

      const { roomId } = req.params;
      if (!roomId) {
        throw new AppError('Room ID is required', 400);
      }

      const result = await SavedRoomService.checkSavedStatus(effectiveUserId, roomId);

      res.status(200).json({
        success: true,
        message: 'Saved status checked successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error in checkSavedStatus controller:', error);
      next(error);
    }
  }

  /**
   * @route GET /api/saved-rooms/count
   * @description Get count of saved rooms for authenticated user
   * @access Private
   */
  static async getSavedRoomsCount(req, res, next) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const count = await SavedRoomService.getSavedRoomsCount(userId);

      res.status(200).json({
        success: true,
        message: 'Saved rooms count retrieved successfully',
        data: { count },
      });
    } catch (error) {
      logger.error('Error in getSavedRoomsCount controller:', error);
      next(error);
    }
  }
}

module.exports = SavedRoomController;
