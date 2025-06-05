/**
 * @fileoverview Building Routes - Handles building operations
 * @created 2025-05-29
 * @file building.routes.js
 * @description This file defines the routes for building operations.
 * It includes routes for building registration, login, logout, profile management, and email verification.
 */

import express from 'express';
import * as buildingController from '../controllers/building.controller';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();
const {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  // updateBuilding,
  // deleteBuilding,
} = buildingController;

// Public routes
router.get('/', getAllBuildings);
router.get('/:id', getBuildingById);

// Protected routes
router.post('/', auth, createBuilding);
// router.put('/:id', auth, updateBuilding);
// router.delete('/:id', auth, deleteBuilding);

export default router;
