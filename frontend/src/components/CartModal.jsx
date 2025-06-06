// frontend/src/components/CartModal.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartModal.css';

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
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'checkout', 'success'

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

  const handleCheckout = async () => {
    if (!isLoggedIn()) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutStep('checkout');

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setCheckoutStep('success');
      clearCart();
      
      setTimeout(() => {
        setCheckoutStep('cart');
        setIsCheckingOut(false);
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      setIsCheckingOut(false);
      setCheckoutStep('cart');
    }
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

  const renderCheckoutForm = () => (
    <div className="checkout-form">
      <h3>🚚 ข้อมูลการจัดส่ง</h3>
      
      <div className="customer-info">
        <div className="info-row">
          <span>👤 ชื่อผู้สั่ง:</span>
          <span>{user?.name || user?.username}</span>
        </div>
        <div className="info-row">
          <span>📧 อีเมล:</span>
          <span>{user?.email}</span>
        </div>
      </div>
      
      <div className="shipping-form">
        <input 
          type="text" 
          placeholder="ที่อยู่จัดส่ง" 
          className="shipping-input"
          disabled={isCheckingOut}
        />
        <input 
          type="text" 
          placeholder="เบอร์โทรศัพท์" 
          className="shipping-input"
          disabled={isCheckingOut}
        />
        <textarea 
          placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
          className="shipping-textarea"
          disabled={isCheckingOut}
        />
      </div>

      {renderCartSummary()}
      
      <div className="checkout-loading">
        {isCheckingOut && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>กำลังประมวลผลคำสั่งซื้อ...</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="checkout-success">
      <div className="success-icon">🎉</div>
      <h3>สั่งซื้อสำเร็จ!</h3>
      <p>ขอบคุณสำหรับการสั่งซื้อ</p>
      <p>เราจะจัดส่งสินค้าให้ท่านโดยเร็วที่สุด</p>
      <div className="success-animation">✨</div>
    </div>
  );

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-modal-header">
          <h2>
            🛒 ตะกร้าสินค้า
            {checkoutStep === 'checkout' && ' - ชำระเงิน'}
            {checkoutStep === 'success' && ' - สำเร็จ'}
          </h2>
          <button className="close-btn" onClick={onClose}>✕</button>
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

          {checkoutStep === 'checkout' && renderCheckoutForm()}
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
                onClick={onClose}
              >
                🛍️ ช้อปต่อ
              </button>
              
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={isCheckingOut || !isLoggedIn()}
              >
                {!isLoggedIn() ? '🔐 เข้าสู่ระบบเพื่อสั่งซื้อ' : '💳 ชำระเงิน'}
              </button>
            </div>
          </div>
        )}

        {checkoutStep === 'checkout' && (
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
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? '⏳ กำลังดำเนินการ...' : '✅ ยืนยันคำสั่งซื้อ'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;