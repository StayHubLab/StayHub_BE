/**
 * @fileoverview Booking Routes - Handles booking operations
 * @created 2025-06-09
 * @file booking.routes.js
 * @description This file defines the routes for booking operations.
 * It includes routes for booking creation, cancellation, and retrieval.
 * It also includes routes for getting bookings by room ID and user ID.
 */

const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  getBookingsByRoomId,
  getBookingsByUserId,
} = require('../controllers/booking.controller');
const { auth, roleMiddleware } = require('../middlewares/auth.middleware');

// Protected routes
router.get('/', auth, roleMiddleware('admin'), getAllBookings);
router.get('/:id', auth, getBookingById);
router.post('/', auth, createBooking);
router.put('/:id', auth, roleMiddleware('admin', 'landlord'), updateBooking);
router.put('/:id/cancel', auth, cancelBooking);
router.get('/user/:userId', auth, getBookingsByUserId);
router.get('/room/:roomId', auth, getBookingsByRoomId);

module.exports = router;
