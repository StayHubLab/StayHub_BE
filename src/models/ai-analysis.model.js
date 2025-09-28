/**
 * @fileoverview AI Analysis Model - Defines the AI analysis schema and methods
 * @created 2025-08-25
 * @file ai-analysis.model.js
 * @description This file defines the AI analysis schema and methods.
 */

const mongoose = require('mongoose');

// AI Analysis Schema
const AIAnalysisSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['room', 'building', 'user', 'image'],
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    analysisType: {
      type: String,
      enum: ['image_verification', 'price_prediction', 'user_scoring', 'content_moderation'],
      required: true,
      index: true,
    },
    result: mongoose.Schema.Types.Mixed,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    metadata: mongoose.Schema.Types.Mixed,
    processedBy: String, // AI model version or service
  },
  {
    timestamps: true,
  }
);

const AIAnalysis = mongoose.model('AIAnalysis', AIAnalysisSchema);

module.exports = AIAnalysis;
