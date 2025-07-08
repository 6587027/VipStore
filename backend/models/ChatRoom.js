// backend/models/ChatRoom.js - Optimized for minimal storage

const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // ✅ One room per customer
    index: true
  },
  customerName: {
    type: String,
    required: true,
    maxLength: 50
  },
  customerEmail: {
    type: String,
    required: true,
    maxLength: 100
  },
  status: {
    type: String,
    enum: ['active', 'waiting', 'closed'],
    default: 'active',
    index: true
  },
  lastMessage: {
    type: String,
    maxLength: 100, // ✅ Truncated for preview
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  unreadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // ✅ Room expires if inactive for 30 days
  updatedAt: {
    type: Date,
    default: Date.now,
    expires: '30d' // Keep room data longer than messages
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  minimize: true
});

// ✅ Update timestamp on save
ChatRoomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// ✅ Instance method to update last message
ChatRoomSchema.methods.updateLastMessage = function(message) {
  this.lastMessage = message.length > 100 ? 
    message.substring(0, 97) + '...' : message;
  this.lastMessageTime = new Date();
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);