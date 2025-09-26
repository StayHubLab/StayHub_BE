/**
 * @fileoverview Bill Service - Handles bill operations
 * @created 2025-09-22
 * @file bill.service.js
 * @description Service for managing bill data and operations
 */

const mongoose = require('mongoose');
const Bill = require('../models/bill.model');
const Contract = require('../models/contract.model');
const Room = require('../models/room.model');
const User = require('../models/user.model');
const EmailService = require('./email.service');
const { ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class BillService {
  static async getAllBills({ page = 1, limit = 10, filters = {} } = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = Bill.find(filters);
      const [bills, total] = await Promise.all([
        query.skip(skip).limit(limit).lean(),
        Bill.countDocuments(filters),
      ]);
      return { bills, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
    } catch (error) {
      logger.error('BillService: Error getting all bills:', error);
      throw error;
    }
  }

  static async getBillById(billId) {
    try {
      if (!billId || !mongoose.Types.ObjectId.isValid(billId)) {
        throw new ValidationError('Invalid bill ID format');
      }
      const bill = await Bill.findById(billId).lean();
      if (!bill) {
        throw new NotFoundError(`Bill with id ${billId} not found`);
      }
      return bill;
    } catch (error) {
      logger.error('BillService: Error getting bill by id:', error);
      throw error;
    }
  }

  static async createBill(billData) {
    try {
      if (!billData) {
        throw new ValidationError('Bill data is required');
      }
      // Prevent duplicate deposit bills for the same contract & renter while not paid
      if (billData.type === 'deposit' && billData.contractId && billData.renterId) {
        const existing = await Bill.findOne({
          contractId: billData.contractId,
          renterId: billData.renterId,
          type: 'deposit',
          status: { $ne: 'paid' },
        }).lean();
        if (existing) {
          return existing; // return existing bill to avoid duplicates
        }
      }
      // Optionally compute totalAmount if not provided
      if (billData.totalAmount == null) {
        const amount = billData.amount || {};
        billData.totalAmount =
          (amount.rent || 0) +
          (amount.electricity || 0) +
          (amount.water || 0) +
          (amount.service || 0);
      }
      const created = await Bill.create(billData);
      return created.toObject();
    } catch (error) {
      logger.error('BillService: Error creating bill:', error);
      throw error;
    }
  }

  static async updateBill(billId, updateData) {
    try {
      if (!billId || !mongoose.Types.ObjectId.isValid(billId)) {
        throw new ValidationError('Invalid bill ID format');
      }
      if (!updateData || Object.keys(updateData).length === 0) {
        throw new ValidationError('Update data is required');
      }
      const updated = await Bill.findByIdAndUpdate(
        billId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!updated) {
        throw new NotFoundError(`Bill with id ${billId} not found`);
      }
      return updated.toObject();
    } catch (error) {
      logger.error('BillService: Error updating bill:', error);
      throw error;
    }
  }

  static async deleteBill(billId) {
    try {
      if (!billId || !mongoose.Types.ObjectId.isValid(billId)) {
        throw new ValidationError('Invalid bill ID format');
      }
      const deleted = await Bill.findByIdAndDelete(billId);
      if (!deleted) {
        throw new NotFoundError(`Bill with id ${billId} not found`);
      }
      return deleted.toObject();
    } catch (error) {
      logger.error('BillService: Error deleting bill:', error);
      throw error;
    }
  }

  static async getBillsByContractId(contractId) {
    try {
      if (!contractId || !mongoose.Types.ObjectId.isValid(contractId)) {
        throw new ValidationError('Invalid contract ID format');
      }
      const bills = await Bill.find({ contractId }).lean();
      return bills;
    } catch (error) {
      logger.error('BillService: Error getting bills by contract id:', error);
      throw error;
    }
  }

  static async getBillsByRenterId(renterId, { status } = {}) {
    try {
      if (!renterId || !mongoose.Types.ObjectId.isValid(renterId)) {
        throw new ValidationError('Invalid renter ID format');
      }
      const filter = { renterId };
      if (status) filter.status = status;
      const bills = await Bill.find(filter)
        .populate({
          path: 'contractId',
          select: 'code roomId',
          populate: { path: 'roomId', select: 'name' },
        })
        .lean();
      return bills;
    } catch (error) {
      logger.error('BillService: Error getting bills by renter id:', error);
      throw error;
    }
  }

  static async markBillPaid(billId, { paymentMethod, paidAt } = {}) {
    try {
      if (!billId || !mongoose.Types.ObjectId.isValid(billId)) {
        throw new ValidationError('Invalid bill ID format');
      }
      const update = {
        status: 'paid',
        paymentMethod: paymentMethod || 'manual',
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      };
      const updated = await Bill.findByIdAndUpdate(billId, update, { new: true });
      if (!updated) {
        throw new NotFoundError(`Bill with id ${billId} not found`);
      }

      // If this is a deposit bill, activate the contract and mark room as rented
      if (updated.type === 'deposit' && updated.contractId) {
        try {
          const contract = await Contract.findById(updated.contractId);
          if (contract) {
            // Activate contract if still pending
            if (contract.status === 'pending') {
              contract.status = 'active';
              await contract.save();
            }
            // Update room status and availability
            if (contract.roomId && contract.renterId) {
              await Room.findByIdAndUpdate(
                contract.roomId,
                {
                  $set: {
                    status: 'rented',
                    isAvailable: false,
                    currentTenant: contract.renterId,
                  },
                },
                { new: true }
              );
            }
          }
        } catch (hookErr) {
          logger.error('BillService: Post-payment hook failed:', hookErr);
        }
      }
      return updated.toObject();
    } catch (error) {
      logger.error('BillService: Error marking bill as paid:', error);
      throw error;
    }
  }

  static async getBillsByHostId(hostId) {
    try {
      if (!hostId || !mongoose.Types.ObjectId.isValid(hostId)) {
        throw new ValidationError('Invalid host ID format');
      }

      // Find all contracts for this host, then get bills for those contracts
      const contracts = await Contract.find({ hostId }).select('_id');
      const contractIds = contracts.map((c) => c._id);

      if (contractIds.length === 0) {
        return [];
      }

      const bills = await Bill.find({ contractId: { $in: contractIds } })
        .populate('contractId', 'code roomId renterId')
        .populate({
          path: 'contractId',
          populate: {
            path: 'roomId',
            select: 'name code roomCode price',
          },
        })
        .populate({
          path: 'contractId',
          populate: {
            path: 'renterId',
            select: 'name email phone',
          },
        })
        .populate('renterId', 'name email phone')
        .sort({ createdAt: -1 })
        .lean();

      return bills;
    } catch (error) {
      logger.error('BillService: Error getting bills by host ID:', error);
      throw error;
    }
  }
}

module.exports = BillService;

module.exports = BillService;

module.exports = BillService;

module.exports = BillService;

module.exports = BillService;

module.exports = BillService;
