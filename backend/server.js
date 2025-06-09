
// src/backend/src/server.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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


// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Vip Store API is running! 🚀",
    status: "success",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    port: PORT,
    endpoints: {
      products: "/api/products",
      auth: "/api/auth",
    },
    timestamp: new Date().toISOString(),
  });
});

// Use routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/reports', require('./routes/reports'));


// Error handling
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    availableRoutes: [
      "GET /",
      "GET /api/products",
      "POST /api/products",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET /api/auth/users",
      "POST /api/orders",
      "GET /api/orders/my-orders",
      "GET /api/orders/admin/all",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Vip Store Server running on http://localhost:${PORT}`);
  console.log(`📱 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
});
