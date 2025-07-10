// 🔥 AdminChatTab.jsx - Improved UI/UX Version

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
  
  // Manual Control States
  const [isOnline, setIsOnline] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();

  // Previous functions remain the same...
  useEffect(() => {
    if (user && user.role === 'admin') {
      console.log('🎯 Admin component mounted, connecting to chat...');
    }
    
    return () => {
      if (connected) {
        console.log('🧹 Admin component unmounting, cleaning up...');
        socketManager.disconnect();
        setIsOnline(false);
      }
    };
  }, [user]);

  const connectToAdminChat = async () => {
    try {
      setLoading(true);
      console.log('🔌 Admin manually connecting to chat system...', user);

      await socketManager.connect({
        userId: user._id || user.id,
        userType: 'admin',
        userName: user.firstName || user.username,
        userEmail: user.email
      });

      setupAdminEventListeners();
      
      chatSocket.joinAdminDashboard({
        userId: user._id || user.id,
        userType: 'admin',
        userName: user.firstName || user.username,
        userEmail: user.email
      });

      setConnected(true);
      setIsOnline(true);
      console.log('✅ Admin chat connected successfully');

    } catch (error) {
      console.error('❌ Admin chat connection failed:', error);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromChat = () => {
    console.log('📴 Admin manually disconnecting from chat...');
    socketManager.disconnect();
    setConnected(false);
    setIsOnline(false);
    setActiveChatRooms([]);
    setChatMessages([]);
    setSelectedChatRoom(null);
  };

  const manualRefreshChatRooms = async () => {
    if (!connected) {
      console.log('⚠️ Not connected, cannot refresh');
      return;
    }

    try {
      setRefreshing(true);
      console.log('🔄 Manual refresh requested by admin...');
      
      chatSocket.joinAdminDashboard({
        userId: user._id || user.id,
        userType: 'admin',
        userName: user.firstName || user.username,
        userEmail: user.email
      });

      setLastRefresh(new Date());
      
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);

    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      setRefreshing(false);
    }
  };

 const setupAdminEventListeners = () => {
  console.log('🎧 Setting up admin event listeners...');
  
  // 📋 Chat rooms updated
  chatSocket.onChatRoomsUpdated((data) => {
    console.log('📋 Chat rooms updated received:', data);
    
    if (data && data.chatRooms) {
      console.log(`📊 Updating chat rooms: ${data.chatRooms.length} rooms`);
      setActiveChatRooms(data.chatRooms);
      updateStats(data.chatRooms);
    } else if (data && Array.isArray(data)) {
      // ถ้า data เป็น array โดยตรง
      console.log(`📊 Updating chat rooms (direct array): ${data.length} rooms`);
      setActiveChatRooms(data);
      updateStats(data);
    } else {
      console.log('⚠️ No chatRooms in data:', data);
    }
  });

  // 📩 New message received - แก้ไขการจัดการข้อความ
  chatSocket.onNewMessage((messageData) => {
    console.log('📩 Admin received new message:', messageData);
    
    // ✅ อัปเดตข้อความทันทีถ้าเป็นห้องที่กำลังดูอยู่
    if (selectedChatRoom && messageData.chatRoomId === selectedChatRoom._id) {
      setChatMessages(prev => {
        // ตรวจสอบว่ามีข้อความนี้แล้วหรือไม่ (ป้องกัน duplicate)
        const existingMessage = prev.find(msg => 
          msg.id === messageData._id || 
          (msg.message === messageData.message && 
           msg.senderType === messageData.senderType &&
           Math.abs(new Date(msg.timestamp) - new Date(messageData.createdAt || Date.now())) < 2000)
        );
        
        if (existingMessage) {
          console.log('⚠️ Duplicate message detected, ignoring...');
          return prev;
        }

        // เพิ่มข้อความใหม่
        const newMessage = {
          id: messageData._id || `${Date.now()}_${Math.random()}`,
          message: messageData.message,
          senderType: messageData.senderType,
          senderName: messageData.senderName,
          timestamp: new Date(messageData.createdAt || Date.now())
        };

        console.log('✅ Adding new message to chat:', newMessage);
        return [...prev, newMessage];
      });
    }

    // 🔔 อัปเดต chat rooms list
    setActiveChatRooms(prev => prev.map(room => {
      if (room._id === messageData.chatRoomId) {
        return { 
          ...room, 
          lastMessage: messageData.message,
          lastMessageTime: new Date(messageData.createdAt || Date.now()),
          unreadCount: messageData.senderType === 'customer' ? (room.unreadCount || 0) + 1 : room.unreadCount
        };
      }
      return room;
    }));

    console.log('💬 New message processed successfully');
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

  // 📦 Room messages (when joining a specific room) - แก้ไข
  chatSocket.onRoomMessages((data) => {
    console.log('📦 Room messages loaded:', data);
    if (data.messages && Array.isArray(data.messages)) {
      const messages = data.messages.map((msg, index) => ({
        id: msg._id || `room_msg_${index}_${Date.now()}`,
        message: msg.message,
        senderType: msg.senderType,
        senderName: msg.senderName,
        timestamp: new Date(msg.createdAt || msg.timestamp)
      }));
      setChatMessages(messages);
      console.log(`✅ Loaded ${messages.length} room messages`);
    }
  });

  // ✅ Join success
  chatSocket.onJoinSuccess((data) => {
    console.log('✅ Admin joined successfully:', data);
    if (data.chatRooms && Array.isArray(data.chatRooms)) {
      setActiveChatRooms(data.chatRooms);
      updateStats(data.chatRooms);
    }
  });

  // ⌨️ Typing indicators - แก้ไข
  chatSocket.onUserTyping((data) => {
    console.log('⌨️ User typing:', data);
    if (data.userType === 'customer' && selectedChatRoom && data.roomId === selectedChatRoom._id) {
      setTypingUsers(prev => new Set([...prev, data.userId]));
      
      // Auto-clear typing after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }, 3000);
    }
  });

  chatSocket.onUserStopTyping((data) => {
    console.log('⌨️ User stop typing:', data);
    if (data.userType === 'customer') {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    }
  });

  console.log('✅ Admin event listeners setup complete');
};

  const updateStats = (chatRooms) => {
    const stats = {
      total: chatRooms.length,
      active: chatRooms.filter(room => room.status === 'active').length,
      waiting: chatRooms.filter(room => room.status === 'waiting').length,
      resolved: chatRooms.filter(room => room.status === 'resolved').length
    };
    setChatStats(stats);
    console.log('📊 Stats updated:', stats);
  };

 const handleChatSelect = (chatRoom) => {
  console.log('🎯 Selecting chat room:', chatRoom);
  
  // ตั้งค่า selected room
  setSelectedChatRoom(chatRoom);
  setChatMessages([]); // Clear previous messages
  
  // Join the specific chat room
  if (connected) {
    console.log(`🚪 Admin joining room: ${chatRoom._id}`);
    chatSocket.adminJoinRoom(chatRoom._id);
  }
  
  // Mark messages as read และ reset unread count
  setActiveChatRooms(prev => prev.map(room => 
    room._id === chatRoom._id 
      ? { ...room, unreadCount: 0 }
      : room
  ));
  
  console.log(`✅ Selected chat room: ${chatRoom.customerName}`);
};

// 🆕 เพิ่มฟังก์ชัน scroll to bottom เมื่อมีข้อความใหม่
useEffect(() => {
  // Scroll to bottom เมื่อมีข้อความใหม่
  const messagesContainer = document.querySelector('.chat-messages-improved');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}, [chatMessages]);

// 🆕 เพิ่มฟังก์ชัน auto-refresh เมื่อเลือกห้องใหม่
useEffect(() => {
  if (selectedChatRoom && connected) {
    console.log('🔄 Auto-refreshing messages for selected room');
    // รอ 500ms แล้วขอข้อความใหม่
    setTimeout(() => {
      if (connected && selectedChatRoom) {
        chatSocket.adminJoinRoom(selectedChatRoom._id);
      }
    }, 500);
  }
}, [selectedChatRoom?._id, connected]);


  const handleSendMessage = () => {
  if (!newMessage.trim() || !selectedChatRoom || !connected) {
    console.log('⚠️ Cannot send message:', {
      hasMessage: !!newMessage.trim(),
      connected,
      hasRoom: !!selectedChatRoom
    });
    return;
  }

  console.log('📤 Admin sending message:', newMessage);

  // 🆕 สร้าง message ID เฉพาะ
  const messageId = `admin_${Date.now()}_${Math.random()}`;
  const messageText = newMessage.trim();

  // 🔥 เพิ่มข้อความของ Admin ทันที (Optimistic UI)
  const adminMessage = {
    id: messageId,
    message: messageText,
    senderType: 'admin',
    senderName: user.firstName || user.username,
    timestamp: new Date(),
    sending: true // แสดงสถานะกำลังส่ง
  };
  
  // เพิ่มข้อความทันทีใน UI
  setChatMessages(prev => [...prev, adminMessage]);
  
  // เคลียร์ input ทันที
  setNewMessage('');

  // Send via Socket.IO
  const success = chatSocket.sendMessage(selectedChatRoom._id, messageText);
  
  if (success) {
    // 🆕 อัปเดตสถานะข้อความเป็นส่งแล้ว
    setTimeout(() => {
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, sending: false, sent: true }
            : msg
        )
      );
    }, 300);
    
    console.log('✅ Admin message sent successfully');
  } else {
    // ถ้าส่งไม่สำเร็จ ลบข้อความออก
    console.error('❌ Failed to send admin message');
    setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
    setNewMessage(messageText); // คืนข้อความใน input
  }
};

