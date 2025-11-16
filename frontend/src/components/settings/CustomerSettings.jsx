// frontend/src/components/settings/CustomerSettings.jsx - เพิ่ม Order History จาก UserProfileModal
import React, { useState, useEffect , useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, ordersAPI } from '../../services/api';
import PaymentModal from '../payment/PaymentModal'; 
import { socketManager, chatSocket, socketUtils } from '../../services/socketClient';

import { 
  User, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  ShoppingCart, 
  Shield, 
  MessageCircle,
  Settings,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  Save,
  Edit,
  Trash2,
  Plus,
  Lock,
  RefreshCcw,
  Home,
  MapPinIcon,
  HistoryIcon,
  Pen,
  Globe,
  Loader,
  Loader2,
  Loader2Icon,
  Trash,
  Phone,
  Mail,
  Camera,
  User2,
  BoxIcon,
  BoxSelectIcon,
  BoxesIcon,
  Package,
  Calendar,
  ListIcon,
  ReceiptCentIcon,
  ReceiptIcon,
  Receipt,
  RotateCcwIcon,
  ChevronUp,
  ChevronDown,
  Link,
  Unlink,
  Unlink2,
  UserCheck2Icon,
  SendHorizonalIcon,
  Key,
  KeyIcon,
  KeyRoundIcon,
  X,
  Eye,
  
  
} from 'lucide-react';
import { ChatBubbleBottomCenterIcon, ListBulletIcon } from '@heroicons/react/16/solid';


// ✅ Use Environment Variable or Fallback to Production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';

const CustomerSettings = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('menu'); // menu, profile, addresses, orders, security
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [addressProfiles, setAddressProfiles] = useState([]);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showManageProfiles, setShowManageProfiles] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderData, setPaymentOrderData] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

// เพิ่ม States เหล่านี้ (ใส่ร่วมกับ States เดิม)
const [chatConnected, setChatConnected] = useState(false);
const [connectionStatus, setConnectionStatus] = useState('disconnected');
const [chatMessages, setChatMessages] = useState([]);
const [chatMessage, setChatMessage] = useState('');
const [chatRoomId, setChatRoomId] = useState(null);
const [adminTyping, setAdminTyping] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);
const [lastRefresh, setLastRefresh] = useState(null);
const messagesEndRef = useRef(null); 
const scrollContainerRef = useRef(null);


// ( Password Change States)
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [passwordError, setPasswordError] = useState('');
const [passwordSuccess, setPasswordSuccess] = useState('');
const [passwordLoading, setPasswordLoading] = useState(false);


// 🔧 เพิ่ม States สำหรับแก้ Bug
const [isTyping, setIsTyping] = useState(false); // 🆕 ป้องกัน typing spam
const [typingTimeout, setTypingTimeout] = useState(null); // 🆕 Timeout control
const [eventListenersSetup, setEventListenersSetup] = useState(false); // 🆕 ป้องกัน listener ซ้อน


  const [paymentMethods, setPaymentMethods] = useState([
  {
    id: 'pm_1',
    type: 'credit_card',
    name: 'Visa ending in 1234',
    last4: '1234',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
    isActive: false // เป็น placeholder
  },
  {
    id: 'pm_2',
    type: 'bank_transfer',
    name: 'ธนาคารกสิกรไทย',
    accountNumber: '***-*-*4567',
    isDefault: false,
    isActive: false // เป็น placeholder
  }
]);
const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');

// 🆕 เพิ่มฟังก์ชันนี้ก่อน return statement
const scrollToBottomManual = () => {
  // console.log('🔽 === MANUAL SCROLL TRIGGERED ===');
  
  try {
    // วิธีที่ 1: หาด้วย parent ของปุ่ม
    const scrollButton = document.querySelector('[title="ไปยังข้อความล่าสุด"]');
    if (scrollButton && scrollButton.parentElement) {
      const chatArea = scrollButton.parentElement;
      console.log('✅ Found chat area via button parent');
      
      chatArea.scrollTop = chatArea.scrollHeight;
      console.log(`📜 Scrolled to: ${chatArea.scrollTop}/${chatArea.scrollHeight}`);
      return;
    }
    
    // วิธีที่ 2: หาทุก div ที่มี scroll
    const allDivs = document.querySelectorAll('div');
    for (let div of allDivs) {
      // ถ้ามี scrollHeight > clientHeight และ มี gap: 16px (เป็น messages container)
      const style = div.getAttribute('style') || '';
      if (div.scrollHeight > div.clientHeight && 
          style.includes('gap: 16px') && 
          style.includes('flexDirection: column')) {
        
        console.log('✅ Found scrollable chat area');
        div.scrollTop = div.scrollHeight;
        console.log(`📜 Scrolled to bottom: ${div.scrollTop}`);
        return;
      }
    }
    
    console.log('❌ No chat area found');
    
  } catch (error) {
    console.error('❌ Scroll error:', error);
  }
};

const scrollToBottom = () => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
};

// 🔌 Connect to Chat - แก้ไข Version
const connectToChat = async () => {
  try {
    setConnectionStatus('connecting');
    console.log('🔌 Customer connecting to chat...', user);

    // ตรวจสอบว่าเชื่อมต่ออยู่แล้วหรือไม่
    if (socketManager.isConnected() && chatConnected) {
      console.log('✅ Already connected, skipping...');
      setConnectionStatus('connected');
      return;
    }

    // Disconnect old connection first
    if (socketManager.isConnected()) {
      console.log('🔄 Disconnecting old connection...');
      socketManager.disconnect();
      setEventListenersSetup(false);
    }

    // Connect to Socket.IO
    await socketManager.connect({
      userId: user._id || user.id,
      userType: 'customer',
      userName: user.firstName || user.username,
      userEmail: user.email,
      role: 'customer'
    });

    // Setup event listeners only once
    if (!eventListenersSetup) {
      setupChatEventListeners();
      setEventListenersSetup(true);
    }

    // Join customer chat
    chatSocket.joinCustomerChat({
      userId: user._id || user.id,
      userType: 'customer',
      userName: user.firstName || user.username,
      userEmail: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      customerEmail: user.email
    });

    setChatConnected(true);
    setConnectionStatus('connected');
    console.log('✅ Customer chat connected successfully');

  } catch (error) {
    console.error('❌ Customer chat connection failed:', error);
    setConnectionStatus('disconnected');
    setChatConnected(false);
  }
};

// 📴 Disconnect from Chat - แก้ไข Version
const disconnectChat = () => {
  console.log('📴 Customer disconnecting from chat...');
  
  // Clear typing timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    setTypingTimeout(null);
  }
  
  // Disconnect socket
  socketManager.disconnect();
  
  // Reset all states
  setChatConnected(false);
  setConnectionStatus('disconnected');
  setChatMessages([]);
  setChatRoomId(null);
  setUnreadCount(0);
  setIsTyping(false);
  setEventListenersSetup(false);
  
  console.log('✅ Chat disconnected and states reset');
};

// 🎧 Setup Event Listeners 
const setupChatEventListeners = () => {
  console.log('🎧 Customer setting up chat event listeners...');

  // ตรวจสอบว่าเคยตั้งค่าแล้วหรือไม่
  if (eventListenersSetup) {
    console.log('⚠️ Event listeners already setup, skipping...');
    return;
  }

  // ✅ Join success - แก้ไขให้โหลดประวัติ
  chatSocket.onJoinSuccess((data) => {
    console.log('✅ Customer joined successfully:', data);
    if (data.roomId) {
      setChatRoomId(data.roomId);
      console.log('🏠 Customer room ID set:', data.roomId);
      
      // 🆕 โหลดประวัติข้อความทันทีหลัง join success!
      console.log('📦 Loading chat history for customer...');
      // Admin จะส่งประวัติข้อความมาให้ผ่าน room_messages event
    }
  });

  // 📦 Room messages (ประวัติข้อความ) - แก้ไขให้ใช้งานได้
  chatSocket.onRoomMessages((data) => {
    console.log('📦 Customer received room messages:', data);
    if (data.messages && Array.isArray(data.messages)) {
      const messages = data.messages.map((msg, index) => ({
        id: msg._id || `history_${index}_${Date.now()}`,
        message: msg.message,
        senderType: msg.senderType,
        senderName: msg.senderName,
        timestamp: new Date(msg.createdAt || msg.timestamp),
        isRead: msg.isRead || (msg.senderType === 'customer') // Customer ข้อความถือว่าอ่านแล้ว
      }));
      
      // 📋 ตั้งค่าประวัติข้อความ
      setChatMessages(messages);
      
      // 🔔 นับข้อความที่ยังไม่ได้อ่านจาก Admin
      const unreadFromAdmin = messages.filter(msg => 
        msg.senderType === 'admin' && !msg.isRead
      ).length;
      setUnreadCount(unreadFromAdmin);
      
      console.log(`✅ Loaded ${messages.length} chat history messages, ${unreadFromAdmin} unread from admin`);
    }
  });

  // 📩 New message received 
  chatSocket.onNewMessage((messageData) => {
    console.log('📩 Customer received new message:', messageData);
    
    // ป้องกัน duplicate messages
    setChatMessages(prev => {
      const existingMessage = prev.find(msg => 
        msg.id === messageData._id || 
        (msg.message === messageData.message && 
         msg.senderType === messageData.senderType &&
         Math.abs(new Date(msg.timestamp) - new Date(messageData.createdAt || Date.now())) < 1000)
      );
      
      if (existingMessage) {
        console.log('⚠️ Duplicate message detected, ignoring...');
        return prev;
      }

      const newMessage = {
        id: messageData._id || `${Date.now()}_${Math.random()}`,
        message: messageData.message,
        senderType: messageData.senderType,
        senderName: messageData.senderName,
        timestamp: new Date(messageData.createdAt || Date.now()),
        isRead: false
      };
      return [...prev, newMessage];
    });
    
    // เพิ่ม unread count ถ้าเป็นข้อความจาก admin
    if (messageData.senderType === 'admin') {
      setUnreadCount(prev => prev + 1);
      console.log('🔔 New message from admin, unread count increased');
    }
  });

  // ❌ Join error - เหมือนเดิม
  chatSocket.onJoinError((data) => {
    console.error('❌ Customer join error:', data);
    setConnectionStatus('disconnected');
    setChatConnected(false);
  });

  // ⌨️ Admin typing - เหมือนเดิม
  chatSocket.onUserTyping((data) => {
    if (data.userType === 'admin') {
      setAdminTyping(true);
      setTimeout(() => setAdminTyping(false), 3000);
    }
  });

  chatSocket.onUserStopTyping((data) => {
    if (data.userType === 'admin') {
      setAdminTyping(false);
    }
  });

  console.log('✅ Customer event listeners setup complete with history loading');
};

// 📤 Send Message - แก้ไข Version (ป้องกัน duplication)
const sendMessage = () => {
  if (!chatMessage.trim() || !chatConnected || !chatRoomId) {
    console.log('⚠️ Cannot send message:', {
      hasMessage: !!chatMessage.trim(),
      connected: chatConnected,
      roomId: chatRoomId
    });
    return;
  }

  console.log('📤 Customer sending message:', chatMessage);

  // สร้าง unique message ID
  const messageId = `customer_${Date.now()}_${Math.random()}`;
  const messageText = chatMessage.trim();

  // เพิ่มข้อความของตัวเองทันที (Optimistic UI)
  const myMessage = {
    id: messageId,
    message: messageText,
    senderType: 'customer',
    senderName: user.firstName || user.username,
    timestamp: new Date(),
    isRead: false,
    sending: true // 🆕 แสดงสถานะกำลังส่ง
  };
  
  setChatMessages(prev => [...prev, myMessage]);
  setChatMessage(''); 
  
  // Send via Socket.IO
  const success = chatSocket.sendMessage(chatRoomId, messageText);
  
  if (success) {
    // อัปเดตสถานะข้อความเป็นส่งแล้ว
    setTimeout(() => {
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, sending: false, sent: true }
            : msg
        )
      );
    }, 500);
    
    // รีเซ็ต unread count เมื่อส่งข้อความ
    setUnreadCount(0);
    
    // หยุด typing indicator
    if (isTyping) {
      chatSocket.stopTyping(chatRoomId);
      setIsTyping(false);
    }
  } else {
    // ถ้าส่งไม่สำเร็จ ลบข้อความออก
    setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
    setChatMessage(messageText); // คืนข้อความใน input
  }
};

// ⌨️ Handle Typing - แก้ไข Version (ป้องกัน spam)
const handleTyping = (value) => {
  setChatMessage(value);
  
  if (!chatConnected || !chatRoomId) return;
  
  // ถ้ามีข้อความและยังไม่ได้ส่ง typing
  if (value.trim() && !isTyping) {
    setIsTyping(true);  
    chatSocket.startTyping(chatRoomId);
    console.log('⌨️ Started typing indicator');
  }
  
  // Clear previous timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  
  // Set new timeout
  const timeout = setTimeout(() => {
    if (isTyping) {
      setIsTyping(false);
      chatSocket.stopTyping(chatRoomId);
      console.log('⌨️ Stopped typing indicator (timeout)');
    }
  }, 1000); // หยุด typing หลัง 1 วินาที
  
  setTypingTimeout(timeout);    
  
  // ถ้าไม่มีข้อความแล้ว หยุด typing ทันที
  if (!value.trim() && isTyping) {
    setIsTyping(false);
    chatSocket.stopTyping(chatRoomId);
    console.log('⌨️ Stopped typing indicator (empty)');
  }
};

// 🔄 Manual Refresh Chat - แก้ไขให้โหลดประวัติใหม่
const refreshChat = async () => {
  if (!chatConnected) {
    console.log('⚠️ Not connected, cannot refresh');
    return;
  }

  try {
    console.log('🔄 Manual refresh requested by customer...');
    
    // 🆕 เคลียร์ข้อความเก่าก่อนโหลดใหม่
    setChatMessages([]);
    setUnreadCount(0);
    
    // Join ใหม่เพื่อโหลดประวัติใหม่
    chatSocket.joinCustomerChat({
      userId: user._id || user.id,
      userType: 'customer',
      userName: user.firstName || user.username,
      userEmail: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      customerEmail: user.email
    });

    setLastRefresh(new Date());
    console.log('✅ Chat refreshed successfully - history will reload automatically');

  } catch (error) {
    console.error('❌ Manual refresh failed:', error);
  }
};


