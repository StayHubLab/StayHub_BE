/**
 * @fileoverview Contact Request Routes
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const controller = require('../controllers/contact-request.controller');

// Create contact request
router.post('/', auth, controller.create);

// List contact requests
router.get('/', auth, controller.list);

// Tenant sign request
router.put('/:id/sign', auth, controller.signAsTenant);

module.exports = router;