const renderMessage = (message) => (
  <div
    key={message.id}
    style={{
      display: 'flex',
      justifyContent: message.senderType === 'admin' ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end',
      gap: '8px',
      opacity: message.sending ? 0.7 : 1, // แสดงสถานะกำลังส่ง
      transition: 'opacity 0.3s ease'
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
      wordBreak: 'break-word',
      border: message.sending ? '2px dashed rgba(255,255,255,0.5)' : 'none'
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
        {message.senderType === 'admin' && (
          <>
            {message.sending && ' ⏳'}
            {message.sent && ' ✓'}
          </>
        )}
      </div>
    </div>
  </div>
);

// ✅ แก้ไขส่วน JSX ใน chat messages area
const chatMessagesJSX = (
  <div className="chat-messages-improved" style={{
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: '#fafafa',
    maxHeight: '400px'
  }}>
    {chatMessages.length === 0 ? (
      <div className="no-messages">
        <div className="no-messages-icon">💬</div>
        <p>ยังไม่มีข้อความในห้องแชทนี้</p>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '8px' }}>
          ข้อความจะปรากฏที่นี่เมื่อมีการสนทนา
        </p>
      </div>
    ) : (
      <>
        {chatMessages.map((message) => renderMessage(message))}
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            <div className="message-avatar customer">👤</div>
            <div className="typing-bubble">
              กำลังพิมพ์... <span className="typing-dots">●</span>
            </div>
          </div>
        )}
      </>
    )}
  </div>
);

