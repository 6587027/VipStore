// frontend/src/App.jsx 
import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios'; // ✅ เพิ่ม axios สำหรับยิง API
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductPreview from './components/ProductPreview';
import LoginForm from './components/LoginForm';
import CartModal from './components/CartModal';
import AdminDashboard from './components/admin/AdminDashboard';
import UserProfileModal from './components/UserProfileModal';
import CustomerSettings from './components/settings/CustomerSettings';
import WelcomeAnimation from './components/WelcomeAnimation';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import Announcement from './components/Announcement';

import { motion, AnimatePresence } from 'framer-motion';

// Import Admin Panel CSS
import './styles/AdminPanel.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vipstore-backend.onrender.com/api';

const pageVariants = {
  initial: (direction) => ({
    x: direction > 0 ? '100vw' : '-100vw',
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 1200, damping: 50 }
  },
  exit: (direction) => ({
    x: direction > 0 ? '-100vw' : '100vw',
    opacity: 0,
    transition: { type: 'spring', stiffness: 1200, damping: 50 }
  })
};

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Product Back Button State
  const [showProductBackButton, setShowProductBackButton] = useState(false);
  const [productBackHandler, setProductBackHandler] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [direction, setDirection] = useState(0);

  // 🎯 ProductList State Preservation
  const [productListState, setProductListState] = useState({
    products: [],
    filteredProducts: [],
    selectedCategory: '',
    searchTerm: '',
    priceRange: { min: 0, max: 3000000 },
    sortOption: '',
    loading: false,
    scrollPosition: 0,
    lastFetchTime: null,
    retryCount: 0,
    loadingPhase: 'initializing',
    serverWakeAttempts: 0,
    showRealError: false,
    isInitialLoad: true
  });

  // 🎯 Announcement State (เริ่มต้นเป็นค่าว่างๆ ก่อนดึงจาก Server)
  const [announcementConfig, setAnnouncementConfig] = useState({
    active: false,
    title: '',
    content: '',
    priority: 'green',
    mode: 'toast',
    lastUpdated: 0
  });

  const { isCartOpen, closeCart } = useCart();
  const { isAdmin } = useAuth();

  // (ดึงข้อมูลประกาศจาก Server ทันทีที่เข้าเว็บ เพื่อให้ User เห็นข้อมูลล่าสุด)
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        console.log('📢 Fetching announcement from server...');
        const response = await axios.get(`${API_BASE_URL}/announcement`);
        
        if (response.data && response.data.success) {
          console.log('✅ Announcement loaded:', response.data.data);
          setAnnouncementConfig(response.data.data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch announcement:', error);
      }
    };

    fetchAnnouncement();
    
    // pull announcement every 60 seconds
    const interval = setInterval(fetchAnnouncement, 60000);
    return () => clearInterval(interval);

  }, []);

  // (ฟังก์ชันนี้จะถูกส่งไปให้ AdminDashboard ใช้ตอนกด Save)
  const handleUpdateAnnouncement = async (newConfig) => {
    try {
      // อัปเดตหน้าจอ Admin ทันที (Optimistic UI)
      setAnnouncementConfig(newConfig);

      // ส่งข้อมูลไปบันทึกที่ Server (Database)
      console.log('📤 Saving announcement to server...');
      await axios.put(`${API_BASE_URL}/announcement`, newConfig);
      console.log('✅ Announcement saved successfully');
      
    } catch (error) {
      console.error('❌ Failed to save announcement:', error);
      alert('Failed to save to server. Please try again.');
    }
  };

  // Welcome animation complete
  const handleAnimationComplete = () => {
    setShowWelcome(false);
  };

  // Settings Handlers
  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // Product Preview Handlers
  const handleShowProduct = (productId, productData = null) => {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    setProductListState(prev => ({
      ...prev,
      scrollPosition: currentScrollPosition
    }));

    setDirection(1);
    setSelectedProductId(productId);
    setSelectedProduct(productData);
    setCurrentView('product');
  };

  const handleBackFromProduct = useCallback(() => {
    setDirection(-1);
    setCurrentView('home');
    setSelectedProductId(null);
    setSelectedProduct(null);
    setShowProductBackButton(false);
    setProductBackHandler(null);

    setTimeout(() => {
      const savedScrollPosition = productListState.scrollPosition;
      if (savedScrollPosition > 0) {
        window.scrollTo({
          top: savedScrollPosition,
          behavior: 'auto'
        });
      }
    }, 100);
  }, [productListState.scrollPosition]);

  const handleProductBackClick = () => {
    if (productBackHandler && typeof productBackHandler === 'function') {
      productBackHandler();
    } else {
      handleBackFromProduct();
    }
  };

  const updateProductListState = (updates) => {
    setProductListState(prev => ({
      ...prev,
      ...updates,
      lastFetchTime: Date.now()
    }));
  };

  const shouldFetchData = () => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return !productListState?.products?.length ||
      !productListState?.lastFetchTime ||
      productListState.lastFetchTime < fiveMinutesAgo ||
      productListState.isInitialLoad;
  };

  const handleLoginSuccess = (user) => {
    setShowLogin(false);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const handleShowAdmin = () => {
    if (isAdmin()) {
      setDirection(1);
      setCurrentView('admin');
    }
  };

  const handleBackToHome = () => {
    setDirection(-1);
    setCurrentView('home');
    setSelectedProductId(null);
    setSelectedProduct(null);
    setShowProductBackButton(false);
    setProductBackHandler(null);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const onShowBackButton = useCallback((show, handler) => {
    setShowProductBackButton(show);
    setProductBackHandler(() => handler);
  }, []);

  return (
    <div className="App">

      {/* Announcement Display */}
      {/* แสดงผลตาม Config ที่ดึงมาจาก Server */}
      <Announcement config={announcementConfig} />

      {/* Welcome Animation */}
      {showWelcome && (
        <WelcomeAnimation onAnimationComplete={handleAnimationComplete} />
      )}

      {/* Main App */}
      {!showWelcome && (
        <>
          <Header
            onLoginClick={handleShowLogin}
            onAdminClick={handleShowAdmin}
            onBackToHome={handleBackToHome}
            onProfileClick={handleShowProfile}
            onSettingsClick={handleSettingsClick}
            currentView={currentView}
            showProductBackButton={showProductBackButton}
            onProductBack={handleProductBackClick}
            productName={selectedProduct?.name || ''}
          />
          <AnimatePresence initial={false} custom={direction}>
            {currentView === 'home' && (
              <motion.div
                key="home"
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ProductList
                  onProductClick={handleShowProduct}
                  savedState={productListState}
                  onStateUpdate={updateProductListState}
                  shouldFetch={shouldFetchData()}
                />
              </motion.div>
            )}

            {currentView === 'admin' && (
              <motion.div
                key="admin"
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* ✅ ส่ง Config และ ฟังก์ชัน Update ไปให้ AdminDashboard */}
                <AdminDashboard
                  announcementConfig={announcementConfig}
                  setAnnouncementConfig={handleUpdateAnnouncement}
                />
              </motion.div>
            )}

            {currentView === 'product' && selectedProductId && (
              <motion.div
                key="product"
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ProductPreview
                  productId={selectedProductId}
                  onBack={handleBackFromProduct}
                  onShowBackButton={onShowBackButton}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modals */}
          {showLogin && (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onClose={handleCloseLogin}
            />
          )}

          {showProfile && (
            <UserProfileModal
              isOpen={showProfile}
              onClose={handleCloseProfile}
            />
          )}

          {showSettings && (
            <CustomerSettings
              isOpen={showSettings}
              onClose={handleCloseSettings}
            />
          )}

          {(currentView === 'home' || currentView === 'product') && (
            <CartModal
              isOpen={isCartOpen}
              onClose={closeCart}
            />
          )}
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;