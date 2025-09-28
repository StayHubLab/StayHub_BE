/**
 * @fileoverview Viewing Service - Handles viewing appointment operations
 * @created 2025-09-25
 * @file viewing.service.js
 * @description Service for managing viewing appointment data and operations
 */

const Viewing = require('../models/viewing.model');
const Room = require('../models/room.model');
// const Building = require('../models/building.model');
const User = require('../models/user.model');
const EmailService = require('./email.service');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const mongoose = require('mongoose');

/**
 * @class ViewingService
 * @classdesc Service class for handling viewing appointment operations
 */
class ViewingService {
  /**
   * @route POST /api/viewings
   * @description Create a new viewing appointment
   * @param {Object} viewingData - Viewing appointment data
   * @returns {Promise<Object>} Created viewing appointment
   */
  static async createViewing(viewingData) {
    try {
      logger.info('ViewingService: Creating new viewing appointment', {
        roomId: viewingData.roomId,
        userId: viewingData.userId,
      });

      const { roomId, userId, viewingDate, viewingTime, contactInfo, notes } = viewingData;

      // Validate required fields - userId is optional if contactInfo is provided
      if (!roomId || !viewingDate || !viewingTime || !contactInfo) {
        throw new ValidationError('Missing required viewing appointment data');
      }

      // Validate contactInfo has required fields
      if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) {
        throw new ValidationError('Contact info must include name, phone, and email');
      }

      // Validate ObjectIds (only validate userId if provided)
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ValidationError('Invalid room ID format');
      }

