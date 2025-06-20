// frontend/src/components/settings/ProfileSettings.jsx
// Enhanced from UserProfileModal with Settings Interface
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';

// ✅ Use Environment Variable or Fallback to Production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';

const ProfileSettings = ({ onBack }) => {
  const { user: currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // profile, history, orders
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
  
  // 🆕 Password History State
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 🛒 Order History State
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Initialize form data when component mounts
  useEffect(() => {
    if (currentUser) {
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
      
      // Load data for all tabs
      fetchPasswordHistory();
      fetchOrderHistory();
    }
  }, [currentUser]);

  // 🆕 Load Password History
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

  // 🛒 Load Order History
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
      // Validation
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
          role: currentUser.role
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ อัปเดตข้อมูลสำเร็จ!');
        
        if (updateUser) {
          updateUser(data.user);
        }

        setTimeout(() => {
          setSuccess('');
        }, 3000);

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

  // Helper functions
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  // Render Tab Navigation
  const renderTabNavigation = () => (
    <div style={{
      display: 'flex',
      marginBottom: '24px',
      borderBottom: '2px solid #e5e7eb',
      flexWrap: 'wrap',
      gap: '4px'
    }}>
      <button
        onClick={() => setActiveTab('profile')}
        style={{
          padding: '12px 20px',
          background: activeTab === 'profile' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
          color: activeTab === 'profile' ? 'white' : '#6b7280',
          border: 'none',
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.9rem',
          flex: '1',
          minWidth: '120px',
          transition: 'all 0.2s ease'
        }}
      >
        📝 แก้ไขข้อมูล
      </button>
      
      <button
        onClick={() => setActiveTab('history')}
        style={{
          padding: '12px 20px',
          background: activeTab === 'history' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
          color: activeTab === 'history' ? 'white' : '#6b7280',
          border: 'none',
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flex: '1',
          minWidth: '120px',
          transition: 'all 0.2s ease'
        }}
      >
        📋 ประวัติคำขอ
        {passwordHistory.filter(req => req.status === 'pending').length > 0 && (
          <span style={{
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
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

      <button
        onClick={() => setActiveTab('orders')}
        style={{
          padding: '12px 20px',
          background: activeTab === 'orders' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
          color: activeTab === 'orders' ? 'white' : '#6b7280',
          border: 'none',
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flex: '1',
          minWidth: '140px',
          transition: 'all 0.2s ease'
        }}
      >
        🛒 ประวัติการสั่งซื้อ
        {orderHistory.length > 0 && (
          <span style={{
            background: '#059669',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
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
  );

  // Render Profile Form Tab
  const renderProfileForm = () => (
    <div>
      {!showPasswordRequest ? (
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

            {/* Password Change Section */}
            <div style={{
              background: '#fef3c7',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #f59e0b'
            }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#374151', fontWeight: '600' }}>
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
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📨 ส่งคำขอเปลี่ยนรหัสผ่าน
              </button>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={onBack}
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
                ← กลับ
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
      )}
    </div>
  );

  // Render Password History Tab
  const renderPasswordHistory = () => (
    <div>
      <h4 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: '600', color: '#374151' }}>
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
          padding: '60px 20px',
          color: '#6b7280',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '16px',
          border: '2px dashed #cbd5e1'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#374151' }}>
            ยังไม่มีประวัติคำขอเปลี่ยนรหัสผ่าน
          </h3>
          <p style={{ margin: 0, fontSize: '1rem' }}>
            เมื่อคุณส่งคำขอเปลี่ยนรหัสผ่าน ประวัติจะแสดงที่นี่
            </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {passwordHistory.map((request, index) => (
            <div key={index} style={{
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <h5 style={{ 
                    margin: '0 0 4px', 
                    fontSize: '1.1rem', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    คำขอ #{index + 1}
                  </h5>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.9rem', 
                    color: '#6b7280' 
                  }}>
                    📅 {formatDate(request.requestDate)}
                  </p>
                </div>
                <div>{getStatusBadge(request.status)}</div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <p style={{ 
                  margin: '0 0 8px', 
                  fontSize: '0.95rem', 
                  fontWeight: '600', 
                  color: '#374151' 
                }}>
                  เหตุผล:
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem', 
                  color: '#6b7280',
                  background: '#f9fafb',
                  padding: '10px',
                  borderRadius: '8px',
                  fontStyle: 'italic'
                }}>
                  "{request.reason}"
                </p>
              </div>

              {request.adminNote && (
                <div style={{
                  background: request.status === 'approved' ? '#dcfce7' : '#fee2e2',
                  padding: '12px',
                  borderRadius: '8px',
                  marginTop: '8px'
                }}>
                  <p style={{ 
                    margin: '0 0 4px', 
                    fontSize: '0.9rem', 
                    fontWeight: '600',
                    color: request.status === 'approved' ? '#166534' : '#dc2626'
                  }}>
                    💬 หมายเหตุจาก Admin:
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.85rem', 
                    color: request.status === 'approved' ? '#166534' : '#dc2626'
                  }}>
                    {request.adminNote}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render Order History Tab
  const renderOrderHistory = () => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#374151' }}>
          🛒 ประวัติการสั่งซื้อ
        </h4>
        <button
          onClick={fetchOrderHistory}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          🔄 รีเฟรช
        </button>
      </div>

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
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderRadius: '16px',
          border: '2px dashed #0ea5e9'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#374151' }}>
            ยังไม่มีประวัติการสั่งซื้อ
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '1rem' }}>
            เมื่อคุณสั่งซื้อสินค้า ประวัติจะแสดงที่นี่
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            🛍️ เริ่มช้อปปิ้ง
          </button>
        </div>
      ) : (
        <div>
          {/* Order Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📦</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {orderHistory.length}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                ออเดอร์ทั้งหมด
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💰</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                {formatPrice(orderHistory.reduce((total, order) => total + (order.totalAmount || 0), 0))}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                ยอดรวมทั้งหมด
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {orderHistory.filter(order => order.status === 'pending').length}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                รอดำเนินการ
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orderHistory.map((order) => (
              <div key={order._id} style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}>
                
                {/* Order Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ 
                      margin: '0 0 4px', 
                      fontSize: '1.1rem', 
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      📋 {order.orderNumber || `ORD-${order._id.slice(-6).toUpperCase()}`}
                    </h5>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      color: '#6b7280' 
                    }}>
                      📅 {formatDate(order.orderDate || order.createdAt)}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}>
                    {getOrderStatusBadge(order.status)}
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#059669'
                    }}>
                      {formatPrice(order.totalAmount)}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: selectedOrder === order._id ? '16px' : '0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', color: '#6b7280' }}>📦</span>
                    <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                      {order.items?.length || 0} รายการ
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {selectedOrder === order._id ? '▲ ซ่อนรายละเอียด' : '▼ ดูรายละเอียด'}
                  </span>
                </div>

                {/* Order Details - Expandable */}
                {selectedOrder === order._id && (
                  <div style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {/* Customer Info */}
                    <div style={{ marginBottom: '16px' }}>
                      <h6 style={{ 
                        margin: '0 0 8px', 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        👤 ข้อมูลการจัดส่ง
                      </h6>
                      <div style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.4' }}>
                        <p style={{ margin: '2px 0' }}>
                          <strong>ชื่อ:</strong> {order.customerName}
                        </p>
                        <p style={{ margin: '2px 0' }}>
                          <strong>อีเมล:</strong> {order.customerEmail}
                        </p>
                        <p style={{ margin: '2px 0' }}>
                          <strong>เบอร์โทร:</strong> {order.customerPhone}
                        </p>
                        {order.shippingAddress && (
                          <p style={{ margin: '2px 0' }}>
                            <strong>ที่อยู่:</strong> {order.shippingAddress.address}, 
                            {order.shippingAddress.district}, {order.shippingAddress.province} 
                            {order.shippingAddress.postalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div>
                      <h6 style={{ 
                        margin: '0 0 12px', 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        🛍️ รายการสินค้า
                      </h6>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {order.items?.map((item, itemIndex) => (
                          <div key={itemIndex} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ 
                                fontSize: '0.9rem', 
                                fontWeight: '600', 
                                color: '#374151' 
                              }}>
                                {item.name}
                              </span>
                              <div style={{ 
                                fontSize: '0.8rem', 
                                color: '#6b7280',
                                marginTop: '2px'
                              }}>
                                จำนวน: {item.quantity} ชิ้น × {formatPrice(item.price)}
                              </div>
                            </div>
                            <div style={{
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: '#059669'
                            }}>
                              {formatPrice(item.quantity * item.price)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '8px',
                        color: 'white'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                            💰 ยอดรวมทั้งสิ้น
                          </span>
                          <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Main Render
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 0'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        minHeight: '80vh'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px 30px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            margin: '0 0 8px', 
            fontSize: '1.8rem', 
            fontWeight: '700' 
          }}>
            ⚙️ การตั้งค่าบัญชี
          </h2>
          <p style={{ 
            margin: 0, 
            opacity: 0.9, 
            fontSize: '1rem' 
          }}>
            จัดการข้อมูลส่วนตัวและความปลอดภัยของคุณ
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          
          {/* Alert Messages */}
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ❌ {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✅ {success}
            </div>
          )}

          {/* Tab Navigation */}
          {renderTabNavigation()}

          {/* Tab Content */}
          {activeTab === 'profile' && renderProfileForm()}
          {activeTab === 'history' && renderPasswordHistory()}
          {activeTab === 'orders' && renderOrderHistory()}
        </div>
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .profile-settings-container {
              margin: 10px;
              border-radius: 12px;
            }
            
            .profile-settings-content {
              padding: 20px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ProfileSettings;