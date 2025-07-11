// 🔥 AdminChatTab.jsx - FIXED: Real-time Messages + Better UI

import React, { useState, useEffect, useRef } from 'react';
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
  
  // 🆕 Global Messages State - เก็บข้อความทุกห้อง
  const [allRoomMessages, setAllRoomMessages] = useState(new Map());
  
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      console.log('🎯 Admin component mounted, connecting to chat...');
      // 🔥 Auto-connect เมื่อเข้าหน้า
      connectToAdminChat();
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
      console.log('🔌 Admin connecting to chat system...', user);

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
    setAllRoomMessages(new Map());
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
        console.log(`📊 Updating chat rooms (direct array): ${data.length} rooms`);
        setActiveChatRooms(data);
        updateStats(data);
      }
    });

    // 🔥 FIXED: New message received - รับข้อความทันทีทุกห้อง!
    chatSocket.onNewMessage((messageData) => {
      console.log('📩 🔥 Admin received new message:', messageData);
      
      const newMessage = {
        id: messageData._id || `${Date.now()}_${Math.random()}`,
        message: messageData.message,
        senderType: messageData.senderType,
        senderName: messageData.senderName,
        timestamp: new Date(messageData.createdAt || Date.now()),
        chatRoomId: messageData.chatRoomId
      };

      // 🔥 CRITICAL FIX: เก็บข้อความในทุกห้อง
      setAllRoomMessages(prev => {
        const newMap = new Map(prev);
        const roomId = messageData.chatRoomId;
        const existingMessages = newMap.get(roomId) || [];
        
        // ตรวจสอบ duplicate
        const isDuplicate = existingMessages.some(msg => 
          msg.id === newMessage.id || 
          (msg.message === newMessage.message && 
           msg.senderType === newMessage.senderType &&
           Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 2000)
        );
        
        if (!isDuplicate) {
          newMap.set(roomId, [...existingMessages, newMessage]);
          console.log(`✅ Added message to room ${roomId}:`, newMessage.message);
        }
        
        return newMap;
      });

      // 🔥 FIXED: อัปเดตข้อความในห้องที่เปิดอยู่ทันที
      if (selectedChatRoom && messageData.chatRoomId === selectedChatRoom._id) {
        setChatMessages(prev => {
          const isDuplicate = prev.some(msg => 
            msg.id === newMessage.id || 
            (msg.message === newMessage.message && 
             msg.senderType === newMessage.senderType &&
             Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 2000)
          );
          
          if (!isDuplicate) {
            console.log('🔥 Adding message to current chat window:', newMessage);
            return [...prev, newMessage];
          }
          return prev;
        });
      }

      // 🔔 อัปเดต chat rooms list แสดงข้อความล่าสุด
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

      console.log('💬 🔥 New message processed successfully - Real-time!');
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

    // 📦 Room messages (when joining a specific room)
    chatSocket.onRoomMessages((data) => {
      console.log('📦 Room messages loaded:', data);
      if (data.messages && Array.isArray(data.messages)) {
        const messages = data.messages.map((msg, index) => ({
          id: msg._id || `room_msg_${index}_${Date.now()}`,
          message: msg.message,
          senderType: msg.senderType,
          senderName: msg.senderName,
          timestamp: new Date(msg.createdAt || msg.timestamp),
          chatRoomId: data.roomId
        }));
        
        // 🔥 เก็บข้อความในทุกห้อง
        if (data.roomId) {
          setAllRoomMessages(prev => {
            const newMap = new Map(prev);
            newMap.set(data.roomId, messages);
            return newMap;
          });
        }
        
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

    // ⌨️ Typing indicators
    chatSocket.onUserTyping((data) => {
      if (data.userType === 'customer' && selectedChatRoom && data.roomId === selectedChatRoom._id) {
        setTypingUsers(prev => new Set([...prev, data.userId]));
        
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
      if (data.userType === 'customer') {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    console.log('✅ 🔥 Admin event listeners setup complete - Fixed Real-time!');
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
    
    setSelectedChatRoom(chatRoom);
    
    // 🔥 FIXED: ใช้ข้อความที่เก็บไว้แล้ว หรือโหลดใหม่
    const existingMessages = allRoomMessages.get(chatRoom._id) || [];
    setChatMessages(existingMessages);
    
    // Join the specific chat room เพื่อดึงข้อความเก่า
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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatRoom || !connected) {
      console.log('⚠️ Cannot send message');
      return;
    }

    console.log('📤 Admin sending message:', newMessage);

    const messageId = `admin_${Date.now()}_${Math.random()}`;
    const messageText = newMessage.trim();

    // 🔥 เพิ่มข้อความของ Admin ทันที (Optimistic UI)
    const adminMessage = {
      id: messageId,
      message: messageText,
      senderType: 'admin',
      senderName: user.firstName || user.username,
      timestamp: new Date(),
      sending: true,
      chatRoomId: selectedChatRoom._id
    };
    
    // เพิ่มข้อความทันทีใน UI
    setChatMessages(prev => [...prev, adminMessage]);
    
    // 🔥 เก็บใน allRoomMessages ด้วย
    setAllRoomMessages(prev => {
      const newMap = new Map(prev);
      const roomId = selectedChatRoom._id;
      const existingMessages = newMap.get(roomId) || [];
      newMap.set(roomId, [...existingMessages, adminMessage]);
      return newMap;
    });
    
    setNewMessage('');

    // Send via Socket.IO
    const success = chatSocket.sendMessage(selectedChatRoom._id, messageText);
    
    if (success) {
      setTimeout(() => {
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, sending: false, sent: true }
              : msg
          )
        );
        
        // Update allRoomMessages ด้วย
        setAllRoomMessages(prev => {
          const newMap = new Map(prev);
          const roomId = selectedChatRoom._id;
          const messages = newMap.get(roomId) || [];
          newMap.set(roomId, messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, sending: false, sent: true }
              : msg
          ));
          return newMap;
        });
      }, 300);
      
      console.log('✅ Admin message sent successfully');
    } else {
      console.error('❌ Failed to send admin message');
      setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
      setNewMessage(messageText);
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

  // 🔥 Get unread count from allRoomMessages
  const getUnreadCount = (roomId) => {
    const roomMessages = allRoomMessages.get(roomId) || [];
    return roomMessages.filter(msg => 
      msg.senderType === 'customer' && !msg.isRead
    ).length;
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
              🟢 เชื่อมต่อแล้ว • Live Updates
            </div>
          )}
        </div>
        
        {/* 🎨 Stats Cards */}
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

      {/* 🎨 Control Panel */}
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

      {/* 🎨 Chat Content */}
      <div className="chat-content-improved">
        {/* 🔥 IMPROVED Chat List - ดูสวยขึ้น! */}
        <div className="chat-list-improved">
          <div className="chat-list-header-improved">
            <div className="header-content">
              <h3>🔥 Active Chats</h3>
              <span className="chat-count-badge">{activeChatRooms.length}</span>
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

            {activeChatRooms.map(chatRoom => {
              const unreadCount = getUnreadCount(chatRoom._id) || chatRoom.unreadCount || 0;
              
              return (
                <div 
                  key={chatRoom._id} 
                  className={`chat-item-improved ${selectedChatRoom?._id === chatRoom._id ? 'selected' : ''}`}
                  onClick={() => handleChatSelect(chatRoom)}
                >
                  <div className="chat-avatar">
                    <div className="avatar-circle">
                      {chatRoom.customerName?.charAt(0)?.toUpperCase() || '?'}
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
                      {unreadCount > 0 && (
                        <span className="unread-badge">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🎨 Chat Window */}
        <div className="chat-window-improved">
          {selectedChatRoom ? (
            <div className="selected-chat-improved">
              {/* Chat Header */}
              <div className="chat-window-header-improved">
                <div className="selected-customer">
                  <div className="customer-avatar-large">
                    {selectedChatRoom.customerName?.charAt(0)?.toUpperCase() || '?'}
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
              
              {/* 🔥 Messages Area - Real-time! */}
              <div className="chat-messages-container">
                {chatMessages.length === 0 ? (
                  <div className="no-messages">
                    <div className="no-messages-icon">💬</div>
                    <p>ยังไม่มีข้อความในห้องแชทนี้</p>
                    <p className="no-messages-subtitle">
                      ข้อความจะปรากฏที่นี่เมื่อมีการสนทนา
                    </p>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`message-bubble ${message.senderType} ${message.sending ? 'sending' : ''}`}
                      >
                        {message.senderType === 'customer' && (
                          <div className="message-avatar customer">
                            {selectedChatRoom.customerName?.charAt(0)?.toUpperCase() || '👤'}
                          </div>
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
                            {message.senderType === 'admin' && (
                              <span className="message-status">
                                {message.sending && ' ⏳'}
                                {message.sent && ' ✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {typingUsers.size > 0 && (
                      <div className="typing-indicator">
                        <div className="message-avatar customer">⌨️</div>
                        <div className="typing-bubble">
                          <span className="typing-text">กำลังพิมพ์</span>
                          <span className="typing-dots">
                            <span>.</span><span>.</span><span>.</span>
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
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
                  🟢 ระบบแชทพร้อมใช้งาน - Real-time Updates!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatTab;