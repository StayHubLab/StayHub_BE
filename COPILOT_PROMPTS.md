# 🤖 Copilot Prompt Template - Real-time Chat Integration

## 📝 Basic Prompt (React/Next.js)

```
I need to integrate a real-time chat system into my React/Next.js application. 

Backend API Details:
- REST API: http://localhost:5000
- Socket.IO Server: http://localhost:5000
- Authentication: JWT Bearer token

Requirements:
1. Install socket.io-client dependency
2. Create a ChatService class to handle Socket.IO connections
3. Implement chat components with real-time messaging
4. Add authentication with JWT tokens
5. Handle connection errors and reconnection

Please create:
- ChatService.js (Socket.IO client wrapper)
- ChatProvider.jsx (React context for chat state)
- ChatRoom.jsx (main chat component)
- ConversationList.jsx (list of conversations)

API Endpoints:
- GET /api/chat/conversations (get user conversations)
- POST /api/chat/conversations (create new conversation)
- GET /api/chat/conversations/:id/messages (get message history)

Socket.IO Events:
- Emit: 'joinConversation', 'sendMessage', 'typing'
- Listen: 'newMessage', 'userTyping', 'joinedConversation'

Include error handling, typing indicators, and message pagination.
```

## 🎯 Detailed Prompt (với specific requirements)

```
I'm building a chat feature for my [React/Vue/Angular] application and need to connect to an existing Socket.IO backend.

Backend Configuration:
- Base URL: http://localhost:5000
- Authentication: JWT token in Socket.IO auth object
- CORS enabled for frontend domain

Technical Requirements:
1. **Authentication Flow:**
   - Login via POST /api/auth/login to get JWT token
   - Use token for Socket.IO connection: io(url, { auth: { token } })
   - Handle authentication failures with redirect to login

2. **Chat Features:**
   - Real-time messaging between users
   - Conversation list with last message preview
   - Message history with pagination (50 messages per page)
   - Typing indicators when users are typing
   - Online/offline status indicators
   - Auto-scroll to latest messages

3. **Components Structure:**
   ```
   components/
   ├── chat/
   │   ├── ChatService.js        # Socket.IO client wrapper
   │   ├── ChatProvider.jsx      # React context + state management
   │   ├── ChatLayout.jsx        # Main chat layout
   │   ├── ConversationList.jsx  # Sidebar with conversations
   │   ├── ChatRoom.jsx          # Message display + input
   │   ├── MessageItem.jsx       # Individual message component
   │   └── TypingIndicator.jsx   # Typing status display
   ```

4. **State Management:**
   - Current user information
   - List of conversations with participants
   - Messages for each conversation
   - Typing status for users
   - Connection status (online/offline)
   - Unread message counts

5. **Socket.IO Events to Handle:**
   
   **Outgoing (Client → Server):**
   - `joinConversation(conversationId)` - Join a conversation room
   - `sendMessage({ conversationId, content, type })` - Send message
   - `typing({ conversationId, isTyping })` - Typing indicator
   - `leaveConversation(conversationId)` - Leave conversation

   **Incoming (Server → Client):**
   - `newMessage(message)` - Receive new message
   - `userTyping({ userId, userName, conversationId, isTyping })` - User typing status
   - `joinedConversation({ conversationId })` - Successfully joined conversation
   - `conversationError(error)` - Conversation-related errors

6. **REST API Integration:**
   ```javascript
   // Get conversations
   GET /api/chat/conversations
   Headers: { Authorization: 'Bearer <token>' }

   // Get message history  
   GET /api/chat/conversations/:id/messages?page=1&limit=50
   Headers: { Authorization: 'Bearer <token>' }

   // Create conversation
   POST /api/chat/conversations
   Body: { participants: ['userId1', 'userId2'] }
   Headers: { Authorization: 'Bearer <token>' }
   ```

7. **Error Handling:**
   - Socket connection failures
   - Authentication token expiry
   - Network disconnections with auto-reconnect
   - Message send failures with retry option
   - Invalid conversation access

8. **UI/UX Features:**
   - Responsive design for mobile/desktop
   - Message timestamps with relative time (e.g., "2 minutes ago")
   - Sent/delivered/read message status
   - Emoji support in messages
   - Auto-scroll to bottom when new messages arrive
   - Search functionality for conversations

9. **Performance Optimizations:**
   - Virtual scrolling for large message lists
   - Debounced typing indicators
   - Lazy loading of conversation messages
   - Optimistic UI updates for sent messages

Please provide a complete implementation with proper error handling, TypeScript support (if applicable), and modern React patterns (hooks, context, etc.).

For Ant Design integration:
- Use Layout component for main structure
- List component for conversations and messages
- Input.TextArea for message composition
- Badge for unread counts
- Avatar for user pictures
- Typography components for text display
- Space and Divider for proper layout
- Notification API for error messages
```

## 🔧 Framework-Specific Prompts

### Vue.js Prompt
```
I need to integrate Socket.IO real-time chat into my Vue 3 application using Composition API.

Create:
- useChatService.js (composable for Socket.IO)
- ChatStore.js (Pinia store for chat state)
- ChatLayout.vue (main chat component)
- ConversationList.vue (sidebar)
- ChatRoom.vue (message area)

Backend: Socket.IO server at http://localhost:5000 with JWT authentication
Events: joinConversation, sendMessage, newMessage, userTyping
```

### Angular Prompt  
```
I need to add real-time chat to my Angular application using Socket.IO.

Create:
- ChatService (Angular service for Socket.IO)
- ChatModule (feature module)
- chat-layout.component
- conversation-list.component  
- chat-room.component
- Message interface and models

Backend: http://localhost:5000 with JWT auth in Socket.IO handshake
Use Angular reactive forms for message input and RxJS for state management.
```

