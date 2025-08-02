// src/components/ProductList.jsx  

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '../services/api';
// import ChatButton from './chat/ChatButton';

const ProductList = ({ onProductClick, savedState, onStateUpdate, shouldFetch = true }) => {
  const [products, setProducts] = useState(savedState?.products || []);
  const [loading, setLoading] = useState(savedState?.loading !== undefined ? savedState.loading : true);
  const [selectedCategory, setSelectedCategory] = useState(savedState?.selectedCategory || '');

  const [loadingPhase, setLoadingPhase] = useState('initializing');
  const [serverWakeAttempts, setServerWakeAttempts] = useState(0);
  const [showRealError, setShowRealError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isHotReloading, setIsHotReloading] = useState(false);
  const [lastReloadTime, setLastReloadTime] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [autoReloadEnabled, setAutoReloadEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);


  // ✅ Search & Filter States and 🆕 Advanced Filter States
  const [searchTerm, setSearchTerm] = useState(savedState?.searchTerm || '');
  const [filteredProducts, setFilteredProducts] = useState(savedState?.filteredProducts || []);
  const [priceRange, setPriceRange] = useState(savedState?.priceRange || { min: 0, max: 3000000 });
  const [sortOption, setSortOption] = useState(savedState?.sortOption || '');
  
  // 🆕 Unified Dropdown State
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);


  // --------------------------------------------------------------------------------


  // 🛠️ Maintenance Mode Toggle
  // const MAINTENANCE_MODE = true;


  // ---------------------------------------------------------------------------------



  // ดึงข้อมูลสินค้าจาก API
  useEffect(() => {
  if (shouldFetch && (isInitialLoad || !products.length)) {
    console.log('📡 Fetching products...');
    fetchProducts();
  } else if (savedState?.products?.length && !shouldFetch) {
    console.log('✅ Using saved product data, no fetch needed');
  }
}, [shouldFetch, selectedCategory]);

  // เพิ่มตรงนี้หลัง useState ทั้งหมด:
useEffect(() => {
  if (onStateUpdate) {
    onStateUpdate({
      products,
      loading,
      selectedCategory,
      searchTerm,
      filteredProducts,
      priceRange,
      sortOption,
      retryCount,
      loadingPhase,
      serverWakeAttempts,
      showRealError,
      isInitialLoad
    });
  }
}, [products, loading, selectedCategory, searchTerm, filteredProducts, priceRange, sortOption]);


  // ✅ Enhanced Filter Effect
  useEffect(() => {
    let filtered = products;
    
    // Filter by Category
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }
    
    // Filter by Search Term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by Price Range
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );
    
    // Sort Products
    if (sortOption) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortOption) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'name-az':
            return a.name.localeCompare(b.name);
          case 'name-za':
            return b.name.localeCompare(a.name);
          case 'stock-high':
            return b.stock - a.stock;
          case 'stock-low':
            return a.stock - b.stock;
          default:
            return 0;
        }
      });
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, priceRange, sortOption]);

  // 🆕 Clear All Filters Function
  const clearAllFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setPriceRange({ min: 0, max: 3000000 });
    setSortOption('');
  };

  // 🆕 Get Active Filters Count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (searchTerm.trim()) count++;
    if (priceRange.min > 0 || priceRange.max < 3000000) count++;
    if (sortOption) count++;
    return count;
  };

  // 🆕 Get Price Range for Slider
  const getPriceStats = () => {
    if (products.length === 0) return { min: 0, max: 3000000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  const handleProductClick = (productId) => {
  console.log('🖱️ ProductList - handleProductClick called with ID:', productId);
  
  // 💾 Save scroll position ก่อนไป ProductPreview
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
  // Update parent state with scroll position
  if (onStateUpdate) {
    onStateUpdate({
      products,
      loading,
      selectedCategory,
      searchTerm,
      filteredProducts,
      priceRange,
      sortOption,
      retryCount,
      loadingPhase,
      serverWakeAttempts,
      showRealError,
      isInitialLoad,
      scrollPosition: currentScrollPosition 
    });
  }
  
  if (onProductClick) {
    const productData = products.find(p => p._id === productId);
    onProductClick(productId, productData);
  } else {
    console.warn('⚠️ onProductClick prop not provided');
  }
};

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowRealError(false);
      
      if (isInitialLoad) {
        setLoadingPhase('initializing');
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingPhase('connecting');
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoadingPhase('fetching');
      }
      
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await productsAPI.getAll(params);
      
      setProducts(response.data.data || []);
      setRetryCount(0);
      setServerWakeAttempts(0);
      setIsInitialLoad(false);
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      
      if (serverWakeAttempts >= 9) {
        console.log('🛑 Reached maximum retry attempts (10), showing error');
        setShowRealError(true);
        setError('เซิร์ฟเวอร์ไม่สามารถเข้าถึงได้หลังจากพยายาม 10 ครั้ง');
        setIsInitialLoad(false);
        setLoading(false);
        return;
      }
      
      const isServerSleeping = err.code === 'ECONNREFUSED' || 
                              err.message?.includes('Network Error') ||
                              err.response?.status === 502 ||
                              err.response?.status === 503;

      if (isServerSleeping) {
        console.log(`🔄 Server sleeping, retrying... (${serverWakeAttempts + 1}/10)`);
        
        setServerWakeAttempts(prev => {
          const newCount = prev + 1;
          console.log(`📊 Updated serverWakeAttempts to: ${newCount}`);
          return newCount;
        });
        
        setRetryCount(prev => prev + 1);
        
        if (isInitialLoad) {
          setLoadingPhase('retrying');
        }
        
        const delay = 3000 + (Math.min(serverWakeAttempts, 20) * 500);
        console.log(`⏱️ Retrying in ${delay}ms...`);
        
        setTimeout(() => {
          fetchProducts();
        }, delay);
        
        return;
        
      } else {
        console.log('🚨 Non-server error, showing error immediately');
        setShowRealError(true);
        setError('ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่');
        setIsInitialLoad(false);
        setLoading(false);
        setRetryCount(prev => prev + 1);
        return;
      }
    }
  };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Watches', 'Other'];
  const priceStats = getPriceStats();

