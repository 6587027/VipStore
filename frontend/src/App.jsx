// frontend/src/App.jsx 
import React, { useState, useCallback } from 'react'; // ✅ 1. เพิ่ม useCallback
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

// Import Admin Panel CSS
import './styles/AdminPanel.css';

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
    
    setSelectedProductId(productId);
    setSelectedProduct(productData);
    setCurrentView('product');
  };

  // 🎯 FIXED: Enhanced Back from Product Handler - NO RELOAD
  // ✅ 2. หุ้ม handleBackFromProduct ด้วย useCallback
  const handleBackFromProduct = useCallback(() => {
    console.log('⬅️ App.jsx - handleBackFromProduct called - PRESERVING STATE');
    
    // ✅ Return to home WITHOUT resetting ProductList state
    setCurrentView('home');
    setSelectedProductId(null);
    setSelectedProduct(null);
    
    // Reset Product Back Button State
    setShowProductBackButton(false);
    setProductBackHandler(null);
    
    // 🔄 Restore scroll position after component renders
    setTimeout(() => {
      const savedScrollPosition = productListState.scrollPosition;
      console.log('📍 Restoring scroll position:', savedScrollPosition);
      
      if (savedScrollPosition > 0) {
        window.scrollTo({
          top: savedScrollPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  }, [productListState.scrollPosition]); // ✅ ใส่ dependency ที่จำเป็น

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
      setCurrentView('admin');
    }
  };

  const handleBackToHome = () => {
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

  // ✅ 3. สร้างฟังก์ชัน onShowBackButton ที่เสถียร (Stable)
  const onShowBackButton = useCallback((show, handler) => {
    // console.log('📤 App.jsx - onShowBackButton:', { show, handler: !!handler });
    setShowProductBackButton(show);
    setProductBackHandler(() => handler);
  }, []); // ✅ ใส่ [] เพื่อให้ฟังก์ชันนี้ถูกสร้างแค่ครั้งเดียว

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
          
          {/* 🎯 Enhanced View Routing with State Preservation */}
          {currentView === 'home' && (
            <ProductList 
              onProductClick={handleShowProduct}
              
              // 🎯 NEW: State Preservation Props
              savedState={productListState}
              onStateUpdate={updateProductListState}
              shouldFetch={shouldFetchData()}
            />
          )}
          
          {currentView === 'admin' && <AdminDashboard />}
          
          {/* Enhanced ProductPreview */}
          {currentView === 'product' && selectedProductId && (
            <ProductPreview 
              productId={selectedProductId}
              onBack={handleBackFromProduct} // ✅ ใช้ฟังก์ชันจาก useCallback
              
              // Back Button ใน Header
              onShowBackButton={onShowBackButton} // ✅ 4. ใช้ฟังก์ชันใหม่จาก useCallback
            />
          )}
          
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