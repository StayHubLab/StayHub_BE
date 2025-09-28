/**
 * @fileoverview Support Ticket Model - Defines the support ticket schema and methods
 * @created 2025-08-25
 * @file support-ticket.model.js
 * @description This file defines the support ticket schema and methods.
 */

const mongoose = require('mongoose');

// Support Ticket Schema
const SupportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
    category: {
      type: String,
      enum: ['technical', 'billing', 'account', 'general', 'report'],
      default: 'general',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
      index: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    response: String,
    attachments: [String],
  },
  {
    timestamps: true,
  }
);

const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);

module.exports = SupportTicket;
