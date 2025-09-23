/**
 * @fileoverview Search History Model - Defines the search history schema and methods
 * @created 2025-08-25
 * @file search-history.model.js
 * @description This file defines the search history schema and methods.
 */

const mongoose = require('mongoose');

// Search History Schema
const SearchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: String, // for anonymous users
    query: {
      type: String,
      required: true,
      trim: true,
    },
    filters: mongoose.Schema.Types.Mixed,
    location: {
      lat: Number,
      lng: Number,
      radius: Number,
      address: String,
    },
    results: [
      {
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
        buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
        clicked: { type: Boolean, default: false },
        viewed: { type: Boolean, default: false },
        favorited: { type: Boolean, default: false },
        contactRequested: { type: Boolean, default: false },
      },
    ],
    resultCount: Number,
  },
  {
    timestamps: true,
  }
);

// Index for search analytics
SearchHistorySchema.index({ userId: 1, createdAt: -1 });
SearchHistorySchema.index({ query: 'text' });

const SearchHistory = mongoose.model('SearchHistory', SearchHistorySchema);

module.exports = SearchHistory;
