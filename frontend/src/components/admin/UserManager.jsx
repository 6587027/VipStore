// frontend/src/components/admin/UserManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';


// ✅ Use Environment Variable or Fallback to Production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';

console.log('🔗 UserManager API_BASE_URL:', API_BASE_URL);


const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [showPasswordRequests, setShowPasswordRequests] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [createAdminForm, setCreateAdminForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [editUserForm, setEditUserForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'customer'
  });
  const [operationLoading, setOperationLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    customerUsers: 0,
    recentRegistrations: 0
  });

  const { user: currentUser } = useAuth();

  // 🔧 เพิ่มฟังก์ชันนี้
const canDeleteUser = (user) => {
  if (!currentUser) {
    console.log('🔍 No currentUser, allowing delete');
    return true;
  }

  const userId = user.id || user._id;
  const currentUserId = currentUser.id || currentUser._id || currentUser.userId;
  
  console.log('🔍 Delete check:', {
    userId,
    currentUserId,
    userName: user.username,
    canDelete: userId !== currentUserId
  });

  return userId !== currentUserId;
};

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchPasswordRequests();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      setError('Error connecting to server');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  // เพิ่มหลัง fetchStats function
const fetchPasswordRequests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/password-requests`);
    const data = await response.json();
    if (data.success) {
      setPasswordRequests(data.requests || []);
    }
  } catch (error) {
    console.error('Error fetching password requests:', error);
  }
};
// เพิ่มหลัง fetchPasswordRequests function
const requestPasswordChange = async (userId, username) => {
  const reason = prompt(`เหตุผลในการขอเปลี่ยนรหัสผ่านสำหรับ ${username}:`);
  if (!reason) return;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/request-password-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        requestedBy: currentUser.id,
        reason
      })
    });

    const data = await response.json();
    if (data.success) {
      alert('✅ ส่งคำขอเปลี่ยนรหัสผ่านเรียบร้อย');
      fetchPasswordRequests();
    } else {
      alert('❌ เกิดข้อผิดพลาด: ' + data.message);
    }
  } catch (error) {
    alert('❌ เกิดข้อผิดพลาดในการส่งคำขอ');
  }
};

const approvePasswordRequest = async (requestId) => {
  const newPass = prompt('ใส่รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร):');
  if (!newPass || newPass.length < 6) {
    alert('❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/approve-password-request/${requestId}`, {

      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        newPassword: newPass,
        approvedBy: currentUser.id 
      })
    });

    const data = await response.json();
    if (data.success) {
      alert('✅ อนุมัติและเปลี่ยนรหัสผ่านเรียบร้อย');
      fetchPasswordRequests();
    } else {
      alert('❌ เกิดข้อผิดพลาด: ' + data.message);
    }
  } catch (error) {
    alert('❌ เกิดข้อผิดพลาดในการอนุมัติ');
  }
};

