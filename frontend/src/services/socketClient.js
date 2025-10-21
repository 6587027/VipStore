// frontend/src/services/socketClient.js

import { io } from 'socket.io-client';

// 🔗 API URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com';
const SOCKET_URL = 'https://vipstore-backend.onrender.com'; 

// const SOCKET_URL = API_BASE_URL.replace('/api', ''); // Remove /api for socket connection

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// const SOCKET_URL = 'http://localhost:3001'; // ✅ Socket server URL


// console.log('🔌 Socket connecting to:', SOCKET_URL);


// 🔌 Socket.IO Client Configuration
const socketConfig = {
  transports: ['websocket', 'polling'],
  autoConnect: false, // Manual connection control
  reconnection: true,
  reconnectionDelay: 100000,
  reconnectionAttempts: 5,
  timeout: 10000,
  forceNew: true
};

// 🏠 Create Socket Instance
let socket = null;

// 📊 Connection State
let connectionState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  reconnectAttempts: 0
};

// 📋 Event Listeners Storage
const eventListeners = new Map();

// 🔌 Socket Connection Management
export const socketManager = {
  
  // 🚀 Connect to Socket
  connect: (userInfo) => {
    return new Promise((resolve, reject) => {
      try {
        if (socket && socket.connected) {
          console.log('✅ Socket already connected');
          resolve(socket);
          return;
        }

        connectionState.isConnecting = true;
        connectionState.error = null;

        // Create new socket connection
        socket = io(`${SOCKET_URL}/chat`, socketConfig);

        // Connection Events
        socket.on('connect', () => {
          console.log('🔗 Socket connected:', socket.id);
          connectionState.isConnected = true;
          connectionState.isConnecting = false;
          connectionState.error = null;
          connectionState.reconnectAttempts = 0;

          // Join chat with user info
          if (userInfo) {
            console.log('🔥 Emitting join_chat event:', userInfo);
            socket.emit('join_chat', {
              userId: userInfo.userId || userInfo._id,
              userType: userInfo.userType || userInfo.role,
              userName: userInfo.userName || userInfo.firstName || userInfo.username,
              userEmail: userInfo.userEmail || userInfo.email
            });
          }

          resolve(socket);
        });

        socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          connectionState.isConnecting = false;
          connectionState.error = error.message;
          reject(error);
        });

        socket.on('disconnect', (reason) => {
          console.log('📡 Socket disconnected:', reason);
          connectionState.isConnected = false;
          connectionState.isConnecting = false;
        });

        socket.on('reconnect', (attemptNumber) => {
          console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
          connectionState.reconnectAttempts = attemptNumber;
        });

        socket.on('reconnect_error', (error) => {
          console.error('🔄 Socket reconnection error:', error);
          connectionState.error = error.message;
        });

        // Start connection
        socket.connect();

        // Timeout fallback
        setTimeout(() => {
          if (connectionState.isConnecting) {
            connectionState.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('❌ Socket manager error:', error);
        connectionState.isConnecting = false;
        connectionState.error = error.message;
        reject(error);
      }
    });
  },

  // 🔌 Disconnect Socket
  disconnect: () => {
    if (socket) {
      console.log('👋 Disconnecting socket...');
      socket.disconnect();
      socket = null;
      connectionState.isConnected = false;
      connectionState.isConnecting = false;
    }
  },

  // 📊 Get Connection State
  getConnectionState: () => ({ ...connectionState }),

  // 🔍 Get Socket Instance
  getSocket: () => socket,

  // 📡 Check if Connected
  isConnected: () => socket && socket.connected,

  // 🎧 Event Listener Management
  on: (event, callback) => {
    if (!socket) {
      console.warn('⚠️ Socket not initialized for event:', event);
      return;
    }
    
    socket.on(event, callback);
    
    // Store for cleanup
    if (!eventListeners.has(event)) {
      eventListeners.set(event, []);
    }
    eventListeners.get(event).push(callback);
  },

  // 📤 Emit Event
  emit: (event, data) => {
    if (!socket || !socket.connected) {
      console.warn('⚠️ Socket not connected for event:', event);
      return false;
    }
    
    console.log(`📤 Emitting event: ${event}`, data);
    socket.emit(event, data);
    return true;
  },

  // 🧹 Remove Event Listeners
  off: (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
    
    if (eventListeners.has(event)) {
      const listeners = eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  },

  // 🧹 Clean All Listeners
  removeAllListeners: () => {
    if (socket) {
      socket.removeAllListeners();
    }
    eventListeners.clear();
  }
};

// 💬 Chat-specific Functions
export const chatSocket = {
  
  // 💬 Send Message
  sendMessage: (roomId, message) => {
    console.log(`💬 Sending message to room ${roomId}:`, message);
    return socketManager.emit('send_message', {
      roomId,
      message: message.trim()
    });
  },

  // 📩 Join Chat Room (Customer)
  joinCustomerChat: (userInfo) => {
    console.log('📩 Customer joining chat with data:', userInfo);
    return socketManager.emit('join_chat', {
      userId: userInfo.userId || userInfo._id,
      userType: 'customer',
      userName: userInfo.userName || userInfo.firstName || userInfo.username,
      userEmail: userInfo.userEmail || userInfo.email,
      // 🆕 เพิ่มข้อมูลสำหรับ Backend
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      customerName: userInfo.customerName || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
      customerEmail: userInfo.customerEmail || userInfo.email
    });
  },

  // 👨‍💼 Join Admin Dashboard แก้ไขให้ทำงานได้ดี
  joinAdminDashboard: (userInfo) => {
    console.log('👨‍💼 Admin joining dashboard with data:', userInfo);
    return socketManager.emit('join_chat', {
      userId: userInfo.userId || userInfo._id,
      userType: 'admin',
      userName: userInfo.userName || userInfo.firstName || userInfo.username,
      userEmail: userInfo.userEmail || userInfo.email
    });
  },

  // 👨‍💼 Admin Join Specific Room
  adminJoinRoom: (roomId) => {
    console.log(`👨‍💼 Admin joining room: ${roomId}`);
    return socketManager.emit('admin_join_room', { roomId });
  },

  // ⌨️ Typing Indicators
  startTyping: (roomId) => {
    return socketManager.emit('typing_start', { roomId });
  },

  stopTyping: (roomId) => {
    return socketManager.emit('typing_stop', { roomId });
  },

  // 📧 Message Event Handlers
  onNewMessage: (callback) => {
    console.log('🎧 Setting up onNewMessage listener');
    socketManager.on('new_message', (data) => {
      console.log('📨 Received new_message event:', data);
      callback(data);
    });
  },

  onJoinSuccess: (callback) => {
    console.log('🎧 Setting up onJoinSuccess listener');
    socketManager.on('join_success', (data) => {
      console.log('✅ Received join_success event:', data);
      callback(data);
    });
  },

  onJoinError: (callback) => {
    console.log('🎧 Setting up onJoinError listener');
    socketManager.on('join_error', (data) => {
      console.log('❌ Received join_error event:', data);
      callback(data);
    });
  },

  onMessageError: (callback) => {
    socketManager.on('message_error', callback);
  },

  onUserTyping: (callback) => {
    socketManager.on('user_typing', callback);
  },

  onUserStopTyping: (callback) => {
    socketManager.on('user_stop_typing', callback);
  },

  // 👨‍💼 Admin Event Handlers - สำคัญมาก!
  onChatRoomsUpdated: (callback) => {
    console.log('🎧 Setting up onChatRoomsUpdated listener');
    socketManager.on('chat_rooms_updated', (data) => {
      console.log('📋 Received chat_rooms_updated event:', data);
      callback(data);
    });
  },

  onRoomUpdated: (callback) => {
    console.log('🎧 Setting up onRoomUpdated listener');
    socketManager.on('room_updated', (data) => {
      console.log('🔄 Received room_updated event:', data);
      callback(data);
    });
  },

  onRoomMessages: (callback) => {
    console.log('🎧 Setting up onRoomMessages listener');
    socketManager.on('room_messages', (data) => {
      console.log('📦 Received room_messages event:', data);
      callback(data);
    });
  },

  onCustomerOnline: (callback) => {
    console.log('🎧 Setting up onCustomerOnline listener');
    socketManager.on('customer_online', (data) => {
      console.log('🟢 Received customer_online event:', data);
      callback(data);
    });
  },

  onCustomerOffline: (callback) => {
    console.log('🎧 Setting up onCustomerOffline listener');
    socketManager.on('customer_offline', (data) => {
      console.log('🔴 Received customer_offline event:', data);
      callback(data);
    });
  }
};

// 🔧 Utility Functions
export const socketUtils = {
  
  // 🔗 Auto Connect with User
  autoConnect: async (user) => {
    try {
      if (!user) {
        console.warn('⚠️ No user info for socket connection');
        return null;
      }

      console.log('🔄 Auto connecting socket for user:', user.username);
      await socketManager.connect(user);
      
      return socketManager.getSocket();
    } catch (error) {
      console.error('❌ Auto connect failed:', error);
      return null;
    }
  },

  // 🧹 Cleanup on Logout
  cleanup: () => {
    console.log('🧹 Cleaning up socket connections...');
    socketManager.removeAllListeners();
    socketManager.disconnect();
  },

  // 📊 Get Debug Info
  getDebugInfo: () => {
    return {
      connectionState: socketManager.getConnectionState(),
      socketId: socket?.id || null,
      connected: socketManager.isConnected(),
      transport: socket?.io?.engine?.transport?.name || null,
      url: SOCKET_URL
    };
  }
};

// 🚀 Default Export
export default {
  socketManager,
  chatSocket,
  socketUtils
};