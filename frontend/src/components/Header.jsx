// frontend/src/components/Header.jsx - Updated with Settings Button
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LogoutModal from './LogoutModal';


const Header = ({ onLoginClick, onAdminClick, onBackToHome, onProfileClick, onSettingsClick, currentView }) => {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const { totalItems, toggleCart, formatCurrency, totalAmount } = useCart();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    if (currentView === 'admin' || currentView === 'settings') {
      onBackToHome();
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleAdminClick = () => {
    if (isAdmin()) {
      onAdminClick();
    }
  };

  const handleProfileClick = () => {
    if (user && user.role === 'customer' && onProfileClick) {
      onProfileClick();
    }
  };

  // 🆕 Handle Settings Click - แก้ไขให้ทำงาน
  const handleSettingsClick = () => {
    console.log('🔧 Settings button clicked!'); // Debug log
    console.log('👤 User:', user);
    console.log('🔧 onSettingsClick function:', onSettingsClick);
    
    if (user && user.role === 'customer' && onSettingsClick) {
      console.log('✅ Opening Settings...');
      onSettingsClick();
    } else {
      console.log('❌ Cannot open Settings:', {
        hasUser: !!user,
        userRole: user?.role,
        hasSettingsFunction: !!onSettingsClick
      });
    }
  };

  const getDisplayName = () => {
    if (!user) return '';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.username) {
      return user.username;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

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
    <>
      <header className="header">
        <div className="container">
          <div className="header-layout">
            
            {/* TOP ROW: Logo + View Badge */}
            <div className="header-top">
              {/* Logo Section */}
              <div className="logo-section" onClick={onBackToHome}>
                <div className="logo-container">
                  <div className="logo-main">
                    <img 
                      src="/VipStoreLogo.png" 
                      alt="Vip Store Logo"
                      className="logo-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                    <span className="logo-fallback">🛍️</span>
                    <h1 className="logo-title">Vip Store Website</h1>
                  </div>
                  
                  <p className="logo-description">
                    📱 DEMO Version| เวอร์ชันมือถืออยู่ระหว่างการพัฒนา
                  </p>
                </div>
              </div>
              
              {/* View Badge */}
              {currentView === 'admin' && (
                <span className="view-badge admin-badge">
                  👨‍💼 Admin Panel
                </span>
              )}
              {currentView === 'settings' && (
                <span className="view-badge settings-badge">
                  ⚙️ Settings
                </span>
              )}
            </div>

            {/* BOTTOM ROW: Navigation */}
            <div className="header-bottom">
              
              {/* Left Side: Back/Cart Buttons */}
              <div className="header-left">
                {/* Back to Home Button (Admin/Settings view only) */}
                {(currentView === 'admin' || currentView === 'settings') && (
                  <button 
                    className="btn-secondary btn-back"
                    onClick={onBackToHome}
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
                    🛒 ({totalItems})
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
              </div>
              
              {/* Right Side: User Actions */}
              <div className="header-right">
                {isLoggedIn() ? (
                  <>
                    {/* User Info Card */}
                    <div className={`user-info ${isAdmin() ? 'admin' : 'customer'}`}>
                      <div className="user-avatar">
                        {/* 🆕 Show Profile Picture if available */}
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt="Profile"
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          isAdmin() ? '👨‍💼' : '🛍️'
                        )}
                      </div>
                      <div className="user-details">
                        <span className="user-name">
                          {getDisplayName()}
                        </span>
                        <span className="user-role">
                          {getRoleDisplay()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                      {/* Settings Button (Customer only, Home view only) */}
                      {user && user.role === 'customer' && currentView === 'home' && (
                        <button 
                          className="btn-primary btn-settings"
                          onClick={() => {
                            console.log('🔧 Settings button physical click!');
                            handleSettingsClick();
                          }}
                          title="การตั้งค่า"
                        >
                          <span className="btn-text">การตั้งค่า</span>
                          <span className="btn-icon">⚙️</span>
                        </button>
                      )}

                      {/* Profile Button (Customer only, Home view only) - ย้ายมาหลัง Settings */}
                      {/* {user && user.role === 'customer' && currentView === 'home' && (
                        <button 
                          className="btn-primary btn-profile"
                          onClick={handleProfileClick}
                          title="ข้อมูลผู้ใช้"
                        >
                          <span className="btn-text">ข้อมูลผู้ใช้</span>
                          <span className="btn-icon">👤</span>
                        </button>
                      )} */}

                      {/* Admin Panel Button (Admin only, Home view only) */}
                      {isAdmin() && currentView === 'home' && (
                        <button 
                          className="btn-primary btn-admin"
                          onClick={handleAdminClick}
                        >
                          ⚙️ จัดการ
                        </button>
                      )}

                      {/* Logout Button */}
                      <button 
                        className="btn-outline btn-logout"
                        onClick={handleLogout}
                      >
                        <span className="btn-text">ออกจากระบบ</span>
                        <span className="btn-icon">🚪</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Login Button */
                  <button 
                    className="btn-primary btn-login"
                    onClick={onLoginClick}
                  >
                    🔐 เข้าสู่ระบบ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced CSS with Settings Badge */}
        <style jsx>{`
          /* ===== MOBILE-FIRST HEADER LAYOUT ===== */
          .header-layout {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .header-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
          }

          /* ===== LOGO SECTION ===== */
          .logo-section {
            cursor: pointer;
            flex: 1;
          }

          .logo-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          .logo-main {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .logo-image {
            width: 24px;
            height: 24px;
            object-fit: contain;
            border-radius: 4px;
          }

          .logo-fallback {
            display: none;
            font-size: 1.2rem;
          }

          .logo-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #3b82f6;
            margin: 0;
            line-height: 1.2;
          }

          .logo-description {
            margin: 2px 0 0 0;
            font-size: 0.65rem;
            color: #666;
            font-weight: 400;
            font-style: italic;
            line-height: 1.1;
            display: block;
          }

          /* ===== VIEW BADGES ===== */
          .view-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 600;
            white-space: nowrap;
          }

          .admin-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .settings-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
          }

          /* ===== HEADER SECTIONS ===== */
          .header-left,
          .header-right {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .header-right {
            flex-wrap: wrap;
          }

          /* ===== USER INFO ===== */
          .user-info {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 12px;
            border: 1px solid;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }

          .user-info.admin {
            background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
            border-color: #667eea40;
          }

          .user-info.customer {
            background: linear-gradient(135deg, #10b98120 0%, #05966920 100%);
            border-color: #10b98140;
          }

          .user-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            color: white;
            overflow: hidden;
          }

          .user-info.admin .user-avatar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .user-info.customer .user-avatar {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }

          .user-details {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          .user-name {
            font-size: 0.8rem;
            font-weight: 700;
            color: #1f2937;
            line-height: 1.1;
            max-width: 180px; 
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .user-role {
            font-size: 0.65rem;
            color: #6b7280;
            font-weight: 500;
            line-height: 1.1;
          }

          /* ===== ACTION BUTTONS ===== */
          .action-buttons {
            display: flex;
            gap: 4px;
            align-items: center;
          }

          /* ===== BUTTON STYLES ===== */
          .btn-back {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
          }

          .btn-settings {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: none;
            display: flex;
            align-items: center;
            gap: 2px;
          }

          .btn-profile {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            border: none;
            display: flex;
            align-items: center;
            gap: 2px;
          }

          .btn-admin {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
          }

          .btn-logout {
            background: white;
            color: #dc3545;
            border: 1px solid #dc3545;
            transition: all 0.2s;
          }

          .btn-logout:hover {
            background: #dc3545;
            color: white;
          }

          .btn-login {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
          }

          /* ===== RESPONSIVE TEXT HANDLING ===== */
          .btn-text {
            display: none;
          }

          .btn-icon {
            display: inline;
            font-size: 1rem;
          }

          /* ===== TABLET+ RESPONSIVE (768px+) ===== */
          @media (min-width: 768px) {
            .header-layout {
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              gap: 0;
            }

            .header-top {
              display: contents;
            }

            .header-bottom {
              display: contents;
            }

            .header-left {
              order: 2;
            }

            .header-right {
              order: 3;
              gap: 12px;
            }

            .logo-section {
              order: 1;
              flex: unset;
            }

            .logo-description {
              font-size: 0.75rem;
            }

            .logo-image {
              width: 32px;
              height: 32px;
            }

            .logo-title {
              font-size: 1.5rem;
            }

            .view-badge {
              font-size: 0.8rem;
              padding: 5px 12px;
            }

            .user-info {
              padding: 8px 16px;
              gap: 10px;
            }

            .user-avatar {
              width: 32px;
              height: 32px;
              font-size: 1rem;
            }

            .user-name {
              font-size: 0.9rem;
              max-width: 180px;
              font-weight: 700;
            }

            .user-role {
              font-size: 0.7rem;
            }

            .btn-text {
              display: inline;
            }

            .btn-icon {
              display: none;
            }

            .action-buttons {
              gap: 8px;
            }
          }

          /* ===== LARGE DESKTOP (1024px+) ===== */
          @media (min-width: 1024px) {
            .header-right {
              gap: 15px;
            }

            .logo-title {
              font-size: 1.8rem;
            }

            .user-name {
              font-size: 0.95rem;
              max-width: 160px;
            }
          }

          /* ===== MOBILE RESPONSIVE ENHANCEMENTS ===== */
          @media (max-width: 768px) {
            .user-info {
              padding: 4px 8px;
              gap: 6px;
              max-width: 140px;
            }

            .user-avatar {
              width: 20px;
              height: 20px;
              font-size: 0.7rem;
            }

            .user-name {
              font-size: 0.75rem;
              max-width: 80px;
            }

            .user-role.mobile-hidden {
              display: none;
            }

            .action-buttons {
              gap: 4px;
            }

            .btn-settings,
            .btn-profile,
            .btn-admin,
            .btn-logout {
              padding: 6px 8px;
              font-size: 0.8rem;
              min-width: 36px;
              height: 32px;
            }

            .header-bottom {
              gap: 6px;
            }

            .header-right {
              gap: 6px;
              flex-wrap: nowrap;
            }
          }

          @media (max-width: 480px) {
            .user-info {
              padding: 3px 6px;
              gap: 4px;
              max-width: 120px;
            }

            .user-name {
              font-size: 0.7rem;
              max-width: 70px;
            }

            .btn-settings,
            .btn-profile,
            .btn-admin,
            .btn-logout {
              padding: 5px 6px;
              min-width: 32px;
              height: 28px;
            }

            .btn-icon {
              font-size: 0.9rem;
            }
          }
        `}</style>
      </header>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        user={user}
        roleDisplay={getRoleDisplay()}
      />
    </>
  );
};

export default Header;