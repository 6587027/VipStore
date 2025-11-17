// frontend/src/App.jsx 
import React, { useState, useCallback } from 'react';
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


import { motion, AnimatePresence } from 'framer-motion';

// Import Admin Panel CSS
import './styles/AdminPanel.css';


const pageVariants = {
  initial: (direction) => ({
    x: direction > 0 ? '100vw' : '-100vw', // ถ้าไปข้างหน้า(1) มาจากขวา, ถ้าย้อนกลับ(-1) มาจากซ้าย
    opacity: 0
  }),
  animate: {
    x: 0, // สไลด์มาตรงกลาง
    opacity: 1,
    transition: { type: 'spring', stiffness: 1200, damping: 50 }
  },
  exit: (direction) => ({
    x: direction > 0 ? '-100vw' : '100vw', // ถ้าไปข้างหน้า(1) ออกไปซ้าย, ถ้าย้อนกลับ(-1) ออกไปขวา
    opacity: 0,
    transition: { type: 'spring', stiffness: 1200, damping: 50 }
  })
};


function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const [simulateServerError, setSimulateServerError] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Product Back Button State
  const [showProductBackButton, setShowProductBackButton] = useState(false);
  const [productBackHandler, setProductBackHandler] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  
  const [direction, setDirection] = useState(0);

  // 🎯 NEW: ProductList State Preservation
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
    // Keep Vip's existing states
    retryCount: 0,
    loadingPhase: 'initializing',
    serverWakeAttempts: 0,
    showRealError: false,
    isInitialLoad: true
  });

  const { isCartOpen, closeCart } = useCart();
  const { isAdmin } = useAuth();

  // Welcome animation complete
  const handleAnimationComplete = () => {
    setShowWelcome(false);
  };

  // Settings Handlers
  const handleSettingsClick = () => {
    console.log('📱 App.jsx - handleSettingsClick called!');
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    console.log('📱 App.jsx - handleCloseSettings called!');
    setShowSettings(false);
  };

  // 🎯 FIXED: Enhanced Product Preview Handlers with State Preservation
  const handleShowProduct = (productId, productData = null) => {
    console.log('🛍️ App.jsx - handleShowProduct called with ID:', productId);
    console.log('📦 Product data:', productData);
    
    // 💾 Save current scroll position BEFORE navigation
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    console.log('💾 Saving scroll position:', currentScrollPosition);
    
    // Update ProductList state with scroll position
    setProductListState(prev => ({
      ...prev,
      scrollPosition: currentScrollPosition
    }));
    
    
    setDirection(1); 
    
    setSelectedProductId(productId);
    setSelectedProduct(productData);
    setCurrentView('product');
  };

  // 🎯 FIXED: Enhanced Back from Product Handler - NO RELOAD
  const handleBackFromProduct = useCallback(() => {
    console.log('⬅️ App.jsx - handleBackFromProduct called - PRESERVING STATE');
    
    
    setDirection(-1);

    // ✅ Return to home WITHOUT resetting ProductList state
    setCurrentView('home');
    setSelectedProductId(null);
    setSelectedProduct(null);
    
    // Reset Product Back Button State
    setShowProductBackButton(false);
    setProductBackHandler(null);
    
    // 🔄 Restore scroll position after component renders
    // (โค้ดส่วนนี้ยังทำงานได้ดีเหมือนเดิมครับ)
    setTimeout(() => {
      const savedScrollPosition = productListState.scrollPosition;
      console.log('📍 Restoring scroll position:', savedScrollPosition);
      
      if (savedScrollPosition > 0) {
        window.scrollTo({
          top: savedScrollPosition,
          behavior: 'auto' // 👈 พี่แก้เป็น 'auto' จากที่คุยกันครั้งก่อนครับ
        });
      }
    }, 100); // 👈 ลด delay ลงนิดหน่อย
  }, [productListState.scrollPosition]);

  // Product Back Button Handler (from Header)
  const handleProductBackClick = () => {
    console.log('🔙 App.jsx - handleProductBackClick from Header');
    if (productBackHandler && typeof productBackHandler === 'function') {
      productBackHandler();
    } else {
      handleBackFromProduct();
    }
  };

  // 🎯 ProductList State Management Function
  const updateProductListState = (updates) => {
    // console.log('🔄 Updating ProductList state:', updates);
    setProductListState(prev => ({
      ...prev,
      ...updates,
      lastFetchTime: Date.now()
    }));
  };

  // 🎯 Check if should fetch data (prevent unnecessary API calls)
  const shouldFetchData = () => {
    // Fetch if no saved data or data is older than 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return !productListState?.products?.length || 
           !productListState?.lastFetchTime || 
           productListState.lastFetchTime < fiveMinutesAgo ||
           productListState.isInitialLoad; // Always fetch on initial load
  };

  const handleLoginSuccess = (user) => {
    setShowLogin(false);
    console.log('User logged in:', user);
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
    
    // Reset Product Back Button State
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
    // console.log('📤 App.jsx - onShowBackButton:', { show, handler: !!handler });
    setShowProductBackButton(show);
    setProductBackHandler(() => handler);
  }, []);

  return (
    <div className="App">
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
            
            // Product Preview Props
            showProductBackButton={showProductBackButton}
            onProductBack={handleProductBackClick}
            productName={selectedProduct?.name || ''}
          />
          <AnimatePresence initial={false} custom={direction}>
            {currentView === 'home' && (
              <motion.div
                key="home" // 👈 key สำคัญมาก
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
                key="admin" // 👈 key สำคัญมาก
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AdminDashboard />
              </motion.div>
            )}
            
            {currentView === 'product' && selectedProductId && (
              <motion.div
                key="product" // 👈 key สำคัญมาก
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
          
          {/* Modals (อยู่ข้างนอก AnimatePresence ถูกต้องแล้วครับ) */}
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

          {/* Settings Modal */}
          {showSettings && (
            <CustomerSettings
              isOpen={showSettings}
              onClose={handleCloseSettings}
            />
          )}

          {/* Enhanced Cart Modal */}
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