useEffect(() => {
    if (!isOpen) {
      return;
    }
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

// 🧹 Cleanup useEffect - แก้ไข Version
useEffect(() => {
  return () => {
    // Cleanup เมื่อออกจากหน้า
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (chatConnected) {
      // หยุด typing ก่อน disconnect
      if (isTyping && chatRoomId) {
        chatSocket.stopTyping(chatRoomId);
      }
      
      disconnectChat();
    }
  };
}, []); 

// 🆕 Reset unread count เมื่อดูหน้าแชท
useEffect(() => {
  if (activeSection === 'chat' && unreadCount > 0) {
    setUnreadCount(0);
  }
}, [activeSection]);


useEffect(() => {
  if (activeSection !== 'menu' && activeSection !== 'chat') {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        console.log(`Scrolling main container to top for section: ${activeSection}`);
        scrollContainerRef.current.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto' 
        });
      }
    }, 0); 

  }
}, [activeSection]);


useEffect(() => {
  // ถ้าอยู่ในหน้าแชท และมีข้อความ
  if (activeSection === 'chat' && chatMessages.length > 0) {
    // ใช้ setTimeout เล็กน้อยเพื่อให้ DOM อัปเดตก่อน
    setTimeout(scrollToBottom, 100);
  }
}, [chatMessages, activeSection]);

// 🆕 [AUTO-CONNECT] เชื่อมต่อและตัดการเชื่อมต่ออัตโนมัติเมื่อเข้า/ออกจากหน้าแชท
useEffect(() => {
  // 1. ถ้าคลิกเข้ามาที่หน้าแชท
  if (activeSection === 'chat') {
    console.log('Chat section opened, auto-connecting...');
    
    // ถ้ายังไม่ได้เชื่อมต่อ ก็เชื่อมต่อเลย
    if (!chatConnected && connectionStatus !== 'connecting') {
      connectToChat();
    }
    
    // 2. คืนค่าฟังก์ชันนี้ (cleanup function)
    // จะทำงานเมื่อ "ออกจาก" หน้าแชท
    return () => {
      // ถ้าเชื่อมต่ออยู่ ก็ให้ตัดการเชื่อมต่อ
      if (socketManager.isConnected()) {
        console.log('Leaving chat section, auto-disconnecting...');
        disconnectChat();
      }
    };
  }
}, [activeSection]);


// 🆕 Enhanced message display with sending status
const renderMessage = (msg) => (
  <div
    key={msg.id}
    style={{
      display: 'flex',
      justifyContent: msg.senderType === 'customer' ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end',
      gap: '8px',
      opacity: msg.sending ? 0.7 : 1 // 🆕 แสดงสถานะกำลังส่ง
    }}
  >
    {msg.senderType === 'admin' && (
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        flexShrink: 0
      }}>
        👨‍💼
      </div>
    )}
    
    <div style={{
      maxWidth: '70%',
      background: msg.senderType === 'customer' 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : '#f1f5f9',
      color: msg.senderType === 'customer' ? 'white' : '#1f2937',
      padding: '12px 16px',
      borderRadius: msg.senderType === 'customer' 
        ? '18px 18px 4px 18px'
        : '18px 18px 18px 4px',
      wordBreak: 'break-word',
      border: msg.senderType === 'admin' && !msg.isRead ? '2px solid #ef4444' : 'none'
    }}>
      <div style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
        {msg.message}
      </div>
      <div style={{
        fontSize: '0.75rem',
        opacity: 0.8,
        marginTop: '4px',
        textAlign: msg.senderType === 'customer' ? 'right' : 'left'
      }}>
        {new Date(msg.timestamp).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        })}
        {msg.senderType === 'customer' && (
          <>
            {msg.sending && ' ⏳'}
            {msg.sent && ' ✓'}
            {msg.isRead && ' ✓✓'}
          </>
        )}
      </div>
    </div>
  </div>
);

// (reset password handlers (user initiated))
const handleCompletePasswordChange = async (e, approvedRequest) => {
  e.preventDefault();
  setPasswordError('');
  setPasswordSuccess('');

  if (newPassword.length < 6) {
    setPasswordError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    return;
  }
  if (newPassword !== confirmPassword) {
    setPasswordError('รหัสผ่านและการยืนยันไม่ตรงกัน');
    return;
  }

  setPasswordLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/auth/complete-password-change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user._id || user.id,
        requestId: approvedRequest.id,
        newPassword: newPassword,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setPasswordSuccess('✅ เปลี่ยนรหัสผ่านสำเร็จ!');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      // รีเฟรชประวัติเพื่อให้ฟอร์มหายไป
      fetchPasswordHistory(); 
    } else {
      setPasswordError(data.message || 'เกิดข้อผิดพลาด ไม่สามารถเปลี่ยนรหัสผ่านได้');
    }
  } catch (err) {
    setPasswordError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
  } finally {
    setPasswordLoading(false);
  }
};

const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// 🆕 New Profile Form State
const [newProfileData, setNewProfileData] = useState({
  profileName: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: {
    street: '',
    district: '',
    province: '',
    postalCode: '',
    notes: ''
  },
  isDefault: false
});

  // 🆕 ProfileSettings States
  const [activeTab, setActiveTab] = useState('profile'); // profile, history, orders
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordRequest, setShowPasswordRequest] = useState(false);
  const [passwordRequestNote, setPasswordRequestNote] = useState('');
  
  // 🆕 Password History State
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 🛒 Order History State (ย้ายมาจาก UserProfileModal 
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

const canRequestRefund = (order) => {
  // ✅ Enhanced Debug logging
  console.log(`🔍 Detailed refund check for ${order.orderNumber}:`, {
    paymentStatus: order.paymentStatus,
    status: order.status,
    refundRequest: order.refundRequest,
    refundRequestType: typeof order.refundRequest,
    refundRequestKeys: order.refundRequest ? Object.keys(order.refundRequest) : 'null',
    hasRefundInfo: !!order.refundInfo,
    refundInfo: order.refundInfo
  });
  
  // ✅ STRICT CONDITIONS - All must be true
  const conditions = {
    isPaid: order.paymentStatus === 'paid',
    notCancelled: order.status !== 'cancelled',
    notRefunded: order.paymentStatus !== 'refunded',
    noRefundRequest: !order.refundRequest || 
                    (typeof order.refundRequest === 'object' && 
                     Object.keys(order.refundRequest).length === 0) ||
                    order.refundRequest === null,
    noRefundInfo: !order.refundInfo || 
                  (typeof order.refundInfo === 'object' && 
                   Object.keys(order.refundInfo).length === 0) ||
                  order.refundInfo === null
  };
  
  // ✅ Log each condition
  console.log(`📋 Refund conditions for ${order.orderNumber}:`, conditions);
  
  // ✅ Final decision
  const canRequest = conditions.isPaid && 
                    conditions.notCancelled && 
                    conditions.notRefunded && 
                    conditions.noRefundRequest && 
                    conditions.noRefundInfo;
  
  console.log(`🎯 Final decision for ${order.orderNumber}: ${canRequest ? 'CAN REQUEST' : 'CANNOT REQUEST'}`);
  
  // ✅ Show reason if cannot request
  if (!canRequest) {
    const reasons = [];
    if (!conditions.isPaid) reasons.push('ยังไม่ได้ชำระเงิน');
    if (!conditions.notCancelled) reasons.push('ออเดอร์ถูกยกเลิก');
    if (!conditions.notRefunded) reasons.push('ได้รับการคืนเงินแล้ว');
    if (!conditions.noRefundRequest) reasons.push('มีคำขอคืนเงินแล้ว');
    if (!conditions.noRefundInfo) reasons.push('มีข้อมูลการคืนเงินแล้ว');
    
    console.log(`❌ Cannot request refund for ${order.orderNumber}:`, reasons.join(', '));
  }
  
  return canRequest;
};

// ✅ เพิ่ม helper function เพื่อแสดงเหตุผลที่ไม่สามารถขอคืนเงินได้
const getRefundNotAvailableReason = (order) => {
  if (order.paymentStatus !== 'paid') {
    return 'ยังไม่ได้ชำระเงิน';
  }
  if (order.status === 'cancelled') {
    return 'ออเดอร์ถูกยกเลิกแล้ว';
  }
  if (order.paymentStatus === 'refunded') {
    return 'ได้รับการคืนเงินแล้ว';
  }
  if (order.refundRequest) {
    return `มีคำขอคืนเงินแล้ว (${order.refundRequest.status})`;
  }
  return 'ไม่สามารถขอคืนเงินได้';
};

// ✅ อัปเดต getRefundRequestStatus function ให้แสดงข้อมูลที่ถูกต้อง
const getRefundRequestStatus = (order) => {
  if (!order.refundRequest) return null;
  
  const status = order.refundRequest.status;
  const statusConfig = {
    pending: { 
      icon: '⏳', 
      text: 'รอการพิจารณาคืนเงิน', // ✅ เปลี่ยนข้อความให้ชัดเจน
      color: '#d97706', 
      bg: '#fef3c7',
      border: '#f59e0b'
    },
    approved: { 
      icon: '✅', 
      text: 'อนุมัติคืนเงินแล้ว', 
      color: '#059669', 
      bg: '#dcfce7',
      border: '#10b981'
    },
    rejected: { 
      icon: '❌', 
      text: 'ปฏิเสธคำขอคืนเงิน', 
      color: '#dc2626', 
      bg: '#fee2e2',
      border: '#ef4444'
    }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <div style={{
      marginTop: '8px',
      padding: '8px 12px',
      background: config.bg,
      borderRadius: '6px',
      fontSize: '0.75rem',
      border: `1px solid ${config.border}`
    }}>
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '2px',
        color: config.color 
      }}>
        {config.icon} {config.text}
      </div>
      
      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
        💰 จำนวนเงิน: {formatPrice(order.refundRequest.requestedAmount || 0)}
      </div>
      
      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
        📝 เหตุผล: {order.refundRequest.reason}
      </div>
      
      {order.refundRequest.requestedAt && (
        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
          📅 วันที่ขอ: {formatDate(order.refundRequest.requestedAt)}
        </div>
      )}
      
      {order.refundRequest.adminNotes && (
        <div style={{ 
          fontSize: '0.7rem', 
          color: '#374151',
          marginTop: '4px',
          fontStyle: 'italic',
          background: 'rgba(255,255,255,0.5)',
          padding: '4px',
          borderRadius: '4px'
        }}>
          💬 หมายเหตุจาก Admin: {order.refundRequest.adminNotes}
        </div>
      )}
    </div>
  );
};

const handleRefundRequest = (order) => {
  setSelectedOrderForRefund(order);
  setRefundAmount(order.pricing?.total?.toString() || '0');
  setShowRefundModal(true);
};

