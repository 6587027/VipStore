// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('vipstore_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('vipstore_user');
      }
    }
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        // Save user to state and localStorage
        setUser(data.user);
        localStorage.setItem('vipstore_user', JSON.stringify(data.user));
        
        return {
          success: true,
          user: data.user,
          message: data.message
        };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('vipstore_user');
    
    // Optional: call logout API
    fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
    }).catch(console.error);
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Check if user is customer
  const isCustomer = () => {
    return user && user.role === 'customer';
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    return user !== null;
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    user,
    loading,
    error,
    
    // Actions
    login,
    logout,
    clearError,
    
    // Helper functions
    isAdmin,
    isCustomer,
    isLoggedIn,
    
    // User info shortcuts
    userName: user?.name || user?.username || '',
    userRole: user?.role || '',
    userId: user?.id || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};