/**
 * @fileoverview Room Service - Handles room operations
 * @created 2025-06-06
 * @file room.service.js
 * @description Service for managing room data and operations
 */

const Room = require('../models/room.model');
const Building = require('../models/building.model');
// const User = require('../models/user.model'); // Not used in this service
const Contract = require('../models/contract.model');
<<<<<<< HEAD
const Booking = require('../models/booking.model');
=======
>>>>>>> 1b7272e6f01d0861a0a926d113736381c26a7d91
const ImageService = require('./image.service');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');
const mongoose = require('mongoose');

/**
 * @class RoomService
 * @classdesc Service class for handling room operations
 */
class RoomService {
  /**
   * @route GET /api/rooms
   * @description Get all rooms with pagination and filters
   * @param {Object} queryParams - Query parameters from request
   * @param {number} queryParams.page - Page number
   * @param {number} queryParams.limit - Items per page
   * @param {string} queryParams.landlordId - Landlord ID filter
   * @param {string} queryParams.search - Search term
   * @param {string} queryParams.status - Room status filter
   * @param {string} queryParams.type - Room type filter
   * @param {string} queryParams.sortBy - Sort field
   * @returns {Promise<Object>} Rooms data with pagination
   */
  static async getAllRooms(queryParams = {}) {
    try {
      logger.info('RoomService.getAllRooms called with params:', queryParams);

      const {
        page = 1,
        limit = 10,
        landlordId,
        search,
        status,
        type,
        sortBy = 'createdAt',
        populate: _populate, // Extract populate parameter to avoid it being used as filter
        _ts: _cacheBust, // Remove cache-busting parameter
        ...otherFilters
      } = queryParams;

      const skip = (page - 1) * limit;

      logger.info('Pagination params:', {
        page: parseInt(page),
        limit: parseInt(limit),
        skip,
        landlordId,
      });

      // Build filter object
      const filters = { ...otherFilters };

      // Filter by landlord through building
      if (landlordId) {
        // Ensure landlordId is a string, not an object
        const landlordIdStr = typeof landlordId === 'string' ? landlordId : landlordId.toString();
        const buildings = await Building.find({ hostId: landlordIdStr }).select('_id');

        if (buildings.length === 0) {
          logger.warn('No buildings found for landlordId:', landlordIdStr);
          return {
            success: true,
            message: 'No rooms found for this landlord',
            data: {
              rooms: [],
              pagination: {
                total: 0,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: 0,
              },
            },
          };
        }

        const buildingIds = buildings.map((b) => b._id);
        filters.buildingId = { $in: buildingIds };
      }

      // Filter by status
      if (status && status !== 'all') {
        filters.status = status;
        logger.info('Applied status filter:', JSON.stringify(status));
      }

      // Filter by type
      if (type && type !== 'all') {
        filters.type = type;
      }

      // Search functionality
      if (search) {
        // First, find buildings that match the search term
        const buildingMatches = await Building.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { 'address.street': { $regex: search, $options: 'i' } },
            { 'address.ward': { $regex: search, $options: 'i' } },
            { 'address.district': { $regex: search, $options: 'i' } },
            { 'address.city': { $regex: search, $options: 'i' } },
          ],
        }).select('_id');

        const buildingIds = buildingMatches.map((b) => b._id);

        filters.$or = [
          { title: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
        ];

        // Add building search if any buildings match
        if (buildingIds.length > 0) {
          filters.$or.push({ buildingId: { $in: buildingIds } });
        }
      }

      // Build sort object
      let sort = {};
      switch (sortBy) {
        case 'name':
        case 'title':
          sort = { title: 1, name: 1 };
          break;
        case 'price':
          sort = { 'price.rent': 1 };
          break;
        case 'area':
          sort = { area: 1 };
          break;
        case 'roomCode':
        case 'code':
          sort = { code: 1 };
          break;
        default:
          sort = { createdAt: -1 };
      }

      logger.info('Final filters applied:', filters);

      const query = Room.find(filters);

