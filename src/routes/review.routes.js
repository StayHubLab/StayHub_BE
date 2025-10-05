/**
 * @fileoverview Review Routes - API endpoints for reviews
 * @created 2025-10-05
 * @file review.routes.js
 * @description Routes for room and landlord reviews with authentication and validation
 */

const express = require('express');
const reviewController = require('../controllers/review.controller');
const { auth, roleMiddleware } = require('../middlewares/auth.middleware');
const {
  validateCreateReview,
  validateUpdateReview,
  validateDeleteReview,
  validateGetRoomReviews,
  validateGetLandlordReviews,
  validateGetRenterReviews
} = require('../validations/review.validation');

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Create a new review (room or landlord)
 * @access  Private (Renter only)
 * @body    {targetType, roomId?, landlordId?, rating, comment, contractId?}
 */
router.post(
  '/',
  auth,
  roleMiddleware('renter'),
  validateCreateReview,
  reviewController.createReview
);

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update a review
 * @access  Private (Review owner only)
 * @body    {rating?, comment?}
 */
router.put(
  '/:reviewId',
  auth,
  roleMiddleware('renter'),
  validateUpdateReview,
  reviewController.updateReview
);

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete a review
 * @access  Private (Review owner only)
 */
router.delete(
  '/:reviewId',
  auth,
  roleMiddleware('renter'),
  validateDeleteReview,
  reviewController.deleteReview
);

/**
 * @route   GET /api/reviews/room/:roomId
 * @desc    Get all reviews for a specific room with statistics
 * @access  Public
 * @query   {page?, limit?, sort?}
 */
router.get(
  '/room/:roomId',
  validateGetRoomReviews,
  reviewController.getRoomReviews
);

/**
 * @route   GET /api/reviews/landlord/:landlordId
 * @desc    Get all reviews for a specific landlord with statistics
 * @access  Public
 * @query   {page?, limit?, sort?}
 */
router.get(
  '/landlord/:landlordId',
  validateGetLandlordReviews,
  reviewController.getLandlordReviews
);

/**
 * @route   GET /api/reviews/landlord/:landlordId/stats
 * @desc    Get complete statistics for a landlord (all rooms + landlord reviews)
 * @access  Public
 */
router.get(
  '/landlord/:landlordId/stats',
  validateGetLandlordReviews,
  reviewController.getLandlordCompleteStats
);

/**
 * @route   GET /api/reviews/renter/:renterId
 * @desc    Get all reviews by a specific renter
 * @access  Private (Own reviews only, or admin)
 */
router.get(
  '/renter/:renterId',
  auth,
  validateGetRenterReviews,
  reviewController.getRenterReviews
);

module.exports = router;
