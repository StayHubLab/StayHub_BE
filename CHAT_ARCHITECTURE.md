# 📁 Chat System - File Structure & Architecture

## 🏗️ Backend Architecture

```
src/
├── 📂 socket/
│   └── socket.js                 # Socket.IO event handlers & authentication
├── 📂 services/
│   └── chat.service.js           # Chat business logic & database operations
├── 📂 models/
│   ├── conversation.model.js     # Conversation schema
│   ├── message.model.js          # Message schema
│   └── user.model.js            # User schema (existing)
├── 📂 routes/
│   └── chat.routes.js           # REST API endpoints (to be created)
├── 📂 controllers/
│   └── chat.controller.js       # HTTP request handlers (to be created)
├── 📂 middlewares/
│   └── auth.middleware.js       # JWT authentication middleware
└── app.js                       # Main app with Socket.IO integration
```

## 🔧 Core Components

### 1. Socket.IO Handler (`src/socket/socket.js`)
**Responsibilities:**
- User authentication via JWT
- Real-time event handling (join, send, typing)
- Room management for conversations
- Error handling and validation

**Key Features:**
- JWT token verification
- User session management
- Conversation access control
- Real-time message broadcasting

### 2. Chat Service (`src/services/chat.service.js`)
**Responsibilities:**
- Database operations for conversations and messages
- Business logic for chat features
- Message validation and processing
- Conversation management

**Key Methods:**
```javascript
- getOrCreateConversation(participants)
- sendMessage(conversationId, senderId, content, type)
- getConversationMessages(conversationId, page, limit)
- markMessagesAsRead(conversationId, userId)
- getUserConversations(userId)
```

### 3. Database Models

#### Conversation Model (`src/models/conversation.model.js`)
```javascript
{
  participants: [{ type: ObjectId, ref: 'User' }],
  lastMessage: { type: ObjectId, ref: 'Message' },
  createdAt: Date,
  updatedAt: Date
}
```

#### Message Model (`src/models/message.model.js`)
```javascript
{
  conversationId: { type: ObjectId, ref: 'Conversation' },
  senderId: { type: ObjectId, ref: 'User' },
  senderName: String,
  content: String,
  type: { enum: ['text', 'image', 'file'] },
  readBy: [{
    userId: { type: ObjectId, ref: 'User' },
    readAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Data Flow

### Real-time Message Flow
```
Frontend                 Socket.IO               Backend
   │                        │                      │
   ├─ sendMessage ─────────►│                      │
   │                        ├─ validate auth ────►│
   │                        │                      ├─ save to DB
   │                        │                      ├─ broadcast message
   │                        │◄─ newMessage ────────┤
   │◄─ newMessage ──────────┤                      │
```

### REST API Flow
```
Frontend                 REST API                Backend
   │                        │                      │
   ├─ GET conversations ───►│                      │
   │                        ├─ verify JWT ────────►│
   │                        │                      ├─ query database
   │                        │◄─ conversations ────┤
   │◄─ conversations ───────┤                      │
```

## 📊 Database Schema

### Relationships
```
User (1) ←──── (M) Conversation (M) ────→ (1) User
  │                    │
  │                    ▼
  │               LastMessage (1)
  │                    │
  ▼                    ▼
Message (M) ────────→ Conversation (1)
```

### Indexes for Performance
```javascript
// Conversation indexes
{ "participants": 1 }
{ "updatedAt": -1 }

// Message indexes  
{ "conversationId": 1, "createdAt": -1 }
{ "senderId": 1 }
{ "readBy.userId": 1 }
```

## 🚀 Scalability Considerations

### 1. Database Optimization
- **Pagination**: Messages loaded in pages (50 per page)
- **Indexes**: Optimized queries for conversations and messages
- **Aggregation**: Efficient unread count calculation

### 2. Socket.IO Scaling
- **Rooms**: Users join conversation-specific rooms
- **Redis Adapter**: For multi-server Socket.IO (future)
- **Namespace**: Separate chat namespace from other features

### 3. Memory Management
- **Connection Limits**: Rate limiting on connections
- **Message Limits**: Size and frequency restrictions
- **Cleanup**: Automatic disconnect handling

## 🔒 Security Architecture

### Authentication Flow
```
Client ──► JWT Token ──► Socket.IO Auth ──► User Verification ──► Access Granted
   │                                                │
   └─────────── Redirect to Login ◄─────────────────┘
                  (if auth fails)
