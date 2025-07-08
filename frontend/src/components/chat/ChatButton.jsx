import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ChatModal from './ChatModal';
import './ChatButton.css';

const ChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // จำนวนข้อความยังไม่อ่าน
  const { user } = useContext(AuthContext);

  const handleChatToggle = () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนใช้งานแชท');
      return;
    }
    setIsChatOpen(!isChatOpen);
    
    // รีเซ็ตจำนวนข้อความยังไม่อ่านเมื่อเปิดแชท
    if (!isChatOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <>
      {/* ปุ่มแชทลอยขวาล่าง */}
      <div className="chat-button-container">
        <button 
          className={`chat-button ${isChatOpen ? 'active' : ''}`}
          onClick={handleChatToggle}
          title="แชทกับทีมสนับสนุน"
        >
          <div className="chat-icon">
            💬
          </div>
          
          {/* Badge จำนวนข้อความยังไม่อ่าน */}
          {unreadCount > 0 && (
            <div className="chat-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          
          {/* สถานะออนไลน์ */}
          <div className="chat-status online"></div>
        </button>

        {/* ข้อความแนะนำ */}
        {!isChatOpen && (
          <div className="chat-tooltip">
            💬 แชทกับทีมสนับสนุน
            <div className="tooltip-arrow"></div>
          </div>
        )}
      </div>

      {/* Modal แชท */}
      {isChatOpen && (
        <ChatModal 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          setUnreadCount={setUnreadCount}
        />
      )}
    </>
  );
};

export default ChatButton;