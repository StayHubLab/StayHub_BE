/**
 * @fileoverview Notification Model - Defines the notification schema and methods
 * @created 2025-08-25
 * @file notification.model.js
 * @description This file defines the notification schema and methods.
 */

const mongoose = require('mongoose');

// Notification Schema
const NotificationSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'action', 'success', 'error'],
      default: 'info',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Index for unread notifications
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