```

### Authorization Layers
1. **Socket.IO Middleware**: JWT token verification
2. **Conversation Access**: User must be participant
3. **Message Validation**: Content sanitization
4. **Rate Limiting**: Prevent spam and abuse

## 📈 Monitoring & Logging

### Key Metrics
- **Connection Count**: Active Socket.IO connections
- **Message Volume**: Messages per minute/hour
- **Error Rates**: Failed authentications, message failures
- **Response Times**: API endpoint performance

### Logging Events
```javascript
// Connection events
logger.info('User connected', { userId, socketId });
logger.info('User disconnected', { userId, socketId });

// Message events  
logger.info('Message sent', { conversationId, senderId });
logger.error('Message failed', { error, conversationId });

// Authentication events
logger.warn('Auth failed', { reason, ip });
```

## 🔧 Configuration

### Environment Variables
```bash
# Socket.IO
SOCKET_IO_ORIGINS=http://localhost:3000,https://yourdomain.com
SOCKET_IO_PING_TIMEOUT=60000
SOCKET_IO_PING_INTERVAL=25000

# Chat Settings
CHAT_MESSAGE_MAX_LENGTH=1000
CHAT_RATE_LIMIT=60  # messages per minute
CHAT_TYPING_TIMEOUT=3000  # ms

# Database
MONGODB_URI=mongodb://localhost:27017/stayhub
```

### Production Optimizations
```javascript
// Socket.IO production config
const io = new Server(server, {
  cors: { origin: process.env.SOCKET_IO_ORIGINS.split(',') },
  pingTimeout: process.env.SOCKET_IO_PING_TIMEOUT || 60000,
  pingInterval: process.env.SOCKET_IO_PING_INTERVAL || 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6  // 1MB
});
```

## 🧪 Testing Strategy

### Unit Tests
- Service methods (chat.service.js)
- Model validations
- Utility functions

### Integration Tests  
- Socket.IO event flows
- REST API endpoints
- Database operations

### Load Testing
- Concurrent Socket.IO connections
- Message throughput
- Database performance under load

### Test Files Structure
```
tests/
├── unit/
│   ├── services/
│   │   └── chat.service.test.js
│   └── models/
│       ├── conversation.test.js
│       └── message.test.js
├── integration/
│   ├── socket/
│   │   └── chat.socket.test.js
│   └── api/
│       └── chat.api.test.js
└── load/
    └── socket-load.test.js
```

## 📝 Development Workflow

### 1. Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/chat-improvements

# 2. Develop & test locally
npm run dev
npm test

# 3. Integration testing
npm run test:integration

# 4. Deploy to staging
npm run deploy:staging
```

### 2. Code Review Checklist
- [ ] Authentication properly implemented
- [ ] Error handling comprehensive
- [ ] Database queries optimized
- [ ] Socket.IO events properly handled
- [ ] Rate limiting in place
- [ ] Logging added for monitoring
- [ ] Tests written and passing

### 3. Deployment Pipeline
```yaml
# CI/CD Pipeline
stages:
  - lint & test
  - build
  - deploy to staging
  - integration tests
  - deploy to production
  - smoke tests
```

## 🚀 Future Enhancements

### Phase 1: Core Features ✅
- [x] Real-time messaging
- [x] Conversation management
- [x] User authentication
- [x] Message history
- [x] Typing indicators

### Phase 2: Advanced Features
- [ ] File/image sharing
- [ ] Message reactions (emoji)
- [ ] Message search
- [ ] Push notifications
- [ ] Message encryption

### Phase 3: Scale Features
- [ ] Redis adapter for clustering
- [ ] Message archiving
- [ ] Analytics dashboard
- [ ] Admin moderation tools
- [ ] Voice/video call integration

---

This architecture provides a solid foundation for a scalable, secure real-time chat system! 🏗️