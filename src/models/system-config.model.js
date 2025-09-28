/**
 * @fileoverview System Config Model - Defines the system config schema and methods
 * @created 2025-08-25
 * @file system-config.model.js
 * @description This file defines the system config schema and methods.
 */

const mongoose = require('mongoose');

// System Config Schema
const SystemConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: String,
    file: String,
    dataType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'file'],
      default: 'string',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SystemConfig = mongoose.model('SystemConfig', SystemConfigSchema);

module.exports = SystemConfig;
