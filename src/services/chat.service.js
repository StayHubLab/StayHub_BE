/**
 * @fileoverview Chat Service - Handles business logic for chat
 * @created 2025-09-28
 * @file chat.service.js
 * @description This file provides services for managing conversations and messages.
 */

const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
// Tạo hoặc lấy conversation giữa 2 user
async function getOrCreateConversation(userId1, userId2) {
  let conversation = await Conversation.findOne({
    participants: { $all: [userId1, userId2] },
  }).populate('participants', 'name email role');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId1, userId2],
    });
  }

  return conversation;
}

// Lấy danh sách conversation của user
async function getUserConversations(userId) {
    return Conversation.find({
      participants: new mongoose.Types.ObjectId(userId), // ✅ ép kiểu
    })
      .populate('participants', 'name email role')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name email role' },
      })
      .sort({ updatedAt: -1 });
  }

// Gửi tin nhắn
async function sendMessage(conversationId, senderId, content) {
    // 1. Tạo message
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content,
    });
  
    // 2. Update lastMessage trong conversation và populate participants
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: message._id, updatedAt: Date.now() },
      { new: true }
    ).populate('participants', 'name email role');
  
    // 3. Populate sender cho message
    const populatedMessage = await message.populate('sender', 'name email role');
  
    // 4. Tìm recipient (người còn lại khác sender)
    const recipient = conversation.participants.find(
      (p) => p._id.toString() !== senderId.toString()
    );
  
    // 5. Trả về sender + recipient + content message
    return {
      ...populatedMessage.toObject(),
      recipient,
    };
  }
  

// Lấy tin nhắn trong 1 conversation
async function getMessages(conversationId, limit = 50, skip = 0) {
  return Message.find({ conversation: conversationId })
    .populate('sender', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  sendMessage,
  getMessages,
};
