// frontend/src/components/admin/OrderManager.jsx

import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';

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
    limit: 20
  });
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Fetch orders and stats on component mount
  useEffect(() => {
    fetchOrders();
    fetchStats();
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
      pending: { color: '#f59e0b', bg: '#fef3c7', text: '🕐 Pending' },
      confirmed: { color: '#3b82f6', bg: '#dbeafe', text: '✅ Confirmed' },
      processing: { color: '#8b5cf6', bg: '#ede9fe', text: '⚙️ Prepare' },
      shipped: { color: '#06b6d4', bg: '#cffafe', text: '🚚 Shipped' },
      delivered: { color: '#10b981', bg: '#d1fae5', text: '📦 Delivered' },
      cancelled: { color: '#ef4444', bg: '#fee2e2', text: '❌ Order cancelled' }
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
        border: `1px solid ${config.color}20`
      }}>
        {config.text}
      </span>
    );
  };

  // Get payment status badge
  const getPaymentBadge = (paymentStatus) => {
    const paymentConfig = {
      pending: { color: '#f59e0b', bg: '#fef3c7', text: '💳 Pending' },
      paid: { color: '#10b981', bg: '#d1fae5', text: '✅ Payment suscess' },
      failed: { color: '#ef4444', bg: '#fee2e2', text: '❌ Payment failed' },
      refunded: { color: '#6b7280', bg: '#f3f4f6', text: '↩️ Refunded' }
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
        border: `1px solid ${config.color}20`
      }}>
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
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          fontWeight: '700', 
          color: '#333',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📦 Order Managment
        </h2>
        <p style={{ color: '#666', fontSize: '1rem' }}>
          ติดตามและจัดการคำสั่งซื้อทั้งหมด
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {stats.totalOrders}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
            All Order
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {stats.pendingOrders}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
            Pending Orders
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {stats.completedOrders}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
            Completed Orders
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {formatCurrency(stats.totalRevenue).replace('฿', '')}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
            Total sales (฿)
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <input
            type="text"
            placeholder="🔍 ค้นหาออเดอร์ (เลขออเดอร์, ชื่อลูกค้า, อีเมล, เบอร์โทร)"
            value={filters.searchTerm}
            onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">All status</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="confirmed">ยืนยันแล้ว</option>
          <option value="processing">กำลังเตรียม</option>
          <option value="shipped">จัดส่งแล้ว</option>
          <option value="delivered">จัดส่งสำเร็จ</option>
          <option value="cancelled">ยกเลิก</option>
        </select>

        {/* Refresh Button */}
        <button
          onClick={fetchOrders}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔄 Reload 
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
            รายการออเดอร์ ({filteredOrders.length} รายการ)
          </h3>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>
              {filters.searchTerm || filters.status !== 'all' 
                ? 'ไม่พบออเดอร์ที่ตรงกับเงื่อนไขการค้นหา' 
                : 'ยังไม่มีออเดอร์ในระบบ'
              }
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>เลขออเดอร์</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>ลูกค้า</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>สินค้า</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>ยอดรวม</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>สถานะ</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>การชำระ</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>วันที่สั่ง</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr 
                    key={order._id || index}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s'
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
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setShowOrderDetails(order)}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ ดู
                        </button>
                        
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'confirmed', 'paid')}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            ✅ ยืนยัน
                          </button>
                        )}

                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'shipped')}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            🚚 จัดส่ง
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            📦 สำเร็จ
                          </button>
                        )}

                        {/* Delete Button */}
                            <button
                            onClick={() => deleteOrder(order._id, order.orderNumber)}
                            style={{
                                padding: '6px 12px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                            >
                            🗑️ ลบ
                            </button>
                      </div>
                    </td>
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
                📦 รายละเอียดออเดอร์
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
                <h4 style={{ margin: '0 0 12px', color: '#374151' }}>ข้อมูลออเดอร์</h4>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div><strong>เลขออเดอร์:</strong> {showOrderDetails.orderNumber}</div>
                    <div><strong>วันที่สั่ง:</strong> {formatDate(showOrderDetails.orderDate || showOrderDetails.createdAt)}</div>
                    <div><strong>สถานะ:</strong> {getStatusBadge(showOrderDetails.status)}</div>
                    <div><strong>การชำระ:</strong> {getPaymentBadge(showOrderDetails.paymentStatus)}</div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 style={{ margin: '0 0 12px', color: '#374151' }}>ข้อมูลลูกค้า</h4>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div><strong>ชื่อ:</strong> {showOrderDetails.customerInfo.firstName} {showOrderDetails.customerInfo.lastName}</div>
                    <div><strong>อีเมล:</strong> {showOrderDetails.customerInfo.email}</div>
                    <div><strong>เบอร์โทร:</strong> {showOrderDetails.customerInfo.phone}</div>
                    {showOrderDetails.customerInfo.address && (
                      <div><strong>ที่อยู่:</strong> {showOrderDetails.customerInfo.address.street}, {showOrderDetails.customerInfo.address.district}, {showOrderDetails.customerInfo.address.province} {showOrderDetails.customerInfo.address.postalCode}</div>
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
                        <strong>📝 หมายเหตุเพิ่มเติม:</strong>
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
                <h4 style={{ margin: '0 0 12px', color: '#374151' }}>รายการสินค้า</h4>
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
                <h4 style={{ margin: '0 0 12px', color: '#374151' }}>สรุปยอดเงิน</h4>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>ยอดสินค้า:</span>
                    <span>{formatCurrency(showOrderDetails.pricing.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>ค่าจัดส่ง:</span>
                    <span>{showOrderDetails.pricing.shipping === 0 ? 'ฟรี!' : formatCurrency(showOrderDetails.pricing.shipping)}</span>
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
                    <span>ยอดรวมทั้งสิ้น:</span>
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
                paddingTop: '16px'
              }}>
                {showOrderDetails.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        updateOrderStatus(showOrderDetails._id, 'confirmed', 'paid');
                        setShowOrderDetails(null);
                      }}
                      style={{
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ✅ ยืนยันออเดอร์
                    </button>
                    <button
                      onClick={() => {
                        updateOrderStatus(showOrderDetails._id, 'cancelled');
                        setShowOrderDetails(null);
                      }}
                      style={{
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ❌ ยกเลิกออเดอร์
                    </button>
                  </>
                )}

                {showOrderDetails.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(showOrderDetails._id, 'shipped');
                      setShowOrderDetails(null);
                    }}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🚚 เปลี่ยนเป็นจัดส่งแล้ว
                  </button>
                )}

                {showOrderDetails.status === 'shipped' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(showOrderDetails._id, 'delivered');
                      setShowOrderDetails(null);
                    }}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    📦 เปลี่ยนเป็นจัดส่งสำเร็จ
                  </button>
                )}

                <button
                  onClick={() => setShowOrderDetails(null)}
                  style={{
                    padding: '12px 20px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;