/**
<<<<<<< HEAD
 * @fileoverview Message Model - Defines the message schema and methods
 * @created 2025-08-25
=======
 * @fileoverview Message Model - Defines the schema for chat messages
 * @created 2025-09-28
>>>>>>> 1b7272e6f01d0861a0a926d113736381c26a7d91
 * @file message.model.js
 * @description This file defines the message schema and methods.
 */

const mongoose = require('mongoose');

<<<<<<< HEAD
// Message Schema (user-to-user chat, not AI session)
const MessageSchema = new mongoose.Schema(
  {
=======
const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
>>>>>>> 1b7272e6f01d0861a0a926d113736381c26a7d91
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
<<<<<<< HEAD
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
=======
>>>>>>> 1b7272e6f01d0861a0a926d113736381c26a7d91
    },
    content: {
      type: String,
      required: true,
      trim: true,
<<<<<<< HEAD
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
=======
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
>>>>>>> 1b7272e6f01d0861a0a926d113736381c26a7d91

module.exports = Message;
