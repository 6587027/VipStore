// src/components/UserProfileModal.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
    }
  }, [isOpen, currentUser]);

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

      // Update user data via API
      const response = await fetch(`http://localhost:3001/api/auth/users/${currentUser._id || currentUser.id}`, {
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
      
      // Send password change notification to admins
      const response = await fetch('http://localhost:3001/api/auth/password-change-request', {
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
        maxWidth: '500px',
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

        {/* Profile Form */}
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
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;