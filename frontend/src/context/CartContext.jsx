// frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('vipstore_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('vipstore_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('vipstore_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product._id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === product._id
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.price 
              }
            : item
        );
      } else {
        // Add new item to cart
        const newItem = {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
          subtotal: product.price * quantity,
          stock: product.stock || 99, // Default stock if not provided
          addedAt: new Date().toISOString()
        };
        return [...prevItems, newItem];
      }
    });
  };

  // Remove item from cart completely
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { 
              ...item, 
              quantity: newQuantity,
              subtotal: newQuantity * item.price 
            }
          : item
      )
    );
  };

  // Increase item quantity
  const increaseQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    if (item && item.quantity < item.stock) {
      updateQuantity(productId, item.quantity + 1);
    }
  };

  // Decrease item quantity
  const decreaseQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get cart statistics
  const getCartStats = () => {
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = cartItems.reduce((total, item) => total + item.subtotal, 0);
    
    return {
      totalItems,
      totalAmount,
      itemCount: cartItems.length
    };
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Get quantity of specific product in cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Get cart item by ID
  const getCartItem = (productId) => {
    return cartItems.find(item => item.id === productId);
  };

  // Cart modal controls
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Calculate shipping (example logic)
  const getShippingCost = () => {
    const { totalAmount } = getCartStats();
    if (totalAmount === 0) return 0;
    if (totalAmount >= 1000) return 0; // Free shipping over 1000 THB
    return 50; // 50 THB shipping fee
  };

  // Get final total including shipping
  const getFinalTotal = () => {
    const { totalAmount } = getCartStats();
    return totalAmount + getShippingCost();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Cart validation
  const validateCart = () => {
    const issues = [];
    
    cartItems.forEach(item => {
      if (item.quantity > item.stock) {
        issues.push(`${item.name}: จำนวนเกินสต็อก (มี ${item.stock} ชิ้น)`);
      }
      if (item.quantity <= 0) {
        issues.push(`${item.name}: จำนวนไม่ถูกต้อง`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  };

  const value = {
    // State
    cartItems,
    isCartOpen,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    
    // Cart modal controls
    openCart,
    closeCart,
    toggleCart,
    
    // Getters
    getCartStats,
    isInCart,
    getItemQuantity,
    getCartItem,
    getShippingCost,
    getFinalTotal,
    
    // Utilities
    formatCurrency,
    validateCart,
    
    // Computed values
    ...getCartStats(),
    
    // Helper booleans
    isEmpty: cartItems.length === 0,
    hasItems: cartItems.length > 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};