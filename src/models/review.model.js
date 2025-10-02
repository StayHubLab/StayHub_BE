const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        targetType: {
            type: String,
            enum: ['room', 'landlord'],
            required: true,
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
        },
        landlordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        renterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, 'Comment cannot exceed 500 characters'],
            default: '',
        },
    },
    { timestamps: true }
);

reviewSchema.index({ roomId: 1 });
reviewSchema.index({ landlordId: 1 });
reviewSchema.index({ renterId: 1 });

module.exports = mongoose.model('Review', reviewSchema);