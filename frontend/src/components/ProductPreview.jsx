// frontend/src/components/ProductPreview.jsx - FIXED VERSION WITH AUTO SCROLL
import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductPreview.css';

import { Search, Filter, Package, DollarSign, BarChart3, RotateCcw, Sparkles, ChevronDown , Package2Icon , File, ShoppingCartIcon } from 'lucide-react';

const ProductPreview = ({ productId, onBack, onShowBackButton }) => {
  console.log('🔍 ProductPreview rendered with productId:', productId);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const { addToCart, getCartItemQuantity } = useCart();
  const { user } = useAuth();

  // ✨ SCROLL TO TOP WHEN COMPONENT LOADS
  useEffect(() => {
    console.log('🔝 Scrolling to top of page...');
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // เลื่อนอย่างนุ่มนวล
    });
    
    // Reset page position for instant scroll (fallback)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [productId]); // ✨ Trigger เมื่อ productId เปลี่ยน

  // ✨ Notify parent to show back button in header
  useEffect(() => {
    if (onShowBackButton && typeof onShowBackButton === 'function') {
      console.log('📤 Notifying parent to show back button in header...');
      onShowBackButton(true, handleBackClick);
    }
    
    // Cleanup: hide back button when component unmounts
    return () => {
      if (onShowBackButton && typeof onShowBackButton === 'function') {
        console.log('🧹 Hiding back button on component unmount...');
        onShowBackButton(false);
      }
    };
  }, [onShowBackButton]);

  // โหลดข้อมูลสินค้า
  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    } else {
      setError('ไม่พบรหัสสินค้า');
      setLoading(false);
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      console.log('📦 Fetching product details for ID:', productId);
      setLoading(true);
      setError(null);
      
      const response = await productsAPI.getById(productId);
      console.log('✅ Product data received:', response.data);
      
      if (response.data && response.data.data) {
        setProduct(response.data.data);
      } else {
        throw new Error('ไม่พบข้อมูลสินค้า');
      }
    } catch (err) {
      console.error('❌ Error fetching product:', err);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  // Handle Back Button with Smooth Experience
  const handleBackClick = () => {
    console.log('🔙 Back button clicked');
    
    // ✨ เลื่อนไปด้านบนก่อนที่จะกลับ (เผื่อมี animation)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // ✨ รอ animation เสร็จแล้วค่อยกลับ
    setTimeout(() => {
      if (onBack && typeof onBack === 'function') {
        onBack();
      } else {
        // Fallback: ถ้าไม่มี onBack prop ให้ reload หน้า
        window.location.reload();
      }
    }, 200); // รอ 200ms ให้ scroll animation เสร็จ
  };

  // ✨ ส่ง Back Handler ไปยัง Parent Component เพื่อแสดงใน Header
  useEffect(() => {
    if (onBack && typeof onBack === 'function') {
      // Notify parent that we need back button in header
      console.log('📤 Sending back handler to parent...');
    }
  }, [onBack]);

  // จัดการรูปภาพหลายรูป
  const getProductImages = (product) => {
    if (!product?.image) return ['/api/placeholder/400/400'];
    
    // ถ้าเป็น Unsplash URL, สร้างรูปหลายมุมมอง
    if (product.image.includes('unsplash.com')) {
      const baseUrl = product.image.split('?')[0];
      return [
        `${baseUrl}?w=800&h=600&fit=crop`,
        `${baseUrl}?w=800&h=600&fit=crop&crop=top`,
        `${baseUrl}?w=800&h=600&fit=crop&crop=center`,
        `${baseUrl}?w=800&h=600&fit=crop&sat=-100`,
      ];
    }
    
    return [product.image];
  };

  // จัดการจำนวนสินค้า
  const handleQuantityChange = (newQuantity) => {
    if (!product) return;
    
    const currentCartQuantity = getCartItemQuantity(product._id);
    const availableStock = product.stock - currentCartQuantity;
    
    if (newQuantity >= 1 && newQuantity <= availableStock) {
      setQuantity(newQuantity);
    }
  };

  // เพิ่มสินค้าลงตะกร้า
  const handleAddToCart = () => {
    if (!product || quantity <= 0) return;
    
    try {
      addToCart(product, quantity);
      
      // แสดงการแจ้งเตือนสำเร็จ
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      console.log('✅ Added to cart:', product.name, 'Quantity:', quantity);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า');
    }
  };

  // ฟอร์แมตราคา
  const formatPrice = (price) => {
    if (typeof price !== 'number') return '฿0';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  // ถ้าไม่มี productId
  if (!productId) {
    return (
      <div className="product-preview-container">
        <div className="product-preview-error">
          <div className="error-icon">📦❌</div>
          <h3>ไม่มี Product ID</h3>
          <p>กรุณาเลือกสินค้าที่ต้องการดู</p>
          <button className="back-button" onClick={handleBackClick}>
            ← กลับไปหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="product-preview-container">
        <div className="product-preview-loading">
          <div className="loading-spinner"></div>
          <h3>กำลังโหลดข้อมูลสินค้า...</h3>
          <p>กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className="product-preview-container">
        <div className="product-preview-error">
          <div className="error-icon">📦❌</div>
          <h3>ไม่พบสินค้า</h3>
          <p>{error || 'ไม่สามารถโหลดข้อมูลสินค้าได้'}</p>
          <button className="back-button" onClick={handleBackClick}>
            ← กลับไปหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // คำนวณข้อมูลสินค้า
  const images = getProductImages(product);
  const currentCartQuantity = getCartItemQuantity(product._id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;
  const availableStock = Math.max(0, product.stock - currentCartQuantity);

  return (
    <div className="product-preview-container">
      {/* Notification */}
      {showNotification && (
        <div className="add-to-cart-notification">
          <div className="notification-content">
            ✅ เพิ่ม "{product.name}" ลงตะกร้าแล้ว ({quantity} ชิ้น)
          </div>
        </div>
      )}

      {/* Header with Back Button - REMOVED เอาออกแล้ว */}
      {/* ปุ่มกลับจะแสดงใน Main Header แทน */}

      <div className="product-preview-content">
        {/* Image Gallery Section */}
        <div className="product-gallery">
          {/* Main Image */}
          <div className="main-image-container">
            <img
              src={images[selectedImage]}
              alt={product.name || 'สินค้า'}
              className="main-image"
              loading="lazy"
              onError={(e) => {
                e.target.src = '/api/placeholder/400/400';
              }}
            />
            
            {/* Stock Status Badge */}
            {isOutOfStock && (
              <div className="stock-badge out-of-stock-badge">
                สินค้าหมด
              </div>
            )}
            {isLowStock && !isOutOfStock && (
              <div className="stock-badge low-stock-badge">
                เหลือ {product.stock} ชิ้น
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="thumbnail-gallery">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/100/100';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="product-info-section">
          {/* Category */}
          {product.category && (
            <div className="product-category-section">
              <span className="category-badge">
                📦 {product.category}
              </span>
            </div>
          )}

          {/* Product Name */}
          <h1 className="product-title">{product.name || 'ไม่ระบุชื่อสินค้า'}</h1>

          {/* Rating (Mock) */}
          {/* <div className="product-rating">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <span className="rating-text">(4.8) • 48 รีวิว</span>
          </div> */}

          {/* Price Section */}
          <div className="price-section">
            <div className="current-price">
              {formatPrice(product.price)}
            </div>
            {/* <div className="price-badge">🏷️ ราคาพิเศษ</div> */}
          </div>

          {/* Stock Information */}
          <div className="stock-info-section">
            <div className={`stock-status ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
              {isOutOfStock ? '❌ สินค้าหมด' : 
               isLowStock ? `⚠️ เหลือ ${product.stock} ชิ้น` : 
               `✅ มีสินค้า (${product.stock} ชิ้น)`}
            </div>
            {currentCartQuantity > 0 && (
              <div className="cart-info">
                🛒 อยู่ในตะกร้าแล้ว: {currentCartQuantity} ชิ้น
              </div>
            )}
          </div>

          {/* Description */}
          <div className="description-section">
            <h3 className="flex items-center gap-2">
              <File size={20} strokeWidth={2.5} /> รายละเอียดสินค้า
            </h3>

            <div className={`description-text ${showFullDescription ? 'expanded' : ''}`}>
              {product.description || 'ไม่มีรายละเอียดสินค้า'}
            </div>
            {product.description && product.description.length > 100 && (
              <button 
                className="show-more-btn"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'แสดงน้อยลง' : 'แสดงเพิ่มเติม'}
              </button>
            )}
          </div>

          {/* Product Specifications */}
          <div className="specifications-section">
            <h3 className="flex items-center gap-2">
              <BarChart3 size={20} strokeWidth={2.5} /> ข้อมูลสินค้า
            </h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">หมวดหมู่:</span>
                <span className="spec-value">{product.category || 'ไม่ระบุ'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">รหัสสินค้า:</span>
                <span className="spec-value">{product._id?.slice(-8).toUpperCase() || 'N/A'}</span>
              </div>
              
              {/* <div className="spec-item">
                <span className="spec-label">สถานะ:</span>
                <span className="spec-value">
                  {product.isActive !== false ? '✅ วางจำหน่าย' : '❌ หยุดจำหน่าย'}
                </span>
              </div> */}

            </div>
          </div>

          {/* Purchase Section */}
          {!isOutOfStock && availableStock > 0 && (
            <div className="purchase-section">
              <div className="quantity-section">
                <label className="quantity-label">จำนวน:</label>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn decrease"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    className="quantity-btn increase"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= availableStock}
                  >
                    +
                  </button>
                </div>
                <span className="quantity-info">
                  สูงสุด {availableStock} ชิ้น
                </span>
              </div>

              <button 
                className="add-to-cart-main-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock || quantity > availableStock || availableStock <= 0}
              >
                <ShoppingCartIcon /> เพิ่มลงตะกร้า ({quantity} ชิ้น)
              </button>
            </div>
          )}

          {/* Out of Stock Section */}
          {(isOutOfStock || availableStock <= 0) && (
            <div className="out-of-stock-section">
              <div className="out-of-stock-message">
                ⚠️ {isOutOfStock ? 'สินค้าหมดชั่วคราว' : 'สินค้าครบในตะกร้าแล้ว'}
              </div>
              <p>
                {isOutOfStock ? 'กรุณาติดตามข้อมูลการเติมสต็อก' : 'ไม่สามารถเพิ่มสินค้าได้อีก'}
              </p>
            </div>
          )}

          {/* User Actions */}
          {/* <div className="user-actions">
            <button className="action-btn secondary">
              ❤️ เพิ่มลงรายการโปรด (กำลังพัฒนา)
            </button>
            <button className="action-btn secondary">
              📤 แชร์สินค้า (กำลังพัฒนา)
            </button>
          </div> */}
        </div>
      </div>

      {/* Related Products Placeholder */}
      {/* <div className="related-products-section">
        <h3>🔗 สินค้าที่เกี่ยวข้อง</h3>
        <p className="coming-soon">🚧 ฟีเจอร์นี้กำลังพัฒนา</p>
      </div> */}
    </div>
  );
};

export default ProductPreview;