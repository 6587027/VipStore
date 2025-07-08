// backend/models/ChatMessage.js - Optimized for 500MB limit

const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
    index: true // ✅ Index for faster queries
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderType: {
    type: String,
    enum: ['customer', 'admin'],
    required: true
  },
  senderName: {
    type: String,
    required: true,
    maxLength: 50 // ✅ Limit name length
  },
  message: {
    type: String,
    required: true,
    maxLength: 1000 // ✅ Limit message length
  },
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '15d', // 🗑️ Auto-delete after 15 days
    index: true // ✅ Index for TTL
  }
}, {
  // ✅ Optimize document size
  versionKey: false, // Remove __v field
  minimize: true     // Remove empty objects
});

// ✅ Compound index for efficient queries
ChatMessageSchema.index({ chatRoomId: 1, createdAt: -1 });

// ✅ Pre-save middleware for validation
ChatMessageSchema.pre('save', function(next) {
  // Trim whitespace to save space
  if (this.message) {
    this.message = this.message.trim();
  }
  if (this.senderName) {
    this.senderName = this.senderName.trim();
  }
  next();
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);