// 🔥 แทนที่ AdminChatTab.jsx ทั้งไฟล์ด้วยโค้ดนี้

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { socketManager, chatSocket, socketUtils } from '../../services/socketClient';
import './AdminChatTab.css';

const AdminChatTab = () => {
  const [activeChatRooms, setActiveChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatStats, setChatStats] = useState({
    total: 0,
    active: 0,
    waiting: 0,
    resolved: 0
  });
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  const { user } = useAuth();

  // 🚀 Connect to admin chat on component mount
  useEffect(() => {
    if (user && user.role === 'admin') {
      connectToAdminChat();
    }
    
    return () => {
      // Cleanup on unmount
      if (connected) {
        socketManager.disconnect();
      }
    };
  }, [user]);

  const connectToAdminChat = async () => {
    try {
      setLoading(true);
      console.log('🔌 Admin connecting to chat system...', user);

      // Connect to Socket.IO as admin
      await socketManager.connect({
        userId: user._id || user.id,
        userType: 'admin',
        userName: user.firstName || user.username,
        userEmail: user.email
      });

      // Setup admin event listeners
      setupAdminEventListeners();
      
      // Join admin dashboard
      chatSocket.joinAdminDashboard({
        userId: user._id || user.id,
        userType: 'admin',
        userName: user.firstName || user.username,
        userEmail: user.email
      });

      setConnected(true);
      console.log('✅ Admin chat connected successfully');

    } catch (error) {
      console.error('❌ Admin chat connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupAdminEventListeners = () => {
    // 📋 Chat rooms updated
    chatSocket.onChatRoomsUpdated((data) => {
      console.log('📋 Chat rooms updated:', data);
      if (data.chatRooms) {
        setActiveChatRooms(data.chatRooms);
        updateStats(data.chatRooms);
      }
    });

    // 📩 New message received
    chatSocket.onNewMessage((messageData) => {
      console.log('📩 Admin received new message:', messageData);
      
      // Update messages if this is the selected room
      if (selectedChatRoom && messageData.roomId === selectedChatRoom.roomId) {
        setChatMessages(prev => [...prev, {
          id: messageData.messageId || Date.now(),
          message: messageData.message,
          senderType: messageData.senderType,
          senderName: messageData.senderName,
          timestamp: new Date(messageData.timestamp || Date.now())
        }]);
      }

      // Update chat rooms list
      setActiveChatRooms(prev => prev.map(room => 
        room.roomId === messageData.roomId 
          ? { 
              ...room, 
              lastMessage: messageData.message,
              lastMessageTime: new Date(messageData.timestamp),
              unreadCount: room.unreadCount + (messageData.senderType === 'customer' ? 1 : 0)
            }
          : room
      ));
    });

    // 👥 Customer online/offline
    chatSocket.onCustomerOnline((data) => {
      console.log('👥 Customer online:', data);
      setActiveChatRooms(prev => prev.map(room => 
        room.customerId === data.userId 
          ? { ...room, isOnline: true }
          : room
      ));
    });

    chatSocket.onCustomerOffline((data) => {
      console.log('👥 Customer offline:', data);
      setActiveChatRooms(prev => prev.map(room => 
        room.customerId === data.userId 
          ? { ...room, isOnline: false }
          : room
      ));
    });

    // ⌨️ Typing indicators
    chatSocket.onUserTyping((data) => {
      if (data.userType === 'customer' && selectedChatRoom && data.roomId === selectedChatRoom.roomId) {
        setTypingUsers(prev => new Set([...prev, data.userId]));
      }
    });

    chatSocket.onUserStopTyping((data) => {
      if (data.userType === 'customer') {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    // 📦 Room messages (when joining a specific room)
    chatSocket.onRoomMessages((data) => {
      console.log('📦 Room messages loaded:', data);
      if (data.messages) {
        setChatMessages(data.messages.map(msg => ({
          id: msg._id || msg.messageId,
          message: msg.message,
          senderType: msg.senderType,
          senderName: msg.senderName,
          timestamp: new Date(msg.timestamp)
        })));
      }
    });

    // ✅ Join success
    chatSocket.onJoinSuccess((data) => {
      console.log('✅ Admin joined successfully:', data);
      if (data.chatRooms) {
        setActiveChatRooms(data.chatRooms);
        updateStats(data.chatRooms);
      }
    });
  };

  const updateStats = (chatRooms) => {
    const stats = {
      total: chatRooms.length,
      active: chatRooms.filter(room => room.status === 'active').length,
      waiting: chatRooms.filter(room => room.status === 'waiting').length,
      resolved: chatRooms.filter(room => room.status === 'resolved').length
    };
    setChatStats(stats);
  };

  const handleChatSelect = (chatRoom) => {
    console.log('🎯 Selecting chat room:', chatRoom);
    setSelectedChatRoom(chatRoom);
    setChatMessages([]); // Clear previous messages
    
    // Join the specific chat room
    if (connected) {
      chatSocket.adminJoinRoom(chatRoom.roomId);
    }
    
    // Mark messages as read
    setActiveChatRooms(prev => prev.map(room => 
      room.roomId === chatRoom.roomId 
        ? { ...room, unreadCount: 0 }
        : room
    ));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatRoom || !connected) {
      return;
    }

    console.log('📤 Admin sending message:', newMessage);

    // Send via Socket.IO
    const success = chatSocket.sendMessage(selectedChatRoom.roomId, newMessage.trim());
    
    if (success) {
      // Add to local messages immediately
      const adminMessage = {
        id: Date.now(),
        message: newMessage.trim(),
        senderType: 'admin',
        senderName: user.firstName || user.username,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, adminMessage]);
      setNewMessage('');
      
      // Update chat room's last message
      setActiveChatRooms(prev => prev.map(room => 
        room.roomId === selectedChatRoom.roomId 
          ? { 
              ...room, 
              lastMessage: newMessage.trim(),
              lastMessageTime: new Date()
            }
          : room
      ));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ชั่วโมงที่แล้ว`;
    return new Date(date).toLocaleDateString('th-TH');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#2ed573';
      case 'waiting': return '#ffa502';
      case 'resolved': return '#747d8c';
      default: return '#747d8c';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'กำลังแชท';
      case 'waiting': return 'รอตอบ';
      case 'resolved': return 'เสร็จสิ้น';
      default: return 'ไม่ทราบ';
    }
  };

  if (loading) {
    return (
      <div className="admin-chat-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            🔌 เชื่อมต่อระบบแชท...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat-container">
      {/* หัวข้อและสถิติ */}
      <div className="chat-header">
        <div className="chat-title">
          <h2>💬 Live Chat Management</h2>
          <p>จัดการแชทลูกค้าแบบ Real-time</p>
          {connected && (
            <div style={{
              fontSize: '0.8rem',
              color: '#10b981',
              fontWeight: '600',
              marginTop: '4px'
            }}>
              🟢 เชื่อมต่อแล้ว • Socket ID: {socketManager.getSocket()?.id?.slice(-8) || 'N/A'}
            </div>
          )}
        </div>
        
        <div className="chat-stats">
          <div className="stat-card total">
            <div className="stat-number">{chatStats.total}</div>
            <div className="stat-label">แชททั้งหมด</div>
          </div>
          <div className="stat-card active">
            <div className="stat-number">{chatStats.active}</div>
            <div className="stat-label">กำลังแชท</div>
          </div>
          <div className="stat-card waiting">
            <div className="stat-number">{chatStats.waiting}</div>
            <div className="stat-label">รอตอบ</div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-number">{chatStats.resolved}</div>
            <div className="stat-label">เสร็จสิ้น</div>
          </div>
        </div>
      </div>

      {/* เนื้อหาหลัก */}
      <div className="chat-content">
        {/* รายการแชท */}
        <div className="chat-list">
          <div className="chat-list-header">
            <h3>🔥 Active Chats</h3>
            <button 
              className="refresh-btn" 
              title="รีเฟรช"
              onClick={() => {
                if (connected) {
                  // Request updated chat rooms
                  chatSocket.joinAdminDashboard({
                    userId: user._id || user.id,
                    userType: 'admin',
                    userName: user.firstName || user.username,
                    userEmail: user.email
                  });
                }
              }}
            >
              🔄
            </button>
          </div>
          
          <div className="chat-items">
            {!connected && (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔌</div>
                <p>กำลังเชื่อมต่อระบบแชท...</p>
              </div>
            )}

            {connected && activeChatRooms.length === 0 && (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                <h4 style={{ margin: '0 0 8px', color: '#374151' }}>ไม่มีแชทที่ใช้งาน</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  รอลูกค้าเริ่มการสนทนา
                </p>
              </div>
            )}

            {activeChatRooms.map(chatRoom => (
              <div 
                key={chatRoom.roomId} 
                className={`chat-item ${selectedChatRoom?.roomId === chatRoom.roomId ? 'selected' : ''}`}
                onClick={() => handleChatSelect(chatRoom)}
              >
                <div className="chat-item-avatar">
                  <div className="avatar-circle">
                    {chatRoom.customerName?.charAt(0) || '?'}
                  </div>
                  {chatRoom.isOnline && <div className="online-indicator"></div>}
                </div>
                
                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <span className="customer-name">{chatRoom.customerName || 'ลูกค้า'}</span>
                    <span className="chat-time">{formatTime(chatRoom.lastMessageTime)}</span>
                  </div>
                  
                  <div className="chat-item-message">
                    {chatRoom.lastMessage || 'ยังไม่มีข้อความ'}
                  </div>
                  
                  <div className="chat-item-footer">
                    <span 
                      className="chat-status"
                      style={{ color: getStatusColor(chatRoom.status) }}
                    >
                      {getStatusText(chatRoom.status)}
                    </span>
                    {chatRoom.unreadCount > 0 && (
                      <span className="unread-badge">
                        {chatRoom.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* หน้าต่างแชท */}
        <div className="chat-window">
          {selectedChatRoom ? (
            <div className="selected-chat">
              <div className="chat-window-header">
                <div className="selected-customer">
                  <div className="customer-avatar">
                    {selectedChatRoom.customerName?.charAt(0) || '?'}
                  </div>
                  <div className="customer-info">
                    <h4>{selectedChatRoom.customerName || 'ลูกค้า'}</h4>
                    <p>{selectedChatRoom.customerEmail || 'ไม่ระบุอีเมล'}</p>
                    <span className="customer-status">
                      {selectedChatRoom.isOnline ? '🟢 ออนไลน์' : '🔴 ออฟไลน์'}
                    </span>
                  </div>
                </div>
                
                <div className="chat-actions">
                  <button className="action-btn" title="ดูประวัติ">📋</button>
                  <button className="action-btn" title="ปิดแชท">✖️</button>
                </div>
              </div>
              
              <div className="chat-messages" style={{
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                minHeight: '300px',
                maxHeight: '400px'
              }}>
                {chatMessages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    padding: '40px 20px'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
                    <p>ยังไม่มีข้อความในห้องแชทนี้</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: message.senderType === 'admin' ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-end',
                        gap: '8px'
                      }}
                    >
                      {message.senderType === 'customer' && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          color: 'white',
                          flexShrink: 0
                        }}>
                          👤
                        </div>
                      )}
                      
                      <div style={{
                        maxWidth: '70%',
                        background: message.senderType === 'admin' 
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : '#f1f5f9',
                        color: message.senderType === 'admin' ? 'white' : '#1f2937',
                        padding: '12px 16px',
                        borderRadius: message.senderType === 'admin' 
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                        wordBreak: 'break-word'
                      }}>
                        <div style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                          {message.message}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          opacity: 0.8,
                          marginTop: '4px',
                          textAlign: message.senderType === 'admin' ? 'right' : 'left'
                        }}>
                          {new Date(message.timestamp).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      color: 'white'
                    }}>
                      👤
                    </div>
                    <div style={{
                      background: '#f1f5f9',
                      padding: '12px 16px',
                      borderRadius: '18px 18px 18px 4px',
                      fontSize: '0.9rem',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>
                      กำลังพิมพ์... <span style={{ animation: 'blink 1s infinite' }}>●</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="chat-input-area">
                <input 
                  type="text" 
                  placeholder="พิมพ์ข้อความถึงลูกค้า..."
                  className="message-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!connected}
                />
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!connected || !newMessage.trim()}
                  style={{
                    opacity: (!connected || !newMessage.trim()) ? 0.5 : 1,
                    cursor: (!connected || !newMessage.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  📤
                </button>
              </div>
            </div>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>เลือกแชทเพื่อเริ่มการสนทนา</h3>
              <p>คลิกที่รายการแชทด้านซ้ายเพื่อดูรายละเอียด</p>
              {connected && (
                <div style={{
                  marginTop: '16px',
                  fontSize: '0.8rem',
                  color: '#10b981',
                  fontWeight: '600'
                }}>
                  🟢 ระบบแชทพร้อมใช้งาน
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AdminChatTab;