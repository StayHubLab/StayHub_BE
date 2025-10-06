# 🚀 StayHub Chat System - Frontend Integration Guide

## 📋 Overview
Complete guide for integrating StayHub's real-time chat system with your frontend application.

## 🔧 Prerequisites

### Backend Requirements
- Server running on `http://localhost:5000`
- JWT authentication enabled
- Socket.IO server initialized
- MongoDB connected

### Frontend Requirements
```bash
npm install socket.io-client axios
```

## 🔐 Authentication Flow

### 1. Login & Get JWT Token
```javascript
// Login API call
const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token for Socket.IO connection
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### 2. Socket.IO Connection Setup
```javascript
import io from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
    this.currentUser = null;
  }

  // Connect to Socket.IO server
  connect() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    this.currentUser = user;
    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.setupEventListeners();
    return this.socket;
  }

  // Setup event listeners
  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to chat server');
      console.log('Socket ID:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection failed:', error.message);
      // Handle authentication errors
      if (error.message === 'User not found' || error.message === 'Authentication failed') {
        this.handleAuthError();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from chat server');
    });
  }

  // Handle authentication errors
  handleAuthError() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
```

## 💬 Chat Operations

### 1. Get/Create Conversation
```javascript
const getOrCreateConversation = async (otherUserId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/chat/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ participants: [otherUserId] })
    });
    
    const data = await response.json();
    return data.data; // Returns conversation object
  } catch (error) {
    console.error('Failed to get conversation:', error);
    throw error;
  }
};
```

### 2. Join Conversation (Socket.IO)
```javascript
const joinConversation = (conversationId) => {
  if (!chatService.socket) {
    throw new Error('Socket not connected');
  }
  
  chatService.socket.emit('joinConversation', conversationId);
  
  // Listen for join confirmation
  chatService.socket.on('joinedConversation', (data) => {
    console.log('✅ Joined conversation:', data.conversationId);
  });
  
  // Listen for join errors
  chatService.socket.on('conversationError', (error) => {
    console.error('❌ Join failed:', error);
  });
};
```

### 3. Send Message
```javascript
const sendMessage = (conversationId, content, type = 'text') => {
  if (!chatService.socket) {
    throw new Error('Socket not connected');
  }
  
  const messageData = {
    conversationId,
    content,
    type
  };
  
  chatService.socket.emit('sendMessage', messageData);
};
```

### 4. Listen for New Messages
```javascript
const setupMessageListener = (onNewMessage) => {
  chatService.socket.on('newMessage', (message) => {
    console.log('📨 New message received:', message);
    onNewMessage(message);
  });
};
```

### 5. Typing Indicators
```javascript
// Start typing
const startTyping = (conversationId) => {
  chatService.socket.emit('typing', { conversationId, isTyping: true });
};

// Stop typing
const stopTyping = (conversationId) => {
  chatService.socket.emit('typing', { conversationId, isTyping: false });
};

