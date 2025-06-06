import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = ({ onLoginClick }) => {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const { totalItems, toggleCart, formatCurrency, totalAmount } = useCart();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <h1>🛍️ Vip Store</h1>
          
          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Cart Button */}
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
            
            {/* User Status & Actions */}
            {isLoggedIn() ? (
              <>
                {/* User Info */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: '#f0f8ff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {isAdmin() ? '👨‍💼' : '🛍️'}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {user.name}
                    </span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#666',
                      textTransform: 'capitalize'
                    }}>
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Admin Panel Button (Admin only) */}
                {isAdmin() && (
                  <button className="btn-primary">
                    ⚙️ Admin Panel
                  </button>
                )}

                {/* Logout Button */}
                <button 
                  className="btn-outline"
                  onClick={handleLogout}
                  style={{
                    background: 'white',
                    color: '#dc3545',
                    border: '2px solid #dc3545'
                  }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              /* Login Button */
              <button 
                className="btn-primary"
                onClick={onLoginClick}
              >
                🔐 Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;