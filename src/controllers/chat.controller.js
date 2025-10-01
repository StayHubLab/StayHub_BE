/**
 * @fileoverview Chat Controller - Handles API requests for chat
 * @created 2025-09-28
 * @file chat.controller.js
 * @description This file defines controller functions for chat routes.
 */

const chatService = require('../services/chat.service');

// Tạo hoặc lấy conversation giữa renter & landlord
// Tạo hoặc lấy conversation
exports.createConversation = async (req, res, next) => {
    try {
      const { recipientId } = req.body;
      const userId = req.user._id;
  
      if (recipientId === userId.toString()) {
        return res.status(400).json({ success: false, message: "Can't chat with yourself" });
      }
  
      const conversation = await chatService.getOrCreateConversation(userId, recipientId);
  
      res.status(200).json({ success: true, conversation });
    } catch (err) {
      next(err);
    }
  };
  
  // Lấy conversation của user
  exports.getConversations = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const conversations = await chatService.getUserConversations(userId);
  
      res.status(200).json({ success: true, conversations });
    } catch (err) {
      next(err);
    }
  };
  
  // Gửi tin nhắn
  exports.sendMessage = async (req, res, next) => {
    try {
      const { conversationId, content } = req.body;
      const userId = req.user._id;
  
      const message = await chatService.sendMessage(conversationId, userId, content);
  
      const io = req.app.get("io");
  
      // emit tin nhắn cho tất cả client trong room
      io.to(conversationId.toString()).emit("newMessage", {
        ...message,
        conversation: conversationId, // đảm bảo có id hội thoại
      });
  
      res.status(201).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  };
  
  
  

// Lấy tin nhắn của 1 conversation
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    const messages = await chatService.getMessages(conversationId, limit, skip);
    res.status(200).json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};
