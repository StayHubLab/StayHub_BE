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
 * @param {Object} update - The update object
 * @param {Function} next - Next middleware function
 */
const validateRoomUpdate = function (update, next) {
  if (update.$set && update.$set.status === 'rented' && !update.$set.currentTenant) {
    next(new Error('Cannot set room status to rented without a tenant'));
    return;
  }

  // Validate price updates
  if (update.$set && update.$set.price) {
    const priceFields = ['rent', 'electricity', 'water', 'service', 'deposit'];
    for (const field of priceFields) {
      if (update.$set.price[field] < 0) {
        next(new Error(`${field} price cannot be negative`));
        return;
      }
    }
  }

  next();
};

module.exports = {
  validateRoomConsistency,
  validateRoomUpdate,
};
