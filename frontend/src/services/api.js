// src/frontend/src/services/api.js - Updated with Address Profiles

import axios from 'axios';

// ✅ ใช้ Environment Variable จาก Vercel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://wrong-server-url.com/api'; // ใช้ URL ที่ไม่ถูกต้องเพื่อทดสอบการจัดการข้อผิดพลาด
// const API_BASE_URL = 'http://localhost:3001/api';

// ✅ Force ใช้ Environment Variable ถ้ามี
// if (import.meta.env.VITE_API_URL) {
//   console.log('🎯 Using Vercel Environment Variable:', import.meta.env.VITE_API_URL);
// } else {
//   console.log('⚠️ Using Fallback URL:', 'https://vipstore-backend.onrender.com/api');
// }

// ✅ Debug Environment

// console.log('🔧 Environment Variables:');
// console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
// console.log('- MODE:', import.meta.env.MODE);
// console.log('- DEV:', import.meta.env.DEV);
// console.log('- PROD:', import.meta.env.PROD);
// console.log('🔗 Final API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
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
  updateOrderStatus: (orderId, status) => api.put(`/orders/admin/${orderId}/status`, { status }),
  
  // ✅ FIXED: updatePayment function with enhanced error handling
  updatePayment: async (orderId, paymentData) => {
    try {
      console.log('🔄 API: Updating payment status...', { 
        orderId, 
        paymentData,
        endpoint: `/orders/${orderId}/payment`,
        fullURL: `${API_BASE_URL}/orders/${orderId}/payment`
      });
      
      // ✅ Validate inputs
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      
      if (!paymentData.paymentMethod) {
        throw new Error('Payment method is required');
      }
      
      const response = await api.put(`/orders/${orderId}/payment`, paymentData);
      
      console.log('✅ API: Payment update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API: Payment update failed:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        orderId: orderId
      });
      
      // ✅ Return more descriptive error
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update payment';
      throw new Error(`Payment update failed: ${errorMessage}`);
    }
  },

  // 🆕 Customer Refund Request APIs
  requestRefund: async (orderId, refundData) => {
    try {
      console.log('💸 Requesting refund for order:', orderId, refundData);
      const response = await api.post(`/orders/${orderId}/request-refund`, refundData);
      console.log('✅ Refund request sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Refund request failed:', error.response?.data || error.message);
      throw error;
    }
  },

  admin: {
    getAll: (params = {}) => api.get('/orders/admin/all', { params }),
    updateStatus: (id, updateData) => api.put(`/orders/admin/${id}/status`, updateData),
    getStats: () => api.get('/orders/admin/stats'),
    delete: (orderId) => api.delete(`/orders/admin/${orderId}`),

    // 🆕 เพิ่ม Refund APIs
    processRefund: (orderId, refundData) => {
      console.log('💰 Processing refund for order:', orderId, refundData);
      return api.put(`/orders/admin/${orderId}/refund`, refundData);
    },
    
    getRefundInfo: (orderId) => {
      console.log('📊 Getting refund info for order:', orderId);
      return api.get(`/orders/admin/${orderId}/refund-info`);
    },

    // 🆕 Admin Refund Request Management
    getRefundRequests: async (status = 'all') => {
      try {
        console.log('📋 Getting refund requests, status:', status);
        const response = await api.get('/orders/admin/refund-requests', { 
          params: { status } 
        });
        console.log('✅ Refund requests loaded:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Get refund requests failed:', error.response?.data || error.message);
        throw error;
      }
    },

    approveRefundRequest: async (requestId, approvalData) => {
      try {
        console.log('✅ Approving refund request:', requestId, approvalData);
        const response = await api.put(`/orders/admin/refund-requests/${requestId}/approve`, approvalData);
        console.log('✅ Refund request approved:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Approve refund request failed:', error.response?.data || error.message);
        throw error;
      }
    },

    rejectRefundRequest: async (requestId, rejectionData) => {
      try {
        console.log('❌ Rejecting refund request:', requestId, rejectionData);
        const response = await api.put(`/orders/admin/refund-requests/${requestId}/reject`, rejectionData);
        console.log('✅ Refund request rejected:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Reject refund request failed:', error.response?.data || error.message);
        throw error;
      }
    },

    getRefundRequestStats: async () => {
      try {
        console.log('📊 Getting refund request statistics...');
        const response = await api.get('/orders/admin/refund-requests/stats');
        console.log('✅ Refund request stats loaded:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Get refund request stats failed:', error.response?.data || error.message);
        throw error;
      }
    }
  }
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
// 🆕 Helper Functions for Refund Requests
export const requestOrderRefund = async (orderId, refundData) => {
  try {
    const response = await ordersAPI.requestRefund(orderId, refundData);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to request refund',
      error: error.response?.data || error.message
    };
  }
};

export const getRefundRequests = async (status = 'all') => {
  try {
    const response = await ordersAPI.admin.getRefundRequests(status);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch refund requests',
      error: error.response?.data || error.message
    };
  }
};

export const approveRefundRequest = async (requestId, approvalData) => {
  try {
    const response = await ordersAPI.admin.approveRefundRequest(requestId, approvalData);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to approve refund request',
      error: error.response?.data || error.message
    };
  }
};

export const rejectRefundRequest = async (requestId, rejectionData) => {
  try {
    const response = await ordersAPI.admin.rejectRefundRequest(requestId, rejectionData);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to reject refund request',
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

// เพิ่มส่วนนี้ใน api.js หลังจาก ordersAPI

// ✅ 🆕 Reports API - เพิ่มส่วนนี้!
export const reportsAPI = {
  getOverview: (params = {}) => {
    console.log('📊 Getting reports overview...');
    return api.get('/reports/overview', { params });
  },
  
  getSales: (params = {}) => {
    console.log('💰 Getting sales reports...');
    return api.get('/reports/sales', { params });
  },
  
  getProducts: (params = {}) => {
    console.log('📦 Getting products reports...');
    return api.get('/reports/products', { params });
  },
  
  getUsers: (params = {}) => {
    console.log('👥 Getting users reports...');
    return api.get('/reports/users', { params });
  },
  
  getOrders: (params = {}) => {
    console.log('🛒 Getting orders reports...');
    return api.get('/reports/orders', { params });
  }
};

export const getAllProducts = () => productsAPI.getAll();

export default api;