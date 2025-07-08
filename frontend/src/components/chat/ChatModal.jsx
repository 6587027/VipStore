import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './ChatModal.css';

const ChatModal = ({ isOpen, onClose, setUnreadCount }) => {
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // TODO: ส่งข้อความผ่าน Socket.IO
    console.log('Send message:', message);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        {/* Header */}
        <div className="chat-modal-header">
          <div className="chat-header-info">
            <h3>💬 แชทกับทีมสนับสนุน</h3>
            <span className="support-status">🟢 ทีมสนับสนุนออนไลน์</span>
          </div>
          <button className="close-chat-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="chat-messages-area">
          <div className="welcome-message">
            <div className="system-message">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <p><strong>ระบบ VipStore</strong></p>
                <p>สวัสดีค่ะ {user?.firstName || user?.username}! ยินดีต้อนรับสู่ระบบแชท</p>
                <p>ทีมงานพร้อมช่วยเหลือคุณ 24/7 🎯</p>
                <small>เมื่อสักครู่</small>
              </div>
            </div>
          </div>

          {/* Chat System Ready Message */}
          <div className="development-notice">
            <div className="notice-icon">🚧</div>
            <p><strong>ระบบแชทพร้อมสำหรับการพัฒนา</strong></p>
            <small>Socket.IO และ Real-time messaging จะถูกเพิ่มในขั้นตอนต่อไป</small>
          </div>
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="typing-indicator">
            {/* TODO: แสดงเมื่อมีคนกำลังพิมพ์ */}
          </div>
          
          <div className="message-input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="พิมพ์ข้อความของคุณ..."
              className="chat-message-input"
            />
            <button 
              className="send-message-btn"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              📤
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="chat-modal-footer">
          <small>💡 กดปุ่ม Enter เพื่อส่งข้อความ | Shift+Enter เพื่อขึ้นบรรทัดใหม่</small>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;