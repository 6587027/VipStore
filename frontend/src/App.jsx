// frontend/src/App.jsx - Welcome Animation → Server Error Flow
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import ProductList from './components/ProductList';
import LoginForm from './components/LoginForm';
import CartModal from './components/CartModal';
import AdminDashboard from './components/admin/AdminDashboard';
import UserProfileModal from './components/UserProfileModal';
import WelcomeAnimation from './components/WelcomeAnimation'; // Welcome Animation
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

// Import Admin Panel CSS
import './styles/AdminPanel.css';

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true); // 🆕 Welcome state
  const [simulateServerError, setSimulateServerError] = useState(true); // 🆕 Force server error
  const { isCartOpen, closeCart } = useCart();
  const { isAdmin } = useAuth();

  // 🆕 Welcome animation complete → Show server error page
  const handleAnimationComplete = () => {
    setShowWelcome(false);
    // หลัง welcome animation เสร็จ จะแสดงหน้า ProductList 
    // ซึ่งจะแสดง Server Error เพราะ backend ไม่ทำงาน
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
            currentView={currentView}
          />
          
          {/* 
            🎯 ProductList จะแสดง Server Error Page เพราะ backend ไม่เปิด
            (หน้าที่มี animation server shutdown ที่เราทำไว้) 
          */}
          {currentView === 'home' && <ProductList />}
          {currentView === 'admin' && <AdminDashboard />}
          
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

          {currentView === 'home' && (
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