const submitRefundRequest = async () => {
  if (!refundReason.trim()) {
    setError('กรุณาระบุเหตุผลในการขอคืนเงิน');
    return;
  }
  
  setIsSubmittingRefund(true);
  setError(''); // Clear previous errors
  setSuccess(''); // Clear previous success messages
  
  try {
    console.log('💰 Submitting refund request:', {
      orderId: selectedOrderForRefund._id,
      userId: user._id || user.id,
      reason: refundReason,
      requestedAmount: parseFloat(refundAmount)
    });
    
    // ✅ เรียก API
    const response = await ordersAPI.requestRefund(selectedOrderForRefund._id, {
      userId: user._id || user.id,
      reason: refundReason,
      requestedAmount: parseFloat(refundAmount)
    });
    
    console.log('✅ Refund request response:', response);
    
    // ✅ ตรวจสอบ response (API ส่ง response.success หรือ response ตรงๆ)
    const isSuccess = response.success === true || 
                     (response.data && response.data.success === true);
    
    if (isSuccess) {
      // ✅ แสดงข้อความสำเร็จ
      setSuccess('✅ ส่งคำขอคืนเงินเรียบร้อยแล้ว รอการตรวจสอบจาก Admin');
      
      // ✅ ปิด Modal
      setShowRefundModal(false);
      
      // ✅ Clear form data
      setRefundReason('');
      setRefundAmount('');
      setSelectedOrderForRefund(null);
      
      // ✅ รีเฟรชรายการออเดอร์ (สำคัญ!)
      console.log('🔄 Refreshing order history...');
      
      // ✅ เพิ่มการรอสักครู่ก่อนรีเฟรช
      setTimeout(async () => {
        await fetchOrderHistory();
      }, 500);
      
      // ✅ แสดงข้อความสำเร็จ 5 วินาที
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
    } else {
      // ✅ Handle API success but with error message
      const errorMessage = response.message || 
                          (response.data && response.data.message) || 
                          'ไม่สามารถส่งคำขอคืนเงินได้';
      console.log('⚠️ API returned success=false:', errorMessage);
      setError(errorMessage);
    }
    
  } catch (error) {
    console.error('❌ Refund request error:', error);
    
    // ✅ Enhanced error handling
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'เกิดข้อผิดพลาด';
      
      console.log(`❌ HTTP Error ${status}:`, message);
      
      switch (status) {
        case 404:
          setError('ไม่พบออเดอร์นี้ในระบบ');
          break;
        case 400:
          setError(message);
          break;
        case 403:
          setError('ไม่มีสิทธิ์ในการขอคืนเงินสำหรับออเดอร์นี้');
          break;
        case 500:
          setError('เกิดข้อผิดพลาดในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
          break;
        default:
          setError(`เกิดข้อผิดพลาด (${status}): ${message}`);
      }
    } else if (error.message) {
      console.log('❌ Error message:', error.message);
      
      if (error.message.includes('Failed to request refund')) {
        setError('ไม่สามารถส่งคำขอคืนเงินได้ กรุณาลองใหม่อีกครั้ง');
      } else if (error.message.includes('Network Error')) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      } else {
        setError(error.message);
      }
    } else {
      console.log('❌ Unknown error:', error);
      setError('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง');
    }
  } finally {
    setIsSubmittingRefund(false);
  }
};

  // Load user data และ address profiles
  useEffect(() => {
    if (user) {
      loadAddressProfiles();
      setProfilePicture(user.profileImage || null);
      
      // Initialize ProfileSettings form data
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || ''
      });
      
      // Load ProfileSettings data
      fetchPasswordHistory();
      fetchOrderHistory();
    }
  }, [user]);

  // โหลด Address Profiles
  const loadAddressProfiles = async () => {
    try {
      const response = await authAPI.addressProfiles.getAll(user._id || user.id);
      if (response.data.success) {
        setAddressProfiles(response.data.addressProfiles || []);
      }
    } catch (error) {
      console.error('Error loading address profiles:', error);
    }
  };

  // 🆕 Load Password History
  const fetchPasswordHistory = async () => {
    if (!user) return;
    
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user-password-requests/${user._id || user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setPasswordHistory(data.requests || []);
      } else {
        console.error('Failed to fetch password history:', data.message);
      }
    } catch (error) {
      console.error('Error fetching password history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
  if (!user) return;
  
  setOrderLoading(true);
  try {
    console.log('🛒 Fetching orders for user:', user._id || user.id);
    const response = await ordersAPI.getMyOrders(user._id || user.id);
    
    if (response.data.success) {
      console.log('✅ Orders fetched:', response.data.orders.length);
      
      // ✅ Debug แต่ละ order
      response.data.orders.forEach(order => {
        console.log(`📦 Order ${order.orderNumber}:`, {
          status: order.status,
          paymentStatus: order.paymentStatus,
          hasRefundRequest: !!order.refundRequest,
          refundRequestStatus: order.refundRequest?.status,
          hasRefundInfo: !!order.refundInfo
        });
      });
      
      setOrderHistory(response.data.orders || []);
    } else {
      console.error('Failed to fetch orders:', response.data.message);
      setOrderHistory([]);
    }
  } catch (error) {
    console.error('Error fetching order history:', error);
    setOrderHistory([]);
  } finally {
    setOrderLoading(false);
  }
};


  // 🚫 ฟังก์ชันยกเลิกการสั่งซื้อ (ย้ายมาจาก UserProfileModal)
  const handleCancelOrder = async (orderId, orderNumber) => {
    const confirmed = window.confirm(
      `❗ ต้องการยกเลิกออเดอร์ ${orderNumber} ใช่หรือไม่?\n\n` +
      `⚠️ การยกเลิกจะไม่สามารถทำใหม่ได้!\n` +
      `💰 สินค้าจะถูกคืนสต็อก และการชำระเงิน (ถ้ามี) จะได้รับการคืนเงิน`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');

      console.log(`🚫 Cancelling order: ${orderNumber} (${orderId})`);

      const response = await ordersAPI.admin.updateStatus(orderId, {
        status: 'cancelled',
        notes: `ยกเลิกโดยลูกค้า: ${user.firstName} ${user.lastName} เมื่อ ${new Date().toLocaleString('th-TH')}`
      });

      if (response.data.success) {
        setSuccess(`✅ ยกเลิกออเดอร์ ${orderNumber} สำเร็จ! สินค้าถูกคืนสต็อกแล้ว`);
        await fetchOrderHistory();
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(response.data.message || 'ไม่สามารถยกเลิกออเดอร์ได้');
      }

    } catch (error) {
      console.error('Cancel order error:', error);
      setError('เกิดข้อผิดพลาดในการยกเลิกออเดอร์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };



  // 💳 ฟังก์ชันชำระเงินใหม่ (ใช้ PaymentModal แทน window.prompt)
const handlePayment = async (orderId, orderNumber, totalAmount) => {
  console.log(`💳 Preparing payment for order: ${orderNumber}`);
  
  // 🆕 เตรียมข้อมูล Order สำหรับ Payment Modal
  const orderForPayment = {
    orderId: orderId,
    orderNumber: orderNumber,
    totalAmount: formatPrice(totalAmount),
    shippingCost: 'รวมแล้ว', // แสดงว่ารวมค่าจัดส่งแล้ว
    finalTotal: formatPrice(totalAmount)
  };

  console.log('💳 Opening Payment Modal with data:', orderForPayment);
  
  // 🆕 เปิด Payment Modal (แทนการใช้ alert)
  setPaymentOrderData(orderForPayment);
  setShowPaymentModal(true);
};

// 4. 🆕 เพิ่ม Payment Success Handler
const handlePaymentSuccess = async (paymentData) => {
  console.log('💳 Payment completed:', paymentData);
  
  try {
    setLoading(true);
    setError('');

    // 🔧 ตรวจสอบว่าเป็นการ "ชำระเงินภายหลัง" หรือไม่
    const isPayLater = paymentData.saveForLater === true || 
                       paymentData.method === 'pay_later' ||
                       paymentData.methodName === 'ชำระเงินภายหลัง';

    console.log('🔍 Payment analysis:', {
      saveForLater: paymentData.saveForLater,
      method: paymentData.method,
      methodName: paymentData.methodName,
      isPayLater: isPayLater
    });

    if (isPayLater) {
      // 📋 กรณีชำระเงินภายหลัง - ไม่ต้องอัพเดตสถานะ
      console.log('📋 Payment saved for later - no status update needed');
      
      setSuccess(`📋 บันทึกคำขอชำระเงินภายหลังสำเร็จ! ออเดอร์ ${paymentOrderData.orderNumber} รอการชำระเงิน`);
      
      // รีเฟรชรายการออเดอร์
      await fetchOrderHistory();
      
      // ปิด Payment Modal
      setShowPaymentModal(false);
      setPaymentOrderData(null);
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      return; // 🚨 สำคัญ: ออกจากฟังก์ชันทันที ไม่ต้องเรียก updateStatus
    }

    // 💳 กรณีชำระเงินจริง - อัพเดตสถานะเป็น confirmed
    console.log('💳 Real payment - updating status to confirmed');
    
    const response = await ordersAPI.admin.updateStatus(
      paymentData.orderId || paymentOrderData.orderId, 
      {
        status: 'confirmed',
        paymentStatus: 'paid',
        notes: `💳 ชำระเงินสำเร็จด้วย ${paymentData.methodName || paymentData.method} เมื่อ ${new Date().toLocaleString('th-TH')} (ผ่าน Payment Modal)`
      }
    );

    if (response.data.success) {
      setSuccess(`🎉 ชำระเงินสำเร็จ! ออเดอร์ ${paymentOrderData.orderNumber} ได้รับการยืนยันแล้ว`);
      
      // รีเฟรชรายการออเดอร์
      await fetchOrderHistory();
      
      // ปิด Payment Modal
      setShowPaymentModal(false);
      setPaymentOrderData(null);
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } else {
      setError('ไม่สามารถอัพเดตสถานะออเดอร์ได้');
    }

  } catch (error) {
    console.error('Payment completion error:', error);
    setError('เกิดข้อผิดพลาดในการยืนยันการชำระเงิน');
  } finally {
    setLoading(false);
  }
};

// 5. 🆕 Payment Close Handler
const handlePaymentClose = () => {
  setShowPaymentModal(false);
  setPaymentOrderData(null);
};


  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.username) {
        setError('กรุณากรอกข้อมูลให้ครบถ้วน');
        setLoading(false);
        return;
      }

      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email)) {
        setError('กรุณาใส่อีเมลที่ถูกต้อง');
        setLoading(false);
        return;
      }

      if (formData.username.length < 3) {
        setError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/users/${user._id || user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          username: formData.username.trim(),
          role: user.role
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ อัปเดตข้อมูลสำเร็จ!');
        
        if (updateUser) {
          updateUser(data.user);
        }

        setTimeout(() => {
          setSuccess('');
        }, 3000);

      } else {
        setError(data.message || 'ไม่สามารถอัปเดตข้อมูลได้');
      }

    } catch (error) {
      console.error('Update profile error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change request
  const handlePasswordRequest = async () => {
    if (!passwordRequestNote.trim()) {
      setError('กรุณาใส่เหตุผลในการเปลี่ยนรหัสผ่าน');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/password-change-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          username: user.username,
          email: user.email,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          reason: passwordRequestNote.trim(),
          requestDate: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ ส่งคำขอเปลี่ยนรหัสผ่านให้ Admin แล้ว จะได้รับการติดต่อกลับเร็วๆ นี้');
        setShowPasswordRequest(false);
        setPasswordRequestNote('');
        setError('');
        
        setTimeout(() => {
          fetchPasswordHistory();
        }, 1000);
      } else {
        setError(data.message || 'ไม่สามารถส่งคำขอได้');
      }

    } catch (error) {
      console.error('Password request error:', error);
      setError('เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setLoading(false);
    }
  };

  // แสดงข้อความแจ้งเตือน
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  

// 🔧 Helper function to get user ID safely
const getUserId = () => {
  if (!user) return null;
  return user.id || user._id || user.userId;
};


// 🔧 Create Address Profile
const createAddressProfile = async () => {
  const userId = getUserId();
  if (!userId) {
    alert('❌ ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    return;
  }

  try {
    // Validation
    if (!newProfileData.profileName.trim()) {
      alert('กรุณาใส่ชื่อโปรไฟล์');
      return;
    }

    if (!newProfileData.firstName.trim() || !newProfileData.lastName.trim()) {
      alert('กรุณาใส่ชื่อและนามสกุล');
      return;
    }

    if (!/^[0-9]{10}$/.test(newProfileData.phone)) {
      alert('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
      return;
    }

    if (!newProfileData.address.street.trim() || !newProfileData.address.district.trim() || 
        !newProfileData.address.province.trim() || !newProfileData.address.postalCode.trim()) {
      alert('กรุณากรอกที่อยู่ให้ครบถ้วน');
      return;
    }

    if (!/^[0-9]{5}$/.test(newProfileData.address.postalCode)) {
      alert('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก');
      return;
    }

    const response = await authAPI.addressProfiles.create(userId, newProfileData);
    
    if (response.data.success) {
      alert('✅ สร้างโปรไฟล์ที่อยู่สำเร็จ!');
      await loadAddressProfiles();
      
      // Reset form and close modal
      setNewProfileData({
        profileName: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: { street: '', district: '', province: '', postalCode: '', notes: '' },
        isDefault: false
      });
      setShowCreateProfile(false);
    }
  } catch (error) {
    console.error('❌ Create profile error:', error);
    alert(`❌ ${error.response?.data?.message || 'ไม่สามารถสร้างโปรไฟล์ได้'}`);
  }
};

// 🔧 Delete Address Profile
const deleteAddressProfile = async (profileId, profileName) => {
  const userId = getUserId();
  if (!userId) {
    alert('❌ ไม่พบข้อมูลผู้ใช้');
    return;
  }

  if (!window.confirm(`ต้องการลบโปรไฟล์ "${profileName}" ใช่หรือไม่?`)) {
    return;
  }

  try {
    const response = await authAPI.addressProfiles.delete(userId, profileId);
    
    if (response.data.success) {
      alert('✅ ลบโปรไฟล์สำเร็จ');
      await loadAddressProfiles();
    }
  } catch (error) {
    console.error('❌ Delete profile error:', error);
    alert(`❌ ${error.response?.data?.message || 'ไม่สามารถลบโปรไฟล์ได้'}`);
  }
};

// 🔧 Set Default Profile
const setDefaultProfile = async (profileId) => {
  const userId = getUserId();
  if (!userId) {
    alert('❌ ไม่พบข้อมูลผู้ใช้');
    return;
  }

  try {
    const response = await authAPI.addressProfiles.setDefault(userId, profileId);
    
    if (response.data.success) {
      await loadAddressProfiles();
      alert('✅ ตั้งเป็นที่อยู่หลักสำเร็จ');
    }
  } catch (error) {
    console.error('❌ Set default error:', error);
    alert(`❌ ${error.response?.data?.message || 'ไม่สามารถตั้งเป็นที่อยู่หลักได้'}`);
  }
};

// Handle form input changes
const handleNewProfileInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  if (name.startsWith('address.')) {
    const addressField = name.split('.')[1];
    setNewProfileData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [addressField]: value
      }
    }));
  } else {
    setNewProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }
};

  // Helper functions (ย้ายมาจาก UserProfileModal)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span style={{
            background: '#fef3c7',
            color: '#d97706',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            ⏳ รอดำเนินการ
          </span>
        );
      case 'approved':
        return (
          <span style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            ✅ อนุมัติแล้ว
          </span>
        );
      case 'rejected':
        return (
          <span style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            ❌ ปฏิเสธ
          </span>
        );
      default:
        return null;
    }
  };

  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: '#fef3c7', color: '#d97706', icon: '⏳', text: 'รอดำเนินการ' },
      confirmed: { bg: '#dbeafe', color: '#1d4ed8', icon: '✅', text: 'ยืนยันแล้ว' },
      processing: { bg: '#e0e7ff', color: '#6366f1', icon: '⚙️', text: 'กำลังเตรียม' },
      shipped: { bg: '#dcfce7', color: '#059669', icon: '🚚', text: 'จัดส่งแล้ว' },
      delivered: { bg: '#dcfce7', color: '#166534', icon: '📦', text: 'สำเร็จ' },
      cancelled: { bg: '#fee2e2', color: '#dc2626', icon: '❌', text: 'ยกเลิก' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span style={{
        background: config.bg,
        color: config.color,
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '0.8rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        minWidth: 'fit-content'
      }}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  // Menu items configuration (อัปเดต orders badge)
  const menuItems = [
    {
      id: 'profile',
      icon: <User className="w-6 h-6"  />,
      title: 'ข้อมูลส่วนตัว',
      description: 'แก้ไขชื่อ, อีเมล, รหัสผ่าน',
      badge: null
    },
    {
      id: 'addresses',
      icon: <MapPin className="w-6 h-6" />,
      title: 'ที่อยู่จัดส่ง',
      description: 'จัดการที่อยู่สำหรับการสั่งซื้อ',
      badge: `${addressProfiles.length}/5`
    },
    {
      id: 'payment',
      icon: <CreditCard className="w-6 h-6" />,
      title: 'วิธีชำระเงิน',
      description: 'บัตรเครดิต, โอนธนาคาร, QR Code',
      badge: '🚧 DEMO'
    },
    {
      id: 'orders',
      icon: <ShoppingCart className="w-6 h-6" />,
      title: 'ประวัติการสั่งซื้อ', 
      description: 'ดูประวัติการสั่งซื้อและติดตามสถานะ',
      badge: orderHistory.length > 0 ? `${orderHistory.length}` : null
    },
    // {
    //   id: 'security',
    //   icon: <Shield className="w-6 h-6" />,
    //   title: 'ความปลอดภัย',
    //   description: 'เปลี่ยนรหัสผ่าน, ประวัติการเข้าสู่ระบบ',
    //   badge: null
    // }

    {
  id: 'chat',
  icon: <MessageCircle className="w-6 h-6" />,
  title: 'Chat With Admin',
  description: 'แชทสอบถามกับทีมสนับสนุน',
  badge: '🟢 Online'
  },
  ];

  
  const renderOrderHistory = () => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: '#374151' }}>
          <ShoppingCart className="w-6 h-6" />   ประวัติการสั่งซื้อ
        </h4>
        <button
          onClick={fetchOrderHistory}
          style={{
            padding: '8px 16px',
            background: '#3d85c6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <RefreshCcw size={16} className="inline-block mr-1" /> รีเฟรช
        </button>
      </div>
      
      {orderLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>กำลังโหลดประวัติการสั่งซื้อ...</p>
        </div>
      ) : orderHistory.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6b7280',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '16px',
          border: '2px dashed #cbd5e1'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#374151' }}>
            ยังไม่มีประวัติการสั่งซื้อ
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '1rem' }}>
            เมื่อคุณสั่งซื้อสินค้า ประวัติจะแสดงที่นี่
          </p>
          <button
            onClick={() => {
              setActiveSection('menu');
              onClose();
            }}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            <ShoppingBag size={16} className="inline-block mr-1" /> เริ่มช้อปปิ้ง
          </button>
        </div>
      ) : (
        <div>
          {/* 📊 สรุปสถิติ */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{orderHistory.length}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>คำสั่งซื้อทั้งหมด</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                  {orderHistory.filter(order => order.status === 'delivered').length}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>สำเร็จแล้ว</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                  {formatPrice(orderHistory.reduce((total, order) => {
                    return order.status !== 'cancelled' ? total + (order.pricing?.total || 0) : total;
                  }, 0))}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>ยอดซื้อสะสม</div>
              </div>
            </div>
          </div>

          {/* 📋 รายการออเดอร์ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orderHistory.map((order, index) => (
              <div key={order._id || index} style={{
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                padding: '20px',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
              >
                {/* Order Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1f2937', marginBottom: '4px' }}>
                      <Package className="inline-block mr-1" /> {order.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>
                      <Calendar size={14} className="inline-block mr-1" /> {formatDate(order.orderDate || order.createdAt)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      <ShoppingCart size={14} className="inline-block mr-1" /> {order.items?.length || 0} รายการ
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    {getOrderStatusBadge(order.status)}
                    <div style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: '700', 
                      color: '#1f2937',
                      marginTop: '8px'
                    }}>
                      {formatPrice(order.pricing?.total || 0)}
                    </div>
                    
                    {/* 💳 ปุ่มชำระเงิน */}
                    {order.paymentStatus === 'pending' && order.status !== 'cancelled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayment(order._id, order.orderNumber, order.pricing?.total || 0);
                        }}
                        disabled={loading}
                        style={{
                          marginTop: '8px',
                          marginRight: '8px',
                          padding: '6px 12px',
                          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          minWidth: '90px',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {loading ? <Loader size={16} className="inline-block mr-1" /> : <CreditCard size={16} className="inline-block mr-1" />} {loading ? 'กำลังประมวลผล...' : 'ชำระเงิน'}
                      </button>
                    )}
                    
                    {/* ✅ แสดงสถานะชำระเงินแล้ว */}
                    {order.paymentStatus === 'paid' && (
                      <div style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#166534',
                        fontWeight: '600',
                        textAlign: 'center',
                        border: '1px solid #10b981'
                      }}>
                        <CheckCircle size={15} className="inline-block mr-1" /> ชำระเงินแล้ว
                      </div>
                    )}
                    
                    {/* 🚫 ปุ่มยกเลิกออเดอร์ */}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(order._id, order.orderNumber);
                        }}
                        disabled={loading}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          minWidth: '90px',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {loading ? <Loader size={16} className="inline-block mr-1" /> : <Trash size={16} className="inline-block mr-1" />} {loading ? 'กำลังยกเลิก...' : 'ยกเลิกออเดอร์'}
                      </button>
                    )}
                    {/* 💰 ปุ่มขอคืนเงิน - เพิ่มหลังปุ่ม Cancel Order */}
                     {(() => {
                            // ✅ Force debug log
                            console.log(`🎯 Rendering decision for ${order.orderNumber}:`, {
                              refundRequest: order.refundRequest,
                              refundRequestExists: !!order.refundRequest && 
                                                  order.refundRequest !== null && 
                                                  typeof order.refundRequest === 'object' && 
                                                  Object.keys(order.refundRequest).length > 0,
                              canRequest: canRequestRefund(order)
                            });

                            // ✅ Check if has REAL refund request (not empty object)
                            const hasRealRefundRequest = order.refundRequest && 
                                                        order.refundRequest !== null && 
                                                        typeof order.refundRequest === 'object' && 
                                                        (order.refundRequest.id || order.refundRequest.status || order.refundRequest.requestedBy);

                            if (hasRealRefundRequest) {
                              console.log(`📋 Showing refund request status for ${order.orderNumber}`);
                              return getRefundRequestStatus(order);
                            }
                            
                            if (canRequestRefund(order)) {
                              console.log(`💰 Showing refund button for ${order.orderNumber}`);
                              return (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRefundRequest(order);
                                  }}
                                  style={{
                                    marginTop: '8px',
                                    padding: '6px 12px',
                                    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    minWidth: '90px',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <ReceiptIcon size={14} className="inline-block mr-1" /> ขอคืนเงิน
                                </button>
                              );
                            }
                            
                            console.log(`🚫 No refund action for ${order.orderNumber}`);
                            return null;
                          })()}

                    {/* แสดงสถานะ Refund Request */}
                    {order.refundRequest && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        fontSize: '0.75rem'
                      }}>
                        <RotateCcwIcon size={14} className="inline-block mr-1" /> สถานะคำขอคืนเงิน: 
                        <span style={{
                          marginLeft: '4px',
                          fontWeight: 'bold',
                          color: order.refundRequest.status === 'pending' ? '#ff9800' :
                                order.refundRequest.status === 'approved' ? '#4caf50' : '#f44336'
                        }}>
                          {order.refundRequest.status === 'pending' && '⏳ รอพิจารณา'}
                          {order.refundRequest.status === 'approved' && '✅ อนุมัติแล้ว'}
                          {order.refundRequest.status === 'rejected' && '❌ ปฏิเสธ'}
                        </span>
                      </div>
                    )}
                    
                    {/* แสดงข้อความสำหรับออเดอร์ที่ไม่สามารถยกเลิกได้ */}
                    {(order.status === 'processing' || order.status === 'shipped') && (
                      <div style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        background: '#f3f4f6',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: '500',
                        textAlign: 'center'
                      }}>
                        ไม่สามารถยกเลิกได้
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items Preview */}
                <div style={{
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#374151', fontWeight: '600', marginBottom: '8px' }}>
                    <ListIcon size={14} className="inline-block mr-1" /> รายการสินค้า:
                  </div>
                  {order.items && order.items.slice(0, 2).map((item, itemIndex) => (
                    <div key={itemIndex} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      <span>• {item.productName} x{item.quantity}</span>
                      <span>{formatPrice(item.subtotal || (item.price * item.quantity))}</span>
                    </div>
                  ))}
                  {order.items && order.items.length > 2 && (
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>
                      และอีก {order.items.length - 2} รายการ...
                    </div>
                  )}
                </div>

                {/* Expandable Details */}
                {selectedOrder === order._id && (
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '16px',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    {/* Customer Info */}
                    <div style={{ marginBottom: '16px' }}>
                      <h5 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                        <MapPin size={15} className="inline-block mr-1" strokeWidth={2.5} /> ข้อมูลการจัดส่ง
                      </h5>
                      <div style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6 }}>
                        <div><strong>{order.customerInfo?.firstName} {order.customerInfo?.lastName}</strong></div>
                        <div><Mail size={14} className="inline-block mr-1" /> {order.customerInfo?.email}</div>
                        <div><Phone size={14} className="inline-block mr-1" /> {order.customerInfo?.phone}</div>
                        <div><Home size={14} className="inline-block mr-1" /> {order.customerInfo?.address?.street}</div>
                        <div><MapPin size={14} className="inline-block mr-1" /> {order.customerInfo?.address?.district} {order.customerInfo?.address?.province} {order.customerInfo?.address?.postalCode}</div>
                      </div>
                    </div>

                    {/* All Items */}
                    <div>
                      <h5 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                        <Package size={14} className="inline-block mr-1" strokeWidth={2.5} /> รายการสินค้าทั้งหมด
                      </h5>
                      {order.items && order.items.map((item, itemIndex) => (
                        <div key={itemIndex} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: itemIndex < order.items.length - 1 ? '1px solid #f1f5f9' : 'none'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#374151' }}>
                              {item.productName}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                              {formatPrice(item.price)} x {item.quantity}
                            </div>
                          </div>
                          <div style={{ fontWeight: '600', color: '#1f2937' }}>
                            {formatPrice(item.subtotal || (item.price * item.quantity))}
                          </div>
                        </div>
                      ))}

                      {/* Price Summary */}
                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#6b7280' }}>ราคาสินค้า:</span>
                          <span style={{ fontWeight: '600' }}>{formatPrice(order.pricing?.subtotal || 0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#6b7280' }}>ค่าจัดส่ง:</span>
                          <span style={{ fontWeight: '600', color: order.pricing?.shipping === 0 ? '#10b981' : '#1f2937' }}>
                            {order.pricing?.shipping === 0 ? 'ฟรี' : formatPrice(order.pricing?.shipping || 0)}
                          </span>
                        </div>
                        <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #d1d5db' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700' }}>
                          <span>รวมทั้งสิ้น:</span>
                          <span style={{ color: '#10b981' }}>{formatPrice(order.pricing?.total || 0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#e0f2fe',
                        borderRadius: '8px',
                        border: '1px solid #0891b2'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>
                          🚚 หมายเลขติดตาม
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0369a1' }}>
                          {order.trackingNumber}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expand/Collapse Indicator */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '12px',
                  color: '#6b7280',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {selectedOrder === order._id ? <><ChevronUp size={16} className="inline-block mr-1" strokeWidth={2} /> คลิกเพื่อซ่อนรายละเอียด</> : <><ChevronDown size={16} className="inline-block mr-1" strokeWidth={2} /> คลิกเพื่อดูรายละเอียด</>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Profile Picture Section
  const renderProfilePictureSection = () => (
    <div style={{
      background: 'linear-gradient(135deg, #059669 0%, #1e40af 100%)',
      padding: '20px', // ✅ [NEW] ปรับ Padding
      // ✅ [NEW] ปรับ borderRadius (ให้ขอบล่างไม่โค้งถ้าเป็น menu)
      borderRadius: activeSection === 'menu' ? '16px 16px 0 0' : '16px', 
      color: 'white',
      marginBottom: activeSection === 'menu' ? '0' : '24px', // ✅ [NEW] ลบ margin-bottom เมื่อเป็นเมนู
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* ✅ [NEW] START: เพิ่ม Header ใหม่ (ปุ่มกลับ + Title) */}
      {/* (เราจะแสดง Header นี้เฉพาะเมื่อ activeSection === 'menu'
         ซึ่งฟังก์ชันนี้จะถูกเรียกเฉพาะตอนนั้นอยู่แล้วจาก renderContent)
      */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
        marginBottom: '16px' // เพิ่มระยะห่างก่อนรูป
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.4)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          <ArrowLeft size={16} />
        </button>

        <h1 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'white',
        }}>
          การตั้งค่า
        </h1>

        {/* ตัวถ่วงน้ำหนักให้ Title อยู่กลาง */}
        <div style={{ width: '44px' }}></div> 
      </div>
      {/* ✅ [NEW] END: เพิ่ม Header ใหม่ */}

      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Profile Picture */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          margin: '0 auto 16px',
          background: profilePicture ? `url(${profilePicture})` : 'rgba(255,255,255,0.2)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '4px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setActiveSection('profile-picture')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = 'none';
        }}
        >
          {!profilePicture && <User size={60} className="inline-block" />}

          {/* Upload Overlay */}

          <div style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '32px',
            height: '32px',
            background: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <Camera size={16} className="inline-block" />
          </div>
        </div>
        
        {/* User Info */}
        <h2 style={{
          margin: '0 0 8px',
          fontSize: '1.4rem',
          fontWeight: '700'
        }}>
          {user?.firstName && user?.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user?.username || 'ผู้ใช้'}
        </h2>
        
        <p style={{
          margin: '0 0 4px',
          fontSize: '0.95rem',
          opacity: 0.9
        }}>
          <Mail size={14} className="inline-block mr-1" color='white' strokeWidth={2.5} /> : {user?.email || 'ไม่ระบุอีเมล'}
        </p>
        
        <p style={{
          margin: 0,
          fontSize: '0.85rem',
          opacity: 0.8
        }}>
          <ShoppingBag size={14} className="inline-block mr-1" strokeWidth={2.5} /> : ลูกค้า VipStore
        </p>
      </div>
    </div>
  );

  
  // Render Menu List (Grid Version)
  const renderMenuList = () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      // ✅ [NEW] สร้างเส้นคั่นบางๆ ระหว่างเมนู
      gap: '1px', 
      backgroundColor: '#e2e8f0', // ✅ [NEW] สีเทาอ่อนสำหรับเส้นคั่น
      // ✅ [NEW] ทำให้ขอบล่างโค้ง (เชื่อมกับ Profile Card)
      borderRadius: '0 0 16px 16px', 
      overflow: 'hidden', // ✅ [NEW] สำคัญมากสำหรับ BordeRadius
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)' // ✅ [NEW] เพิ่มเงาจางๆ
    }}>
      {menuItems.map((item, index) => (
        <div
          key={item.id}
          onClick={() => {
            if (item.id === 'payment') return; // 🚧 กันไว้ก่อน
            setActiveSection(item.id);
            if (item.id === 'orders') {
              setActiveTab('orders');
            } else {
              setActiveTab('profile');
            }
          }}
          style={{
            background: 'white',
            padding: '16px 20px',
            cursor: item.id === 'payment' ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            opacity: item.id === 'payment' ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
          onMouseEnter={(e) => {
            if (item.id !== 'payment') {
              e.currentTarget.style.backgroundColor = '#f8fafc'; // ✅ [NEW] Hover effect
            }
          }}
          onMouseLeave={(e) => {
            if (item.id !== 'payment') {
              e.currentTarget.style.backgroundColor = 'white';
            }
          }}
        >
          {/* 1. ไอคอน และ Text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* ✅ [NEW] ไอคอนแบบ List View */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {React.cloneElement(item.icon, { 
                color: '#475569',
                size: 22
              })}
            </div>
            
            {/* ✅ [NEW] Text Content */}
            <div>
              <h3 style={{
                margin: '0 0 2px',
                fontSize: '1rem', // กระชับขึ้น
                fontWeight: '600', // บางลงเล็กน้อย
                color: '#1f2937'
              }}>
                {item.title}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: '#6b7280',
                lineHeight: 1.4,
                // ✅ [NEW] กันคำอธิบายยาวไป
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {item.description}
              </p>
            </div>
          </div>

          {/* 2. Badge และ ลูกศร */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {item.badge && (
              <span style={{
                // ✅ [NEW] ปรับสี Badge ให้อ่อนลง
                background: item.badge.includes('🚧') 
                  ? '#fef3c7'
                  : (item.badge.includes('Online')
                      ? '#dcfce7'
                      : '#dbeafe'),
                color: item.badge.includes('🚧') 
                  ? '#92400e'
                  : (item.badge.includes('Online')
                      ? '#166534'
                      : '#312e81'),
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                {item.badge}
              </span>
            )}

            {/* 3. ลูกศร (อยู่มุมขวา) */}
            <div style={{
              fontSize: '1.5rem', // ✅ [NEW] ใช้ตัวอักษรนี้แทน icon
              color: '#9ca3af',
              fontWeight: 'bold'
            }}>
              {item.id === 'payment' ? '🔒' : '›'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render Content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            {/* Header (Orders) */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: 'white',
              padding: '16px 20px', 
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              {/* Left Side: Back + Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Back Button */}
                <button
                  onClick={() => setActiveSection('menu')}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  <ArrowLeft size={16} />
                </button>
                
                {/* Title & Subtitle */}
                <div>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <ShoppingCart size={20} />
                    ประวัติการสั่งซื้อ
                  </h2>
                  <p style={{ 
                    margin: '4px 0 0',
                    opacity: 0.9, 
                    fontSize: '0.8rem'
                  }}>
                    ดูประวัติและติดตามสถานะการสั่งซื้อของคุณ
                  </p>
                </div>
              </div>
              
              {/* Right Side (Empty) */}
              <div />
            </div>

            {/* Content */}
            <div style={{ padding: '5px' }}>
              {/* Error/Success Messages */}
              {error && (
                <div style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.9rem'
                }}>
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.9rem'
                }}>
                  {success}
                </div>
              )}

              {renderOrderHistory()}
            </div>
          </div>
        );

      // ✅ เก็บ sections อื่นๆ ไว้เดิม
      case 'profile':
        const approvedRequest = passwordHistory.find(
            req => req.status === 'approved_awaiting_user'
          );
        return (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            {/* 🆕 Replaced Header (Profile) */}
            <div style={{
              background: 'linear-gradient(135deg,#10b981 0%, #059669 100%)',
              color: 'white',
              padding: '16px 20px', 
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              {/* Left Side: Back + Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Back Button */}
                <button
                  onClick={() => setActiveSection('menu')}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  <ArrowLeft size={16} />
                </button>
                
                {/* Title & Subtitle */}
                <div>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <User size={20} />
                    ข้อมูลส่วนตัว
                  </h2>
                  <p style={{ 
                    margin: '4px 0 0',
                    opacity: 0.9, 
                    fontSize: '0.8rem'
                  }}>
                    แก้ไขข้อมูลส่วนตัวของคุณ
                  </p>
                </div>
              </div>
              
              {/* Right Side (Empty) */}
              <div />
            </div>

            {/* Content */}
            <div style={{ padding: '30px' }}>
              {/* Alert Messages */}
              {error && (
                <div style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ❌ {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: '#dcfce7',
                  color: '#166534',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✅ {success}
                </div>
              )}

              {/* Profile Form */}
              {!showPasswordRequest ? (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Username */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        ชื่อผู้ใช้:
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#10b981'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        placeholder="ชื่อผู้ใช้งาน"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        อีเมล:
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#10b981'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        placeholder="อีเมลของคุณ"
                      />
                    </div>

                    {/* First Name & Last Name */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          ชื่อ:
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#10b981'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          placeholder="ชื่อจริง"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          นามสกุล:
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#10b981'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          placeholder="นามสกุล"
                        />
                      </div>
                    </div>

                    {/* Password Change Section */}
                    <div style={{
                        background: approvedRequest ? '#dcfce7' : '#fef3c7',
                        padding: '16px',
                        borderRadius: '12px',
                        border: `1px solid ${approvedRequest ? '#10b981' : '#f59e0b'}`
                      }}>

                        {/* === 1. ถ้ามีคำขอที่อนุมัติแล้ว === */}
                        {approvedRequest ? (
                          <div>
                            <h4 style={{ margin: '0 0 12px', fontSize: '1.1rem', color: '#166534', fontWeight: '600' }}>
                              <CheckCircle size={20} className="inline-block mr-1" /> คำขอของคุณได้รับการอนุมัติแล้ว
                            </h4>
                            <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#166534' }}>
                              กรุณาตั้งรหัสผ่านใหม่ของคุณ:
                            </p>

                            {/* Alert */}
                            {passwordError && (
                              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '0.9rem' }}>
                                {passwordError}
                              </div>
                            )}
                            {passwordSuccess && (
                              <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '0.9rem' }}>
                                {passwordSuccess}
                              </div>
                            )}

                            {/* New Password (...โค้ดส่วนนี้เหมือนเดิม...) */}
                            <div style={{ marginBottom: '12px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem' }}>
                                รหัสผ่านใหม่:
                              </label>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type={showNewPassword ? 'text' : 'password'} 
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '10px 40px 10px 10px', 
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxSizing: 'border-box' 
                                  }}
                                  placeholder="อย่างน้อย 6 ตัวอักษร"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px'
                                  }}
                                >
                                  {showNewPassword ? <Eye size={20} /> : <Lock size={20} />}
                                </button>
                              </div>
                            </div>

                            {/* Confirm Password (...โค้ดส่วนนี้เหมือนเดิม...) */}
                            <div style={{ marginBottom: '12px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem' }}>
                                ยืนยันรหัสผ่านใหม่:
                              </label>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type={showConfirmPassword ? 'text' : 'password'} 
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '10px 40px 10px 10px', 
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxSizing: 'border-box' 
                                  }}
                                  placeholder="ป้อนรหัสผ่านใหม่อีกครั้ง"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px'
                                  }}
                                >
                                  {showConfirmPassword ? <Eye size={20} /> : <Lock size={20} />}
                                </button>
                              </div>
                            </div>

                            {/* ❌ BUG: <button type="submit" ...> */}
                            {/* ✅ FIX: <button type="button" onClick={...}> (บรรทัดที่ 2454) */}
                            <button
                              type="button"
                              onClick={(e) => handleCompletePasswordChange(e, approvedRequest)}
                              disabled={passwordLoading}
                              style={{
                                background: passwordLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              {passwordLoading ? '⏳ กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                            </button>
                          {/* ❌ BUG: </form> */}
                          {/* ✅ FIX: </div> (บรรทัดที่ 2468) */}
                          </div>

                        ) : (

                          /* === 2. ถ้ายังไม่มีคำขอ (ปุ่ม Request ปกติ) === */
                          <>
                            <p style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#374151', fontWeight: '600' }}>
                              <Lock size={16} className="inline-block mr-1" /> เปลี่ยนรหัสผ่าน
                            </p>
                            <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#6b7280' }}>
                              สำหรับการเปลี่ยนรหัสผ่าน กรุณาแจ้งขอต่อ Admin เพื่อความปลอดภัย
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowPasswordRequest(true)}
                              disabled={passwordHistory.some(req => req.status === 'pending')} // 👈 (เพิ่ม) ปิดปุ่มถ้ามีคำขอค้างอยู่
                              style={{
                                background: passwordHistory.some(req => req.status === 'pending')
                                  ? '#9ca3af'
                                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: passwordHistory.some(req => req.status === 'pending') ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {passwordHistory.some(req => req.status === 'pending')
                                ? '⏳ มีคำขอค้างอยู่'
                                : <><Send size={16} className="inline-block mr-1" /> ส่งคำขอเปลี่ยนรหัสผ่าน</>
                              }
                            </button>
                          </>
                        )}
                    </div>

                    {/* 📋 ประวัติคำขอเปลี่ยนรหัสผ่าน - เพิ่มส่วนนี้ */}
                    <div style={{
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      marginTop: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <HistoryIcon size={20} className="inline-block mr-1" /> ประวัติคำขอเปลี่ยนรหัสผ่าน
                          {passwordHistory.filter(req => req.status === 'pending').length > 0 && (
                            <span style={{
                              background: '#ef4444',
                              color: 'white',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              fontSize: '0.7rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600'
                            }}>
                              {passwordHistory.filter(req => req.status === 'pending').length}
                            </span>
                          )}
                        </h4>
                        
                        <button
                          onClick={fetchPasswordHistory}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}
                        >
                          <RefreshCcw size={16} className="inline-block mr-1" /> รีเฟรช
                        </button>
                      </div>
                      
                      {historyLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            border: '3px solid #f3f3f3',
                            borderTop: '3px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 8px'
                          }}></div>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                            กำลังโหลดประวัติ...
                          </p>
                        </div>
                      ) : passwordHistory.length === 0 ? (
                        <div style={{
                          textAlign: 'center',
                          padding: '24px',
                          color: '#6b7280',
                          background: '#f1f5f9',
                          borderRadius: '8px',
                          border: '1px dashed #cbd5e1'
                        }}>
                          <div style={{ fontSize: '2rem', marginBottom: '8px' }}><Lock size={20} className="inline-block mr-1" /></div>
                          <p style={{ margin: 0, fontSize: '0.9rem' }}>
                            ยังไม่มีประวัติคำขอเปลี่ยนรหัสผ่าน
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                          {passwordHistory.slice(0, 5).map((request, index) => (
                            <div key={index} style={{
                              background: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px',
                              transition: 'all 0.2s ease'
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '8px',
                                flexWrap: 'wrap',
                                gap: '8px'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '4px'
                                  }}>
                                    คำขอ #{index + 1}
                                  </div>
                                  <div style={{ 
                                    fontSize: '0.8rem', 
                                    color: '#6b7280',
                                    marginBottom: '6px'
                                  }}>
                                    📅 {new Date(request.requestDate || request.createdAt).toLocaleDateString('th-TH', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                                
                               <div>
                                  {request.status === 'pending' && (
                                    <span style={{
                                      background: '#fef3c7',
                                      color: '#d97706',
                                      padding: '3px 8px',
                                      borderRadius: '10px',
                                      fontSize: '0.7rem',
                                      fontWeight: '600',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}>
                                      ⏳ รอดำเนินการ
                                    </span>
                                  )}
                                  {request.status === 'approved_awaiting_user' && (
                                    <span style={{
                                      background: '#dbeafe',
                                      color: '#1e40af',
                                      padding: '3px 8px',
                                      borderRadius: '10px',
                                      fontSize: '0.7rem',
                                      fontWeight: '600',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}>
                                      🔑 อนุมัติแล้ว (รอคุณตั้งรหัสใหม่)
                                    </span>
                                  )}
                                  {request.status === 'approved' && (
                                    <span style={{
                                      background: '#dcfce7',
                                      color: '#166534',
                                      padding: '3px 8px',
                                      borderRadius: '10px',
                                      fontSize: '0.7rem',
                                      fontWeight: '600',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}>
                                      ✅ อนุมัติแล้ว (Admin ตั้งให้)
                                    </span>
                                  )}
                                  {request.status === 'completed_by_user' && (
                                    <span style={{
                                      background: '#dcfce7',
                                      color: '#166534',
                                      padding: '3px 8px',
                                      borderRadius: '10px',
                                      fontSize: '0.7rem',
                                      fontWeight: '600',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}>
                                      ✅ เปลี่ยนรหัสผ่านสำเร็จ
                                    </span>
                                  )}
                                  {request.status === 'rejected' && (
                                    <span style={{
                                      background: '#fee2e2',
                                      color: '#dc2626',
                                      padding: '3px 8px',
                                      borderRadius: '10px',
                                      fontSize: '0.7rem',
                                      fontWeight: '600',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}>
                                      ❌ ปฏิเสธ
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div style={{
                                fontSize: '0.85rem',
                                color: '#6b7280',
                                background: '#f9fafb',
                                padding: '8px',
                                borderRadius: '6px',
                                fontStyle: 'italic',
                                lineHeight: 1.4
                              }}>
                                "{request.reason}"
                              </div>

                              {request.adminNote && (
                                <div style={{
                                  marginTop: '8px',
                                  padding: '8px',
                                  background: request.status === 'approved' ? '#dcfce7' : '#fee2e2',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem'
                                }}>
                                  <div style={{ 
                                    fontWeight: '600',
                                    color: request.status === 'approved' ? '#166534' : '#dc2626',
                                    marginBottom: '2px'
                                  }}>
                                    💬 หมายเหตุจาก Admin:
                                  </div>
                                  <div style={{ 
                                    color: request.status === 'approved' ? '#166534' : '#dc2626'
                                  }}>
                                    {request.adminNote}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {passwordHistory.length > 5 && (
                            <div style={{
                              textAlign: 'center',
                              padding: '8px',
                              color: '#6b7280',
                              fontSize: '0.8rem',
                              fontStyle: 'italic'
                            }}>
                              แสดง 5 คำขอล่าสุด จากทั้งหมด {passwordHistory.length} คำขอ
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => setActiveSection('menu')}
                        style={{
                          padding: '12px 20px',
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        <ArrowLeft size={16} /> กลับ
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          padding: '12px 20px',
                          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {loading ? '⏳ กำลังบันทึก...' : <Save size={16} className="inline-block mr-1" />} บันทึกข้อมูล
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* Password Change Request Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    background: '#f0f8ff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6'
                  }}>
                    <h4 style={{ margin: '0 0 8px', color: '#1e40af' }}>
                      <Shield size={24} className="inline-block mr-1" /> คำขอเปลี่ยนรหัสผ่าน
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                      กรุณาระบุเหตุผลในการเปลี่ยนรหัสผ่าน Admin จะตรวจสอบและดำเนินการให้
                    </p>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      เหตุผลในการเปลี่ยนรหัสผ่าน:
                    </label>
                   <textarea
                      value={passwordRequestNote}
                      onChange={(e) => setPasswordRequestNote(e.target.value)}
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        resize: 'vertical',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      placeholder="เช่น: ลืมรหัสผ่าน, ต้องการเปลี่ยนเพื่อความปลอดภัย, ฯลฯ"
                    />
                    
                    {/* <div style={{
                      marginTop: '6px',
                      fontSize: '0.9rem',
                      color: '#dc2626',
                      fontWeight: '600',
                      fontStyle: 'italic'
                    }}>
                      (!!อย่าลืม โปรดระบุ "Password" ที่ต้องการเปลี่ยนด้วย (ห้ามต่ำกว่า 6 ตัวอักษร) เช่น "เปลี่ยนเป็น: newpassword123" หรือ "ต้องการเปลี่ยนรหัสผ่านเป็น: myNewPass456) 
                    </div> */}
                  </div>

                  {/* Password Request Actions */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowPasswordRequest(false)}
                      style={{
                        padding: '12px 20px',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handlePasswordRequest}
                      disabled={loading || !passwordRequestNote.trim()}
                      style={{
                        padding: '12px 20px',
                        background: loading || !passwordRequestNote.trim() ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading || !passwordRequestNote.trim() ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {loading ? '⏳ กำลังส่ง...' : <><Send size={14} className="inline-block mr-1" /> ส่งคำขอ</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );



      // 🏠 Complete Address Management Case for CustomerSettings.jsx
case 'addresses':
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden'
    }}>
     {/* 🆕 Replaced Header (Addresses) */}
    <div style={{
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
      color: 'white',
      padding: '16px 20px', 
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }}>
      {/* Left Side: Back + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Back Button */}
        <button
          onClick={() => setActiveSection('menu')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <ArrowLeft size={16} />
        </button>
        
        {/* Title & Subtitle */}
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.2rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Home size={20} />
            ที่อยู่จัดส่ง
          </h2>
          <p style={{ 
            margin: '4px 0 0',
            opacity: 0.9, 
            fontSize: '0.8rem'
          }}>
            จัดการที่อยู่สำหรับการสั่งซื้อ ({addressProfiles.length}/5)
          </p>
        </div>
      </div>
      
      {/* Right Side (Empty) */}
      <div />
    </div>

      {/* Content */}
      <div style={{ padding: '5px' }}>
        {/* Alert Messages */}
        {message.text && (
          <div style={{
            padding: '16px',
            borderRadius: '0px',
            marginBottom: '20px',
            background: message.type === 'error' ? '#fee2e2' : '#dbeafe',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
            color: message.type === 'error' ? '#dc2626' : '#1d4ed8'
          }}>
            {message.text}
          </div>
        )}

        {/* Address Selector from CartModal */}
        <div className="address-selector">
          <div className="address-options">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#374151' }}>
                <MapPinIcon size={16} className="inline-block mr-1" /> ที่อยู่ทั้งหมด
              </h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => loadAddressProfiles()}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  <RefreshCcw size={16} className="inline-block mr-1" /> รีเฟรช
                </button>
                {/* <button 
                  onClick={() => setShowCreateProfile(true)}
                  disabled={addressProfiles.length >= 5}
                  style={{
                    padding: '10px 20px',
                    background: addressProfiles.length >= 5 ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: addressProfiles.length >= 5 ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  ➕ เพิ่มที่อยู่ใหม่ ({addressProfiles.length}/5)
                </button> */}
                {addressProfiles.length > 0 && (
                  <button 
                    onClick={() => setShowManageProfiles(true)}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    <MapPinIcon size={16} className="inline-block mr-1" /> จัดการที่อยู่
                  </button>
                )}
              </div>
            </div>

            {/* Loading Profiles */}
            {loadingProfiles && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '40px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #10b981',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>กำลังโหลดที่อยู่...</span>
              </div>
            )}

            {/* No Profiles */}
            {!loadingProfiles && addressProfiles.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '16px',
                border: '2px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏠</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#374151' }}>
                  ยังไม่มีที่อยู่จัดส่ง
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: '1rem' }}>
                  เพิ่มที่อยู่เพื่อความสะดวกในการสั่งซื้อ
                </p>
                <button
                  onClick={() => setShowCreateProfile(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  <Home size={20} className="inline-block mr-1" /> เพิ่มที่อยู่แรก
                </button>
              </div>
            )}

            {/* Profile List from CartModal */}
            {!loadingProfiles && addressProfiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {addressProfiles.map(profile => (
                  <div 
                    key={profile.profileId}
                    style={{
                      background: 'white',
                      border: profile.isDefault ? '2px solid #10b981' : '2px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '15px',
                      transition: 'all 0.2s ease',
                      boxShadow: profile.isDefault ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!profile.isDefault) {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!profile.isDefault) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      {/* Profile Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <h5 style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: '#1f2937'
                          }}>
                            <Home size={20} /> {profile.profileName}
                          </h5>
                          {profile.isDefault && (
                            <span style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              ⭐ บ้านหลัก
                            </span>
                          )}
                        </div>
                        
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#6b7280',
                          lineHeight: 1.5
                        }}>
                          <div style={{ marginBottom: '4px' }}>
                            <User size={16} className="inline-block mr-1" /> <strong>{profile.firstName} {profile.lastName}</strong>
                          </div>
                          <div style={{ marginBottom: '4px' }}>
                            <Phone size={16} className="inline-block mr-1" /> {profile.phone}
                          </div>
                          <div style={{ marginBottom: '4px' }}>
                            <MapPin size={16} className="inline-block mr-1" /> {profile.address.street}
                          </div>
                          <div>
                            <Globe size={16} className="inline-block mr-1" /> {profile.address.district}, {profile.address.province} {profile.address.postalCode}
                          </div>
                          
                          {profile.address.notes && (
                            <div style={{
                              marginTop: '8px',
                              padding: '8px',
                              background: '#f9fafb',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontStyle: 'italic'
                            }}>
                              <MessageCircle size={16} className="inline-block mr-1" /> {profile.address.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        minWidth: 'fit-content'
                      }}>
                        {/* {!profile.isDefault && (
                          <button
                            onClick={() => setDefaultProfile(profile.profileId)}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minWidth: '100px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            ⭐ ตั้งเป็นหลัก
                          </button>
                        )}
                         */}
                        {/* <button
                          onClick={() => deleteAddressProfile(profile.profileId, profile.profileName)}
                          disabled={addressProfiles.length <= 1}
                          style={{
                            padding: '6px 12px',
                            background: addressProfiles.length <= 1 ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: addressProfiles.length <= 1 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '100px'
                          }}
                          onMouseEnter={(e) => {
                            if (addressProfiles.length > 1) {
                              e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                              e.target.style.transform = 'translateY(-1px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (addressProfiles.length > 1) {
                              e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                              e.target.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          🗑️ ลบ
                        </button> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

       {/* Create Profile Modal */}
    {showCreateProfile && (
  <div
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '12px',
    backdropFilter: 'blur(8px)'
  }}>
    <div style={{
      background: 'white',
      borderRadius: '20px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '95vh',
      overflowY: 'auto',
      boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      position: 'relative'
    }}>
      {/* 🎨 Enhanced Header */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #1e40af 100%)',
        color: 'white',
        padding: '24px 24px 32px',
        borderRadius: '20px 20px 0 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>
        
        {/* Close Button */}
        {/* <button
          onClick={() => setShowCreateProfile(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'white',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button> */}
        
        {/* Header Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '8px'
          }}><Home size={32} className="inline-block mr-1" /></div>
          <h2 style={{ 
            margin: '0 0 8px', 
            fontSize: '1.5rem', 
            fontWeight: '700'
          }}>
            เพิ่มที่อยู่ใหม่
          </h2>
          <p style={{ 
            margin: 0, 
            opacity: 0.9, 
            fontSize: '0.95rem' 
          }}>
            กรอกข้อมูลที่อยู่สำหรับการจัดส่ง
          </p>
        </div>
      </div>

      {/* 📝 Form Content */}
      <div style={{ padding: '24px' }}>
        
        {/* 📋 Section 1: Profile Name */}
        <div style={{
          marginBottom: '28px',
          padding: '20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}> 
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              <Pen size={24} className="inline-block mr-1" />
            </div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.2rem', 
              fontWeight: '700',
              color: '#1f2937'
            }}>
              ชื่อโปรไฟล์
            </h3>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.9rem'
            }}>
              ชื่อโปรไฟล์ *
            </label>
            <input
              type="text"
              name="profileName"
              value={newProfileData.profileName}
              onChange={handleNewProfileInputChange}
              placeholder="เช่น บ้าน, ที่ทำงาน, หอพัก"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                backgroundColor: 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              maxLength="30"
            />
            <small style={{ 
              fontSize: '0.8rem', 
              color: '#6b7280',
              display: 'block',
              marginTop: '6px'
            }}>
              💡 ชื่อที่จะช่วยให้คุณจำได้ง่าย
            </small>
          </div>
        </div>

        {/* 👤 Section 2: Personal Information */}
        <div style={{
          marginBottom: '28px',
          padding: '20px',
          background: 'linear-gradient(135deg, #fef7ff 0%, #faf5ff 100%)',
          borderRadius: '16px',
          border: '1px solid #e9d5ff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              <User className="w-6 h-6" />
            </div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.2rem', 
              fontWeight: '700',
              color: '#1f2937'
            }}>
              ข้อมูลส่วนตัว
            </h3>
          </div>
          
          {/* Name Fields */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                ชื่อ *
              </label>
              <input
                type="text"
                name="firstName"
                value={newProfileData.firstName}
                onChange={handleNewProfileInputChange}
                placeholder="ชื่อจริง"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#a855f7';
                  e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                นามสกุล *
              </label>
              <input
                type="text"
                name="lastName"
                value={newProfileData.lastName}
                onChange={handleNewProfileInputChange}
                placeholder="นามสกุล"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#a855f7';
                  e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.9rem'
            }}>
              เบอร์โทรศัพท์ *
            </label>
            <input
              type="tel"
              name="phone"
              value={newProfileData.phone}
              onChange={handleNewProfileInputChange}
              placeholder="0812345678"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                backgroundColor: 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#a855f7';
                e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              maxLength="10"
              pattern="[0-9]*"
              onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
            />
            <small style={{ 
              fontSize: '0.8rem', 
              color: '#6b7280',
              display: 'block',
              marginTop: '6px'
            }}>
              📱 กรอกเบอร์โทรศัพท์ 10 หลัก
            </small>
          </div>
        </div>

        {/* 📍 Section 3: Address Information */}
        <div style={{
          marginBottom: '28px',
          padding: '20px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #f7fee7 100%)',
          borderRadius: '16px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              <MapPinIcon size={24} />
            </div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.2rem', 
              fontWeight: '700',
              color: '#1f2937'
            }}>
              ที่อยู่จัดส่ง
            </h3>
          </div>
          
          {/* Street Address */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.9rem'
            }}>
              ที่อยู่ *
            </label>
            <textarea
              name="address.street"
              value={newProfileData.address.street}
              onChange={handleNewProfileInputChange}
              placeholder="บ้านเลขที่, หมู่บ้าน, ซอย, ถนน"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                resize: 'vertical',
                minHeight: '80px',
                transition: 'all 0.2s ease',
                backgroundColor: 'white',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              rows="3"
            />
          </div>

          {/* District & Province */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                แขวง/ตำบล, เขต/อำเภอ *
              </label>
              <input
                type="text"
                name="address.district"
                value={newProfileData.address.district}
                onChange={handleNewProfileInputChange}
                placeholder="บางจาก, พระโขนง"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                จังหวัด *
              </label>
              <input
                type="text"
                name="address.province"
                value={newProfileData.address.province}
                onChange={handleNewProfileInputChange}
                placeholder="กรุงเทพมหานคร"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Postal Code */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.9rem'
            }}>
              รหัสไปรษณีย์ *
            </label>
            <input
              type="text"
              name="address.postalCode"
              value={newProfileData.address.postalCode}
              onChange={handleNewProfileInputChange}
              placeholder="10260"
              style={{
                width: '100%',
                maxWidth: '200px',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                backgroundColor: 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              maxLength="5"
              pattern="[0-9]*"
              onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.9rem'
            }}>
              หมายเหตุเพิ่มเติม
            </label>
            <textarea
              name="address.notes"
              value={newProfileData.address.notes}
              onChange={handleNewProfileInputChange}
              placeholder="หมายเหตุสำหรับการจัดส่ง (ไม่บังคับ)"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                resize: 'vertical',
                minHeight: '60px',
                transition: 'all 0.2s ease',
                backgroundColor: 'white',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              rows="2"
            />
            <small style={{ 
              fontSize: '0.8rem', 
              color: '#6b7280',
              display: 'block',
              marginTop: '6px'
            }}>
              💬 เช่น "ตึกสีเหลือง ข้างร้านเซเว่น"
            </small>
          </div>
        </div>

        {/* ⚙️ Section 4: Settings */}
        <div style={{
          marginBottom: '28px',
          padding: '20px',
          background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
          borderRadius: '16px',
          border: '1px solid #fde047'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              <Settings className="w-5 h-5" />
            </div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.2rem', 
              fontWeight: '700',
              color: '#1f2937'
            }}>
              การตั้งค่า
            </h3>
          </div>
          
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '12px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '12px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.9)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.7)';
          }}>
            <input
              type="checkbox"
              name="isDefault"
              checked={newProfileData.isDefault}
              onChange={handleNewProfileInputChange}
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#f59e0b'
              }}
            />
            <div>
              <div style={{ fontWeight: '600', color: '#374151' }}>
                ⭐ ตั้งเป็นที่อยู่หลัก
              </div>
              <small style={{ color: '#6b7280' }}>
                ที่อยู่หลักจะถูกเลือกโดยอัตโนมัติเมื่อสั่งซื้อ
              </small>
            </div>
          </label>
        </div>
      </div>

      {/* 🚀 Enhanced Footer */}
      <div style={{
        padding: '20px 24px 24px',
        borderTop: '1px solid #f1f5f9',
        background: '#fafbfc',
        borderRadius: '0 0 20px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
          gap: '12px'
        }}>
          <button 
            onClick={() => setShowCreateProfile(false)}
            style={{
              padding: '14px 20px',
              background: '#f3f4f6',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              order: window.innerWidth <= 768 ? 2 : 1
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e5e7eb';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <X size={16} /> ยกเลิก
          </button>
          <button 
            onClick={createAddressProfile}
            style={{
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              order: window.innerWidth <= 768 ? 1 : 2
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            }}
          >
            <Save size={20} className="inline-block mr-1" /> บันทึกที่อยู่
          </button>
        </div>
      </div>
    </div>
  </div>
    )}

        {/* Manage Profiles Modal */}
        {showManageProfiles && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '15px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f1f5f9'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <MapPinIcon size={16} className="inline-block mr-1" /> จัดการที่อยู่
                </h3>
                <button
                  onClick={() => setShowManageProfiles(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#666',
                    borderRadius: '4px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}>
                  {addressProfiles.map(profile => (
                    <div 
                      key={profile.profileId}
                      style={{
                        background: '#f8fafc',
                        border: profile.isDefault ? '2px solid #10b981' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '16px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px'
                      }}>
                        {/* Profile Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <h5 style={{
                              margin: 0,
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: '#1f2937'
                            }}>
                              <Home size={16} className="inline-block mr-1" /> {profile.profileName}
                            </h5>
                            {profile.isDefault && (
                              <span style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: '600'
                              }}>
                                ⭐ บ้านหลัก
                              </span>
                            )}
                          </div>
                          
                          <div style={{
                            fontSize: '0.85rem',
                            color: '#6b7280',
                            lineHeight: 1.4
                          }}>
                            <div style={{ marginBottom: '2px' }}>
                              <User size={16} className="inline-block mr-1" /> {profile.firstName} {profile.lastName} | <Phone size={16} className="inline-block mr-1" /> {profile.phone}
                            </div>
                            <div style={{ marginBottom: '2px' }}>
                              <MapPinIcon size={16} className="inline-block mr-1" /> {profile.address.street}
                            </div>
                            <div>
                              <Globe size={16} className="inline-block mr-1" /> {profile.address.district}, {profile.address.province} {profile.address.postalCode}
                            </div>
                            
                            {profile.address.notes && (
                              <div style={{
                                marginTop: '6px',
                                padding: '6px',
                                background: 'white',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontStyle: 'italic'
                              }}>
                                <MessageCircle size={16} className="inline-block mr-1" /> {profile.address.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          flexDirection: 'column'
                        }}>
                          {!profile.isDefault && (
                            <button
                              onClick={() => setDefaultProfile(profile.profileId)}
                              style={{
                                padding: '6px 12px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                minWidth: '80px'
                              }}
                            >
                              ⭐ หลัก
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteAddressProfile(profile.profileId, profile.profileName)}
                            disabled={addressProfiles.length <= 1}
                            style={{
                              padding: '6px 12px',
                              background: addressProfiles.length <= 1 ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: addressProfiles.length <= 1 ? 'not-allowed' : 'pointer',
                              minWidth: '80px'
                            }}
                          >
                            <Trash2 size={15} className="inline-block mr-1" /> ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Add Button */}
                <div style={{
                  marginTop: '20px',
                  textAlign: 'center'
                }}>
                  <button
                    onClick={() => {
                      setShowManageProfiles(false);
                      setShowCreateProfile(true);
                    }}
                    disabled={addressProfiles.length >= 5}
                    style={{
                      padding: '10px 20px',
                      background: addressProfiles.length >= 5 ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: addressProfiles.length >= 5 ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    <Pen size={16} className="inline-block mr-1" /> เพิ่มที่อยู่ใหม่
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button 
                  onClick={() => setShowManageProfiles(false)}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  <CheckCircle size={15} className="inline-block mr-1" /> เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
      
      case 'security':
        return (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '24px 30px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <button
                onClick={() => setActiveSection('menu')}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                <ArrowLeft size={16} /> กลับ
              </button>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.8rem', fontWeight: '700' }}>
                🔐 ความปลอดภัย
              </h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
                การจัดการความปลอดภัยของบัญชี
              </p>
            </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔐</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#374151' }}>
                ระบบความปลอดภัย
              </h3>
              <p style={{ margin: '0 0 20px', color: '#6b7280' }}>
                ฟีเจอร์นี้กำลังพัฒนา จะสามารถจัดการความปลอดภัยได้เร็วๆ นี้
              </p>
              <div style={{
                background: '#fef3c7',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f59e0b',
                textAlign: 'left'
              }}>
                <h4 style={{ margin: '0 0 8px', color: '#d97706' }}>
                  🔑 ฟีเจอร์ที่กำลังพัฒนา:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151' }}>
                  <li>ประวัติการเข้าสู่ระบบ</li>
                  <li>การจัดการอุปกรณ์ที่เชื่อมต่อ</li>
                  <li>การตั้งค่าการแจ้งเตือนความปลอดภัย</li>
                  <li>Two-Factor Authentication (2FA)</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'profile-picture':
        return (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            {/* 🆕 Replaced Header (Profile Picture) */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', // 🎨 สีม่วง
          color: 'white',
          padding: '16px 20px', 
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          {/* Left Side: Back + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Back Button */}
            <button
              onClick={() => setActiveSection('menu')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <ArrowLeft size={16} />
            </button>
            
            {/* Title & Subtitle */}
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.2rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Camera size={20} />
                รูปโปรไฟล์
              </h2>
              <p style={{ 
                margin: '4px 0 0',
                opacity: 0.9, 
                fontSize: '0.8rem'
              }}>
                อัปโหลดและจัดการรูปโปรไฟล์ของคุณ
              </p>
            </div>
          </div>
          
          {/* Right Side (Empty) */}
          <div />
        </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📷</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#374151' }}>
                อัปโหลดรูปโปรไฟล์
              </h3>
              <p style={{ margin: '0 0 20px', color: '#6b7280' }}>
                ฟีเจอร์นี้กำลังพัฒนา จะสามารถอัปโหลดรูปโปรไฟล์ได้เร็วๆ นี้
              </p>
              <div style={{
                background: '#e0e7ff',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #8b5cf6',
                textAlign: 'left'
              }}>
                <h4 style={{ margin: '0 0 8px', color: '#7c3aed' }}>
                  📸 ฟีเจอร์ที่กำลังพัฒนา:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151' }}>
                  <li>อัปโหลดรูปจากอุปกรณ์</li>
                  <li>ครอปและปรับแต่งรูป</li>
                  <li>ลบรูปโปรไฟล์</li>
                  <li>แสดงรูปใน Header และโปรไฟล์</li>
                </ul>
              </div>
            </div>
          </div>
        );
        // 🔧 2. เพิ่ม Payment Methods Case ใน renderContent() function
        // เพิ่มใน switch statement ก่อน case 'menu':

case 'payment':
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden'
    }}>
      {/* 🆕 Replaced Header (Payment) */}
<div style={{
  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', // 🎨 สีม่วง
  color: 'white',
  padding: '16px 20px', 
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0
}}>
  {/* Left Side: Back + Title */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    {/* Back Button */}
    <button
      onClick={() => setActiveSection('menu')}
      style={{
        background: 'rgba(255,255,255,0.2)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '8px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600'
      }}
    >
      <ArrowLeft size={16} />
    </button>
    
    {/* Title & Subtitle */}
    <div>
      <h2 style={{ 
        margin: 0, 
        fontSize: '1.2rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <CreditCard size={20} />
        วิธีชำระเงิน
      </h2>
      <p style={{ 
        margin: '4px 0 0',
        opacity: 0.9, 
        fontSize: '0.8rem'
      }}>
        จัดการวิธีการชำระเงินของคุณ
      </p>
    </div>
  </div>
  
  {/* Right Side (Empty) */}
  <div />
</div>

      {/* Content */}
      <div style={{ padding: '30px' }}>
        {/* Coming Soon Notice */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #f59e0b',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚧</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: '700', color: '#92400e' }}>
            ระบบชำระเงินกำลังพัฒนา
          </h3>
          <p style={{ margin: 0, color: '#451a03', fontSize: '0.95rem' }}>
            ขณะนี้ใช้ระบบจำลองเท่านั้น - เร็วๆ นี้จะเชื่อมต่อกับระบบชำระเงินจริง!
          </p>
        </div>

        {/* Payment Methods List */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#374151' }}>
            💳 วิธีชำระเงินที่บันทึกไว้
          </h4>
          <button
            onClick={() => setShowAddPaymentModal(true)}
            style={{
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ➕ เพิ่มวิธีชำระเงิน
          </button>
        </div>

        {/* Payment Methods Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {paymentMethods.map((method) => (
            <div key={method.id} style={{
              background: 'white',
              border: method.isDefault ? '2px solid #8b5cf6' : '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.2s ease',
              opacity: method.isActive ? 1 : 0.6,
              position: 'relative'
            }}>
              {/* Placeholder Badge */}
              {!method.isActive && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  🚧 DEMO
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    {/* Payment Method Icon */}
                    <div style={{
                      width: '48px',
                      height: '32px',
                      borderRadius: '6px',
                      background: method.type === 'credit_card' 
                        ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
                        : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {method.type === 'credit_card' ? '💳' : '🏦'}
                    </div>

                    <div>
                      <h5 style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#1f2937'
                      }}>
                        {method.name}
                      </h5>
                      {method.type === 'credit_card' && (
                        <p style={{
                          margin: '4px 0 0',
                          fontSize: '0.85rem',
                          color: '#6b7280'
                        }}>
                          หมดอายุ {method.expiryMonth}/{method.expiryYear}
                        </p>
                      )}
                      {method.type === 'bank_transfer' && (
                        <p style={{
                          margin: '4px 0 0',
                          fontSize: '0.85rem',
                          color: '#6b7280'
                        }}>
                          บัญชี {method.accountNumber}
                        </p>
                      )}
                    </div>

                    {method.isDefault && (
                      <span style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        ⭐ หลัก
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  opacity: method.isActive ? 1 : 0.5
                }}>
                  {!method.isDefault && (
                    <button
                      disabled={!method.isActive}
                      style={{
                        padding: '6px 12px',
                        background: method.isActive ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: method.isActive ? 'pointer' : 'not-allowed'
                      }}
                      onClick={() => method.isActive && alert('🚧 ฟีเจอร์นี้กำลังพัฒนา')}
                    >
                      ⭐ ตั้งเป็นหลัก
                    </button>
                  )}
                  
                  <button
                    disabled={!method.isActive}
                    style={{
                      padding: '6px 12px',
                      background: method.isActive ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: method.isActive ? 'pointer' : 'not-allowed'
                    }}
                    onClick={() => method.isActive && alert('🚧 ฟีเจอร์นี้กำลังพัฒนา')}
                  >
                    🗑️ ลบ
                  </button>
                </div>
              </div>

              {/* Payment Method Details */}
              <div style={{
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#6b7280'
              }}>
                {method.type === 'credit_card' ? (
                  <>
                    💳 บัตรเครดิต/เดบิต • ปลอดภัยด้วยการเข้ารหัส SSL
                  </>
                ) : (
                  <>
                    🏦 โอนผ่านธนาคาร • ปลอดภัยผ่านระบบ Internet Banking
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Available Payment Methods */}
        <div style={{ marginTop: '32px' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontWeight: '600', color: '#374151' }}>
            💼 วิธีการชำระเงินที่รองรับ
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {/* Credit Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💳</div>
              <h5 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: '600' }}>
                บัตรเครดิต/เดบิต
              </h5>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                Visa, Mastercard, JCB
              </p>
            </div>

            {/* Bank Transfer */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏦</div>
              <h5 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: '600' }}>
                โอนผ่านธนาคาร
              </h5>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                ธนาคารชั้นนำทุกแห่ง
              </p>
            </div>

            {/* PromptPay */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📱</div>
              <h5 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: '600' }}>
                พร้อมเพย์
              </h5>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                QR Code ชำระทันที
              </p>
            </div>

            {/* Cash on Delivery */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💵</div>
              <h5 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: '600' }}>
                เก็บเงินปลายทาง
              </h5>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                ชำระเมื่อได้รับสินค้า
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


   case 'chat':
  return (
    <div style={{
      background: 'white',
      flex: 1, 
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '0', 
      boxShadow: 'none',
      overflow: 'hidden', 
    }}>
      {/* Header */}
<div style={{
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: 'white',
  padding: '16px 20px', // 🆕 ลด padding ให้กระชับ
  textAlign: 'left',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0 // 🆕 กัน Header หด
}}>
  {/* Left Side: Back + Title/Status */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    {/* Back Button */}
    <button
      onClick={() => setActiveSection('menu')}
      style={{
        background: 'rgba(255,255,255,0.2)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '8px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600'
      }}
    >
      <ArrowLeft size={16} />
    </button>

    {/* Title & Status (ย้ายมาจาก Header ด้านใน) */}
    <div>
      <h2 style={{ 
        margin: 0, 
        fontSize: '1.2rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center'
      }}>
        Chat With Admin
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span style={{
            marginLeft: '10px',
            background: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '12px',
            animation: 'pulse 2s infinite'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </h2>
      {/* Connection Status (ย้ายมาจาก Header ด้านใน) */}
      <div style={{ 
        fontSize: '0.8rem', 
        color: 'white',
        opacity: 0.9,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '500'
      }}>
        {connectionStatus === 'connected' && '🟢 Online • พร้อมตอบ'}
        {connectionStatus === 'connecting' && '🟡 กำลังเชื่อมต่อ...'}
        {connectionStatus === 'disconnected' && '🔴 ไม่ได้เชื่อมต่อ'}
        {adminTyping && ' • กำลังพิมพ์...'}
      </div>
    </div>
  </div>
</div>

      {/* Chat Content */}
      {/* ❌ ลบ div style={{ padding: '5px' }} ที่ครอบอยู่ออก */}

        {/* Connection Control */}
        {/* Chat Header */}
<div style={{
  background: '#f8fafc',
  padding: '16px 20px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  justifyContent: 'space-between', // 🆕 จัดชิดซ้าย-ขวา
  flexShrink: 0 // ✅ [FIX] เพิ่ม flexShrink: 0 เพื่อตรึง Header นี้
}}>
  {/* 🆕 หุ้มฝั่งซ้ายไว้ด้วย div */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10b981 0%, #1d4ed8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem'
    }}>
      <UserCheck2Icon size={24} className="inline-block" color='White' strokeWidth={2.5} />
    </div>
    <div>
      <div style={{ fontWeight: '600', color: '#1f2937' }}>
        VipStore Support Team
        {/* ... (Unread Badge เหมือนเดิม) ... */}
      </div>

      {/* 🆕 อัปเดตการแสดงสถานะให้ Real-time */}
      <div style={{ 
        fontSize: '0.8rem', 
        color: connectionStatus === 'connected' ? '#10b981' : (connectionStatus === 'connecting' ? '#f59e0b' : '#6b7280'),
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '600'
      }}>
        {connectionStatus === 'connected' && '🟢 Online • พร้อมตอบ'}
        {connectionStatus === 'connecting' && '🟡 กำลังเชื่อมต่อ...'}
        {connectionStatus === 'disconnected' && '🔴 ไม่ได้เชื่อมต่อ'}
        {adminTyping && ' • กำลังพิมพ์...'}
      </div>
    </div>
  </div>

  {/* 🆕 ย้ายปุ่ม Refresh มาไว้ตรงนี้ */}
  {chatConnected && (
    <button
      onClick={refreshChat}
      style={{
        padding: '8px 12px', // 
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '600',
        flexShrink: 0 // ป้องกันปุ่มหด
      }}
    >
      <RefreshCcw size={14} className="inline-block mr-1" /> รีเฟรช
    </button>
  )}
</div>

        {/* Chat Interface */}
        <div style={{
          border: '2px solid #e5e7eb',
          borderRadius: '16px',
          overflow: 'hidden',
          flex: 1, // ✅ [FIX] เปลี่ยน minHeight: '500px' เป็น flex: 1
          display: 'flex',
          flexDirection: 'column',
          opacity: chatConnected ? 1 : 0.6,
          margin: '5px' // ✅ [FIX] ย้าย padding: '5px' มาเป็น margin ที่นี่แทน
        }}>
          {/* Chat Messages Area */}
          <div style={{
              flex: 1, 
              padding: '20px',
              background: '#ffffff',
              overflowY: 'auto', 
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative'
            }}>
            {/* Welcome Message */}
            {chatMessages.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#6b7280',
                padding: '40px 20px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}><MessageCircle size={70} className="inline-block" color='#6b7280' /></div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#374151' }}>
                  {chatConnected ? 'เริ่มการสนทนา' : 'เชื่อมต่อเพื่อเริ่มแchatt'}
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: '1rem' }}>
                  สวัสดี {user?.firstName || user?.username}! <br />
                  {chatConnected 
                    ? 'ส่งข้อความเพื่อเริ่มการสนทนากับทีมงาน'
                    : 'เชื่อมต่อแชทเพื่อสอบถามข้อมูล'
                  }
                </p>
              </div>
            )}

  {/* Real Messages */}
  {chatMessages.map((msg) => (
    <div
      key={msg.id}
      style={{
        display: 'flex',
        justifyContent: msg.senderType === 'customer' ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end',
        gap: '8px'
      }}
    >
      {msg.senderType === 'admin' && (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.9rem',
          flexShrink: 0
        }}>
          <UserCheck2Icon size={24} className="inline-block" color='White' strokeWidth={2.5} />
        </div>
      )}
      
      <div style={{
        maxWidth: '70%',
        background: msg.senderType === 'customer' 
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : '#f1f5f9',
        color: msg.senderType === 'customer' ? 'white' : '#1f2937',
        padding: '12px 16px',
        borderRadius: msg.senderType === 'customer' 
          ? '18px 18px 4px 18px'
          : '18px 18px 18px 4px',
        wordBreak: 'break-word',
        boxShadow: msg.senderType === 'admin' && !msg.isRead ? '0 0 0 2px #ef4444' : 'none'
      }}>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
          {msg.message}
        </div>
        <div style={{
          fontSize: '0.75rem',
          opacity: 0.8,
          marginTop: '4px',
          textAlign: msg.senderType === 'customer' ? 'right' : 'left'
        }}>
          {new Date(msg.timestamp).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
          })}
          {msg.senderType === 'customer' && msg.isRead && ' ✓✓'}
        </div>
      </div>
    </div>
  ))}

  {/* Typing Indicator */}
  {adminTyping && (
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
        background: 'linear-gradient(135deg, #059669 0%, #1e40af 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem'
      }}>
        <UserCheck2Icon size={24} className="inline-block" color='White' strokeWidth={2.5} />
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

  <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
  {/* 🆕 ปุ่มลูกศรลง - Scroll to Bottom */}
  {/* {chatMessages.length > 5 && (
    <button
      onClick={scrollToBottomManual}
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 25%, #ffeb3b 50%, #4ecdc4 75%, #45b7d1 100%)', // 🌈 Rainbow
boxShadow: '0 4px 12px rgba(255, 107, 107, 0.6)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        
        zIndex: 10,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.8)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
       e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.8)';
      }}
      title="ไปยังข้อความล่าสุด"
    >
      ⬇
    </button>
  )} */}
</div>

          {/* Chat Input */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8fafc',
            flexShrink: 0
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder={chatConnected ? "พิมพ์ข้อความของคุณ..." : "เชื่อมต่อแชทก่อนส่งข้อความ"}
                value={chatMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={!chatConnected}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  opacity: chatConnected ? 1 : 0.5
                }}
                onFocus={(e) => chatConnected && (e.target.style.borderColor = '#10b981')}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button 
                onClick={sendMessage}
                disabled={!chatConnected || !chatMessage.trim()}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  background: (!chatConnected || !chatMessage.trim()) 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: (!chatConnected || !chatMessage.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (chatConnected && chatMessage.trim()) {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <SendHorizonalIcon size={20} className="inline-block" strokeWidth={2.5} />
              </button>
            </div>
            
            <div style={{
              marginTop: '8px',
              fontSize: '0.8rem',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              {/* 💡 กด Enter เพื่อส่งข้อความ • Shift+Enter สำหรับขึ้นบรรทัดใหม่ */}
              {chatRoomId && (
                <span style={{ marginLeft: '8px', color: '#10b981' }}>
                  <KeyRoundIcon size={12} className="inline-block" strokeWidth={2.5} /> • ห้อง: {chatRoomId.slice(-8)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chat Debug Info */}
        {/* {chatConnected && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#f0f8ff',
            borderRadius: '8px',
            border: '1px solid #3b82f6',
            fontSize: '0.8rem',
            color: '#1e40af'
          }}>
            🔧 Debug: Socket ID: {socketManager.getSocket()?.id?.slice(-8) || 'N/A'} | 
            Room: {chatRoomId?.slice(-8) || 'N/A'} | 
            Messages: {chatMessages.length} | 
            Unread: {unreadCount}
          </div>
        )} */}

        {/* 🆕 Chat Statistics */}
        {/* <div style={{
          marginTop: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #8b5cf6'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#6b21a8' }}>
              {chatMessages.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7c3aed' }}>
              ข้อความทั้งหมด
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #fed7d7 0%, #fbb6ce 100%)',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #f56565'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#c53030' }}>
              {unreadCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#e53e3e' }}>
              ยังไม่ได้อ่าน
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #bee3f8 0%, #90cdf4 100%)',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #4299e1'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2b6cb0' }}>
              {chatConnected ? 'ON' : 'OFF'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#3182ce' }}>
              สถานะการเชื่อมต่อ
            </div>
          </div>
        </div> */}
      
      {/* ❌ ลบ </div> ปิดของ div style={{ padding: '5px' }} ออก */}

      {/* Add CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );



      case 'menu':
      default:
        return (
          <div>
            {/* Profile Picture Section */}
            {renderProfilePictureSection()}
            
            {/* Menu List */}
            {renderMenuList()}
          </div>
        );
    }
  };

  // Don't render if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    // 🎨 Full Screen Settings Page Modal
    <div ref={scrollContainerRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      zIndex: 1000,
      overflow: activeSection === 'chat' ? 'hidden' : 'auto',
      padding: '0'
    }}>
      <div style={{
        minHeight: '100vh',
        padding: activeSection === 'chat' ? '0' : '20px',
        height: activeSection === 'chat' ? '100vh' : 'auto'
      }}>
        <div style={{
          maxWidth: activeSection === 'chat' ? 'none' : '900px',
          margin: activeSection === 'chat' ? '0' : '0 auto',
          height: activeSection === 'chat' ? '100%' : 'auto',
          display: activeSection === 'chat' ? 'flex' : 'block',
          flexDirection: activeSection === 'chat' ? 'column' : 'unset'
        }}>


          {/* Header - Only show on menu */}
          {activeSection === 'menu' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between', 
              marginBottom: '24px',
              gap: '16px',
              // ✅ [NEW] ทำให้ Header เป็นการ์ดสีขาวสวยๆ
              background: 'white',
              padding: '10px 10px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>

              {/* === ฝั่งขวา: โลโก้ & ข้อความต้อนรับ === */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px' // ระยะห่างระหว่างโลโก้กับข้อความ
              }}>
                <img 
                  src="/VipStoreLogo.png" 
                  alt="VipStore Logo" 
                  style={{
                    width: '48px', // ✅ [NEW] ขยายโลโก้
                    height: '48px',
                    objectFit: 'contain',
                    // ✅ [NEW] เพิ่มเงาให้โลโก้
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))', 
                    borderRadius: '8px'
                  }}
                />
                
                {/* ✅ [NEW] ข้อความต้อนรับ + Gradient */}
                <h1 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '500',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px' // ระยะห่างระหว่าง "Welcome to" กับ "VipStore"
                }}>
                  {/* คำว่า "Welcome to" */}
                  <span>Welcome to</span>
                  
                  {/* คำว่า "VipStore" (ที่ใส่ Gradient) */}
                  <span style={{
                    // ✅ [NEW] โค้ดสำหรับทำตัวอักษรไล่สี
                    background: 'linear-gradient(135deg, #059669 0%, #1e40af 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    // ✅ [NEW] เพิ่มเงาจางๆ ให้ตัวอักษร
                    filter: 'drop-shadow(0 1px 2px rgba(5, 150, 105, 0.3))'
                  }}>
                    VipStore
                  </span>
                </h1>
              </div>
            </div>
          )}

          {/* Message Alert */}
          {message.text && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              background: message.type === 'error' ? '#fee2e2' : '#dbeafe',
              border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
              color: message.type === 'error' ? '#dc2626' : '#1d4ed8'
            }}>
              {message.text}
            </div>
          )}

          {/*{/* Main Content */}
          {renderContent()}
        </div>
        
        {/* CSS Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    <PaymentModal
      isOpen={showPaymentModal}
      onClose={handlePaymentClose}
      orderData={paymentOrderData}
      onPaymentSuccess={handlePaymentSuccess}
    />
    {/* 💰 Refund Request Modal - เพิ่มก่อน closing </div> สุดท้าย */}
{showRefundModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000
  }}>
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h3 style={{
        margin: '0 0 20px',
        fontSize: '1.3rem',
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center'
      }}>
        💰 ขอคืนเงิน - ออเดอร์ #{selectedOrderForRefund?.orderNumber}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            จำนวนเงินที่ขอคืน (฿):
          </label>
          <input
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            max={selectedOrderForRefund?.pricing?.total || 0}
            min="1"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <small style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            จำนวนเต็ม: {formatPrice(selectedOrderForRefund?.pricing?.total || 0)}
          </small>
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            เหตุผลในการขอคืนเงิน:
          </label>
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="กรุณาระบุเหตุผล เช่น สินค้าชำรุด, ไม่ตรงตามที่สั่ง, เปลี่ยนใจ"
            rows="4"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          marginTop: '20px'
        }}>
          <button 
            onClick={() => setShowRefundModal(false)}
            disabled={isSubmittingRefund}
            style={{
              padding: '12px 20px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ยกเลิก
          </button>
          <button 
            onClick={submitRefundRequest}
            disabled={isSubmittingRefund || !refundReason.trim()}
            style={{
              padding: '12px 20px',
              background: isSubmittingRefund || !refundReason.trim() ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmittingRefund || !refundReason.trim() ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {isSubmittingRefund ? '⏳ กำลังส่ง...' : <><Send size={14} className="inline-block mr-1" /> ส่งคำขอ</>}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showAddPaymentModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000
  }}>
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h3 style={{
        margin: '0 0 20px',
        fontSize: '1.3rem',
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center'
      }}>
        💳 เพิ่มวิธีชำระเงิน
      </h3>

      {/* Payment Method Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: '#374151'
        }}>
          เลือกประเภท:
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setSelectedPaymentMethod('credit_card')}
            style={{
              flex: 1,
              padding: '12px',
              background: selectedPaymentMethod === 'credit_card' ? '#8b5cf6' : '#f3f4f6',
              color: selectedPaymentMethod === 'credit_card' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            💳 บัตรเครดิต
          </button>
          <button
            onClick={() => setSelectedPaymentMethod('bank_transfer')}
            style={{
              flex: 1,
              padding: '12px',
              background: selectedPaymentMethod === 'bank_transfer' ? '#8b5cf6' : '#f3f4f6',
              color: selectedPaymentMethod === 'bank_transfer' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🏦 โอนธนาคาร
          </button>
        </div>
      </div>

      {/* Demo Form */}
      <div style={{
        background: '#fef3c7',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #f59e0b',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚧</div>
        <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem' }}>
          <strong>ระบบจำลอง</strong><br />
          ฟอร์มนี้เป็นการจำลองเท่านั้น ไม่ได้เก็บข้อมูลจริง
        </p>
      </div>

      {selectedPaymentMethod === 'credit_card' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              หมายเลขบัตร:
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#f9fafb',
                color: '#9ca3af'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                วันหมดอายุ:
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: '#f9fafb',
                  color: '#9ca3af'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                CVC:
              </label>
              <input
                type="text"
                placeholder="123"
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: '#f9fafb',
                  color: '#9ca3af'
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              เลือกธนาคาร:
            </label>
            <select
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#f9fafb',
                color: '#9ca3af'
              }}
            >
              <option>ธนาคารกสิกรไทย</option>
              <option>ธนาคารกรุงเทพ</option>
              <option>ธนาคารไทยพาณิชย์</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              หมายเลขบัญชี:
            </label>
            <input
              type="text"
              placeholder="xxx-x-xxxxx-x"
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#f9fafb',
                color: '#9ca3af'
              }}
            />
          </div>
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'flex-end',
        marginTop: '20px'
      }}>
        <button 
          onClick={() => setShowAddPaymentModal(false)}
          style={{
            padding: '12px 20px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ยกเลิก
        </button>
        <button 
          onClick={() => {
            alert('🚧 ระบบยังไม่พร้อมใช้งาน กำลังพัฒนา!');
            setShowAddPaymentModal(false);
          }}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          💾 บันทึก (DEMO)
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
};

export default CustomerSettings;