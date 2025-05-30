/**
 * @fileoverview User Model - Defines the user schema and methods
 * @author TienTP
 * @created 2025-05-29
 * @file user.model.js
 * @description This file defines the user schema and methods.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateEmail, validatePhone } = require('../validations/validation');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['renter', 'host', 'technician', 'admin'],
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: validateEmail,
        message: 'Please enter a valid email',
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: validatePhone,
        message: 'Please enter a valid phone number',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      validate: {
        validator: function (v) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
        },
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      },
      select: false,
    },
    address: {
      street: {
        type: String,
        trim: true,
        required: [true, 'Street address is required'],
      },
      ward: {
        type: String,
        trim: true,
        required: [true, 'Ward is required'],
      },
      district: {
        type: String,
        trim: true,
        required: [true, 'District is required'],
      },
      city: {
        type: String,
        trim: true,
        required: [true, 'City is required'],
      },
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    preferredUtilities: {
      type: [String],
      validate: {
        validator: function (v) {
          const validUtilities = [
            'wifi',
            'aircon',
            'water',
            'electricity',
            'furniture',
            'security',
          ];
          return v.every((util) => validUtilities.includes(util));
        },
        message: 'Invalid utility preference',
      },
    },
    preferredPriceRange: {
      min: {
        type: Number,
        min: [0, 'Minimum price cannot be negative'],
        validate: {
          validator: function (v) {
            return v <= this.max;
          },
          message: 'Minimum price must be less than maximum price',
        },
      },
      max: {
        type: Number,
        min: [0, 'Maximum price cannot be negative'],
      },
    },
    avatar: {
      type: String,
      default: 'https://example.com/default-avatar.png',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocument: [
      {
        type: {
          type: String,
          enum: ['idCard', 'passport', 'driverLicense'],
          required: true,
        },
        number: String,
        image: String,
        verifyAt: Date,
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
      },
    ],
    lastLogin: {
      type: Date,
    },
    loginHistory: [
      {
        ip: String,
        device: String,
        timestamp: Date,
      },
    ],
    notificationSettings: {
      email: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ userId: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Check if user has required role
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
