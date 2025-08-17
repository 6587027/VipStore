// frontend/src/components/AddToCartButton.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './AddToCartButton.css';

import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Lock,
  Loader2
} from 'lucide-react';

const AddToCartButton = ({ 
  product, 
  quantity = 1, 
  variant = 'primary',
  size = 'medium',
  showQuantity = false,
  disabled = false,
  className = ''
}) => {
  const { 
    addToCart, 
    isInCart, 
    getItemQuantity, 
    increaseQuantity,
    updateQuantity 
  } = useCart();
  
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(quantity);

  const isProductInCart = isInCart(product._id);
  const currentQuantity = getItemQuantity(product._id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;
  
  // 🆕 เพิ่ม Stock Validation Logic
  const quantityToAdd = showQuantity ? localQuantity : quantity;
  const totalAfterAdd = currentQuantity + quantityToAdd;
  const availableStock = product.stock - currentQuantity;
  const canAddToCart = !isOutOfStock && totalAfterAdd <= product.stock && availableStock > 0;

  const handleAddToCart = async () => {
    if (disabled || isOutOfStock || isAdding) return;

    // 🆕 ตรวจสอบ Stock Validation ก่อนเพิ่ม
    if (!canAddToCart) {
      if (isOutOfStock) {
        alert('สินค้าหมดแล้ว ไม่สามารถเพิ่มได้');
      } else if (currentQuantity >= product.stock) {
        alert(`ไม่สามารถเพิ่มสินค้าได้อีก คุณมีสินค้านี้ในตะกร้าแล้ว ${currentQuantity} ชิ้น (สต็อกทั้งหมด ${product.stock} ชิ้น)`);
      } else if (totalAfterAdd > product.stock) {
        alert(`ไม่สามารถเพิ่มได้ ${quantityToAdd} ชิ้น เหลือในสต็อกอีกแค่ ${availableStock} ชิ้น`);
      }
      return;
    }

    setIsAdding(true);
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      addToCart(product, quantityToAdd);
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มสินค้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity <= 0) return;
    
    // 🆕 เพิ่มการตรวจสอบ stock ในการอัพเดต quantity
    if (newQuantity > product.stock) {
      alert(`ไม่สามารถเพิ่มได้ เหลือในสต็อกแค่ ${product.stock} ชิ้น`);
      return;
    }
    
    setLocalQuantity(newQuantity);
    if (isProductInCart) {
      updateQuantity(product._id, newQuantity);
    }
  };

  const handleQuickIncrease = () => {
    // 🆕 ตรวจสอบ stock ก่อนเพิ่มใน quick actions
    if (currentQuantity >= product.stock) {
      alert(`ไม่สามารถเพิ่มได้อีก เหลือในสต็อกแค่ ${product.stock} ชิ้น และคุณมีในตะกร้าแล้ว ${currentQuantity} ชิ้น`);
      return;
    }
    increaseQuantity(product._id);
  };

  const handleQuickDecrease = () => {
    if (currentQuantity <= 1) return;
    updateQuantity(product._id, currentQuantity - 1);
  };

  const getButtonText = () => {
    if (isAdding) return 'กำลังเพิ่ม...';
    if (showSuccess) return 'เพิ่มแล้ว!';
    if (isOutOfStock) return 'สินค้าหมด';
    if (isProductInCart) {
      // 🆕 แสดงสถานะการเต็มสต็อก
      if (currentQuantity >= product.stock) {
        return `เต็มแล้ว (${currentQuantity}/${product.stock})`;
      }
      return `ในตะกร้า (${currentQuantity}/${product.stock})`;
    }
    // 🆕 แสดงจำนวนที่เหลือ
    if (showQuantity && availableStock > 0) {
      return `เพิ่มลงตะกร้า (เหลือ ${availableStock})`;
    }
    return 'เพิ่มลงตะกร้า';
  };

  const getButtonIcon = () => {
  if (isAdding) return <Loader2 className="w-4 h-4 animate-spin" />;
  if (showSuccess) return <CheckCircle className="w-4 h-4" />;
  if (isOutOfStock) return <XCircle className="w-4 h-4" />;
  if (isProductInCart && currentQuantity >= product.stock) return <Lock className="w-4 h-4" />;
  if (isProductInCart) return <CheckCircle className="w-4 h-4" />;
  return <ShoppingCart className="w-4 h-4" />;
};

  const buttonClasses = [
    'add-to-cart-button',
    `variant-${variant}`,
    `size-${size}`,
    isAdding && 'loading',
    showSuccess && 'success',
    isOutOfStock && 'out-of-stock',
    isProductInCart && 'in-cart',
    currentQuantity >= product.stock && 'stock-full', // 🆕 CSS class เมื่อเต็ม
    !canAddToCart && 'disabled', // 🆕 disabled เมื่อไม่สามารถเพิ่มได้
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="add-to-cart-container">
      {/* Stock Status */}
      {isLowStock && !isOutOfStock && (
  <div className="stock-warning">
    <AlertTriangle className="w-4 h-4" />
    <span>เหลือ {product.stock} ชิ้น</span>
  </div>
)}

      {/* 🆕 แสดงสถานะตะกร้าเมื่อมีสินค้าในตะกร้าแล้ว */}
      {isProductInCart && (
        <div className="cart-status">
          <ShoppingCart className="w-4 h-4" />
          ในตะกร้า: {currentQuantity} ชิ้น | เหลือ: {availableStock} ชิ้น
        </div>
      )}

      {/* Quantity Selector (if enabled) */}
      {showQuantity && !isOutOfStock && (
        <div className="quantity-selector">
          <label className="quantity-label">จำนวน:</label>
          <div className="quantity-controls">
            <button
              type="button"
              className="quantity-btn decrease"
              onClick={() => handleUpdateQuantity(localQuantity - 1)}
              disabled={localQuantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={Math.min(product.stock, availableStock + localQuantity)} // 🆕 จำกัด max
              value={localQuantity}
              onChange={(e) => handleUpdateQuantity(parseInt(e.target.value) || 1)}
              className="quantity-input"
            />
            <button
              type="button"
              className="quantity-btn increase"
              onClick={() => handleUpdateQuantity(localQuantity + 1)}
              disabled={localQuantity >= Math.min(product.stock, availableStock + localQuantity)} // 🆕 จำกัด max
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        type="button"
        className={buttonClasses}
        onClick={handleAddToCart}
        disabled={disabled || !canAddToCart || isAdding} // 🆕 เพิ่ม !canAddToCart
        title={
          isOutOfStock ? 'สินค้าหมด' : 
          !canAddToCart ? 'ไม่สามารถเพิ่มสินค้าได้' : 
          'เพิ่มสินค้าลงตะกร้า'
        }
      >
        <span className="button-icon">
          {getButtonIcon()}
        </span>
        <span className="button-text">
          {getButtonText()}
        </span>
        
        {/* Loading spinner */}
        {isAdding && (
          <span className="loading-spinner">
            <div className="spinner"></div>
          </span>
        )}
      </button>

      {/* Quick Actions (for items already in cart) */}
      {isProductInCart && !showQuantity && (
        <div className="quick-actions">
          <button
            type="button"
            className="quick-action-btn"
            onClick={handleQuickDecrease}
            disabled={currentQuantity <= 1}
            title="ลดจำนวน"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="current-quantity">{currentQuantity}</span>
          <button
            type="button"
            className="quick-action-btn"
            onClick={handleQuickIncrease}
            disabled={currentQuantity >= product.stock}
            title={currentQuantity >= product.stock ? 'ไม่สามารถเพิ่มได้ (เต็มสต็อก)' : 'เพิ่มจำนวน'}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;