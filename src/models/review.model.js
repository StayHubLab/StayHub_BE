/**
 * @fileoverview Review Model - Single model for room and landlord reviews
 * @created 2025-10-05
 * @file review.model.js
 * @description Unified review model using discriminator pattern
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        targetType: {
            type: String,
            enum: ['room', 'landlord'],
            required: [true, 'Target type is required'],
            index: true,
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            index: true,
        },
        landlordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        renterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Renter ID is required'],
            index: true,
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, 'Comment cannot exceed 500 characters'],
            default: '',
        },
        contractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contract',
        },
        isVerifiedRental: {
            type: Boolean,
            default: false,
        },
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound indexes for efficient queries
reviewSchema.index({ targetType: 1, roomId: 1 });
reviewSchema.index({ targetType: 1, landlordId: 1 });
reviewSchema.index({ renterId: 1, targetType: 1 });
reviewSchema.index({ renterId: 1, roomId: 1 });
reviewSchema.index({ renterId: 1, landlordId: 1 });

// Validation middleware - ensure roomId is set for room reviews
reviewSchema.pre('save', function(next) {
    if (this.targetType === 'room' && !this.roomId) {
        next(new Error('Room ID is required for room reviews'));
    } else if (this.targetType === 'landlord' && !this.landlordId) {
        next(new Error('Landlord ID is required for landlord reviews'));
    } else {
        next();
    }
});

// Static method: Check if renter has already reviewed a room
reviewSchema.statics.hasReviewedRoom = async function(renterId, roomId) {
    const review = await this.findOne({
        targetType: 'room',
        renterId,
        roomId
    });
    return !!review;
};

// Static method: Check if renter has already reviewed a landlord
reviewSchema.statics.hasReviewedLandlord = async function(renterId, landlordId) {
    const review = await this.findOne({
        targetType: 'landlord',
        renterId,
        landlordId
    });
    return !!review;
};

// Static method: Get average rating for a room
reviewSchema.statics.getRoomAverageRating = async function(roomId) {
    const result = await this.aggregate([
        {
            $match: {
                targetType: 'room',
                roomId: new mongoose.Types.ObjectId(roomId)
            }
        },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    return result[0] || { avgRating: 0, totalReviews: 0 };
};

// Static method: Get average rating for a landlord
reviewSchema.statics.getLandlordAverageRating = async function(landlordId) {
    const result = await this.aggregate([
        {
            $match: {
                targetType: 'landlord',
                landlordId: new mongoose.Types.ObjectId(landlordId)
            }
        },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    return result[0] || { avgRating: 0, totalReviews: 0 };
};

// Static method: Get rating distribution for a room
reviewSchema.statics.getRoomRatingDistribution = async function(roomId) {
    const distribution = await this.aggregate([
        {
            $match: {
                targetType: 'room',
                roomId: new mongoose.Types.ObjectId(roomId)
            }
        },
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: -1 }
        }
    ]);

    // Convert to object format
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach(item => {
        dist[item._id] = item.count;
    });

    return dist;
};

// Static method: Get rating distribution for a landlord
reviewSchema.statics.getLandlordRatingDistribution = async function(landlordId) {
    const distribution = await this.aggregate([
        {
            $match: {
                targetType: 'landlord',
                landlordId: new mongoose.Types.ObjectId(landlordId)
            }
        },
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: -1 }
        }
    ]);

    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach(item => {
        dist[item._id] = item.count;
    });

    return dist;
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;