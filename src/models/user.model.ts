/**
 * @fileoverview User Model - Defines the user schema and methods
 * @created 2025-05-29
 * @file user.model.ts
 * @description This file defines the user schema and methods.
 */

import { Document, Model, model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateEmail, validatePhone } from '../validations/validation';

export interface IUser extends Document {
  role: 'renter' | 'landlord' | 'technician' | 'admin';
  name: string;
  email: string;
  phone: string;
  password: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  dob?: Date;
  gender: 'male' | 'female' | 'other';
  preferredUtilities?: string[];
  preferredPriceRange?: {
    min: number;
    max: number;
  };
  avatar: string;
  rating: number;
  isBanned: boolean;
  isVerified: boolean;
  verificationDocument?: Array<{
    type: 'idCard' | 'passport' | 'driverLicense';
    number: string;
    image: string;
    verifyAt: Date;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  lastLogin?: Date;
  loginHistory?: Array<{
    ip: string;
    device: string;
    timestamp: Date;
  }>;
  notificationSettings: {
    email: boolean;
  };
  comparePassword(enteredPassword: string): Promise<boolean>;
  generateAuthToken(): string;
  hasRole(role: string): boolean;
}

const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ['renter', 'landlord', 'technician', 'admin'],
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxLength: [50, 'Name cannot exceed 50 characters'],
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
        validator: function (v: string) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/.test(
            v
          );
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
        validator: function (v: string[]) {
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
          validator: function (v: number) {
            return v <= (this as any).max;
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
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign({ userId: this._id, role: this.role }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// Check if user has required role
userSchema.methods.hasRole = function (role: string): boolean {
  return this.role === role;
};

const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;
