import React, { createContext, useContext, useEffect, useState } from 'react';
import { TokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = TokenStorage.isAuthenticated();
      setIsAuthenticated(authStatus);
      console.log('🔐 Auth status checked:', authStatus);
    };

    checkAuth();

    // Listen for logout events from API client
    const handleLogout = () => {
      console.log('🚨 Global logout event received');
      setIsAuthenticated(false);
      setUser(null);
    };

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('auth:logout', handleLogout);
    }

    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('auth:logout', handleLogout);
      }
    };
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    console.log('✅ User logged in:', userData);
  };

  const logout = async () => {
    try {
      await TokenStorage.clear();
      setIsAuthenticated(false);
      setUser(null);
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading: false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
