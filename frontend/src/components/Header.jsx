// frontend/src/components/Header.jsx - Updated with Profile Edit Button
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PasswordRequestDashboard from './user/PasswordRequestDashboard';

const Header = ({ onLoginClick, onAdminClick, onBackToHome, onProfileClick, currentView }) => {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const { totalItems, toggleCart, formatCurrency, totalAmount } = useCart();

  const handleLogout = () => {
    logout();
    // Return to home view after logout
    if (currentView === 'admin') {
      onBackToHome();
    }
  };

  const handleAdminClick = () => {
    if (isAdmin()) {
      onAdminClick();
    }
  };

  // 🆕 Handle profile edit click (Customer only)
  const handleProfileClick = () => {
    if (user && user.role === 'customer' && onProfileClick) {
      onProfileClick();
    }
  };

  // Helper function to get display name
  const getDisplayName = () => {
    if (!user) return '';
    
    // Priority: firstName + lastName > username > email
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.username) {
      return user.username;
    } else if (user.email) {
      return user.email.split('@')[0]; // Use email prefix
    }
    return 'User';
  };

  // Helper function to get user role display
  const getRoleDisplay = () => {
    if (!user || !user.role) return '';
    
    switch (user.role.toLowerCase()) {
      case 'admin':
        return 'ผู้ดูแลระบบ';
      case 'customer':
        return 'ลูกค้า';
      default:
        return user.role;
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         {/* Logo */}
<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
    <h1 
      style={{ 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: 0, // เอา default margin ออก
        lineHeight: '1.2'
      }}
      onClick={onBackToHome}
    >
      {/* VipStore Logo Image */}
      <img 
        src="/VipStoreLogo.png" 
        alt="Vip Store Logo"
        style={{
          width: '32px',
          height: '32px',
          objectFit: 'contain',
          borderRadius: '6px'
        }}
        onError={(e) => {
          // Fallback to emoji if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline';
        }}
      />
      {/* Fallback Emoji (hidden by default) */}
      <span style={{ display: 'none' }}>🛍️</span>
      Vip Store
    </h1>
    
    {/* 🆕 Project Description */}
    <p style={{
      margin: 0,
      fontSize: '0.75rem',
      color: '#666',
      fontWeight: '400',
      fontStyle: 'italic',
      lineHeight: '1.1',
      marginTop: '2px'
    }}>
      * จำลองระบบจัดการร้านค้า (DEMO)
    </p>
  </div>
  
  {/* View Indicator */}
  {currentView === 'admin' && (
    <span style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '5px 12px',
      borderRadius: '15px',
      fontSize: '0.8rem',
      fontWeight: '600'
    }}>
      👨‍💼 Admin Panel
    </span>
  )}
</div>
          
          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            
            {/* Back to Home Button (Admin view only) */}
            {currentView === 'admin' && (
              <button 
                className="btn-secondary"
                onClick={onBackToHome}
                style={{
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea'
                }}
              >
                🏠 Back to VipStore
              </button>
            )}

            {/* Cart Button (Home view only) */}
            {currentView === 'home' && (
              <button 
                className="btn-secondary cart-button"
                onClick={toggleCart}
                style={{ position: 'relative' }}
              >
                🛒 ตะกร้า ({totalItems})
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
                {totalAmount > 0 && (
                  <div className="cart-amount">
                    {formatCurrency(totalAmount)}
                  </div>
                )}
              </button>
            )}
            
            {/* User Status & Actions */}
            {isLoggedIn() ? (
              <>
                {/* User Info Card - Compact Size */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: isAdmin() ? 
                    'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)' : 
                    'linear-gradient(135deg, #10b98120 0%, #05966920 100%)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: isAdmin() ? 
                    '1px solid #667eea40' : 
                    '1px solid #10b98140',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                }}>
                  {/* User Avatar - Smaller */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isAdmin() ? 
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem'
                  }}>
                    {isAdmin() ? '👨‍💼' : '🛍️'}
                  </div>
                  
                  {/* User Details - Compact */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: '600',
                      color: '#333',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.1'
                    }}>
                      สวัสดี {getDisplayName()}
                    </span>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      color: '#666',
                      fontWeight: '500',
                      lineHeight: '1.1'
                    }}>
                      {getRoleDisplay()}
                    </span>
                  </div>
                </div>

                {/* 🆕 Profile Edit Button (Customer only, Home view only) */}
                {user && user.role === 'customer' && currentView === 'home' && (
                  <button 
                    className="btn-primary"
                    onClick={handleProfileClick}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="แก้ไขข้อมูลส่วนตัว"
                  >
                    ข้อมูลผู้ใช้
                    <span style={{ fontSize: '0.9rem' }}>👤</span>
                  </button>
                )}

                {/* Admin Panel Button (Admin only, Home view only) - Compact */}
                {isAdmin() && currentView === 'home' && (
                  <button 
                    className="btn-primary"
                    onClick={handleAdminClick}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.8rem'
                    }}
                  >
                    ⚙️ จัดการ
                  </button>
                )}

                {/* Logout Button - Compact */}
                <button 
                  className="btn-outline"
                  onClick={handleLogout}
                  style={{
                    background: 'white',
                    color: '#dc3545',
                    border: '1px solid #dc3545',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#dc3545';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#dc3545';
                  }}
                >
                  🚪 ออก
                </button>
              </>
            ) : (
              /* Login Button */
              <button 
                className="btn-primary"
                onClick={onLoginClick}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                🔐 เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;