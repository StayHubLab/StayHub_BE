/**
 * @fileoverview Room Routes - Handles room operations
 * @created 2025-06-06
 * @file room.routes.js
 * @description This file defines the routes for room operations.
 */

const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  searchRooms,
  filterRooms,
} = require('../controllers/room.controller');
const { auth, roleMiddleware } = require('../middlewares/auth.middleware');

//Public Routes
router.get('/', getAllRooms);
router.get('/search', searchRooms);
router.get('/filter', filterRooms);
router.get('/:id', getRoomById);

//Protected Routes
router.post('/', auth, roleMiddleware('landlord'), createRoom);
router.put('/:id', auth, roleMiddleware('landlord'), updateRoom);
router.delete('/:id', auth, roleMiddleware('landlord'), deleteRoom);

module.exports = router;
