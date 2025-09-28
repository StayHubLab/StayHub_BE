/**
 * @fileoverview Contact Request Model - Defines the contact request schema and methods
 * @created 2025-08-25
 * @file contact-request.model.js
 * @description This file defines the contact request schema and methods.
 */

const mongoose = require('mongoose');

// Contact Request Schema
const ContactRequestSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: false,
      index: true,
    },
    isHandled: {
      type: Boolean,
      default: false,
      index: true,
    },
    tenantSignature: {
      type: String, // base64 PNG khi người thuê ký duyệt
    },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    handledAt: Date,
    response: String,
  },
  {
    timestamps: true,
  }
);

const ContactRequest = mongoose.model('ContactRequest', ContactRequestSchema);

module.exports = ContactRequest;
