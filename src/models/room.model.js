/**
 * @fileoverview Room Model - Defines the room schema and methods
 * @created 2025-06-06
 * @file room.model.js
 * @description This file defines the room schema and methods.
 */

const mongoose = require('mongoose');
const { validateRoomConsistency, validateRoomUpdate } = require('../middlewares/room.middleware');

const roomSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: Number,
      required: true,
      min: [0, 'Area cannot be negative'],
      max: [1000, 'Area seems too large'],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
      max: [20, 'Capacity seems too large'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        isVerified: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    utilities: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: String,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    price: {
      rent: {
        type: Number,
        required: true,
        min: [0, 'Rent cannot be negative'],
      },
      electricity: {
        type: Number,
        min: [0, 'Electricity price cannot be negative'],
      },
      water: {
        type: Number,
        min: [0, 'Water price cannot be negative'],
      },
      service: {
        type: Number,
        min: [0, 'Service price cannot be negative'],
      },
      deposit: {
        type: Number,
        min: [0, 'Deposit cannot be negative'],
      },
    },
    features: {
      hasBalcony: { type: Boolean, default: false },
      hasWindow: { type: Boolean, default: false },
      hasAircon: { type: Boolean, default: false },
      hasWaterHeater: { type: Boolean, default: false },
      hasKitchen: { type: Boolean, default: false },
      hasWardrobe: { type: Boolean, default: false },
      hasDesk: { type: Boolean, default: false },
      hasTv: { type: Boolean, default: false },
      hasInternet: { type: Boolean, default: false },
      hasElevator: { type: Boolean, default: false },
    },
    isAvailable: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: ['available', 'rented', 'maintenance', 'reserved'],
      default: 'available',
      index: true,
    },
    currentTenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    viewCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for frequently queried fields
roomSchema.index({ status: 1, isAvailable: 1 });
roomSchema.index({ rating: -1 });
roomSchema.index({ price: 1 });

// Virtual for total price
roomSchema.virtual('totalPrice').get(function () {
  return (
    this.price.rent +
    (this.price.electricity || 0) +
    (this.price.water || 0) +
    (this.price.service || 0)
  );
});

// Virtual for available features count
roomSchema.virtual('availableFeaturesCount').get(function () {
  return Object.values(this.features).filter(Boolean).length;
});

// Method to check if room is ready for rent
roomSchema.methods.isReadyForRent = function () {
  return (
    this.isAvailable &&
    this.status === 'available' &&
    this.images.length > 0 &&
    this.images.some((img) => img.isVerified)
  );
};

// Method to calculate occupancy rate
roomSchema.methods.calculateOccupancyRate = function () {
  if (this.status === 'rented') return 100;
  if (this.status === 'reserved') return 50;
  return 0;
};

// Static method to find available rooms
roomSchema.statics.findAvailable = function () {
  return this.find({
    isAvailable: true,
    status: 'available',
  }).sort({ rating: -1 });
};

// Apply middleware
roomSchema.pre('save', validateRoomConsistency);
roomSchema.pre('findOneAndUpdate', validateRoomUpdate);
roomSchema.pre('updateOne', validateRoomUpdate);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
