/**
 * @fileoverview Feedback Model - Defines the feedback schema and methods
 * @created 2025-08-25
 * @file feedback.model.js
 * @description This file defines the feedback schema and methods.
 */

const mongoose = require('mongoose');

// Feedback Schema
const FeedbackSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: ['platform', 'building', 'renter', 'host'],
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
    images: [String],
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;
