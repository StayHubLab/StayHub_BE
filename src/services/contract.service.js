/**
 * @fileoverview Contract Service - Handles contract operations
 * @created 2025-09-22
 * @file contract.service.js
 * @description Service for managing contract data and operations
 */

const mongoose = require('mongoose');
const Contract = require('../models/contract.model');
const { ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class ContractService {
  static async getAllContracts({ page = 1, limit = 10, filters = {} } = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = Contract.find(filters);
      const [contracts, total] = await Promise.all([
        query.skip(skip).limit(limit).lean(),
        Contract.countDocuments(filters),
      ]);
      return {
        contracts,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('ContractService: Error getting all contracts:', error);
      throw error;
    }
  }

  static async getContractById(contractId) {
    try {
      if (!contractId || !mongoose.Types.ObjectId.isValid(contractId)) {
        throw new ValidationError('Invalid contract ID format');
      }
      const contract = await Contract.findById(contractId).lean();
      if (!contract) {
        throw new NotFoundError(`Contract with id ${contractId} not found`);
      }
      return contract;
    } catch (error) {
      logger.error('ContractService: Error getting contract by id:', error);
      throw error;
    }
  }

  static async createContract(contractData) {
    try {
      if (!contractData) {
        throw new ValidationError('Contract data is required');
      }
      const created = await Contract.create(contractData);
      return created.toObject();
    } catch (error) {
      logger.error('ContractService: Error creating contract:', error);
      throw error;
    }
  }

  static async updateContract(contractId, updateData) {
    try {
      if (!contractId || !mongoose.Types.ObjectId.isValid(contractId)) {
        throw new ValidationError('Invalid contract ID format');
      }
      if (!updateData || Object.keys(updateData).length === 0) {
        throw new ValidationError('Update data is required');
      }
      const updated = await Contract.findByIdAndUpdate(
        contractId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!updated) {
        throw new NotFoundError(`Contract with id ${contractId} not found`);
      }
      return updated.toObject();
    } catch (error) {
      logger.error('ContractService: Error updating contract:', error);
      throw error;
    }
  }

  static async deleteContract(contractId) {
    try {
      if (!contractId || !mongoose.Types.ObjectId.isValid(contractId)) {
        throw new ValidationError('Invalid contract ID format');
      }
      const deleted = await Contract.findByIdAndDelete(contractId);
      if (!deleted) {
        throw new NotFoundError(`Contract with id ${contractId} not found`);
      }
      return deleted.toObject();
    } catch (error) {
      logger.error('ContractService: Error deleting contract:', error);
      throw error;
    }
  }

  static async getContractsByUserId(userId) {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ValidationError('Invalid user ID format');
      }
      const contracts = await Contract.find({ renterId: userId }).lean();
      return contracts;
    } catch (error) {
      logger.error('ContractService: Error getting contracts by user id:', error);
      throw error;
    }
  }

  static async getContractsByRoomId(roomId) {
    try {
      if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ValidationError('Invalid room ID format');
      }
      const contracts = await Contract.find({ roomId }).lean();
      return contracts;
    } catch (error) {
      logger.error('ContractService: Error getting contracts by room id:', error);
      throw error;
    }
  }

  static async terminateContract(contractId, { reason, requestedBy } = {}) {
    try {
      if (!contractId || !mongoose.Types.ObjectId.isValid(contractId)) {
        throw new ValidationError('Invalid contract ID format');
      }
      const update = {
        status: 'terminated',
        termination: {
          reason: reason || 'terminated',
          requestedBy:
            requestedBy && mongoose.Types.ObjectId.isValid(requestedBy) ? requestedBy : undefined,
          requestedAt: new Date(),
          approvedAt: new Date(),
        },
      };
      const terminated = await Contract.findByIdAndUpdate(contractId, update, { new: true });
      if (!terminated) {
        throw new NotFoundError(`Contract with id ${contractId} not found`);
      }
      return terminated.toObject();
    } catch (error) {
      logger.error('ContractService: Error terminating contract:', error);
      throw error;
    }
  }
}

module.exports = ContractService;

