/**
 * @fileoverview Rating Model - Defines the rating schema and methods
 * @created 2025-08-25
 * @file rating.model.js
 * @description This file defines the rating schema and methods.
 */

const mongoose = require('mongoose');

// Rating Schema
const RatingSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['room', 'building', 'user'],
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    }, // ref to Room, Building, or User
    score: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    images: [String],
  },
  {
    timestamps: true,
  }
);

// Compound index for preventing duplicate ratings
RatingSchema.index({ fromUser: 1, type: 1, targetId: 1 }, { unique: true });

const Rating = mongoose.model('Rating', RatingSchema);

module.exports = Rating;
