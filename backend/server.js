const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Import routes
const productRoutes = require('./routes/products');

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Vip Store API is running! 🚀',
    status: 'success',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Use routes
app.use('/api/products', productRoutes);

// Error handling
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Vip Store Server running on http://localhost:${PORT}`);
  console.log(`📱 Test API: http://localhost:${PORT}/api/products`);
});