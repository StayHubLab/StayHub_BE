/**
 * @fileoverview Review Controller - Handles HTTP requests for reviews
 * @created 2025-10-05
 * @file review.controller.js
 * @description Controller layer for review operations
 */

const ReviewService = require('../services/review.service');
const logger = require('../utils/logger');

/**
 * Create a new review (room or landlord)
 * @route POST /api/reviews
 * @access Private (Renter only)
 */
exports.createReview = async (req, res) => {
  try {
    const { targetType, roomId, landlordId, rating, comment, contractId } = req.body;
    const renterId = req.user._id; // From auth middleware

    let review;

    if (targetType === 'room') {
      review = await ReviewService.createRoomReview({
        roomId,
        renterId,
        rating,
        comment,
        contractId
      });
    } else if (targetType === 'landlord') {
      review = await ReviewService.createLandlordReview({
        landlordId,
        renterId,
        rating,
        comment
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    logger.error('Create review error:', error);

    // Handle specific error codes
    if (error.code === 'REVIEW_EXISTS') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'ROOM_NOT_FOUND' || error.code === 'LANDLORD_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'NOT_ELIGIBLE') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

/**
 * Get reviews for a specific room
 * @route GET /api/reviews/room/:roomId
 * @access Public
 */
exports.getRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page, limit, sort } = req.query;

    const result = await ReviewService.getRoomReviews(roomId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: sort || '-createdAt'
    });

    // Get rating distribution
    const Review = require('../models/review.model');
    const distribution = await Review.getRoomRatingDistribution(roomId);

    res.json({
      success: true,
      data: {
        ...result,
        statistics: {
          ...result.statistics,
          ratingDistribution: distribution
        }
      }
    });
  } catch (error) {
    logger.error('Get room reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get room reviews',
      error: error.message
    });
  }
};

/**
 * Get reviews for a specific landlord
 * @route GET /api/reviews/landlord/:landlordId
 * @access Public
 */
exports.getLandlordReviews = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { page, limit, sort } = req.query;

    const result = await ReviewService.getLandlordReviews(landlordId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: sort || '-createdAt'
    });

    // Get rating distribution
    const Review = require('../models/review.model');
    const distribution = await Review.getLandlordRatingDistribution(landlordId);

    res.json({
      success: true,
      data: {
        ...result,
        statistics: {
          ...result.statistics,
          ratingDistribution: distribution
        }
      }
    });
  } catch (error) {
    logger.error('Get landlord reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get landlord reviews',
      error: error.message
    });
  }
};

/**
 * Get all reviews by a specific renter
 * @route GET /api/reviews/renter/:renterId
 * @access Private (Only own reviews or admin)
 */
exports.getRenterReviews = async (req, res) => {
  try {
    const { renterId } = req.params;
    const currentUserId = req.user?._id;

    // Authorization check: users can only view their own reviews unless admin
    if (currentUserId && renterId !== currentUserId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own reviews'
      });
    }

    const reviews = await ReviewService.getRenterReviews(renterId);

    res.json({
      success: true,
      data: {
        total: reviews.length,
        reviews
      }
    });
  } catch (error) {
    logger.error('Get renter reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get renter reviews',
      error: error.message
    });
  }
};

/**
 * Update a review
 * @route PUT /api/reviews/:reviewId
 * @access Private (Review owner only)
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const renterId = req.user._id;

    const review = await ReviewService.updateReview(reviewId, renterId, {
      rating,
      comment
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    logger.error('Update review error:', error);

    if (error.code === 'REVIEW_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'UNAUTHORIZED') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

/**
 * Delete a review
 * @route DELETE /api/reviews/:reviewId
 * @access Private (Review owner only)
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const renterId = req.user._id;

    await ReviewService.deleteReview(reviewId, renterId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    logger.error('Delete review error:', error);

    if (error.code === 'REVIEW_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'UNAUTHORIZED') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

/**
 * Get complete statistics for a landlord
 * @route GET /api/reviews/landlord/:landlordId/stats
 * @access Public
 */
exports.getLandlordCompleteStats = async (req, res) => {
  try {
    const { landlordId } = req.params;

    const stats = await ReviewService.getLandlordCompleteStats(landlordId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get landlord stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get landlord statistics',
      error: error.message
    });
  }
};
