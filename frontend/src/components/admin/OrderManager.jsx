// frontend/src/components/admin/OrderManager.jsx

import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import './AdminPanel.css';
import { ShoppingCart,
  Users,
  Store,
  TriangleAlert,
  ShoppingBag,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  RefreshCw,
  Eye,
  X,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  AlertTriangle,
  Ban,
  RotateCcw,
  Trash2,
  Pencil,
  CreditCard,
  UserPen,
  FileText,
  Settings,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    searchTerm: '',
    page: 1,
    limit: 500 
  });
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [showRefundRequests, setShowRefundRequests] = useState(false);
  const [refundRequestStats, setRefundRequestStats] = useState({
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0
});

  // Fetch orders and stats on component mount
  useEffect(() => {
  fetchOrders();
  fetchStats();
  fetchRefundRequests(); 
  fetchRefundRequestStats(); 
}, [filters.status, filters.page]);


  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        page: filters.page,
        limit: filters.limit
      };

      const response = await ordersAPI.admin.getAll(params);
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (error) {
      setError('Error connecting to server');
      console.error('Fetch orders error:', error);
      
      // Mock data for development
      // setOrders([
      //   {
      //     _id: '1',
      //     orderNumber: 'VIP-20250608-001',
      //     customerInfo: {
      //       firstName: 'วิป',
      //       lastName: 'ลูกค้า',
      //       email: 'vip@example.com',
      //       phone: '080-123-4567'
      //     },
      //     items: [
      //       {
      //         productName: 'iPhone 15 Pro',
      //         quantity: 1,
      //         price: 45000,
      //         subtotal: 45000
      //       }
      //     ],
      //     pricing: {
      //       subtotal: 45000,
      //       shipping: 0,
      //       total: 45000
      //     },
      //     status: 'pending',
      //     paymentStatus: 'pending',
      //     orderDate: new Date(),
      //     createdAt: new Date()
      //   },
      //   {
      //     _id: '2',
      //     orderNumber: 'VIP-20250608-002',
      //     customerInfo: {
      //       firstName: 'ลูกค้า',
      //       lastName: 'ทดสอบ',
      //       email: 'test@example.com',
      //       phone: '081-987-6543'
      //     },
      //     items: [
      //       {
      //         productName: 'MacBook Pro',
      //         quantity: 1,
      //         price: 89000,
      //         subtotal: 89000
      //       }
      //     ],
      //     pricing: {
      //       subtotal: 89000,
      //       shipping: 0,
      //       total: 89000
      //     },
      //     status: 'confirmed',
      //     paymentStatus: 'paid',
      //     orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      //     createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      //   }
      // ]);
    } finally {
      setLoading(false);
    }
  };
  
  // 🆕 API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';

