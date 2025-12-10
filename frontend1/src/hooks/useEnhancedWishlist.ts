import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { enhancedApi } from '@/services/enhancedApi';
import { WishlistItem, Product } from '@/services/backendApi';

export const useEnhancedWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const wishlistData = await enhancedApi.getWishlist();
      setWishlist(wishlistData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist');
      console.error('Error loading wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      await enhancedApi.addToWishlist(productId);
      await loadWishlist(); // Reload wishlist after adding
      toast({
        title: 'Added to Wishlist',
        description: 'Product has been added to your wishlist.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to wishlist';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadWishlist]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      await enhancedApi.removeFromWishlist(productId);
      await loadWishlist(); // Reload wishlist after removing
      toast({
        title: 'Removed from Wishlist',
        description: 'Product has been removed from your wishlist.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from wishlist';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.product_id === productId);
  }, [wishlist]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // Calculate wishlist stats
  const itemCount = wishlist.length;
  const totalValue = wishlist.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const discount = item.product?.discount || 0;
    const discountedPrice = price * (1 - discount / 100);
    return sum + discountedPrice;
  }, 0);

  return {
    wishlist,
    loading,
    error,
    itemCount,
    totalValue,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    loadWishlist,
  };
};