### React Native Prompt
```
I need to implement real-time chat in my React Native app using Socket.IO.

Create:
- ChatService.js (Socket.IO client for React Native)
- ChatProvider.jsx (Context provider)
- ChatScreen.jsx (main chat screen)
- ConversationList.jsx (FlatList of conversations)
- ChatRoom.jsx (message list + input)

Use React Native components like FlatList for messages, TextInput for typing.
Handle app background/foreground states for Socket.IO connection.
```

## 🎨 UI Framework Specific

### With Ant Design (antd)
```
Add this to any prompt above:

Use Ant Design components:
- Layout with Sider for conversation sidebar
- List with List.Item for conversations and messages
- Input with Input.TextArea for message composition
- Button with icon for send action
- Badge for unread message counts
- Avatar for user profile pictures
- Skeleton for loading states
- Typography.Text for message content
- Space for proper spacing
- Divider for visual separation
- Tooltip for additional information
- Spin for loading indicators

Apply Ant Design principles with consistent spacing, proper theme usage, and responsive design.
```

### With Tailwind CSS
```
Add this to any prompt above:

Style with Tailwind CSS:
- Responsive grid layout (sidebar + main chat)
- Dark/light mode support
- Smooth animations for message appearance
- Hover effects on conversations
- Mobile-first responsive design
- Custom scrollbar styling
```

## 🎯 React + Ant Design Complete Prompt

```
I need to implement a real-time chat system in my React application using Ant Design components.

Backend Configuration:
- Socket.IO Server: http://localhost:5000
- Authentication: JWT Bearer token in Socket.IO auth
- CORS enabled for frontend domain

Requirements:
1. Install dependencies: socket.io-client antd @ant-design/icons

2. Create these components using Ant Design:
   - ChatService.js (Socket.IO client wrapper)
   - ChatProvider.jsx (React Context for chat state)
   - ChatLayout.jsx (Main layout with Ant Design Layout)
   - ConversationList.jsx (Sider with List component)
   - ChatRoom.jsx (Message area with Input.TextArea)
   - MessageItem.jsx (Individual message with Typography)
   - TypingIndicator.jsx (Using Spin component)

3. Ant Design Components to Use:
   - Layout, Sider, Content for main structure
   - List, List.Item for conversations and messages
   - Avatar for user profile pictures
   - Badge for unread message counts
   - Input, Input.TextArea for message input
   - Button with SendOutlined icon
   - Typography.Text, Typography.Time for message content
   - Space for proper spacing between elements
   - Divider for visual separation
   - Skeleton for loading states
   - Tooltip for timestamps and user info
   - Spin for loading indicators

4. Features to Implement:
   - Real-time messaging with Socket.IO events
   - Conversation list with last message preview
   - Message history with pagination
   - Typing indicators with user names
   - Online/offline status with Badge
   - Auto-scroll to latest messages
   - Responsive design for mobile/desktop
   - Error handling with notification component

5. Socket.IO Events:
   - Emit: 'joinConversation', 'sendMessage', 'typing'
   - Listen: 'newMessage', 'userTyping', 'joinedConversation', 'conversationError'

6. State Management:
   - Use React Context for chat state
   - Store conversations, messages, typing status
   - Handle connection status and errors

7. API Integration:
   - GET /api/chat/conversations (with antd List)
   - POST /api/chat/conversations (create new chat)
   - GET /api/chat/conversations/:id/messages (message history)

8. Ant Design Theming:
   - Use consistent spacing (antd's design tokens)
   - Proper color scheme for sent/received messages
   - Responsive breakpoints for mobile adaptation
   - Loading states with Skeleton components

9. Error Handling:
   - Use notification.error() for Socket.IO failures
   - message.warning() for authentication issues
   - Graceful fallbacks with Empty component

Please provide complete implementation with proper TypeScript support, modern React hooks, and Ant Design best practices.
```

## 🔍 Testing Prompt Addition

```
Also include:
- Unit tests for ChatService methods
- Integration tests for Socket.IO events
- Mock Socket.IO server for testing
- Test utilities for chat components
- E2E tests for complete chat flow

Use [Jest/Vitest/Cypress] for testing framework.
```

## ⚡ Quick Start Prompt for React + Ant Design

```
I need a real-time chat component for React using Ant Design.

Requirements:
- Socket.IO client connecting to http://localhost:5000
- JWT authentication from localStorage
- Ant Design components: Layout, List, Input, Button, Avatar, Badge

Create:
1. ChatComponent.jsx - Main chat interface using antd Layout
2. ConversationList.jsx - Sidebar with antd List component
3. MessageArea.jsx - Messages display with antd Typography
4. MessageInput.jsx - Input area with antd Input.TextArea

Features:
- Real-time messaging via Socket.IO
- Join conversation: socket.emit('joinConversation', conversationId)
- Send message: socket.emit('sendMessage', {conversationId, content})
- Listen for: socket.on('newMessage', handleNewMessage)
- Use antd notification for errors
- Responsive layout with antd breakpoints

Keep it clean and use Ant Design design tokens for consistent styling.
```

---

## 💡 Pro Tips cho Prompt:

1. **Specify Framework**: React, Vue, Angular, React Native
2. **Include Backend Details**: API URLs, authentication method
3. **List Required Features**: What functionality you need
4. **Mention UI Framework**: Material-UI, Tailwind, Bootstrap
5. **Add Error Handling**: How to handle failures
6. **Include Testing**: If you need tests
7. **Specify File Structure**: Where components should go

**Copy any of these prompts và customize theo project cụ thể!** 🚀