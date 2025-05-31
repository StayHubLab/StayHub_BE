/**
 * @fileoverview Validation Utility - Handles validation for the application
 * @created 2025-05-29
 * @file validation.js
 * @description This file defines the validation utility for the application.
 */

const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  validateEmail,
  validatePhone,
};
