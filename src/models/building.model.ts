/**
 * @fileoverview Building Model - Defines the building schema and methods
 * @created 2025-05-29
 * @file building.model.ts
 * @description This file defines the building schema and methods.
 */

import mongoose, { Document, Model } from 'mongoose';

interface IAddress {
  street: string;
  ward: string;
  district: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface IImage {
  url: string;
  type: 'exterior' | 'interior' | 'room' | 'amenity';
  isVerified: boolean;
  uploadedAt: Date;
}

interface INearbyPlace {
  name: string;
  type: string;
  distance: number;
}

interface IPremiumFeatures {
  isPremium: boolean;
  premiumUntil?: Date;
  featuredUntil?: Date;
}

interface IBuilding extends Document {
  hostId: mongoose.Types.ObjectId;
  name: string;
  address: IAddress;
  description?: string;
  floors?: number;
  area: number;
  avgPrice: number;
  highlightPoints: string[];
  rulesFile?: string;
  mapLink?: string;
  seoTitle?: string;
  seoDescription?: string;
  rating: number;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  images: IImage[];
  nearbyPlaces: INearbyPlace[];
  premiumFeatures: IPremiumFeatures;
  status: 'active' | 'inactive' | 'pending';
  occupancyRate: number;
  isPremium: boolean;
  updateAvailability(rooms: number): Promise<IBuilding>;
}

interface IBuildingModel extends Model<IBuilding> {
  findByCity(city: string): Promise<IBuilding[]>;
  findPremium(): Promise<IBuilding[]>;
}

const buildingSchema = new mongoose.Schema<IBuilding>(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    address: {
      street: { type: String, required: true, trim: true },
      ward: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      coordinates: {
        lat: { type: Number, required: true, min: -90, max: 90 },
        lng: { type: Number, required: true, min: -180, max: 180 },
      },
    },
    description: {
      type: String,
      trim: true,
      maxLength: 2000,
    },
    floors: {
      type: Number,
      min: 1,
      max: 200,
    },
    area: {
      type: Number,
      min: 0,
      required: true,
    },
    avgPrice: {
      type: Number,
      min: 0,
      required: true,
    },
    highlightPoints: [
      {
        type: String,
        trim: true,
        maxLength: 100,
      },
    ],
    rulesFile: String,
    mapLink: String,
    seoTitle: {
      type: String,
      trim: true,
      maxLength: 60,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxLength: 160,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },
    availableRooms: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ['exterior', 'interior', 'room', 'amenity'],
          required: true,
        },
        isVerified: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    nearbyPlaces: [
      {
        name: { type: String, required: true, trim: true },
        type: { type: String, required: true, trim: true },
        distance: { type: Number, required: true, min: 0 },
      },
    ],
    premiumFeatures: {
      isPremium: { type: Boolean, default: false },
      premiumUntil: Date,
      featuredUntil: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
buildingSchema.index({ 'address.city': 1 });
buildingSchema.index({ 'address.district': 1 });
buildingSchema.index({ avgPrice: 1 });
buildingSchema.index({ rating: -1 });
buildingSchema.index({ 'premiumFeatures.isPremium': 1 });

// Virtual fields
buildingSchema.virtual('occupancyRate').get(function (this: IBuilding) {
  if (!this.totalRooms) return 0;
  return ((this.totalRooms - this.availableRooms) / this.totalRooms) * 100;
});

buildingSchema.virtual('isPremium').get(function (this: IBuilding) {
  return (
    this.premiumFeatures.isPremium &&
    this.premiumFeatures.premiumUntil &&
    this.premiumFeatures.premiumUntil > new Date()
  );
});

// Pre-save middleware
buildingSchema.pre('save', function (this: IBuilding, next) {
  if (this.availableRooms > this.totalRooms) {
    next(new Error('Available rooms cannot be greater than total rooms'));
  }
  next();
});

// Static methods
buildingSchema.statics.findByCity = function (city: string) {
  return this.find({ 'address.city': city });
};

buildingSchema.statics.findPremium = function () {
  return this.find({
    'premiumFeatures.isPremium': true,
    'premiumFeatures.premiumUntil': { $gt: new Date() },
  });
};

// Instance methods
buildingSchema.methods.updateAvailability = function (this: IBuilding, rooms: number) {
  if (this.availableRooms + rooms < 0) {
    throw new Error('Not enough available rooms');
  }
  this.availableRooms += rooms;
  return this.save();
};

const Building = mongoose.model<IBuilding, IBuildingModel>('Building', buildingSchema);

export default Building;
