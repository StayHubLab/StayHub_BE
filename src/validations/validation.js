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

const validatePassword = (password) => {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const conditionsMet = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  return password.length >= 8 && conditionsMet >= 3;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
};
