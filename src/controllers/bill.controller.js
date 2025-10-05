/**
 * @fileoverview Bill Controller - Handles HTTP requests for bills
 * @created 2025-09-22
 * @file bill.controller.js
 * @description Manages bill endpoints including CRUD and useful getters.
 */

const mongoose = require('mongoose');
const BillService = require('../services/bill.service');
const logger = require('../utils/logger');

// GET /api/bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await BillService.getAllBills(req.query);
    res.status(200).json({ success: true, message: 'Bills retrieved successfully', data: bills });
  } catch (error) {
    logger.error('Error getting all bills:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error getting all bills', error: error.message });
  }
};

// GET /api/bills/:id
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await BillService.getBillById(id);
    res.status(200).json({ success: true, message: 'Bill retrieved successfully', data: bill });
  } catch (error) {
    logger.error('Error getting bill by id:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error getting bill by id', error: error.message });
  }
};

// POST /api/bills
exports.createBill = async (req, res) => {
  try {
    // Automatically set createdBy to the authenticated landlord
    const billData = {
      ...req.body,
      createdBy: req.user._id // Get landlord ID from authenticated user
    };
    
    const created = await BillService.createBill(billData);
    res.status(201).json({ success: true, message: 'Bill created successfully', data: created });
  } catch (error) {
    logger.error('Error creating bill:', error);
    res.status(500).json({ success: false, message: 'Error creating bill', error: error.message });
  }
};

// PUT /api/bills/:id
exports.updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await BillService.updateBill(id, req.body);
    res.status(200).json({ success: true, message: 'Bill updated successfully', data: updated });
  } catch (error) {
    logger.error('Error updating bill:', error);
    res.status(500).json({ success: false, message: 'Error updating bill', error: error.message });
  }
};

// DELETE /api/bills/:id
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BillService.deleteBill(id);
    res.status(200).json({ success: true, message: 'Bill deleted successfully', data: deleted });
  } catch (error) {
    logger.error('Error deleting bill:', error);
    res.status(500).json({ success: false, message: 'Error deleting bill', error: error.message });
  }
};

// GET /api/bills/contract/:contractId
exports.getBillsByContractId = async (req, res) => {
  try {
    const { contractId } = req.params;
    if (!contractId || !mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ success: false, message: 'Invalid contract ID format' });
    }
    const bills = await BillService.getBillsByContractId(contractId);
    res.status(200).json({ success: true, message: 'Bills retrieved successfully', data: bills });
  } catch (error) {
    logger.error('Error getting bills by contract ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting bills by contract ID',
      error: error.message,
    });
  }
};

// PUT /api/bills/:id/pay
exports.markBillPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paidAt } = req.body || {};
    const paid = await BillService.markBillPaid(id, { paymentMethod, paidAt });
    res.status(200).json({ success: true, message: 'Bill marked as paid', data: paid });
  } catch (error) {
    logger.error('Error marking bill as paid:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error marking bill as paid', error: error.message });
  }
};

// GET /api/bills/renter/:renterId
exports.getBillsByRenterId = async (req, res) => {
  try {
    const { renterId } = req.params;
    const { status } = req.query;
    const bills = await BillService.getBillsByRenterId(renterId, { status });
    res.status(200).json({ success: true, message: 'Bills retrieved successfully', data: bills });
  } catch (error) {
    logger.error('Error getting bills by renter ID:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error getting bills by renter ID', error: error.message });
  }
};

// GET /api/bills/host/:hostId
exports.getBillsByHostId = async (req, res) => {
  try {
    const { hostId } = req.params;
    if (!hostId || !mongoose.Types.ObjectId.isValid(hostId)) {
      return res.status(400).json({ success: false, message: 'Invalid host ID format' });
    }
    const bills = await BillService.getBillsByHostId(hostId);
    res.status(200).json({ success: true, message: 'Bills retrieved successfully', data: bills });
  } catch (error) {
    logger.error('Error getting bills by host ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting bills by host ID',
      error: error.message,
    });
  }
};
