# 🎯 Quick Start - Chat Integration

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
npm install socket.io-client axios
```

### 2. Basic Chat Service
```javascript
// chatService.js
import io from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
  }

  connect() {
    const token = localStorage.getItem('token');
    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('✅ Chat connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Chat failed:', error.message);
    });

    return this.socket;
  }

  joinConversation(conversationId) {
    this.socket.emit('joinConversation', conversationId);
  }

  sendMessage(conversationId, content) {
    this.socket.emit('sendMessage', { conversationId, content });
  }

  onNewMessage(callback) {
    this.socket.on('newMessage', callback);
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}

export default new ChatService();
```

### 3. React Component Example
```jsx
// ChatComponent.jsx
import React, { useState, useEffect } from 'react';
import chatService from './chatService';

const ChatComponent = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to chat
    const socket = chatService.connect();
    
    socket.on('connect', () => {
      setIsConnected(true);
      chatService.joinConversation(conversationId);
    });

    socket.on('disconnect', () => setIsConnected(false));

    // Listen for messages
    chatService.onNewMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => chatService.disconnect();
  }, [conversationId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      chatService.sendMessage(conversationId, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-status">
        {isConnected ? '🟢 Online' : '🔴 Offline'}
      </div>
      
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.senderName}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!isConnected}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
```

### 4. Get Conversations API
```javascript
// api.js
export const getConversations = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/chat/conversations', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

export const createConversation = async (otherUserId) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/chat/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ participants: [otherUserId] })
  });
  return response.json();
};
```

### 5. CSS Styling
```css
/* chat.css */
.chat-container {
  max-width: 500px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.chat-status {
  background: #f5f5f5;
  padding: 10px;
  text-align: center;
  font-weight: bold;
}

.messages {
  height: 400px;
  overflow-y: auto;
  padding: 15px;
  background: #fafafa;
}

.message {
  margin-bottom: 10px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message-form {
  display: flex;
  padding: 15px;
  background: white;
  border-top: 1px solid #eee;
}

.message-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.message-form button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

## 🎯 Usage in App
```jsx
// App.jsx
import React, { useState, useEffect } from 'react';
import ChatComponent from './ChatComponent';
import { getConversations } from './api';
import './chat.css';

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    // Load conversations on app start
    getConversations().then(response => {
      if (response.success) {
        setConversations(response.data);
        if (response.data.length > 0) {
          setActiveConversation(response.data[0]._id);
        }
      }
    });
  }, []);

  return (
    <div className="app">
      <h1>StayHub Chat</h1>
      
      <div className="chat-sidebar">
        <h3>Conversations</h3>
        {conversations.map(conv => (
          <div 
            key={conv._id}
            className={`conversation-item ${activeConversation === conv._id ? 'active' : ''}`}
            onClick={() => setActiveConversation(conv._id)}
          >
            {conv.participants.map(p => p.name).join(', ')}
          </div>
        ))}
      </div>

      <div className="chat-main">
        {activeConversation ? (
          <ChatComponent conversationId={activeConversation} />
        ) : (
          <p>Select a conversation to start chatting</p>
        )}
      </div>
    </div>
  );
}

export default App;
```

## ⚡ Key Points

1. **Authentication**: Always include JWT token in Socket.IO auth
2. **Join Conversation**: Must join before sending/receiving messages  
3. **Error Handling**: Handle connection failures gracefully
4. **Real-time**: Use Socket.IO events for instant messaging
5. **REST API**: Use for conversations list and message history

## 🔗 Next Steps

1. Login to get JWT token
2. Connect with `chatService.connect()`
3. Join conversation with `joinConversation(conversationId)`
4. Send messages with `sendMessage(conversationId, content)`
5. Listen for new messages with `onNewMessage(callback)`

That's it! Your real-time chat is ready! 🚀