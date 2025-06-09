// frontend/src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';

const LoginForm = ({ onSuccess, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login/SignUp
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login, register, loading } = useAuth();

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

  // Switch between Login and Sign Up
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: ''
    });
    setLoginError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Validation functions
  const validateLogin = () => {
    if (!formData.username.trim()) {
      setLoginError('Please enter username');
      return false;
    }
    if (!formData.password) {
      setLoginError('Please enter password');
      return false;
    }
    return true;
  };

  const validateSignUp = () => {
    if (!formData.username.trim()) {
      setLoginError('Please enter username');
      return false;
    }
    if (formData.username.length < 3) {
      setLoginError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.email.trim()) {
      setLoginError('Please enter email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setLoginError('Please enter a valid email');
      return false;
    }
    if (!formData.firstName.trim()) {
      setLoginError('Please enter first name');
      return false;
    }
    if (!formData.lastName.trim()) {
      setLoginError('Please enter last name');
      return false;
    }
    if (!formData.password) {
      setLoginError('Please enter password');
      return false;
    }
    if (formData.password.length < 6) {
      setLoginError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLoginError('Passwords do not match');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    // Validation
    const isValid = isSignUp ? validateSignUp() : validateLogin();
    if (!isValid) return;

    try {
      let result;
      
      if (isSignUp) {
        // Sign Up
        result = await register({
          username: formData.username.trim(),
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          password: formData.password
        });
      } else {
        // Login
        result = await login(formData.username.trim(), formData.password);
      }
      
      if (result.success) {
        // Clear form
        setFormData({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: ''
        });
        
        // Call success callback
        if (onSuccess) {
          onSuccess(result.user);
        }
        
        // Close modal if provided
        if (onClose) {
          onClose();
        }
      } else {
        setLoginError(result.message || `${isSignUp ? 'Registration' : 'Login'} failed`);
      }
    } catch (error) {
      setLoginError(`${isSignUp ? 'Registration' : 'Login'} failed. Please try again.`);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form">
        <div className="login-header">
          <h2>
            {isSignUp ? '📝 Sign Up for Vip Store' : '🔐 Login to Vip Store'}
          </h2>
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
          {/* Username Input (Both Login & SignUp) */}
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

          {/* Sign Up Only Fields */}
          {isSignUp && (
            <>
              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* Name Inputs */}
              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    disabled={loading}
                    autoComplete="given-name"
                  />
                </div>
                <div className="form-group form-group-half">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    disabled={loading}
                    autoComplete="family-name"
                  />
                </div>
              </div>
            </>
          )}

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
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
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

          {/* Confirm Password Input (Sign Up Only) */}
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {loginError && (
            <div className="error-message">
              ⚠️ {loginError}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`login-button ${isSignUp ? 'signup-button' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner">⏳</span>
                {isSignUp ? 'Creating Account...' : 'Logging in...'}
              </>
            ) : (
              <>
                {isSignUp ? '📝 Create Account' : '🚀 Login'}
              </>
            )}
          </button>

          {/* Toggle Mode Button */}
          <div className="toggle-mode-section">
            <p>
              {isSignUp 
                ? 'Already have an account?' 
                : "Don't have an account?"
              }
            </p>
            <button
              type="button"
              className="toggle-mode-button"
              onClick={toggleMode}
              disabled={loading}
            >
              {isSignUp 
                ? '🔐 Login Instead' 
                : '📝 Sign Up Instead'
              }
            </button>
          </div>
        </form>

        {/* Quick Login Section (Login Only) */}
        {/* {!isSignUp && (
          <div className="login-info">
            <p className="info-title">🧪 Test Accounts:</p>
            <div className="test-accounts">
              <div className="info-item">
                <strong>👨‍💼 Admin:</strong> admin / admin123
              </div>
              <div className="info-item">
                <strong>🛍️ Customer:</strong> vip / vip123
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default LoginForm;