// src/components/UserProfileModal.jsx - Enhanced with Order History

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api'; // 🆕 Import ordersAPI

// ✅ Use Environment Variable or Fallback to Production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';

console.log('🔗 UserProfileModal API_BASE_URL:', API_BASE_URL);

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user: currentUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordRequest, setShowPasswordRequest] = useState(false);
  const [passwordRequestNote, setPasswordRequestNote] = useState('');
  
  // 🆕 เพิ่ม state สำหรับประวัติคำขอ
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 🛒 เพิ่ม state สำหรับประวัติการสั่งซื้อ
  const [orderHistory, setOrderHistory] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Initialize form data when modal opens or user changes
  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        username: currentUser.username || ''
      });
      setError('');
      setSuccess('');
      setShowPasswordRequest(false);
      setPasswordRequestNote('');
      setShowHistory(false);
      setShowOrderHistory(false);
      
      // 🆕 โหลดประวัติคำขอเปลี่ยนรหัสผ่าน
      fetchPasswordHistory();
      // 🛒 โหลดประวัติการสั่งซื้อ
      fetchOrderHistory();
    }
  }, [isOpen, currentUser]);

  // 🆕 ฟังก์ชันโหลดประวัติคำขอ
  const fetchPasswordHistory = async () => {
    if (!currentUser) return;
    
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user-password-requests/${currentUser._id || currentUser.id}`);
      const data = await response.json();
      
      if (data.success) {
        setPasswordHistory(data.requests || []);
      } else {
        console.error('Failed to fetch password history:', data.message);
      }
    } catch (error) {
      console.error('Error fetching password history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 🛒 ฟังก์ชันโหลดประวัติการสั่งซื้อ
  const fetchOrderHistory = async () => {
    if (!currentUser) return;
    
    setOrderLoading(true);
    try {
      console.log('🛒 Fetching orders for user:', currentUser._id || currentUser.id);
      const response = await ordersAPI.getMyOrders(currentUser._id || currentUser.id);
      
      if (response.data.success) {
        console.log('✅ Orders fetched:', response.data.orders.length);
        setOrderHistory(response.data.orders || []);
      } else {
        console.error('Failed to fetch orders:', response.data.message);
        setOrderHistory([]);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      setOrderHistory([]);
    } finally {
      setOrderLoading(false);
    }
  };

  // 🚫 ฟังก์ชันยกเลิกการสั่งซื้อ
  const handleCancelOrder = async (orderId, orderNumber) => {
    // ยืนยันการยกเลิก
    const confirmed = window.confirm(
      `❗ ต้องการยกเลิกออเดอร์ ${orderNumber} ใช่หรือไม่?\n\n` +
      `⚠️ การยกเลิกจะไม่สามารถทำใหม่ได้!\n` +
      `💰 สินค้าจะถูกคืนสต็อก และการชำระเงิน (ถ้ามี) จะได้รับการคืนเงิน`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');

      console.log(`🚫 Cancelling order: ${orderNumber} (${orderId})`);

      // เรียก API ยกเลิกออเดอร์ (ใช้ admin endpoint เพื่อเปลี่ยนสถานะ)
      const response = await ordersAPI.admin.updateStatus(orderId, {
        status: 'cancelled',
        notes: `ยกเลิกโดยลูกค้า: ${currentUser.firstName} ${currentUser.lastName} เมื่อ ${new Date().toLocaleString('th-TH')}`
      });

      if (response.data.success) {
        setSuccess(`✅ ยกเลิกออเดอร์ ${orderNumber} สำเร็จ! สินค้าถูกคืนสต็อกแล้ว`);
        
        // รีเฟรชรายการออเดอร์
        await fetchOrderHistory();

        // ซ่อนข้อความสำเร็จหลัง 3 วินาที
        setTimeout(() => {
          setSuccess('');
        }, 3000);

      } else {
        setError(response.data.message || 'ไม่สามารถยกเลิกออเดอร์ได้');
      }

    } catch (error) {
      console.error('Cancel order error:', error);
      setError('เกิดข้อผิดพลาดในการยกเลิกออเดอร์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // 💳 ฟังก์ชันจำลองการชำระเงิน
  const handlePayment = async (orderId, orderNumber, totalAmount) => {
    // แสดงหน้าต่างจำลองการชำระเงิน
    const paymentMethod = window.prompt(
      `💳 เลือกวิธีชำระเงินสำหรับออเดอร์ ${orderNumber}\n` +
      `💰 ยอดเงิน: ${formatPrice(totalAmount)}\n\n` +
      `กรุณาเลือกวิธีชำระเงิน:\n` +
      `1. บัตรเครดิต/เดบิต\n` +
      `2. โอนผ่านธนาคาร\n` +
      `3. พร้อมเพย์\n` +
      `4. เก็บเงินปลายทาง\n\n` +
      `พิมพ์เลข 1-4:`,
      "1"
    );

    if (!paymentMethod || !['1', '2', '3', '4'].includes(paymentMethod)) {
      return; // ยกเลิกการชำระเงิน
    }

    const methods = {
      '1': 'บัตรเครดิต/เดบิต 💳',
      '2': 'โอนผ่านธนาคาร 🏦',
      '3': 'พร้อมเพย์ 📱',
      '4': 'เก็บเงินปลายทาง 💵'
    };

    const selectedMethod = methods[paymentMethod];

    // จำลองกระบวนการชำระเงิน
    const confirmed = window.confirm(
      `💳 ยืนยันการชำระเงิน\n\n` +
      `📦 ออเดอร์: ${orderNumber}\n` +
      `💰 ยอดเงิน: ${formatPrice(totalAmount)}\n` +
      `💳 วิธีชำระ: ${selectedMethod}\n\n` +
      `⚠️ นี่เป็นการจำลองเท่านั้น ไม่มีการหักเงินจริง\n\n` +
      `ต้องการดำเนินการต่อไหม?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');

      console.log(`💳 Processing payment for order: ${orderNumber}`);

      // จำลองเวลาการประมวลผล (1-3 วินาที)
      const processingTime = Math.random() * 2000 + 1000;
      
      // แสดง loading message
      setSuccess(`⏳ กำลังประมวลผลการชำระเงิน ${selectedMethod}...`);

      await new Promise(resolve => setTimeout(resolve, processingTime));

      // จำลองความสำเร็จ 95% (มีโอกาส 5% ที่จะ "ล้มเหลว" เพื่อความสมจริง)
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        // อัพเดตสถานะการชำระเงินและออเดอร์
        const response = await ordersAPI.admin.updateStatus(orderId, {
          status: 'confirmed',
          paymentStatus: 'paid',
          notes: `ชำระเงินสำเร็จด้วย ${selectedMethod} เมื่อ ${new Date().toLocaleString('th-TH')} (จำลอง)`
        });

        if (response.data.success) {
          setSuccess(
            `🎉 ชำระเงินสำเร็จ!\n\n` +
            `📦 ออเดอร์: ${orderNumber}\n` +
            `💰 ยอดเงิน: ${formatPrice(totalAmount)}\n` +
            `💳 วิธีชำระ: ${selectedMethod}\n` +
            `📅 เวลา: ${new Date().toLocaleString('th-TH')}\n\n` +
            `✅ ออเดอร์ได้รับการยืนยันแล้ว เตรียมจัดส่งสินค้า`
          );

          // รีเฟรชรายการออเดอร์
          await fetchOrderHistory();

          // ซ่อนข้อความสำเร็จหลัง 5 วินาที
          setTimeout(() => {
            setSuccess('');
          }, 5000);

        } else {
          setError('ชำระเงินสำเร็จ แต่ไม่สามารถอัพเดตสถานะออเดอร์ได้');
        }

      } else {
        // จำลองการชำระเงินล้มเหลว
        setError(
          `❌ การชำระเงินล้มเหลว\n\n` +
          `สาเหตุที่เป็นไปได้:\n` +
          `• ยอดเงินในบัญชีไม่เพียงพอ\n` +
          `• ข้อมูลบัตรไม่ถูกต้อง\n` +
          `• ปัญหาจากระบบธนาคาร\n\n` +
          `กรุณาลองใหม่อีกครั้ง หรือเปลี่ยนวิธีชำระเงิน`
        );
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      setError('เกิดข้อผิดพลาดในระบบชำระเงิน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.username) {
        setError('กรุณากรอกข้อมูลให้ครบถ้วน');
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email)) {
        setError('กรุณาใส่อีเมลที่ถูกต้อง');
        setLoading(false);
        return;
      }

      // Username validation
      if (formData.username.length < 3) {
        setError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
        setLoading(false);
        return;
      }

      // ✅ Updated to use production API URL
      const response = await fetch(`${API_BASE_URL}/auth/users/${currentUser._id || currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          username: formData.username.trim(),
          role: currentUser.role // Keep same role
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ อัปเดตข้อมูลสำเร็จ!');
        
        // Update user in context (if updateUser function exists)
        if (updateUser) {
          updateUser(data.user);
        }

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);

      } else {
        setError(data.message || 'ไม่สามารถอัปเดตข้อมูลได้');
      }

    } catch (error) {
      console.error('Update profile error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change request
  const handlePasswordRequest = async () => {
    if (!passwordRequestNote.trim()) {
      setError('กรุณาใส่เหตุผลในการเปลี่ยนรหัสผ่าน');
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Updated to use production API URL
      const response = await fetch(`${API_BASE_URL}/auth/password-change-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id || currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          fullName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username,
          reason: passwordRequestNote.trim(),
          requestDate: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ ส่งคำขอเปลี่ยนรหัสผ่านให้ Admin แล้ว จะได้รับการติดต่อกลับเร็วๆ นี้');
        setShowPasswordRequest(false);
        setPasswordRequestNote('');
        setError('');
        
        // 🆕 รีเฟรชประวัติหลังส่งคำขอใหม่
        setTimeout(() => {
          fetchPasswordHistory();
        }, 1000);
      } else {
        setError(data.message || 'ไม่สามารถส่งคำขอได้');
      }

    } catch (error) {
      console.error('Password request error:', error);
      setError('เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 ฟังก์ชันแสดงสถานะ
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span style={{
            background: '#fef3c7',
            color: '#d97706',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            ⏳ รอดำเนินการ
          </span>
        );
      case 'approved':
        return (
          <span style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            ✅ อนุมัติแล้ว
          </span>
        );
      case 'rejected':
        return (
          <span style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            ❌ ปฏิเสธ
          </span>
        );
      default:
        return null;
    }
  };

  // 🛒 ฟังก์ชันแสดงสถานะ Order
  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: '#fef3c7', color: '#d97706', icon: '⏳', text: 'รอดำเนินการ' },
      confirmed: { bg: '#dbeafe', color: '#1d4ed8', icon: '✅', text: 'ยืนยันแล้ว' },
      processing: { bg: '#e0e7ff', color: '#6366f1', icon: '⚙️', text: 'กำลังเตรียม' },
      shipped: { bg: '#dcfce7', color: '#059669', icon: '🚚', text: 'จัดส่งแล้ว' },
      delivered: { bg: '#dcfce7', color: '#166534', icon: '📦', text: 'สำเร็จ' },
      cancelled: { bg: '#fee2e2', color: '#dc2626', icon: '❌', text: 'ยกเลิก' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span style={{
        background: config.bg,
        color: config.color,
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '0.8rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        minWidth: 'fit-content'
      }}>
        {config.icon} {config.text}
      </span>
    );
  };

  // 🆕 ฟังก์ชันฟอร์แมตวันที่
  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🛒 ฟังก์ชันฟอร์แมตราคา
  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  // Don't render if modal is not open
  if (!isOpen || !currentUser) {
    return null;
  }

  return (
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
        maxWidth: '700px', // 🛒 เพิ่มขนาดเพื่อรองรับ order list
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid #f1f5f9'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            fontWeight: '700',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            👤 ข้อมูลผู้ใช้งาน
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px',
              color: '#666',
              borderRadius: '4px'
            }}
            onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
            onMouseOut={(e) => e.target.style.background = 'none'}
          >
            ✕
          </button>
        </div>

        {/* 🛒 Enhanced Tab Navigation */}
        <div style={{
          display: 'flex',
          marginBottom: '20px',
          borderBottom: '1px solid #e5e7eb',
          flexWrap: 'wrap',
          gap: '4px'
        }}>
          <button
            onClick={() => {
              setShowHistory(false);
              setShowPasswordRequest(false);
              setShowOrderHistory(false);
            }}
            style={{
              padding: '12px 16px',
              background: (!showHistory && !showOrderHistory) ? '#3b82f6' : 'transparent',
              color: (!showHistory && !showOrderHistory) ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              flex: '1',
              minWidth: '120px'
            }}
          >
            📝 แก้ไขข้อมูล
          </button>
          
          <button
            onClick={() => {
              setShowHistory(true);
              setShowPasswordRequest(false);
              setShowOrderHistory(false);
            }}
            style={{
              padding: '12px 16px',
              background: showHistory ? '#3b82f6' : 'transparent',
              color: showHistory ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: '1',
              minWidth: '120px'
            }}
          >
            📋 ประวัติคำขอ
            {passwordHistory.filter(req => req.status === 'pending').length > 0 && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {passwordHistory.filter(req => req.status === 'pending').length}
              </span>
            )}
          </button>

          {/* 🛒 Tab ประวัติการสั่งซื้อ */}
          <button
            onClick={() => {
              setShowHistory(false);
              setShowPasswordRequest(false);
              setShowOrderHistory(true);
            }}
            style={{
              padding: '12px 16px',
              background: showOrderHistory ? '#10b981' : 'transparent',
              color: showOrderHistory ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: '1',
              minWidth: '120px'
            }}
          >
            🛒 ประวัติการสั่งซื้อ
            {orderHistory.length > 0 && (
              <span style={{
                background: '#059669',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {orderHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.9rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.9rem'
          }}>
            {success}
          </div>
        )}

        {/* 🛒 Order History Tab */}
        {showOrderHistory ? (
          <div>
            <h4 style={{ margin: '0 0 20px', fontSize: '1.3rem', fontWeight: '700', color: '#374151' }}>
              🛒 ประวัติการสั่งซื้อ
            </h4>
            
            {orderLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #10b981',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                <p style={{ color: '#6b7280' }}>กำลังโหลดประวัติการสั่งซื้อ...</p>
              </div>
            ) : orderHistory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '16px',
                border: '2px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#374151' }}>
                  ยังไม่มีประวัติการสั่งซื้อ
                </h3>
                <p style={{ margin: 0, fontSize: '1rem' }}>
                  เมื่อคุณสั่งซื้อสินค้า ประวัติจะแสดงที่นี่
                </p>
              </div>
            ) : (
              <div>
                {/* 📊 สรุปสถิติ */}
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{orderHistory.length}</div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>คำสั่งซื้อทั้งหมด</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                        {orderHistory.filter(order => order.status === 'delivered').length}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>สำเร็จแล้ว</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                        {formatPrice(orderHistory.reduce((total, order) => {
                          return order.status !== 'cancelled' ? total + (order.pricing?.total || 0) : total;
                        }, 0))}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>ยอดซื้อสะสม</div>
                    </div>
                  </div>
                </div>

                {/* 📋 รายการออเดอร์ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orderHistory.map((order, index) => (
                    <div key={order._id || index} style={{
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '20px',
                      background: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                    >
                      {/* Order Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1f2937', marginBottom: '4px' }}>
                            📦 {order.orderNumber}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>
                            📅 {formatDate(order.orderDate || order.createdAt)}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                            📋 {order.items?.length || 0} รายการ
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          {getOrderStatusBadge(order.status)}
                          <div style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '700', 
                            color: '#1f2937',
                            marginTop: '8px'
                          }}>
                            {formatPrice(order.pricing?.total || 0)}
                          </div>
                          
                          {/* 💳 ปุ่มชำระเงิน */}
                          {order.paymentStatus === 'pending' && order.status !== 'cancelled' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // ป้องกันไม่ให้เปิด/ปิด details
                                handlePayment(order._id, order.orderNumber, order.pricing?.total || 0);
                              }}
                              disabled={loading}
                              style={{
                                marginTop: '8px',
                                marginRight: '8px',
                                padding: '6px 12px',
                                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                minWidth: '90px',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                if (!loading) {
                                  e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!loading) {
                                  e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = 'none';
                                }
                              }}
                            >
                              {loading ? '⏳' : '💳'} {loading ? 'กำลังประมวลผล...' : 'ชำระเงิน'}
                            </button>
                          )}
                          
                          {/* ✅ แสดงสถานะชำระเงินแล้ว */}
                          {order.paymentStatus === 'paid' && (
                            <div style={{
                              marginTop: '8px',
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              color: '#166534',
                              fontWeight: '600',
                              textAlign: 'center',
                              border: '1px solid #10b981'
                            }}>
                              ✅ ชำระเงินแล้ว
                            </div>
                          )}
                          
                          {/* 🚫 ปุ่มยกเลิกออเดอร์ */}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // ป้องกันไม่ให้เปิด/ปิด details
                                handleCancelOrder(order._id, order.orderNumber);
                              }}
                              disabled={loading}
                              style={{
                                marginTop: '8px',
                                padding: '6px 12px',
                                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                minWidth: '90px',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                if (!loading) {
                                  e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!loading) {
                                  e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = 'none';
                                }
                              }}
                            >
                              {loading ? '⏳' : '🚫'} {loading ? 'กำลังยกเลิก...' : 'ยกเลิกออเดอร์'}
                            </button>
                          )}
                          
                          {/* แสดงข้อความสำหรับออเดอร์ที่ไม่สามารถยกเลิกได้ */}
                          {(order.status === 'processing' || order.status === 'shipped') && (
                            <div style={{
                              marginTop: '8px',
                              padding: '6px 12px',
                              background: '#f3f4f6',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              fontWeight: '500',
                              textAlign: 'center'
                            }}>
                              ไม่สามารถยกเลิกได้
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div style={{
                        background: '#f8fafc',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ fontSize: '0.9rem', color: '#374151', fontWeight: '600', marginBottom: '8px' }}>
                          🛍️ รายการสินค้า:
                        </div>
                        {order.items && order.items.slice(0, 2).map((item, itemIndex) => (
                          <div key={itemIndex} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                            color: '#6b7280',
                            marginBottom: '4px'
                          }}>
                            <span>• {item.productName} x{item.quantity}</span>
                            <span>{formatPrice(item.subtotal || (item.price * item.quantity))}</span>
                          </div>
                        ))}
                        {order.items && order.items.length > 2 && (
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>
                            และอีก {order.items.length - 2} รายการ...
                          </div>
                        )}
                      </div>

                      {/* Expandable Details */}
                      {selectedOrder === order._id && (
                        <div style={{
                          borderTop: '1px solid #e5e7eb',
                          paddingTop: '16px',
                          animation: 'fadeIn 0.3s ease'
                        }}>
                          {/* Customer Info */}
                          <div style={{ marginBottom: '16px' }}>
                            <h5 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                              📍 ข้อมูลการจัดส่ง
                            </h5>
                            <div style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6 }}>
                              <div><strong>{order.customerInfo?.firstName} {order.customerInfo?.lastName}</strong></div>
                              <div>📧 {order.customerInfo?.email}</div>
                              <div>📞 {order.customerInfo?.phone}</div>
                              <div>🏠 {order.customerInfo?.address?.street}</div>
                              <div>📍 {order.customerInfo?.address?.district} {order.customerInfo?.address?.province} {order.customerInfo?.address?.postalCode}</div>
                            </div>
                          </div>

                          {/* All Items */}
                          <div>
                            <h5 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                              📦 รายการสินค้าทั้งหมด
                            </h5>
                            {order.items && order.items.map((item, itemIndex) => (
                              <div key={itemIndex} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: itemIndex < order.items.length - 1 ? '1px solid #f1f5f9' : 'none'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '600', color: '#374151' }}>
                                    {item.productName}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                    {formatPrice(item.price)} x {item.quantity}
                                  </div>
                                </div>
                                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                  {formatPrice(item.subtotal || (item.price * item.quantity))}
                                </div>
                              </div>
                            ))}

                            {/* Price Summary */}
                            <div style={{
                              marginTop: '16px',
                              padding: '12px',
                              background: '#f8fafc',
                              borderRadius: '8px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#6b7280' }}>ราคาสินค้า:</span>
                                <span style={{ fontWeight: '600' }}>{formatPrice(order.pricing?.subtotal || 0)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#6b7280' }}>ค่าจัดส่ง:</span>
                                <span style={{ fontWeight: '600', color: order.pricing?.shipping === 0 ? '#10b981' : '#1f2937' }}>
                                  {order.pricing?.shipping === 0 ? 'ฟรี' : formatPrice(order.pricing?.shipping || 0)}
                                </span>
                              </div>
                              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #d1d5db' }} />
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700' }}>
                                <span>รวมทั้งสิ้น:</span>
                                <span style={{ color: '#10b981' }}>{formatPrice(order.pricing?.total || 0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Tracking Info */}
                          {order.trackingNumber && (
                            <div style={{
                              marginTop: '16px',
                              padding: '12px',
                              background: '#e0f2fe',
                              borderRadius: '8px',
                              border: '1px solid #0891b2'
                            }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>
                                🚚 หมายเลขติดตาม
                              </div>
                              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0369a1' }}>
                                {order.trackingNumber}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expand/Collapse Indicator */}
                      <div style={{
                        textAlign: 'center',
                        marginTop: '12px',
                        color: '#6b7280',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {selectedOrder === order._id ? '👆 คลิกเพื่อซ่อนรายละเอียด' : '👇 คลิกเพื่อดูรายละเอียด'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : 
        
        /* 🆕 Password History Tab */
        showHistory ? (
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontWeight: '600', color: '#374151' }}>
              📋 ประวัติคำขอเปลี่ยนรหัสผ่าน
            </h4>
            
            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                <p style={{ color: '#6b7280' }}>กำลังโหลดประวัติ...</p>
              </div>
            ) : passwordHistory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  ยังไม่มีประวัติคำขอเปลี่ยนรหัสผ่าน
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {passwordHistory.map((request, index) => (
                  <div key={request.id || index} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px',
                    background: request.status === 'pending' ? '#fef3c7' : 
                               request.status === 'approved' ? '#dcfce7' : '#fee2e2'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
                          คำขอ #{request.id || index + 1}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>
                          📅 ส่งคำขอ: {formatDate(request.createdAt)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>
                          📝 เหตุผล: {request.reason}
                        </div>
                        
                        {/* แสดงข้อมูลเพิ่มเติมตามสถานะ */}
                        {request.status === 'approved' && request.approvedAt && (
                          <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '4px' }}>
                            ✅ อนุมัติเมื่อ: {formatDate(request.approvedAt)}
                          </div>
                        )}
                        
                        {request.status === 'rejected' && (
                          <>
                            {request.rejectedAt && (
                              <div style={{ fontSize: '0.85rem', color: '#dc2626', marginBottom: '4px' }}>
                                ❌ ปฏิเสธเมื่อ: {formatDate(request.rejectedAt)}
                              </div>
                            )}
                            {request.rejectionReason && (
                              <div style={{ fontSize: '0.85rem', color: '#dc2626', marginBottom: '4px' }}>
                                📝 เหตุผลที่ปฏิเสธ: {request.rejectionReason}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* ปุ่มส่งคำขอใหม่ */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => {
                  setShowHistory(false);
                  setShowPasswordRequest(true);
                }}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                📨 ส่งคำขอใหม่
              </button>
            </div>
          </div>
        ) : (
          /* Profile Form */
          !showPasswordRequest ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Username */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    ชื่อผู้ใช้:
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    placeholder="ชื่อผู้ใช้งาน"
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    อีเมล:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    placeholder="อีเมลของคุณ"
                  />
                </div>

                {/* First Name & Last Name */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      ชื่อ:
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      placeholder="ชื่อจริง"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      นามสกุล:
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      placeholder="นามสกุล"
                    />
                  </div>
                </div>

                {/* Password Change Notice */}
                <div style={{
                  background: '#fef3c7',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b'
                }}>
                  <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>
                    🔐 เปลี่ยนรหัสผ่าน
                  </p>
                  <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#6b7280' }}>
                    สำหรับการเปลี่ยนรหัสผ่าน กรุณาแจ้งขอต่อ Admin เพื่อความปลอดภัย
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPasswordRequest(true)}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📨 ส่งคำขอเปลี่ยนรหัสผ่าน
                  </button>
                </div>

                {/* Form Actions */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={onClose}
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
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '12px 20px',
                      background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    {loading ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Password Change Request Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#f0f8ff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #3b82f6'
              }}>
                <h4 style={{ margin: '0 0 8px', color: '#1e40af' }}>
                  📨 คำขอเปลี่ยนรหัสผ่าน
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                  กรุณาระบุเหตุผลในการเปลี่ยนรหัสผ่าน Admin จะตรวจสอบและดำเนินการให้
                </p>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  เหตุผลในการเปลี่ยนรหัสผ่าน:
                </label>
               <textarea
                  value={passwordRequestNote}
                  onChange={(e) => setPasswordRequestNote(e.target.value)}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="เช่น: ลืมรหัสผ่าน, ต้องการเปลี่ยนเพื่อความปลอดภัย, ฯลฯ"
                />
                
                {/* Red text below textarea */}
                <div style={{
                  marginTop: '6px',
                  fontSize: '0.9rem',
                  color: '#dc2626',
                  fontWeight: '600',
                  fontStyle: 'italic'
                }}>
                  (!!อย่าลืม โปรดระบุ "Password" ที่ต้องการเปลี่ยนด้วย (ห้ามต่ำกว่า 6 ตัวอักษร) เช่น "เปลี่ยนเป็น: newpassword123" หรือ "ต้องการเปลี่ยนรหัสผ่านเป็น: myNewPass456) 
                </div>
              </div>

              {/* Password Request Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordRequest(false)}
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
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handlePasswordRequest}
                  disabled={loading || !passwordRequestNote.trim()}
                  style={{
                    padding: '12px 20px',
                    background: loading || !passwordRequestNote.trim() ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading || !passwordRequestNote.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {loading ? '⏳ กำลังส่ง...' : '📨 ส่งคำขอ'}
                </button>
              </div>
            </div>
          )
        )}
        
        {/* 🆕 CSS Animation for Loading Spinner */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
              0% { opacity: 0; transform: translateY(-10px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default UserProfileModal;