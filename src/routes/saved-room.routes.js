/**
 * @fileoverview Saved Room Routes - Defines saved room API routes
 * @created 2025-09-25
 * @file saved-room.routes.js
 * @description Routes for saved room management
 */

const express = require('express');
const SavedRoomController = require('../controllers/saved-room.controller');
const { auth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protected routes - require authentication

/**
 * @route GET /api/saved-rooms
 * @description Get all saved rooms for authenticated user
 * @access Private
 */
router.get('/', auth, SavedRoomController.getSavedRooms);

/**
 * @route GET /api/saved-rooms/count
 * @description Get count of saved rooms
 * @access Private
 */
router.get('/count', auth, SavedRoomController.getSavedRoomsCount);

/**
 * @route POST /api/saved-rooms
 * @description Save a room for authenticated user
 * @access Private
 */
router.post('/', auth, SavedRoomController.saveRoom);

/**
 * @route GET /api/saved-rooms/:roomId/status
 * @description Check if a room is saved
 * @access Private
 */
router.get('/:roomId/status', auth, SavedRoomController.checkSavedStatus);

/**
 * @route DELETE /api/saved-rooms/:roomId
 * @description Remove a room from saved rooms
 * @access Private
 */
router.delete('/:roomId', auth, SavedRoomController.unsaveRoom);

module.exports = router;
