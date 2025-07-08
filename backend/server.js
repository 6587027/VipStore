// src/backend/src/server.js - UPDATED WITH SOCKET.IO

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const http = require('http'); // 🆕 สำหรับ Socket.IO
const socketIo = require('socket.io'); // 🆕

const app = express();
const server = http.createServer(app); // 🆕 สร้าง HTTP server สำหรับ Socket.IO
const PORT = process.env.PORT || 3001;

// ✅ CORS Configuration
const allowedOrigins = [
  'https://vipstore-sigma.vercel.app',  // Production Frontend
  'http://localhost:3000',              // Local Development
  'http://localhost:5173',              // Vite Dev Server
];

// 🆕 Socket.IO Setup with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

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
    
    // 🆕 Initialize database monitoring (optional)
    const { getDatabaseStats } = require('./utils/dbMonitor');
    setTimeout(async () => {
      try {
        await getDatabaseStats();
      } catch (error) {
        console.log('📊 Database stats not available yet');
      }
    }, 3000);
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
      reports: "/api/reports",
      chat: "/api/chat" // 🆕 Chat API
    },
    features: {
      socketIO: "Enabled", // 🆕
      realTimeChat: "Available", // 🆕
      namespace: "/chat" // 🆕
    },
    socketConnections: io.of('/chat').sockets.size, // 🆕 Live socket count
    timestamp: new Date().toISOString(),
  });
});

// ✅ API Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API Test Successful! ✅",
    origin: req.get('Origin'),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    socketIO: "Enabled", // 🆕
    activeChatConnections: io.of('/chat').sockets.size // 🆕
  });
});

// Use routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/reports', require('./routes/reports'));
app.use('/api/chat', require('./routes/chat')); // 🆕 Chat routes

// 🆕 Socket.IO Chat Handler
try {
  const chatSocketHandler = require('./socket/chatSocket');
  chatSocketHandler(io);
  console.log('💬 Socket.IO Chat Handler loaded successfully');
} catch (error) {
  console.log('⚠️ Chat Socket Handler not found - will be loaded when created');
}

// 🆕 Socket.IO Connection Monitoring
io.of('/chat').on('connection', (socket) => {
  console.log(`💬 Chat connection established: ${socket.id}`);
  console.log(`📊 Total chat connections: ${io.of('/chat').sockets.size}`);
  
  socket.on('disconnect', () => {
    console.log(`👋 Chat disconnection: ${socket.id}`);
    console.log(`📊 Remaining chat connections: ${io.of('/chat').sockets.size}`);
  });
});

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
      "GET /api/chat/stats", // 🆕
      "GET /api/chat/rooms", // 🆕
      "POST /api/chat/room", // 🆕
    ],
    socketIO: {
      enabled: true,
      namespace: "/chat",
      connections: io.of('/chat').sockets.size
    },
    timestamp: new Date().toISOString()
  });
});

// 🚀 Start server (เปลี่ยนจาก app.listen เป็น server.listen)
server.listen(PORT, () => {
  console.log(`🚀 Vip Store Server running on http://localhost:${PORT}`);
  console.log(`🔗 Production URL: https://vipstore-backend.onrender.com`);
  console.log(`🌐 Allowed Origins:`, allowedOrigins);
  console.log(`📱 Products API: /api/products`);
  console.log(`🔐 Auth API: /api/auth`);
  console.log(`📦 Orders API: /api/orders`);
  console.log(`📊 Reports API: /api/reports`);
  console.log(`💬 Chat API: /api/chat`); // 🆕
  console.log(`⚡ Socket.IO: Enabled on namespace /chat`); // 🆕
  console.log(`🔧 Transports: websocket, polling`); // 🆕
  console.log(`✅ Global Error Handler: ENABLED`);
});