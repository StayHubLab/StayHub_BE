/**
 * @fileoverview Review Validation - Input validation middleware
 * @created 2025-10-05
 * @file review.validation.js
 * @description Validates review-related requests
 */

const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Custom validator for MongoDB ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Validation rules for creating a review
const validateCreateReview = [
  body('targetType')
    .trim()
    .notEmpty().withMessage('Target type is required')
    .isIn(['room', 'landlord']).withMessage('Target type must be either "room" or "landlord"'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),

  // Conditional validation for roomId
  body('roomId')
    .if(body('targetType').equals('room'))
    .notEmpty().withMessage('Room ID is required for room reviews')
    .custom(isValidObjectId).withMessage('Invalid room ID format'),

  // Conditional validation for landlordId
  body('landlordId')
    .if(body('targetType').equals('landlord'))
    .notEmpty().withMessage('Landlord ID is required for landlord reviews')
    .custom(isValidObjectId).withMessage('Invalid landlord ID format'),

  body('contractId')
    .optional()
    .custom(isValidObjectId).withMessage('Invalid contract ID format'),

  handleValidationErrors
];

// Validation rules for updating a review
const validateUpdateReview = [
  param('reviewId')
    .trim()
    .notEmpty().withMessage('Review ID is required')
    .custom(isValidObjectId).withMessage('Invalid review ID format'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),

  // Ensure at least one field is being updated
  body()
    .custom((value, { req }) => {
      if (!req.body.rating && !req.body.comment) {
        throw new Error('At least one field (rating or comment) must be provided for update');
      }
      return true;
    }),

  handleValidationErrors
];

// Validation rules for deleting a review
const validateDeleteReview = [
  param('reviewId')
    .trim()
    .notEmpty().withMessage('Review ID is required')
    .custom(isValidObjectId).withMessage('Invalid review ID format'),

  handleValidationErrors
];

// Validation rules for getting room reviews
const validateGetRoomReviews = [
  param('roomId')
    .trim()
    .notEmpty().withMessage('Room ID is required')
    .custom(isValidObjectId).withMessage('Invalid room ID format'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'rating', '-rating']).withMessage('Invalid sort option'),

  handleValidationErrors
];

// Validation rules for getting landlord reviews
const validateGetLandlordReviews = [
  param('landlordId')
    .trim()
    .notEmpty().withMessage('Landlord ID is required')
    .custom(isValidObjectId).withMessage('Invalid landlord ID format'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'rating', '-rating']).withMessage('Invalid sort option'),

  handleValidationErrors
];

// Validation rules for getting renter's reviews
const validateGetRenterReviews = [
  param('renterId')
    .trim()
    .notEmpty().withMessage('Renter ID is required')
    .custom(isValidObjectId).withMessage('Invalid renter ID format'),

  handleValidationErrors
];

module.exports = {
  validateCreateReview,
  validateUpdateReview,
  validateDeleteReview,
  validateGetRoomReviews,
  validateGetLandlordReviews,
  validateGetRenterReviews,
};
