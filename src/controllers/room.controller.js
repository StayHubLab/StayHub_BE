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
