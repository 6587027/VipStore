// frontend/src/components/CartModal.jsx - With Built-in Notification
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, X, ShoppingBag, CreditCard, User, MapPin, Package, Phone, Home, Trash , Trash2 , Mail , Pen , Settings , Save, Grab, Globe  } from 'lucide-react';
import './CartModal.css';
import { ordersAPI, authAPI } from '../services/api'; 
import PaymentModal from './payment/PaymentModal'; 

// Simple Built-in Notification Component
const NotificationBar = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // 4 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? '#f0fdf4' : '#fef2f2';
  const borderColor = isSuccess ? '#22c55e' : '#ef4444';
  const textColor = isSuccess ? '#15803d' : '#dc2626';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10000,
      background: bgColor,
      borderLeft: `4px solid ${borderColor}`,
      color: textColor,
      transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      borderRadius: '0 0 12px 12px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px'
      }}>
        {isSuccess ? 
          <CheckCircle style={{ width: '24px', height: '24px', color: '#22c55e' }} /> :
          <XCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
        }
        <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: '500' }}>
          {message}
        </span>
        <button 
          onClick={onClose}
          style={{
            background: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.2)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.1)'}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        width: '100%',
        background: `linear-gradient(90deg, ${borderColor}, ${isSuccess ? '#16a34a' : '#dc2626'})`,
        animation: 'notificationProgress 4s linear forwards'
      }}></div>
      <style jsx>{`
        @keyframes notificationProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

const CartModal = ({ isOpen, onClose }) => {
  const {
    cartItems,
    totalItems,
    totalAmount,
    removeFromCart,
    updateQuantity,
    clearCart,
    formatCurrency,
    getShippingCost,
    getFinalTotal,
    isEmpty
  } = useCart();

  const { isLoggedIn, user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart');

  // Notification State
  const [notification, setNotification] = useState({
    message: '',
    type: 'success', // 'success' or 'error'
    isVisible: false
  });

  // Show Notification Function
  const showNotification = (message, type = 'success') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  // Hide Notification Function
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderData, setPaymentOrderData] = useState(null);

  // Address Profile Management States
  const [addressProfiles, setAddressProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showManageProfiles, setShowManageProfiles] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // New Profile Form State
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

  // Manual Address Form State
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    district: '',
    province: '',
    postalCode: '',
    notes: ''
  });

  const [useManualAddress, setUseManualAddress] = useState(false);

  // Helper function to get user ID safely
  const getUserId = () => {
    if (!user) {
      console.log('No user object found');
      return null;
    }
    
    const userId = user.id || user._id || user.userId;
    console.log('User ID resolution:', {
      'user.id': user.id,
      'user._id': user._id,  
      'user.userId': user.userId,
      'final userId': userId,
      'user object': user
    });
    
    return userId;
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

  // Enhanced useEffect with better user checking
  useEffect(() => {
    console.log('useEffect triggered:', { isLoggedIn: isLoggedIn(), user, checkoutStep });
    
    if (isLoggedIn() && user && checkoutStep === 'address') {
      const userId = getUserId();
      
      if (userId) {
        console.log('Valid user ID found, loading profiles:', userId);
        loadAddressProfiles(userId);
      } else {
        console.log('No valid user ID, using manual address form');
        setUseManualAddress(true);
      }
    }
  }, [isLoggedIn, user, checkoutStep]);

  // Enhanced loadAddressProfiles with userId parameter
  const loadAddressProfiles = async (userId) => {
    if (!userId) {
      console.error('loadAddressProfiles: No userId provided');
      setUseManualAddress(true);
      return;
    }

    setLoadingProfiles(true);
    console.log('Loading address profiles for userId:', userId);
    
    try {
      const response = await authAPI.addressProfiles.getAll(userId);
      console.log('Address profiles response:', response);
      
      if (response.data.success) {
        setAddressProfiles(response.data.addressProfiles);
        
        // Auto-select default profile
        const defaultProfile = response.data.addressProfiles.find(p => p.isDefault);
        if (defaultProfile) {
          setSelectedProfileId(defaultProfile.profileId);
          setUseManualAddress(false);
          console.log('Auto-selected default profile:', defaultProfile.profileName);
        } else if (response.data.addressProfiles.length === 0) {
          // No profiles exist, show manual form
          setUseManualAddress(true);
          console.log('No profiles found, using manual form');
        }
      }
    } catch (error) {
      console.error('Load address profiles error:', error);
      setUseManualAddress(true); // Fallback to manual
    } finally {
      setLoadingProfiles(false);
    }
  };

  const createAddressProfile = async () => {
    const userId = getUserId();
    
    if (!userId) {
      showNotification('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่', 'error');
      console.error('createAddressProfile: No valid user ID');
      return;
    }

    console.log('Creating address profile for userId:', userId);

    try {
      // Validation
      if (!newProfileData.profileName.trim()) {
        showNotification('กรุณาใส่ชื่อโปรไฟล์', 'error');
        return;
      }

      if (!newProfileData.firstName.trim() || !newProfileData.lastName.trim()) {
        showNotification('กรุณาใส่ชื่อและนามสกุล', 'error');
        return;
      }

      if (!/^[0-9]{10}$/.test(newProfileData.phone)) {
        showNotification('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก', 'error');
        return;
      }

      if (!newProfileData.address.street.trim() || !newProfileData.address.district.trim() || 
          !newProfileData.address.province.trim() || !newProfileData.address.postalCode.trim()) {
        showNotification('กรุณากรอกที่อยู่ให้ครบถ้วน', 'error');
        return;
      }

      if (!/^[0-9]{5}$/.test(newProfileData.address.postalCode)) {
        showNotification('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก', 'error');
        return;
      }

      const response = await authAPI.addressProfiles.create(userId, newProfileData);
      console.log('Create profile response:', response);
      
      if (response.data.success) {
        showNotification('สร้างโปรไฟล์ที่อยู่สำเร็จ!', 'success');
        
        // Reload profiles
        await loadAddressProfiles(userId);
        
        // Select the new profile
        setSelectedProfileId(response.data.profile.profileId);
        setUseManualAddress(false);
        
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
      console.error('Create profile error:', error);
      showNotification(error.response?.data?.message || 'ไม่สามารถสร้างโปรไฟล์ได้', 'error');
    }
  };

  // Enhanced deleteAddressProfile with better user ID handling
  const deleteAddressProfile = async (profileId, profileName) => {
    const userId = getUserId();
    
    if (!userId) {
      showNotification('ไม่พบข้อมูลผู้ใช้', 'error');
      return;
    }

    if (!window.confirm(`ต้องการลบโปรไฟล์ "${profileName}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      console.log('Deleting profile for userId:', userId, 'profileId:', profileId);
      const response = await authAPI.addressProfiles.delete(userId, profileId);
      
      if (response.data.success) {
        showNotification('ลบโปรไฟล์สำเร็จ', 'success');
        await loadAddressProfiles(userId);
        
        // Reset selection if deleted profile was selected
        if (selectedProfileId === profileId) {
          setSelectedProfileId('');
          setUseManualAddress(true);
        }
      }
    } catch (error) {
      console.error('Delete profile error:', error);
      showNotification(error.response?.data?.message || 'ไม่สามารถลบโปรไฟล์ได้', 'error');
    }
  };

  // Enhanced setDefaultProfile with better user ID handling
  const setDefaultProfile = async (profileId) => {
    const userId = getUserId();
    
    if (!userId) {
      showNotification('ไม่พบข้อมูลผู้ใช้', 'error');
      return;
    }

    try {
      console.log('Setting default profile for userId:', userId, 'profileId:', profileId);
      const response = await authAPI.addressProfiles.setDefault(userId, profileId);
      
      if (response.data.success) {
        await loadAddressProfiles(userId); // Reload to update default status
        showNotification('ตั้งเป็นที่อยู่หลักสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Set default error:', error);
      showNotification(error.response?.data?.message || 'ไม่สามารถตั้งเป็นที่อยู่หลักได้', 'error');
    }
  };

  // Payment Success Handler
  const handlePaymentSuccess = async (paymentData) => {
    console.log('Payment completed:', paymentData);
    
    setIsCheckingOut(true);
    setCheckoutStep('processing');
    setShowPaymentModal(false);

    try {
      console.log('Order already exists, payment completed!');
      
      setCheckoutStep('success');
      clearCart();
      
      setTimeout(() => {
        setCheckoutStep('cart');
        setIsCheckingOut(false);
        resetStates();
        onClose();
      }, 4000);
      
    } catch (error) {
      console.error('Payment completion error:', error);
      setIsCheckingOut(false);
      setCheckoutStep('address');
      showNotification(`เกิดข้อผิดพลาด: ${error.message || 'กรุณาลองใหม่อีกครั้ง'}`, 'error');
    }
  };

  // Payment Close Handler
  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setPaymentOrderData(null);
  };

  if (!isOpen) return null;

  const shippingCost = getShippingCost();
  const finalTotal = getFinalTotal();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // Enhanced handleCheckout
  const handleCheckout = () => {
    if (!isLoggedIn()) {
      showNotification('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ', 'error');
      return;
    }

    if (isEmpty) {
      showNotification('ตะกร้าสินค้าว่างเปล่า', 'error');
      return;
    }

    setCheckoutStep('address');
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    let finalAddressData;
    
    if (useManualAddress) {
      // Validate manual address
      const requiredFields = ['firstName', 'lastName', 'phone', 'address', 'district', 'province', 'postalCode'];
      const missingFields = requiredFields.filter(field => !shippingAddress[field].trim());
      
      if (missingFields.length > 0) {
        showNotification('กรุณากรอกข้อมูลให้ครบถ้วน: ' + missingFields.join(', '), 'error');
        return;
      }

      finalAddressData = {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: user?.email || '',
        phone: shippingAddress.phone,
        address: {
          street: shippingAddress.address,
          district: shippingAddress.district,
          province: shippingAddress.province,
          postalCode: shippingAddress.postalCode,
          country: 'Thailand',
          notes: shippingAddress.notes
        }
      };
    } else {
      // Use selected profile
      const selectedProfile = addressProfiles.find(p => p.profileId === selectedProfileId);
      
      if (!selectedProfile) {
        showNotification('กรุณาเลือกที่อยู่จัดส่ง', 'error');
        return;
      }

      finalAddressData = {
        firstName: selectedProfile.firstName,
        lastName: selectedProfile.lastName,
        email: user?.email || '',
        phone: selectedProfile.phone,
        address: selectedProfile.address
      };
    }

    try {
      console.log('Creating order before payment...');
      
      console.log('Cart Items for Order:', cartItems);
      console.log('Final Address Data:', finalAddressData);
      console.log('User ID:', getUserId());
      
      const orderData = {
        userId: getUserId(),
        customerInfo: finalAddressData,
        items: cartItems.map(item => {
          console.log('Mapping cart item:', item);
          
          return {
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price
          };
        }),
        pricing: {
          subtotal: totalAmount,
          shipping: shippingCost,
          total: finalTotal
        }
      };

      console.log('Order Data to Send:', JSON.stringify(orderData, null, 2));
      
      const itemsWithoutId = cartItems.filter(item => !item.id);
      if (itemsWithoutId.length > 0) {
        console.error('Cart items missing ID:', itemsWithoutId);
        showNotification('เกิดข้อผิดพลาด: สินค้าในตะกร้าไม่มี ID', 'error');
        return;
      }

      if (!totalAmount || !finalTotal) {
        console.error('Invalid pricing:', { totalAmount, shippingCost, finalTotal });
        showNotification('เกิดข้อผิดพลาดในการคำนวดราคา', 'error');
        return;
      }

      if (!finalAddressData.firstName || !finalAddressData.lastName || !finalAddressData.phone) {
        console.error('Incomplete customer info:', finalAddressData);
        showNotification('ข้อมูลลูกค้าไม่ครบถ้วน', 'error');
        return;
      }

      console.log('All validations passed, creating order...');

      const response = await ordersAPI.create(orderData);
      
      if (response.data.success) {
        const createdOrder = response.data.order;
        console.log('Order created successfully:', createdOrder._id);

        const orderForPayment = {
          orderId: createdOrder._id,
          orderNumber: createdOrder.orderNumber,
          totalAmount: formatCurrency(totalAmount),
          shippingCost: shippingCost === 0 ? 'ฟรี!' : formatCurrency(shippingCost),
          finalTotal: formatCurrency(finalTotal)
        };

        console.log('Opening Payment Modal with data:', orderForPayment);
        
        setPaymentOrderData(orderForPayment);
        setShowPaymentModal(true);
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      
      console.error('Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      let errorMessage = 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(`${errorMessage} กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่`, 'error');
    }
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  // Reset States
  const resetStates = () => {
    setCheckoutStep('cart');
    setIsCheckingOut(false);
    setSelectedProfileId('');
    setUseManualAddress(false);
    setShowCreateProfile(false);
    setShowManageProfiles(false);
    setAddressProfiles([]);
    setShowPaymentModal(false);
    setPaymentOrderData(null);
    hideNotification(); // Hide any active notifications
    setShippingAddress({
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      district: '',
      province: '',
      postalCode: '',
      notes: ''
    });
    setNewProfileData({
      profileName: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: { street: '', district: '', province: '', postalCode: '', notes: '' },
      isDefault: false
    });
  };

  const handleClose = () => {
    resetStates();
    onClose();
  };

  // Render Components
  const renderCartItems = () => (
    <div className="cart-items">
      {cartItems.map(item => (
        <div key={item.id} className="cart-item">
          <div className="cart-item-image">
            <img 
              src={item.image || '/api/placeholder/80/80'} 
              alt={item.name}
            />
          </div>
          
          <div className="cart-item-details">
            <h4 className="cart-item-name">{item.name}</h4>
            <div className="cart-item-price">
              {formatCurrency(item.price)} × {item.quantity}
            </div>
            <div className="cart-item-subtotal">
              รวม: {formatCurrency(item.subtotal)}
            </div>
          </div>
          
          <div className="cart-item-controls">
            <div className="quantity-controls">
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={isCheckingOut}
              >
                -
              </button>
              <span className="quantity-display">{item.quantity}</span>
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                disabled={isCheckingOut || item.quantity >= item.stock}
              >
                +
              </button>
            </div>
            
            <button
              className="remove-btn"
              onClick={() => removeFromCart(item.id)}
              disabled={isCheckingOut}
              title="ลบสินค้า"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCartSummary = () => (
    <div className="cart-summary">
      <div className="summary-row">
        <span>สินค้า ({totalItems} ชิ้น)</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
      
      <div className="summary-row">
        <span>ค่าจัดส่ง (ส่งฟรีขั้นต่ำ 2000 บาท)</span>
        <span>
          {shippingCost === 0 ? (
            <span className="free-shipping">ฟรี!</span>
          ) : (
            formatCurrency(shippingCost)
          )}
        </span>
      </div>

      {totalAmount >= 2000 && shippingCost === 0 && (
        <div className="shipping-notice">
          มากกว่า 2000 บาท ยินดีด้วย! ได้รับการจัดส่งฟรี
        </div>
      )}
      
      <div className="summary-row total-row">
        <span>ยอดรวมทั้งสิ้น</span>
        <span className="total-amount">{formatCurrency(finalTotal)}</span>
      </div>
    </div>
  );

  // Address Profile Selector (รักษาไว้เหมือนเดิม)
  const renderAddressSelector = () => (
    <div className="address-selector">
      <div className="address-options">
        <div className="option-header">
          <h4><MapPin size={16} /> เลือกที่อยู่จัดส่ง</h4>
          <div className="address-actions">
            <button 
              className="btn-secondary"
              onClick={() => setShowCreateProfile(true)}
              disabled={addressProfiles.length >= 5}
            >
              เพิ่มที่อยู่ใหม่ ({addressProfiles.length}/5)
            </button>
            {addressProfiles.length > 0 && (
              <button 
                className="btn-secondary"
                onClick={() => setShowManageProfiles(true)}
              >
                <MapPin size={14} /> จัดการ
              </button>
            )}
          </div>
        </div>

        {loadingProfiles && (
          <div className="loading-profiles">
            <div className="spinner"></div>
            <span>กำลังโหลดที่อยู่...</span>
          </div>
        )}

        {!loadingProfiles && addressProfiles.length > 0 && (
          <div className="profile-list">
            {addressProfiles.map(profile => (
              <div 
                key={profile.profileId}
                className={`profile-item ${selectedProfileId === profile.profileId ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedProfileId(profile.profileId);
                  setUseManualAddress(false);
                }}
              >
                <div className="profile-header">
                  <div className="profile-name">
                    <Home size={16} /> {profile.profileName} {profile.isDefault && <span className="default-badge">หลัก</span>}
                  
                  <input
                    type="radio"
                    name="addressProfile"
                    checked={selectedProfileId === profile.profileId}
                    onChange={() => {}}
                  />
                  </div>
                </div>
                <div className="profile-details">
                  <div><User size={14} /> {profile.firstName} {profile.lastName}</div>
                  <div><Phone size={14} /> {profile.phone}</div>
                  <div><MapPin size={14} /> {profile.address.street}</div>
                  <div><Globe size={14} /> {profile.address.district}, {profile.address.province} {profile.address.postalCode}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div 
          className={`manual-address-option ${useManualAddress ? 'selected' : ''}`}
          onClick={() => {
            setUseManualAddress(true);
            setSelectedProfileId('');
          }}
        >
          <div className="option-header">
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <MapPin size={16} />
    <span>กรอกที่อยู่ใหม่</span>
  </div>
  <input
    type="radio"
    name="addressProfile"
    checked={useManualAddress}
    onChange={() => {}}
  />
</div>
        </div>
      </div>
    </div>
  );

  // Dynamic Header Title
  const getHeaderTitle = () => {
    switch (checkoutStep) {
      case 'address': return <><ShoppingBag size={20} /> ตะกร้าสินค้า - ข้อมูลจัดส่ง</>;
      case 'processing': return <><ShoppingBag size={20} /> ตะกร้าสินค้า - กำลังดำเนินการ</>;
      case 'success': return <><ShoppingBag size={20} /> ตะกร้าสินค้า - สำเร็จ</>;
      default: return <><ShoppingBag size={20} /> ตะกร้าสินค้า</>;
    }
  };

  // Process และ Success components เหมือนเดิม...
  const renderProcessing = () => (
    <div className="processing-container">
      <div className="processing-animation">
        <div className="spinner-large"></div>
      </div>
      <h3>กำลังประมวลผลคำสั่งซื้อ</h3>
      <p>กรุณารอสักครู่...</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="checkout-success">
      <div className="success-icon">
        <CheckCircle size={64} style={{ color: '#22c55e' }} />
      </div>
      <h3>สั่งซื้อสำเร็จ!</h3>
      <p>ขอบคุณสำหรับการสั่งซื้อ</p>
      <p>เราจะจัดส่งสินค้าให้ท่านโดยเร็วที่สุด</p>
      <div className="order-details">
        <p><Package size={16} /> ยอดรวม: {formatCurrency(finalTotal)}</p>
        <p><CreditCard size={16} /> จัดส่งภายใน 2-3 วันทำการ</p>
      </div>
      <div className="success-animation">✨</div>
    </div>
  );

  // Create Profile Modal - CORRECTED VERSION
const renderCreateProfileModal = () => {
  if (!showCreateProfile) return null;

  return (
    <div style={{
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
        {/* Enhanced Header */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #1e40af 100%',
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
          
          {/* Header Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '8px'
            }}>
              <Home size={32} />
            </div>
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

        {/* Form Content */}
        <div style={{ padding: '24px' }}>
          
          {/* Section 1: Profile Name */}
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
                <Pen size={24} />
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
                ชื่อที่จะช่วยให้คุณจำได้ง่าย
              </small>
            </div>
          </div>

          {/* Section 2: Personal Information */}
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
                <User size={24} />
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
                กรอกเบอร์โทรศัพท์ 10 หลัก
              </small>
            </div>
          </div>

          {/* Section 3: Address Information */}
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
                <MapPin size={24} />
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
                เช่น "ตึกสีเหลือง ข้างร้านเซเว่น"
              </small>
            </div>
          </div>

          {/* Section 4: Settings */}
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
                <Settings size={24} />
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
                  ตั้งเป็นที่อยู่หลัก
                </div>
                <small style={{ color: '#6b7280' }}>
                  ที่อยู่หลักจะถูกเลือกโดยอัตโนมัติเมื่อสั่งซื้อ
                </small>
              </div>
            </label>
          </div>
        </div>

        {/* Enhanced Footer */}
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
              <Save size={20} /> บันทึกที่อยู่
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Manage Profiles Modal
  const renderManageProfilesModal = () => {
    if (!showManageProfiles) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content manage-profiles-modal">
          <div className="modal-header">
            <h3><MapPin size={20} /> จัดการที่อยู่</h3>
            <button 
              className="close-btn"
              onClick={() => setShowManageProfiles(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <div className="profiles-management">
              {addressProfiles.map(profile => (
                <div key={profile.profileId} className="manage-profile-item">
                  <div className="profile-info">
                    <div className="profile-title">
                      <Home size={16} strokeWidth={2.5} /> {profile.profileName}
                      {profile.isDefault && <span className="default-badge">หลัก</span>}
                    </div>
                    <div className="profile-details">
                      <div><User size={14} /> {profile.firstName} {profile.lastName}</div>
                      <div><Phone size={14} /> {profile.phone}</div>
                      <div><MapPin size={14} /> {profile.address.street}</div>
                      <div><Globe size={14} /> {profile.address.district}, {profile.address.province} {profile.address.postalCode}</div>
                    </div>
                  </div>
                  
                  <div className="profile-actions">
                    {!profile.isDefault && (
                      <button
                        className="btn-action set-default"
                        onClick={() => setDefaultProfile(profile.profileId)}
                        title="ตั้งเป็นที่อยู่หลัก"
                      >
                        ⭐
                      </button>
                    )}
                    
                    <button
                      className="btn-action delete"
                      onClick={() => deleteAddressProfile(profile.profileId, profile.profileName)}
                      disabled={addressProfiles.length <= 1}
                      title="ลบที่อยู่"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="btn-primary"
              onClick={() => setShowManageProfiles(false)}
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAddressForm = () => (
    <div className="address-form-container">
      {/* Enhanced Checkout Header */}
      <div className="checkout-header">
        <div className="checkout-title">
          <h3><MapPin size={20} /> ข้อมูลการจัดส่ง</h3>
        </div>
        
        {/* Enhanced User Info Card */}
        <div className="user-info-card">
          <div className="user-card-header">
            <div className="user-avatar-large">
              <User size={24} />
            </div>
            <div className="user-card-details">
              <div className="user-card-name">
                {user?.firstName} {user?.lastName || user?.username || 'ผู้ใช้'}
              </div>
              <div className="user-card-role">
                {user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}
              </div>
            </div>
          </div>
          
          <div className="user-card-info">
            <div className="info-item">
              <span className="info-label flex items-center gap-2">
                <Mail size={14} />
                อีเมล:
              </span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label flex items-center gap-2">
                <User size={14} />
                ชื่อผู้ใช้:
              </span>
              <span className="info-value">{user?.username}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Address Profile Selector */}
      {renderAddressSelector()}

      {/* Manual Address Form - Show only when useManualAddress is true */}
      {useManualAddress && (
        <form onSubmit={handleAddressSubmit} className="address-form manual-form">
          <h4><MapPin size={16} /> กรอกที่อยู่ใหม่</h4>
          
          {/* Name Fields */}
          <div className="form-row">
            <div className="form-group">
              <label>ชื่อ *</label>
              <input
                type="text"
                name="firstName"
                value={shippingAddress.firstName}
                onChange={handleInputChange}
                placeholder="ชื่อ"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>นามสกุล *</label>
              <input
                type="text"
                name="lastName"
                value={shippingAddress.lastName}
                onChange={handleInputChange}
                placeholder="นามสกุล"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="form-group">
            <label>เบอร์โทรศัพท์ *</label>
            <input
              type="tel"
              name="phone"
              value={shippingAddress.phone}
              onChange={handleInputChange}
              placeholder="0812345678"
              className="form-input"
              maxLength="10"
              pattern="[0-9]*" 
              onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}  
              required
            />
          </div>

          {/* Address Field */}
          <div className="form-group">
            <label>ที่อยู่ *</label>
            <textarea
              name="address"
              value={shippingAddress.address}
              onChange={handleInputChange}
              placeholder="ที่อยู่, หมู่บ้าน, ซอย, ถนน"
              className="form-textarea"
              rows="3"
              required
            />
          </div>

          {/* District Field */}
          <div className="form-row">
            <div className="form-group">
              <label>แขวง/ตำบล, เขต/อำเภอ *</label>
              <input
                type="text"
                name="district"
                value={shippingAddress.district}
                onChange={handleInputChange}
                placeholder="บางจาก, พระโขนง"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Province and Postal Code */}
          <div className="form-row">
            <div className="form-group">
              <label>จังหวัด *</label>
              <input
                type="text"
                name="province"
                value={shippingAddress.province}
                onChange={handleInputChange}
                placeholder="จังหวัด"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>รหัสไปรษณีย์ *</label>
              <input
                type="text"
                name="postalCode"
                value={shippingAddress.postalCode}
                onChange={handleInputChange}
                placeholder="12345"
                maxLength="5"
                pattern="[0-9]*"
                onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Notes Field */}
          <div className="form-group">
            <label>หมายเหตุเพิ่มเติม</label>
            <textarea
              name="notes"
              value={shippingAddress.notes}
              onChange={handleInputChange}
              placeholder="หมายเหตุสำหรับการจัดส่ง (ไม่บังคับ)"
              className="form-textarea"
              rows="2"
            />
          </div>
        </form>
      )}

      {/* Order Summary */}
      <div className="order-summary">
        <h4><Package size={16} /> สรุปคำสั่งซื้อ</h4>
        <div className="summary-row">
          <span>สินค้า ({totalItems} ชิ้น)</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
        <div className="summary-row">
          <span>ค่าจัดส่ง</span>
          <span>{shippingCost === 0 ? 'ฟรี!' : formatCurrency(shippingCost)}</span>
        </div>
        <div className="summary-total">
          <span>ยอดรวมทั้งสิ้น</span>
          <span>{formatCurrency(finalTotal)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Notification Bar */}
      <NotificationBar
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      {/* Cart Modal */}
      <div className="cart-modal-overlay" onClick={handleClose}>
        <div className="cart-modal" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="cart-modal-header">
            <h2>{getHeaderTitle()}</h2>
            <button className="close-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="cart-modal-content">
            {checkoutStep === 'cart' && (
              <>
                {isEmpty ? (
                  <div className="empty-cart">
                    <div className="empty-cart-icon">
                      <ShoppingBag size={64} style={{ opacity: 0.5 }} />
                    </div>
                    <h3>ตะกร้าสินค้าว่างเปล่า</h3>
                    <p>เพิ่มสินค้าลงตะกร้าเพื่อเริ่มช้อปปิ้ง</p>
                  </div>
                ) : (
                  <>
                    {renderCartItems()}
                    {renderCartSummary()}
                  </>
                )}
              </>
            )}

            {checkoutStep === 'address' && renderAddressForm()}
            {checkoutStep === 'processing' && renderProcessing()}
            {checkoutStep === 'success' && renderSuccess()}
          </div>

          {/* Footer */}
          {!isEmpty && checkoutStep === 'cart' && (
            <div className="cart-modal-footer">
              <button 
                className="clear-cart-btn"
                onClick={clearCart}
                disabled={isCheckingOut}
              >
                <Trash2 size={16} /> ล้างตะกร้า
              </button>
              
              <div className="checkout-actions">
                <button 
                  className="continue-shopping-btn"
                  onClick={handleClose}
                >
                  <ShoppingBag size={16} strokeWidth={2.5} />
                </button>
                
                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || !isLoggedIn()}
                >
                  {!isLoggedIn() ? (
                    <>
                      <User size={16} /> เข้าสู่ระบบเพื่อสั่งซื้อ
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} strokeWidth={2.5} /> ไปชำระเงิน
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 'address' && (
            <div className="cart-modal-footer">
              <button 
                className="back-btn"
                onClick={() => setCheckoutStep('cart')}
                disabled={isCheckingOut}
              >
                ← กลับ
              </button>
              
              <button 
                className="confirm-order-btn"
                onClick={handleAddressSubmit}
                disabled={isCheckingOut || (!useManualAddress && !selectedProfileId)}
              >
                <CreditCard size={16} /> ไปชำระเงิน
              </button>
            </div>
          )}

          {/* Modals */}
          {renderCreateProfileModal()}
          {renderManageProfilesModal()}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentClose}
        orderData={paymentOrderData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default CartModal;