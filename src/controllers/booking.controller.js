/**
 * @fileoverview Booking Controller - Handles HTTP requests for booking
 * @created 2025-06-09
 * @file booking.controller.js
 * @description This controller manages booking endpoints including CRUD operations.
 */

const { default: mongoose } = require('mongoose');
const BookingService = require('../services/booking.service');
const logger = require('../utils/logger');

/**
 * @route GET /api/bookings
 * @description Get all bookings
 * @returns {Object} Bookings data
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await BookingService.getAllBookings(req.query);
    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
    logger.info('Bookings retrieved successfully');
  } catch (error) {
    logger.error('Error getting all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting all bookings',
      error: error.message,
    });
  }
};

/**
 * @route GET /api/bookings/:id
 * @description Get a booking by ID
 * @param {string} id - Booking ID
 * @returns {Object} Booking data
 */
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    logger.info('Getting booking by ID:', { bookingId });
    if (!bookingId) {
      logger.error('Booking ID is missing');
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    const booking = await BookingService.getBookingById(bookingId);
    logger.info('Booking found:', { bookingId, status: booking?.status });
    return res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking,
    });
  } catch (error) {
    logger.error('Error getting booking by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting booking by ID',
      error: error.message,
    });
  }
};

/**
 * @route POST /api/bookings
 * @description Create a new booking
 * @param {Object} bookingData - Booking data
 * @returns {Object} Created booking
 */
exports.createBooking = async (req, res) => {
  try {
    const bookingData = req.body;

    if (!bookingData) {
      logger.error('Booking data is missing');
      return res.status(400).json({
        success: false,
        message: 'Booking data is required',
      });
    }

    logger.info('Creating booking:', { bookingData });

    const createdBooking = await BookingService.createBooking(bookingData);
    logger.info('Booking created successfully:', { bookingId: createdBooking._id });
    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: createdBooking,
    });
  } catch (error) {
    logger.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message,
    });
  }
};

/**
 * @route PUT /api/bookings/:id
 * @description Update a booking
 * @param {string} id - Booking ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated booking
 */
exports.updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      logger.error('Invalid booking ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      logger.error('Update data is missing');
      return res.status(400).json({
        success: false,
        message: 'Update data is required',
      });
    }

    logger.info('Updating booking:', { bookingId, updateData });

    const updatedBooking = await BookingService.updateBooking(bookingId, updateData);
    logger.info('Booking updated successfully:', { bookingId, updatedBooking });
    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (error) {
    logger.error('Error updating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message,
    });
  }
};

/**
 * @route DELETE /api/bookings/:id
 * @description Delete a booking
 * @param {string} id - Booking ID
 * @returns {Object} Deleted booking
 */
exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.body;
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      logger.error('Invalid booking ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    const bookingDelete = await BookingService.deleteBooking(bookingId);
    logger.info('Booking deleted successfully:', { bookingId, bookingDelete });
    return res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
      data: bookingDelete,
    });
  } catch (error) {
    logger.error('Error deleted booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleted booking',
      error: error.message,
    });
  }
};

/**
 * @route POST /api/bookings/:id/cancel
 * @description Cancel a booking
 * @param {string} id - Booking ID
 * @returns {Object} Cancelled booking
 */
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { notes } = req.body;
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      logger.error('Invalid booking ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }
    const cancelledBooking = await BookingService.cancelBooking(bookingId, notes);
    logger.info('Booking cancelled successfully:', { bookingId, cancelledBooking });
    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: cancelledBooking,
    });
  } catch (error) {
    logger.error('Error cancelling booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message,
    });
  }
};

/**
 * @route GET /api/bookings/:roomId/bookings
 * @description Get bookings for a room
 * @param {string} roomId - Room ID
 * @returns {Object} Bookings data for the room
 */
exports.getBookingsByRoomId = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      logger.error('Invalid room ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format',
      });
    }

    const bookings = await BookingService.getBookingsByRoomId(roomId);
    logger.info('Bookings retrieved successfully:', { roomId, bookings });
    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    logger.error('Error getting bookings by room ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting bookings by room ID',
      error: error.message,
    });
  }
};

/**
 * @route GET /api/bookings/:userId/bookings
 * @description Get bookings for a user
 * @param {string} userId - User ID
 * @returns {Object} Bookings data for the user
 */
exports.getBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      logger.error('Invalid user ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }
    const bookings = await BookingService.getBookingsByUserId(userId);
    logger.info('Bookings retrieved successfully:', { userId, bookings });
    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    logger.error('Error getting bookings by user ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting bookings by user ID',
      error: error.message,
    });
  }
};
