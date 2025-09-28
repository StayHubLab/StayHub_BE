/**
 * @fileoverview Token Blacklist Model - Handles token blacklist
 * @created 2025-05-29
 * @file token-blacklist.model.js
 * @description This file defines the token blacklist model for the application.
 */

const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create TTL index to automatically remove expired tokens
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = TokenBlacklist;
