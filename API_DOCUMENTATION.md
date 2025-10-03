# 📡 API Documentation - Chat System

## 🔐 Authentication

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🗨️ Chat REST Endpoints

### 📋 Get User Conversations
```http
GET /api/chat/conversations
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "670f1234567890abcdef1234",
      "participants": [
        {
          "_id": "user1_id",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "avatar_url"
        },
        {
          "_id": "user2_id", 
          "name": "Jane Smith",
          "email": "jane@example.com",
          "avatar": "avatar_url"
        }
      ],
      "lastMessage": {
        "_id": "message_id",
        "content": "Hello there!",
        "senderId": "user1_id",
        "senderName": "John Doe",
        "createdAt": "2025-10-03T14:30:00.000Z"
      },
      "unreadCount": 2,
      "createdAt": "2025-10-03T10:00:00.000Z",
      "updatedAt": "2025-10-03T14:30:00.000Z"
    }
  ]
}
```

### 📝 Create Conversation
```http
POST /api/chat/conversations
Content-Type: application/json

{
  "participants": ["user_id_1", "user_id_2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "670f1234567890abcdef1234",
    "participants": [...],
    "createdAt": "2025-10-03T14:35:00.000Z",
    "updatedAt": "2025-10-03T14:35:00.000Z"
  }
}
```

### 💬 Get Conversation Messages
```http
GET /api/chat/conversations/:conversationId/messages?page=1&limit=50
```

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Messages per page, default 50

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "conversationId": "conversation_id",
        "senderId": "user_id",
        "senderName": "John Doe",
        "content": "Hello there!",
        "type": "text",
        "readBy": [
          {
            "userId": "user_id",
            "readAt": "2025-10-03T14:30:00.000Z"
          }
        ],
        "createdAt": "2025-10-03T14:25:00.000Z",
        "updatedAt": "2025-10-03T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 125,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### ✅ Mark Messages as Read
```http
PUT /api/chat/conversations/:conversationId/read
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

## 🔌 Socket.IO Events

### 🚀 Connection
```javascript
// Client connects with JWT token
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

### 📨 Client → Server Events

#### Join Conversation
```javascript
socket.emit('joinConversation', conversationId);
```

#### Send Message  
```javascript
socket.emit('sendMessage', {
  conversationId: 'conversation_id',
  content: 'Hello world!',
  type: 'text' // 'text', 'image', 'file'
});
```

#### Typing Indicator
```javascript
// Start typing
socket.emit('typing', {
  conversationId: 'conversation_id',
  isTyping: true
});

// Stop typing  
socket.emit('typing', {
  conversationId: 'conversation_id',
  isTyping: false
});
```

#### Leave Conversation
```javascript
socket.emit('leaveConversation', conversationId);
```

### 📬 Server → Client Events

#### Connection Events
```javascript
// Successful connection
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// Connection error
socket.on('connect_error', (error) => {
  console.log('Error:', error.message);
  // Possible errors:
  // - "Authentication token required"
  // - "User not found" 
  // - "Authentication failed"
});

// Disconnection
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

#### Conversation Events
```javascript
// Successfully joined conversation
socket.on('joinedConversation', (data) => {
  console.log('Joined:', data.conversationId);
});

// Conversation error
socket.on('conversationError', (error) => {
  console.log('Conversation error:', error);
  // Possible errors:
  // - "Conversation not found"
  // - "Access denied"
});
```

#### Message Events
```javascript
// New message received
socket.on('newMessage', (message) => {
  console.log('New message:', message);
  // Message object same as REST API format
});

// Message send error
socket.on('messageError', (error) => {
  console.log('Message error:', error);
});
```

#### Typing Events
```javascript
// User typing status
socket.on('userTyping', (data) => {
  console.log('User typing:', data);
  // {
  //   userId: 'user_id',
  //   userName: 'John Doe', 
  //   conversationId: 'conversation_id',
  //   isTyping: true
  // }
});
```

## 🎯 Complete Flow Example

### 1. Login & Connect
```javascript
// 1. Login to get token
const login = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await login.json();
localStorage.setItem('token', data.token);

// 2. Connect to Socket.IO
const socket = io('http://localhost:5000', {
  auth: { token: data.token }
});
```

### 2. Load Conversations
```javascript
// Get user's conversations
const conversations = await fetch('/api/chat/conversations', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data } = await conversations.json();
console.log('Conversations:', data);
```

### 3. Join & Chat
```javascript
// Join a conversation
const conversationId = data[0]._id;
socket.emit('joinConversation', conversationId);

// Listen for messages
socket.on('newMessage', (message) => {
  displayMessage(message);
});

// Send a message
socket.emit('sendMessage', {
  conversationId,
  content: 'Hello!'
});
```

### 4. Handle Typing
```javascript
let typingTimer;

// On input change
input.addEventListener('input', () => {
  socket.emit('typing', { conversationId, isTyping: true });
  
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit('typing', { conversationId, isTyping: false });
  }, 3000);
});

// Listen for others typing
socket.on('userTyping', ({ userName, isTyping }) => {
  if (isTyping) {
    showTypingIndicator(`${userName} is typing...`);
  } else {
    hideTypingIndicator();
  }
});
```

## ⚠️ Error Handling

### Common HTTP Errors
```json
// 401 Unauthorized
{
  "success": false,
  "message": "Invalid or expired token"
}

// 404 Not Found  
{
  "success": false,
  "message": "Conversation not found"
}

// 403 Forbidden
{
  "success": false, 
  "message": "Access denied to this conversation"
}

// 400 Bad Request
{
  "success": false,
  "message": "Invalid conversation participants"
}
```

### Socket.IO Error Events
```javascript
// Authentication errors
socket.on('connect_error', (error) => {
  switch(error.message) {
    case 'Authentication token required':
      // Redirect to login
      break;
    case 'User not found':
      // Token valid but user doesn't exist
      break;
    case 'Authentication failed':
      // Invalid token
      break;
  }
});

// Conversation errors
socket.on('conversationError', (error) => {
  // Handle conversation-specific errors
  showError(error);
});

// Message errors
socket.on('messageError', (error) => {
  // Handle message send failures
  showError(error);
});
```

## 📊 Rate Limits

- **REST API**: 100 requests per minute per user
- **Socket.IO Messages**: 60 messages per minute per user
- **Typing Events**: 10 events per minute per conversation

## 🔒 Security Notes

1. **JWT Token**: Include in every request, expires in 15 minutes
2. **Conversation Access**: Users can only access conversations they're part of
3. **Message Validation**: Content is sanitized server-side
4. **Rate Limiting**: Prevents spam and abuse

## 🚀 Production URLs

### Development
```
REST API: http://localhost:5000
Socket.IO: http://localhost:5000
```

### Production
```
REST API: https://your-api-domain.com
Socket.IO: https://your-api-domain.com
```

---

Need help? Check the troubleshooting section in `FRONTEND_CHAT_INTEGRATION.md`! 🆘