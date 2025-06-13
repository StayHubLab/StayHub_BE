/**
 * @fileoverview Room Service - Handles room operations
 * @created 2025-06-06
 * @file room.service.js
 * @description Service for managing room data and operations
 */

const Room = require('../models/room.model');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');
const mongoose = require('mongoose');
const Building = require('../models/building.model');

/**
 * @class RoomService
 * @classdesc Service class for handling room operations
 */
class RoomService {
  /**
   * @route GET /api/rooms
   * @description Get all rooms with pagination and filters
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {Object} options.filters - Filter criteria
   * @returns {Promise<Object>} Rooms data with pagination
   */
  static async getAllRooms({ page = 1, limit = 10, filters = {} } = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = Room.find(filters);

      const [rooms, total] = await Promise.all([
        query.skip(skip).limit(limit).lean(),
        Room.countDocuments(filters),
      ]);

      return {
        rooms,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting all rooms:', error);
      throw error;
    }
  }

  /**
   * @route GET /api/rooms/:id
   * @description Get a room by ID
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Room data
   */
  static async getRoomById(roomId) {
    try {
      logger.info('RoomService: Getting room by ID', { roomId });

      if (!roomId) {
        logger.error('RoomService: Room ID is missing');
        throw new ValidationError('Room ID is required');
      }

      //Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        logger.error('RoomService: Invalid room ID format', { roomId });
        throw new ValidationError('Invalid room ID format');
      }

      const room = await Room.findById(roomId).lean();
      logger.info('RoomService: Room query result', {
        roomId,
        found: !!room,
        status: room?.status,
      });

      if (!room) {
        logger.error('RoomService: Room not found', { roomId });
        throw new NotFoundError(`Room with id ${roomId} not found`);
      }

      return room;
    } catch (error) {
      logger.error('Error getting room by ID:', {
        error: error.message,
        stack: error.stack,
        roomId,
      });
      throw error;
    }
  }

  /**
   * @route POST /api/rooms
   * @description Create a new room
   * @param {Object} roomData - Room data
   * @returns {Promise<Object>} Created room
   */
  static async createRoom(roomData) {
    try {
      logger.info('RoomService: Creating new room', { roomData });

      //Validate room data
      if (!roomData) {
        logger.error('RoomService: Room data is missing');
        throw new ValidationError('Room data is required');
      }

      //Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(roomData.buildingId)) {
        logger.error('RoomService: Invalid building ID format', { roomData });
        throw new ValidationError('Invalid building ID format');
      }

      //Create room
      const newRoom = new Room(roomData);
      await newRoom.save();
      logger.info('RoomService: Room created successfully', { roomId: newRoom._id });

      return newRoom.toObject();
    } catch (error) {
      logger.error('Error creating room:', {
        error: error.message,
        stack: error.stack,
        roomData,
      });
      throw error;
    }
  }

  /**
   * @route PUT /api/rooms/:id
   * @description Update a room
   * @param {string} roomId - Room ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated room
   */
  static async updateRoom(roomId, updateData) {
    try {
      logger.info('RoomService: Updating room', { roomId, updateData });

      //Validate room ID
      if (!roomId) {
        logger.error('RoomService: Room ID is missing');
        throw new ValidationError('Room ID is required');
      }

      //Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        logger.error('RoomService: Invalid room ID format', { roomId });
        throw new ValidationError('Invalid room ID format');
      }

      //Validate update data
      if (!updateData || Object.keys(updateData).length === 0) {
        logger.error('RoomService: Update data is missing or empty');
        throw new ValidationError('Update data is required');
      }

      //Update room
      const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, { new: true });

      if (!updatedRoom) {
        logger.error('RoomService: Room not found', { roomId });
        throw new NotFoundError(`Room with id ${roomId} not found`);
      }

      logger.info('RoomService: Room updated successfully', { roomId, updatedRoom });

      return updatedRoom.toObject();
    } catch (error) {
      logger.error('Error updating room:', {
        error: error.message,
        stack: error.stack,
        roomId,
        updateData,
      });
      throw error;
    }
  }

  /**
   * @route DELETE /api/rooms/:id
   * @description Delete a room
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Deleted room
   */
  static async deleteRoom(roomId) {
    try {
      if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ValidationError('Invalid room ID format');
      }

      const room = await Room.findById(roomId);
      if (!room) {
        throw new NotFoundError(`Room with id ${roomId} not found`);
      }

      await Promise.all([
        Building.findByIdAndUpdate(room.buildingId, {
          $inc: { availableRooms: 1 },
        }),
        Room.findByIdAndDelete(roomId),
      ]);

      return room.toObject();
    } catch (error) {
      logger.error('Error deleting room:', error);
      throw error;
    }
  }

  /**
   * @route GET /api/rooms/stats
   * @description Get room statistics
   * @returns {Promise<Object>} Room statistics
   */
  static async getRoomStats() {
    try {
      logger.info('RoomService: Getting room statistics');

      //Get total rooms
      const totalRooms = await Room.countDocuments();

      //Get total available rooms
      const availableRooms = await Room.countDocuments({ status: 'available' });

      //Get total rented rooms
      const rentedRooms = await Room.countDocuments({ status: 'rented' });

      //Get total reserved rooms
      const reservedRooms = await Room.countDocuments({ status: 'reserved' });

      //Get total maintenance rooms
      const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });

      //Get total rooms by building
      const roomsByBuilding = await Room.aggregate([
        { $group: { _id: '$building', count: { $sum: 1 } } },
      ]);

      //Get average price
      const averagePrice = await Room.aggregate([
        { $group: { _id: null, averagePrice: { $avg: '$price' } } },
      ]);

      return {
        totalRooms,
        availableRooms,
        rentedRooms,
        reservedRooms,
        maintenanceRooms,
        roomsByBuilding,
        averagePrice,
      };
    } catch (error) {
      logger.error('Error getting room statistics:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Search rooms by keyword
   * @param {string} keyword - Search keyword
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Search results with pagination
   */
  static async searchRooms(keyword, { page = 1, limit = 10 } = {}) {
    try {
      const skip = (page - 1) * limit;

      // Create search query
      const searchQuery = {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { 'utilities.name': { $regex: keyword, $options: 'i' } },
          { status: { $regex: keyword, $options: 'i' } },
        ],
      };

      const [rooms, total] = await Promise.all([
        Room.find(searchQuery).skip(skip).limit(limit).lean(),
        Room.countDocuments(searchQuery),
      ]);

      return {
        rooms,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error searching rooms:', error);
      throw error;
    }
  }

  /**
   * Filter rooms by criteria
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Filtered rooms with pagination
   */
  static async filterRooms(filters, { page = 1, limit = 10 } = {}) {
    try {
      const skip = (page - 1) * limit;

      // Build filter query
      const query = {};

      // Price filter
      if (filters.minPrice || filters.maxPrice) {
        query['price.rent'] = {};
        if (filters.minPrice) query['price.rent'].$gte = filters.minPrice;
        if (filters.maxPrice) query['price.rent'].$lte = filters.maxPrice;
      }

      // Area filter
      if (filters.minArea || filters.maxArea) {
        query.area = {};
        if (filters.minArea) query.area.$gte = filters.minArea;
        if (filters.maxArea) query.area.$lte = filters.maxArea;
      }

      // Amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        query['utilities.name'] = { $all: filters.amenities };
      }

      const [rooms, total] = await Promise.all([
        Room.find(query).skip(skip).limit(limit).lean(),
        Room.countDocuments(query),
      ]);

      return {
        rooms,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error filtering rooms:', error);
      throw error;
    }
  }
}

module.exports = RoomService;