// Maintenance Mode Check

if (typeof MAINTENANCE_MODE !== 'undefined' && MAINTENANCE_MODE) {
  return (
    <div className="container">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '600px',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 30%, #fb923c 70%, #ea580c 100%)',
        borderRadius: '25px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(251, 146, 60, 0.2)'
      }}>
        {/* Enhanced Background Animation */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 3px, transparent 3px),
            radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 2px, transparent 2px),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.2) 4px, transparent 4px),
            linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)
          `,
          backgroundSize: '80px 80px, 60px 60px, 100px 100px, 200px 200px',
          animation: 'floatingPattern 15s ease-in-out infinite'
        }} />

        {/* Decorative Corner Elements */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '2rem',
          opacity: 0.3,
          animation: 'gentleRotate 8s ease-in-out infinite'
        }}>⚙️</div>
        
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '2rem',
          opacity: 0.3,
          animation: 'gentleRotate 8s ease-in-out infinite reverse'
        }}>🔧</div>

        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          fontSize: '1.5rem',
          opacity: 0.3,
          animation: 'float 6s ease-in-out infinite'
        }}>✨</div>

        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          fontSize: '1.5rem',
          opacity: 0.3,
          animation: 'float 6s ease-in-out infinite 3s'
        }}>🌟</div>

        {/* Main Icon Group with Enhanced Animation */}
        <div style={{
          fontSize: '4.5rem',
          marginBottom: '32px',
          animation: 'maintenanceBounce 2.5s ease-in-out infinite',
          filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))'
        }}>
          <span style={{ 
            display: 'inline-block',
            animation: 'wiggle 3s ease-in-out infinite',
            marginRight: '10px'
          }}>🛠️</span>
          <span style={{ 
            display: 'inline-block',
            animation: 'spin 4s linear infinite',
            margin: '0 10px'
          }}>⚙️</span>
          <span style={{ 
            display: 'inline-block',
            animation: 'wiggle 3s ease-in-out infinite 1s'
          }}>🔧</span>
        </div>

        {/* Enhanced Main Title */}
        <h1 style={{
          color: '#c2410c',
          fontSize: '2.8rem',
          fontWeight: '800',
          marginBottom: '20px',
          textAlign: 'center',
          animation: 'titleSlideIn 1s ease-out',
          textShadow: '0 4px 8px rgba(194, 65, 12, 0.2)',
          letterSpacing: '0.5px'
        }}>
          🔄 กำลังปรับปรุงระบบ
        </h1>

        {/* Subtitle */}
        <p style={{
          color: '#9a3412',
          fontSize: '1.3rem',
          fontWeight: '500',
          marginBottom: '32px',
          textAlign: 'center',
          animation: 'fadeInUp 1.2s ease-out',
          opacity: 0.9
        }}>
          เพื่อประสบการณ์ที่ดีกว่าเดิม ✨
        </p>

        {/* Enhanced Message Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '32px',
          borderRadius: '20px',
          border: '2px solid rgba(251, 146, 60, 0.3)',
          marginBottom: '32px',
          maxWidth: '650px',
          textAlign: 'center',
          animation: 'cardSlideUp 1.4s ease-out',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ 
            color: '#c2410c', 
            margin: '0 0 20px',
            fontSize: '1.4rem',
            fontWeight: '700'
          }}>
            🎯 เรากำลังอัพเกรดระบบให้คุณ!
          </h3>
          
          <p style={{ 
            color: '#9a3412', 
            margin: '0 0 20px',
            fontSize: '1.1rem',
            lineHeight: '1.7',
            fontWeight: '500'
          }}>
            นักพัฒนากำลังทำงานหนักเพื่อปรับปรุงระบบให้มีประสิทธิภาพดีขึ้น<br/>
            <strong>ขอบคุณที่รอคอยและให้ความเชื่อมั่นกับระบบของเรานะ</strong> 🙏
          </p>

          {/* Enhanced Progress Section */}
          <div style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
            padding: '20px',
            borderRadius: '15px',
            border: '1px solid rgba(251, 146, 60, 0.2)',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '1.5rem' }}>⏱️</span>
              <span style={{ 
                color: '#92400e', 
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                เวลาที่คาดการณ์: 1 ชั่วโมง หรือมากกว่า
              </span>
            </div>

            {/* Enhanced Progress Bar */}
            <div style={{
              width: '100%',
              height: '12px',
              backgroundColor: 'rgba(194, 65, 12, 0.1)',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(194, 65, 12, 0.2)'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #fb923c, #ea580c, #fb923c)',
                borderRadius: '10px',
                animation: 'progressGlow 2.5s ease-in-out infinite',
                boxShadow: '0 0 10px rgba(251, 146, 60, 0.4)'
              }} />
            </div>
          </div>

          {/* Status Updates */}
          <div style={{
            background: 'rgba(251, 146, 60, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(251, 146, 60, 0.2)'
          }}>
            <p style={{ 
              color: '#9a3412', 
              margin: 0,
              fontSize: '0.95rem',
              fontWeight: '500'
            }}>
              📋 <strong>กำลังดำเนินการ:</strong> อัพเดทฐานข้อมูล, ปรับปรุง UI, เพิ่มฟีเจอร์ใหม่
            </p>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '32px',
          zIndex: 10,
          position: 'relative'
        }}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔄 Refresh button clicked!');
              window.location.reload();
            }}
            style={{
              background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
              border: 'none',
              padding: '16px 32px',
              fontSize: '1.2rem',
              fontWeight: '700',
              borderRadius: '15px',
              color: 'white',
              boxShadow: '0 8px 25px rgba(251, 146, 60, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 100,
              position: 'relative',
              userSelect: 'none',
              outline: 'none',
              animation: 'buttonPulse 3s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05)';
              e.target.style.boxShadow = '0 12px 35px rgba(251, 146, 60, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 8px 25px rgba(251, 146, 60, 0.4)';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(-1px) scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05)';
            }}
          >
            🔄 ตรวจสอบสถานะใหม่
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('📞 Contact button clicked!');
              window.open('https://vippersonalwebsite.vercel.app/contact', '_blank');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '3px solid #fb923c',
              padding: '16px 32px',
              fontSize: '1.2rem',
              fontWeight: '700',
              borderRadius: '15px',
              color: '#c2410c',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 100,
              position: 'relative',
              userSelect: 'none',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fff7ed';
              e.target.style.transform = 'translateY(-4px) scale(1.05)';
              e.target.style.borderColor = '#ea580c';
              e.target.style.boxShadow = '0 12px 35px rgba(251, 146, 60, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.borderColor = '#fb923c';
              e.target.style.boxShadow = 'none';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(-1px) scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05)';
            }}
          >
            📞 ติดต่อผู้ดูแลระบบ
          </button>
        </div>

        {/* Enhanced Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '30px',
          border: '2px solid rgba(251, 146, 60, 0.3)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: 'linear-gradient(45deg, #fb923c, #ea580c)',
            borderRadius: '50%',
            animation: 'statusGlow 2s infinite',
            boxShadow: '0 0 10px rgba(251, 146, 60, 0.6)'
          }}></div>
          <span style={{ 
            color: '#c2410c', 
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            🔧 สถานะ: กำลังปรับปรุงระบบ
          </span>
          <div style={{
            fontSize: '1.2rem',
            animation: 'bounce 2s infinite'
          }}>⚡</div>
        </div>

        {/* Enhanced Contact Information */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '16px',
          border: '2px solid rgba(251, 146, 60, 0.2)',
          maxWidth: '450px',
          animation: 'contactSlideIn 1.8s ease-out',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <h4 style={{ 
            color: '#c2410c', 
            margin: '0 0 12px',
            fontSize: '1.1rem',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            💬 ต้องการสอบถามข้อมูลเพิ่มเติม? กับนักพัฒนาระบบนี้
          </h4>
          <div style={{ 
            color: '#9a3412', 
            fontSize: '0.9rem',
            lineHeight: '1.8',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '8px', fontWeight: '600' }}>
              👨‍💻 <strong>วิป (Phatra Wongsapsakul)</strong>
            </div>
            <div style={{ marginBottom: '8px' }}>
              🌐 Website: <a 
                href="https://vippersonalwebsite.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🌐 Website link clicked!');
                  window.open('https://vippersonalwebsite.vercel.app/contact', '_blank');
                }}
                style={{ 
                  color: '#ea580c', 
                  textDecoration: 'underline',
                  fontWeight: '600',
                  cursor: 'pointer',
                  zIndex: 1000,
                  position: 'relative',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(234, 88, 12, 0.1)';
                  e.target.style.color = '#c2410c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#ea580c';
                }}
              >
                Vip Personal Website
              </a>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic' }}>
              🎓 นักศึกษา ICT มหาวิทยาลัยมหิดล
            </div>
          </div>
        </div>

        {/* CSS Animations for Enhanced Maintenance */}
        <style jsx>{`
          @keyframes floatingPattern {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(1deg); }
            50% { transform: translateY(-5px) rotate(0deg); }
            75% { transform: translateY(-8px) rotate(-1deg); }
          }
          
          @keyframes maintenanceBounce {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-15px) scale(1.05); }
          }
          
          @keyframes gentleRotate {
            0%, 100% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
          }
          
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes progressGlow {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400px); }
          }
          
          @keyframes statusGlow {
            0%, 100% { 
              opacity: 1; 
              box-shadow: 0 0 10px rgba(251, 146, 60, 0.6);
            }
            50% { 
              opacity: 0.6; 
              box-shadow: 0 0 20px rgba(251, 146, 60, 0.8);
            }
          }
          
          @keyframes buttonPulse {
            0%, 100% {
              box-shadow: 0 8px 25px rgba(251, 146, 60, 0.4);
            }
            50% {
              box-shadow: 0 8px 35px rgba(251, 146, 60, 0.6);
            }
          }
          
          @keyframes titleSlideIn {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes cardSlideUp {
            from {
              opacity: 0;
              transform: translateY(40px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes contactSlideIn {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        `}</style>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------


// 🚀 VipStore Enhanced Loading State

if (loading && !showRealError) {
  // 🆕 Enhanced Loading แค่ตอน initial load
  if (isInitialLoad) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px',
          gap: '20px', // เดิม: 24px → ใหม่: 20px
          padding: '40px 20px'
        }}>
          
          {/* 🔄 FASTER Loading Icon */}
          <div style={{
            width: '70px', // เดิม: 80px → ใหม่: 70px (เล็กลง = เร็วขึ้น)
            height: '70px',
            position: 'relative',
            marginBottom: '16px' // เดิม: 20px → ใหม่: 16px
          }}>
            {/* Outer Ring - FASTER */}
            <div style={{
              width: '100%',
              height: '100%',
              border: '3px solid #f3f4f6', // เดิม: 4px → ใหม่: 3px
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'fastSpin 0.8s linear infinite' // เดิม: 1.5s → ใหม่: 0.8s
            }}></div>
            
            {/* Inner Ring - FASTER */}
            <div style={{
              position: 'absolute',
              top: '17px', // ปรับตามขนาดใหม่
              left: '17px',
              width: '36px', // ปรับตามขนาดใหม่
              height: '36px',
              border: '2px solid #e5e7eb', // เดิม: 3px → ใหม่: 2px
              borderRight: '2px solid #10b981',
              borderRadius: '50%',
              animation: 'fastSpin 0.6s linear infinite reverse' // เดิม: 1s → ใหม่: 0.6s
            }}></div>
            
            {/* Center Icon - FASTER Pulse */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1.3rem', // เดิม: 1.5rem → ใหม่: 1.3rem
              animation: 'fastPulse 1.2s infinite' // เดิม: 2s → ใหม่: 1.2s
            }}>
              {loadingPhase === 'connecting' && '🔗'}
              {loadingPhase === 'fetching' && '📦'}
              {loadingPhase === 'retrying' && '☕'}
            </div>
          </div>

          {/* 📝 Faster Loading Messages */}
          <div style={{ textAlign: 'center', maxWidth: '380px' }}> {/* เดิม: 400px → ใหม่: 380px */}
            <h2 style={{
              color: '#374151',
              fontSize: '1.4rem', // เดิม: 1.5rem → ใหม่: 1.4rem
              fontWeight: '600',
              marginBottom: '10px', // เดิม: 12px → ใหม่: 10px
              animation: 'fastFadeInUp 0.4s ease-out' // เดิม: 0.6s → ใหม่: 0.4s
            }}>
              {loadingPhase === 'connecting' && '🔗 เชื่อมต่อเซิร์ฟเวอร์...'}
              {loadingPhase === 'fetching' && '📦 โหลดข้อมูลสินค้า...'}
              {loadingPhase === 'retrying' && '☕ เซิร์ฟเวอร์อยู่ระหว่างเตรียมความพร้อม...'}
            </h2>

            {/* 💡 Compact Tips */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              padding: '12px 16px', // เดิม: 16px → ใหม่: 12px 16px
              borderRadius: '10px', // เดิม: 12px → ใหม่: 10px
              border: '1px solid #bae6fd',
              marginTop: '16px' // เดิม: 20px → ใหม่: 16px
            }}>
              <p style={{
                color: '#0369a1',
                fontSize: '0.85rem', // เดิม: 0.9rem → ใหม่: 0.85rem
                margin: 0,
                fontWeight: '500'
              }}>
                {loadingPhase === 'connecting' && '💡 กำลังติดต่อกับเซิร์ฟเวอร์'}
                {loadingPhase === 'fetching' && '💡 กำลังโหลดสินค้าทั้งหมดให้คุณ'}
                {loadingPhase === 'retrying' && serverWakeAttempts <= 5 && '💡 เซิร์ฟเวอร์อาจกำลังหลับ กำลังปลุกให้ตื่น'}
                {loadingPhase === 'retrying' && serverWakeAttempts > 7 && serverWakeAttempts <= 10 && '💡 เซิร์ฟเวอร์กำลังอุ่นเครื่อง กรุณารอสักครู่'}
                {loadingPhase === 'retrying' && serverWakeAttempts > 10 && '💡 กำลังพยายามเชื่อมต่อ'}
              </p>
            </div>
          </div>

          {/* 🎭 FASTER Loading Dots */}
          <div style={{
            display: 'flex',
            gap: '6px', // เดิม: 8px → ใหม่: 6px
            marginTop: '16px' // เดิม: 20px → ใหม่: 16px
          }}>
            {[1, 2, 3, 4, 5].map(dot => (
              <div
                key={dot}
                style={{
                  width: '10px', // เดิม: 12px → ใหม่: 10px
                  height: '10px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: `fastBounce 1.2s infinite ease-in-out`, // เดิม: 1.8s → ใหม่: 1.2s
                  animationDelay: `${dot * 0.15}s` // เดิม: 0.2s → ใหม่: 0.15s
                }}
              ></div>
            ))}
          </div>

          {/* OPTIMIZED CSS Animations */}
          <style jsx>{`
            @keyframes fastSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes fastPulse {
              0%, 100% { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1); 
              }
              50% { 
                opacity: 0.7; 
                transform: translate(-50%, -50%) scale(1.08); 
              }
            }
            
            @keyframes fastBounce {
              0%, 80%, 100% {
                transform: scale(0);
                opacity: 0.6;
              }
              40% {
                transform: scale(1);
                opacity: 1;
              }
            }
            
            @keyframes fastFadeInUp {
              from {
                opacity: 0;
                transform: translateY(15px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      </div>
    );
  } else {
    // ✅ ไม่แสดง Loading เลย, แสดงข้อมูลเดิม
    return null;
  }
}

  // Error State (ย่อ)
  // if (error && showRealError) {
  //   return (
  //     <div className="container">
  //       <div style={{
  //         display: 'flex',
  //         flexDirection: 'column',
  //         alignItems: 'center',
  //         justifyContent: 'center',
  //         minHeight: '400px',
  //         padding: '40px 20px',
  //         background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
  //         borderRadius: '20px',
  //         textAlign: 'center'
  //       }}>
  //         <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔌💥🖥️</div>
  //         <h2 style={{ color: '#92400e', fontSize: '1.8rem', marginBottom: '16px' }}>
  //           เซิร์ฟเวอร์ไม่สามารถเข้าถึงได้
  //         </h2>
  //         <p style={{ color: '#d97706', fontSize: '1.1rem', marginBottom: '24px' }}>
  //           ระบบได้พยายามเชื่อมต่อแล้ว {serverWakeAttempts} ครั้ง<br/>
  //           เซิร์ฟเวอร์อาจปิดการให้บริการชั่วคราว หรือ กำลังปรับปรุงระบบ
  //         </p>
  //         <button
  //           onClick={() => {
  //             setServerWakeAttempts(0);
  //             setShowRealError(false);
  //             fetchProducts();
  //           }}
  //           style={{
  //             background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  //             border: 'none',
  //             padding: '12px 24px',
  //             fontSize: '1rem',
  //             fontWeight: '600',
  //             borderRadius: '12px',
  //             color: 'white',
  //             cursor: 'pointer'
  //           }}
  //         >
  //           🔄 ลองใหม่อีกครั้ง
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }
  
  return (
    <div className="container">
      {/* ============ 🆕 UNIFIED FILTER DROPDOWN ============ */}
      <div className="card" style={{ 
        marginBottom: '24px', 
        position: 'relative',
        zIndex: showFilterDropdown ? 10000 : 'auto'
      }}>
        {/* Dropdown Header */}
        <div 
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            cursor: 'pointer',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            backgroundColor: showFilterDropdown ? '#f0f9ff' : 'white',
            border: `2px solid ${showFilterDropdown ? '#667eea' : '#e5e7eb'}`,
            boxShadow: showFilterDropdown ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🔍</span>
            <div>
              <h3 style={{ 
                margin: 0, 
                color: '#1f2937',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                ค้นหาและกรองสินค้า
              </h3>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '0.9rem'
              }}>
                {getActiveFiltersCount() > 0 
                  ? `ใช้ตัวกรอง ${getActiveFiltersCount()} รายการ • ${filteredProducts.length} สินค้า`
                  : `${filteredProducts.length} สินค้าทั้งหมด`
                }
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getActiveFiltersCount() > 0 && (
              <span style={{
                backgroundColor: '#667eea',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '4px 8px',
                borderRadius: '12px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {getActiveFiltersCount()}
              </span>
            )}
            <span style={{ 
              fontSize: '1.2rem',
              transition: 'transform 0.2s ease',
              transform: showFilterDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              🔽
            </span>
          </div>
        </div>

        {/* Dropdown Content */}
        {showFilterDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: 'white',
            border: '2px solid #667eea',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
            padding: '24px',
            marginTop: '-2px'
          }}>
            {/* Search Section */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                color: '#374151',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔍 ค้นหาสินค้า
              </h4>
              
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อสินค้า, รายละเอียด, หรือหมวดหมู่..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingLeft: '45px',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                
                {/* Search Icon */}
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.2rem',
                  color: '#9ca3af',
                  pointerEvents: 'none'
                }}>
                  🔍
                </div>
                
                {/* Clear Button */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '1.2rem',
                      color: '#6b7280',
                      borderRadius: '50%',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#6b7280';
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Search Results Info */}
              {searchTerm && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#0369a1'
                }}>
                  <span style={{ fontWeight: '600' }}>
                    🎯 ผลการค้นหา: "{searchTerm}"
                  </span>
                  <span style={{ marginLeft: '8px' }}>
                    พบ {filteredProducts.length} รายการ
                  </span>
                </div>
              )}
            </div>

            {/* Grid Layout for Filters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              
              {/* Category Filter */}
              <div>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#374151',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📂 หมวดหมู่สินค้า
                </h4>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.9rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="">ทั้งหมด ({filteredProducts.length} รายการ)</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#374151',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  💰 ช่วงราคา
                </h4>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                    style={{
                      width: '50%',
                      padding: '8px',
                      fontSize: '0.9rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 3000000})}
                    style={{
                      width: '50%',
                      padding: '8px',
                      fontSize: '0.9rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  <span>฿{priceRange.min.toLocaleString()}</span>
                  <span>฿{priceRange.max.toLocaleString()}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setPriceRange({ min: 0, max: 1000 })}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.8rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: priceRange.min === 0 && priceRange.max === 1000 ? '#667eea' : 'white',
                      color: priceRange.min === 0 && priceRange.max === 1000 ? 'white' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    &lt;฿1,000
                  </button>
                  <button
                    onClick={() => setPriceRange({ min: 1000, max: 5000 })}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.8rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: priceRange.min === 1000 && priceRange.max === 5000 ? '#667eea' : 'white',
                      color: priceRange.min === 1000 && priceRange.max === 5000 ? 'white' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ฿1K-5K
                  </button>
                  <button
                    onClick={() => setPriceRange({ min: 5000, max: priceStats.max })}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.8rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: priceRange.min === 5000 && priceRange.max === priceStats.max ? '#667eea' : 'white',
                      color: priceRange.min === 5000 && priceRange.max === priceStats.max ? 'white' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    &gt;฿5,000
                  </button>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#374151',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📊 เรียงลำดับ
                </h4>
                
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.9rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="">-- เลือกการเรียง --</option>
                  <option value="price-low">💰 ราคา: ต่ำ → สูง</option>
                  <option value="price-high">💰 ราคา: สูง → ต่ำ</option>
                  <option value="name-az">🔤 ชื่อ: A → Z</option>
                  <option value="name-za">🔤 ชื่อ: Z → A</option>
                  <option value="stock-high">📦 สต็อก: มาก → น้อย</option>
                  <option value="stock-low">📦 สต็อก: น้อย → มาก</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={clearAllFilters}
                disabled={getActiveFiltersCount() === 0}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: '2px solid #ef4444',
                  borderRadius: '8px',
                  backgroundColor: getActiveFiltersCount() === 0 ? '#f3f4f6' : 'white',
                  color: getActiveFiltersCount() === 0 ? '#9ca3af' : '#ef4444',
                  cursor: getActiveFiltersCount() === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (getActiveFiltersCount() > 0) {
                    e.target.style.backgroundColor = '#ef4444';
                    e.target.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (getActiveFiltersCount() > 0) {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = '#ef4444';
                  }
                }}
              >
                🗑️ ล้างตัวกรองทั้งหมด
              </button>
             
              <button
                onClick={() => setShowFilterDropdown(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a67d8';
                  e.target.style.borderColor = '#5a67d8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#667eea';
                  e.target.style.borderColor = '#667eea';
                }}
              >
                ✅ ใช้ตัวกรอง
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div style={{
          marginBottom: '24px',
          padding: '12px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0369a1' }}>
              🏷️ ตัวกรองที่ใช้:
            </span>
            
            {selectedCategory && (
              <span style={{
                padding: '4px 8px',
                fontSize: '0.8rem',
                backgroundColor: '#667eea',
                color: 'white',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                หมวด: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    padding: '0',
                    marginLeft: '2px'
                  }}
                >
                  ✕
                </button>
              </span>
            )}
            
            {searchTerm && (
              <span style={{
                padding: '4px 8px',
                fontSize: '0.8rem',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ค้นหา: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    padding: '0',
                    marginLeft: '2px'
                  }}
                >
                  ✕
                </button>
              </span>
            )}
            
            {(priceRange.min > 0 || priceRange.max < 100000) && (
              <span style={{
                padding: '4px 8px',
                fontSize: '0.8rem',
                backgroundColor: '#f59e0b',
                color: 'white',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ราคา: ฿{priceRange.min.toLocaleString()}-{priceRange.max.toLocaleString()}
                <button
                  onClick={() => setPriceRange({ min: 0, max: 100000 })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    padding: '0',
                    marginLeft: '2px'
                  }}
                >
                  ✕
                </button>
              </span>
            )}
            
            {sortOption && (
              <span style={{
                padding: '4px 8px',
                fontSize: '0.8rem',
                backgroundColor: '#8b5cf6',
                color: 'white',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                เรียง: {sortOption === 'price-low' ? 'ราคาต่ำ→สูง' : 
                       sortOption === 'price-high' ? 'ราคาสูง→ต่ำ' :
                       sortOption === 'name-az' ? 'ชื่อ A→Z' :
                       sortOption === 'name-za' ? 'ชื่อ Z→A' :
                       sortOption === 'stock-high' ? 'สต็อกมาก→น้อย' :
                       sortOption === 'stock-low' ? 'สต็อกน้อย→มาก' : sortOption}
                <button
                  onClick={() => setSortOption('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    padding: '0',
                    marginLeft: '2px'
                  }}
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Products Count */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#1f2937' }}>
  สินค้าทั้งหมด ({filteredProducts.length} รายการ)
  {selectedCategory && ` - หมวดหมู่: ${selectedCategory}`}
  {searchTerm && ` - ค้นหา: "${searchTerm}"`}
</h2>
      </div>

      {/* Products Grid */}
{filteredProducts.length === 0 ? (
  <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
      {searchTerm ? '🔍' : getActiveFiltersCount() > 0 ? '🏷️' : '📦'}
    </div>
    <h3 style={{ color: '#6b7280', marginBottom: '16px' }}>
      {searchTerm ? 'ไม่พบสินค้าที่ค้นหา' : 
       getActiveFiltersCount() > 0 ? 'ไม่มีสินค้าที่ตรงกับตัวกรอง' : 'ไม่พบสินค้า'}
    </h3>
    <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
      {searchTerm 
        ? `ไม่พบสินค้าที่ตรงกับ "${searchTerm}"${selectedCategory ? ` ในหมวดหมู่ ${selectedCategory}` : ''}`
        : getActiveFiltersCount() > 0
          ? 'ลองปรับเปลี่ยนตัวกรองหรือล้างตัวกรองบางตัว'
          : selectedCategory 
            ? `ไม่มีสินค้าในหมวดหมู่ ${selectedCategory}` 
            : 'ยังไม่มีสินค้าในระบบ'
      }
    </p>
    {(searchTerm || getActiveFiltersCount() > 0) && (
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            🗑️ ล้างการค้นหา
          </button>
        )}
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            🗑️ ล้างตัวกรองทั้งหมด
          </button>
        )}
        
        {/* 🆕 เพิ่มปุ่ม Reload ตรงนี้! */}
        <button
          onClick={() => {
            console.log('🔄 Reload button clicked!');
            // ล้างตัวกรองทั้งหมด + โหลดข้อมูลใหม่
            clearAllFilters();
            fetchProducts();
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#5a67d8';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#667eea';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🔄 โหลดข้อมูลใหม่
        </button>
      </div>
    )}
    
    {/* 🆕 ถ้าไม่มีตัวกรองใดๆ ให้แสดงปุ่ม Reload อยู่คนเดียว */}
    {!searchTerm && getActiveFiltersCount() === 0 && (
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => {
            console.log('🔄 Reload all products clicked!');
            fetchProducts();
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#5a67d8';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#667eea';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
          }}
        >
          🔄 โหลดสินค้าใหม่
        </button>
      </div>
    )}
  </div>
) : (
  <div className="product-grid">
    {filteredProducts.map(product => (
      <ProductCard 
        key={product._id} 
        product={product}
        onProductClick={handleProductClick}
      />
    ))}
  </div>
)}

      {/* CSS Styles */}
      <style jsx>{`
        /* ===== DROPDOWN SYSTEM ===== */
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: visible;
        }

        /* ===== Z-INDEX FIX ===== */
        .product-grid {
          position: relative;
          z-index: 1;
        }
        
        .product-grid .card {
          z-index: 2;
        }
        
        /* Filter dropdown should be on top */
        .filter-dropdown {
          z-index: 10000 !important;
        }
        
        .filter-dropdown-content {
          z-index: 10001 !important;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .card {
            margin: 0 -4px;
          }
          
          /* Grid responsive for mobile */
          .dropdown-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          /* Search input mobile */
          .card input[type="text"] {
            padding: 10px 14px !important;
            padding-left: 40px !important;
            fontSize: 0.9rem !important;
          }
          
          /* Dropdown content mobile spacing */
          .dropdown-content {
            padding: 16px !important;
          }
          
          /* Mobile z-index fix */
          .filter-dropdown {
            z-index: 10000 !important;
          }
        }

        @media (max-width: 480px) {
          .card input[type="text"] {
            padding: 8px 12px !important;
            padding-left: 35px !important;
            fontSize: 0.85rem !important;
          }
          
          /* Quick price buttons mobile */
          .price-buttons {
            gap: 4px !important;
          }
          
          .price-buttons button {
            padding: 3px 6px !important;
            fontSize: 0.75rem !important;
          }
        }

        /* Animation for dropdown */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .dropdown-content {
          animation: slideDown 0.2s ease-out;
        }

        /* Hover effects */
        .card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Filter tags responsive */
        @media (max-width: 640px) {
          .filter-tags {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .filter-tags > span:first-child {
            margin-bottom: 8px;
          }
        }
        
        /* ===== ADDITIONAL Z-INDEX FIXES ===== */
        
        /* Ensure dropdown appears above everything */
        .unified-filter-dropdown {
          position: relative;
          z-index: 10000;
        }
        
        .unified-filter-dropdown.active {
          z-index: 10000 !important;
        }
        
        .unified-filter-dropdown .dropdown-content {
          position: absolute;
          z-index: 10001 !important;
          backdrop-filter: blur(2px);
        }
        
        /* Product cards should be below */
        .product-grid {
          z-index: 1 !important;
        }
        
        .product-grid > * {
          z-index: 2 !important;
        }
      `}</style>
    </div>
  );
};

export default ProductList;