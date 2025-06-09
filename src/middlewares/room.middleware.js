/**
 * @fileoverview Room Middleware - Contains middleware functions for room model
 * @created 2025-06-06
 * @file room.middleware.js
 * @description This file contains middleware functions for room model validation and processing.
 */

/**
 * Pre-save middleware to ensure room data consistency
 * @param {Function} next - Next middleware function
 */
const validateRoomConsistency = function (next) {
  if (this.status === 'rented' && !this.currentTenant) {
    next(new Error('Rented room must have a current tenant'));
    return;
  }

  if (this.status === 'available') {
    this.isAvailable = true;
  }

  if (this.price) {
    const priceFields = ['rent', 'electricity', 'water', 'service', 'deposit'];
    for (const field of priceFields) {
      if (this.price[field] < 0) {
        next(new Error(`${field} price cannot be negative`));
        return;
      }
    }
  }

  if (this.area < 0) {
    next(new Error('Area cannot be negative'));
    return;
  }

  if (this.capacity < 1) {
    next(new Error('Capacity must be at least 1'));
    return;
  }

  next();
};

/**
 * Pre-update middleware to ensure room data consistency
 * @param {Object} filter - The filter object
 * @param {Object} update - The update object
 * @param {Object} options - The options object
 * @param {Function} next - Next middleware function
 */
const validateRoomUpdate = function (filter, update, options, next) {
  try {
    // If no update object, just proceed
    if (!update) {
      return next();
    }

    // Handle both $set and direct updates
    const updateData = update.$set || update;

    // Check status update
    if (updateData.status === 'rented' && !updateData.currentTenant) {
      return next(new Error('Cannot set room status to rented without a tenant'));
    }

    // Validate price updates
    if (updateData.price) {
      const priceFields = ['rent', 'electricity', 'water', 'service', 'deposit'];
      for (const field of priceFields) {
        if (updateData.price[field] !== undefined && updateData.price[field] < 0) {
          return next(new Error(`${field} price cannot be negative`));
        }
      }
    }

    // Validate area update
    if (updateData.area !== undefined && updateData.area < 0) {
      return next(new Error('Area cannot be negative'));
    }

    // Validate capacity update
    if (updateData.capacity !== undefined && updateData.capacity < 1) {
      return next(new Error('Capacity must be at least 1'));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  validateRoomConsistency,
  validateRoomUpdate,
};
