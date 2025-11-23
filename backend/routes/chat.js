// backend/routes/chat.js

const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');

// 📊 Get chat statistics (for admin dashboard)
router.get('/stats', async (req, res) => {
  try {
    const totalRooms = await ChatRoom.countDocuments();
    const activeRooms = await ChatRoom.countDocuments({ status: 'active' });
    const waitingRooms = await ChatRoom.countDocuments({ status: 'waiting' });
    const resolvedRooms = await ChatRoom.countDocuments({ status: 'closed' });

    res.json({
      success: true,
      data: {
        total: totalRooms,
        active: activeRooms,
        waiting: waitingRooms,
        resolved: resolvedRooms
      }
    });
  } catch (error) {
    console.error('Error getting chat stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting chat statistics'
    });
  }
});

// 🏠 Get all chat rooms (for admin)
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await ChatRoom.find()
      .sort({ lastMessageTime: -1 })
      .limit(50); // Limit for performance

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting chat rooms'
    });
  }
});

// 💬 Get messages for specific chat room
router.get('/room/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({ chatRoomId: roomId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      data: messages.reverse() // Show oldest first
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting messages'
    });
  }
});

// 🆕 Create or get chat room for customer
router.post('/room', async (req, res) => {
  try {
    const { customerId, customerName, customerEmail } = req.body;

    // Check if room already exists
    let room = await ChatRoom.findOne({ customerId });

    if (!room) {
      // Create new room
      room = new ChatRoom({
        customerId,
        customerName,
        customerEmail,
        status: 'active'
      });
      await room.save();
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error creating/getting chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling chat room'
    });
  }
});

// 📝 Send message (fallback API - main sending via Socket.IO)
router.post('/message', async (req, res) => {
  try {
    const { chatRoomId, senderId, senderType, senderName, message } = req.body;

    // Create message
    const newMessage = new ChatMessage({
      chatRoomId,
      senderId,
      senderType,
      senderName,
      message,
      messageType: 'text'
    });

    await newMessage.save();

    // Update chat room
    const room = await ChatRoom.findById(chatRoomId);
    if (room) {
      await room.updateLastMessage(message);
    }

    res.json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// 🔄 Update chat room status
router.put('/room/:roomId/status', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;

    const room = await ChatRoom.findByIdAndUpdate(
      roomId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room status'
    });
  }
});

// 🗑️ Delete chat room and messages
router.delete('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    // Delete all messages in the room
    await ChatMessage.deleteMany({ chatRoomId: roomId });

    // Delete the room itself
    const deletedRoom = await ChatRoom.findByIdAndDelete(roomId);

    if (!deletedRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat room and messages deleted successfully',
      data: { roomId }
    });
  } catch (error) {
    console.error('Error deleting chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting chat room'
    });
  }
});

module.exports = router;