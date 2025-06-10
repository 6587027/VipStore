// src/frontend/src/services/api.js - Enhanced Version

import axios from 'axios';

// ✅ Environment-based API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // เพิ่ม timeout สำหรับ production
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor สำหรับ debugging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor สำหรับ debugging
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ✅ Enhanced Auth API with better error handling
export const authAPI = {
  login: async (username, password) => {
    try {
      console.log('🔐 Attempting login...', { username });
      const response = await api.post('/auth/login', { username, password });
      console.log('✅ Login successful:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      console.log('📝 Attempting register...', { username: userData.username });
      const response = await api.post('/auth/register', userData);
      console.log('✅ Register successful:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Register failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  logout: () => api.post('/auth/logout'),
  getTestAccounts: () => api.get('/auth/users'),
  verify: () => api.get('/auth/verify'),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: (userId) => api.get('/orders/my-orders', { params: { userId } }),
  getById: (id) => api.get(`/orders/${id}`),
  
  admin: {
    getAll: (params = {}) => api.get('/orders/admin/all', { params }),
    updateStatus: (id, updateData) => api.put(`/orders/admin/${id}/status`, updateData),
    getStats: () => api.get('/orders/admin/stats'),
    delete: (orderId) => api.delete(`/orders/admin/${orderId}`)
  }
};

// Reports API
export const reportsAPI = {
  getOverview: (params = {}) => api.get('/reports/overview', { params }),
  getSales: (params = {}) => api.get('/reports/sales', { params }),
  getProducts: (params = {}) => api.get('/reports/products', { params }),
  getUsers: (params = {}) => api.get('/reports/users', { params }),
  getOrders: (params = {}) => api.get('/reports/orders', { params }),
};

// ✅ API Health Check
export const testAPIConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const response = await api.get('/test');
    console.log('✅ API Connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ API Connection failed:', error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

// Helper functions with enhanced error handling
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
      message: error.response?.data?.message || 'Login failed',
      error: error.response?.data || error.message
    };
  }
};

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
      message: error.response?.data?.message || 'Registration failed',
      error: error.response?.data || error.message
    };
  }
};

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
      message: error.response?.data?.message || 'Failed to create order',
      error: error.response?.data || error.message
    };
  }
};

// Report helpers
export const getReportsOverview = async (params = {}) => {
  try {
    const response = await reportsAPI.getOverview(params);
    return { success: true, data: response.data };
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
    return { success: true, data: response.data };
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
    return { success: true, data: response.data };
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
    return { success: true, data: response.data };
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
    return { success: true, data: response.data };
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