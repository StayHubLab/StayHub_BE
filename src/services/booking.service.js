/**
 * @fileoverview Booking Service - Handles booking operations
 * @created 2025-06-09
 * @file booking.service.js
 * @description Service for managing booking data and operations
 */

const { default: mongoose } = require('mongoose');
const Booking = require('../models/booking.model');
const { ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * @class BookingService
 * @classdesc Service class for handling booking operations
 */
class BookingService {
  /**
   * @route GET /api/bookings
   * @description Get all bookings
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @returns {Promise<Object>} Bookings data with pagination
   */
  static async getAllBookings(options) {
    try {
      const { page = 1, limit = 10, filters = {} } = options;
      const skip = (page - 1) * limit;
      const query = Booking.find(filters);

      const [bookings, total] = await Promise.all([
        query.skip(skip).limit(limit).lean(),
        Booking.countDocuments(filters),
      ]);

      return {
        bookings,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting all bookings:', error);
      throw error;
    }
  }

  /**
   * @route GET /api/bookings/:id
   * @description Get a booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Booking data
   */
  static async getBookingById(bookingId) {
    try {
      logger.info('BookingService: Getting booking by ID', { bookingId });

      if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
        logger.error('BookingService: Invalid booking ID format', { bookingId });
        throw new ValidationError('Invalid booking ID format');
      }

      const booking = await Booking.findById(bookingId).lean();
      logger.info('BookingService: Booking query result', {
        bookingId,
        found: !!booking,
        status: booking?.status,
      });

      return booking;
    } catch (error) {
      logger.error('BookingService: Error getting booking by ID:', error);
      throw error;
    }
  }

  /**
   * @route POST /api/bookings
   * @description Create a new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>} Booking data
   */
  static async createBooking(bookingData) {
    try {
      logger.info('BookingService: Creating booking', { bookingData });

      if (!bookingData) {
        logger.error('BookingService: Booking data is missing');
        throw new ValidationError('Booking data is required');
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(bookingData.renterId)) {
        logger.error('BookingService: Invalid renter ID format', { bookingData });
        throw new ValidationError('Invalid renter ID format');
      }

      if (!mongoose.Types.ObjectId.isValid(bookingData.roomId)) {
        logger.error('BookingService: Invalid room ID format', { bookingData });
        throw new ValidationError('Invalid room ID format');
      }

      if (!mongoose.Types.ObjectId.isValid(bookingData.buildingId)) {
        logger.error('BookingService: Invalid building ID format', { bookingData });
        throw new ValidationError('Invalid building ID format');
      }

      // Create booking
      const booking = await Booking.create(bookingData);
      logger.info('BookingService: Booking created successfully', { bookingId: booking._id });
      return booking;
    } catch (error) {
      logger.error('BookingService: Error creating booking:', error);
      throw error;
    }
  }

  /**
   * @route PUT /api/bookings/:id
   * @description Update a booking
   * @param {string} bookingId - Booking ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated booking
   */
  static async updateBooking(bookingId, updateData) {
    try {
      logger.info('BookingService: Updating booking', { bookingId, updateData });
      if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
        logger.error('BookingService: Invalid booking ID format', { bookingId });
        throw new ValidationError('Invalid booking ID format');
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        logger.error('BookingService: Update data is missing');
        throw new ValidationError('Update data is required');
      }

      const updatedBooking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true });

      if (!updatedBooking) {
        logger.error('BookingService: Booking not found', { bookingId });
        throw new NotFoundError(`Booking with id ${bookingId} not found`);
      }

      logger.info('BookingService: Booking updated successfully', { bookingId, updatedBooking });
      return updatedBooking;
    } catch (error) {
      logger.error('BookingService: Error updating booking:', error);
      throw error;
    }
  }

  /**
   * @route DELETE /api/bookings/:id
   * @description Delete a booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Deleted booking
   */
  static async deleteBooking(bookingId) {
    try {
      if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
        logger.error('BookingService: Invalid booking ID format', { bookingId });
        throw new ValidationError('Invalid booking ID format');
      }

      const deletedBooking = await Booking.findByIdAndDelete(bookingId);
      if (!deletedBooking) {
        logger.error('BookingService: Booking not found', { bookingId });
        throw new NotFoundError(`Booking with id ${bookingId} not found`);
      }

      logger.info('BookingService: Booking deleted successfully', { bookingId });
      return deletedBooking;
    } catch (error) {
      logger.error('BookingService: Error deleting booking:', error);
      throw error;
    }
  }

  /**
   * @route GET /api/users/:userId/bookings
   * @description Get bookings for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Bookings data
   */
  static async getBookingsByUserId(userId) {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        logger.error('BookingService: Invalid user ID format', { userId });
        throw new ValidationError('Invalid user ID format');
      }

      const bookings = await Booking.find({ renterId: userId }).lean();
      logger.info('BookingService: Bookings found', { userId, bookings });
      return bookings;
    } catch (error) {
      logger.error('BookingService: Error getting bookings by user ID:', error);
      throw error;
    }
  }

  /**
   * @route GET /api/rooms/:roomId/bookings
   * @description Get bookings for a room
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Bookings data
   */
  static async getBookingsByRoomId(roomId) {
    try {
      if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        logger.error('BookingService: Invalid room ID format', { roomId });
        throw new ValidationError('Invalid room ID format');
      }

      const bookings = await Booking.find({ roomId: roomId }).lean();
      logger.info('BookingService: Bookings found', { roomId, bookings });
      return bookings;
    } catch (error) {
      logger.error('BookingService: Error getting bookings by room ID:', error);
      throw error;
    }
  }

  /**
   * @route POST /api/bookings/:id/cancel
   * @description Cancel a booking
   * @param {string} bookingId - Booking ID
   * @param {string} notes - Cancellation notes
   * @returns {Promise<Object>} Cancelled booking
   */
  static async cancelBooking(bookingId, notes) {
    try {
      if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
        logger.error('BookingService: Invalid booking ID format', { bookingId });
        throw new ValidationError('Invalid booking ID format');
      }

      const updateData = { status: 'cancelled' };
      if (notes) updateData.notes = notes;

      const cancelledBooking = await Booking.findByIdAndUpdate(bookingId, updateData, {
        new: true,
      });
      if (!cancelledBooking) {
        logger.error('BookingService: Booking not found', { bookingId });
        throw new NotFoundError(`Booking with id ${bookingId} not found`);
      }

      logger.info('BookingService: Booking cancelled successfully', {
        bookingId,
        cancelledBooking,
      });
      return cancelledBooking;
    } catch (error) {
      logger.error('BookingService: Error cancelling booking:', error);
      throw error;
    }
  }
}

module.exports = BookingService;
