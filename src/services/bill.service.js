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
      const bill = await Bill.findById(billId)
        .populate({
          path: 'contractId',
          select: 'code roomId renterId startDate endDate monthlyRent deposit status',
          populate: [
            {
              path: 'roomId',
              select: 'name price area images buildingId',
              populate: {
                path: 'buildingId',
                select: 'name address hostId',
                populate: {
                  path: 'hostId',
                  select: 'name email phone bankInfo avatar'
                }
              }
            },
            {
              path: 'renterId',
              select: 'name email phone avatar'
            }
          ]
        })
        .populate({
          path: 'renterId',
          select: 'name email phone avatar'
        })
        .populate({
          path: 'reviewedBy',
          select: 'name email'
        })
        .populate({
          path: 'createdBy',
          select: 'name email phone avatar bankInfo'
        })
        .lean();
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
          select: 'code roomId renterId startDate endDate monthlyRent deposit status',
          populate: [
            {
              path: 'roomId',
              select: 'name price area images buildingId',
              populate: {
                path: 'buildingId',
                select: 'name address hostId',
                populate: {
                  path: 'hostId',
                  select: 'name email phone bankInfo avatar'
                }
              }
            },
            {
              path: 'renterId',
              select: 'name email phone avatar'
            }
          ]
        })
        .populate({
          path: 'renterId',
          select: 'name email phone avatar'
        })
        .populate({
          path: 'createdBy',
          select: 'name email phone avatar bankInfo'
        })
        .lean();
      return bills;
    } catch (error) {
      logger.error('BillService: Error getting bills by renter id:', error);
      throw error;
    }
  }

  static async markBillPaid(billId, { paymentMethod = 'bank_transfer', paidAt, reviewedBy = null, approvalStatus = 'approved' } = {}) {
    try {
      if (!billId || !mongoose.Types.ObjectId.isValid(billId)) {
        throw new ValidationError('Invalid bill ID format');
      }
      const update = {
        status: 'paid',
        approvalStatus,
        paymentMethod: paymentMethod || 'bank_transfer',
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      };
      
      if (reviewedBy) {
        update.reviewedBy = reviewedBy;
        update.reviewedAt = new Date();
      }
      
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
        .populate({
          path: 'contractId',
          select: 'code roomId renterId startDate endDate monthlyRent deposit status',
          populate: [
            {
              path: 'roomId',
              select: 'name code roomCode price area images buildingId',
              populate: {
                path: 'buildingId',
                select: 'name address hostId',
                populate: {
                  path: 'hostId',
                  select: 'name email phone bankInfo avatar'
                }
              }
            },
            {
              path: 'renterId',
              select: 'name email phone avatar'
            }
          ]
        })
        .populate({
          path: 'renterId',
          select: 'name email phone avatar'
        })
        .populate({
          path: 'reviewedBy',
          select: 'name email'
        })
        .populate({
          path: 'createdBy',
          select: 'name email phone avatar bankInfo'
        })
        .sort({ createdAt: -1 })
        .lean();

      return bills;
    } catch (error) {
      logger.error('BillService: Error getting bills by host ID:', error);
      throw error;
    }
  }

  /**
   * Upload payment evidence for a bill
   */
  static async uploadPaymentEvidence(billId, evidenceUrl, renterId) {
    try {
      if (!billId || !mongoose.Types.ObjectId.isValid(billId)) {
        throw new ValidationError('Invalid bill ID format');
      }

      const bill = await Bill.findById(billId);
      if (!bill) {
        throw new NotFoundError(`Bill with id ${billId} not found`);
      }

      // Verify renter owns this bill
      if (bill.renterId.toString() !== renterId.toString()) {
        throw new ValidationError('You are not authorized to upload evidence for this bill');
      }

      // Update bill with evidence
      bill.paymentEvidence = evidenceUrl;
      bill.evidenceUploadedAt = new Date();
      bill.status = 'pending_approval';
      bill.approvalStatus = 'pending_approval';
      
      await bill.save();

      // Populate landlord info and send notification email
      const populatedBill = await Bill.findById(billId)
        .populate('contractId')
        .populate('landlordId', 'email name')
        .populate('renterId', 'name');

      if (populatedBill.landlordId && populatedBill.landlordId.email) {
        try {
          await EmailService.sendEmail({
            to: populatedBill.landlordId.email,
            subject: 'New Payment Evidence Uploaded',
            html: `
              <h3>Payment Evidence Uploaded</h3>
              <p>Dear ${populatedBill.landlordId.name},</p>
              <p>A renter has uploaded payment evidence for Bill #${bill._id}.</p>
              <p><strong>Amount:</strong> ${bill.totalAmount.toLocaleString()} VND</p>
              <p><strong>Renter:</strong> ${populatedBill.renterId?.name || 'N/A'}</p>
              <p>Please review the payment evidence in your dashboard.</p>
            `,
          });
        } catch (emailError) {
          logger.error('Failed to send landlord notification email:', emailError);
        }
      }

      return bill.toObject();
    } catch (error) {
      logger.error('BillService: Error uploading payment evidence:', error);
      throw error;
    }
  }

  /**
   * Approve payment evidence (Landlord only)
   */
  static async approvePayment(billId, landlordId, notes = '') {
    try {
      if (!billId || !mongoose.Types.ObjectId.isValid(billId)) {
        throw new ValidationError('Invalid bill ID format');
      }

      const bill = await Bill.findById(billId)
        .populate({
          path: 'contractId',
          populate: { path: 'roomId', populate: 'buildingId' },
        })
        .populate('renterId', 'email name');

      if (!bill) {
        throw new NotFoundError(`Bill with id ${billId} not found`);
      }

      // Verify landlord owns this property
      const building = bill.contractId?.roomId?.buildingId;
      if (!building || building.hostId.toString() !== landlordId.toString()) {
        throw new ValidationError('You are not authorized to approve this payment');
      }

      // Mark as paid
      bill.status = 'paid';
      bill.approvalStatus = 'approved';
      bill.reviewedBy = landlordId;
      bill.reviewedAt = new Date();
      bill.paidAt = new Date();
      
      await bill.save();

      // Send confirmation email to renter
      if (bill.renterId && bill.renterId.email) {
        try {
          await EmailService.sendEmail({
            to: bill.renterId.email,
            subject: 'Payment Approved',
            html: `
              <h3>Payment Approved</h3>
              <p>Dear ${bill.renterId.name},</p>
              <p>Your payment for Bill #${bill._id} has been approved.</p>
              <p><strong>Amount:</strong> ${bill.totalAmount.toLocaleString()} VND</p>
              ${notes ? `<p><strong>Note:</strong> ${notes}</p>` : ''}
              <p>Thank you for your payment!</p>
            `,
          });
        } catch (emailError) {
          logger.error('Failed to send renter confirmation email:', emailError);
        }
      }

      // If this is a deposit bill, activate the contract and mark room as rented
      if (bill.type === 'deposit' && bill.contractId) {
        try {
          const contract = await Contract.findById(bill.contractId);
          if (contract && contract.status === 'pending') {
            contract.status = 'active';
            await contract.save();

            if (contract.roomId && contract.renterId) {
              await Room.findByIdAndUpdate(contract.roomId, {
                $set: {
                  status: 'rented',
                  isAvailable: false,
                  currentTenant: contract.renterId,
                },
              });
            }
          }
        } catch (hookErr) {
          logger.error('BillService: Post-approval hook failed:', hookErr);
        }
      }

      return bill.toObject();
    } catch (error) {
      logger.error('BillService: Error approving payment:', error);
      throw error;
    }
  }

  /**
   * Reject payment evidence (Landlord only)
   */
  static async rejectPayment(billId, landlordId, reason) {
    try {
      if (!billId || !mongoose.Types.ObjectId.isValid(billId)) {
        throw new ValidationError('Invalid bill ID format');
      }

      if (!reason || reason.trim().length === 0) {
        throw new ValidationError('Rejection reason is required');
      }

      const bill = await Bill.findById(billId)
        .populate({
          path: 'contractId',
          populate: { path: 'roomId', populate: 'buildingId' },
        })
        .populate('renterId', 'email name');

      if (!bill) {
        throw new NotFoundError(`Bill with id ${billId} not found`);
      }

      // Verify landlord owns this property
      const building = bill.contractId?.roomId?.buildingId;
      if (!building || building.hostId.toString() !== landlordId.toString()) {
        throw new ValidationError('You are not authorized to reject this payment');
      }

      // Mark as rejected
      bill.status = 'rejected';
      bill.approvalStatus = 'rejected';
      bill.reviewedBy = landlordId;
      bill.reviewedAt = new Date();
      bill.rejectionReason = reason;
      
      await bill.save();

      // Send notification email to renter
      if (bill.renterId && bill.renterId.email) {
        try {
          await EmailService.sendEmail({
            to: bill.renterId.email,
            subject: 'Payment Evidence Rejected',
            html: `
              <h3>Payment Evidence Rejected</h3>
              <p>Dear ${bill.renterId.name},</p>
              <p>Your payment evidence for Bill #${bill._id} has been rejected.</p>
              <p><strong>Amount:</strong> ${bill.totalAmount.toLocaleString()} VND</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p>Please upload a new payment evidence with the correct information.</p>
            `,
          });
        } catch (emailError) {
          logger.error('Failed to send renter rejection email:', emailError);
        }
      }

      return bill.toObject();
    } catch (error) {
      logger.error('BillService: Error rejecting payment:', error);
      throw error;
    }
  }

  /**
   * Get payments by approval status (for landlord dashboard)
   */
  static async getPaymentsByApprovalStatus(landlordId, status) {
    try {
      if (!landlordId || !mongoose.Types.ObjectId.isValid(landlordId)) {
        throw new ValidationError('Invalid landlord ID format');
      }

      const validStatuses = ['pending', 'pending_approval', 'approved', 'rejected'];
      if (status && !validStatuses.includes(status)) {
        throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const filter = { landlordId };
      if (status) {
        filter.approvalStatus = status;
      }

      const bills = await Bill.find(filter)
        .populate({
          path: 'contractId',
          select: 'code roomId',
          populate: { path: 'roomId', select: 'name code' },
        })
        .populate('renterId', 'name email phone')
        .sort({ createdAt: -1 })
        .lean();

      return bills;
    } catch (error) {
      logger.error('BillService: Error getting payments by approval status:', error);
      throw error;
    }
  }
}

module.exports = BillService;
