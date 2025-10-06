/**
 * @fileoverview Conversation Model - Defines the schema for chat conversations
 * @created 2025-09-28
 * @file conversation.model.js
 * @description This file defines the conversation schema and methods.
 */

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