      // Debug: Log the actual query
      logger.info('MongoDB query:', query.getQuery());

      const [rooms, total] = await Promise.all([
        query
          .skip(skip)
          .limit(parseInt(limit))
          .sort(sort)
          .populate('buildingId', 'name address hostId createdAt')
          .populate({
            path: 'buildingId',
            populate: {
              path: 'hostId',
              select: 'name email phone avatar createdAt rating isVerified',
            },
          })
          .populate('currentTenant', 'name email phone avatar idCard occupation')
          .lean(),
        Room.countDocuments(filters),
      ]);

      logger.info(`Found rooms: ${rooms.length}, Total: ${total}`);

      return {
        success: true,
        data: {
          rooms,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
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

      const room = await Room.findById(roomId)
        .populate('buildingId', 'name address hostId createdAt')
        .populate({
          path: 'buildingId',
          populate: {
            path: 'hostId',
            select: 'name email phone avatar createdAt rating isVerified',
          },
        })
        .populate('currentTenant', 'name email phone avatar idCard occupation')
        .lean();
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

      // Handle buildingId - if not provided, find first building of landlord
      if (!roomData.buildingId && roomData.landlordId) {
        logger.info('RoomService: No buildingId provided, finding building for landlordId', {
          landlordId: roomData.landlordId,
        });

        if (!mongoose.Types.ObjectId.isValid(roomData.landlordId)) {
          logger.error('RoomService: Invalid landlord ID format', {
            landlordId: roomData.landlordId,
          });
          throw new ValidationError('Invalid landlord ID format');
        }

        const building = await Building.findOne({ hostId: roomData.landlordId });
        if (!building) {
          logger.error('RoomService: No building found for landlord', {
            landlordId: roomData.landlordId,
          });
          throw new ValidationError(
            'No building found for this landlord. Please create a building first.'
          );
        }

        roomData.buildingId = building._id;
        logger.info('RoomService: Found building for landlord', {
          buildingId: building._id,
          buildingName: building.name,
        });
      }

      //Validate ObjectId format for buildingId
      if (!roomData.buildingId || !mongoose.Types.ObjectId.isValid(roomData.buildingId)) {
        logger.error('RoomService: Invalid or missing building ID', {
          buildingId: roomData.buildingId,
        });
        throw new ValidationError('Valid building ID is required');
      }

      // Parse JSON strings to objects if needed
      if (roomData.price && typeof roomData.price === 'string') {
        try {
          roomData.price = JSON.parse(roomData.price);
        } catch (error) {
          logger.error('RoomService: Failed to parse price JSON', {
            price: roomData.price,
            error: error.message,
          });
          throw new ValidationError('Invalid price format');
        }
      }

      if (roomData.features && typeof roomData.features === 'string') {
        try {
          roomData.features = JSON.parse(roomData.features);
        } catch (error) {
          logger.error('RoomService: Failed to parse features JSON', {
            features: roomData.features,
            error: error.message,
          });
          throw new ValidationError('Invalid features format');
        }
      }

      if (roomData.amenities && typeof roomData.amenities === 'string') {
        try {
          roomData.amenities = JSON.parse(roomData.amenities);
        } catch (error) {
          logger.error('RoomService: Failed to parse amenities JSON', {
            amenities: roomData.amenities,
            error: error.message,
          });
          throw new ValidationError('Invalid amenities format');
        }
      }

      // Remove landlordId from roomData as it's not part of Room schema
      const { landlordId: _landlordId, ...roomDataToSave } = roomData;

      //Create room
      const newRoom = new Room(roomDataToSave);
      await newRoom.save();
      logger.info('RoomService: Room created successfully', { roomId: newRoom._id });

      // Populate building data before returning
      const populatedRoom = await Room.findById(newRoom._id)
        .populate('buildingId', 'name address hostId createdAt')
        .populate({
          path: 'buildingId',
          populate: {
            path: 'hostId',
            select: 'name email phone avatar createdAt rating isVerified',
          },
        })
        .lean();

      return populatedRoom;
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

      // Parse JSON strings to objects if needed
      if (updateData.price && typeof updateData.price === 'string') {
        try {
          updateData.price = JSON.parse(updateData.price);
        } catch (error) {
          logger.error('RoomService: Failed to parse price JSON', {
            price: updateData.price,
            error: error.message,
          });
          throw new ValidationError('Invalid price format');
        }
      }

      if (updateData.features && typeof updateData.features === 'string') {
        try {
          updateData.features = JSON.parse(updateData.features);
        } catch (error) {
          logger.error('RoomService: Failed to parse features JSON', {
            features: updateData.features,
            error: error.message,
          });
          throw new ValidationError('Invalid features format');
        }
      }

      if (updateData.amenities) {
        try {
          // Parse amenities if it's a string
          let amenitiesArray = updateData.amenities;
          if (typeof updateData.amenities === 'string') {
            amenitiesArray = JSON.parse(updateData.amenities);
          }

          // Convert amenities array to utilities array
          updateData.utilities = amenitiesArray.map((amenity) => ({
            name: amenity,
            description: '',
            isAvailable: true,
          }));

          // Remove amenities field as it's not part of Room schema
          delete updateData.amenities;

          logger.info('RoomService: Converted amenities to utilities', {
            amenities: amenitiesArray,
            utilities: updateData.utilities,
          });
        } catch (error) {
          logger.error('RoomService: Failed to parse amenities JSON', {
            amenities: updateData.amenities,
            error: error.message,
          });
          throw new ValidationError('Invalid amenities format');
        }
      }

      // Handle image updates
      if (updateData.newImages || updateData.existingImages) {
        // Get current room to access existing images
        const currentRoom = await Room.findById(roomId);
        if (!currentRoom) {
          throw new NotFoundError(`Room with id ${roomId} not found`);
        }

        // Parse existingImages if it's a string
        let existingToKeep = [];
        if (updateData.existingImages) {
          try {
            existingToKeep =
              typeof updateData.existingImages === 'string'
                ? JSON.parse(updateData.existingImages)
                : updateData.existingImages;
          } catch (error) {
            logger.error('Failed to parse existingImages:', error);
          }
        }

        // Process image updates
        const finalImages = await ImageService.processImageUpdate(
          currentRoom.images || [],
          updateData.newImages || [],
          existingToKeep
        );

        // Update images in updateData
        updateData.images = finalImages;

        // Remove temporary fields
        delete updateData.newImages;
        delete updateData.existingImages;
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
   * Delete specific image from room
   * @param {string} roomId - Room ID
   * @param {string} imageId - Image public_id to delete
   * @returns {Promise<Object>} Updated room
   */
  static async deleteRoomImage(roomId, imageId) {
    try {
      logger.info('RoomService: Deleting room image', { roomId, imageId });

      // Validate room ID
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ValidationError('Invalid room ID format');
      }

      // Get current room
      const room = await Room.findById(roomId);
      if (!room) {
        throw new NotFoundError(`Room with id ${roomId} not found`);
      }

      // Find image to delete
      const imageToDelete = room.images.find((img) => img.public_id === imageId);
      if (!imageToDelete) {
        throw new NotFoundError(`Image with public_id ${imageId} not found in room`);
      }

      // Delete from Cloudinary
      await ImageService.replaceImages([imageToDelete], []);

      // Remove image from room
      const updatedImages = room.images.filter((img) => img.public_id !== imageId);

      // Update room
      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        { images: updatedImages },
        { new: true }
      );

      logger.info('RoomService: Room image deleted successfully', { roomId, imageId });
      return updatedRoom.toObject();
    } catch (error) {
      logger.error('Error deleting room image:', {
        error: error.message,
        stack: error.stack,
        roomId,
        imageId,
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

<<<<<<< HEAD
      // Check if room has current tenant or is rented
      if (room.currentTenant || room.status === 'rented') {
        logger.error('RoomService: Cannot delete room with active tenant', {
          roomId,
          currentTenant: room.currentTenant,
          status: room.status,
        });
        throw new ValidationError('Cannot delete room that has an active tenant. Please terminate the rental contract first.');
      }

      // Check for active contracts
      const activeContract = await Contract.findOne({
        roomId: roomId,
        status: { $in: ['active', 'pending'] },
      });

      if (activeContract) {
        logger.error('RoomService: Cannot delete room with active contract', {
          roomId,
          contractId: activeContract._id,
          contractStatus: activeContract.status,
        });
        throw new ValidationError('Cannot delete room that has an active or pending contract. Please terminate the contract first.');
      }

      // Check for active bookings
      const activeBooking = await Booking.findOne({
        roomId: roomId,
        status: { $in: ['confirmed', 'pending', 'checked_in'] },
      });

      if (activeBooking) {
        logger.error('RoomService: Cannot delete room with active booking', {
          roomId,
          bookingId: activeBooking._id,
          bookingStatus: activeBooking.status,
        });
        throw new ValidationError('Cannot delete room that has an active booking. Please cancel or complete the booking first.');
      }

=======
>>>>>>> 1b7272e6f01d0861a0a926d113736381c26a7d91
      await Promise.all([
        Building.findByIdAndUpdate(room.buildingId, {
          $inc: { availableRooms: 1 },
        }),
        Room.findByIdAndDelete(roomId),
      ]);

<<<<<<< HEAD
      logger.info('RoomService: Room deleted successfully', { roomId });
=======
>>>>>>> 1b7272e6f01d0861a0a926d113736381c26a7d91
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
  static async searchRooms(keyword, { page = 1, limit = 10, landlordId } = {}) {
    try {
      const skip = (page - 1) * limit;

      // First, find buildings that match the search term
      const buildingMatches = await Building.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { 'address.street': { $regex: keyword, $options: 'i' } },
          { 'address.ward': { $regex: keyword, $options: 'i' } },
          { 'address.district': { $regex: keyword, $options: 'i' } },
          { 'address.city': { $regex: keyword, $options: 'i' } },
        ],
      }).select('_id');

      const buildingIds = buildingMatches.map((b) => b._id);

      // Create search query for room fields
      const roomSearchQuery = {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { code: { $regex: keyword, $options: 'i' } },
          { 'utilities.name': { $regex: keyword, $options: 'i' } },
          { status: { $regex: keyword, $options: 'i' } },
        ],
      };

      // Add building search if any buildings match
      if (buildingIds.length > 0) {
        roomSearchQuery.$or.push({ buildingId: { $in: buildingIds } });
      }

      const ownerFilter = {};
      if (landlordId) {
        const buildings = await Building.find({ hostId: landlordId }).select('_id');
        const buildingIds = buildings.map((b) => b._id);
        ownerFilter.buildingId = { $in: buildingIds };
      }

      const [rooms, total] = await Promise.all([
        Room.find({ ...roomSearchQuery, ...ownerFilter })
          .skip(skip)
          .limit(limit)
          .populate('buildingId', 'name address hostId createdAt')
          .lean(),
        Room.countDocuments({ ...roomSearchQuery, ...ownerFilter }),
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

  /**
   * Get contract information for a room
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Contract data with tenant information
   */
  static async getRoomContractInfo(roomId) {
    try {
      logger.info('RoomService: Getting contract info for room', { roomId });

      if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ValidationError('Invalid room ID format');
      }

      // Find active contract for this room
      const contract = await Contract.findOne({
        roomId,
        status: { $in: ['active', 'pending'] },
      })
        .populate('renterId', 'name email phone avatar idCard occupation')
        .populate('roomId', 'name roomCode price')
        .populate('buildingId', 'name address')
        .lean();

      if (!contract) {
        return {
          success: true,
          data: null,
          message: 'No active contract found for this room',
        };
      }

      return {
        success: true,
        data: contract,
        message: 'Contract information retrieved successfully',
      };
    } catch (error) {
      logger.error('Error getting room contract info:', error);
      throw error;
    }
  }
}

module.exports = RoomService;