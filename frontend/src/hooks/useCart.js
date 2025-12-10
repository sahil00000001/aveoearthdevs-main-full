/**
 * useCart Hook
 * 
 * React hook for managing cart state throughout the application.
 * Provides cart operations, state management, and real-time updates.
 */
"use client"
import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import buyerOrdersService from '../services/buyerOrdersService';
import { useAuth } from './useAuth';

// Cart Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  // Load cart data
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cartData, count] = await Promise.all([
        buyerOrdersService.getCart(),
        buyerOrdersService.getCartCount()
      ]);
      
      setCart(cartData);
      setCartCount(count);
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Set default empty cart state instead of showing error
      setCart({ items: [], total: 0 });
      setCartCount(0);
      // Only set error if it's not a 404 (cart doesn't exist yet)
      if (!error.message?.includes('404') && !error.message?.includes('Not Found')) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(async (productId, quantity = 1, variantId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.addToCart(productId, quantity, variantId);
      
      // Reload cart data
      await loadCart();
      
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.updateCartItem(cartItemId, quantity);
      
      // Reload cart data
      await loadCart();
      
      return true;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.removeCartItem(cartItemId);
      
      // Reload cart data
      await loadCart();
      
      return true;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.clearCart();
      
      setCart(null);
      setCartCount(0);
      
      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Transfer cart from guest to user after login
  const transferCart = useCallback(async () => {
    try {
      if (!isLoggedIn) return false;
      
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.transferCartToUser();
      
      // Reload cart data after transfer
      await loadCart();
      
      return true;
    } catch (error) {
      console.error('Failed to transfer cart:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, loadCart]);

  // Calculate cart totals
  const cartTotals = useCallback(() => {
    return buyerOrdersService.calculateCartTotals(cart);
  }, [cart]);

  // Check if product is in cart
  const isInCart = useCallback((productId, variantId = null) => {
    if (!cart?.items) return false;
    
    return cart.items.some(item => 
      item.product.id === productId && 
      (variantId ? item.variant?.id === variantId : !item.variant)
    );
  }, [cart]);

  // Get item quantity in cart
  const getItemQuantity = useCallback((productId, variantId = null) => {
    if (!cart?.items) return 0;
    
    const item = cart.items.find(item => 
      item.product.id === productId && 
      (variantId ? item.variant?.id === variantId : !item.variant)
    );
    
    return item?.quantity || 0;
  }, [cart]);

  // Load cart on mount and when authentication changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Transfer cart when user logs in
  useEffect(() => {
    if (isLoggedIn && cartCount > 0) {
      transferCart();
    }
  }, [isLoggedIn, cartCount, transferCart]);

  const value = {
    cart,
    cartCount,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    transferCart,
    loadCart,
    cartTotals,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// useCart hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Individual hooks for specific cart operations (can be used without context)
export const useCartOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addToCart = useCallback(async (productId, quantity = 1, variantId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.addToCart(productId, quantity, variantId);
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.updateCartItem(cartItemId, quantity);
      return true;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.removeCartItem(cartItemId);
      return true;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addToCart,
    updateCartItem,
    removeFromCart,
    loading,
    error
  };
};

export default useCart;