// 🆕 State for managing dropdowns
const [openDropdown, setOpenDropdown] = useState(null);
useEffect(() => {
  const handleClickOutside = (event) => {
    if (openDropdown && !event.target.closest('.dropdown-container')) {
      setOpenDropdown(null);
    }
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [openDropdown]);

// 🆕 Fetch refund requests
const fetchRefundRequests = async () => {
  try {
    console.log('📋 Fetching refund requests...');
    const response = await fetch(`${API_BASE_URL}/orders/admin/refund-requests`);
    const data = await response.json();
    if (data.success) {
      setRefundRequests(data.requests || []);
      console.log('✅ Refund requests loaded:', data.requests?.length || 0);
    }
  } catch (error) {
    console.error('❌ Error fetching refund requests:', error);
  }
};

// 🆕 Fetch refund request statistics
const fetchRefundRequestStats = async () => {
  try {
    console.log('📊 Fetching refund request stats...');
    const response = await fetch(`${API_BASE_URL}/orders/admin/refund-requests/stats`);
    const data = await response.json();
    if (data.success) {
      setRefundRequestStats(data.stats);
      console.log('✅ Refund request stats loaded:', data.stats);
    }
  } catch (error) {
    console.error('❌ Error fetching refund request stats:', error);
  }
};

// 🆕 Approve refund request
const approveRefundRequest = async (requestId, orderNumber, maxAmount) => {
  const approvedAmount = prompt(`💰 ใส่จำนวนเงินที่อนุมัติคืนสำหรับออเดอร์ ${orderNumber}:\n\nจำนวนสูงสุด: ฿${maxAmount.toLocaleString()}`);
  
  if (!approvedAmount) return;
  
  const amount = parseFloat(approvedAmount);
  if (isNaN(amount) || amount <= 0) {
    alert('❌ กรุณาใส่จำนวนเงินที่ถูกต้อง');
    return;
  }
  
  if (amount > maxAmount) {
    alert(`❌ จำนวนเงินเกินกว่าที่สามารถคืนได้ (สูงสุด ฿${maxAmount.toLocaleString()})`);
    return;
  }

  const adminNotes = prompt('📝 หมายเหตุจาก Admin (ถ้ามี):') || '';

  try {
    const response = await fetch(`${API_BASE_URL}/orders/admin/refund-requests/${requestId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        approvedAmount: amount,
        adminNotes,
        approvedBy: 'admin'
      })
    });

    const data = await response.json();
    if (data.success) {
      alert(`✅ อนุมัติคืนเงิน ฿${amount.toLocaleString()} สำหรับออเดอร์ ${orderNumber} เรียบร้อย`);
      fetchRefundRequests();
      fetchRefundRequestStats();
      fetchOrders();
      fetchStats();
    } else {
      alert('❌ เกิดข้อผิดพลาด: ' + data.message);
    }
  } catch (error) {
    console.error('❌ Approve refund error:', error);
    alert('❌ เกิดข้อผิดพลาดในการอนุมัติคืนเงิน');
  }
};

// 🆕 Reject refund request
const rejectRefundRequest = async (requestId, orderNumber) => {
  const rejectionReason = prompt(`❌ เหตุผลในการปฏิเสธคำขอคืนเงินสำหรับออเดอร์ ${orderNumber}:`);
  if (!rejectionReason) return;

  const adminNotes = prompt('📝 หมายเหตุเพิ่มเติม (ถ้ามี):') || '';

  try {
    const response = await fetch(`${API_BASE_URL}/orders/admin/refund-requests/${requestId}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        rejectionReason,
        adminNotes,
        rejectedBy: 'admin'
      })
    });

    const data = await response.json();
    if (data.success) {
      alert(`✅ ปฏิเสธคำขอคืนเงินสำหรับออเดอร์ ${orderNumber} เรียบร้อย`);
      fetchRefundRequests();
      fetchRefundRequestStats();
    } else {
      alert('❌ เกิดข้อผิดพลาด: ' + data.message);
    }
  } catch (error) {
    console.error('❌ Reject refund error:', error);
    alert('❌ เกิดข้อผิดพลาดในการปฏิเสธคำขอคืนเงิน');
  }
};

