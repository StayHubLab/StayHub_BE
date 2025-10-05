/**
 * @fileoverview Payment Routes - Manual payment verification endpoints
 * @created 2025-10-05
 * @file payment.routes.js
 * @description Routes for manual bank transfer payment verification
 */

const express = require('express');
const router = express.Router();
const { auth, roleMiddleware } = require('../middlewares/auth.middleware');
const { handlePaymentEvidenceUpload } = require('../middlewares/upload.middleware');
const {
  uploadPaymentEvidence,
  getPaymentEvidence,
  approvePayment,
  rejectPayment,
  getPaymentsByStatus,
  getMyPayments,
} = require('../controllers/payment.controller');

// Renter uploads payment evidence
router.post('/upload-evidence', auth, handlePaymentEvidenceUpload, uploadPaymentEvidence);

// Renter gets own payment history
router.get('/my-payments', auth, getMyPayments);

// Get payments by status (for landlord dashboard)
router.get('/status/:status', auth, roleMiddleware('landlord'), getPaymentsByStatus);

// Get payment details with evidence
router.get('/:paymentId', auth, getPaymentEvidence);

// Landlord approves payment
router.put('/:paymentId/approve', auth, roleMiddleware('landlord'), approvePayment);

// Landlord rejects payment
router.put('/:paymentId/reject', auth, roleMiddleware('landlord'), rejectPayment);

module.exports = router;
