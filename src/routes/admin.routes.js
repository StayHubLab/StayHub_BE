/**
 * @fileoverview Admin Routes - Handles system management
 * @created 2025-05-29
 * @file admin.routes.js
 * @description This file defines the routes for system administration.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, roleMiddleware } = require('../middlewares/auth.middleware');

// User Management
router.get('/users', auth, roleMiddleware('admin'), userController.getUsers);
router.get('/users/:id', auth, roleMiddleware('admin'), userController.getUserById);
router.put('/users/:id', auth, roleMiddleware('admin'), userController.updateUser);
router.delete('/users/:id', auth, roleMiddleware('admin'), userController.deleteUser);

// Property Management
router.get('/properties', auth, roleMiddleware('admin'), (req, res) => {
  res.json({ message: 'Get all properties' });
});
router.put('/properties/:id/verify', auth, roleMiddleware('admin'), (req, res) => {
  res.json({ message: 'Verify property' });
});

// Dashboard
router.get('/dashboard', auth, roleMiddleware('admin'), (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

module.exports = router;
