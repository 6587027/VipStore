// frontend/src/App.jsx - Updated with Admin Panel
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import ProductList from './components/ProductList';
import LoginForm from './components/LoginForm';
import CartModal from './components/CartModal';
import AdminDashboard from './components/admin/AdminDashboard';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

// Import Admin Panel CSS
import './styles/AdminPanel.css';

// Create a wrapper component to use useCart and useAuth hooks
function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'admin'
  const { isCartOpen, closeCart } = useCart();
  const { isAdmin } = useAuth();

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

  return (
    <div className="App">
      <Header 
        onLoginClick={handleShowLogin}
        onAdminClick={handleShowAdmin}
        onBackToHome={handleBackToHome}
        currentView={currentView}
      />
      
      {/* Main Content Area */}
      {currentView === 'home' && <ProductList />}
      {currentView === 'admin' && <AdminDashboard />}
      
      {/* Login Modal */}
      {showLogin && (
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onClose={handleCloseLogin}
        />
      )}

      {/* Cart Modal - Only show on home view */}
      {currentView === 'home' && (
        <CartModal 
          isOpen={isCartOpen}
          onClose={closeCart}
        />
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