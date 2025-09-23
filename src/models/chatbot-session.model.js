/**
 * @fileoverview Chatbot Session Model - Defines the chatbot session schema and methods
 * @created 2025-08-25
 * @file chatbot-session.model.js
 * @description This file defines the chatbot session schema and methods.
 */

const mongoose = require('mongoose');

// Chatbot Session Schema
const ChatbotSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
    context: {
      intent: String,
      entities: mongoose.Schema.Types.Mixed,
      lastAction: String,
      currentTopic: String,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'transferred', 'abandoned'],
      default: 'active',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete old sessions after 30 days
ChatbotSessionSchema.index({ endedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const ChatbotSession = mongoose.model('ChatbotSession', ChatbotSessionSchema);

module.exports = ChatbotSession;
