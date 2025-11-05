// frontend/src/components/Header.jsx
import React, { useState , useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LogoutModal from './LogoutModal';

import clsx from 'clsx';

import { 
  Store, 
  Smartphone, 
  UserCheck, 
  Settings, 
  Home, 
  ShoppingCart, 
  LogOut, 
  Package,
  User,
  Shield
} from 'lucide-react';


const Header = ({ 
  onLoginClick, 
  onAdminClick, 
  onBackToHome, 
  onProfileClick, 
  onSettingsClick, 
  currentView,
  showProductBackButton = false,
  onProductBack = null,
  productName = ''
}) => {

  // Enable Settings Button
  const ENABLE_SETTINGS_BUTTON = true;

  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const { totalItems, toggleCart, formatCurrency, totalAmount } = useCart();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const theme = useMemo(() => {
  if (!user) return 'customer';
  return user.role === 'admin' ? 'admin' : 'customer';
  }, [user]);

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

  // Handle Settings Click
  const handleSettingsClick = () => {
    console.log('🔧 Settings button clicked!');
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

  // ✨ เพิ่มฟังก์ชันใหม่: Handle Product Back Click
  const handleProductBackClick = () => {
    console.log('🔙 Product back button clicked from header!');
    if (onProductBack && typeof onProductBack === 'function') {
      onProductBack();
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
    <div className={`theme-${theme}`}>
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
                    <Store className="w-10 h-10 text-blue-500 logo-fallback" />
                    <h1 className="logo-title">VipStore Website</h1>
                    {/* <p>( DEMO Version )</p> */}
                  </div>
                  
                  {/* <p className="logo-description">
                    📱 DEMO Version| เวอร์ชันมือถืออยู่ระหว่างการพัฒนา
                  </p> */}
                </div>
              </div>
              
              {/* View Badge */}
              {currentView === 'admin' && (
                <span className="view-badge admin-badge">
                  <UserCheck className="w-4 h-4" /> Admin Panel
                </span>
              )}
              {currentView === 'settings' && (
                <span className="view-badge settings-badge">
                  <Settings className="w-4 h-4" /> Settings
                </span>
              )}
              
              {/* ✨ Product Preview Badge */}
              {showProductBackButton && (
                <span className="view-badge product-badge">
                  <Package className="w-4 h-4" /> รายละเอียดสินค้า
                </span>
              )}
            </div>

            {/* BOTTOM ROW: Navigation */}
            <div className="header-bottom">
              
              {/* Left Side: Back/Cart Buttons */}
              <div className="header-left">
                
                {/* ✨ Product Back Button (Product Preview mode) */}
                {showProductBackButton && (
                  <button 
                    className="btn-secondary btn-product-back"
                    // onClick={handleProductBackClick}
                    onClick={onBackToHome}
                  >
                    <Home className="w-4 h-4" /> กลับไปหน้าหลัก
                  </button>
                )}

                {/* Back to Home Button (Admin/Settings view only) */}
                {(currentView === 'admin' || currentView === 'settings') && !showProductBackButton && (
                  <button 
                    className="btn-secondary btn-back"
                    onClick={onBackToHome}
                  >
                    <Home className="w-4 h-4" /> Back to VipStore
                  </button>
                )}

                {/* Cart Button (Home view only and not in product preview) */}
                {currentView === 'home' && !showProductBackButton && (
                  <button 
                      className="btn-secondary cart-button"
                      onClick={toggleCart}
                      style={{ 
                        position: 'relative',
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        minHeight: '26px'
                      }}
                    >
                    <ShoppingCart className="w-4 h-4" /> ({totalItems})
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
                        {/* Show Profile Picture if available */}
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
                         isAdmin() ? <UserCheck className="w-4 h-4" /> : <User className="w-4 h-4" />
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
                      
                      {/* ✨ ซ่อน Settings/Admin buttons ใน Product Preview mode */}
                      {!showProductBackButton && (
                        <>
                          {/* Settings Button (Customer only, Home view only) */}
                          {user && user.role === 'customer' && currentView === 'home' && (
                            <button 
                              className={clsx(
                                'btn-primary', 
                                'btn-settings',
                                {'btn-disabled': !ENABLE_SETTINGS_BUTTON } 
                              )}
                              onClick={() => {
                                console.log('🔧 Settings button physical click!');
                                handleSettingsClick();
                              }}
                              title="การตั้งค่า"
                              disabled={!ENABLE_SETTINGS_BUTTON}
                            >
                              <span className="btn-text">การตั้งค่า</span>
                              <Settings className="w-4 h-4" />
                            </button>
                          )}

                          {/* Admin Panel Button (Admin only, Home view only) */}
                          {isAdmin() && currentView === 'home' && (
                            <button 
                              className="btn-primary btn-admin"
                              onClick={handleAdminClick}
                            >
                              <Settings className="w-4 h-4" /> Management
                            </button>
                          )}
                        </>
                      )}

                      {/* Logout Button - Always show */}
                      <button 
                        className="btn-outline btn-logout"
                        onClick={handleLogout}
                      >
                        <span className="btn-text">ออกจากระบบ</span>
                        <span className="btn-icon"><LogOut className="w-4 h-4" /></span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Login Button - ซ่อนใน Product Preview mode */
                  !showProductBackButton && (
                    <button 
                      className="btn-primary btn-login"
                      onClick={onLoginClick}
                    >
                      <Shield className="w-4 h-4" /> เข้าสู่ระบบ
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced CSS with Product Preview Support */}
       
<style jsx>{`
  /* ===== MOBILE-FIRST HEADER REDESIGN ===== */
  .header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .container {
    margin: 0 auto;
    padding: 0 12px;
  }

  .header-layout {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 8px 0;
  }

  /* ===== LOGO ROW ===== */
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .logo-section {
    cursor: pointer;
    flex: 1;
    min-width: 0;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .logo-main {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .logo-image {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .logo-fallback {
    display: none;
  }

  .logo-title {
    font-family: "Bruno Ace", sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: #059669;
    margin: 0;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Hide description on mobile */
  .logo-description {
    display: none;
  }

  /* ===== VIEW BADGE ===== */
  .view-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.65rem;
    font-weight: 600;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .admin-badge {
    background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
    color: white;
  }

  .settings-badge {
    background: linear-gradient(135deg, #059669 0%, #10B981 100%);
    color: white;
  }

  .product-badge {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  /* ===== NAVIGATION ROW ===== */
  .header-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 6px;
  }

  .header-left,
  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ===== USER INFO CARD (MOBILE COMPACT) ===== */
  .user-info {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 20px;
    border: 1px solid;
    max-width: fit-content;
  }

  .user-info.admin {
    background: rgba(30, 64, 175, 0.08);
    border-color: rgba(30, 64, 175, 0.2);
  }

  .user-info.customer {
    background: rgba(5, 150, 105, 0.08);
    border-color: rgba(5, 150, 105, 0.2);
  }

  .user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }

  .user-info.admin .user-avatar {
    background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
    color: white;
  }

  .user-info.customer .user-avatar {
    background: linear-gradient(135deg, #059669 0%, #10B981 100%);
    color: white;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .user-name {
    font-size: 0.75rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80px;
  }

  .user-role {
    font-size: 0.65rem;
    color: #6b7280;
    font-weight: 500;
    line-height: 1;
  }

  /* ===== BUTTONS (MOBILE OPTIMIZED) ===== */
  .action-buttons {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .btn-disabled,
  .btn-disabled:hover {
    background: #adb5bd !important; /* สีเทา */
    color: #f8f9fa !important;
    cursor: not-allowed !important; /* เปลี่ยนเมาส์ */
    opacity: 0.7 !important;
    border: none !important;
    transform: none !important;
    box-shadow: none !important;
  }

  .btn-primary,
  .btn-secondary,
  .btn-outline {
    padding: 6px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  /* Icon-only buttons on mobile */
  .btn-text {
    display: none;
  }

  .btn-icon {
    display: inline-flex;
  }

  /* Button Variants */
  .theme-admin .btn-primary {
    background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
    color: white;
  }

  .theme-customer .btn-primary {
    background: linear-gradient(135deg, #059669 0%, #10B981 100%);
    color: white;
  }

  .btn-secondary {
    background: white;
    color: #059669;
    border: 1.5px solid #059669;
  }

  .theme-admin .btn-secondary {
    color: #1E40AF;
    border-color: #1E40AF;
  }

  .btn-outline {
    background: white;
    color: #dc2626;
    border: 1.5px solid #dc2626;
  }

  .btn-outline:hover {
    background: #dc2626;
    color: white;
  }

  .btn-product-back {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
    color: white !important;
    border: none !important;
  }

  /* Cart Button Special */
  .cart-button {
    position: relative;
    min-width: fit-content;
  }

  .cart-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #dc2626;
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
  }

  .cart-amount {
    display: none;
  }

  /* ===== TABLET BREAKPOINT (640px+) ===== */
  @media (min-width: 640px) {
    .container {
      padding: 0 16px;
    }

    .header-layout {
      gap: 12px;
      padding: 10px 0;
    }

    .logo-image {
      width: 36px;
      height: 36px;
    }

    .logo-title {
      font-size: 1rem;
    }

    .user-name {
      max-width: 120px;
      font-size: 0.8rem;
    }

    .btn-primary,
    .btn-secondary,
    .btn-outline {
      padding: 8px 12px;
      font-size: 0.8rem;
    }

    /* Show text on larger mobile */
    .btn-text {
      display: inline;
    }

    .cart-amount {
      display: block;
      font-size: 0.7rem;
      color: #6b7280;
      margin-top: 2px;
    }
  }

  /* ===== DESKTOP BREAKPOINT (768px+) ===== */
  @media (min-width: 768px) {
    .header-layout {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 0;
      padding: 12px 0;
    }

    .header-top {
      display: contents;
    }

    .header-bottom {
      display: contents;
    }

    .logo-section {
      order: 1;
      flex: unset;
    }

    .header-left {
      order: 2;
      gap: 12px;
    }

    .header-right {
      order: 3;
      gap: 12px;
    }

    .logo-image {
      width: 42px;
      height: 42px;
    }

    .logo-title {
      font-size: 1.3rem;
    }

    .logo-description {
      display: block;
      margin: 2px 0 0 0;
      font-size: 0.7rem;
      color: #6b7280;
      font-style: italic;
    }

    .view-badge {
      padding: 6px 14px;
      font-size: 0.75rem;
    }

    .user-info {
      padding: 6px 14px;
      gap: 10px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
    }

    .user-name {
      font-size: 0.9rem;
      max-width: 160px;
    }

    .user-role {
      font-size: 0.75rem;
    }

    .btn-primary,
    .btn-secondary,
    .btn-outline {
      padding: 10px 16px;
      font-size: 0.875rem;
    }

    .action-buttons {
      
    }
  }

  /* ===== LARGE DESKTOP (1024px+) ===== */
  @media (min-width: 1024px) {
    .logo-title {
      font-size: 1.5rem;
    }

    .user-name {
      max-width: 200px;
    }
  }
`}</style>


      </header>
    </div>

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