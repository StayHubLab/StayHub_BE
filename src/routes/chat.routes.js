/**
 * @fileoverview Chat Routes - Defines chat API endpoints
 * @created 2025-09-28
 * @file chat.routes.js
 * @description This file defines routes for chat between renter and landlord.
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { auth } = require('../middlewares/auth.middleware');

// Create or get conversation
router.post('/conversations', auth, chatController.createConversation);

// Get all conversations of logged in user
router.get('/conversations', auth, chatController.getConversations);

// Send message
router.post('/messages', auth, chatController.sendMessage);

// Get messages of a conversation
router.get('/messages/:conversationId', auth, chatController.getMessages);

module.exports = router;
