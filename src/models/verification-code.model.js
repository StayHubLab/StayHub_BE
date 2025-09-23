/**
 * @fileoverview Verification Code Model - Temporary storage for email verification codes
 * @created 2025-09-22
 * @file verification-code.model.js
 * @description This file defines the verification code schema for pre-registration email verification.
 */

const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      length: 6,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient cleanup
verificationCodeSchema.index({ email: 1, expiresAt: 1 });

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

module.exports = VerificationCode;
