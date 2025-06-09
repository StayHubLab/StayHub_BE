/**
 * @fileoverview Room Controller - Handles HTTP requests for room
 * @created 2025-06-06
 * @file room.controller.js
 * @description This controller manages room endpoints including CRUD operations.
 */

const RoomService = require('../services/room.service');
const logger = require('../utils/logger');

/**
 * @route GET /api/rooms
 * @description Get all rooms
 * @returns {Object} Room data
 */
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await RoomService.getAllRooms(req.query);
    res.status(200).json({
      success: true,
      message: 'Rooms retrieved successfully',
      data: rooms,
    });
    logger.info('Rooms retrieved successfully');
  } catch (error) {
    logger.error('Error getting all rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting all rooms',
      error: error.message,
    });
  }
};

/**
 * @route GET /api/rooms/:id
 * @description Get a room by ID
 * @param {string} id - Room ID
 * @returns {Object} Room data
 */

exports.getRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;
    logger.info('Getting room by ID:', { roomId });

    if (!roomId) {
      logger.error('Room ID is missing');
      return res.status(400).json({
        success: false,
        message: 'Room ID is required',
      });
    }

    const room = await RoomService.getRoomById(roomId);
    logger.info('Room found:', { roomId, status: room?.status });

    return res.status(200).json({
      success: true,
      message: 'Room retrieved successfully',
      data: room,
    });
  } catch (error) {
    logger.error('Error getting room by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting room by ID',
      error: error.message,
    });
  }
};

/**
 * @route POST /api/rooms
 * @description Create a new room
 * @param {Object} roomData - Room data
 * @returns {Object} Created room data
 */
exports.createRoom = async (req, res) => {
  try {
    const roomData = req.body;
    const newRoom = await RoomService.createRoom(roomData);
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: newRoom,
    });
    logger.info('Room created successfully');
  } catch (error) {
    logger.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message,
    });
  }
};

/**
 * @route PUT /api/rooms/:id
 * @description Update a room
 * @param {string} id - Room ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated room data
 */
exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const updateData = req.body;
    const updatedRoom = await RoomService.updateRoom(roomId, updateData);
    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom,
    });
    logger.info('Room updated successfully');
  } catch (error) {
    logger.error('Error updating room:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message,
    });
  }
};

/**
 * @route DELETE /api/rooms/:id
 * @description Delete a room
 * @param {string} id - Room ID
 * @returns {Object} Deleted room data
 */
exports.deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const deletedRoom = await RoomService.deleteRoom(roomId);
    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
      data: deletedRoom,
    });
    logger.info('Room deleted successfully');
  } catch (error) {
    logger.error('Error deleting room:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message,
    });
  }
};

/**
 * @route GET /api/rooms/search
 * @description Search rooms by keyword
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Search results with pagination
 */
exports.searchRooms = async (req, res) => {
  try {
    // Get parameters from both query and body
    const keyword = req.query.keyword || req.body.keyword;
    const page = parseInt(req.query.page || req.body.page || 1);
    const limit = parseInt(req.query.limit || req.body.limit || 10);

    logger.info('Searching rooms:', { keyword, page, limit });

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Search keyword is required',
      });
    }

    const searchResults = await RoomService.searchRooms(keyword, { page, limit });
    res.status(200).json({
      success: true,
      message: 'Rooms search completed',
      data: searchResults,
    });
    logger.info('Room search completed successfully');
  } catch (error) {
    logger.error('Error searching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching rooms',
      error: error.message,
    });
  }
};

/**
 * @route GET /api/rooms/filter
 * @description Filter rooms by criteria
 * @param {Object} filters - Filter criteria
 * @param {number} filters.minPrice - Minimum price
 * @param {number} filters.maxPrice - Maximum price
 * @param {number} filters.minArea - Minimum area
 * @param {number} filters.maxArea - Maximum area
 * @param {string[]} filters.amenities - Required amenities
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Filtered rooms with pagination
 */
exports.filterRooms = async (req, res) => {
  try {
    // Get parameters from both query and body
    const filters = {
      minPrice: req.query.minPrice || req.body.minPrice,
      maxPrice: req.query.maxPrice || req.body.maxPrice,
      minArea: req.query.minArea || req.body.minArea,
      maxArea: req.query.maxArea || req.body.maxArea,
      amenities: (req.query.amenities || req.body.amenities)?.split(','),
    };

    const page = parseInt(req.query.page || req.body.page || 1);
    const limit = parseInt(req.query.limit || req.body.limit || 10);

    logger.info('Filtering rooms:', { filters, page, limit });

    const filteredRooms = await RoomService.filterRooms(filters, { page, limit });
    res.status(200).json({
      success: true,
      message: 'Rooms filtered successfully',
      data: filteredRooms,
    });
    logger.info('Room filtering completed successfully');
  } catch (error) {
    logger.error('Error filtering rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering rooms',
      error: error.message,
    });
  }
};
