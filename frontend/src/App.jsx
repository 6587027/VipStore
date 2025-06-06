import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import ProductList from './components/ProductList';
import LoginForm from './components/LoginForm';
import CartModal from './components/CartModal';
import { useCart } from './context/CartContext';

// Create a wrapper component to use useCart hook
function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const { isCartOpen, closeCart } = useCart();

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

  return (
    <div className="App">
      <Header onLoginClick={handleShowLogin} />
      <ProductList />
      
      {/* Login Modal */}
      {showLogin && (
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onClose={handleCloseLogin}
        />
      )}

      {/* Cart Modal */}
      <CartModal 
        isOpen={isCartOpen}
        onClose={closeCart}
      />
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