      if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ValidationError('Invalid user ID format');
      }

      // Check if room exists and get building/landlord info
      const room = await Room.findById(roomId).populate('buildingId', 'hostId').lean();

      if (!room) {
        throw new NotFoundError(`Room with id ${roomId} not found`);
      }

      if (!room.buildingId?.hostId) {
        throw new ValidationError('Room does not have an associated landlord');
      }

      // Check if user exists (only if userId is provided)
      let user = null;
      if (userId) {
        user = await User.findById(userId).lean();
        if (!user) {
          throw new NotFoundError(`User with id ${userId} not found`);
        }
      }

      // Check for conflicts (same room, date, time)
      const conflictingViewing = await Viewing.findConflicting(
        roomId,
        new Date(viewingDate),
        viewingTime
      );

      if (conflictingViewing.length > 0) {
        throw new ConflictError('This time slot is already booked for viewing');
      }

      // Validate viewing date is not in the past (compare only date, not time)
      const viewingDateObj = new Date(viewingDate);
      const today = new Date();

      // Set both dates to start of day for fair comparison
      viewingDateObj.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (viewingDateObj < today) {
        throw new ValidationError('Viewing date cannot be in the past');
      }

      // Create viewing appointment
      const viewing = new Viewing({
        userId: userId || null, // Allow null userId for guest bookings
        roomId,
        buildingId: room.buildingId._id,
        landlordId: room.buildingId.hostId,
        viewingDate: viewingDateObj,
        viewingTime,
        contactInfo: {
          name: contactInfo.name,
          phone: contactInfo.phone,
          email: contactInfo.email,
        },
        notes: notes || '',
        status: 'pending',
      });

      const savedViewing = await viewing.save();

      // Populate the saved viewing for return
      const populatedViewing = await Viewing.findById(savedViewing._id)
        .populate('userId', 'name email phone')
        .populate('roomId', 'name price')
        .populate('buildingId', 'name address')
        .populate('landlordId', 'name email phone')
        .lean();

      logger.info('ViewingService: Viewing appointment created successfully', {
        viewingId: savedViewing._id,
      });

      // Send email notifications
      try {
        // Format date for display
        const formattedDate = new Date(viewingDate).toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const emailData = {
          // Common data
          roomId: populatedViewing.roomId._id,
          roomName: populatedViewing.roomId.name || 'Phòng trọ',
          roomPrice: populatedViewing.roomId.price?.rent || 0,
          roomAddress:
            typeof populatedViewing.buildingId.address === 'string'
              ? populatedViewing.buildingId.address
              : populatedViewing.buildingId.address?.address ||
                populatedViewing.buildingId.address?.street ||
                'Địa chỉ không xác định',
          buildingName: populatedViewing.buildingId.name || 'Tòa nhà',
          buildingAddress:
            typeof populatedViewing.buildingId.address === 'string'
              ? populatedViewing.buildingId.address
              : populatedViewing.buildingId.address?.address ||
                populatedViewing.buildingId.address?.street ||
                'Địa chỉ không xác định',
          viewingDate: formattedDate,
          viewingTime: viewingTime,
          notes: notes,

          // Renter data
          renterName: contactInfo.name,
          renterPhone: contactInfo.phone,
          renterEmail: contactInfo.email,

          // Landlord data
          landlordName: populatedViewing.landlordId.name,
          landlordPhone: populatedViewing.landlordId.phone,
          landlordEmail: populatedViewing.landlordId.email,
        };

        // Send confirmation email to renter
        await EmailService.sendTemplatedEmail(
          contactInfo.email,
          'VIEWING_APPOINTMENT_RENTER',
          emailData
        );

        // Send notification email to landlord
        await EmailService.sendTemplatedEmail(
          populatedViewing.landlordId.email,
          'VIEWING_APPOINTMENT_LANDLORD',
          emailData
        );

        logger.info('ViewingService: Email notifications sent successfully', {
          viewingId: savedViewing._id,
          renterEmail: contactInfo.email,
          landlordEmail: populatedViewing.landlordId.email,
        });
      } catch (emailError) {
        // Log email error but don't fail the viewing creation
        logger.error('ViewingService: Failed to send email notifications:', {
          error: emailError.message,
          viewingId: savedViewing._id,
          renterEmail: contactInfo.email,
          landlordEmail: populatedViewing.landlordId.email,
        });
      }

      return populatedViewing;
    } catch (error) {
      logger.error('Error creating viewing appointment:', {
        error: error.message,
        stack: error.stack,
        viewingData,
      });
      throw error;
    }
  }

  /**
   * @route GET /api/viewings
   * @description Get viewing appointments with pagination and filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Viewing appointments data with pagination
   */
  static async getViewings({ page = 1, limit = 10, filters = {} } = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = Viewing.find(filters);

      const [viewings, total] = await Promise.all([
        query
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email phone')
          .populate('roomId', 'name price')
          .populate('buildingId', 'name address')
          .populate('landlordId', 'name email phone')
          .sort({ createdAt: -1 })
          .lean(),
        Viewing.countDocuments(filters),
      ]);

      return {
        viewings,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting viewing appointments:', error);
      throw error;
    }
  }

  /**
   * @route GET /api/viewings/:id
   * @description Get a viewing appointment by ID
   * @param {string} viewingId - Viewing appointment ID
   * @returns {Promise<Object>} Viewing appointment data
   */
  static async getViewingById(viewingId) {
    try {
      logger.info('ViewingService: Getting viewing appointment by ID', { viewingId });

      if (!viewingId) {
        throw new ValidationError('Viewing appointment ID is required');
      }

      if (!mongoose.Types.ObjectId.isValid(viewingId)) {
        throw new ValidationError('Invalid viewing appointment ID format');
      }

      const viewing = await Viewing.findById(viewingId)
        .populate('userId', 'name email phone')
        .populate('roomId', 'name price')
        .populate('buildingId', 'name address')
        .populate('landlordId', 'name email phone')
        .lean();

      if (!viewing) {
        throw new NotFoundError(`Viewing appointment with id ${viewingId} not found`);
      }

      return viewing;
    } catch (error) {
      logger.error('Error getting viewing appointment by ID:', {
        error: error.message,
        stack: error.stack,
        viewingId,
      });
      throw error;
    }
  }

  /**
   * @route PUT /api/viewings/:id/status
   * @description Update viewing appointment status
   * @param {string} viewingId - Viewing appointment ID
   * @param {string} status - New status
   * @param {string} message - Optional message from landlord
   * @returns {Promise<Object>} Updated viewing appointment
   */
  static async updateViewingStatus(viewingId, status, message = null) {
    try {
      logger.info('ViewingService: Updating viewing appointment status', {
        viewingId,
        status,
      });

      if (!mongoose.Types.ObjectId.isValid(viewingId)) {
        throw new ValidationError('Invalid viewing appointment ID format');
      }

      const viewing = await Viewing.findById(viewingId);
      if (!viewing) {
        throw new NotFoundError(`Viewing appointment with id ${viewingId} not found`);
      }

      // Update status based on the new status
      switch (status) {
        case 'confirmed':
          await viewing.confirm(message);
          break;
        case 'cancelled':
          await viewing.cancel(message);
          break;
        case 'completed':
          await viewing.complete();
          break;
        default:
          viewing.status = status;
          await viewing.save();
      }

      // Return populated viewing
      const updatedViewing = await Viewing.findById(viewingId)
        .populate('userId', 'name email phone')
        .populate('roomId', 'name price')
        .populate('buildingId', 'name address')
        .populate('landlordId', 'name email phone')
        .lean();

      return updatedViewing;
    } catch (error) {
      logger.error('Error updating viewing appointment status:', {
        error: error.message,
        stack: error.stack,
        viewingId,
        status,
      });
      throw error;
    }
  }

  /**
   * @route GET /api/viewings/user/:userId
   * @description Get viewing appointments for a specific user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User's viewing appointments
   */
  static async getViewingsByUser(userId, { page = 1, limit = 10, status = null } = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ValidationError('Invalid user ID format');
      }

      const filters = { userId };
      if (status) {
        filters.status = status;
      }

      return await this.getViewings({ page, limit, filters });
    } catch (error) {
      logger.error('Error getting user viewing appointments:', error);
      throw error;
    }
  }

  /**
   * @route GET /api/viewings/landlord/:landlordId
   * @description Get viewing appointments for a specific landlord
   * @param {string} landlordId - Landlord ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Landlord's viewing appointments
   */
  static async getViewingsByLandlord(landlordId, { page = 1, limit = 10, status = null } = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(landlordId)) {
        throw new ValidationError('Invalid landlord ID format');
      }

      const filters = { landlordId };
      if (status) {
        filters.status = status;
      }

      return await this.getViewings({ page, limit, filters });
    } catch (error) {
      logger.error('Error getting landlord viewing appointments:', error);
      throw error;
    }
  }

  /**
   * @route DELETE /api/viewings/:id
   * @description Delete a viewing appointment (admin only or if can be modified)
   * @param {string} viewingId - Viewing appointment ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteViewing(viewingId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(viewingId)) {
        throw new ValidationError('Invalid viewing appointment ID format');
      }

      const viewing = await Viewing.findById(viewingId);
      if (!viewing) {
        throw new NotFoundError(`Viewing appointment with id ${viewingId} not found`);
      }

      // Check if viewing can be modified
      if (!viewing.canBeModified()) {
        throw new ValidationError('Viewing appointment cannot be deleted at this time');
      }

      await Viewing.findByIdAndDelete(viewingId);

      logger.info('ViewingService: Viewing appointment deleted', { viewingId });

      return { message: 'Viewing appointment deleted successfully' };
    } catch (error) {
      logger.error('Error deleting viewing appointment:', error);
      throw error;
    }
  }
}

module.exports = ViewingService;
