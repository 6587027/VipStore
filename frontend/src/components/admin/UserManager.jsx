// frontend/src/components/admin/UserManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

import { 
  Users, UserCheck, UserCog, Shield, Mail, Calendar, 
  Search, RefreshCw, Plus, Eye, Edit, Trash2, Lock,
  X, Check, AlertTriangle, Clock, CheckCircle,
  User,Settings, 
  ChevronDown, 
  ChevronUp,
  Key,
} from 'lucide-react';



// ✅ Use Environment Variable or Fallback to Production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';
// console.log('🔗 UserManager API_BASE_URL:', API_BASE_URL);


const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
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
  // const [showPasswordModal, setShowPasswordModal] = useState(false);
  // const [passwordModalData, setPasswordModalData] = useState({
  //   requestId: null,
  //   userName: '',
  //   userEmail: '',
  //   reason: ''
  // });
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [passwordValidation, setPasswordValidation] = useState({
//     length: false,
//     lowercase: false,
//     uppercase: false,
//     number: false,
//     special: false
//   });

useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

// Password Validation Function
// const validatePassword = (password) => {
//   const validation = {
//     length: password.length >= 8,
//     lowercase: /[a-z]/.test(password),
//     uppercase: /[A-Z]/.test(password),
//     number: /[0-9]/.test(password),
//     special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
//   };
//   setPasswordValidation(validation);
//   return Object.values(validation).every(v => v);
// };

// Open Password Modal

// const openPasswordModal = (request) => {
//   setPasswordModalData({
//     requestId: request.id,
//     userName: request.userName,
//     userEmail: request.userEmail,
//     reason: request.reason
//   });
//   setNewPassword('');
//   setConfirmPassword('');
//   setShowNewPassword(false);
//   setShowConfirmPassword(false);
//   setPasswordValidation({
//     length: false,
//     lowercase: false,
//     uppercase: false,
//     number: false,
//     special: false
//   });
//   setShowPasswordModal(true);
// };


const [createAdminPasswordValidation, setCreateAdminPasswordValidation] = useState({
  length: false,
  lowercase: false,
  uppercase: false,
  number: false,
  special: false
});
const [showCreateAdminPassword, setShowCreateAdminPassword] = useState(false);

const validateCreateAdminPassword = (password) => {
  const validation = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  setCreateAdminPasswordValidation(validation);
  return Object.values(validation).every(v => v);
};


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


const approvePasswordRequest = async (request) => {
  const { id, userName } = request;

  if (!window.confirm(`คุณต้องการ "อนุมัติ" ให้ ${userName} ตั้งรหัสผ่านใหม่เองใช่หรือไม่?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/approve-password-request/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        // ❗️ ไม่ต้องส่ง newPassword 
        approvedBy: currentUser.id 
      })
    });

    const data = await response.json();
    if (data.success) {
      alert(data.message || '✅ อนุมัติคำขอเรียบร้อย');
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
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Shield size={14} />
        Administrator
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
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <UserCheck size={14} />
        Customer
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
  setCreateAdminPasswordValidation({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  });
  setShowCreateAdminPassword(false);
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
    <div style={{ padding: '0px' }}>
      {/* Header Section */}
      <div className="manager-header">
  <div>
    <h2>
      <Users size={28} className="section-icon" />
      User Management
    </h2>
    <p>Manage and monitor all system users</p>
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
        width: '60px',
        height: '60px',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
        transition: 'transform 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title="Password change requests"
    >
      <Lock size={28} />
    </button>
    {passwordRequests.filter(req => req.status === 'pending').length > 0 && (
      <span style={{
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        background: '#ef4444',
        color: 'white',
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
          {/* Total Users */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <Users size={32} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>
              {stats.totalUsers}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
              Total Users
            </div>
          </div>

          {/* Admin Users */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <Shield size={32} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>
              {stats.adminUsers}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
              Administrators
            </div>
          </div>

          {/* Customer Users */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <UserCheck size={32} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>
              {stats.customerUsers}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
              Customers
            </div>
          </div>

          {/* Recent Registrations */}
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <Clock size={32} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>
              {stats.recentRegistrations}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>
              New (24h)
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Role Filter */}
        <div className="filter-box">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
            style={{ paddingLeft: '16px' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="customer">Customers</option>
          </select>
        </div>

        {/* Results Info */}
        <div className="results-info">
          Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
        </div>

        {/* Action Buttons */}
        <button onClick={fetchUsers} className="btn-primary">
          <RefreshCw size={18} />
          Refresh
        </button>

        <button onClick={showCreateAdminModal} className="btn-primary">
          <Plus size={18} />
          Create Admin
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
            User ({filteredUsers.length} Total)
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
          <div style={{ 
                overflowX: 'auto',
                position: 'relative',
                zIndex: 1 
              }}>
                <table className="products-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Last Login</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id || user._id || index}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s',
                      position: 'relative',
                      zIndex: openDropdown === (user.id || user._id) ? 10 : 1
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
                    <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                      <div className="dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={() => {
                            const userId = user.id || user._id;
                            setOpenDropdown(openDropdown === userId ? null : userId);
                          }}
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
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                            whiteSpace: 'nowrap'
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
                          {openDropdown === (user.id || user._id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {openDropdown === (user.id || user._id) && (
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
                                showUserDetailsModal(user);
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
                              <Eye size={16} style={{ color: '#667eea' }} />
                              View Details
                            </button>

                            <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

                            {/* Edit User */}
                            <button
                              onClick={() => {
                                showEditUserModal(user);
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
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Edit size={16} style={{ color: '#f59e0b' }} />
                              Edit User
                            </button>

                            {/* Request Password Change */}
                            <button
                              onClick={() => {
                                requestPasswordChange(user.id || user._id, user.username);
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
                              onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Key size={16} style={{ color: '#8b5cf6' }} />
                              Change Password
                            </button>

                            <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

                            {canDeleteUser(user) && (
                              <button
                                onClick={() => {
                                  handleDeleteUser(user);
                                  setOpenDropdown(null);
                                }}
                                disabled={operationLoading}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  border: 'none',
                                  background: 'transparent',
                                  textAlign: 'left',
                                  cursor: operationLoading ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  color: '#ef4444',
                                  fontSize: '0.9rem',
                                  fontWeight: '500',
                                  transition: 'background 0.2s ease',
                                  opacity: operationLoading ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                  if (!operationLoading) {
                                    e.currentTarget.style.background = '#fef2f2';
                                  }
                                }}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <Trash2 size={16} />
                                Delete User
                              </button>
                            )}

                            {!canDeleteUser(user) && (
                              <div style={{
                                width: '100%',
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#9ca3af',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                fontStyle: 'italic'
                              }}>
                                <UserCog size={16} style={{ flexShrink: 0 }} />
                                <span style={{ whiteSpace: 'nowrap' }}>Cannot Delete (Current User)</span>
                              </div>
                            )}
                          </div>
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
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <UserCheck size={24} style={{ color: '#3b82f6' }} />
                User Details
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} style={{ color: '#3b82f6' }} />
                  <strong style={{ color: '#374151' }}>Username:</strong>
                  <div style={{ color: '#6b7280' }}>@{showUserDetails.username}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} style={{ color: '#3b82f6' }} />
                  <strong style={{ color: '#374151' }}>Email:</strong>
                  <div style={{ color: '#6b7280' }}>{showUserDetails.email}</div>
                </div>

                {showUserDetails.firstName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={16} style={{ color: '#3b82f6' }} />
                    <strong style={{ color: '#374151' }}>First Name:</strong>
                    <div style={{ color: '#6b7280' }}>{showUserDetails.firstName}</div>
                  </div>
                )}

                {showUserDetails.lastName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={16} style={{ color: '#3b82f6' }} />
                    <strong style={{ color: '#374151' }}>Last Name:</strong>
                    <div style={{ color: '#6b7280' }}>{showUserDetails.lastName}</div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} style={{ color: '#3b82f6' }} />
                  <strong style={{ color: '#374151' }}>Registration Date:</strong>
                  <div style={{ color: '#6b7280' }}>{formatDate(showUserDetails.createdAt)}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: '#3b82f6' }} />
                  <strong style={{ color: '#374151' }}>Last Login:</strong>
                  <div style={{ color: '#6b7280' }}>{formatDate(showUserDetails.lastLogin)}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <Shield size={16} style={{ color: '#3b82f6', marginTop: '4px' }} />
                  <div>
                    <strong style={{ color: '#374151' }}>User ID</strong>
                    <div style={{ 
                      color: '#6b7280', 
                      marginTop: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      background: '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {showUserDetails.id || showUserDetails._id || 'Not specified'}
                    </div>
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
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <UserCog size={24} style={{ color: '#8b5cf6' }} />
                Create New Admin Account
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
                    Username:
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
                    Email:
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
                      Name:
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
                      Last Name:
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
                    Password:
                  </label>
                  <div style={{ position: 'relative' }}>
                  <input
                    type={showCreateAdminPassword ? 'text' : 'password'}
                    value={createAdminForm.password}
                    onChange={(e) => {
                      setCreateAdminForm({...createAdminForm, password: e.target.value});
                      validateCreateAdminPassword(e.target.value);
                    }}
                    required
                    minLength="8"
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreateAdminPassword(!showCreateAdminPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showCreateAdminPassword ? <Eye size={20} /> : <Lock size={20} />}
                  </button>
                </div>
  

                {/* Password Requirements */}
                {createAdminForm.password && (
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#374151', fontSize: '0.85rem' }}>
                      Password Requirements:
                    </div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {[
                        { key: 'length', text: 'At least 8 characters' },
                        { key: 'lowercase', text: 'Lowercase letter (a-z)' },
                        { key: 'uppercase', text: 'Uppercase letter (A-Z)' },
                        { key: 'number', text: 'Number (0-9)' },
                        { key: 'special', text: 'Special character (!@#$...)' }
                      ].map(req => (
                        <div 
                          key={req.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            color: createAdminPasswordValidation[req.key] ? '#10b981' : '#6b7280'
                          }}
                        >
                          {createAdminPasswordValidation[req.key] ? <Check size={14} /> : <X size={14} />}
                          {req.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
                <div style={{
                  background: '#f0f8ff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #667eea',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} style={{ color: '#8b5cf6', marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                    Admin accounts will have full access to the Admin Panel
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
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>

                <button
                type="submit"
                disabled={operationLoading || (createAdminForm.password && !Object.values(createAdminPasswordValidation).every(v => v))}
                style={{
                  padding: '12px 20px',
                  background: operationLoading || (createAdminForm.password && !Object.values(createAdminPasswordValidation).every(v => v))
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: operationLoading || (createAdminForm.password && !Object.values(createAdminPasswordValidation).every(v => v)) 
                    ? 'not-allowed' 
                    : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                >
                  {operationLoading ? (
                    <>
                      <RefreshCw size={16} className="spinner" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserCog size={16} />
                      Create Admin
                    </>
                  )}
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
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#1e293b'
            }}>
              <Edit size={24} style={{ color: '#f59e0b' }} />
              Edit User Information
            </h3>
            <button
              onClick={() => setShowEditUser(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={24} style={{ color: '#6b7280' }} />
            </button>
          </div>

          <form onSubmit={handleUpdateUser}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Username */}
              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  <User size={16} style={{ color: '#3b82f6' }} />
                  Username
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
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter username"
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  <Mail size={16} style={{ color: '#3b82f6' }} />
                  Email Address
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
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter email address"
                />
              </div>

              {/* First Name & Last Name */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '8px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    <UserCheck size={16} style={{ color: '#3b82f6' }} />
                    First Name
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
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="First name"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '8px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    <UserCheck size={16} style={{ color: '#3b82f6' }} />
                    Last Name
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
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* User Role */}
              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  <Shield size={16} style={{ color: '#3b82f6' }} />
                  User Role
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
                    background: 'white',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Warning Message */}
              <div style={{
                background: '#fef3c7',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #f59e0b',
                display: 'flex',
                alignItems: 'start',
                gap: '8px'
              }}>
                <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350f', lineHeight: '1.5' }}>
                  Changes to user role will take effect immediately after saving.
                </p>
              </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setShowEditUser(null)}
              style={{
                padding: '12px 20px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem'
              }}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={operationLoading}
              style={{
                padding: '12px 20px',
                background: operationLoading 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: operationLoading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem'
              }}
            >
              {operationLoading ? (
                <>
                  <RefreshCw size={16} className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}
      
      {/* Password Requests Modal */}
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
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#1e293b'
              }}>
                <Lock size={24} style={{ color: '#f59e0b' }} />
                Password Change Requests
              </h3>
              <button
                onClick={() => setShowPasswordRequests(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={24} style={{ color: '#6b7280' }} />
              </button>
            </div>

            {/* Empty State */}
            {passwordRequests.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 40px', 
                color: '#6b7280' 
              }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Lock size={40} style={{ color: 'white' }} />
                </div>
                <h4 style={{ 
                  margin: '0 0 8px', 
                  fontSize: '1.2rem', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  No Password Requests
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  There are currently no pending password change requests.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {passwordRequests.map((request) => (
                  <div 
                    key={request.id} 
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      background: request.status === 'pending' 
                        ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' 
                        : '#f9fafb',
                      boxShadow: request.status === 'pending' 
                        ? '0 4px 6px rgba(245, 158, 11, 0.1)' 
                        : '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}>
                      {/* Request Details */}
                      <div style={{ flex: 1 }}>
                        {/* User Name */}
                        <div style={{ 
                          fontWeight: '600', 
                          marginBottom: '12px',
                          fontSize: '1.1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#1e293b'
                        }}>
                          <User size={18} style={{ color: '#3b82f6' }} />
                          {request.userName}
                        </div>

                        {/* Email */}
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#64748b', 
                          marginBottom: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Mail size={16} style={{ color: '#64748b' }} />
                          {request.userEmail}
                        </div>

                        {/* Reason */}
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#475569', 
                          marginBottom: '10px',
                          display: 'flex',
                          alignItems: 'start',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.5)',
                          padding: '8px 10px',
                          borderRadius: '6px'
                        }}>
                          <AlertTriangle size={16} style={{ 
                            color: '#f59e0b', 
                            flexShrink: 0,
                            marginTop: '2px'
                          }} />
                          <div>
                            <strong style={{ color: '#1e293b' }}>Reason:</strong>
                            <div style={{ marginTop: '4px' }}>{request.reason}</div>
                          </div>
                        </div>

                        {/* Date */}
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Calendar size={14} />
                          {formatDate(request.createdAt)}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {request.status === 'pending' && (
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px',
                          flexShrink: 0
                        }}>
                          {/* Approve Button */}
                          <button
                            onClick={() => {
                              // setShowPasswordRequests(false);
                              // openPasswordModal(request);
                              approvePasswordRequest(request);
                            }}
                            style={{
                              padding: '10px 18px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                            }}
                          >
                            <Check size={16} />
                            Approve
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={() => rejectPasswordRequest(request.id)}
                            style={{
                              padding: '10px 18px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
                            }}
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Status Badge for non-pending requests */}
                      {request.status !== 'pending' && (
                        <div style={{
                          padding: '8px 16px',
                          background: request.status === 'approved' 
                            ? '#d1fae5' 
                            : '#fee2e2',
                          color: request.status === 'approved' 
                            ? '#065f46' 
                            : '#991b1b',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {request.status === 'approved' ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {request.status}
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