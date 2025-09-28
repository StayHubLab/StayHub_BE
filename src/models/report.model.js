/**
 * @fileoverview Report Model - Defines the report schema and methods
 * @created 2025-08-25
 * @file report.model.js
 * @description This file defines the report schema and methods.
 */

const mongoose = require('mongoose');

// Report Schema
const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
    images: [String],
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    resolution: String,
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
