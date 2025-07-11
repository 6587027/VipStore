// backend/socket/chatSocket.js - แก้ไขส่วน Room Management

const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');

const chatSocketHandler = (io) => {
  // Namespace สำหรับ chat
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // 🔐 User joins chat (customer or admin)
    socket.on('join_chat', async (data) => {
      try {
        const { userId, userType, userName, userEmail } = data;
        
        console.log(`👤 ${userType} joining:`, { userId, userName, socketId: socket.id });
        
        // Store user info in socket
        socket.userId = userId;
        socket.userType = userType;
        socket.userName = userName;

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
          }

          socket.chatRoomId = room._id.toString();
          socket.join(`room_${room._id}`);
          
          console.log(`🏠 Customer ${userName} joined room: ${room._id}`);
          console.log(`📦 Loading chat history for customer ${userName}...`);
          const messages = await ChatMessage.find({ chatRoomId: room._id })
            .sort({ createdAt: -1 })
            .limit(100);

          socket.emit('room_messages', {
            roomId: room._id,
            messages: messages.reverse()
          });

          console.log(`✅ Sent ${messages.length} chat history messages to customer`);

          // 🔥 ส่งข้อมูลไป Admin Dashboard ทันที
          socket.to('admin_dashboard').emit('customer_online', {
            roomId: room._id,
            customerName: userName,
            customerId: userId,
            room: room // ส่งข้อมูล room ทั้งหมด
          });

          // 🔥 อัปเดต chat rooms ใน Admin Dashboard
          const allRooms = await ChatRoom.find().sort({ lastMessageTime: -1 });
          chatNamespace.to('admin_dashboard').emit('chat_rooms_updated', {
            chatRooms: allRooms
          });

        } else if (userType === 'admin') {
          // Admin joins admin dashboard
          socket.join('admin_dashboard');
          console.log(`👨‍💼 Admin ${userName} joined dashboard`);

          // 🔥 ส่งข้อมูล chat rooms ทั้งหมดทันที
          const rooms = await ChatRoom.find().sort({ lastMessageTime: -1 });
          socket.emit('chat_rooms_updated', {
            chatRooms: rooms
          });
          
          console.log(`📊 Sent ${rooms.length} chat rooms to admin`);
        }

        socket.emit('join_success', {
          message: 'Successfully joined chat',
          roomId: socket.chatRoomId || null
        });

      } catch (error) {
        console.error('❌ Error joining chat:', error);
        socket.emit('join_error', { message: 'Failed to join chat' });
      }
    });

    // 💬 Send message - แก้ไขให้ส่งข้อมูลครบ
    socket.on('send_message', async (data) => {
      try {
        const { roomId, message } = data;
        const { userId, userType, userName } = socket;

        if (!userId || !message?.trim()) {
          socket.emit('message_error', { message: 'Invalid message data' });
          return;
        }

        console.log(`💬 ${userType} sending message:`, { userName, message: message.substring(0, 50) });

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

        // 🔥 ส่งไปทุก participants ในห้อง
        chatNamespace.to(`room_${roomId}`).emit('new_message', messageData);

        // 🔥 อัปเดต Admin Dashboard แบบ real-time
        const updatedRooms = await ChatRoom.find().sort({ lastMessageTime: -1 });
        chatNamespace.to('admin_dashboard').emit('chat_rooms_updated', {
          chatRooms: updatedRooms
        });

        console.log(`✅ Message broadcasted to room_${roomId} and admin dashboard`);

      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    // 👨‍💼 Admin joins specific chat room 
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

        // Get recent messages Admin
        const messages = await ChatMessage.find({ chatRoomId: roomId })
          .sort({ createdAt: -1 })
          .limit(100);

        socket.emit('room_messages', {
          roomId,
          messages: messages.reverse()
        });

        console.log(`✅ Admin joined room ${roomId}, sent ${messages.length} messages`);

      } catch (error) {
        console.error('❌ Error admin joining room:', error);
        socket.emit('join_error', { message: 'Failed to join room' });
      }
    });

    // 📱 Disconnect handling
    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.id} (${socket.userType}: ${socket.userName})`);
      
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