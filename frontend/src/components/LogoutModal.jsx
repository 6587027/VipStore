// 🔧 แก้ไข frontend/src/components/LogoutModal.jsx - Mobile Optimized

import React from 'react';

const LogoutModal = ({ isOpen, onConfirm, onCancel, user, roleDisplay }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div className="logout-modal-backdrop" onClick={onCancel}>
        
        {/* Modal Content */}
        <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
          
          {/* Header Section */}
          <div className="logout-modal-header">
            <div className="logout-icon">
              <div className="logout-icon-circle">
                {/* ✅ ใช้ Unicode แทน Emoji */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
            </div>
            <h3 className="logout-title">ต้องการออกจากระบบ?</h3>
            <p className="logout-subtitle">คุณจะต้องเข้าสู่ระบบใหม่อีกครั้ง</p>
          </div>

          {/* User Info Section */}
          <div className="logout-user-info">
            <div className="user-card">
              <div className="user-avatar">
                {/* ✅ ใช้ Unicode/SVG แทน Emoji */}
                {user?.role === 'admin' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V4C15 1.79 13.21 0 11 0S7 1.79 7 4V5.5L1 7V9L7 10.5V20C7 21.1 7.9 22 9 22H15C16.1 22 17 21.1 17 20V10.5L21 9Z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M7.07 18.28C7.5 17.38 10.12 16.5 12 16.5S16.5 17.38 16.93 18.28C15.57 19.36 13.86 20 12 20S8.43 19.36 7.07 18.28M18.36 16.83C16.93 15.09 13.46 14.5 12 14.5S7.07 15.09 5.64 16.83C4.62 15.5 4 13.82 4 12C4 7.59 7.59 4 12 4S20 7.59 20 12C20 13.82 19.38 15.5 18.36 16.83M12 6C10.06 6 8.5 7.56 8.5 9.5S10.06 13 12 13S15.5 11.44 15.5 9.5S13.94 6 12 6M12 11C11.17 11 10.5 10.33 10.5 9.5S11.17 8 12 8S13.5 8.67 13.5 9.5S12.83 11 12 11Z"/>
                  </svg>
                )}
              </div>
              <div className="user-details">
                <div className="user-name">{user?.firstName || user?.username || 'ผู้ใช้'}</div>
                <div className="user-role">{roleDisplay}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="logout-actions">
            <button 
              className="btn-cancel" 
              onClick={onCancel}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <span className="btn-text">ยกเลิก</span>
            </button>
            
            <button 
              className="btn-confirm" 
              onClick={onConfirm}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              <span className="btn-text">ออกจากระบบ</span>
            </button>
          </div>

          {/* Close Button */}
          <button className="logout-close" onClick={onCancel}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ✅ Mobile-First Optimized Styles */}
      <style jsx>{`
        /* ===== MODAL BACKDROP ===== */
        .logout-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: fadeIn 0.25s ease-out;
        }

        /* ===== MODAL CONTAINER ===== */
        .logout-modal {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.25),
            0 10px 25px rgba(0, 0, 0, 0.15);
          padding: 28px 24px 24px 24px;
          width: 100%;
          max-width: 380px;
          position: relative;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          border: 1px solid rgba(255, 255, 255, 0.9);
        }

        /* ===== HEADER SECTION ===== */
        .logout-modal-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .logout-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .logout-icon-circle {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 8px 25px rgba(255, 107, 107, 0.4),
            0 4px 12px rgba(255, 107, 107, 0.3);
          color: white;
          animation: pulseGlow 3s infinite ease-in-out;
        }

        .logout-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 6px 0;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        .logout-subtitle {
          font-size: 0.9rem;
          color: #718096;
          margin: 0;
          line-height: 1.4;
          font-weight: 400;
        }

        /* ===== USER INFO SECTION ===== */
        .logout-user-info {
          margin-bottom: 24px;
        }

        .user-card {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(102, 126, 234, 0.35);
          color: white;
          flex-shrink: 0;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 1rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 2px;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-role {
          font-size: 0.8rem;
          color: #718096;
          font-weight: 500;
          line-height: 1.2;
        }

        /* ===== ACTION BUTTONS ===== */
        .logout-actions {
          display: flex;
          gap: 12px;
        }

        .btn-cancel,
        .btn-confirm {
          flex: 1;
          height: 48px;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          outline: none;
          font-family: inherit;
          min-height: 48px;
          position: relative;
          overflow: hidden;
        }

        .btn-cancel {
          background: #f7fafc;
          color: #4a5568;
          border: 1.5px solid #e2e8f0;
        }

        .btn-cancel:hover {
          background: #edf2f7;
          border-color: #cbd5e0;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .btn-cancel:active {
          transform: translateY(0);
        }

        .btn-confirm {
          background: linear-gradient(135deg, #e53e3e, #c53030);
          color: white;
          border: 1.5px solid transparent;
          box-shadow: 
            0 4px 14px rgba(229, 62, 62, 0.4),
            0 2px 6px rgba(229, 62, 62, 0.2);
        }

        .btn-confirm:hover {
          background: linear-gradient(135deg, #c53030, #9c2626);
          transform: translateY(-1px);
          box-shadow: 
            0 6px 20px rgba(229, 62, 62, 0.5),
            0 3px 8px rgba(229, 62, 62, 0.3);
        }

        .btn-confirm:active {
          transform: translateY(0);
        }

        .btn-text {
          font-size: 0.9rem;
          line-height: 1;
          font-weight: 600;
        }

        /* ===== CLOSE BUTTON ===== */
        .logout-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border: none;
          background: #f7fafc;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #718096;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .logout-close:hover {
          background: #edf2f7;
          color: #4a5568;
          transform: scale(1.05);
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
            transform: translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 8px 25px rgba(255, 107, 107, 0.4),
              0 4px 12px rgba(255, 107, 107, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 
              0 12px 35px rgba(255, 107, 107, 0.5),
              0 6px 16px rgba(255, 107, 107, 0.4);
          }
        }

        /* ===== MOBILE RESPONSIVE ===== */
        @media (max-width: 480px) {
          .logout-modal-backdrop {
            padding: 12px;
          }
          
          .logout-modal {
            padding: 24px 20px 20px 20px;
            max-width: calc(100vw - 24px);
            border-radius: 18px;
          }

          .logout-title {
            font-size: 1.25rem;
          }

          .logout-subtitle {
            font-size: 0.85rem;
          }

          .logout-icon-circle {
            width: 54px;
            height: 54px;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }

          .user-name {
            font-size: 0.95rem;
          }

          .user-role {
            font-size: 0.75rem;
          }

          .btn-cancel,
          .btn-confirm {
            height: 44px;
            font-size: 0.85rem;
            border-radius: 12px;
          }

          .btn-text {
            font-size: 0.85rem;
          }

          .logout-actions {
            gap: 10px;
          }

          .logout-close {
            width: 28px;
            height: 28px;
            top: 12px;
            right: 12px;
          }
        }

        /* ===== EXTRA SMALL MOBILE ===== */
        @media (max-width: 360px) {
          .logout-modal {
            padding: 20px 16px 18px 16px;
            max-width: calc(100vw - 16px);
          }

          .logout-actions {
            flex-direction: column;
            gap: 8px;
          }

          .btn-cancel,
          .btn-confirm {
            width: 100%;
            height: 46px;
          }

          .logout-modal-header {
            margin-bottom: 18px;
          }

          .logout-user-info {
            margin-bottom: 20px;
          }
        }

        /* ===== LANDSCAPE MOBILE ===== */
        @media (max-height: 600px) and (orientation: landscape) {
          .logout-modal {
            max-height: 90vh;
            overflow-y: auto;
          }

          .logout-icon-circle {
            width: 48px;
            height: 48px;
          }

          .logout-modal-header {
            margin-bottom: 16px;
          }

          .logout-user-info {
            margin-bottom: 18px;
          }
        }

        /* ===== HIGH DPI SCREENS ===== */
        @media (-webkit-min-device-pixel-ratio: 2) {
          .logout-modal {
            border: 0.5px solid rgba(255, 255, 255, 0.9);
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
          
          .btn-cancel:hover,
          .btn-confirm:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

export default LogoutModal;