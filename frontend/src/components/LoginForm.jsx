// frontend/src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';

const LoginForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login, loading } = useAuth();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    // Validation
    if (!formData.username.trim()) {
      setLoginError('Please enter username');
      return;
    }
    if (!formData.password) {
      setLoginError('Please enter password');
      return;
    }

    try {
      const result = await login(formData.username.trim(), formData.password);
      
      if (result.success) {
        // Clear form
        setFormData({ username: '', password: '' });
        
        // Call success callback
        if (onSuccess) {
          onSuccess(result.user);
        }
        
        // Close modal if provided
        if (onClose) {
          onClose();
        }
      } else {
        setLoginError(result.message || 'Login failed');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  // Quick login helpers
  const quickLogin = (username, password) => {
    setFormData({ username, password });
  };

  return (
    <div className="login-form-container">
      <div className="login-form">
        <div className="login-header">
          <h2>🔐 Login to Vip Store</h2>
          {onClose && (
            <button 
              className="close-button" 
              onClick={onClose}
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form-content">
          {/* Username Input */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="error-message">
              ⚠️ {loginError}
            </div>
          )}

          {/* Login Button */}
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Logging in...
              </>
            ) : (
              <>
                🚀 Login
              </>
            )}
          </button>

          {/* Quick Login Section */}
          <div className="quick-login-section">
            <p className="quick-login-title">🧪 Test Accounts:</p>
            <div className="quick-login-buttons">
              <button
                type="button"
                className="quick-login-btn admin"
                onClick={() => quickLogin('admin', 'admin123')}
                disabled={loading}
              >
                👨‍💼 Admin Login
              </button>
              <button
                type="button"
                className="quick-login-btn customer"
                onClick={() => quickLogin('vip', 'vip123')}
                disabled={loading}
              >
                🛍️ Customer Login
              </button>
            </div>
          </div>
        </form>

        {/* Login Info */}
        <div className="login-info">
          <div className="info-item">
            <strong>👨‍💼 Admin:</strong> admin / admin123
          </div>
          <div className="info-item">
            <strong>🛍️ Customer:</strong> vip / vip123
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;