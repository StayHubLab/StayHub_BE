/**
 * @fileoverview Socket.IO Setup - Handles realtime chat
 * @created 2025-09-28
 * @file socket.js
 * @description This file manages socket.io events for chat.
 */

const chatService = require("../../../../StayHub_BE/StayHub_BE/src/services/chat.service");

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join room theo conversationId
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId.toString());
      console.log(`📌 Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Gửi tin nhắn trực tiếp qua socket (không cần REST API)
    socket.on("sendMessage", async ({ conversationId, content, userId }) => {
      try {
        // Lưu vào DB qua chatService
        const message = await chatService.sendMessage(conversationId, userId, content);

        // Emit cho tất cả client trong room
        io.to(conversationId.toString()).emit("newMessage", message);
      } catch (err) {
        console.error("❌ Error sending message via socket:", err.message);
        socket.emit("errorMessage", { error: "Failed to send message" });
      }
    });

    // Khi disconnect
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
}

module.exports = initSocket;
