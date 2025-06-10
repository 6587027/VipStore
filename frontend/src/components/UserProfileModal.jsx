// src/components/UserProfileModal.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
      
      // 🆕 โหลดประวัติคำขอเปลี่ยนรหัสผ่าน
      fetchPasswordHistory();
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
        maxWidth: '600px',
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
            👤 แก้ไขข้อมูลส่วนตัว
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

        {/* 🆕 Tab Navigation */}
        <div style={{
          display: 'flex',
          marginBottom: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => {
              setShowHistory(false);
              setShowPasswordRequest(false);
            }}
            style={{
              padding: '12px 20px',
              background: !showHistory ? '#3b82f6' : 'transparent',
              color: !showHistory ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            📝 แก้ไขข้อมูล
          </button>
          <button
            onClick={() => {
              setShowHistory(true);
              setShowPasswordRequest(false);
            }}
            style={{
              padding: '12px 20px',
              background: showHistory ? '#3b82f6' : 'transparent',
              color: showHistory ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {passwordHistory.filter(req => req.status === 'pending').length}
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

        {/* 🆕 Password History Tab */}
        {showHistory ? (
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
          `}
        </style>
      </div>
    </div>
  );
};

export default UserProfileModal;