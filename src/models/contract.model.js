/**
 * @fileoverview Contract Model - Defines the contract schema and methods
 * @created 2025-08-25
 * @file contract.model.js
 * @description This file defines the contract schema and methods.
 */

const mongoose = require('mongoose');

// Contract Schema
const ContractSchema = new mongoose.Schema(
  {
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
      index: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'terminated', 'pending', 'expired'],
      default: 'pending',
      index: true,
    },
    contractFiles: [
      {
        url: String,
        type: {
          type: String,
          enum: ['draft', 'signed', 'terminated'],
        },
        uploadedAt: { type: Date, default: Date.now },
        signedAt: Date,
      },
    ],
    terms: {
      rentAmount: {
        type: Number,
        required: true,
        min: 0,
      },
      depositAmount: {
        type: Number,
        required: true,
        min: 0,
      },
      paymentDay: {
        type: Number,
        min: 1,
        max: 31,
        default: 1,
      },
      noticePeriod: {
        type: Number,
        default: 30,
      },
      utilities: [
        {
          name: String,
          price: Number,
          unit: String,
        },
      ],
    },
    paymentHistory: [
      {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        type: {
          type: String,
          enum: ['rent', 'deposit', 'utility', 'penalty'],
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'paid', 'overdue'],
          default: 'pending',
        },
        dueDate: Date,
        paidAt: Date,
      },
    ],
    termination: {
      reason: String,
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      requestedAt: Date,
      approvedAt: Date,
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    signatures: {
      landlord: {
        type: String, // base64 PNG
      },
      tenant: {
        type: String, // base64 PNG
      },
      landlordSignedAt: Date,
      tenantSignedAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ContractSchema.index({ status: 1, startDate: 1 });
ContractSchema.index({ endDate: 1 });

// Virtual for contract duration
ContractSchema.virtual('duration').get(function () {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Method to check if contract is active
ContractSchema.methods.isActive = function () {
  const now = new Date();
  return this.status === 'active' && this.startDate <= now && this.endDate >= now;
};

const Contract = mongoose.model('Contract', ContractSchema);

module.exports = Contract;
