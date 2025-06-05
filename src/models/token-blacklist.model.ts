/**
 * @fileoverview Token Blacklist Model - Handles token blacklist
 * @created 2025-05-29
 * @file token-blacklist.model.ts
 * @description This file defines the token blacklist model for the application.
 */

import { Document, Model, model, Schema } from 'mongoose';

export interface ITokenBlacklist extends Document {
  token: string;
  expiresAt: Date;
}

const tokenBlacklistSchema = new Schema<ITokenBlacklist>(
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

const TokenBlacklist: Model<ITokenBlacklist> = model<ITokenBlacklist>(
  'TokenBlacklist',
  tokenBlacklistSchema
);

export default TokenBlacklist;
