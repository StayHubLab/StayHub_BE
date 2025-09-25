/**
 * @fileoverview Viewing Routes - Defines viewing appointment API routes
 * @created 2025-09-25
 * @file viewing.routes.js
 * @description Routes for viewing appointment management
 */

const express = require('express');
const ViewingController = require('../controllers/viewing.controller');
const { auth, roleMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes (no authentication required for testing)

/**
 * @route GET /api/viewings
 * @description Get all viewing appointments with pagination and filters
 * @access Public (for testing) / Private (in production)
 */
router.get('/', ViewingController.getViewings);

/**
 * @route POST /api/viewings
 * @description Create a new viewing appointment
 * @access Public (for testing) / Private (in production)
 */
router.post('/', ViewingController.createViewing);

// Protected routes (require authentication)

/**
 * @route GET /api/viewings/me
 * @description Get viewing appointments for the authenticated user
 * @access Public (for testing) / Private (in production)
 */
router.get('/me', ViewingController.getMyViewings);

/**
 * @route GET /api/viewings/:id
 * @description Get a specific viewing appointment by ID
 * @access Public (for testing) / Private (in production)
 */
router.get('/:id', ViewingController.getViewingById);

/**
 * @route GET /api/viewings/user/:userId
 * @description Get viewing appointments for a specific user
 * @access Private
 */
router.get('/user/:userId', ViewingController.getViewingsByUser);

/**
 * @route GET /api/viewings/landlord/:landlordId
 * @description Get viewing appointments for a specific landlord
 * @access Private
 */
router.get('/landlord/:landlordId', ViewingController.getViewingsByLandlord);

/**
 * @route PUT /api/viewings/:id/status
 * @description Update viewing appointment status
 * @access Private
 */
router.put('/:id/status', ViewingController.updateViewingStatus);

/**
 * @route POST /api/viewings/:id/confirm
 * @description Confirm a viewing appointment (landlord only)
 * @access Private - Landlord
 */
// router.post('/:id/confirm', protect, authorize('landlord'), ViewingController.confirmViewing);
router.post('/:id/confirm', ViewingController.confirmViewing);

/**
 * @route POST /api/viewings/:id/cancel
 * @description Cancel a viewing appointment
 * @access Private
 */
// router.post('/:id/cancel', protect, ViewingController.cancelViewing);
router.post('/:id/cancel', ViewingController.cancelViewing);

/**
 * @route POST /api/viewings/:id/complete
 * @description Mark viewing appointment as completed
 * @access Private
 */
// router.post('/:id/complete', protect, ViewingController.completeViewing);
router.post('/:id/complete', ViewingController.completeViewing);

/**
 * @route DELETE /api/viewings/:id
 * @description Delete a viewing appointment
 * @access Private
 */
// router.delete('/:id', protect, ViewingController.deleteViewing);
router.delete('/:id', ViewingController.deleteViewing);

module.exports = router;
