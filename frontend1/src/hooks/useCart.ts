import { useState, useEffect, useCallback } from 'react'
import { backendApi } from '../services/backendApi'
import { useToast } from './use-toast'
import { useAuth } from '@/contexts/EnhancedAuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface CartItem {
  id: string
  product_id: string
  variant_id?: string
  quantity: number
  unit_price?: number
  total_price?: number
  product_name?: string
  product_slug?: string
  variant_title?: string
  sku?: string
  product?: {
    id: string
    name: string
    description?: string
    price: number
    discount?: number
    image_url?: string
    stock?: number
    sustainability_score?: number
  }
}

export interface Cart {
  id: string
  user_id?: string
  session_id?: string
  items: CartItem[]
  total_amount: number
  created_at: string
  updated_at: string
}

export const useCart = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: cart, isLoading: loading, refetch } = useQuery<Cart>({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      try {
        const cartData = await backendApi.getCart()
        return cartData
      } catch (error: any) {
        console.error('Error loading cart:', error)
        return {
          id: '',
          items: [],
          total_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 30000
  })

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity, variantId }: { productId: string; quantity: number; variantId?: string }) => {
      return await backendApi.addToCart(productId, quantity, variantId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast({
        title: "Added to cart successfully!",
        description: "Item has been added to your cart.",
        duration: 3000,
      })
    },
    onError: (error: any) => {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    }
  })

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      return await backendApi.updateCartItem(cartItemId, quantity)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error: any) => {
      console.error('Error updating quantity:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update quantity. Please try again.",
        variant: "destructive",
      })
    }
  })

  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      return await backendApi.removeFromCart(cartItemId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
        duration: 2000,
      })
    },
    onError: (error: any) => {
      console.error('Error removing from cart:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    }
  })

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return await backendApi.clearCart()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
        duration: 2000,
      })
    },
    onError: (error: any) => {
      console.error('Error clearing cart:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to clear cart. Please try again.",
        variant: "destructive",
      })
    }
  })

  const addToCart = useCallback((product: { id: string }, quantity: number = 1, variantId?: string) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart.",
        variant: "destructive",
      })
      return
    }
    addToCartMutation.mutate({ productId: product.id, quantity, variantId })
  }, [user, addToCartMutation, toast])

  const removeFromCart = useCallback((productId: string) => {
    const cartItem = cart?.items.find(item => item.product_id === productId)
    if (cartItem) {
      removeFromCartMutation.mutate(cartItem.id)
    }
  }, [cart, removeFromCartMutation])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const cartItem = cart?.items.find(item => item.product_id === productId)
    if (cartItem) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        updateQuantityMutation.mutate({ cartItemId: cartItem.id, quantity })
      }
    }
  }, [cart, updateQuantityMutation, removeFromCart])

  const clearCart = useCallback(() => {
    clearCartMutation.mutate()
  }, [clearCartMutation])

  const getTotalPrice = useCallback(() => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => {
      const unitPrice = item.unit_price || item.product?.price || 0
      const discount = item.product?.discount || 0
      const discountedPrice = discount > 0 
        ? unitPrice * (1 - discount / 100)
        : unitPrice
      return total + (discountedPrice * item.quantity)
    }, 0)
  }, [cart])

  const getSubtotal = useCallback(() => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => {
      const unitPrice = item.unit_price || item.product?.price || 0
      return total + (unitPrice * item.quantity)
    }, 0)
  }, [cart])

  const getTotalItems = useCallback(() => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  const isInCart = useCallback((productId: string) => {
    if (!cart?.items) return false
    return cart.items.some(item => item.product_id === productId)
  }, [cart])

  const getItemQuantity = useCallback((productId: string) => {
    if (!cart?.items) return 0
    const item = cart.items.find(item => item.product_id === productId)
    return item ? item.quantity : 0
  }, [cart])

  // Transform cart items to match expected structure
  // Backend returns items with product_id, product_name, etc., not full product objects
  const cartItems = cart?.items.map(item => ({
    product: {
      id: item.product_id,
      name: (item as any).product_name || item.product?.name || 'Product',
      description: item.product?.description,
      price: item.unit_price || item.product?.price || 0,
      discount: item.product?.discount,
      image_url: item.product?.image_url,
      stock: item.product?.stock,
      sustainability_score: item.product?.sustainability_score,
      ...item.product
    },
    quantity: item.quantity,
    id: item.id
  })) || []

  return {
    cart: cartItems,
    cartData: cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getSubtotal,
    getTotalItems,
    isInCart,
    getItemQuantity,
    refetch
  }
}