const rejectPasswordRequest = async (requestId) => {
  const reason = prompt('เหตุผลในการปฏิเสธ:');
  if (!reason) return;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/reject-password-request/${requestId}`, {

      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        rejectionReason: reason,
        rejectedBy: currentUser.id 
      })
    });

    const data = await response.json();
    if (data.success) {
      alert('✅ ปฏิเสธคำขอเรียบร้อย');
      fetchPasswordRequests();
    } else {
      alert('❌ เกิดข้อผิดพลาด: ' + data.message);
    }
  } catch (error) {
    alert('❌ เกิดข้อผิดพลาดในการปฏิเสธ');
  }
};


  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Format date
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

  // Get role badge
  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          👨‍💼 ผู้ดูแลระบบ
        </span>
      );
    } else {
      return (
        <span style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          🛍️ ลูกค้า
        </span>
      );
    }
  };

  // Show user details modal
  const showUserDetailsModal = (user) => {
    setShowUserDetails(user);
  };

  // Show create admin modal
  const showCreateAdminModal = () => {
    setCreateAdminForm({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: ''
    });
    setShowCreateAdmin(true);
  };

  // Show edit user modal
  const showEditUserModal = (user) => {
    setEditUserForm({
      id: user.id || user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role
    });
    setShowEditUser(user);
  };

  // Create new admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError('');

    try {
      // 🆕 ใช้ endpoint ใหม่สำหรับสร้าง admin
      const response = await fetch(`${API_BASE_URL}/auth/create-admin`, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createAdminForm),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Admin created successfully:', data.user);
        setShowCreateAdmin(false);
        fetchUsers(); // Refresh user list
        fetchStats(); // Refresh stats
        
        // Reset form
        setCreateAdminForm({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: ''
        });
      } else {
        setError(data.message || 'Failed to create admin');
      }
    } catch (error) {
      setError('Error creating admin');
      console.error('Create admin error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  // Update user information
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError('');

    try {
      // 🆕 ใช้ PUT endpoint สำหรับ update user
      const response = await fetch(`${API_BASE_URL}/auth/users/${editUserForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editUserForm.username,
          email: editUserForm.email,
          firstName: editUserForm.firstName,
          lastName: editUserForm.lastName,
          role: editUserForm.role
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ User updated successfully:', data.user);
        setShowEditUser(null);
        fetchUsers(); // Refresh user list
        fetchStats(); // Refresh stats
        
        // Reset form
        setEditUserForm({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          role: 'customer'
        });
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (error) {
      setError('Error updating user');
      console.error('Update user error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  // 🔧 Enhanced Delete user function with better error handling
const handleDeleteUser = async (user) => {
  const userId = user.id || user._id;
  const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId;
  
  // Double check to prevent self-deletion
  if (userId === currentUserId) {
    alert('❌ ไม่สามารถลบบัญชีตัวเองได้');
    return;
  }

  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username;

  const confirmMessage = `⚠️ ต้องการลบผู้ใช้ "${userName}" ใช่หรือไม่?\n\n` +
                        `📧 อีเมล: ${user.email}\n` +
                        `👤 ชื่อผู้ใช้: ${user.username}\n` +
                        `🔰 สิทธิ์: ${user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}\n\n` +
                        `⚠️ การลบจะไม่สามารถยกเลิกได้!`;

  if (!window.confirm(confirmMessage)) {
    return;
  }

  setOperationLoading(true);
  setError('');
  
  try {
    console.log('🗑️ Deleting user:', { userId, userName });
    
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ User deleted successfully:', data.deletedUser);
      alert(`✅ ลบผู้ใช้ "${userName}" เรียบร้อยแล้ว`);
      fetchUsers(); // Refresh user list
      fetchStats(); // Refresh stats
    } else {
      console.error('❌ Delete failed:', data.message);
      alert(`❌ ไม่สามารถลบผู้ใช้ได้: ${data.message}`);
    }
  } catch (error) {
    console.error('❌ Delete user error:', error);
    alert('❌ เกิดข้อผิดพลาดในการลบผู้ใช้ กรุณาลองใหม่อีกครั้ง');
  } finally {
    setOperationLoading(false);
  }
};

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
        <p style={{ color: '#666', fontSize: '1.1rem' }}>กำลังโหลดข้อมูลผู้ใช้...</p>
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
<div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div>
    <h2 style={{ 
      fontSize: '1.8rem', 
      fontWeight: '700', 
      color: '#333',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      👥 จัดการผู้ใช้งาน
    </h2>
    <p style={{ color: '#666', fontSize: '1rem' }}>
      จัดการและติดตามผู้ใช้งานในระบบ
    </p>
  </div>
  
  {/* 🆕 Notification Bell */}
  <div style={{ position: 'relative' }}>
    <button
      onClick={() => setShowPasswordRequests(true)}
      style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        fontSize: '1.5rem',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}
    >
      🔔
    </button>
    {passwordRequests.filter(req => req.status === 'pending').length > 0 && (
      <span style={{
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        background: '#ef4444',
        color: 'white',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600'
      }}>
        {passwordRequests.filter(req => req.status === 'pending').length}
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
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {stats.totalUsers}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
            ผู้ใช้ทั้งหมด
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {stats.adminUsers}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
            ผู้ดูแลระบบ
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {stats.customerUsers}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
            ลูกค้า
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {stats.recentRegistrations}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
            สมัครใหม่ (24 ชม.)
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
            placeholder="🔍 ค้นหาผู้ใช้ (ชื่อ, อีเมล, ชื่อผู้ใช้)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">ทุกสิทธิ์</option>
          <option value="admin">ผู้ดูแลระบบ</option>
          <option value="customer">ลูกค้า</option>
        </select>

        {/* Refresh Button */}
        <button
          onClick={fetchUsers}
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
          🔄 รีเฟรช
        </button>

        {/* Create Admin Button */}
        <button
          onClick={showCreateAdminModal}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          👨‍💼 สร้าง Admin
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

      {/* Users Table */}
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
            รายชื่อผู้ใช้ ({filteredUsers.length} คน)
          </h3>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>
              {searchTerm || filterRole !== 'all' 
                ? 'ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา' 
                : 'ยังไม่มีผู้ใช้ในระบบ'
              }
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>ผู้ใช้</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>อีเมล</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>สิทธิ์</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>วันที่สมัคร</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>เข้าสู่ระบบล่าสุด</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id || user._id || index}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: user.role === 'admin' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}>
                          {user.role === 'admin' ? '👨‍💼' : '🛍️'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#374151' }}>
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.username
                            }
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#374151' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {getRoleBadge(user.role)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                      {formatDate(user.lastLogin)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => showUserDetailsModal(user)}
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
                        
                        <button
                          onClick={() => showEditUserModal(user)}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ แก้ไข
                        </button>               
                              <button
                                onClick={() => requestPasswordChange(user.id || user._id, user.username)}
                                style={{
                                  padding: '6px 10px',
                                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                🔐 รหัส
                              </button>

                                                      {/* 🔥 ปุ่มลบ - แก้ไขเงื่อนไขให้แสดงผลเสมอ ยกเว้นตัวเอง */}
                              {canDeleteUser(user) && (
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={operationLoading}
                                  style={{
                                    padding: '6px 12px',
                                    background: operationLoading 
                                      ? '#9ca3af' 
                                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: operationLoading ? 'not-allowed' : 'pointer',
                                    minWidth: '60px',
                                    opacity: operationLoading ? 0.6 : 1
                                  }}
                                  title={`ลบผู้ใช้ ${user.username}`}
                                >
                                  🗑️ ลบ
                                </button>
                              )}

                              {/* 🔒 แสดงข้อความถ้าไม่สามารถลบได้ (ตัวเอง) */}
                              {!canDeleteUser(user) && (
                                <span 
                                  style={{
                                    padding: '6px 12px',
                                    background: '#e5e7eb',
                                    color: '#6b7280',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    minWidth: '60px',
                                    textAlign: 'center'
                                  }}
                                  title="ไม่สามารถลบตัวเองได้"
                                >
                                  🔒 ตัวเอง
                                </span>
                              )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && (
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
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                รายละเอียดผู้ใช้
              </h3>
              <button
                onClick={() => setShowUserDetails(null)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* User Avatar and Name */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: showUserDetails.role === 'admin' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 12px'
                }}>
                  {showUserDetails.role === 'admin' ? '👨‍💼' : '🛍️'}
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: '600' }}>
                  {showUserDetails.firstName && showUserDetails.lastName 
                    ? `${showUserDetails.firstName} ${showUserDetails.lastName}`
                    : showUserDetails.username
                  }
                </h4>
                {getRoleBadge(showUserDetails.role)}
              </div>

              {/* User Information */}
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <strong style={{ color: '#374151' }}>ชื่อผู้ใช้:</strong>
                  <div style={{ color: '#6b7280', marginTop: '4px' }}>@{showUserDetails.username}</div>
                </div>
                
                <div>
                  <strong style={{ color: '#374151' }}>อีเมล:</strong>
                  <div style={{ color: '#6b7280', marginTop: '4px' }}>{showUserDetails.email}</div>
                </div>

                {showUserDetails.firstName && (
                  <div>
                    <strong style={{ color: '#374151' }}>ชื่อ:</strong>
                    <div style={{ color: '#6b7280', marginTop: '4px' }}>{showUserDetails.firstName}</div>
                  </div>
                )}

                {showUserDetails.lastName && (
                  <div>
                    <strong style={{ color: '#374151' }}>นามสกุล:</strong>
                    <div style={{ color: '#6b7280', marginTop: '4px' }}>{showUserDetails.lastName}</div>
                  </div>
                )}

                <div>
                  <strong style={{ color: '#374151' }}>วันที่สมัครสมาชิก:</strong>
                  <div style={{ color: '#6b7280', marginTop: '4px' }}>{formatDate(showUserDetails.createdAt)}</div>
                </div>

                <div>
                  <strong style={{ color: '#374151' }}>เข้าสู่ระบบล่าสุด:</strong>
                  <div style={{ color: '#6b7280', marginTop: '4px' }}>{formatDate(showUserDetails.lastLogin)}</div>
                </div>

                <div>
                  <strong style={{ color: '#374151' }}>ID ผู้ใช้:</strong>
                  <div style={{ 
                    color: '#6b7280', 
                    marginTop: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    background: '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {showUserDetails.id || showUserDetails._id || 'ไม่ระบุ'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdmin && (
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
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                👨‍💼 สร้างบัญชี Admin ใหม่
              </h3>
              <button
                onClick={() => setShowCreateAdmin(false)}
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

            <form onSubmit={handleCreateAdmin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    ชื่อผู้ใช้:
                  </label>
                  <input
                    type="text"
                    value={createAdminForm.username}
                    onChange={(e) => setCreateAdminForm({...createAdminForm, username: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="ใส่ชื่อผู้ใช้"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    อีเมล:
                  </label>
                  <input
                    type="email"
                    value={createAdminForm.email}
                    onChange={(e) => setCreateAdminForm({...createAdminForm, email: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="ใส่อีเมล"
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      ชื่อ:
                    </label>
                    <input
                      type="text"
                      value={createAdminForm.firstName}
                      onChange={(e) => setCreateAdminForm({...createAdminForm, firstName: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                      placeholder="ชื่อจริง"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      นามสกุล:
                    </label>
                    <input
                      type="text"
                      value={createAdminForm.lastName}
                      onChange={(e) => setCreateAdminForm({...createAdminForm, lastName: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                      placeholder="นามสกุล"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    รหัสผ่าน:
                  </label>
                  <input
                    type="password"
                    value={createAdminForm.password}
                    onChange={(e) => setCreateAdminForm({...createAdminForm, password: e.target.value})}
                    required
                    minLength="6"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  />
                </div>

                <div style={{
                  background: '#f0f8ff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #667eea'
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                    ℹ️ บัญชี Admin ที่สร้างจะมีสิทธิ์เข้าถึง Admin Panel ทั้งหมด
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateAdmin(false)}
                    style={{
                      padding: '12px 20px',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={operationLoading}
                    style={{
                      padding: '12px 20px',
                      background: operationLoading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: operationLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {operationLoading ? '⏳ กำลังสร้าง...' : '👨‍💼 สร้าง Admin'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
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
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                ✏️ แก้ไขข้อมูลผู้ใช้
              </h3>
              <button
                onClick={() => setShowEditUser(null)}
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

            <form onSubmit={handleUpdateUser}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    ชื่อผู้ใช้:
                  </label>
                  <input
                    type="text"
                    value={editUserForm.username}
                    onChange={(e) => setEditUserForm({...editUserForm, username: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    อีเมล:
                  </label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      ชื่อ:
                    </label>
                    <input
                      type="text"
                      value={editUserForm.firstName}
                      onChange={(e) => setEditUserForm({...editUserForm, firstName: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      นามสกุล:
                    </label>
                    <input
                      type="text"
                      value={editUserForm.lastName}
                      onChange={(e) => setEditUserForm({...editUserForm, lastName: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    สิทธิ์ผู้ใช้:
                  </label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'white'
                    }}
                  >
                    <option value="customer">🛍️ ลูกค้า</option>
                    <option value="admin">👨‍💼 ผู้ดูแลระบบ</option>
                  </select>
                </div>

                <div style={{
                  background: '#fef3c7',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b'
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                    ⚠️ การเปลี่ยนสิทธิ์ผู้ใช้จะมีผลทันทีหลังการบันทึก
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditUser(null)}
                    style={{
                      padding: '12px 20px',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={operationLoading}
                    style={{
                      padding: '12px 20px',
                      background: operationLoading ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: operationLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {operationLoading ? '⏳ กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🆕 Password Requests Modal */}
      {showPasswordRequests && (
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
            maxWidth: '800px',
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
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                🔐 คำขอเปลี่ยนรหัสผ่าน
              </h3>
              <button
                onClick={() => setShowPasswordRequests(false)}
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

            {passwordRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔐</div>
                <p>ไม่มีคำขอเปลี่ยนรหัสผ่าน</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {passwordRequests.map((request) => (
                  <div key={request.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px',
                    background: request.status === 'pending' ? '#fef3c7' : '#f3f4f6'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                          👤 {request.userName}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>
                          📧 {request.userEmail}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>
                          📝 เหตุผล: {request.reason}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          📅 {formatDate(request.createdAt)}
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => approvePasswordRequest(request.id)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            ✅ อนุมัติ
                          </button>
                          <button
                            onClick={() => rejectPasswordRequest(request.id)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            ❌ ปฏิเสธ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;