/**
 * @fileoverview Payment Controller - Handles manual payment verification
 * @created 2025-10-05
 * @file payment.controller.js
 * @description Controller for manual bank transfer payment verification
 */

const BillService = require('../services/bill.service');
const Bill = require('../models/bill.model');
const cloudinaryService = require('../services/cloudinary.service');
const logger = require('../utils/logger');

/**
 * Upload payment evidence
 * @route POST /api/payments/upload-evidence
 * @access Renter only
 */
exports.uploadPaymentEvidence = async (req, res) => {
  try {
    const { billId } = req.body;
    const userId = req.user._id;

    if (!billId) {
      return res.status(400).json({
        success: false,
        message: 'Bill ID is required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment evidence file is required',
      });
    }

    // Upload to Cloudinary
    let evidenceUrl;
    try {
      const result = await cloudinaryService.uploadImage(req.file.path, {
        folder: 'stayhub/payment-evidence',
        resource_type: 'auto', // Accepts images and PDFs
      });
      evidenceUrl = result.data.secure_url;
    } catch (uploadError) {
      logger.error('Cloudinary upload failed:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload payment evidence',
        error: uploadError.message,
      });
    }

    // Save evidence URL to bill
    const updatedBill = await BillService.uploadPaymentEvidence(billId, evidenceUrl, userId);

    res.json({
      success: true,
      message: 'Payment evidence uploaded successfully',
      data: updatedBill,
    });
  } catch (error) {
    logger.error('Payment evidence upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload payment evidence',
    });
  }
};

/**
 * Get payment evidence details
 * @route GET /api/payments/:paymentId
 * @access Authenticated users
 */
exports.getPaymentEvidence = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const bill = await Bill.findById(paymentId)
      .populate('contractId')
      .populate('renterId', 'name email phone')
      .populate('landlordId', 'name email phone')
      .populate('reviewedBy', 'name email');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Authorization check
    const isRenter = bill.renterId && bill.renterId._id.toString() === userId.toString();
    const isLandlord = bill.landlordId && bill.landlordId._id.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isRenter && !isLandlord && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this payment',
      });
    }

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    logger.error('Get payment evidence error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment details',
    });
  }
};

/**
 * Approve payment evidence
 * @route PUT /api/payments/:paymentId/approve
 * @access Landlord only
 */
exports.approvePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { notes } = req.body;
    const landlordId = req.user._id;

    const approvedBill = await BillService.approvePayment(paymentId, landlordId, notes);

    res.json({
      success: true,
      message: 'Payment approved successfully',
      data: approvedBill,
    });
  } catch (error) {
    logger.error('Approve payment error:', error);
    res.status(error.code === 'VALIDATION_ERROR' ? 400 : 500).json({
      success: false,
      message: error.message || 'Failed to approve payment',
    });
  }
};

/**
 * Reject payment evidence
 * @route PUT /api/payments/:paymentId/reject
 * @access Landlord only
 */
exports.rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const landlordId = req.user._id;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const rejectedBill = await BillService.rejectPayment(paymentId, landlordId, reason);

    res.json({
      success: true,
      message: 'Payment rejected successfully',
      data: rejectedBill,
    });
  } catch (error) {
    logger.error('Reject payment error:', error);
    res.status(error.code === 'VALIDATION_ERROR' ? 400 : 500).json({
      success: false,
      message: error.message || 'Failed to reject payment',
    });
  }
};

/**
 * Get payments by approval status
 * @route GET /api/payments/status/:status
 * @access Landlord only
 */
exports.getPaymentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const landlordId = req.user._id;

    const bills = await BillService.getPaymentsByApprovalStatus(landlordId, status);

    res.json({
      success: true,
      data: bills,
      count: bills.length,
    });
  } catch (error) {
    logger.error('Get payments by status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payments',
    });
  }
};

/**
 * Get renter's own payment history
 * @route GET /api/payments/my-payments
 * @access Renter only
 */
exports.getMyPayments = async (req, res) => {
  try {
    const renterId = req.user._id;
    const { status } = req.query;

    const bills = await BillService.getBillsByRenterId(renterId, { status });

    res.json({
      success: true,
      data: bills,
      count: bills.length,
    });
  } catch (error) {
    logger.error('Get my payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment history',
    });
  }
};
