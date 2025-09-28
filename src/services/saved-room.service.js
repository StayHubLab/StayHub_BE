/**
 * @fileoverview Saved Room Service - Handles saved room business logic
 * @created 2025-09-25
 * @file saved-room.service.js
 * @description Service for managing saved room operations
 */

const SavedRoom = require('../models/saved-room.model');
const Room = require('../models/room.model');
const Building = require('../models/building.model');
const User = require('../models/user.model');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const mongoose = require('mongoose');

/**
 * @class SavedRoomService
 * @classdesc Service class for handling saved room operations
 */
class SavedRoomService {
  /**
   * Get all saved rooms for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Saved rooms with pagination
   */
  static async getSavedRooms(userId, { page = 1, limit = 10 } = {}) {
    try {
      logger.info('SavedRoomService: Getting saved rooms for user', { userId });

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ValidationError('Invalid user ID format');
      }

      const skip = (page - 1) * limit;

      // Get saved rooms with populated room and building data
      const savedRooms = await SavedRoom.find({ userId })
        .populate({
          path: 'roomId',
          populate: {
            path: 'buildingId',
            model: 'Building',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await SavedRoom.countDocuments({ userId });

      const roomsData = savedRooms
        .filter((savedRoom) => savedRoom.roomId) // Filter out deleted rooms
        .map((savedRoom) => {
          const roomData = savedRoom.roomId.toObject();
          const buildingData = roomData.buildingId;

          // Format address properly
          let formattedAddress = 'No address available';
          if (buildingData && buildingData.address) {
            const addr = buildingData.address;
            const addressParts = [];
            if (addr.street) addressParts.push(addr.street);
            if (addr.ward) addressParts.push(addr.ward);
            if (addr.district) addressParts.push(addr.district);
            if (addr.city) addressParts.push(addr.city);
            formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : formattedAddress;
          }

          return {
            _id: savedRoom._id,
            savedAt: savedRoom.savedAt,
            room: {
              ...roomData,
              title: roomData.name, // Map name to title for frontend compatibility
              address: formattedAddress, // Return formatted address string
              images: roomData.images?.map((img) => img.url) || [], // Extract image URLs
              reviews: 0, // Default value, should come from actual reviews
              isVerified: true, // Default value, should come from actual verification
              isAiRecommended: false, // Default value
            },
          };
        });

      return {
        savedRooms: roomsData,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('SavedRoomService: Error getting saved rooms', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Save a room for a user
   * @param {string} userId - User ID
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Created saved room
   */
  static async saveRoom(userId, roomId) {
    try {
      logger.info('SavedRoomService: Saving room for user', { userId, roomId });

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ValidationError('Invalid user ID format');
      }
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ValidationError('Invalid room ID format');
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if room exists
      const room = await Room.findById(roomId);
      if (!room) {
        throw new NotFoundError('Room not found');
      }

      // Check if already saved
      const existingSavedRoom = await SavedRoom.findByUserAndRoom(userId, roomId);
      if (existingSavedRoom) {
        throw new ConflictError('Room already saved');
      }

      // Create saved room
      const savedRoom = new SavedRoom({
        userId,
        roomId,
      });

      await savedRoom.save();

      // Return populated saved room
      const populatedSavedRoom = await SavedRoom.findById(savedRoom._id).populate({
        path: 'roomId',
        populate: {
          path: 'buildingId',
          model: 'Building',
        },
      });

      logger.info('SavedRoomService: Room saved successfully', {
        savedRoomId: savedRoom._id,
        userId,
        roomId,
      });

      return populatedSavedRoom;
    } catch (error) {
      logger.error('SavedRoomService: Error saving room', {
        error: error.message,
        userId,
        roomId,
      });
      throw error;
    }
  }

  /**
   * Remove a saved room
   * @param {string} userId - User ID
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Deletion result
   */
  static async unsaveRoom(userId, roomId) {
    try {
      logger.info('SavedRoomService: Removing saved room', { userId, roomId });

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ValidationError('Invalid user ID format');
      }
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ValidationError('Invalid room ID format');
      }

      // Find and delete saved room
      const savedRoom = await SavedRoom.findOneAndDelete({ userId, roomId });

      // If room was not saved, still return success (idempotent operation)
      if (!savedRoom) {
        logger.info('SavedRoomService: Room was not saved, returning success anyway', {
          userId,
          roomId,
        });

        return {
          message: 'Room was not in saved list',
          removedSavedRoom: null,
        };
      }

      logger.info('SavedRoomService: Saved room removed successfully', {
        savedRoomId: savedRoom._id,
        userId,
        roomId,
      });

      return {
        message: 'Room removed from saved successfully',
        removedSavedRoom: savedRoom,
      };
    } catch (error) {
      logger.error('SavedRoomService: Error removing saved room', {
        error: error.message,
        userId,
        roomId,
      });
      throw error;
    }
  }

  /**
   * Check if a room is saved by user
   * @param {string} userId - User ID
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Saved status
   */
  static async checkSavedStatus(userId, roomId) {
    try {
      logger.info('SavedRoomService: Checking saved status', { userId, roomId });

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ValidationError('Invalid user ID format');
      }
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ValidationError('Invalid room ID format');
      }

      const isSaved = await SavedRoom.isRoomSaved(userId, roomId);

      return {
        isSaved,
        roomId,
        userId,
      };
    } catch (error) {
      logger.error('SavedRoomService: Error checking saved status', {
        error: error.message,
        userId,
        roomId,
      });
      throw error;
    }
  }

  /**
   * Get saved rooms count for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Count of saved rooms
   */
  static async getSavedRoomsCount(userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ValidationError('Invalid user ID format');
      }

      const count = await SavedRoom.countDocuments({ userId });
      return count;
    } catch (error) {
      logger.error('SavedRoomService: Error getting saved rooms count', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }
}

module.exports = SavedRoomService;
