/**
 * @fileoverview Bill Routes - Handles bill operations
 * @created 2025-09-22
 * @file bill.routes.js
 * @description Defines the routes for bill operations.
 */

const express = require('express');
const router = express.Router();
const {
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  getBillsByContractId,
  markBillPaid,
} = require('../controllers/bill.controller');
const { auth, roleMiddleware } = require('../middlewares/auth.middleware');

// Protected routes
router.get('/', auth, roleMiddleware('admin'), getAllBills);
router.get('/:id', auth, getBillById);
router.get('/contract/:contractId', auth, getBillsByContractId);
router.post('/', auth, roleMiddleware('landlord', 'admin'), createBill);
router.put('/:id', auth, roleMiddleware('landlord', 'admin'), updateBill);
router.put('/:id/pay', auth, markBillPaid);
router.delete('/:id', auth, roleMiddleware('landlord', 'admin'), deleteBill);

module.exports = router;