// 🆕 Format date for refund requests
const formatRefundDate = (dateString) => {
  if (!dateString) return 'ไม่ระบุ';
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 🆕 Get refund status badge
const getRefundStatusBadge = (status) => {
  const configs = {
    pending: {
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: <Clock size={14} />,
      text: 'Pending Review'
    },
    approved: {
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: <CheckCircle size={14} />,
      text: 'Approved'
    },
    rejected: {
      bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      icon: <Ban size={14} />,
      text: 'Rejected'
    }
  };

  const config = configs[status] || configs.pending;

  return (
    <span style={{
      background: config.bg,
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {config.icon}
      {config.text}
    </span>
  );
};


  // Fetch order statistics
  const fetchStats = async () => {
    try {
      const response = await ordersAPI.admin.getStats();
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
      // Mock stats for development
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        totalRevenue: orders.reduce((sum, o) => sum + o.pricing.total, 0)
      });
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus, paymentStatus = null) => {
    try {
      const updateData = { status: newStatus };
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      const response = await ordersAPI.admin.updateStatus(orderId, updateData);
      
      if (response.data.success) {
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus, ...(paymentStatus && { paymentStatus }) }
            : order
        ));
        
        // Refresh stats
        fetchStats();
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  
  // 🔄 Revert order status function
const revertOrderStatus = async (orderId, currentStatus, orderNumber) => {
  // กำหนด Revert mapping
  const revertMapping = {
    'confirmed': 'pending',
    'processing': 'confirmed', 
    'shipped': 'processing',
    'delivered': 'shipped',
    'cancelled': 'pending'
  };

  const newStatus = revertMapping[currentStatus];
  
  if (!newStatus) {
    alert('❌ ไม่สามารถยกเลิกสถานะนี้ได้');
    return;
  }

  // สร้าง confirmation message ที่ชัดเจน
  const revertMessages = {
    'confirmed': 'ยกเลิกการยืนยัน และคืนสต็อกสินค้า',
    'processing': 'ยกเลิกการเตรียมสินค้า',
    'shipped': 'ยกเลิกการจัดส่ง',
    'delivered': 'ยกเลิกการจัดส่งสำเร็จ', 
    'cancelled': 'เปิดใช้งานออเดอร์ใหม่ และหักสต็อกสินค้า'
  };

  const confirmMessage = `🔄 ${revertMessages[currentStatus]}\n\nออเดอร์: ${orderNumber}\nจาก: ${getStatusText(currentStatus)} → ${getStatusText(newStatus)}\n\n⚠️ การดำเนินการนี้จะส่งผลต่อสต็อกสินค้า\nต้องการดำเนินการต่อหรือไม่?`;
  
  if (!window.confirm(confirmMessage)) {
    return;
  }

  try {
    const response = await ordersAPI.admin.updateStatus(orderId, { 
      status: newStatus,
      isRevert: true, // บอก backend ว่าเป็นการ revert
      previousStatus: currentStatus
    });
    
    if (response.data.success) {
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      // Refresh stats
      fetchStats();
      
      // Success message with details
      const stockMessage = response.data.changes?.stockAdjusted ? 
        '\n✅ สต็อกสินค้าได้รับการปรับปรุงแล้ว' : '';
      
      alert(`✅ เปลี่ยนสถานะสำเร็จ!\n\nออเดอร์: ${orderNumber}\nสถานะใหม่: ${getStatusText(newStatus)}${stockMessage}`);
    }
  } catch (error) {
    console.error('Revert status error:', error);
    
    // Show specific error message
    const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิกสถานะ';
    alert(`❌ ${errorMessage}`);
  }
};

// เพิ่ม Functions เหล่านี้ใน OrderManager.jsx

// 💰 Process refund function
const processRefund = async (orderId, orderNumber, totalAmount) => {
  // ตรวจสอบก่อนว่าสามารถคืนเงินได้หรือไม่
  try {
    const refundInfoResponse = await ordersAPI.admin.getRefundInfo(orderId);
    
    if (!refundInfoResponse.data.success || !refundInfoResponse.data.refundInfo.canRefund) {
      alert('❌ ไม่สามารถคืนเงินได้สำหรับออเดอร์นี้');
      return;
    }
  } catch (error) {
    console.error('Error checking refund eligibility:', error);
    alert('❌ เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การคืนเงิน');
    return;
  }

  // สร้าง Refund Confirmation Dialog
  const refundReason = prompt(
    `💰 การคืนเงินสำหรับออเดอร์ ${orderNumber}\n\n` +
    `ยอดเงินที่จะคืน: ฿${totalAmount.toLocaleString()}\n\n` +
    `⚠️ การคืนเงินจะทำให้:\n` +
    `• เปลี่ยนสถานะออเดอร์เป็น "ยกเลิก"\n` +
    `• คืนสต็อกสินค้าทั้งหมด\n` +
    `• ไม่สามารถยกเลิกการคืนเงินได้\n\n` +
    `กรุณาระบุเหตุผลในการคืนเงิน:`
  );

  if (!refundReason || refundReason.trim() === '') {
    return; // ยกเลิกถ้าไม่ได้ใส่เหตุผล
  }

  // Final confirmation
  const confirmRefund = window.confirm(
    `🔄 ยืนยันการคืนเงิน?\n\n` +
    `ออเดอร์: ${orderNumber}\n` +
    `จำนวนเงิน: ฿${totalAmount.toLocaleString()}\n` +
    `เหตุผล: ${refundReason}\n\n` +
    `⚠️ การดำเนินการนี้ไม่สามารถยกเลิกได้!`
  );

  if (!confirmRefund) {
    return;
  }

  try {
    const response = await ordersAPI.admin.processRefund(orderId, {
      refundReason: refundReason.trim(),
      refundAmount: totalAmount,
      refundMethod: 'admin_manual'
    });
    
    if (response.data.success) {
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: 'cancelled', paymentStatus: 'refunded' }
          : order
      ));
      
      // Refresh stats
      fetchStats();
      
      // Success message
      alert(
        `✅ คืนเงินสำเร็จ!\n\n` +
        `ออเดอร์: ${orderNumber}\n` +
        `จำนวนเงิน: ฿${totalAmount.toLocaleString()}\n` +
        `รหัสธุรกรรม: ${response.data.refund.transactionId}\n\n` +
        `📦 สต็อกสินค้าได้รับการคืนแล้ว`
      );
    }
  } catch (error) {
    console.error('Refund error:', error);
    
    const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการคืนเงิน';
    alert(`❌ ${errorMessage}`);
  }
};

