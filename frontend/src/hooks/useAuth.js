// Authentication hook for managing user state across the app
"use client";

import { useState, useEffect, useContext, createContext } from 'react';
import { auth, tokens } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Initialize auth state
  useEffect(() => {
    setIsClient(true);
    checkAuthState();

    // Listen for token changes
    const handleTokenChange = (event) => {
      const newTokens = event.detail || tokens.get();
      if (newTokens?.access_token) {
        fetchUserProfile(newTokens.access_token);
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ae_tokens_changed', handleTokenChange);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ae_tokens_changed', handleTokenChange);
      }
    };
  }, []);

  const checkAuthState = async () => {
    try {
      const userTokens = tokens.get();
      if (userTokens?.access_token) {
        await fetchUserProfile(userTokens.access_token);
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const profile = await auth.getProfile(token);
      setUserProfile(profile);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If profile fetch fails, token might be invalid
      tokens.clear();
      setIsLoggedIn(false);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const result = await auth.login(credentials.email, credentials.password);
      if (result?.tokens) {
        tokens.set(result.tokens);
        await fetchUserProfile(result.tokens.access_token);
        return result;
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    tokens.clear();
    setIsLoggedIn(false);
    setUserProfile(null);
  };

  const isVendor = userProfile?.user_metadata?.user_type === 'supplier' || 
                   userProfile?.user_metadata?.user_type === 'seller' ||
                   userProfile?.user_type === 'supplier' ||
                   userProfile?.user_type === 'seller';

  const isBuyer = !isVendor && isLoggedIn;

  const getUserName = () => {
    return userProfile?.name || 
           userProfile?.first_name || 
           userProfile?.email?.split('@')[0] || 
           'User';
  };

  const value = {
    isLoggedIn,
    userProfile,
    isLoading,
    isClient,
    isVendor,
    isBuyer,
    login,
    logout,
    getUserName,
    refreshProfile: () => {
      const userTokens = tokens.get();
      if (userTokens?.access_token) {
        fetchUserProfile(userTokens.access_token);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook for getting auth token
export const useAuthToken = () => {
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const updateToken = () => {
      const userTokens = tokens.get();
      setToken(userTokens?.access_token || null);
    };
    
    updateToken();
    if (typeof window !== 'undefined') {
      window.addEventListener('ae_tokens_changed', updateToken);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ae_tokens_changed', updateToken);
      }
    };
  }, []);
  
  return token;
};
