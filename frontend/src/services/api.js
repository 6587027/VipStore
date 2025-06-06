import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

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

// Auth API - เพิ่มใหม่
export const authAPI = {
  // Login
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
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

export const getAllProducts = () => productsAPI.getAll();

export default api;