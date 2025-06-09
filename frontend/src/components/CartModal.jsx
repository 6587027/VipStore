// frontend/src/components/CartModal.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartModal.css';
import { ordersAPI } from '../services/api'; 

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

  // 🆕 เพิ่ม Address Form State
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

  // 🆕 แก้ไข handleCheckout ให้ไปหน้า Address Form
  const handleCheckout = () => {
    if (!isLoggedIn()) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      return;
    }

    if (isEmpty) {
      alert('ตะกร้าสินค้าว่างเปล่า');
      return;
    }

    // ไปยังขั้นตอนกรอกที่อยู่
    setCheckoutStep('address');
  };

  //handle Address Submit 
const handleAddressSubmit = async (e) => {
  e.preventDefault();
  
  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'phone', 'address', 'district', 'province', 'postalCode'];
  const missingFields = requiredFields.filter(field => !shippingAddress[field].trim());
  
  if (missingFields.length > 0) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  setIsCheckingOut(true);
  setCheckoutStep('processing');

  try {
    // เตรียมข้อมูล Order
    const orderData = {
      userId: user?.id || user?._id || null,
      customerInfo: {
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
      },
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

    // สร้าง Order ผ่าน API
    const response = await ordersAPI.create(orderData);
    
    if (response.data.success) {
      console.log('✅ Order created successfully:', response.data.order);
      
      // Success
      setCheckoutStep('success');
      clearCart();
      
      setTimeout(() => {
        setCheckoutStep('cart');
        setIsCheckingOut(false);
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
        onClose();
      }, 4000);
    } else {
      throw new Error(response.data.message || 'Failed to create order');
    }
    
  } catch (error) {
    console.error('Checkout error:', error);
    setIsCheckingOut(false);
    setCheckoutStep('address');
    alert(`เกิดข้อผิดพลาดในการสั่งซื้อ: ${error.message || 'กรุณาลองใหม่อีกครั้ง'}`);
  }
};

  // 🆕 Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🆕 Reset Modal State
  const handleClose = () => {
    setCheckoutStep('cart');
    setIsCheckingOut(false);
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
    onClose();
  };

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

  // 🆕 Address Form Component
  const renderAddressForm = () => (
    <div className="address-form-container">
      <div className="checkout-header">
        <h3>🚚 ข้อมูลการจัดส่ง</h3>
        <div className="user-info">
          <p>👤 สั่งโดย: {user?.firstName || user?.username}</p>
          <p>📧 อีเมล: {user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleAddressSubmit} className="address-form">
        <div className="form-row">
          <div className="form-group">
            <label>ชื่อ *</label>
            <input
              type="text"
              name="firstName"
              value={shippingAddress.firstName}
              onChange={handleInputChange}
              placeholder="Name"
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
              placeholder="Surname"
              className = "form-input"
              required
              
            />
          </div>
        </div>

        <div className="form-group">
            <label>เบอร์โทรศัพท์ - Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={shippingAddress.phone}
              onChange={handleInputChange}
              placeholder="+66 Phoene number"
              className="form-input"
              maxLength="10"
              pattern="[0-9]*" 
              onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}  
              required
            />
          </div>

        <div className="form-group">
          <label>ที่อยู่ - Address *</label>
          <textarea
            name="address"
            value={shippingAddress.address}
            onChange={handleInputChange}
            placeholder="ที่อยู่, หมู่บ้าน, ซอย, ถนน (ไม่ต้องใส่จังหวัด)"
            className="form-textarea"
            rows="3"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>เขต/อำเภอ - District *</label>
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
            <label>จังหวัด -iProvince *</label>
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
            <label>รหัสไปรษณีย์ - Post code *</label>
            <input
              type="text"
              name="postalCode"
              value={shippingAddress.postalCode}
              onChange={handleInputChange}
              placeholder="xxxxx"
              maxLength="5"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>หมายเหตุเพิ่มเติม - Additional Notes</label>
          <textarea
            name="notes"
            value={shippingAddress.notes}
            onChange={handleInputChange}
            placeholder="หมายเหตุสำหรับการจัดส่ง (ไม่บังคับ - Optional field)"
            className="form-textarea"
            rows="2"
          />
        </div>

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
      </form>
    </div>
  );

  // 🆕 Processing Component
  const renderProcessing = () => (
    <div className="processing-container">
      <div className="processing-animation">
        <div className="spinner-large"></div>
      </div>
      <h3>⏳ กำลังประมวลผลคำสั่งซื้อ</h3>
      <p>กรุณารอสักครู่...</p>
    </div>
  );

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

  // 🆕 Dynamic Header Title
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
              disabled={isCheckingOut}
            >
              ✅ ยืนยันการสั่งซื้อ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;