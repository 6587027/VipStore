// src/components/ProductList.jsx


import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // ดึงข้อมูลสินค้าจาก API
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await productsAPI.getAll(params);
      
      setProducts(response.data.data || []);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Other'];

  // 🎨 Enhanced Loading Component with Animation
  if (loading) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '20px'
        }}>
          {/* Animated Loading Spinner */}
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          
          {/* Loading Text with Pulse */}
          <div style={{
            fontSize: '1.2rem',
            color: '#6b7280',
            fontWeight: '600',
            animation: 'pulse 2s infinite'
          }}>
            🛍️ กำลังโหลดสินค้า...
          </div>
          
          {/* Loading Dots */}
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {[1, 2, 3].map(dot => (
              <div
                key={dot}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: `bounce 1.4s infinite ease-in-out both`,
                  animationDelay: `${dot * 0.16}s`
                }}
              ></div>
            ))}
          </div>

          {/* CSS Animations */}
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0);
              }
              40% {
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // 🚨 Enhanced Error Component with Server Down Animation
  if (error) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px',
          padding: '40px',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Animated Server Icon */}
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px',
            animation: 'serverShake 2s infinite'
          }}>
            💻 📡 ❌
          </div>

          {/* Error Title with Typing Effect */}
          <h2 style={{
            color: '#dc2626',
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            🚨 Server Shutdown
          </h2>

          {/* Error Description */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #fca5a5',
            marginBottom: '24px',
            maxWidth: '500px',
            textAlign: 'center',
            animation: 'slideIn 0.8s ease-out'
          }}>
            <p style={{ 
              color: '#7f1d1d', 
              margin: '0 0 12px',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              {error}
            </p>
            <p style={{ 
              color: '#991b1b', 
              margin: 0,
              fontSize: '0.9rem'
            }}>
              📡 ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ในขณะนี้
            </p>
            
            {/* {retryCount > 0 && (
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #f59e0b'
              }}>
                <span style={{ color: '#92400e', fontSize: '0.85rem' }}>
                  🔄 ความพยายามครั้งที่: {retryCount}
                </span>
              </div>
            )} */}
          </div>

          {/* Animated Retry Button */}
          {/* <button 
            className="btn-primary" 
            onClick={fetchProducts}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              border: 'none',
              padding: '12px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
              animation: 'buttonPulse 2s infinite',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
            }}
          >
            🔄 ลองเชื่อมต่อใหม่
          </button> */}

          {/* Network Status Indicator */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '25px',
            border: '1px solid #fca5a5'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              animation: 'blink 1s infinite'
            }}></div>
            <span style={{ 
              color: '#7f1d1d', 
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              สถานะ: ออฟไลน์
            </span>
          </div>

          {/* Contact Information */}
<div style={{
  marginTop: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #fca5a5',
  maxWidth: '400px',
  animation: 'fadeIn 1.2s ease-out'
}}>
  <h4 style={{ 
    color: '#7f1d1d', 
    margin: '0 0 8px',
    fontSize: '0.9rem',
    fontWeight: '600'
  }}>
    💡 ต้องการติดต่อผู้ดูแล Website:
  </h4>
  <ul style={{ 
    color: '#991b1b', 
    margin: 0,
    paddingLeft: '16px',
    fontSize: '0.8rem',
    lineHeight: '1.6',
    listStyle: 'none'
  }}>
    <li style={{ marginBottom: '6px' }}>
      👨‍💻 <strong>ภัทร วงศ์ทรัพย์สกุล (Phatra Wongsapsakul)</strong>
    </li>
    {/* <li style={{ marginBottom: '6px' }}>
      📧 Email: <a 
        href="mailto:vip@example.com" 
        style={{ 
          color: '#dc2626', 
          textDecoration: 'underline',
          fontWeight: '500'
        }}
      >
        vip@example.com
      </a>
    </li> */}
    <li style={{ marginBottom: '6px' }}>
      🌐 Website Contact : <a 
        href="https://vippersonalwebsite.vercel.app/contact" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          color: '#dc2626', 
          textDecoration: 'underline',
          fontWeight: '500'
        }}
      >
        Vip Personal Website Contact
      </a>
    </li>
    <li>
      🎓 <span style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
        นักศึกษา ICT ปี 3 มหาวิทยาลัยมหิดล
      </span>
    </li>
  </ul>
</div>

          {/* CSS Animations for Error State */}
          <style jsx>{`
            @keyframes serverShake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
              20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(-30px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            
            @keyframes buttonPulse {
              0% {
                box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
              }
              50% {
                box-shadow: 0 4px 25px rgba(220, 38, 38, 0.5);
              }
              100% {
                box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
              }
            }
            
            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0.3; }
            }
            
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Filter Section */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>กรองสินค้าตามหมวดหมู่</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            className={selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setSelectedCategory('')}
          >
            ทั้งหมด
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Count */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#1f2937' }}>
          สินค้าทั้งหมด ({products.length} รายการ)
          {selectedCategory && ` - หมวดหมู่: ${selectedCategory}`}
        </h2>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '16px' }}>ไม่พบสินค้า</h3>
          <p style={{ color: '#9ca3af' }}>
            {selectedCategory 
              ? `ไม่มีสินค้าในหมวดหมู่ ${selectedCategory}` 
              : 'ยังไม่มีสินค้าในระบบ'
            }
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;