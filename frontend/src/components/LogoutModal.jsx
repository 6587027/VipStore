// frontend/src/components/LogoutModal.jsx - Enhanced Beautiful Version
import React from 'react';

const LogoutModal = ({ isOpen, onConfirm, onCancel, user, roleDisplay }) => {
  if (!isOpen) return null;

  // Get user display name
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return 'ผู้ใช้';
  };

  // Get role display in Thai
  const getRoleDisplayThai = () => {
    if (user?.role === 'admin') {
      return 'ผู้ดูแลระบบ';
    }
    return 'ลูกค้า';
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div className="logout-modal-backdrop" onClick={onCancel}>
        
        {/* Modal Content */}
        <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
          
          {/* Close Button */}
          <button className="logout-close" onClick={onCancel} aria-label="ปิด">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Header Section */}
          <div className="logout-modal-header">
            <div className="logout-icon">
              <div className="logout-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
            </div>
            <h3 className="logout-title">ออกจากระบบ</h3>
            <p className="logout-subtitle">คุณต้องการออกจากระบบใช่หรือไม่?</p>
          </div>

          {/* User Info Section */}
          <div className="logout-user-info">
            <div className="user-card">
              <div className="user-avatar">
                {user?.role === 'admin' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
              <div className="user-details">
                <div className="user-name">{getDisplayName()}</div>
                <div className="user-role">{getRoleDisplayThai()}</div>
                {user?.email && (
                  <div className="user-email">{user.email}</div>
                )}
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="logout-warning">
            <div className="warning-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="warning-content">
              <p className="warning-title">หลังจากออกจากระบบ</p>
              <p className="warning-text">คุณจะต้องเข้าสู่ระบบใหม่เพื่อใช้งานต่อ</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="logout-actions">
            <button 
              className="btn-cancel" 
              onClick={onCancel}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <span className="btn-text">ยกเลิก</span>
            </button>
            
            <button 
              className="btn-confirm" 
              onClick={onConfirm}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="btn-text">ออกจากระบบ</span>
            </button>
          </div>

          {/* Footer */}
          <div className="logout-footer">
            <p className="footer-text">
              ขอบคุณที่ใช้งาน{' '}
              <span className="brand-name">Vip Store</span>
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        /* ===== CSS CUSTOM PROPERTIES ===== */
        .logout-modal-backdrop {
          --primary-blue: #2563eb;
          --primary-blue-light: #3b82f6;
          --primary-blue-dark: #1d4ed8;
          --secondary-blue: #06b6d4;
          --accent-blue: #0ea5e9;
          --soft-blue: #e0f2fe;
          
          --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --gradient-blue: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          --gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          --gradient-soft: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          
          --text-primary: #1a202c;
          --text-secondary: #4a5568;
          --text-muted: #718096;
          --text-light: #a0aec0;
          
          --bg-white: #ffffff;
          --bg-gray-50: #f8fafc;
          --bg-gray-100: #f1f5f9;
          --bg-gray-200: #e2e8f0;
          
          --border-light: #e2e8f0;
          --border-medium: #cbd5e1;
          
          --success: #10b981;
          --error: #ef4444;
          --warning: #f59e0b;
          
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
          --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.15);
          --shadow-blue: 0 8px 25px rgba(59, 130, 246, 0.3);
          --shadow-danger: 0 8px 25px rgba(239, 68, 68, 0.3);
          
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
          --radius-xl: 20px;
          --radius-full: 50%;
          
          --space-xs: 4px;
          --space-sm: 8px;
          --space-md: 12px;
          --space-lg: 16px;
          --space-xl: 20px;
          --space-2xl: 24px;
          --space-3xl: 28px;
          --space-4xl: 32px;
          
          --font-normal: 400;
          --font-medium: 500;
          --font-semibold: 600;
          --font-bold: 700;
        }

        /* ===== MODAL BACKDROP ===== */
        .logout-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: var(--space-xl);
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* ===== MODAL CONTAINER ===== */
        .logout-modal {
          background: var(--bg-white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          padding: var(--space-3xl) var(--space-3xl) var(--space-2xl);
          width: 100%;
          max-width: 420px;
          position: relative;
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255, 255, 255, 0.9);
          overflow: hidden;
        }

        .logout-modal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-primary);
        }

        /* ===== CLOSE BUTTON ===== */
        .logout-close {
          position: absolute;
          top: var(--space-lg);
          right: var(--space-lg);
          width: 36px;
          height: 36px;
          border: none;
          background: var(--bg-gray-100);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.2s ease;
          z-index: 10;
        }

        .logout-close:hover {
          background: var(--bg-gray-200);
          color: var(--text-secondary);
          transform: scale(1.05);
        }

        .logout-close:active {
          transform: scale(0.95);
        }

        /* ===== HEADER SECTION ===== */
        .logout-modal-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .logout-icon {
          display: flex;
          justify-content: center;
          margin-bottom: var(--space-lg);
        }

        .logout-icon-circle {
          width: 72px;
          height: 72px;
          background: var(--gradient-danger);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-danger);
          color: white;
          animation: pulseGlow 3s infinite ease-in-out;
          position: relative;
        }

        .logout-icon-circle::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: var(--gradient-danger);
          border-radius: var(--radius-full);
          opacity: 0.3;
          animation: pulseRing 3s infinite ease-in-out;
        }

        .logout-title {
          font-size: 1.5rem;
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin: 0 0 var(--space-sm) 0;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        .logout-subtitle {
          font-size: 0.95rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
          font-weight: var(--font-normal);
        }

        /* ===== USER INFO SECTION ===== */
        .logout-user-info {
          margin-bottom: var(--space-xl);
        }

        .user-card {
          background: var(--gradient-soft);
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          transition: all 0.2s ease;
        }

        .user-avatar {
          width: 52px;
          height: 52px;
          background: var(--gradient-blue);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-blue);
          color: white;
          flex-shrink: 0;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 1.1rem;
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-xs);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-role {
          font-size: 0.85rem;
          color: var(--primary-blue);
          font-weight: var(--font-medium);
          margin-bottom: var(--space-xs);
          line-height: 1.2;
        }

        .user-email {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: var(--font-normal);
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ===== WARNING SECTION ===== */
        .logout-warning {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-left: 4px solid var(--warning);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          margin-bottom: var(--space-xl);
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
        }

        .warning-icon {
          flex-shrink: 0;
          color: var(--warning);
          margin-top: 2px;
        }

        .warning-content {
          flex: 1;
        }

        .warning-title {
          font-size: 0.9rem;
          font-weight: var(--font-semibold);
          color: #92400e;
          margin: 0 0 var(--space-xs) 0;
          line-height: 1.3;
        }

        .warning-text {
          font-size: 0.85rem;
          color: #a16207;
          margin: 0;
          line-height: 1.4;
          font-weight: var(--font-normal);
        }

        /* ===== ACTION BUTTONS ===== */
        .logout-actions {
          display: flex;
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .btn-cancel,
        .btn-confirm {
          flex: 1;
          height: 52px;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: var(--font-semibold);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          outline: none;
          font-family: inherit;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.01em;
        }

        .btn-cancel {
          background: var(--bg-white);
          color: var(--text-secondary);
          border: 2px solid var(--border-medium);
        }

        .btn-cancel:hover {
          background: var(--bg-gray-50);
          border-color: var(--text-muted);
          color: var(--text-primary);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .btn-cancel:active {
          transform: translateY(0);
        }

        .btn-confirm {
          background: var(--gradient-danger);
          color: white;
          border: 2px solid transparent;
          box-shadow: var(--shadow-danger);
        }

        .btn-confirm:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-1px);
          box-shadow: 0 12px 35px rgba(239, 68, 68, 0.4);
        }

        .btn-confirm:active {
          transform: translateY(0);
        }

        .btn-text {
          font-size: 0.95rem;
          line-height: 1;
          font-weight: var(--font-semibold);
        }

        /* ===== FOOTER ===== */
        .logout-footer {
          text-align: center;
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border-light);
        }

        .footer-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.4;
          font-weight: var(--font-normal);
        }

        .brand-name {
          color: var(--primary-blue);
          font-weight: var(--font-semibold);
        }

        /* ===== ANIMATIONS ===== */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        /* ===== MOBILE RESPONSIVE ===== */
        @media (max-width: 480px) {
          .logout-modal-backdrop {
            padding: var(--space-md);
          }
          
          .logout-modal {
            padding: var(--space-2xl) var(--space-xl) var(--space-lg);
            max-width: calc(100vw - 24px);
            border-radius: var(--radius-lg);
          }

          .logout-title {
            font-size: 1.35rem;
          }

          .logout-subtitle {
            font-size: 0.9rem;
          }

          .logout-icon-circle {
            width: 64px;
            height: 64px;
          }

          .user-avatar {
            width: 48px;
            height: 48px;
            border-radius: var(--radius-md);
          }

          .user-name {
            font-size: 1rem;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .user-role {
            font-size: 0.8rem;
          }

          .user-email {
            font-size: 0.75rem;
          }

          .btn-cancel,
          .btn-confirm {
            height: 48px;
            font-size: 0.9rem;
            border-radius: var(--radius-md);
          }

          .btn-text {
            font-size: 0.9rem;
          }

          .logout-actions {
            gap: var(--space-sm);
          }

          .logout-close {
            width: 32px;
            height: 32px;
            top: var(--space-md);
            right: var(--space-md);
          }

          .warning-title {
            font-size: 0.85rem;
          }

          .warning-text {
            font-size: 0.8rem;
          }
        }

        /* ===== EXTRA SMALL MOBILE ===== */
        @media (max-width: 360px) {
          .logout-modal {
            padding: var(--space-xl) var(--space-lg) var(--space-md);
            max-width: calc(100vw - 16px);
          }

          .logout-actions {
            flex-direction: column;
            gap: var(--space-sm);
          }

          .btn-cancel,
          .btn-confirm {
            width: 100%;
            height: 46px;
          }

          .user-card {
            flex-direction: column;
            text-align: center;
            gap: var(--space-md);
          }

          .user-details {
            text-align: center;
          }
        }

        /* ===== LANDSCAPE MOBILE ===== */
        @media (max-height: 600px) and (orientation: landscape) {
          .logout-modal {
            max-height: 90vh;
            overflow-y: auto;
          }

          .logout-icon-circle {
            width: 56px;
            height: 56px;
          }

          .logout-modal-header {
            margin-bottom: var(--space-lg);
          }

          .logout-user-info {
            margin-bottom: var(--space-lg);
          }

          .logout-warning {
            margin-bottom: var(--space-lg);
          }

          .logout-actions {
            margin-bottom: var(--space-md);
          }
        }

        /* ===== REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .logout-modal {
            animation: fadeIn 0.2s ease-out;
          }
          
          .logout-icon-circle {
            animation: none;
          }
          
          .logout-icon-circle::before {
            animation: none;
          }
          
          .btn-cancel:hover,
          .btn-confirm:hover {
            transform: none;
          }
        }

        /* ===== HIGH DPI SCREENS ===== */
        @media (-webkit-min-device-pixel-ratio: 2) {
          .logout-modal {
            border: 0.5px solid rgba(255, 255, 255, 0.9);
          }
          
          .user-card {
            border-width: 1px;
          }
          
          .logout-warning {
            border-width: 1px;
            border-left-width: 3px;
          }
        }
      `}</style>
    </>
  );
};

export default LogoutModal;