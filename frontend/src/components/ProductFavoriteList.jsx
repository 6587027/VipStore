// frontend/src/components/ProductFavoriteList.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { authAPI } from '../services/api'; 
import { Star, ShoppingCart, Trash2, AlertCircle } from 'lucide-react';
import './ProductFavoriteList.css';

const ProductFavoriteList = ({ onProductClick, onGoShopping }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true); // เริ่มต้นเป็น true
  const [actionLoading, setActionLoading] = useState(null); // สำหรับ Loading ตอนกดปุ่ม

  // โหลดข้อมูลจริงเมื่อ Component ถูกเรียก
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
        
      // -------------------------------------------------------
      // 🚧 [TEST MODE] Mock Data 5 รายการ สำหรับทดสอบ UI
      // -------------------------------------------------------

    //   const mockFavorites = [
    //     {
    //       _id: 'mock_1',
    //       name: 'หูฟังไร้สาย Pro Max (Noise Cancelling)',
    //       price: 5900,
    //       image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    //       category: 'Electronics',
    //       stock: 15 // ✅ มีของ
    //     },
    //     {
    //       _id: 'mock_2',
    //       name: 'นาฬิกา Smart Watch Gen 5 (Black)',
    //       price: 3500,
    //       image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    //       category: 'Watches',
    //       stock: 0 // ❌ สินค้าหมด (ทดสอบปุ่มเทา + Overlay)
    //     },
    //     {
    //       _id: 'mock_3',
    //       name: 'MacBook Pro M4 14" (Space Black)',
    //       price: 59900,
    //       image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500&q=80',
    //       category: 'Computers',
    //       stock: 3 // ⚠️ เหลือน้อย (ทดสอบ Logic ถ้ามี)
    //     },
    //     {
    //       _id: 'mock_4',
    //       name: 'สายชาร์จ Fast Charge Type-C (1M)',
    //       price: 190,
    //       image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80',
    //       category: 'Accessories',
    //       stock: 100 // ✅ ราคาถูก
    //     },
    //     {
    //       _id: 'mock_5',
    //       name: 'เสื้อยืด VipStore Limited Edition',
    //       price: 450,
    //       image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
    //       category: 'Clothing',
    //       stock: 50 // ✅ สินค้าแฟชั่น
    //     }
    //   ];

    //   setTimeout(() => {
    //     setFavorites(mockFavorites);
    //     setLoading(false);
    //   }, 800);

      // -------------------------------------------------------
      // 👇 [REAL MODE] ถ้าจะใช้จริง ให้เปิด Comment นี้ แล้วลบข้างบนออก
      // -------------------------------------------------------

      
      const response = await authAPI.favorites.getAll(user._id || user.id);
      if (response.data.success) {
        setFavorites(response.data.favorites || []);
      }
      setLoading(false);
      

    } catch (error) {
      console.error('Error loading favorites:', error);
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (e, productId) => {
    e.stopPropagation(); // ป้องกันการกดทะลุไปที่ Card
    
    // Optimistic Update (ลบออกจากหน้าจอก่อน)
    const prevFavorites = [...favorites];
    setFavorites(prev => prev.filter(item => item._id !== productId));

    try {
      // ✅ ยิง API ลบจริง
      const response = await authAPI.favorites.toggle(user._id || user.id, productId);
      if (!response.data.success) {
        // ถ้า Error ให้คืนค่ากลับมา
        setFavorites(prevFavorites);
        alert('ไม่สามารถลบรายการได้');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      setFavorites(prevFavorites);
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    
    addToCart(product, 1);
    // (Optional) อาจจะใส่ Toast Notification ตรงนี้
    alert(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  };

  if (loading) {
    return (
      <div className="fav-loading-container">
        <div className="fav-spinner"></div>
        <p>กำลังโหลดรายการที่ชอบ...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="fav-empty-state">
        <div className="fav-empty-icon">
          <Star size={64} strokeWidth={1} />
        </div>
        <h3>ยังไม่มีสินค้าที่ถูกใจ</h3>
        <p>กดรูปดาวที่สินค้าที่คุณชอบ เพื่อเก็บไว้ดูภายหลัง</p>
        <button className="fav-go-shopping-btn" onClick={onGoShopping}>
          ไปเลือกซื้อสินค้า
        </button>
      </div>
    );
  }

  return (
    <div className="fav-container animate-fade-in">
      {/* Header */}
      <div className="fav-header-section">
        <h2>
           รายการที่ชื่นชอบ <span className="fav-count-badge">{favorites.length}</span>
        </h2>
        <p>สินค้าที่คุณกดถูกใจไว้ จะแสดงอยู่ที่นี่</p>
      </div>

      {/* Grid Layout */}
      <div className="fav-grid">
        {favorites.map((product) => (
          <div key={product._id} className="fav-card">
            
            {/* Image Area */}
            <div 
              className="fav-image-wrapper"
              onClick={() => onProductClick && onProductClick(product._id)}
            >
              <img 
                src={product.image || '/api/placeholder/400/400'} 
                alt={product.name}
                onError={(e) => { e.target.src = '/api/placeholder/400/400'; }}
              />
              
              {product.stock === 0 && (
                <div className="fav-out-of-stock">สินค้าหมด</div>
              )}
            </div>

            {/* Content Area */}
            <div className="fav-content">
              <div className="fav-info">
                <span className="fav-category">{product.category}</span>
                <h4 onClick={() => onProductClick && onProductClick(product._id)}>
                  {product.name}
                </h4>
                <div className="fav-price">
                  {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(product.price)}
                </div>
              </div>

              {/* Actions */}
              <div className="fav-actions">
                <button 
                  className="fav-remove-btn"
                  onClick={(e) => handleRemoveFavorite(e, product._id)}
                  title="ลบจากรายการโปรด"
                >
                  <Trash2 size={18} />
                </button>
                
                <button 
                  className={`fav-add-cart-btn ${product.stock === 0 ? 'disabled' : ''}`}
                  disabled={product.stock === 0}
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  <ShoppingCart size={18} /> 
                  {product.stock === 0 ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFavoriteList;