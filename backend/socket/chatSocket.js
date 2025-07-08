// backend/socket/chatSocket.js

const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');

const chatSocketHandler = (io) => {
  // Namespace สำหรับ chat
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // 🔐 User joins chat (customer or admin)
    socket.on('join_chat', async (data) => {
      try {
        const { userId, userType, userName, userEmail } = data;
        
        // Store user info in socket
        socket.userId = userId;
        socket.userType = userType;
        socket.userName = userName;

        if (userType === 'customer') {
          // Customer joins their specific room
          let room = await ChatRoom.findOne({ customerId: userId });
          
          if (!room) {
            room = new ChatRoom({
              customerId: userId,
              customerName: userName,
              customerEmail: userEmail,
              status: 'active'
            });
            await room.save();
          }

          socket.chatRoomId = room._id.toString();
          socket.join(`room_${room._id}`);
          
          console.log(`👤 Customer ${userName} joined room: ${room._id}`);

          // Notify admins about customer online
          socket.to('admin_dashboard').emit('customer_online', {
            roomId: room._id,
            customerName: userName,
            customerId: userId
          });

        } else if (userType === 'admin') {
          // Admin joins admin dashboard
          socket.join('admin_dashboard');
          console.log(`👨‍💼 Admin ${userName} joined dashboard`);

          // Send current chat rooms to admin
          const rooms = await ChatRoom.find().sort({ lastMessageTime: -1 });
          socket.emit('chat_rooms_updated', rooms);
        }

        socket.emit('join_success', {
          message: 'Successfully joined chat',
          roomId: socket.chatRoomId || null
        });

      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('join_error', { message: 'Failed to join chat' });
      }
    });

    // 💬 Send message
    socket.on('send_message', async (data) => {
      try {
        const { roomId, message } = data;
        const { userId, userType, userName } = socket;

        if (!userId || !message?.trim()) {
          socket.emit('message_error', { message: 'Invalid message data' });
          return;
        }

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

        // Update chat room
        const room = await ChatRoom.findById(roomId);
        if (room) {
          await room.updateLastMessage(message);
          
          // Update unread count if sent by customer
          if (userType === 'customer') {
            room.unreadCount += 1;
            await room.save();
          }
        }

        // Prepare message for broadcast
        const messageData = {
          _id: newMessage._id,
          chatRoomId: roomId,
          senderId: userId,
          senderType: userType,
          senderName: userName,
          message: message.trim(),
          createdAt: new Date(),
          isRead: false
        };

        // Send to room participants
        chatNamespace.to(`room_${roomId}`).emit('new_message', messageData);

        // Send to admin dashboard for real-time updates
        socket.to('admin_dashboard').emit('room_updated', {
          roomId,
          lastMessage: message.trim(),
          lastMessageTime: new Date(),
          unreadCount: room?.unreadCount || 0
        });

        console.log(`💬 Message sent in room ${roomId} by ${userName}`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    // ⌨️ Typing indicator
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        userType: socket.userType
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // 👨‍💼 Admin joins specific chat room
    socket.on('admin_join_room', async (data) => {
      try {
        const { roomId } = data;
        
        if (socket.userType !== 'admin') {
          socket.emit('join_error', { message: 'Unauthorized' });
          return;
        }

        // Leave previous room if any
        if (socket.currentRoomId) {
          socket.leave(`room_${socket.currentRoomId}`);
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
          .sort({ createdAt: -1 })
          .limit(50);

        socket.emit('room_messages', {
          roomId,
          messages: messages.reverse()
        });

        console.log(`👨‍💼 Admin joined room: ${roomId}`);

      } catch (error) {
        console.error('Error admin joining room:', error);
        socket.emit('join_error', { message: 'Failed to join room' });
      }
    });

    // 📱 Disconnect handling
    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.id}`);
      
      if (socket.userType === 'customer' && socket.chatRoomId) {
        // Notify admins about customer offline
        socket.to('admin_dashboard').emit('customer_offline', {
          roomId: socket.chatRoomId,
          customerId: socket.userId
        });
      }
    });
  });
};

module.exports = chatSocketHandler;