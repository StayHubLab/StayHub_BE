/**
 * @fileoverview Repair Model - Defines the repair schema and methods
 * @created 2025-01-25
 * @file repair.model.js
 * @description This file defines the repair schema and methods.
 */

const mongoose = require('mongoose');

// Repair Schema
const RepairSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
    images: [String],
    cost: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['reported', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'reported',
      index: true,
    },
    billFile: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    scheduledDate: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Repair = mongoose.model('Repair', RepairSchema);

module.exports = Repair;
