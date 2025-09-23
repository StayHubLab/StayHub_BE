/**
 * @fileoverview Premium Package Model - Defines the premium package schema and methods
 * @created 2025-08-25
 * @file premium-package.model.js
 * @description This file defines the premium package schema and methods.
 */

const mongoose = require('mongoose');

// Premium Package Schema
const PremiumPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

const PremiumPackage = mongoose.model('PremiumPackage', PremiumPackageSchema);

module.exports = PremiumPackage;
