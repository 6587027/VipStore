// src/backend/src/server.js - FIXED VERSION

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS Configuration
const allowedOrigins = [
  'https://vipstore-sigma.vercel.app',  // Production Frontend
  'http://localhost:3000',              // Local Development
  'http://localhost:5173',              // Vite Dev Server
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Handle preflight OPTIONS requests
app.options('*', cors());

// ✅ Middleware with detailed logging
app.use(express.json());

// ✅ Add request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  console.log('Origin:', req.get('Origin'));
  console.log('User-Agent:', req.get('User-Agent'));
  
  // 🆕 Log request body for POST/PUT requests
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });

// Import routes
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");

// ✅ Test route with more info
app.get("/", (req, res) => {
  res.json({
    message: "Vip Store API is running! 🚀",
    status: "success",
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    port: PORT,
    allowedOrigins: allowedOrigins,
    endpoints: {
      products: "/api/products",
      auth: "/api/auth",
      orders: "/api/orders",
      reports: "/api/reports"
    },
    timestamp: new Date().toISOString(),
  });
});

// ✅ API Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API Test Successful! ✅",
    origin: req.get('Origin'),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Use routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/reports', require('./routes/reports'));

// 🆕 CRITICAL FIX: Global Error Handler - เพิ่มส่วนนี้!
app.use((error, req, res, next) => {
  console.error('🚨 Global Error Handler Triggered:');
  console.error('Error Details:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  
  // Determine error status
  const status = error.statusCode || error.status || 500;
  
  // Create error response
  const errorResponse = {
    success: false,
    message: error.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = error;
  }
  
  res.status(status).json(errorResponse);
});

// ✅ Enhanced 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "GET /",
      "GET /api/test",
      "GET /api/products",
      "POST /api/products",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET /api/auth/users",
      "POST /api/orders",
      "GET /api/orders/my-orders",
      "GET /api/orders/admin/all",
    ],
    timestamp: new Date().toISOString()
  });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Vip Store Server running on http://localhost:${PORT}`);
  console.log(`🔗 Production URL: https://vipstore-backend.onrender.com`);
  console.log(`🌐 Allowed Origins:`, allowedOrigins);
  console.log(`📱 Products API: /api/products`);
  console.log(`🔐 Auth API: /api/auth`);
  console.log(`📦 Orders API: /api/orders`);
  console.log(`📊 Reports API: /api/reports`);
  console.log(`✅ Global Error Handler: ENABLED`);
});