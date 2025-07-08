// frontend/src/App.jsx - Updated with ProductPreview Integration
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductPreview from './components/ProductPreview'; // 🆕 เพิ่ม ProductPreview
import LoginForm from './components/LoginForm';
import CartModal from './components/CartModal';
import AdminDashboard from './components/admin/AdminDashboard';
import UserProfileModal from './components/UserProfileModal';
import CustomerSettings from './components/settings/CustomerSettings'; // 🔥 เพิ่ม Import
import WelcomeAnimation from './components/WelcomeAnimation'; // Welcome Animation
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
// import ChatButton from './components/chat/ChatButton';

// Import Admin Panel CSS
import './styles/AdminPanel.css';

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true); // 🆕 Welcome state
  const [simulateServerError, setSimulateServerError] = useState(true); // 🆕 Force server error
  const [selectedProductId, setSelectedProductId] = useState(null); // 🆕 เพิ่ม Product ID state
  const [showSettings, setShowSettings] = useState(false); // 🔥 เพิ่ม Settings state
  
  // ✨ เพิ่ม Product Back Button State
  const [showProductBackButton, setShowProductBackButton] = useState(false);
  const [productBackHandler, setProductBackHandler] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null); // ✨ เพิ่ม selected product info

  const { isCartOpen, closeCart } = useCart();
  const { isAdmin } = useAuth();

  // 🆕 Welcome animation complete → Show server error page
  const handleAnimationComplete = () => {
    setShowWelcome(false);
    // หลัง welcome animation เสร็จ จะแสดงหน้า ProductList 
    // ซึ่งจะแสดง Server Error เพราะ backend ไม่ทำงาน
  };

  // 🔥 เพิ่ม Settings Handler
  const handleSettingsClick = () => {
    console.log('📱 App.jsx - handleSettingsClick called!'); // Debug
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    console.log('📱 App.jsx - handleCloseSettings called!'); // Debug
    setShowSettings(false);
  };

  // ✨ Enhanced Product Preview Handlers
  const handleShowProduct = (productId, productData = null) => {
    console.log('🛍️ App.jsx - handleShowProduct called with ID:', productId);
    console.log('📦 Product data:', productData);
    
    setSelectedProductId(productId);
    setSelectedProduct(productData); // เก็บข้อมูลสินค้า
    setCurrentView('product');
  };

  // ✨ Enhanced Back from Product Handler
  const handleBackFromProduct = () => {
    console.log('⬅️ App.jsx - handleBackFromProduct called');
    setCurrentView('home');
    setSelectedProductId(null);
    setSelectedProduct(null);
    
    // ✨ Reset Product Back Button State
    setShowProductBackButton(false);
    setProductBackHandler(null);
  };

  // ✨ Product Back Button Handler (จาก Header)
  const handleProductBackClick = () => {
    console.log('🔙 App.jsx - handleProductBackClick from Header');
    if (productBackHandler && typeof productBackHandler === 'function') {
      productBackHandler(); // เรียกฟังก์ชันที่ ProductPreview ส่งมา
    } else {
      // Fallback
      handleBackFromProduct();
    }
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
    setSelectedProductId(null); // 🆕 Reset product ID เมื่อกลับหน้าหลัก
    setSelectedProduct(null);
    
    // ✨ Reset Product Back Button State
    setShowProductBackButton(false);
    setProductBackHandler(null);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  return (
    <div className="App">
      {/* 🎨 Welcome Animation - Show first */}
      {showWelcome && (
        <WelcomeAnimation onAnimationComplete={handleAnimationComplete} />
      )}
      
      {/* 🖥️ Main App - Show after welcome animation */}
      {!showWelcome && (
        <>
          <Header 
            onLoginClick={handleShowLogin}
            onAdminClick={handleShowAdmin}
            onBackToHome={handleBackToHome}
            onProfileClick={handleShowProfile}
            onSettingsClick={handleSettingsClick} // 🔥 เพิ่ม Settings prop
            currentView={currentView}
            
            // ✨ เพิ่ม Product Preview Props
            showProductBackButton={showProductBackButton}
            onProductBack={handleProductBackClick}
            productName={selectedProduct?.name || ''}
          />
          
          {/* 🆕 Enhanced View Routing */}
          {currentView === 'home' && (
            <ProductList onProductClick={handleShowProduct} />
          )}
          
          {currentView === 'admin' && <AdminDashboard />}
          
          {/* ✨ Enhanced ProductPreview with Back Button Integration */}
          {currentView === 'product' && selectedProductId && (
            <ProductPreview 
              productId={selectedProductId}
              onBack={handleBackFromProduct}
              
              // ✨ เพิ่ม Prop สำหรับ Back Button ใน Header
              onShowBackButton={(show, handler) => {
                console.log('📤 App.jsx - onShowBackButton:', { show, handler: !!handler });
                setShowProductBackButton(show);
                setProductBackHandler(() => handler); // Wrap in function เพื่อป้องกัน infinite loop
              }}
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

          {/* 🔥 Settings Modal - เพิ่มส่วนนี้ */}
          {showSettings && (
            <CustomerSettings
              isOpen={showSettings}
              onClose={handleCloseSettings}
            />
          )}

          {/* ✨ Enhanced Cart Modal - แสดงแค่ในหน้า home และ product */}
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