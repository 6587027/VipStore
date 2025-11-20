// backend/models/Announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    default: 'green'
  },
  mode: {
    type: String,
    enum: ['toast', 'modal'],
    default: 'toast'
  },
  lastUpdated: {
    type: Number, // เก็บเป็น timestamp (Date.now())
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);