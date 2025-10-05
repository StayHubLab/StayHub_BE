/**
 * @fileoverview Bill Model - Defines the bill schema and methods
 * @created 2025-08-25
 * @file bill.model.js
 * @description This file defines the bill schema and methods.
 */

const mongoose = require('mongoose');

// Bill Schema (was Payment)
const BillSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
      index: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Landlord who created the bill
      required: true,
      index: true,
    },
    amount: {
      rent: {
        type: Number,
        min: 0,
        default: 0,
      },
      electricity: {
        type: Number,
        min: 0,
        default: 0,
      },
      water: {
        type: Number,
        min: 0,
        default: 0,
      },
      service: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      maxLength: 2000,
    },
    type: {
      type: String,
      enum: ['monthly', 'one-time', 'deposit', 'refund'],
      default: 'monthly',
      index: true,
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      min: 2020,
      max: 3000,
    },
    status: {
      type: String,
      enum: ['pending', 'pending_approval', 'paid', 'overdue', 'failed', 'rejected'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cash', 'momo', 'other'],
      default: 'bank_transfer',
    },
    paidAt: Date,
    dueDate: Date,
    // Payment Evidence Fields
    paymentEvidence: {
      type: String, // Cloudinary URL
      default: null,
    },
    evidenceUploadedAt: {
      type: Date,
    },
    // Approval Workflow Fields
    approvalStatus: {
      type: String,
      enum: ['pending', 'pending_approval', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Landlord who reviewed
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxLength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for calculating total amount
BillSchema.virtual('calculatedTotal').get(function () {
  return (
    (this.amount.rent || 0) +
    (this.amount.electricity || 0) +
    (this.amount.water || 0) +
    (this.amount.service || 0)
  );
});

// Indexes for performance
BillSchema.index({ landlordId: 1, approvalStatus: 1 });
BillSchema.index({ renterId: 1, status: 1 });
BillSchema.index({ approvalStatus: 1, createdAt: -1 });

const Bill = mongoose.model('Bill', BillSchema);

module.exports = Bill;
