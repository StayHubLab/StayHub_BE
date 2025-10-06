/**
 * @fileoverview Socket.IO Setup - Handles realtime chat
 * @created 2025-09-28
 * @file socket.js
 * @description This file manages socket.io events for chat.
 */

const chatService = require('../services/chat.service');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

function initSocket(io) {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Join user to their personal room for direct notifications
    socket.join(`user_${socket.userId}`);

    // Join room theo conversationId với authentication check
    socket.on('joinConversation', async (conversationId) => {
      try {
        // Verify user is participant in this conversation
        const conversation = await chatService.getConversationById(conversationId);
        const isParticipant = conversation.participants.some(p => p._id.toString() === socket.userId);
        
        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(conversationId.toString());
        console.log(`📌 Socket ${socket.id} joined conversation ${conversationId}`);
        
        // Notify other participants that user is online
        socket.to(conversationId.toString()).emit('userOnline', {
          userId: socket.userId,
          userName: socket.user.name
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Gửi tin nhắn trực tiếp qua socket (không cần REST API)
    socket.on('sendMessage', async ({ conversationId, content }) => {
      try {
        // Verify user is participant in this conversation
        const conversation = await chatService.getConversationById(conversationId);
        const isParticipant = conversation.participants.some(p => p._id.toString() === socket.userId);
        
        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to send message to this conversation' });
          return;
        }

        // Lưu vào DB qua chatService
        const message = await chatService.sendMessage(conversationId, socket.userId, content);

        // Emit cho tất cả client trong room (bao gồm cả sender)
        io.to(conversationId.toString()).emit('newMessage', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId.toString()).emit('userTyping', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping
      });
    });

    // Leave conversation
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId.toString());
      socket.to(conversationId.toString()).emit('userOffline', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Khi disconnect
    socket.on('disconnect', () => {
      // Notify all rooms that user is offline
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit('userOffline', {
            userId: socket.userId,
            userName: socket.user.name
          });
        }
      });
    });
  });
}

module.exports = initSocket;