// 🔍 Check if order can be refunded
const canRefund = (order) => {
  return order.paymentStatus === 'paid' && order.paymentStatus !== 'refunded';
};

// 💰 Get refund status badge
const getRefundBadge = (paymentStatus, refundInfo) => {
  if (paymentStatus === 'refunded') {
    return (
      <span style={{
        background: '#fef3c7',
        color: '#92400e',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        border: '1px solid #f59e0b20',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        💰 Refunded
        {refundInfo?.amount && (
          <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
            ฿{refundInfo.amount.toLocaleString()}
          </span>
        )}
      </span>
    );
  }
  return null;
};

// 📝 Helper function สำหรับแสดงชื่อสถานะเป็นไทย
const getStatusText = (status) => {
  const statusTexts = {
    'pending': 'รอดำเนินการ',
    'confirmed': 'ยืนยันแล้ว', 
    'processing': 'กำลังเตรียม',
    'shipped': 'จัดส่งแล้ว',
    'delivered': 'จัดส่งสำเร็จ',
    'cancelled': 'ยกเลิก'
  };
  return statusTexts[status] || status;
};

// 🔄 Helper function สำหรับ revert mapping
const getRevertStatus = (currentStatus) => {
  const revertMapping = {
    'confirmed': 'pending',
    'processing': 'confirmed', 
    'shipped': 'processing',
    'delivered': 'shipped',
    'cancelled': 'pending'
  };
  return revertMapping[currentStatus] || currentStatus;
};

// 🎯 Helper function เช็คว่า status นี้สามารถ revert ได้หรือไม่
const canRevertStatus = (status) => {
  return ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status);
};

  // Delete order function
const deleteOrder = async (orderId, orderNumber) => {
  if (!window.confirm(`ต้องการลบออเดอร์ ${orderNumber} ใช่หรือไม่?\n\n⚠️ การลบจะไม่สามารถยกเลิกได้!`)) {
    return;
  }

  try {
    const response = await ordersAPI.admin.delete(orderId);
    
    if (response.data.success) {
      // Remove from local state
      setOrders(orders.filter(order => order._id !== orderId));
      fetchStats(); // Refresh stats
      alert('✅ ลบออเดอร์สำเร็จแล้ว');
    }
  } catch (error) {
    console.error('Delete order error:', error);
    alert('❌ เกิดข้อผิดพลาดในการลบออเดอร์');
  }
};

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { 
      color: '#f59e0b', 
      bg: '#fef3c7', 
      icon: <Clock size={14} />,
      text: 'Pending' 
    },
    confirmed: { 
      color: '#3b82f6', 
      bg: '#dbeafe', 
      icon: <CheckCircle size={14} />,
      text: 'Confirmed' 
    },
    processing: { 
      color: '#8b5cf6', 
      bg: '#ede9fe', 
      icon: <Package size={14} />,
      text: 'Processing' 
    },
    shipped: { 
      color: '#06b6d4', 
      bg: '#cffafe', 
      icon: <Truck size={14} />,
      text: 'Shipped' 
    },
    delivered: { 
      color: '#10b981', 
      bg: '#d1fae5', 
      icon: <CheckCircle size={14} />,
      text: 'Delivered' 
    },
    cancelled: { 
      color: '#ef4444', 
      bg: '#fee2e2', 
      icon: <Ban size={14} />,
      text: 'Cancelled' 
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span style={{
      background: config.bg,
      color: config.color,
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      border: `1px solid ${config.color}20`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {config.icon}
      {config.text}
    </span>
  );
};

  // Get payment status badge
  const getPaymentBadge = (paymentStatus) => {
  const paymentConfig = {
    pending: { 
      color: '#f59e0b', 
      bg: '#fef3c7', 
      text: 'Pending',
      icon: <Clock size={14} />
    },
    paid: { 
      color: '#10b981', 
      bg: '#d1fae5', 
      text: 'Payment success',
      icon: <CheckCircle size={14} />
    },
    failed: { 
      color: '#ef4444', 
      bg: '#fee2e2', 
      text: 'Payment failed',
      icon: <AlertTriangle size={14} />
    },
    refunded: { 
      color: '#f59e0b', 
      bg: '#fef3c7', 
      text: 'Refunded',
      icon: <DollarSign size={14} />
    }
  };

  const config = paymentConfig[paymentStatus] || paymentConfig.pending;
  
  return (
    <span style={{
      background: config.bg,
      color: config.color,
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      border: `1px solid ${config.color}20`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {config.icon}
      {config.text}
    </span>
  );
};

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    if (!filters.searchTerm) return true;
    
    const searchLower = filters.searchTerm.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customerInfo.firstName.toLowerCase().includes(searchLower) ||
      order.customerInfo.lastName.toLowerCase().includes(searchLower) ||
      order.customerInfo.email.toLowerCase().includes(searchLower) ||
      order.customerInfo.phone.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>กำลังโหลดข้อมูลออเดอร์...</p>
        <style>
  {`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `}
</style>
      </div>
    );
  }

  return (
    <div className="order-manager-container">
      {/* Header Section */}
      <div className="manager-header">
  <div>
    <h2>
      <ShoppingCart size={28} className="section-icon" />
      Order Management
    </h2>
    <p>Track and manage all orders</p>
  </div>
  
  {/* Refund Request Notification Bell */}
<div style={{ position: 'relative' }}>
  <button
    onClick={() => setShowRefundRequests(true)}
    style={{
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      cursor: 'pointer',
      position: 'relative',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
    title="Customer refund requests"
  >
    <DollarSign size={28} />
  </button>
  {refundRequestStats.pendingRequests > 0 && (
    <span style={{
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: '#fbbf24',
      color: '#92400e',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      border: '2px solid white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      animation: 'pulse 2s infinite'
    }}>
      {refundRequestStats.pendingRequests}
    </span>
  )}
</div>
</div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total Orders Card */}
  <div style={{
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center'
  }}>
    <ShoppingCart size={32} style={{ marginBottom: '8px' }} />
    <div style={{ fontSize: '2rem', fontWeight: '700' }}>
      {stats.totalOrders}
    </div>
    <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
      All Orders
    </div>
  </div>

  {/* Pending Orders Card */}
  <div style={{
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center'
  }}>
    <Clock size={32} style={{ marginBottom: '8px' }} />
    <div style={{ fontSize: '2rem', fontWeight: '700' }}>
      {stats.pendingOrders}
    </div>
    <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
      Pending Orders
    </div>
  </div>

  {/* Completed Orders Card */}
  <div style={{
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center'
  }}>
    <CheckCircle size={32} style={{ marginBottom: '8px' }} />
    <div style={{ fontSize: '2rem', fontWeight: '700' }}>
      {stats.completedOrders}
    </div>
    <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
      Completed Orders
    </div>
</div>

{/* Total Revenue Card */}
<div style={{
  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  color: 'white',
  padding: '20px',
  borderRadius: '12px',
  textAlign: 'center'
}}>
  <DollarSign size={32} style={{ marginBottom: '8px' }} />
  <div style={{ fontSize: '2rem', fontWeight: '700' }}>
    {formatCurrency(stats.totalRevenue).replace('฿', '')}
  </div>
  <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
    Total Sales (฿)
  </div>
</div>
</div>

      {/* Search and Filter Section */}
       <div className="filters-section">
  {/* Search Box */}
  <div className="search-box">
    <Search size={18} className="search-icon" />
    <input
      type="text"
      placeholder="Search orders..."
      value={filters.searchTerm}
      onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
      className="search-input"
    />
  </div>

  {/* Status Filter */}
  <div className="filter-box">
    <select
      value={filters.status}
      onChange={(e) => setFilters({...filters, status: e.target.value})}
      className="filter-select"
      style={{ paddingLeft: '16px' }}
    >
      <option value="all">All status</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="processing">Processing</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>

  {/* Results Info */}
  <div className="results-info">
    Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
  </div>

  {/* Refresh Button */}
  <button onClick={fetchOrders} className="btn-primary">
    <RefreshCw size={18} />
    Reload
  </button>
</div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Orders Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.2rem', 
            fontWeight: '600',
            color: '#374151'
          }}>
            Order List : ({filteredOrders.length} items)
          </h3>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <Package size={64} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '1.1rem', margin: 0 }}>
              {filters.searchTerm || filters.status !== 'all' 
                ? 'No orders found matching search criteria' 
                : 'No orders in system yet'
              }
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' ,position: 'relative',zIndex: 1 }}>
            <table className="products-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>PRODUCTS</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th>PAYMENT</th>
                    <th>ORDER DATE</th>
                    <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr 
                    key={order._id || index}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s',
                      position: 'relative',
                      zIndex: openDropdown === order._id ? 10 : 1
                    }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#374151', fontFamily: 'monospace' }}>
                        {order.orderNumber}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#374151' }}>
                          {order.customerInfo.firstName} {order.customerInfo.lastName}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {order.customerInfo.email}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {order.customerInfo.phone}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                        {order.items.length} รายการ
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#374151' }}>
                        {formatCurrency(order.pricing.total)}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {getStatusBadge(order.status)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {getPaymentBadge(order.paymentStatus)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                      {formatDate(order.orderDate || order.createdAt)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div className="dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
                        {/* Main Action Button */}
                        <button
                          onClick={() => setOpenDropdown(openDropdown === order._id ? null : order._id)}
                          style={{
                            padding: '8px 20px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                          }}
                        >
                          <Settings size={16} />
                          Actions
                          {openDropdown === order._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdown === order._id && (
                          <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            right: 0,
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                            minWidth: '220px',
                            zIndex: 9999,
                            overflow: 'hidden',
                            animation: 'slideDown 0.2s ease',
                            maxHeight: '400px',
                            overflowY: 'auto'
                          }}>
                            <style>
                              {`
                                @keyframes slideDown {
                                  from {
                                    opacity: 0;
                                    transform: translateY(-10px);
                                  }
                                  to {
                                    opacity: 1;
                                    transform: translateY(0);
                                  }
                                }
                              `}
                            </style>

                            {/* View Details */}
                            <button
                              onClick={() => {
                                setShowOrderDetails(order);
                                setOpenDropdown(null);
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#1e293b',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Eye size={16} style={{ color: '#3b82f6' }} />
                              View Details
                            </button>

                            {/* PENDING STATUS */}
                            {order.status === 'pending' && (
                              <>
                                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                                <button
                                  onClick={() => {
                                    updateOrderStatus(order._id, 'confirmed', 'paid');
                                    setOpenDropdown(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#10b981',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <CheckCircle size={16} />
                                  Confirm Order
                                </button>
                                <button
                                  onClick={() => {
                                    updateOrderStatus(order._id, 'cancelled');
                                    setOpenDropdown(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#ef4444',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <Ban size={16} />
                                  Cancel Order
                                </button>
                              </>
                            )}

                            {/* CONFIRMED STATUS */}
                            {order.status === 'confirmed' && (
                              <>
                                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                                <button
                                  onClick={() => {
                                    updateOrderStatus(order._id, 'processing');
                                    setOpenDropdown(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#8b5cf6',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <Package size={16} />
                                  Start Processing
                                </button>
                                <button
                                  onClick={() => {
                                    revertOrderStatus(order._id, order.status, order.orderNumber);
                                    setOpenDropdown(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#f59e0b',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  title="Revert to Pending"
                                >
                                  <RotateCcw size={16} />
                                  Revert Confirmation
                                </button>
                              </>
                            )}

                            {/* PROCESSING STATUS */}
                            {order.status === 'processing' && (
                              <>
                                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                                <button
                                  onClick={() => {
                                    updateOrderStatus(order._id, 'shipped');
                                    setOpenDropdown(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#06b6d4',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#ecfeff'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <Truck size={16} />
                                  Ship Order
                                </button>
                                <button
                                  onClick={() => {
                                    revertOrderStatus(order._id, order.status, order.orderNumber);
                                    setOpenDropdown(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#f59e0b',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  title="Revert to Confirmed"
                                >
                                  <RotateCcw size={16} />
                                  Revert Processing
                                </button>
                              </>
                            )}

                            {/* SHIPPED STATUS */}
                            {order.status === 'shipped' && (
                              <>
                                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                                <button
                                  onClick={() => {
                                    updateOrderStatus(order._id, 'delivered');
                                    setOpenDropdown(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#10b981',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <CheckCircle size={16} />
                                  Mark as Delivered
                                </button>
                                <button
                                  onClick={() => {
                                    revertOrderStatus(order._id, order.status, order.orderNumber);
                                    setOpenDropdown(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#f59e0b',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  title="Revert to Processing"
                                >
                                  <RotateCcw size={16} />
                                  Revert Shipment
                                </button>
                              </>
                            )}

                            {/* DELIVERED STATUS */}
                            {order.status === 'delivered' && (
                              <>
                                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                                <button
                                  onClick={() => {
                                    revertOrderStatus(order._id, order.status, order.orderNumber);
                                    setOpenDropdown(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#f59e0b',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  title="Revert to Shipped"
                                >
                                  <RotateCcw size={16} />
                                  Revert Delivery
                                </button>
                              </>
                            )}

                            {/* CANCELLED STATUS */}
                            {order.status === 'cancelled' && (
                              <>
                                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                                <button
                                  onClick={() => {
                                    revertOrderStatus(order._id, order.status, order.orderNumber);
                                    setOpenDropdown(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#10b981',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  title="Reactivate to Pending"
                                >
                                  <RotateCcw size={16} />
                                  Reactivate Order
                                </button>
                              </>
                            )}

                            {/* Dangerous Actions Section */}
                            <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

                            {/* Refund Button */}
                            {canRefund(order) && (
                              <button
                                onClick={() => {
                                  processRefund(order._id, order.orderNumber, order.pricing.total);
                                  setOpenDropdown(null);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  border: 'none',
                                  background: 'transparent',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  color: '#f59e0b',
                                  fontSize: '0.9rem',
                                  fontWeight: '500',
                                  transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                title="Refund and Cancel Order"
                              >
                                <DollarSign size={16} />
                                Process Refund
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                deleteOrder(order._id, order.orderNumber);
                                setOpenDropdown(null);
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#ef4444',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              title="Delete Order Permanently"
                            >
                              <Trash2 size={16} />
                              Delete Order
                            </button>
                          </div>
                        )}
                      </div>
                    </td>


{/* //////// */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                <FileText size={24} /> Order Details
              </h3>
              <button
                onClick={() => setShowOrderDetails(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Order Info */}
              <div>
                <h4 style={{ 
                  margin: '0 0 12px', 
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FileText size={20} style={{ color: '#3b82f6' }} />
                  Order Information
                </h4>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div><strong>Order ID:</strong> {showOrderDetails.orderNumber}</div>
                    <div><strong>Order Date:</strong> {formatDate(showOrderDetails.orderDate || showOrderDetails.createdAt)}</div>
                    <div><strong>Status:</strong> {getStatusBadge(showOrderDetails.status)}</div>
                    <div><strong>Payment:</strong> {getPaymentBadge(showOrderDetails.paymentStatus)}</div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                 <h4 style={{ 
                    margin: '0 0 12px', 
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Users size={20} style={{ color: '#3b82f6' }} />
                    Customer Information
                  </h4>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} style={{ color: '#6b7280' }} />
                      <strong>Name:</strong> {showOrderDetails.customerInfo.firstName} {showOrderDetails.customerInfo.lastName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={16} style={{ color: '#6b7280' }} />
                      <strong>Email:</strong> {showOrderDetails.customerInfo.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} style={{ color: '#6b7280' }} />
                      <strong>Phone:</strong> {showOrderDetails.customerInfo.phone}
                    </div>
                    {showOrderDetails.customerInfo.address && (
                        <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                          <MapPin size={16} style={{ color: '#6b7280', marginTop: '2px' }} />
                          <div>
                            <strong>Address:</strong> {showOrderDetails.customerInfo.address.street}, {showOrderDetails.customerInfo.address.district}, {showOrderDetails.customerInfo.address.province} {showOrderDetails.customerInfo.address.postalCode}
                          </div>
                        </div>
                      )}
                    {/* 🆕 แสดงหมายเหตุเพิ่มเติม */}
                    {showOrderDetails.customerInfo.address?.notes && (
                      <div style={{ 
                        marginTop: '8px', 
                        padding: '12px', 
                        background: '#fef3c7', 
                        border: '1px solid #f59e0b',
                        borderRadius: '6px'
                      }}>
                        <strong><TriangleAlert size={16} /> Additional notes : </strong>
                        <div style={{ 
                          marginTop: '4px', 
                          fontStyle: 'italic',
                          color: '#92400e'
                        }}>
                          "{showOrderDetails.customerInfo.address.notes}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h4 style={{ 
                  margin: '0 0 12px', 
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Package size={20} style={{ color: '#3b82f6' }} />
                  Order Items
                </h4>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  {showOrderDetails.items.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < showOrderDetails.items.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                          {formatCurrency(item.price)} × {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontWeight: '600', color: '#374151' }}>
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
               <h4 style={{ 
                  margin: '0 0 12px', 
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <DollarSign size={20} style={{ color: '#3b82f6' }} />
                  Order Summary
                </h4>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Price:</span>
                    <span>{formatCurrency(showOrderDetails.pricing.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Shipping (มากกว่า 1000 Bath):</span>
                    <span>{showOrderDetails.pricing.shipping === 0 ? 'Free!' : formatCurrency(showOrderDetails.pricing.shipping)}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    borderTop: '2px solid #e5e7eb',
                    paddingTop: '8px',
                    marginTop: '8px'
                  }}>
                    <span>Total:</span>
                    <span style={{ color: '#059669' }}>{formatCurrency(showOrderDetails.pricing.total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              borderTop: '2px solid #e5e7eb',
              paddingTop: '16px',
              flexWrap: 'wrap'
            }}>
                {/* CLOSE BUTTON - แสดงเสมอ */}
                <button
                  onClick={() => setShowOrderDetails(null)}
                  style={{
                    padding: '12px 20px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 🆕 Refund Requests Modal */}
{showRefundRequests && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  }}>
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '1000px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '1.5rem', 
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <DollarSign size={24} style={{ color: '#ef4444' }} />
          Customer Refund Requests
        </h3>
        <button
          onClick={() => setShowRefundRequests(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {refundRequestStats.totalRequests}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: '0.9' }}>
            คำขอทั้งหมด
          </div>
        </div> */}

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <Clock size={24} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {refundRequestStats.pendingRequests}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: '0.9' }}>
            Pending Review
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <CheckCircle size={24} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {refundRequestStats.approvedRequests}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: '0.9' }}>
            Approved
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <Ban size={24} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {refundRequestStats.rejectedRequests}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: '0.9' }}>
            Rejected
          </div>
        </div>
      </div>

      {refundRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <DollarSign size={64} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <p>No refund requests</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto',position: 'relative',zIndex: 1  }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Order</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Reason</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Requested At</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {refundRequests.map((request) => (
                <tr key={request.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                      {request.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      ฿{request.orderTotal.toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '600' }}>
                      {request.customer.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {request.customer.email}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: '#ef4444' }}>
                      ฿{request.requestedAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                      สูงสุด ฿{request.maxRefundAmount.toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#374151',
                      maxWidth: '150px',
                      wordWrap: 'break-word'
                    }}>
                      {request.reason}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {getRefundStatusBadge(request.status)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem', color: '#6b7280' }}>
                    {formatRefundDate(request.requestedAt)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {request.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => approveRefundRequest(request.id, request.orderNumber, request.maxRefundAmount)}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectRefundRequest(request.id, request.orderNumber)}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Ban size={14} />
                            Reject
                          </button>
                        </div>
                      )}
                    {request.status !== 'pending' && (
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {formatRefundDate(request.processedAt)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}
    </div>
    
  );
};

export default OrderManager;