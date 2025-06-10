// src/frontend/src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'https://vipstore-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsAPI = {
  // ดึงสินค้าทั้งหมด
  getAll: (params = {}) => api.get('/products', { params }),
  
  // ดึงสินค้าตาม ID
  getById: (id) => api.get(`/products/${id}`),
  
  // สร้างสินค้าใหม่ (Admin)
  create: (data) => api.post('/products', data),
  
  // อัพเดตสินค้า (Admin)
  update: (id, data) => api.put(`/products/${id}`, data),
  
  // ลบสินค้า (Admin)
  delete: (id) => api.delete(`/products/${id}`),
};

// Auth API - อัพเดตเพิ่ม register
export const authAPI = {
  // Login
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  // Register
  register: (userData) => 
    api.post('/auth/register', userData),
  
  // Logout
  logout: () => 
    api.post('/auth/logout'),
  
  // Get test accounts (development)
  getTestAccounts: () => 
    api.get('/auth/users'),
  
  // Verify token (optional)
  verify: () => 
    api.get('/auth/verify'),
};

// Orders API
export const ordersAPI = {
  // Create new order
  create: (orderData) => 
    api.post('/orders', orderData),
  
  // Get user's orders
  getMyOrders: (userId) => 
    api.get('/orders/my-orders', { params: { userId } }),
  
  // Get single order
  getById: (id) => 
    api.get(`/orders/${id}`),
  
  // Admin endpoints
  admin: {
    // Get all orders
    getAll: (params = {}) => 
      api.get('/orders/admin/all', { params }),
    
    // Update order status
    updateStatus: (id, updateData) => 
      api.put(`/orders/admin/${id}/status`, updateData),
    
    // Get statistics
    getStats: () => 
      api.get('/orders/admin/stats'),

    // Delete order by ID
    delete: (orderId) => 
      api.delete(`/orders/admin/${orderId}`)
  }
};

// 🆕 Reports API - Dynamic Reports System
export const reportsAPI = {
  // 📊 Overview Report - ข้อมูลภาพรวมทั้งหมด
  getOverview: (params = {}) => 
    api.get('/reports/overview', { params }),
  
  // 💰 Sales Report - รายงานยอดขายละเอียด
  getSales: (params = {}) => 
    api.get('/reports/sales', { params }),
  
  // 📦 Products Report - รายงานสินค้า
  getProducts: (params = {}) => 
    api.get('/reports/products', { params }),
  
  // 👥 Users Report - รายงานผู้ใช้
  getUsers: (params = {}) => 
    api.get('/reports/users', { params }),
  
  // 🛒 Orders Report - รายงานออเดอร์
  getOrders: (params = {}) => 
    api.get('/reports/orders', { params }),
};

// Helper functions สำหรับใช้งานง่าย
export const loginUser = async (username, password) => {
  try {
    const response = await authAPI.login(username, password);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
};

// Helper function สำหรับ register
export const registerUser = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed'
    };
  }
};

// Helper function สำหรับสร้าง Order
export const createOrder = async (orderData) => {
  try {
    const response = await ordersAPI.create(orderData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create order'
    };
  }
};

// 🆕 Helper functions สำหรับ Reports
export const getReportsOverview = async (params = {}) => {
  try {
    const response = await reportsAPI.getOverview(params);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Reports overview error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch reports overview'
    };
  }
};

export const getSalesReports = async (params = {}) => {
  try {
    const response = await reportsAPI.getSales(params);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Sales reports error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch sales reports'
    };
  }
};

export const getProductsReports = async (params = {}) => {
  try {
    const response = await reportsAPI.getProducts(params);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Products reports error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch products reports'
    };
  }
};

export const getUsersReports = async (params = {}) => {
  try {
    const response = await reportsAPI.getUsers(params);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Users reports error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch users reports'
    };
  }
};

export const getOrdersReports = async (params = {}) => {
  try {
    const response = await reportsAPI.getOrders(params);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Orders reports error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch orders reports'
    };
  }
};

export const getAllProducts = () => productsAPI.getAll();

export default api;