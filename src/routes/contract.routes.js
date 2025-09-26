/**
 * @fileoverview Contract Routes - Handles contract operations
 * @created 2025-09-22
 * @file contract.routes.js
 * @description Defines the routes for contract operations.
 */

const express = require('express');
const router = express.Router();
const {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getContractsByUserId,
  getContractsByRoomId,
  terminateContract,
  updateSignatures,
  getContractsByHostId,
} = require('../controllers/contract.controller');
const { auth, roleMiddleware } = require('../middlewares/auth.middleware');

// Public reads if needed; keep protected similar to bookings
router.get('/', auth, roleMiddleware('admin'), getAllContracts);
router.get('/:id', auth, getContractById);
router.get('/user/:userId', auth, getContractsByUserId);
router.get('/room/:roomId', auth, getContractsByRoomId);
router.get('/host/:hostId', auth, roleMiddleware('landlord', 'admin'), getContractsByHostId);

// Protected writes
router.post('/', auth, roleMiddleware('landlord', 'admin'), createContract);
router.put('/:id', auth, roleMiddleware('landlord', 'admin'), updateContract);
router.delete('/:id', auth, roleMiddleware('landlord', 'admin'), deleteContract);
router.put('/:id/terminate', auth, roleMiddleware('landlord', 'admin'), terminateContract);
router.put('/:id/signatures', auth, updateSignatures);

module.exports = router;
