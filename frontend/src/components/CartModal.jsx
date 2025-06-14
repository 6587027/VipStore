// frontend/src/components/CartModal.jsx - Production-Ready Version
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartModal.css';
import { ordersAPI, authAPI } from '../services/api'; 

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
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'address', 'processing', 'success'

  // 🆕 Address Profile Management States
  const [addressProfiles, setAddressProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showManageProfiles, setShowManageProfiles] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

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

  // Manual Address Form State (existing)
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

  // 🔧 Helper function to get user ID safely
  const getUserId = () => {
    if (!user) {
      console.log('🔍 No user object found');
      return null;
    }
    
    const userId = user.id || user._id || user.userId;
    console.log('🔍 User ID resolution:', {
      'user.id': user.id,
      'user._id': user._id,  
      'user.userId': user.userId,
      'final userId': userId,
      'user object': user
    });
    
    return userId;
  };

  // 🔧 Enhanced useEffect with better user checking
  useEffect(() => {
    console.log('🔍 useEffect triggered:', { isLoggedIn: isLoggedIn(), user, checkoutStep });
    
    if (isLoggedIn() && user && checkoutStep === 'address') {
      const userId = getUserId();
      
      if (userId) {
        console.log('✅ Valid user ID found, loading profiles:', userId);
        loadAddressProfiles(userId);
      } else {
        console.log('⚠️ No valid user ID, using manual address form');
        setUseManualAddress(true);
      }
    }
  }, [isLoggedIn, user, checkoutStep]);

  // 🔧 Enhanced loadAddressProfiles with userId parameter
  const loadAddressProfiles = async (userId) => {
    if (!userId) {
      console.error('❌ loadAddressProfiles: No userId provided');
      setUseManualAddress(true);
      return;
    }

    setLoadingProfiles(true);
    console.log('📍 Loading address profiles for userId:', userId);
    
    try {
      const response = await authAPI.addressProfiles.getAll(userId);
      console.log('📍 Address profiles response:', response);
      
      if (response.data.success) {
        setAddressProfiles(response.data.addressProfiles);
        
        // Auto-select default profile
        const defaultProfile = response.data.addressProfiles.find(p => p.isDefault);
        if (defaultProfile) {
          setSelectedProfileId(defaultProfile.profileId);
          setUseManualAddress(false);
          console.log('✅ Auto-selected default profile:', defaultProfile.profileName);
        } else if (response.data.addressProfiles.length === 0) {
          // No profiles exist, show manual form
          setUseManualAddress(true);
          console.log('ℹ️ No profiles found, using manual form');
        }
      }
    } catch (error) {
      console.error('❌ Load address profiles error:', error);
      setUseManualAddress(true); // Fallback to manual
    } finally {
      setLoadingProfiles(false);
    }
  };

  // 🔧 Enhanced createAddressProfile with better user ID handling
  const createAddressProfile = async () => {
    const userId = getUserId();
    
    if (!userId) {
      alert('❌ ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      console.error('❌ createAddressProfile: No valid user ID');
      return;
    }

    console.log('📤 Creating address profile for userId:', userId);

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
      console.log('📤 Create profile response:', response);
      
      if (response.data.success) {
        alert('✅ สร้างโปรไฟล์ที่อยู่สำเร็จ!');
        
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
      console.error('❌ Create profile error:', error);
      alert(`❌ ${error.response?.data?.message || 'ไม่สามารถสร้างโปรไฟล์ได้'}`);
    }
  };

  // 🔧 Enhanced deleteAddressProfile with better user ID handling
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
      console.log('🗑️ Deleting profile for userId:', userId, 'profileId:', profileId);
      const response = await authAPI.addressProfiles.delete(userId, profileId);
      
      if (response.data.success) {
        alert('✅ ลบโปรไฟล์สำเร็จ');
        await loadAddressProfiles(userId);
        
        // Reset selection if deleted profile was selected
        if (selectedProfileId === profileId) {
          setSelectedProfileId('');
          setUseManualAddress(true);
        }
      }
    } catch (error) {
      console.error('❌ Delete profile error:', error);
      alert(`❌ ${error.response?.data?.message || 'ไม่สามารถลบโปรไฟล์ได้'}`);
    }
  };

  // 🔧 Enhanced setDefaultProfile with better user ID handling
  const setDefaultProfile = async (profileId) => {
    const userId = getUserId();
    
    if (!userId) {
      alert('❌ ไม่พบข้อมูลผู้ใช้');
      return;
    }

    try {
      console.log('⭐ Setting default profile for userId:', userId, 'profileId:', profileId);
      const response = await authAPI.addressProfiles.setDefault(userId, profileId);
      
      if (response.data.success) {
        await loadAddressProfiles(userId); // Reload to update default status
        alert('✅ ตั้งเป็นที่อยู่หลักสำเร็จ');
      }
    } catch (error) {
      console.error('❌ Set default error:', error);
      alert(`❌ ${error.response?.data?.message || 'ไม่สามารถตั้งเป็นที่อยู่หลักได้'}`);
    }
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
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      return;
    }

    if (isEmpty) {
      alert('ตะกร้าสินค้าว่างเปล่า');
      return;
    }

    setCheckoutStep('address');
  };

  // Enhanced handleAddressSubmit
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    let finalAddressData;
    
    if (useManualAddress) {
      // Validate manual address
      const requiredFields = ['firstName', 'lastName', 'phone', 'address', 'district', 'province', 'postalCode'];
      const missingFields = requiredFields.filter(field => !shippingAddress[field].trim());
      
      if (missingFields.length > 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
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
        alert('กรุณาเลือกที่อยู่จัดส่ง');
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

    setIsCheckingOut(true);
    setCheckoutStep('processing');

    try {
      // เตรียมข้อมูล Order with enhanced user ID handling
      const userId = getUserId();
      
      const orderData = {
        userId: userId,
        customerInfo: finalAddressData,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        pricing: {
          subtotal: totalAmount,
          shipping: shippingCost,
          total: finalTotal
        }
      };

      console.log('📦 Creating order:', orderData);
      const response = await ordersAPI.create(orderData);
      
      if (response.data.success) {
        console.log('✅ Order created successfully:', response.data.order);
        
        setCheckoutStep('success');
        clearCart();
        
        setTimeout(() => {
          setCheckoutStep('cart');
          setIsCheckingOut(false);
          resetStates();
          onClose();
        }, 4000);
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
      
    } catch (error) {
      console.error('❌ Checkout error:', error);
      setIsCheckingOut(false);
      setCheckoutStep('address');
      alert(`เกิดข้อผิดพลาดในการสั่งซื้อ: ${error.message || 'กรุณาลองใหม่อีกครั้ง'}`);
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

  // Render Components (keeping all existing render functions unchanged)
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
              🗑️
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
        <span>ค่าจัดส่ง</span>
        <span>
          {shippingCost === 0 ? (
            <span className="free-shipping">ฟรี!</span>
          ) : (
            formatCurrency(shippingCost)
          )}
        </span>
      </div>
      
      {totalAmount >= 1000 && shippingCost === 0 && (
        <div className="shipping-notice">
          🎉 ยินดีด้วย! ได้รับการจัดส่งฟรี
        </div>
      )}
      
      <div className="summary-row total-row">
        <span>ยอดรวมทั้งสิ้น</span>
        <span className="total-amount">{formatCurrency(finalTotal)}</span>
      </div>
    </div>
  );

  // Address Profile Selector
  const renderAddressSelector = () => (
    <div className="address-selector">
      <div className="address-options">
        <div className="option-header">
          <h4>📍 เลือกที่อยู่จัดส่ง</h4>
          <div className="address-actions">
            <button 
              className="btn-secondary"
              onClick={() => setShowCreateProfile(true)}
              disabled={addressProfiles.length >= 5}
            >
              ➕ เพิ่มที่อยู่ใหม่ ({addressProfiles.length}/5)
            </button>
            {addressProfiles.length > 0 && (
              <button 
                className="btn-secondary"
                onClick={() => setShowManageProfiles(true)}
              >
                ⚙️ จัดการ
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
                    📍 {profile.profileName}
                    {profile.isDefault && <span className="default-badge">หลัก</span>}
                  </div>
                  <input
                    type="radio"
                    name="addressProfile"
                    checked={selectedProfileId === profile.profileId}
                    onChange={() => {}}
                  />
                </div>
                <div className="profile-details">
                  <div>{profile.firstName} {profile.lastName}</div>
                  <div>{profile.phone}</div>
                  <div>{profile.address.street}, {profile.address.district}</div>
                  <div>{profile.address.province} {profile.address.postalCode}</div>
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
            <span>✏️ กรอกที่อยู่ใหม่</span>
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

  // Create Profile Modal
  const renderCreateProfileModal = () => {
    if (!showCreateProfile) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content create-profile-modal">
          <div className="modal-header">
            <h3>➕ เพิ่มที่อยู่ใหม่</h3>
            <button 
              className="close-btn"
              onClick={() => setShowCreateProfile(false)}
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label>ชื่อโปรไฟล์ *</label>
              <input
                type="text"
                name="profileName"
                value={newProfileData.profileName}
                onChange={handleNewProfileInputChange}
                placeholder="เช่น บ้าน, ที่ทำงาน, หอพัก"
                className="form-input"
                maxLength="30"
              />
              <small>ชื่อโปรไฟล์เพื่อให้ง่ายต่อการจำ</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ชื่อ *</label>
                <input
                  type="text"
                  name="firstName"
                  value={newProfileData.firstName}
                  onChange={handleNewProfileInputChange}
                  placeholder="ชื่อ"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>นามสกุล *</label>
                <input
                  type="text"
                  name="lastName"
                  value={newProfileData.lastName}
                  onChange={handleNewProfileInputChange}
                  placeholder="นามสกุล"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>เบอร์โทรศัพท์ *</label>
              <input
                type="tel"
                name="phone"
                value={newProfileData.phone}
                onChange={handleNewProfileInputChange}
                placeholder="0812345678"
                className="form-input"
                maxLength="10"
                pattern="[0-9]*"
                onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
              />
            </div>

            <div className="form-group">
              <label>ที่อยู่ *</label>
              <textarea
                name="address.street"
                value={newProfileData.address.street}
                onChange={handleNewProfileInputChange}
                placeholder="บ้านเลขที่, หมู่บ้าน, ซอย, ถนน"
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>เขต/อำเภอ *</label>
                <input
                  type="text"
                  name="address.district"
                  value={newProfileData.address.district}
                  onChange={handleNewProfileInputChange}
                  placeholder="เขต/อำเภอ"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>จังหวัด *</label>
                <input
                  type="text"
                  name="address.province"
                  value={newProfileData.address.province}
                  onChange={handleNewProfileInputChange}
                  placeholder="จังหวัด"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>รหัสไปรษณีย์ *</label>
              <input
                type="text"
                name="address.postalCode"
                value={newProfileData.address.postalCode}
                onChange={handleNewProfileInputChange}
                placeholder="12345"
                className="form-input"
                maxLength="5"
                pattern="[0-9]*"
                onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
              />
            </div>

            <div className="form-group">
              <label>หมายเหตุเพิ่มเติม</label>
              <textarea
                name="address.notes"
                value={newProfileData.address.notes}
                onChange={handleNewProfileInputChange}
                placeholder="หมายเหตุสำหรับการจัดส่ง (ไม่บังคับ)"
                className="form-textarea"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={newProfileData.isDefault}
                  onChange={handleNewProfileInputChange}
                />
                ตั้งเป็นที่อยู่หลัก
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="btn-secondary"
              onClick={() => setShowCreateProfile(false)}
            >
              ยกเลิก
            </button>
            <button 
              className="btn-primary"
              onClick={createAddressProfile}
            >
              ✅ บันทึกที่อยู่
            </button>
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
            <h3>⚙️ จัดการที่อยู่</h3>
            <button 
              className="close-btn"
              onClick={() => setShowManageProfiles(false)}
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="profiles-management">
              {addressProfiles.map(profile => (
                <div key={profile.profileId} className="manage-profile-item">
                  <div className="profile-info">
                    <div className="profile-title">
                      📍 {profile.profileName}
                      {profile.isDefault && <span className="default-badge">หลัก</span>}
                    </div>
                    <div className="profile-details">
                      <div>{profile.firstName} {profile.lastName}</div>
                      <div>{profile.phone}</div>
                      <div>{profile.address.street}</div>
                      <div>{profile.address.district}, {profile.address.province} {profile.address.postalCode}</div>
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
                      🗑️
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

  // 🆕 Enhanced Address Form with Profile Integration
  const renderAddressForm = () => (
    <div className="address-form-container">
      <div className="checkout-header">
        <h3>🚚 ข้อมูลการจัดส่ง</h3>
        <div className="user-info">
         <p style={{ color: '#1f2937', fontWeight: '700', fontSize: '0.9rem' }}>
            👤 สั่งโดย: {user?.firstName || user?.username}
          </p>
          <p style={{ color: '#1f2937', fontWeight: '700', fontSize: '0.9rem' }}>
            📧 อีเมล: {user?.email}
          </p>
        </div>
      </div>

      {/* 🆕 Address Profile Selector */}
      {renderAddressSelector()}

      {/* Manual Address Form - Show only when useManualAddress is true */}
      {useManualAddress && (
        <form onSubmit={handleAddressSubmit} className="address-form manual-form">
          <h4>✏️ กรอกที่อยู่ใหม่</h4>
          
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

          <div className="form-row">
            <div className="form-group">
              <label>เขต/อำเภอ *</label>
              <input
                type="text"
                name="district"
                value={shippingAddress.district}
                onChange={handleInputChange}
                placeholder="เขต/อำเภอ"
                className="form-input"
                required
              />
            </div>
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
                className="form-input"
                required
              />
            </div>
          </div>

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
        <h4>📋 สรุปคำสั่งซื้อ</h4>
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

  // Processing Component (existing)
  const renderProcessing = () => (
    <div className="processing-container">
      <div className="processing-animation">
        <div className="spinner-large"></div>
      </div>
      <h3>⏳ กำลังประมวลผลคำสั่งซื้อ</h3>
      <p>กรุณารอสักครู่...</p>
    </div>
  );

  // Success Component (existing)
  const renderSuccess = () => (
    <div className="checkout-success">
      <div className="success-icon">🎉</div>
      <h3>สั่งซื้อสำเร็จ!</h3>
      <p>ขอบคุณสำหรับการสั่งซื้อ</p>
      <p>เราจะจัดส่งสินค้าให้ท่านโดยเร็วที่สุด</p>
      <div className="order-details">
        <p>📦 ยอดรวม: {formatCurrency(finalTotal)}</p>
        <p>🚚 จัดส่งภายใน 2-3 วันทำการ</p>
      </div>
      <div className="success-animation">✨</div>
    </div>
  );

  // Dynamic Header Title
  const getHeaderTitle = () => {
    switch (checkoutStep) {
      case 'address': return '🛒 ตะกร้าสินค้า - ข้อมูลจัดส่ง';
      case 'processing': return '🛒 ตะกร้าสินค้า - กำลังดำเนินการ';
      case 'success': return '🛒 ตะกร้าสินค้า - สำเร็จ';
      default: return '🛒 ตะกร้าสินค้า';
    }
  };

  return (
    <div className="cart-modal-overlay" onClick={handleClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-modal-header">
          <h2>{getHeaderTitle()}</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {/* Content */}
        <div className="cart-modal-content">
          {checkoutStep === 'cart' && (
            <>
              {isEmpty ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
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
              🗑️ ล้างตะกร้า
            </button>
            
            <div className="checkout-actions">
              <button 
                className="continue-shopping-btn"
                onClick={handleClose}
              >
                🛍️ ช้อปต่อ
              </button>
              
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={isCheckingOut || !isLoggedIn()}
              >
                {!isLoggedIn() ? '🔐 เข้าสู่ระบบเพื่อสั่งซื้อ' : '🛒 ไปชำระเงิน'}
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
              ✅ ยืนยันการสั่งซื้อ
            </button>
          </div>
        )}

        {/* 🆕 Modals */}
        {renderCreateProfileModal()}
        {renderManageProfilesModal()}
      </div>
    </div>
  );
};

export default CartModal;