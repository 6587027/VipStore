// src/components/ProductList.jsx  

import React, { useState, useEffect,useRef } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '../services/api';
import { Search, Filter, Package, DollarSign, BarChart3, RotateCcw, Sparkles, ChevronDown } from 'lucide-react';
import { Settings, RefreshCw, Clock, User, Code , Megaphone , CircleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';

// import ChatButton from './chat/ChatButton';

const ProductList = ({ onProductClick, savedState, onStateUpdate, shouldFetch = true }) => {
  const [products, setProducts] = useState(savedState?.products || []);
  const [loading, setLoading] = useState(savedState?.loading !== undefined ? savedState.loading : true);
  const [selectedCategory, setSelectedCategory] = useState(savedState?.selectedCategory || '');

  const [loadingPhase, setLoadingPhase] = useState('initializing');
  const [serverWakeAttempts, setServerWakeAttempts] = useState(0);
  const [showRealError, setShowRealError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(savedState?.isInitialLoad !== undefined ? savedState.isInitialLoad : true);
  const [isHotReloading, setIsHotReloading] = useState(false);
  const [lastReloadTime, setLastReloadTime] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [autoReloadEnabled, setAutoReloadEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const loadingRef = useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);


  // ✅ Search & Filter States and 🆕 Advanced Filter States
  const [searchTerm, setSearchTerm] = useState(savedState?.searchTerm || '');
  const [filteredProducts, setFilteredProducts] = useState(savedState?.filteredProducts || []);
  const [priceRange, setPriceRange] = useState(savedState?.priceRange || { min: '', max: '' });
  const [sortOption, setSortOption] = useState(savedState?.sortOption || '');
  const [showFilters, setShowFilters] = useState(false);
  
  const { t } = useTranslation();
  // --------------------------------------------------------------------------------


  // 🛠️ Maintenance Mode Toggle
  // const MAINTENANCE_MODE = true;

  // 🆕 (1.1) เพิ่ม State เหล่านี้:
  const [isMaintenance, setIsMaintenance] = useState(savedState?.isMaintenance !== undefined ? savedState.isMaintenance : false);
  const [loadingStatus, setLoadingStatus] = useState(savedState?.loadingStatus !== undefined ? savedState.loadingStatus : true);
  const [statusError, setStatusError] = useState(null);

  // 🆕 (1.2) เพิ่ม useEffect นี้ (สำหรับ Fetch สถานะ Maintenance):
  useEffect(() => {
    if (!loadingStatus) {
      console.log('✅ Skipping maintenance check, using saved state.');
      return;
    }
    const checkMaintenanceStatus = async () => {
      try {
        console.log('📡 Checking store maintenance status...');
        setLoadingStatus(true);
        // ❗️ ใช้ /orders/settings/status
        const response = await fetch(`${API_BASE_URL}/orders/settings/status`);
        const data = await response.json();
        
        if (data.success) {
          console.log(`🔧 Maintenance Mode is: ${data.isMaintenanceMode ? 'ON' : 'OFF'}`);
          setIsMaintenance(data.isMaintenanceMode);
        } else {
          console.error('Failed to fetch maintenance status, defaulting to ON');
          setStatusError('Cannot verify store status');
          setIsMaintenance(true);
        }
      } catch (err) {
        console.error('Error fetching maintenance status:', err);
        setStatusError('Error connecting to server');
        setIsMaintenance(false);
      } finally {
        setLoadingStatus(false);
      }
    };
    
    checkMaintenanceStatus();
  }, []);


  // ---------------------------------------------------------------------------------


  useEffect(() => {
    // ถ้าไม่ได้เปิดใช้งาน auto-reload ก็ไม่ต้องทำอะไร
    if (!autoReloadEnabled) {
      return;
    }

    console.log('Setting up auto-reload interval (30 seconds)');

    const intervalId = setInterval(() => {
      // เช็กจาก Ref ว่าตอนนี้กำลังโหลดอยู่หรือเปล่า
      if (loadingRef.current) {
        // console.log('🔄 Auto-reload: Skipped, already loading.');
        return;
      }
      
      // console.log('🔄 Auto-reloading products (background)...');
      
      // ตั้งค่า isInitialLoad เป็น false เพื่อไม่ให้แสดงหน้า Loading เต็มจอ
      setIsInitialLoad(false); 
      
      // เรียก fetchProducts เพื่อโหลดข้อมูลใหม่
      fetchProducts();

    }, 5000); // 1,000 ms = 1 วินาที 

    // Cleanup function: เคลียร์ interval เมื่อ component ถูก unmount
    return () => {
      // console.log('Clearing auto-reload interval.');
      clearInterval(intervalId);
    };
  }, [autoReloadEnabled]);


  // ดึงข้อมูลสินค้าจาก API
  useEffect(() => {
  if (shouldFetch && !isMaintenance && !loadingStatus && (isInitialLoad || !products.length)) {
      console.log('📡 Store is ONLINE. Fetching products...');
      fetchProducts();
    } else if (savedState?.products?.length && !shouldFetch) {
      console.log('✅ Using saved product data, no fetch needed');
    } else if (isMaintenance) {
      console.log('🛑 Store is in MAINTENANCE. Skipping product fetch.');
      setLoading(false); // หยุด Loading
    } else if (loadingStatus) {
      console.log('⏳ Waiting for maintenance status check...');
    }
  }, [shouldFetch, selectedCategory, isMaintenance, loadingStatus]);

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
      isInitialLoad,
      isMaintenance,  
      loadingStatus

    });
  }
}, [
    products, loading, selectedCategory, searchTerm, filteredProducts, 
    priceRange, sortOption, retryCount, loadingPhase, serverWakeAttempts, 
    showRealError, isInitialLoad, 
    isMaintenance, loadingStatus
]);


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
    const minPrice = parseFloat(priceRange.min);
    const maxPrice = parseFloat(priceRange.max);

    filtered = filtered.filter(product => {
      // ตรวจสอบเงื่อนไข Min:
      // ถ้า minPrice ไม่ใช่ตัวเลข (เช่น ช่องว่าง) หรือราคาสินค้า >= minPrice
      const minCondition = isNaN(minPrice) ? true : product.price >= minPrice;

      // ตรวจสอบเงื่อนไข Max:
      // ถ้า maxPrice ไม่ใช่ตัวเลข (เช่น ช่องว่าง) หรือราคาสินค้า <= maxPrice
      const maxCondition = isNaN(maxPrice) ? true : product.price <= maxPrice;

      return minCondition && maxCondition;
    });
    
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
    setPriceRange({ min: '', max: '' });
    setSortOption('');
  };

  // 🆕 Get Active Filters Count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (searchTerm.trim()) count++;
    if (priceRange.min !== '' || priceRange.max !== '') count++;
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

  if (loadingStatus) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#f3f4f6'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1e40af', 
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <h2 style={{ color: '#1e40af', marginTop: '20px' }}>
        {statusError ? 'Connection Error' : 'Verifying Store Status...'}
      </h2>
      <p style={{ color: '#6b7280' }}>
        {statusError ? statusError : 'กำลังตรวจสอบสถานะร้านค้า...'}
      </p>
      {statusError && (
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#1e40af',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}


// -------------------------------------------------------------------------------------- 
// Maintenance Mode Check

if (isMaintenance) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0px',
      background: '#f3f4f6', 
      position: 'relative'
    }}>
      
      <LanguageSwitcher />

      {/* --- 2. เปลี่ยน Card กลับเป็นสีขาวทึบ --- */}
      <div style={{
        background: '#ffffff', // 🌟
        border: '1px solid #e5e7eb', // 🌟
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', // 🌟
        borderRadius: '16px',
        padding: '15px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        color: '#1f2937' // 🌟 เปลี่ยนสี Text เริ่มต้นเป็นสีเข้ม
      }}>
        
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <img 
            src="/VipStoreLogo.png"
            alt="VipStore Logo"
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              borderRadius: '15px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>

        <h1 style={{
          color: '#1e40af', // 🌟 กลับเป็นสีน้ำเงิน
          fontSize: '2rem',
          fontWeight: '700',
          margin: '0 0 16px 0'
        }}>
          {t('maintenanceTitle')}
        </h1>

        <p 
          style={{
            color: '#6b7280', // 🌟 กลับเป็นสีเทาเข้ม
            fontSize: '1.1rem',
            margin: '0 0 24px 0',
            lineHeight: '1.6'
          }}
          dangerouslySetInnerHTML={{ __html: t('maintenanceMessage') }}
        />

        {/* --- กล่องอัปเดต (สีเทาอ่อน) --- */}
        <div style={{
          background: '#f3f4f6', // 🌟
          padding: '16px',
          borderRadius: '12px',
          margin: '0 0 1px 0',
          border: '1px solid #e5e7eb', // 🌟
          textAlign: 'left'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <Megaphone size={20} color="#1e40af" /> {/* 🌟 */}
            <span style={{
              color: '#1e40af', // 🌟
              fontWeight: '600'
            }}>
              {t('updatesTitle')}
            </span>
          </div>
          <div style={{ 
              fontSize: '0.9rem', 
              color: '#4b5563', // 🌟
              lineHeight: '1.6'
          }}>
              <ul style={{ 
                  listStyleType: 'disc', 
                  margin: '0', 
                  paddingLeft: '20px'
              }}>
                  <li>{t('update1')}</li>
                  {/* <li>{t('update2')}</li> */}
                  {/* <li>{t('update3')}</li> */}
                  {/* <li>{t('update4')}</li> */}
                  {/* <li>{t('update4.1')}</li> */}
                 <hr style={{ 
                     margin: '12px 0', 
                     border: '0', 
                     borderTop: '1px solid #e5e7eb', // 🌟
                  }}/>
                  <li>{t('update5')}</li>
                  {/* <li>{t('update6')}</li> */}
              </ul>
          </div>
        </div>

        {/* --- กล่อง Alert (สีแดงอ่อน) --- */}
        <div style={{
            background: '#fee2e2', // 🌟
            color: '#991b1b', // 🌟
            padding: '12px 16px',
            borderRadius: '12px',
            margin: '16px 0 16px 0',
            border: '1px solid #fca5a5', // 🌟
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
            <CircleAlert size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '3px' }} /> {/* 🌟 */}
            <p 
              style={{
                margin: '0',
                fontSize: '1rem',
                fontWeight: '400',
                lineHeight: '1.5',
                textAlign: 'left',
                color: '#991b1b' // 🌟
              }}


              dangerouslySetInnerHTML={{ __html: t('alertMessage') }}
              // dangerouslySetInnerHTML={{ __html: t('settingsClose') }}

              
            />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* --- ปุ่มหลัก (Primary) --- */}
          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#1e40af', // 🌟
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '12px',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.2s ease, transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#2563eb'; // 🌟
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#1e40af'; // 🌟
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <RefreshCw size={18} />
            {t('reloadButton')}
          </button>
          
          {/* --- ปุ่มรอง (Secondary) --- */}
          <button
            onClick={() => window.open('https://vippersonalwebsite.vercel.app/contact', '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'transparent',
              color: '#1e40af', // 🌟
              border: '2px solid #1e40af', // 🌟
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '12px',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.2s ease, transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#eff6ff'; // 🌟
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <User size={16} />
            {t('contactButton')}
          </button>
        </div>

        {/* --- Footer --- */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: '#f3f4f6', // 🌟
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: '#6b7280' // 🌟
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '4px',
            fontWeight: '600',
            color: '#1e40af' // 🌟
          }}>
            <Code size={14} />
            {t('developerName')}
          </div>
          <div>{t('developerRole')}</div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------




// 🚀 VipStore Enhanced Loading State

  if (loading && isInitialLoad && !showRealError) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px',
          padding: '40px 20px',
          background: 'white',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          
          {/* Background Animation */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.3) 2px, transparent 2px),
              radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.2) 3px, transparent 3px),
              radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px, 100px 100px, 40px 40px',
            animation: 'floatingDots 20s linear infinite'
          }} />

          {/* Main Loading Animation */}
          <div style={{
            position: 'relative',
            marginBottom: '32px'
          }}>
            
            {/* Outer Rotating Ring */}
            <div style={{
              width: '120px',
              height: '120px',
              border: '4px solid rgba(102, 126, 234, 0.1)',
              borderTop: '4px solid rgba(102, 126, 234, 0.8)',
              borderRadius: '50%',
              animation: 'smoothSpin 2s linear infinite',
              position: 'relative'
            }}>
              
              {/* Inner Pulsing Circle */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '72px',
                height: '72px',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '50%',
                animation: 'pulse 2s ease-in-out infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                
                {/* Dynamic Icon */}
                <div style={{
                  fontSize: '2rem',
                  animation: 'iconFloat 3s ease-in-out infinite',
                  filter: 'drop-shadow(0 2px 8px rgba(102, 126, 234, 0.3))'
                }}>
                  {loadingPhase === 'connecting' && (
                    <div style={{ color: '#667eea' }}>🌐</div>
                  )}
                  {loadingPhase === 'fetching' && (
                    <div style={{ color: '#10b981' }}>📦</div>
                  )}
                  {loadingPhase === 'retrying' && (
                    <div style={{ color: '#f59e0b' }}>⚡</div>
                  )}
                </div>
              </div>
            </div>

            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  background: 'rgba(102, 126, 234, 0.4)',
                  borderRadius: '50%',
                  top: `${Math.sin(i * Math.PI / 3) * 80 + 60}px`,
                  left: `${Math.cos(i * Math.PI / 3) * 80 + 60}px`,
                  animation: `particle${i} 3s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>

          {/* Loading Text with Modern Styling */}
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <h2 style={{
              color: '#334155',
              fontSize: '1.8rem',
              fontWeight: '700',
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              animation: 'textGlow 2s ease-in-out infinite alternate'
            }}>
              {loadingPhase === 'connecting' && 'เชื่อมต่อระบบ'}
              {loadingPhase === 'fetching' && 'กำลังโหลดสินค้า'}
              {loadingPhase === 'retrying' && 'กำลังเตรียมข้อมูล'}
            </h2>

            <p style={{
              color: '#64748b',
              fontSize: '1.1rem',
              margin: '0 0 24px',
              fontWeight: '500'
            }}>
              {loadingPhase === 'connecting' && 'กำลังติดต่อเซิร์ฟเวอร์...'}
              {loadingPhase === 'fetching' && 'โหลดข้อมูลสินค้าทั้งหมด...'}
              {loadingPhase === 'retrying' && serverWakeAttempts <= 5 && 'เซิร์ฟเวอร์กำลังเตรียมตัว...'}
              {loadingPhase === 'retrying' && serverWakeAttempts > 5 && 'กำลังพยายามเชื่อมต่อ...'}
            </p>

            {/* Progress Indicator */}
            <div style={{
              width: '200px',
              height: '4px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              margin: '0 auto 24px'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #667eea, #10b981, #f59e0b)',
                borderRadius: '4px',
                animation: 'progressFlow 2s ease-in-out infinite',
                boxShadow: '0 0 8px rgba(102, 126, 234, 0.3)'
              }} />
            </div>

            {/* Animated Dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px'
            }}>
              {[1, 2, 3, 4].map(dot => (
                <div
                  key={dot}
                  style={{
                    width: '12px',
                    height: '12px',
                    background: '#667eea',
                    borderRadius: '50%',
                    animation: `waveDots 1.5s ease-in-out infinite`,
                    animationDelay: `${dot * 0.2}s`,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Advanced CSS Animations */}
          <style jsx>{`
            @keyframes smoothSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { 
                transform: scale(1);
                opacity: 0.8;
              }
              50% { 
                transform: scale(1.1);
                opacity: 1;
              }
            }
            
            @keyframes iconFloat {
              0%, 100% { 
                transform: translateY(0px) rotate(0deg);
              }
              33% { 
                transform: translateY(-8px) rotate(120deg);
              }
              66% { 
                transform: translateY(4px) rotate(240deg);
              }
            }
            
            @keyframes textGlow {
              0% { 
                color: #334155;
              }
              100% { 
                color: #667eea;
              }
            }
            
            @keyframes progressFlow {
              0% { 
                transform: translateX(-100%);
              }
              100% { 
                transform: translateX(300px);
              }
            }
            
            @keyframes waveDots {
              0%, 60%, 100% {
                transform: translateY(0px);
                opacity: 0.7;
              }
              30% {
                transform: translateY(-15px);
                opacity: 1;
              }
            }
            
            @keyframes floatingDots {
              0% { 
                transform: translateY(0px) translateX(0px);
              }
              50% { 
                transform: translateY(-20px) translateX(10px);
              }
              100% { 
                transform: translateY(0px) translateX(0px);
              }
            }
            
            @keyframes particle0 {
              0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
              50% { transform: scale(1) rotate(180deg); opacity: 1; }
            }
            
            @keyframes particle1 {
              0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
              50% { transform: scale(1) rotate(-180deg); opacity: 1; }
            }
            
            @keyframes particle2 {
              0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
              50% { transform: scale(1) rotate(360deg); opacity: 1; }
            }
            
            @keyframes particle3 {
              0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
              50% { transform: scale(1) rotate(-360deg); opacity: 1; }
            }
            
            @keyframes particle4 {
              0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
              50% { transform: scale(1) rotate(180deg); opacity: 1; }
            }
            
            @keyframes particle5 {
              0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
              50% { transform: scale(1) rotate(-180deg); opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    );
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
     {/* ========== 🎨 COLLAPSIBLE HORIZONTAL FILTER SYSTEM ========== */}
<div className="filter-container" style={{
  background: 'white',
  borderRadius: '16px',
  marginBottom: '24px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  overflow: 'hidden'
}}>
  
  {/* Filter Header - Always Visible */}
  <div 
    onClick={() => setShowFilters(!showFilters)}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      cursor: 'pointer',
      borderBottom: showFilters ? '1px solid #e5e7eb' : 'none',
      transition: 'all 0.3s ease',
      backgroundColor: showFilters ? '#f0fdf4' : 'white'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
  <Search size={24} color="#059669" />
  <div>
    <h3 style={{ 
      margin: 0, 
      color: '#059669',
      fontSize: '1.2rem',
      fontWeight: '700'
    }}>
          ตัวกรองและค้นหา
        </h3>
        <p style={{
          margin: 0,
          color: '#047857',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          {getActiveFiltersCount() > 0 
            ? `กำลังใช้ ${getActiveFiltersCount()} ตัวกรอง • ${filteredProducts.length} สินค้า`
            : `${filteredProducts.length} สินค้าทั้งหมด • คลิกเพื่อค้นหา`
          }
        </p>
      </div>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Active Filters Badge */}
      {getActiveFiltersCount() > 0 && (
        <span style={{
          backgroundColor: '#059669',
          color: 'white',
          fontSize: '0.8rem',
          fontWeight: '700',
          padding: '6px 12px',
          borderRadius: '20px',
          animation: 'pulse 2s infinite'
        }}>
          {getActiveFiltersCount()}
        </span>
      )}
      
      {/* Toggle Icon */}
      <div style={{
        fontSize: '1.5rem',
        color: '#059669',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)'
      }}>
        <ChevronDown size={20} />
      </div>
    </div>
  </div>

  {/* Animated Filter Content */}
  <div style={{
    height: showFilters ? 'auto' : '0',
    opacity: showFilters ? '1' : '0',
    transform: showFilters ? 'translateY(0)' : 'translateY(-20px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden'
  }}>
    <div style={{ padding: '20px' }}>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="ค้นหาสินค้า, รายละเอียด, หรือหมวดหมู่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 18px 14px 50px',
              fontSize: '1rem',
              border: '2px solid #059669',
              borderRadius: '14px',
              outline: 'none',
              transition: 'all 0.3s ease',
              backgroundColor: '#f0fdf4',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.1)'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 4px 16px rgba(5, 150, 105, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = '#f0fdf4';
              e.target.style.boxShadow = '0 2px 8px rgba(5, 150, 105, 0.1)';
            }}
          />
          
          <div style={{
              position: 'absolute',
              left: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#059669'
            }}>
              <Search size={20} />
            </div>
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.3rem',
                color: '#6b7280',
                transition: 'all 0.2s ease',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fee2e2';
                e.target.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6b7280';
              }}
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filters Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        alignItems: 'start'
      }}>
        
        {/* Categories */}
        <div>
          <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              fontWeight: '700',
              color: '#047857',
              marginBottom: '12px'
            }}>
              <Package size={18} />
              หมวดหมู่สินค้า
            </label>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setSelectedCategory('')}
              style={{
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: selectedCategory === '' ? '2px solid #059669' : '2px solid #d1d5db',
                borderRadius: '25px',
                backgroundColor: selectedCategory === '' ? '#059669' : 'white',
                color: selectedCategory === '' ? 'white' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                transform: 'scale(1)',
                boxShadow: selectedCategory === '' ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== '') {
                  e.target.style.borderColor = '#059669';
                  e.target.style.color = '#059669';
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== '') {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.color = '#6b7280';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              ทั้งหมด
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '10px 16px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: selectedCategory === category ? '2px solid #059669' : '2px solid #d1d5db',
                  borderRadius: '25px',
                  backgroundColor: selectedCategory === category ? '#059669' : 'white',
                  color: selectedCategory === category ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap',
                  transform: 'scale(1)',
                  boxShadow: selectedCategory === category ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.target.style.borderColor = '#059669';
                    e.target.style.color = '#059669';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.color = '#6b7280';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1rem',
            fontWeight: '700',
            color: '#047857',
            marginBottom: '12px'
          }}>
            <DollarSign size={18} />
            ช่วงราคา
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="ต่ำสุด"
              value={priceRange.min}
              onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
              style={{
                width: '90px',
                padding: '8px 10px',
                fontSize: '0.9rem',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <span style={{ 
              color: '#6b7280', 
              fontSize: '1.2rem', 
              fontWeight: '600' 
            }}>
              -
            </span>
            <input
              type="number"
              placeholder="สูงสุด"
              value={priceRange.max}
              onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
              style={{
                width: '90px',
                padding: '8px 10px',
                fontSize: '0.9rem',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1rem',
            fontWeight: '700',
            color: '#047857',
            marginBottom: '12px'
          }}>
            <BarChart3 size={18} />
            เรียงลำดับ
          </label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{
              padding: '10px 14px',
              fontSize: '0.9rem',
              border: '2px solid #d1d5db',
              borderRadius: '10px',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '160px',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#059669';
              e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">เริ่มต้น</option>
            <option value="price-low">ราคา: ต่ำ → สูง</option>
            <option value="price-high">ราคา: สูง → ต่ำ</option>
            <option value="name-az">ชื่อ: A → Z</option>
            <option value="name-za">ชื่อ: Z → A</option>
          </select>
        </div>

        {/* Clear Button */}
        {getActiveFiltersCount() > 0 && (
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              fontWeight: '700',
              color: '#dc2626',
              marginBottom: '12px'
            }}>
              <RotateCcw size={18} />
              รีเซ็ต
            </label>
            <button
              onClick={clearAllFilters}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: '700',
                border: '2px solid #dc2626',
                borderRadius: '10px',
                backgroundColor: 'white',
                color: '#dc2626',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.color = 'white';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#dc2626';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {getActiveFiltersCount() > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#ecfdf5',
          border: '2px solid #bbf7d0',
          borderRadius: '12px',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Sparkles size={20} color="#059669" />
          <div>
            <span style={{ fontWeight: '700', color: '#059669' }}>
              ผลการกรอง: 
            </span>
            <span style={{ marginLeft: '8px', color: '#047857', fontWeight: '600' }}>
              พบ {filteredProducts.length} สินค้าจากทั้งหมด {products.length} รายการ
            </span>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

      

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
           โหลดสินค้าใหม่
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

        @media (max-width: 768px) {
        .horizontal-filters {
          padding: 16px !important;
        }
        
        .horizontal-filters > div:last-child {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }
        
        .horizontal-filters input[type="number"] {
          width: 70px !important;
          padding: 4px 6px !important;
        }
        
        .horizontal-filters select {
          width: 100% !important;
        }
        @keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filter-container {
    margin: 0 -4px 24px !important;
    border-radius: 12px !important;
  }
  
  .filter-container > div:last-child > div {
    padding: 16px !important;
  }
  
  .filter-container input[type="number"] {
    width: 70px !important;
  }
  
  .filter-container select {
    width: 100% !important;
  }
}
      `}</style>
    </div>
  );
};


const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  const currentLang = i18n.language;

  return (
    <div style={{
      // --- 🌟 Liquid Glass Frame Styles 🌟 ---
      background: 'rgba(255, 255, 255, 0.25)',      // สีพื้นหลังโปร่งแสง
      backdropFilter: 'blur(10px)',              // เอฟเฟกต์เบลอ
      WebkitBackdropFilter: 'blur(10px)',        // สำหรับ Safari
      border: '1px solid rgba(255, 255, 255, 0.18)', // ขอบจางๆ
      borderRadius: '12px',                         // ทำให้กรอบมน
      padding: '6px',                               // ระยะห่างภายในกรอบ
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',    // เงาจางๆ
      
      // --- Original Styles ---
      position: 'absolute',
      top: '20px',
      right: '20px',
      display: 'flex',
      gap: '5px', // ลดระยะห่างปุ่มเล็กน้อย
      zIndex: 100
    }}>
      <button
        onClick={() => changeLanguage('th')}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          borderRadius: '8px', // ความมนของปุ่ม
          fontWeight: 'bold',
          transition: 'all 0.2s ease', // เพิ่ม Animation
          
          // --- 🌟 ปรับ Style ปุ่มให้เข้ากับกรอบ 🌟 ---
          background: currentLang === 'th' ? '#1e40af' : 'transparent', // (Active = ทึบ, Inactive = โปร่งใส)
          color: currentLang === 'th' ? 'white' : '#f0f2ff', // (Inactive = สีขาวนวล)
          border: currentLang === 'th' ? '2px solid #1e40af' : '2px solid transparent',
        }}
      >
        TH 
      </button>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          borderRadius: '8px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',

          // --- 🌟 ปรับ Style ปุ่มให้เข้ากับกรอบ 🌟 ---
          background: currentLang === 'en' ? '#1e40af' : 'transparent',
          color: currentLang === 'en' ? 'white' : '#f0f2ff',
          border: currentLang === 'en' ? '2px solid #1e40af' : '2px solid transparent',
        }}
      >
        EN
      </button>
    </div>
  );
};

export default ProductList;