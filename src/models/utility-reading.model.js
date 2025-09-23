/**
 * @fileoverview Utility Reading Model - Defines the utility reading schema and methods
 * @created 2025-08-25
 * @file utility-reading.model.js
 * @description This file defines the utility reading schema and methods.
 */

const mongoose = require('mongoose');

// Utility Reading Schema
const UtilityReadingSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/, // YYYY-MM format
    },
    readings: {
      electricity: {
        previous: { type: Number, min: 0, default: 0 },
        current: { type: Number, min: 0, required: true },
        usage: { type: Number, min: 0 },
      },
      water: {
        previous: { type: Number, min: 0, default: 0 },
        current: { type: Number, min: 0, required: true },
        usage: { type: Number, min: 0 },
      },
    },
    note: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique readings per room per month
UtilityReadingSchema.index({ roomId: 1, month: 1 }, { unique: true });

// Pre-save middleware to calculate usage
UtilityReadingSchema.pre('save', function (next) {
  if (this.readings.electricity) {
    this.readings.electricity.usage =
      this.readings.electricity.current - this.readings.electricity.previous;
  }
  if (this.readings.water) {
    this.readings.water.usage = this.readings.water.current - this.readings.water.previous;
  }
  next();
});

const UtilityReading = mongoose.model('UtilityReading', UtilityReadingSchema);

module.exports = UtilityReading;
