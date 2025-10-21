// backend/socket/chatSocket.js 

const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');

// Track connected users
let connectedUsers = new Map();
let adminSockets = new Set();

const chatSocketHandler = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // User joins chat (customer or admin)
    socket.on('join_chat', async (data) => {
      try {
        const { userId, userType, userName, userEmail } = data;
        
        console.log(`👤 ${userType} joining:`, { userId, userName, socketId: socket.id });
        
        socket.userId = userId;
        socket.userType = userType;
        socket.userName = userName;

        // Track connected users
        connectedUsers.set(socket.id, { 
          userId, 
          userType, 
          userName, 
          socketId: socket.id,
          connectedAt: new Date()
        });

        if (userType === 'customer') {
          // Customer joins their specific room
          let room = await ChatRoom.findOne({ customerId: userId });
          
          if (!room) {
            console.log('🆕 Creating new chat room for customer:', userName);
            room = new ChatRoom({
              customerId: userId,
              customerName: userName,
              customerEmail: userEmail,
              status: 'active'
            });
            await room.save();
          } else {
            // Update room status to active when customer reconnects
            room.status = 'active';
            await room.save();
          }

          socket.chatRoomId = room._id.toString();
          socket.join(`room_${room._id}`);
          
          console.log(`🏠 Customer ${userName} joined room: ${room._id}`);
          
          // Load chat history
          const messages = await ChatMessage.find({ chatRoomId: room._id })
            .sort({ createdAt: 1 })
            .limit(100);

          socket.emit('room_messages', {
            roomId: room._id,
            messages: messages
          });

          console.log(`✅ Sent ${messages.length} messages to customer`);

          // Notify ALL admins immediately about customer online
          const allRooms = await ChatRoom.find()
            .sort({ lastMessageTime: -1 })
            .limit(50);
          
          chatNamespace.to('admin_dashboard').emit('chat_rooms_updated', {
            chatRooms: allRooms,
            triggerBy: 'customer_joined',
            customerId: userId,
            timestamp: new Date()
          });

          chatNamespace.to('admin_dashboard').emit('customer_online', {
            roomId: room._id,
            customerName: userName,
            customerId: userId,
            timestamp: new Date()
          });

          console.log('📢 Notified admins about customer online');

        } else if (userType === 'admin') {
          // Admin joins admin dashboard
          socket.join('admin_dashboard');
          adminSockets.add(socket.id);
          
          console.log(`👨‍💼 Admin ${userName} joined dashboard`);

          // Send initial chat rooms
          const rooms = await ChatRoom.find()
            .sort({ lastMessageTime: -1 })
            .limit(50);
          
          socket.emit('chat_rooms_updated', {
            chatRooms: rooms,
            connectedUsers: connectedUsers.size,
            timestamp: new Date()
          });
          
          console.log(`📊 Sent ${rooms.length} chat rooms to admin`);
        }

        socket.emit('join_success', {
          message: 'Successfully joined chat',
          roomId: socket.chatRoomId || null,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('❌ Error joining chat:', error);
        socket.emit('join_error', { 
          message: 'Failed to join chat',
          error: error.message 
        });
      }
    });

    // Send message - Real-time delivery
    socket.on('send_message', async (data) => {
      try {
        const { roomId, message } = data;
        const { userId, userType, userName } = socket;

        if (!userId || !message?.trim()) {
          socket.emit('message_error', { message: 'Invalid message data' });
          return;
        }

        console.log(`💬 ${userType} sending message in room ${roomId}`);

        // Create message in database
        const newMessage = new ChatMessage({
          chatRoomId: roomId,
          senderId: userId,
          senderType: userType,
          senderName: userName,
          message: message.trim(),
          messageType: 'text'
        });

        await newMessage.save();
        console.log('✅ Message saved to database');

        // Update chat room
        const room = await ChatRoom.findById(roomId);
        if (room) {
          await room.updateLastMessage(message);
          
          if (userType === 'customer') {
            room.unreadCount += 1;
            await room.save();
          }
          console.log('✅ Chat room updated');
        }

        // Prepare message for broadcast
        const messageData = {
          _id: newMessage._id,
          chatRoomId: roomId,
          senderId: userId,
          senderType: userType,
          senderName: userName,
          message: message.trim(),
          createdAt: newMessage.createdAt,
          isRead: false
        };

        // CRITICAL: Broadcast to room participants FIRST
        chatNamespace.to(`room_${roomId}`).emit('new_message', messageData);
        console.log(`📤 Message broadcasted to room_${roomId}`);
        
        // Then update admin dashboard
        const updatedRooms = await ChatRoom.find()
          .sort({ lastMessageTime: -1 })
          .limit(50);
        
        chatNamespace.to('admin_dashboard').emit('chat_rooms_updated', {
          chatRooms: updatedRooms,
          newMessage: {
            roomId,
            senderType,
            senderName: userName,
            message: message.substring(0, 50),
            timestamp: new Date()
          }
        });

        console.log('📢 Admin dashboard updated');

        // Send confirmation back to sender
        socket.emit('message_sent', {
          messageId: newMessage._id,
          timestamp: new Date()
        });

        console.log('✅ Message sent successfully - Real-time!');

      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('message_error', { 
          message: 'Failed to send message',
          error: error.message 
        });
      }
    });

    // Admin joins specific chat room
    socket.on('admin_join_room', async (data) => {
      try {
        const { roomId } = data;
        
        if (socket.userType !== 'admin') {
          socket.emit('join_error', { message: 'Unauthorized' });
          return;
        }

        console.log(`👨‍💼 Admin joining room: ${roomId}`);

        // Leave previous room if any
        if (socket.currentRoomId) {
          socket.leave(`room_${socket.currentRoomId}`);
          console.log(`🚪 Admin left previous room: ${socket.currentRoomId}`);
        }

        // Join new room
        socket.join(`room_${roomId}`);
        socket.currentRoomId = roomId;

        // Mark messages as read
        await ChatMessage.updateMany(
          { chatRoomId: roomId, senderType: 'customer', isRead: false },
          { isRead: true }
        );

        // Reset unread count
        await ChatRoom.findByIdAndUpdate(roomId, { unreadCount: 0 });

        // Get recent messages
        const messages = await ChatMessage.find({ chatRoomId: roomId })
          .sort({ createdAt: 1 })
          .limit(100);

        socket.emit('room_messages', {
          roomId,
          messages: messages
        });

        console.log(`✅ Admin joined room ${roomId}, sent ${messages.length} messages`);

        // Update admin dashboard with reset unread count
        const updatedRooms = await ChatRoom.find()
          .sort({ lastMessageTime: -1 })
          .limit(50);
        
        chatNamespace.to('admin_dashboard').emit('chat_rooms_updated', {
          chatRooms: updatedRooms,
          triggerBy: 'admin_joined_room',
          roomId
        });

      } catch (error) {
        console.error('❌ Error admin joining room:', error);
        socket.emit('join_error', { 
          message: 'Failed to join room',
          error: error.message 
        });
      }
    });

    // Typing indicator - start
    socket.on('user_typing', (data) => {
      const { roomId } = data;
      if (roomId) {
        socket.to(`room_${roomId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.userName,
          userType: socket.userType,
          roomId,
          timestamp: new Date()
        });
        console.log(`⌨️ ${socket.userName} is typing in room ${roomId}`);
      }
    });

    // Typing indicator - stop
    socket.on('user_stop_typing', (data) => {
      const { roomId } = data;
      if (roomId) {
        socket.to(`room_${roomId}`).emit('user_stop_typing', {
          userId: socket.userId,
          roomId,
          timestamp: new Date()
        });
      }
    });

    // Request chat rooms refresh
    socket.on('refresh_chat_rooms', async () => {
      try {
        if (socket.userType === 'admin') {
          const rooms = await ChatRoom.find()
            .sort({ lastMessageTime: -1 })
            .limit(50);
          
          socket.emit('chat_rooms_updated', {
            chatRooms: rooms,
            timestamp: new Date()
          });
          
          console.log('🔄 Chat rooms refreshed for admin');
        }
      } catch (error) {
        console.error('❌ Error refreshing chat rooms:', error);
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.id} (${socket.userType}: ${socket.userName})`);
      
      // Remove from tracking
      connectedUsers.delete(socket.id);
      if (socket.userType === 'admin') {
        adminSockets.delete(socket.id);
      }
      
      if (socket.userType === 'customer' && socket.chatRoomId) {
        // Notify admins about customer offline
        chatNamespace.to('admin_dashboard').emit('customer_offline', {
          roomId: socket.chatRoomId,
          customerId: socket.userId,
          customerName: socket.userName,
          timestamp: new Date()
        });
        
        console.log(`📢 Notified admins about customer offline: ${socket.userName}`);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });

  // Namespace error handling
  chatNamespace.on('connect_error', (error) => {
    console.error('❌ Namespace connection error:', error);
  });

  console.log('✅ Chat Socket Handler initialized successfully');
};

module.exports = chatSocketHandler;