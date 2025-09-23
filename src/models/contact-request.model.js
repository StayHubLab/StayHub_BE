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
    guestInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      message: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000,
      },
    },
    isHandled: {
      type: Boolean,
      default: false,
      index: true,
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
