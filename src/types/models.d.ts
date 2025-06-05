import { Document, Types } from 'mongoose';

// Common Types
export interface Address {
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// User Types
export interface UserDocument extends Document {
  role: 'renter' | 'landlord' | 'technician' | 'admin';
  name: string;
  email: string;
  phone: string;
  password: string;
  address: Address;
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

export interface UserCreateInput {
  role: 'renter' | 'landlord' | 'technician' | 'admin';
  name: string;
  email: string;
  phone: string;
  password: string;
  address: Address;
  dob?: Date;
  gender?: 'male' | 'female' | 'other';
  preferredUtilities?: string[];
  preferredPriceRange?: {
    min: number;
    max: number;
  };
  avatar?: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  address?: Address;
  dob?: Date;
  gender?: 'male' | 'female' | 'other';
  preferredUtilities?: string[];
  preferredPriceRange?: {
    min: number;
    max: number;
  };
  avatar?: string;
  isBanned?: boolean;
  isVerified?: boolean;
}

// Building Types
export interface BuildingImage {
  url: string;
  type: 'exterior' | 'interior' | 'room' | 'amenity';
  isVerified: boolean;
  uploadedAt: Date;
}

export interface NearbyPlace {
  name: string;
  type: string;
  distance: number;
}

export interface PremiumFeatures {
  isPremium: boolean;
  premiumUntil?: Date;
  featuredUntil?: Date;
}

export interface BuildingDocument extends Document {
  hostId: Types.ObjectId;
  name: string;
  address: Address & { coordinates: Coordinates };
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
  images: BuildingImage[];
  nearbyPlaces: NearbyPlace[];
  premiumFeatures: PremiumFeatures;
  status: 'active' | 'inactive' | 'pending';
  occupancyRate: number;
  isPremium: boolean;
  updateAvailability(rooms: number): Promise<BuildingDocument>;
}

export interface BuildingCreateInput {
  hostId: Types.ObjectId;
  name: string;
  address: Address & { coordinates: Coordinates };
  description?: string;
  floors?: number;
  area: number;
  avgPrice: number;
  highlightPoints: string[];
  rulesFile?: string;
  mapLink?: string;
  seoTitle?: string;
  seoDescription?: string;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  images: BuildingImage[];
  nearbyPlaces: NearbyPlace[];
  premiumFeatures?: PremiumFeatures;
  status?: 'active' | 'inactive' | 'pending';
}

export interface BuildingUpdateInput {
  name?: string;
  address?: Address & { coordinates: Coordinates };
  description?: string;
  floors?: number;
  area?: number;
  avgPrice?: number;
  highlightPoints?: string[];
  rulesFile?: string;
  mapLink?: string;
  seoTitle?: string;
  seoDescription?: string;
  totalRooms?: number;
  availableRooms?: number;
  amenities?: string[];
  images?: BuildingImage[];
  nearbyPlaces?: NearbyPlace[];
  premiumFeatures?: PremiumFeatures;
  status?: 'active' | 'inactive' | 'pending';
}

// Token Blacklist Types
export interface TokenBlacklistDocument extends Document {
  token: string;
  expiresAt: Date;
}

export interface TokenBlacklistCreateInput {
  token: string;
  expiresAt: Date;
}
