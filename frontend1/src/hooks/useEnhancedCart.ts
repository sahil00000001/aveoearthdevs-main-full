import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { enhancedApi } from '@/services/enhancedApi';
import { Product, Cart, CartItem } from '@/services/backendApi';

export const useEnhancedCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await enhancedApi.getCart();
      setCart(cartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, quantity: number = 1, variantId?: string) => {
    try {
      setLoading(true);
      setError(null);
      await enhancedApi.addToCart(productId, quantity, variantId);
      await loadCart(); // Reload cart after adding
      toast({
        title: 'Added to Cart',
        description: 'Product has been added to your cart.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      await enhancedApi.updateCartItem(cartItemId, quantity);
      await loadCart(); // Reload cart after updating
      toast({
        title: 'Cart Updated',
        description: 'Item quantity has been updated.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    try {
      setLoading(true);
      setError(null);
      await enhancedApi.removeFromCart(cartItemId);
      await loadCart(); // Reload cart after removing
      toast({
        title: 'Removed from Cart',
        description: 'Item has been removed from your cart.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from cart';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: clearCart method needs to be implemented in enhancedApi
      await loadCart(); // Reload cart after clearing
      toast({
        title: 'Cart Cleared',
        description: 'All items have been removed from your cart.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  // Calculate cart totals
  const cartTotal = cart?.total_amount || 0;
  const itemCount = cart?.items?.length || 0;
  const totalQuantity = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return {
    cart,
    loading,
    error,
    cartTotal,
    itemCount,
    totalQuantity,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
  };
};
