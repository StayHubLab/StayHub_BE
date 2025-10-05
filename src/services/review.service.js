/**
 * @fileoverview Review Service - Business logic for reviews
 * @created 2025-10-04
 * @file review.service.js
 * @description Handles review operations for both rooms and landlords
 */

const Review = require('../models/review.model');
const Room = require('../models/room.model');
const User = require('../models/user.model');
const Contract = require('../models/contract.model');

class ReviewService {
  /**
   * Create a review for a room
   * @param {Object} data - Review data
   * @returns {Object} Created review
   */
  static async createRoomReview(data) {
    const { roomId, renterId, rating, comment, contractId } = data;

    // Check if room exists and get landlord
    const room = await Room.findById(roomId).populate('buildingId');
    if (!room) {
      throw { code: 'ROOM_NOT_FOUND', message: 'Room not found' };
    }

    const landlordId = room.buildingId?.hostId;
    if (!landlordId) {
      throw { code: 'LANDLORD_NOT_FOUND', message: 'Landlord information not found for this room' };
    }

    // Check if renter already reviewed this room
    const existingReview = await Review.hasReviewedRoom(renterId, roomId);
    if (existingReview) {
      throw { code: 'REVIEW_EXISTS', message: 'You have already reviewed this room' };
    }

    // Verify contract if provided (optional verification)
    let isVerifiedRental = false;
    if (contractId) {
      const contract = await Contract.findOne({
        _id: contractId,
        roomId,
        renterId,
        status: { $in: ['active', 'completed'] }
      });
      isVerifiedRental = !!contract;
    }

    // Create review
    const review = await Review.create({
      targetType: 'room',
      roomId,
      landlordId,
      renterId,
      rating,
      comment,
      contractId,
      isVerifiedRental
    });

    await review.populate([
      { path: 'roomId', select: 'name images price' },
      { path: 'renterId', select: 'name email avatar' }
    ]);

    return review;
  }

  /**
   * Create a review for a landlord
   * @param {Object} data - Review data
   * @returns {Object} Created review
   */
  static async createLandlordReview(data) {
    const { landlordId, renterId, rating, comment } = data;

    // Check if landlord exists and has role 'landlord'
    const landlord = await User.findById(landlordId);
    if (!landlord) {
      throw { code: 'LANDLORD_NOT_FOUND', message: 'Landlord not found' };
    }

    if (landlord.role !== 'landlord') {
      throw { code: 'INVALID_LANDLORD', message: 'This user is not a landlord' };
    }

    // Check if renter already reviewed this landlord
    const existingReview = await Review.hasReviewedLandlord(renterId, landlordId);
    if (existingReview) {
      throw { code: 'REVIEW_EXISTS', message: 'You have already reviewed this landlord' };
    }

    // Verify that renter has rented from this landlord before
    const hasRented = await Contract.exists({
      renterId,
      landlordId,
      status: { $in: ['active', 'completed'] }
    });

    if (!hasRented) {
      throw { 
        code: 'NOT_ELIGIBLE', 
        message: 'You can only review landlords you have rented from' 
      };
    }

    // Create review
    const review = await Review.create({
      targetType: 'landlord',
      landlordId,
      renterId,
      rating,
      comment,
      isVerifiedRental: true // Always verified since we checked contract
    });

    await review.populate([
      { path: 'landlordId', select: 'name email avatar' },
      { path: 'renterId', select: 'name email avatar' }
    ]);

    return review;
  }

