/**
 * @fileoverview Viewing Model - Defines the viewing appointment schema and methods
 * @created 2025-09-25
 * @file viewing.model.js
 * @description This file defines the viewing appointment schema for room viewing schedules.
 */

const mongoose = require('mongoose');

const viewingSchema = new mongoose.Schema(
  {
    // User who made the viewing appointment (optional for guest bookings)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow guest bookings without user account
      default: null,
    },

    // Room that was booked for viewing
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
    },

    // Building reference (for easier queries)
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: [true, 'Building ID is required'],
    },

    // Landlord who owns the room
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Landlord ID is required'],
    },

    // Viewing appointment details
    viewingDate: {
      type: Date,
      required: [true, 'Viewing date is required'],
      validate: {
        validator: function (date) {
          // Compare only dates, not time
          const today = new Date();
          const inputDate = new Date(date);

          // Set time to beginning of day for both dates
          today.setHours(0, 0, 0, 0);
          inputDate.setHours(0, 0, 0, 0);

          return inputDate >= today;
        },
        message: 'Viewing date cannot be in the past',
      },
    },

    viewingTime: {
      type: String,
      required: [true, 'Viewing time is required'],
      enum: [
        '9:00 AM',
        '9:30 AM',
        '10:00 AM',
        '10:30 AM',
        '11:00 AM',
        '11:30 AM',
        '2:00 PM',
        '2:30 PM',
        '3:00 PM',
        '3:30 PM',
        '4:00 PM',
        '4:30 PM',
        '5:00 PM',
      ],
    },

    // Appointment status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },

    // Contact information (stored for convenience)
    contactInfo: {
      name: {
        type: String,
        required: [true, 'Contact name is required'],
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
      },
    },

    // Additional notes from user
    notes: {
      type: String,
      maxLength: [500, 'Notes cannot exceed 500 characters'],
    },

    // Landlord response
    landlordResponse: {
      message: {
        type: String,
        maxLength: [500, 'Response message cannot exceed 500 characters'],
      },
      respondedAt: {
        type: Date,
      },
    },

    // Confirmation details
    confirmedAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },

    cancellationReason: {
      type: String,
      maxLength: [200, 'Cancellation reason cannot exceed 200 characters'],
    },

    // Completion details
    completedAt: {
      type: Date,
    },

    // Rating after viewing (optional)
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxLength: [300, 'Rating comment cannot exceed 300 characters'],
      },
      ratedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
viewingSchema.index({ userId: 1, createdAt: -1 });
viewingSchema.index({ landlordId: 1, createdAt: -1 });
viewingSchema.index({ roomId: 1, createdAt: -1 });
viewingSchema.index({ status: 1, viewingDate: 1 });
viewingSchema.index({ viewingDate: 1, viewingTime: 1 });

// Virtual for full viewing datetime
viewingSchema.virtual('fullViewingDateTime').get(function () {
  if (!this.viewingDate || !this.viewingTime) return null;

  const date = new Date(this.viewingDate);
  const [time, period] = this.viewingTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  let adjustedHours = hours;
  if (period === 'PM' && hours !== 12) {
    adjustedHours = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    adjustedHours = 0;
  }

  date.setHours(adjustedHours, minutes, 0, 0);
  return date;
});

// Virtual for formatted viewing date
viewingSchema.virtual('formattedViewingDate').get(function () {
  if (!this.viewingDate) return null;

  return this.viewingDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Instance methods
viewingSchema.methods.canBeModified = function () {
  const now = new Date();
  const viewingDateTime = this.fullViewingDateTime;

  if (!viewingDateTime) return false;

  // Can be modified if viewing is at least 2 hours away
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return viewingDateTime > twoHoursFromNow && ['pending', 'confirmed'].includes(this.status);
};

viewingSchema.methods.confirm = function (message = null) {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  if (message) {
    this.landlordResponse.message = message;
    this.landlordResponse.respondedAt = new Date();
  }
  return this.save();
};

viewingSchema.methods.cancel = function (reason = null) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  if (reason) {
    this.cancellationReason = reason;
  }
  return this.save();
};

viewingSchema.methods.complete = function (rating = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (rating) {
    this.rating = {
      ...rating,
      ratedAt: new Date(),
    };
  }
  return this.save();
};

// Static methods
viewingSchema.statics.findByDateRange = function (startDate, endDate, filters = {}) {
  return this.find({
    ...filters,
    viewingDate: {
      $gte: startDate,
      $lte: endDate,
    },
  }).populate('userId roomId buildingId landlordId');
};

viewingSchema.statics.findConflicting = function (
  roomId,
  viewingDate,
  viewingTime,
  excludeId = null
) {
  const query = {
    roomId,
    viewingDate,
    viewingTime,
    status: { $in: ['pending', 'confirmed'] },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.find(query);
};

const Viewing = mongoose.model('Viewing', viewingSchema);

module.exports = Viewing;
