// frontend/src/components/AddToCartButton.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './AddToCartButton.css';

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

  const handleAddToCart = async () => {
    if (disabled || isOutOfStock || isAdding) return;

    setIsAdding(true);
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      addToCart(product, showQuantity ? localQuantity : quantity);
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity <= 0) return;
    if (newQuantity > product.stock) return;
    
    setLocalQuantity(newQuantity);
    if (isProductInCart) {
      updateQuantity(product._id, newQuantity);
    }
  };

  const getButtonText = () => {
    if (isAdding) return 'กำลังเพิ่ม...';
    if (showSuccess) return 'เพิ่มแล้ว!';
    if (isOutOfStock) return 'สินค้าหมด';
    if (isProductInCart) return `ในตะกร้า (${currentQuantity})`;
    return 'เพิ่มลงตะกร้า';
  };

  const getButtonIcon = () => {
    if (isAdding) return '⏳';
    if (showSuccess) return '✅';
    if (isOutOfStock) return '❌';
    if (isProductInCart) return '✓';
    return '🛒';
  };

  const buttonClasses = [
    'add-to-cart-button',
    `variant-${variant}`,
    `size-${size}`,
    isAdding && 'loading',
    showSuccess && 'success',
    isOutOfStock && 'out-of-stock',
    isProductInCart && 'in-cart',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="add-to-cart-container">
      {/* Stock Status */}
      {isLowStock && !isOutOfStock && (
        <div className="stock-warning">
          ⚠️ เหลือ {product.stock} ชิ้น
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
              max={product.stock || 99}
              value={localQuantity}
              onChange={(e) => handleUpdateQuantity(parseInt(e.target.value) || 1)}
              className="quantity-input"
            />
            <button
              type="button"
              className="quantity-btn increase"
              onClick={() => handleUpdateQuantity(localQuantity + 1)}
              disabled={localQuantity >= (product.stock || 99)}
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
        disabled={disabled || isOutOfStock || isAdding}
        title={isOutOfStock ? 'สินค้าหมด' : 'เพิ่มสินค้าลงตะกร้า'}
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
            onClick={() => updateQuantity(product._id, currentQuantity - 1)}
            disabled={currentQuantity <= 1}
            title="ลดจำนวน"
          >
            -
          </button>
          <span className="current-quantity">{currentQuantity}</span>
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => increaseQuantity(product._id)}
            disabled={currentQuantity >= (product.stock || 99)}
            title="เพิ่มจำนวน"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;