// Listen for typing events
const setupTypingListener = (onTypingChange) => {
  chatService.socket.on('userTyping', (data) => {
    onTypingChange(data); // { userId, conversationId, isTyping, userName }
  });
};
```

## 📱 React Integration Example

### ChatProvider Component
```jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatService] = useState(new ChatService());
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        chatService.connect();
        
        chatService.socket.on('connect', () => setIsConnected(true));
        chatService.socket.on('disconnect', () => setIsConnected(false));
        
        // Setup message listener
        chatService.socket.on('newMessage', (message) => {
          setMessages(prev => ({
            ...prev,
            [message.conversationId]: [
              ...(prev[message.conversationId] || []),
              message
            ]
          }));
        });
        
      } catch (error) {
        console.error('Chat connection failed:', error);
      }
    }

    return () => chatService.disconnect();
  }, []);

  const sendMessage = (conversationId, content) => {
    chatService.socket.emit('sendMessage', { conversationId, content });
  };

  const joinConversation = (conversationId) => {
    chatService.socket.emit('joinConversation', conversationId);
    setActiveConversation(conversationId);
  };

  const value = {
    isConnected,
    conversations,
    activeConversation,
    messages,
    sendMessage,
    joinConversation,
    chatService
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
```

### Chat Component Example
```jsx
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from './ChatProvider';

const ChatRoom = ({ conversationId }) => {
  const { messages, sendMessage, joinConversation, isConnected } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState([]);
  const messagesEndRef = useRef(null);

  const conversationMessages = messages[conversationId] || [];

  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      sendMessage(conversationId, newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>Chat Room</h3>
        <span className={`status ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>

      <div className="messages-container">
        {conversationMessages.map((message) => (
          <div 
            key={message._id} 
            className={`message ${message.senderId === currentUser?.id ? 'own' : 'other'}`}
          >
            <div className="message-content">{message.content}</div>
            <div className="message-time">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {typing.length > 0 && (
          <div className="typing-indicator">
            {typing.map(user => user.userName).join(', ')} đang nhập...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!isConnected || !newMessage.trim()}>
          Gửi
        </button>
      </form>
    </div>
  );
};
```

## 🎯 REST API Endpoints

### Get User Conversations
```javascript
GET /api/chat/conversations
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "conversationId",
      "participants": [...],
      "lastMessage": {...},
      "updatedAt": "2025-10-03T..."
    }
  ]
}
```

### Get Conversation Messages
```javascript
GET /api/chat/conversations/:conversationId/messages?page=1&limit=50
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "messages": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    }
  }
}
```

### Create Conversation
```javascript
POST /api/chat/conversations
Headers: Authorization: Bearer <token>
Body: {
  "participants": ["userId1", "userId2"]
}

Response:
{
  "success": true,
  "data": {
    "_id": "conversationId",
    "participants": [...],
    "createdAt": "2025-10-03T..."
  }
}
```

## 🔄 Socket.IO Events

### Client → Server Events
```javascript
// Join conversation
socket.emit('joinConversation', conversationId);

// Send message
socket.emit('sendMessage', {
  conversationId: 'conversationId',
  content: 'Hello!',
  type: 'text'
});

// Typing indicator
socket.emit('typing', {
  conversationId: 'conversationId',
  isTyping: true
});

// Leave conversation
socket.emit('leaveConversation', conversationId);
```

### Server → Client Events
```javascript
// New message received
socket.on('newMessage', (message) => {
  // Handle new message
});

// User joined conversation
socket.on('joinedConversation', (data) => {
  // User successfully joined
});

// User typing
socket.on('userTyping', (data) => {
  // { userId, conversationId, isTyping, userName }
});

// Conversation error
socket.on('conversationError', (error) => {
  // Handle errors
});

// Connection events
socket.on('connect', () => {
  // Connected successfully
});

socket.on('connect_error', (error) => {
  // Connection failed
});
```

## 🛠️ Error Handling

### Common Error Scenarios
```javascript
// Token expired/invalid
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication failed') {
    // Redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
});

// Network disconnection
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server initiated disconnect
    // Show reconnection UI
  }
  // Auto-reconnect is handled by Socket.IO
});

// Message send failure
socket.on('messageError', (error) => {
  // Show error to user
  // Optionally retry sending
});
```

## 🔒 Security Best Practices

1. **Token Management**
   - Store JWT in localStorage/sessionStorage
   - Implement token refresh logic
   - Clear tokens on logout

2. **Input Validation**
   - Sanitize message content
   - Validate conversation access
   - Rate limiting on client side

3. **Error Handling**
   - Don't expose sensitive error details
   - Implement retry logic for failed connections
   - Graceful degradation when offline

## 🚀 Deployment Considerations

### Development
```javascript
const SOCKET_URL = 'http://localhost:5000';
```

### Production
```javascript
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://your-api-domain.com';
```

### Environment Variables
```bash
# .env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_SOCKET_URL=https://your-api-domain.com
```

## 📝 Testing

### Test Socket Connection
```javascript
const testConnection = () => {
  const socket = io('http://localhost:5000', {
    auth: { token: 'your-jwt-token' }
  });

  socket.on('connect', () => {
    console.log('✅ Test connection successful');
    socket.disconnect();
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Test connection failed:', error.message);
  });
};
```

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for your frontend domain
   - Check browser console for specific CORS errors

2. **Authentication Failures**
   - Verify JWT token is valid and not expired
   - Check token format in Socket.IO auth

3. **Messages Not Received**
   - Confirm user joined conversation successfully
   - Check if conversation exists and user has access

4. **Connection Timeouts**
   - Verify server is running and accessible
   - Check network connectivity
   - Review server logs for errors

### Debug Tools
```javascript
// Enable Socket.IO debugging
localStorage.debug = 'socket.io-client:*';

// Check connection status
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socket.id);
```

---

## 📞 Support

For technical issues or questions:
- Check server logs: `logs/combined.log`
- Review Socket.IO events in browser DevTools
- Test REST APIs with Postman first
- Verify JWT token validity

Happy coding! 🚀