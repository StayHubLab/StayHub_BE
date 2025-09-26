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
  deleteRoomImage,
  searchRooms,
  filterRooms,
  getRoomContractInfo,
} = require('../controllers/room.controller');
const { auth, roleMiddleware } = require('../middlewares/auth.middleware');
const { uploadMultipleImages, handleUploadError } = require('../middlewares/cloudinary.middleware');

//Public Routes
router.get('/', getAllRooms);
router.get('/search', searchRooms);
router.get('/filter', filterRooms);
router.get('/:id', getRoomById);
router.get('/:id/contract', getRoomContractInfo);

//Protected Routes
router.post(
  '/',
  auth,
  roleMiddleware('landlord'),
  uploadMultipleImages('images', 10, 'stayhub/rooms'),
  createRoom
);
router.put(
  '/:id',
  auth,
  roleMiddleware('landlord'),
  uploadMultipleImages('images', 10, 'stayhub/rooms'),
  updateRoom
);
router.delete('/:id', auth, roleMiddleware('landlord'), deleteRoom);

// Delete specific room image
router.delete('/:id/images/:imageId', auth, roleMiddleware('landlord'), deleteRoomImage);

// Error handling middleware
router.use(handleUploadError);

module.exports = router;