  /**
   * Get reviews for a room
   * @param {String} roomId - Room ID
   * @param {Object} options - Query options (page, limit, sort)
   * @returns {Object} Reviews and pagination
   */
  static async getRoomReviews(roomId, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;

    const query = { roomId, targetType: 'room' };
    
    const reviews = await Review.find(query)
      .populate('renterId', 'name avatar')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);
    const averageRating = await Review.getRoomAverageRating(roomId);

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: {
        averageRating: averageRating.avgRating || 0,
        totalReviews: averageRating.totalReviews || 0
      }
    };
  }

  /**
   * Get reviews for a landlord
   * @param {String} landlordId - Landlord ID
   * @param {Object} options - Query options (page, limit, sort)
   * @returns {Object} Reviews and pagination
   */
  static async getLandlordReviews(landlordId, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;

    const query = { landlordId, targetType: 'landlord' };
    
    const reviews = await Review.find(query)
      .populate('renterId', 'name avatar')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);
    const averageRating = await Review.getLandlordAverageRating(landlordId);

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: {
        averageRating: averageRating.avgRating || 0,
        totalReviews: averageRating.totalReviews || 0
      }
    };
  }

  /**
   * Get all reviews by a renter
   * @param {String} renterId - Renter ID
   * @returns {Array} Reviews
   */
  static async getRenterReviews(renterId) {
    const reviews = await Review.find({ renterId })
      .populate('roomId', 'name images price')
      .populate('landlordId', 'name avatar')
      .sort('-createdAt');

    return reviews;
  }

  /**
   * Update a review
   * @param {String} reviewId - Review ID
   * @param {String} renterId - Renter ID (for authorization)
   * @param {Object} updateData - Update data
   * @returns {Object} Updated review
   */
  static async updateReview(reviewId, renterId, updateData) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw { code: 'REVIEW_NOT_FOUND', message: 'Review not found' };
    }

    // Only the renter who created the review can update it
    if (review.renterId.toString() !== renterId) {
      throw { code: 'UNAUTHORIZED', message: 'You can only update your own reviews' };
    }

    // Only allow updating rating and comment
    const allowedUpdates = ['rating', 'comment'];
    const updates = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    Object.assign(review, updates);
    await review.save();

    await review.populate([
      { path: 'roomId', select: 'name images price' },
      { path: 'landlordId', select: 'name avatar' },
      { path: 'renterId', select: 'name avatar' }
    ]);

    return review;
  }

  /**
   * Delete a review
   * @param {String} reviewId - Review ID
   * @param {String} renterId - Renter ID (for authorization)
   */
  static async deleteReview(reviewId, renterId) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw { code: 'REVIEW_NOT_FOUND', message: 'Review not found' };
    }

    // Only the renter who created the review can delete it
    if (review.renterId.toString() !== renterId) {
      throw { code: 'UNAUTHORIZED', message: 'You can only delete your own reviews' };
    }

    await review.deleteOne();
  }

  /**
   * Get comprehensive landlord statistics including all reviews
   * @param {String} landlordId - Landlord ID
   * @returns {Object} Complete statistics
   */
  static async getLandlordCompleteStats(landlordId) {
    // Direct landlord reviews
    const landlordReviews = await Review.getLandlordAverageRating(landlordId);
    
    // All room reviews for this landlord's rooms
    const Building = require('../models/building.model');
    const buildings = await Building.find({ hostId: landlordId });
    const buildingIds = buildings.map(b => b._id);
    const rooms = await Room.find({ buildingId: { $in: buildingIds } });
    const roomIds = rooms.map(r => r._id);
    
    const roomReviewsStats = await Review.aggregate([
      { 
        $match: { 
          roomId: { $in: roomIds }, 
          targetType: 'room' 
        } 
      },
      { 
        $group: { 
          _id: null, 
          avgRating: { $avg: '$rating' }, 
          totalReviews: { $sum: 1 } 
        } 
      }
    ]);

    const roomStats = roomReviewsStats[0] || { avgRating: 0, totalReviews: 0 };

    return {
      landlordReviews: {
        averageRating: landlordReviews.avgRating || 0,
        totalReviews: landlordReviews.totalReviews || 0
      },
      roomReviews: {
        averageRating: roomStats.avgRating || 0,
        totalReviews: roomStats.totalReviews || 0
      },
      overall: {
        totalReviews: (landlordReviews.totalReviews || 0) + (roomStats.totalReviews || 0),
        averageRating: ((landlordReviews.avgRating || 0) + (roomStats.avgRating || 0)) / 2
      }
    };
  }
}

module.exports = ReviewService;