// 🔧 Debug Info ที่มีประโยชน์
const debugInfo = connected && selectedChatRoom && (
  <div style={{
    padding: '12px',
    background: '#f0f8ff',
    borderRadius: '8px',
    border: '1px solid #3b82f6',
    fontSize: '0.8rem',
    color: '#1e40af',
    marginTop: '16px'
  }}>
    🔧 Debug: Socket ID: {socketManager.getSocket()?.id?.slice(-8) || 'N/A'} | 
    Room: {selectedChatRoom._id?.slice(-8) || 'N/A'} | 
    Messages: {chatMessages.length} | 
    Typing: {typingUsers.size} users
  </div>
);

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
      case 'active': return '#10b981';
      case 'waiting': return '#f59e0b';
      case 'resolved': return '#6b7280';
      default: return '#6b7280';
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
      <div className="admin-chat-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>🔌 เชื่อมต่อระบบแชท...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat-container">
      {/* 🎨 Improved Header */}
      <div className="chat-header-improved">
        <div className="header-left">
          <div className="header-title">
            <h2>💬 Live Chat Management</h2>
            <p>จัดการแชทลูกค้าแบบ Real-time</p>
          </div>
          
          {connected && (
            <div className="connection-badge">
              🟢 เชื่อมต่อแล้ว • {socketManager.getSocket()?.id?.slice(-8) || 'N/A'}
            </div>
          )}
        </div>
        
        {/* 🎨 Improved Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{chatStats.total}</div>
              <div className="stat-label">ทั้งหมด</div>
            </div>
          </div>
          
          <div className="stat-card stat-active">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-number">{chatStats.active}</div>
              <div className="stat-label">กำลังแชท</div>
            </div>
          </div>
          
          <div className="stat-card stat-waiting">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{chatStats.waiting}</div>
              <div className="stat-label">รอตอบ</div>
            </div>
          </div>
          
          <div className="stat-card stat-resolved">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{chatStats.resolved}</div>
              <div className="stat-label">เสร็จสิ้น</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎨 Improved Control Panel */}
      <div className="control-panel-improved">
        <div className="control-left">
          <div className={`admin-status ${isOnline ? 'online' : 'offline'}`}>
            <div className="status-dot"></div>
            <span className="status-text">
              Admin {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {lastRefresh && (
            <div className="last-refresh">
              รีเฟรชล่าสุด: {lastRefresh.toLocaleTimeString('th-TH')}
            </div>
          )}
        </div>

        <div className="control-buttons">
          <button
            onClick={manualRefreshChatRooms}
            disabled={!connected || refreshing}
            className={`control-btn refresh-btn ${(!connected || refreshing) ? 'disabled' : ''}`}
          >
            {refreshing ? (
              <>
                <div className="btn-spinner"></div>
                กำลังรีเฟรช...
              </>
            ) : (
              <>🔄 รีเฟรชแชท</>
            )}
          </button>

          {isOnline ? (
            <button
              onClick={disconnectFromChat}
              className="control-btn disconnect-btn"
            >
              📴 ปิดระบบแชท
            </button>
          ) : (
            <button
              onClick={connectToAdminChat}
              disabled={loading}
              className={`control-btn connect-btn ${loading ? 'disabled' : ''}`}
            >
              {loading ? '⏳ กำลังเชื่อมต่อ...' : '🔌 เปิดระบบแชท'}
            </button>
          )}
        </div>
      </div>

      {/* 🎨 Improved Chat Content */}
      <div className="chat-content-improved">
        {/* 🎨 Improved Chat List */}
        <div className="chat-list-improved">
          <div className="chat-list-header-improved">
            <div className="header-content">
              <h3>🔥 Active Chats</h3>
              <span className="manual-badge">Manual Control</span>
            </div>
          </div>
          
          <div className="chat-items-improved">
            {!connected && (
              <div className="empty-state">
                <div className="empty-icon">📴</div>
                <h4>ระบบแชทปิดอยู่</h4>
                <p>กดปุ่ม "เปิดระบบแชท" เพื่อเริ่มใช้งาน</p>
              </div>
            )}

            {connected && activeChatRooms.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h4>ไม่มีแชทที่ใช้งาน</h4>
                <p>รอลูกค้าเริ่มการสนทนา หรือกดรีเฟรชเพื่ออัปเดต</p>
              </div>
            )}

            {activeChatRooms.map(chatRoom => (
              <div 
                key={chatRoom._id} 
                className={`chat-item-improved ${selectedChatRoom?._id === chatRoom._id ? 'selected' : ''}`}
                onClick={() => handleChatSelect(chatRoom)}
              >
                <div className="chat-avatar">
                  <div className="avatar-circle">
                    {chatRoom.customerName?.charAt(0) || '?'}
                  </div>
                  {chatRoom.isOnline && <div className="online-dot"></div>}
                </div>
                
                <div className="chat-content">
                  <div className="chat-header">
                    <span className="customer-name">
                      {chatRoom.customerName || 'ลูกค้า'}
                    </span>
                    <span className="chat-time">
                      {formatTime(chatRoom.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div className="chat-message">
                    {chatRoom.lastMessage || 'ยังไม่มีข้อความ'}
                  </div>
                  
                  <div className="chat-footer">
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

        {/* 🎨 Improved Chat Window */}
        <div className="chat-window-improved">
          {selectedChatRoom ? (
            <div className="selected-chat-improved">
              {/* Chat Header */}
              <div className="chat-window-header-improved">
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
              
              {/* Messages Area */}
              <div className="chat-messages-improved">
                {chatMessages.length === 0 ? (
                  <div className="no-messages">
                    <div className="no-messages-icon">💬</div>
                    <p>ยังไม่มีข้อความในห้องแชทนี้</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-bubble ${message.senderType}`}
                    >
                      {message.senderType === 'customer' && (
                        <div className="message-avatar customer">👤</div>
                      )}
                      
                      <div className="message-content">
                        <div className="message-text">
                          {message.message}
                        </div>
                        <div className="message-time">
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
                  <div className="typing-indicator">
                    <div className="message-avatar customer">👤</div>
                    <div className="typing-bubble">
                      กำลังพิมพ์... <span className="typing-dots">●</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input Area */}
              <div className="chat-input-improved">
                <input 
                  type="text" 
                  placeholder="พิมพ์ข้อความถึงลูกค้า..."
                  className="message-input-improved"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!connected}
                />
                <button 
                  className="send-btn-improved"
                  onClick={handleSendMessage}
                  disabled={!connected || !newMessage.trim()}
                >
                  📤
                </button>
              </div>
            </div>
          ) : (
            <div className="no-chat-selected-improved">
              <div className="no-chat-icon">💬</div>
              <h3>เลือกแชทเพื่อเริ่มการสนทนา</h3>
              <p>คลิกที่รายการแชทด้านซ้ายเพื่อดูรายละเอียด</p>
              {connected && (
                <div className="connected-status">
                  🟢 ระบบแชทพร้อมใช้งาน
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add improved CSS */}
      <style jsx>{`
        .admin-chat-container {
          background: #f8fafc;
          min-height: 100vh;
          padding: 24px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* 🎨 Improved Header */
        .chat-header-improved {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
        }

        .header-left {
          flex: 1;
        }

        .header-title h2 {
          margin: 0 0 8px;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .header-title p {
          margin: 0;
          color: #6b7280;
          font-size: 1rem;
        }

        .connection-badge {
          display: inline-block;
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #166534;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 12px;
          border: 1px solid #10b981;
        }

        /* 🎨 Improved Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          min-width: 400px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 2px solid;
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-total {
          border-color: #e5e7eb;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        }

        .stat-active {
          border-color: #10b981;
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        }

        .stat-waiting {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        }

        .stat-resolved {
          border-color: #6b7280;
          background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        /* 🎨 Improved Control Panel */
        .control-panel-improved {
          background: white;
          border-radius: 12px;
          padding: 16px 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .control-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .admin-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .admin-status.online {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #10b981;
        }

        .admin-status.offline {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #ef4444;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .admin-status.online .status-dot {
          background: #10b981;
          animation: pulse 2s infinite;
        }

        .admin-status.offline .status-dot {
          background: #ef4444;
        }

        .last-refresh {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .control-buttons {
          display: flex;
          gap: 12px;
        }

        .control-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .control-btn:hover:not(.disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .refresh-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .connect-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .disconnect-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .control-btn.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* 🎨 Improved Chat Content */
        .chat-content-improved {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 24px;
          height: 600px;
        }

        /* 🎨 Improved Chat List */
        .chat-list-improved {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .chat-list-header-improved {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .manual-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .chat-items-improved {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .empty-state h4 {
          margin: 0 0 8px;
          color: #374151;
          font-size: 1.1rem;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }

        .chat-item-improved {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 4px;
          border: 2px solid transparent;
        }

        .chat-item-improved:hover {
          background: #f8fafc;
          border-color: #e5e7eb;
        }

        .chat-item-improved.selected {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
        }

        .chat-avatar {
          position: relative;
        }

        .avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .online-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .chat-content {
          flex: 1;
          min-width: 0;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .customer-name {
          font-weight: 700;
          color: #1f2937;
          font-size: 0.95rem;
        }

        .chat-time {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .chat-message {
          color: #4b5563;
          font-size: 0.85rem;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .chat-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-status {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .unread-badge {
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        /* 🎨 Improved Chat Window */
        .chat-window-improved {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .selected-chat-improved {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .chat-window-header-improved {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .selected-customer {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .customer-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .customer-info h4 {
          margin: 0 0 4px;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
        }

        .customer-info p {
          margin: 0 0 4px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .customer-status {
          font-size: 0.8rem;
          font-weight: 600;
          color: #10b981;
        }

        .chat-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .chat-messages-improved {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #fafafa;
        }

        .no-messages {
          text-align: center;
          color: #6b7280;
          padding: 60px 20px;
        }

        .no-messages-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .no-messages p {
          margin: 0;
          font-size: 1rem;
        }

        .message-bubble {
          display: flex;
          align-items: flex-end;
          gap: 12px;
        }

        .message-bubble.admin {
          justify-content: flex-end;
        }

        .message-bubble.customer {
          justify-content: flex-start;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          color: white;
          flex-shrink: 0;
        }

        .message-avatar.customer {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }

        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          word-break: break-word;
        }

        .message-bubble.admin .message-content {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-bubble.customer .message-content {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
        }

        .message-text {
          font-size: 0.95rem;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .message-time {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .message-bubble.admin .message-time {
          text-align: right;
        }

        .typing-indicator {
          display: flex;
          align-items: flex-end;
          gap: 12px;
        }

        .typing-bubble {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 12px 16px;
          border-radius: 18px 18px 18px 4px;
          font-size: 0.9rem;
          color: #6b7280;
          font-style: italic;
        }

        .typing-dots {
          animation: blink 1s infinite;
        }

        .chat-input-improved {
          padding: 20px 24px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .message-input-improved {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 24px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .message-input-improved:focus {
          border-color: #10b981;
        }

        .message-input-improved:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .send-btn-improved {
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn-improved:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .send-btn-improved:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .no-chat-selected-improved {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6b7280;
          text-align: center;
          padding: 40px;
        }

        .no-chat-icon {
          font-size: 4rem;
          margin-bottom: 24px;
          color: #d1d5db;
        }

        .no-chat-selected-improved h3 {
          margin: 0 0 12px;
          font-size: 1.3rem;
          color: #374151;
        }

        .no-chat-selected-improved p {
          margin: 0 0 20px;
          font-size: 1rem;
        }

        .connected-status {
          font-size: 0.85rem;
          color: #10b981;
          font-weight: 600;
        }

        /* Loading */
        .admin-chat-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 400px;
        }

        .loading-content {
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        .loading-content p {
          color: #6b7280;
          font-size: 1rem;
          margin: 0;
        }

        /* Animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .chat-content-improved {
            grid-template-columns: 350px 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            min-width: 300px;
          }
        }

        @media (max-width: 768px) {
          .admin-chat-container {
            padding: 16px;
          }
          
          .chat-header-improved {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }
          
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
            min-width: unset;
          }
          
          .chat-content-improved {
            grid-template-columns: 1fr;
            height: auto;
          }
          
          .control-panel-improved {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }
          
          .control-buttons {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminChatTab;