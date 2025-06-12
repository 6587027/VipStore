// src/frontend/src/services/api.js - Updated with Address Profiles

import axios from 'axios';

// ✅ ใช้ Environment Variable จาก Vercel
 const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://wrong-server-url.com/api'; // ใช้ URL ที่ไม่ถูกต้องเพื่อทดสอบการจัดการข้อผิดพลาด

// ✅ Force ใช้ Environment Variable ถ้ามี
if (import.meta.env.VITE_API_URL) {
  console.log('🎯 Using Vercel Environment Variable:', import.meta.env.VITE_API_URL);
} else {
  console.log('⚠️ Using Fallback URL:', 'https://vipstore-backend.onrender.com/api');
}

// ✅ Debug Environment
console.log('🔧 Environment Variables:');
console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('- MODE:', import.meta.env.MODE);
console.log('- DEV:', import.meta.env.DEV);
console.log('- PROD:', import.meta.env.PROD);
console.log('🔗 Final API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // ปิด credentials สำหรับ CORS
});

// ✅ Request interceptor with detailed logging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} Request:`, {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor with detailed logging  
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} Response:`, {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A'
    });
    
    // CORS Error Detection
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('🚨 Possible CORS Error or Network Issue');
    }
    
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

// ✅ Enhanced Auth API with Address Profiles Support
export const authAPI = {
  login: async (username, password) => {
    try {
      console.log('🔐 Login Attempt:', {
        username,
        endpoint: '/auth/login',
        fullURL: `${API_BASE_URL}/auth/login`
      });
      
      const response = await api.post('/auth/login', { username, password });
      console.log('✅ Login Success:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Login Failed:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        url: error.config?.url
      });
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      console.log('📝 Register Attempt:', {
        username: userData.username,
        endpoint: '/auth/register'
      });
      
      const response = await api.post('/auth/register', userData);
      console.log('✅ Register Success:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Register Failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  logout: () => api.post('/auth/logout'),
  getTestAccounts: () => api.get('/auth/users'),
  verify: () => api.get('/auth/verify'),

  // 🆕 Address Profiles API
  addressProfiles: {
    // Get all address profiles for a user
    getAll: async (userId) => {
      try {
        console.log('📍 Getting address profiles for user:', userId);
        const response = await api.get(`/auth/address-profiles/${userId}`);
        console.log('✅ Address profiles loaded:', response.data);
        return response;
      } catch (error) {
        console.error('❌ Get address profiles failed:', error.response?.data || error.message);
        
        // 🔄 Fallback: Return empty array if backend not ready
        if (error.response?.status === 404 || error.message.includes('Network Error')) {
          console.log('🔄 Address profiles API not available, using fallback');
          return {
            data: {
              success: true,
              addressProfiles: [],
              total: 0,
              maxAllowed: 5
            }
          };
        }
        throw error;
      }
    },

    // Create new address profile
    create: async (userId, profileData) => {
      try {
        console.log('➕ Creating address profile for user:', userId, profileData);
        const response = await api.post(`/auth/address-profiles/${userId}`, profileData);
        console.log('✅ Address profile created:', response.data);
        return response;
      } catch (error) {
        console.error('❌ Create address profile failed:', error.response?.data || error.message);
        
        // 🔄 Fallback: Simulate success if backend not ready
        if (error.response?.status === 404 || error.message.includes('Network Error')) {
          console.log('🔄 Address profiles API not available, simulating success');
          const mockProfile = {
            profileId: `mock_${Date.now()}`,
            profileName: profileData.profileName,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone,
            address: profileData.address,
            isDefault: profileData.isDefault || false,
            createdAt: new Date().toISOString()
          };
          
          return {
            data: {
              success: true,
              message: 'โปรไฟล์ถูกสร้างแล้ว (โหมดทดสอบ)',
              profile: mockProfile,
              total: 1
            }
          };
        }
        throw error;
      }
    },

    // Update address profile
    update: async (userId, profileId, updateData) => {
      try {
        console.log('✏️ Updating address profile:', { userId, profileId, updateData });
        const response = await api.put(`/auth/address-profiles/${userId}/${profileId}`, updateData);
        console.log('✅ Address profile updated:', response.data);
        return response;
      } catch (error) {
        console.error('❌ Update address profile failed:', error.response?.data || error.message);
        
        // 🔄 Fallback: Simulate success if backend not ready
        if (error.response?.status === 404 || error.message.includes('Network Error')) {
          console.log('🔄 Address profiles API not available, simulating update success');
          return {
            data: {
              success: true,
              message: 'อัปเดตโปรไฟล์สำเร็จ (โหมดทดสอบ)',
              profile: { ...updateData, profileId }
            }
          };
        }
        throw error;
      }
    },

    // Delete address profile
    delete: async (userId, profileId) => {
      try {
        console.log('🗑️ Deleting address profile:', { userId, profileId });
        const response = await api.delete(`/auth/address-profiles/${userId}/${profileId}`);
        console.log('✅ Address profile deleted:', response.data);
        return response;
      } catch (error) {
        console.error('❌ Delete address profile failed:', error.response?.data || error.message);
        
        // 🔄 Fallback: Simulate success if backend not ready
        if (error.response?.status === 404 || error.message.includes('Network Error')) {
          console.log('🔄 Address profiles API not available, simulating delete success');
          return {
            data: {
              success: true,
              message: 'ลบโปรไฟล์สำเร็จ (โหมดทดสอบ)',
              total: 0
            }
          };
        }
        throw error;
      }
    },

    // Set default address profile
    setDefault: async (userId, profileId) => {
      try {
        console.log('⭐ Setting default address profile:', { userId, profileId });
        const response = await api.put(`/auth/address-profiles/${userId}/${profileId}/set-default`);
        console.log('✅ Default address profile set:', response.data);
        return response;
      } catch (error) {
        console.error('❌ Set default address profile failed:', error.response?.data || error.message);
        
        // 🔄 Fallback: Simulate success if backend not ready
        if (error.response?.status === 404 || error.message.includes('Network Error')) {
          console.log('🔄 Address profiles API not available, simulating set default success');
          return {
            data: {
              success: true,
              message: 'ตั้งเป็นที่อยู่หลักสำเร็จ (โหมดทดสอบ)'
            }
          };
        }
        throw error;
      }
    },

    // Get default address profile
    getDefault: async (userId) => {
      try {
        console.log('🏠 Getting default address profile for user:', userId);
        const response = await api.get(`/auth/address-profiles/${userId}/default`);
        console.log('✅ Default address profile loaded:', response.data);
        return response;
      } catch (error) {
        console.error('❌ Get default address profile failed:', error.response?.data || error.message);
        
        // 🔄 Fallback: Return null if backend not ready
        if (error.response?.status === 404 || error.message.includes('Network Error')) {
          console.log('🔄 Address profiles API not available, returning null default');
          return {
            data: {
              success: true,
              defaultProfile: null,
              hasDefault: false
            }
          };
        }
        throw error;
      }
    }
  }
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
    console.log('🔍 Testing API Connection...');
    console.log('Test URL:', `${API_BASE_URL}/test`);
    
    const response = await api.get('/test');
    console.log('✅ API Connection Successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ API Connection Failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

// Helper functions
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

// 🆕 Address Profiles Helper Functions
export const getAddressProfiles = async (userId) => {
  try {
    const response = await authAPI.addressProfiles.getAll(userId);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch address profiles',
      error: error.response?.data || error.message
    };
  }
};

export const createAddressProfile = async (userId, profileData) => {
  try {
    const response = await authAPI.addressProfiles.create(userId, profileData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create address profile',
      error: error.response?.data || error.message
    };
  }
};

export const updateAddressProfile = async (userId, profileId, updateData) => {
  try {
    const response = await authAPI.addressProfiles.update(userId, profileId, updateData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update address profile',
      error: error.response?.data || error.message
    };
  }
};

export const deleteAddressProfile = async (userId, profileId) => {
  try {
    const response = await authAPI.addressProfiles.delete(userId, profileId);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete address profile',
      error: error.response?.data || error.message
    };
  }
};

export const setDefaultAddressProfile = async (userId, profileId) => {
  try {
    const response = await authAPI.addressProfiles.setDefault(userId, profileId);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to set default address profile',
      error: error.response?.data || error.message
    };
  }
};

export const getDefaultAddressProfile = async (userId) => {
  try {
    const response = await authAPI.addressProfiles.getDefault(userId);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get default address profile',
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