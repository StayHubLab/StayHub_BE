/**
 * @fileoverview Saved Room Model - MongoDB model for saved/favorite rooms
 * @created 2025-09-25
 * @file saved-room.model.js
 * @description Mongoose model for managing user's saved rooms
 */

const mongoose = require('mongoose');

const savedRoomSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'saved_rooms',
  }
);

// Compound index to prevent duplicate saves and optimize queries
savedRoomSchema.index({ userId: 1, roomId: 1 }, { unique: true });

// Instance methods
savedRoomSchema.methods.toJSON = function () {
  const savedRoom = this.toObject();
  return {
    _id: savedRoom._id,
    userId: savedRoom.userId,
    roomId: savedRoom.roomId,
    savedAt: savedRoom.savedAt,
    createdAt: savedRoom.createdAt,
    updatedAt: savedRoom.updatedAt,
  };
};

// Static methods
savedRoomSchema.statics.findByUser = function (userId) {
  return this.find({ userId }).populate('roomId');
};

savedRoomSchema.statics.findByUserAndRoom = function (userId, roomId) {
  return this.findOne({ userId, roomId });
};

savedRoomSchema.statics.isRoomSaved = async function (userId, roomId) {
  const savedRoom = await this.findOne({ userId, roomId });
  return !!savedRoom;
};

const SavedRoom = mongoose.model('SavedRoom', savedRoomSchema);

module.exports = SavedRoom;
