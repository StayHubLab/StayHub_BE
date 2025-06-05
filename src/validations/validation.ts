/**
 * @fileoverview Validation Utility - Handles validation for the application
 * @created 2025-05-29
 * @file validation.ts
 * @description This file defines the validation utility for the application.
 */

/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if the phone number is valid
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};
