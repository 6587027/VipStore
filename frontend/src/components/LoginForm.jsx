// frontend/src/components/LoginForm.jsx 

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';

const LoginForm = ({ onSuccess, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
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
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      setLoginError('กรุณากรอกชื่อผู้ใช้');
      return false;
    }
    if (!formData.password) {
      setLoginError('กรุณากรอกรหัสผ่าน');
      return false;
    }
    return true;
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, level: 'none', message: '', color: '#e2e8f0' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    // Calculate score
    if (checks.length) score += 2;
    if (checks.lowercase) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.special) score += 1;

    // Determine strength level
    let level, message, color;
    if (score < 3) {
      level = 'weak';
      message = 'รหัสผ่านอ่อน';
      color = '#ef4444';
    } else if (score < 5) {
      level = 'medium';
      message = 'รหัสผ่านปานกลาง';
      color = '#f59e0b';
    } else if (score < 6) {
      level = 'strong';
      message = 'รหัสผ่านแข็งแรง';
      color = '#10b981';
    } else {
      level = 'excellent';
      message = 'รหัสผ่านยอดเยี่ยม';
      color = '#059669';
    }

    return { score, level, message, color, checks };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateSignUp = () => {
    if (!formData.username.trim()) {
      setLoginError('กรุณากรอกชื่อผู้ใช้');
      return false;
    }
    if (formData.username.length < 3) {
      setLoginError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
      return false;
    }
    if (!formData.email.trim()) {
      setLoginError('กรุณากรอกอีเมล');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setLoginError('กรุณากรอกอีเมลที่ถูกต้อง');
      return false;
    }
    if (!formData.firstName.trim()) {
      setLoginError('กรุณากรอกชื่อจริง');
      return false;
    }
    if (!formData.lastName.trim()) {
      setLoginError('กรุณากรอกนามสกุล');
      return false;
    }
    if (!formData.password) {
      setLoginError('กรุณากรอกรหัสผ่าน');
      return false;
    }
    if (formData.password.length < 8) {
      setLoginError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return false;
    }
    if (passwordStrength.level === 'weak') {
      setLoginError('รหัสผ่านไม่ปลอดภัยเพียงพอ กรุณาใช้รหัสผ่านที่แข็งแรงกว่า');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLoginError('รหัสผ่านไม่ตรงกัน');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    const isValid = isSignUp ? validateSignUp() : validateLogin();
    if (!isValid) return;

    try {
      let result;
      
      if (isSignUp) {
        result = await register({
          username: formData.username.trim(),
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          password: formData.password
        });
      } else {
        result = await login(formData.username.trim(), formData.password);
      }
      
      if (result.success) {
        setFormData({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: ''
        });
        
        if (onSuccess) {
          onSuccess(result.user);
        }
        
        if (onClose) {
          onClose();
        }
      } else {
        setLoginError(result.message || `${isSignUp ? 'การสมัครสมาชิก' : 'การเข้าสู่ระบบ'}ไม่สำเร็จ`);
      }
    } catch (error) {
      setLoginError(`${isSignUp ? 'การสมัครสมาชิก' : 'การเข้าสู่ระบบ'}ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง`);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    // Open Vip's contact page in new tab
    window.open('https://vippersonalwebsite.vercel.app/contact', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="login-form-container">
      <div className="login-form">
        <div className="login-header">
          <div className="header-content">
            <div className="header-icon">
              {isSignUp ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              ) : (
                <img 
                  src="/VipStoreLogo.png" 
                  alt="Vip Store Logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    borderRadius: '12px' ,
                  }}
                />
              )}
            </div>
            <div className="header-text">
              <h2 className="header-title">
                {isSignUp ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}
              </h2>
              <p className="header-subtitle">
                {isSignUp 
                  ? 'สมัครสมาชิกเพื่อเริ่มช้อปปิ้งกับ Vip Store' 
                  : 'ยินดีต้อนรับกลับสู่ Vip Store'
                }
              </p>
            </div>
          </div>
          
          {onClose && (
            <button 
              className="close-button" 
              onClick={onClose}
              type="button"
              aria-label="ปิด"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form-content">
          {/* Username Input */}
          <div className="form-group">
            <label htmlFor="username">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg> ชื่อผู้ใช้ (Username)
            </label>
            <div className="input-container">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="กรอกชื่อผู้ใช้"
                disabled={loading}
                autoComplete="username"
                className="form-input"
              />
            </div>
          </div>

          {/* Sign Up Only Fields */}
          {isSignUp && (
            <>
              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="email">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg> อีเมล (Email)
                  
                </label>
                <div className="input-container">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="กรอกอีเมล"
                    disabled={loading}
                    autoComplete="email"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Name Inputs */}
              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="firstName">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg> ชื่อจริง (First Name)
                  </label>
                  <div className="input-container">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="ชื่อจริง"
                      disabled={loading}
                      autoComplete="given-name"
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group form-group-half">
                  <label htmlFor="lastName">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg> นามสกุล (Last Name)
                  </label>
                  <div className="input-container">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="นามสกุล"
                      disabled={loading}
                      autoComplete="family-name"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg> รหัสผ่าน (Password)
             
            </label>
            <div className="input-container password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="กรอกรหัสผ่าน"
                disabled={loading}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="form-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator (Sign Up Only) */}
            {isSignUp && formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
                <div className="strength-info">
                  <span 
                    className="strength-level"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.message}
                  </span>
                  <div className="strength-requirements">
                    <div className={`requirement ${passwordStrength.checks.length ? 'met' : ''}`}>
                      {passwordStrength.checks.length ? '✓' : '○'} อย่างน้อย 8 ตัวอักษร
                    </div>
                    <div className={`requirement ${passwordStrength.checks.lowercase ? 'met' : ''}`}>
                      {passwordStrength.checks.lowercase ? '✓' : '○'} ตัวอักษรเล็ก (a-z)
                    </div>
                    <div className={`requirement ${passwordStrength.checks.uppercase ? 'met' : ''}`}>
                      {passwordStrength.checks.uppercase ? '✓' : '○'} ตัวอักษรใหญ่ (A-Z)
                    </div>
                    <div className={`requirement ${passwordStrength.checks.numbers ? 'met' : ''}`}>
                      {passwordStrength.checks.numbers ? '✓' : '○'} ตัวเลข (0-9)
                    </div>
                    <div className={`requirement ${passwordStrength.checks.special ? 'met' : ''}`}>
                      {passwordStrength.checks.special ? '✓' : '○'} เครื่องหมายพิเศษ (!@#$...)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input (Sign Up Only) */}
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg> ยืนยันรหัสผ่าน (Confirm Password)
               
              </label>
              <div className="input-container password-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="ยืนยันรหัสผ่าน"
                  disabled={loading}
                  autoComplete="new-password"
                  className="form-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  aria-label={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password Link (Login Only) */}
          {!isSignUp && (
            <div className="forgot-password-section">
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
                ลืมรหัสผ่าน? ติดต่อผู้พัฒนา 
              </button>
            </div>
          )}

          {/* Error Message */}
          {loginError && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {loginError}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`submit-button ${isSignUp ? 'signup-button' : 'login-button'}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                </div>
                {isSignUp ? 'กำลังสร้างบัญชี...' : 'กำลังเข้าสู่ระบบ...'}
              </>
            ) : (
              <>
                {isSignUp ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10,17 15,12 10,7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                )}
                {isSignUp ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}
              </>
            )}
          </button>

          {/* Toggle Mode Section */}
          <div className="toggle-mode-section">
            <div className="divider">
              <span>หรือ</span>
            </div>
            <p className="toggle-text">
              {isSignUp 
                ? 'มีบัญชีอยู่แล้ว?' 
                : 'ยังไม่มีบัญชี?'
              }
            </p>
            <button
              type="button"
              className="toggle-mode-button"
              onClick={toggleMode}
              disabled={loading}
            >
              {isSignUp ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10,17 15,12 10,7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  เข้าสู่ระบบ
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  สร้างบัญชีใหม่
                </>
              )}
            </button>
          </div>
        </form>

        {/* Beautiful Footer */}
        <div className="login-footer">
          <div className="footer-content">
            <p className="footer-text">
              พัฒนาโดย{' '}
              <a 
                target="_blank" 
                rel="noopener noreferrer"
                className="developer-link"
              >
                วิป (Vip) 👨‍💻
              </a>
            </p>
            <div className="footer-links">
              {/* <a 
                href="https://vippersonalwebsite.vercel.app/contact" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                ติดต่อ
              </a> */}
              {/* <span className="separator">•</span> */}
              <a 
                href="https://vippersonalwebsite.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                เว็บไซต์
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;