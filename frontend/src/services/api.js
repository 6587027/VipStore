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

export default api;