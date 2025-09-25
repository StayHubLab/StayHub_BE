/**
 * @fileoverview Contract Controller - Handles HTTP requests for contracts
 * @created 2025-09-22
 * @file contract.controller.js
 * @description Manages contract endpoints including CRUD and useful getters.
 */

const mongoose = require('mongoose');
const ContractService = require('../services/contract.service');
const logger = require('../utils/logger');

// GET /api/contracts
exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await ContractService.getAllContracts(req.query);
    res
      .status(200)
      .json({ success: true, message: 'Contracts retrieved successfully', data: contracts });
  } catch (error) {
    logger.error('Error getting all contracts:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error getting all contracts', error: error.message });
  }
};

// GET /api/contracts/:id
exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await ContractService.getContractById(id);
    res
      .status(200)
      .json({ success: true, message: 'Contract retrieved successfully', data: contract });
  } catch (error) {
    logger.error('Error getting contract by id:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error getting contract by id', error: error.message });
  }
};

// POST /api/contracts
exports.createContract = async (req, res) => {
  try {
    const created = await ContractService.createContract(req.body);
    res
      .status(201)
      .json({ success: true, message: 'Contract created successfully', data: created });
  } catch (error) {
    logger.error('Error creating contract:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error creating contract', error: error.message });
  }
};

// PUT /api/contracts/:id
exports.updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ContractService.updateContract(id, req.body);
    res
      .status(200)
      .json({ success: true, message: 'Contract updated successfully', data: updated });
  } catch (error) {
    logger.error('Error updating contract:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error updating contract', error: error.message });
  }
};

// DELETE /api/contracts/:id
exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContractService.deleteContract(id);
    res
      .status(200)
      .json({ success: true, message: 'Contract deleted successfully', data: deleted });
  } catch (error) {
    logger.error('Error deleting contract:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error deleting contract', error: error.message });
  }
};

// GET /api/contracts/user/:userId
exports.getContractsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    const contracts = await ContractService.getContractsByUserId(userId);
    res
      .status(200)
      .json({ success: true, message: 'Contracts retrieved successfully', data: contracts });
  } catch (error) {
    logger.error('Error getting contracts by user ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting contracts by user ID',
      error: error.message,
    });
  }
};

// GET /api/contracts/room/:roomId
exports.getContractsByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ success: false, message: 'Invalid room ID format' });
    }
    const contracts = await ContractService.getContractsByRoomId(roomId);
    res
      .status(200)
      .json({ success: true, message: 'Contracts retrieved successfully', data: contracts });
  } catch (error) {
    logger.error('Error getting contracts by room ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting contracts by room ID',
      error: error.message,
    });
  }
};

// PUT /api/contracts/:id/terminate
exports.terminateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, requestedBy } = req.body;
    const terminated = await ContractService.terminateContract(id, { reason, requestedBy });
    res
      .status(200)
      .json({ success: true, message: 'Contract terminated successfully', data: terminated });
  } catch (error) {
    logger.error('Error terminating contract:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error terminating contract', error: error.message });
  }
};
