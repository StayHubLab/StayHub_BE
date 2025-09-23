/**
 * @fileoverview Message Model - Defines the message schema and methods
 * @created 2025-08-25
 * @file message.model.js
 * @description This file defines the message schema and methods.
 */

const mongoose = require('mongoose');

// Message Schema (user-to-user chat, not AI session)
const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    attachments: [String],
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  },
  {
    timestamps: true,
  }
);

// Compound index for conversation queries
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, isRead: 1 });

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
