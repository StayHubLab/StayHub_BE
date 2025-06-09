/**
 * @fileoverview Building Routes - Handles building operations
 * @created 2025-05-29
 * @file building.routes.js
 * @description This file defines the routes for building operations.
 * It includes routes for building registration, login, logout, profile management, and email verification.
 */

const express = require('express');
const router = express.Router();
const {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getRoomsByBuildingId,
} = require('../controllers/building.controller');
const { auth, roleMiddleware } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', getAllBuildings);
router.get('/:id', getBuildingById);
router.get('/:id/rooms', getRoomsByBuildingId);

// Protected routes
router.post('/', auth, roleMiddleware('landlord', 'admin'), createBuilding);
router.put('/:id', auth, roleMiddleware('landlord', 'admin'), updateBuilding);
router.delete('/:id', auth, roleMiddleware('landlord', 'admin'), deleteBuilding);

module.exports = router;
