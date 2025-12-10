import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/EnhancedAuthContext'
import { useToast } from './use-toast'

// New clean wishlist hooks
export const useWishlistNew = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['wishlist-new', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      console.log('🔄 Fetching wishlist for user:', user.id)
      
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          user_id,
          product_id,
          added_at,
          products (
            id,
            name,
            price
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Error fetching wishlist:', error)
        throw error
      }
      
      console.log('✅ Wishlist fetched successfully:', data?.length || 0, 'items')
      return data || []
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useAddToWishlistNew = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('User must be logged in to add items to wishlist')
      
      console.log('🔄 Adding to wishlist:', { userId: user.id, productId })
      
      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlists')
        .select('user_id, product_id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()

      if (existing) {
        console.log('⚠️ Item already in wishlist')
        return existing
      }
      
      const { data, error } = await supabase
        .from('wishlists')
        .insert({ 
          user_id: user.id, 
          product_id: productId 
        })
        .select('user_id, product_id, added_at')
        .maybeSingle()

      if (error) {
        console.error('❌ Error adding to wishlist:', error)
        throw error
      }
      
      console.log('✅ Added to wishlist successfully:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-new', user?.id] })
      toast({
        title: "Added to wishlist!",
        description: "Item has been added to your wishlist.",
        duration: 3000,
      })
    },
    onError: (error) => {
      console.error('❌ Add to wishlist error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add item to wishlist. Please try again.",
        variant: "destructive",
      })
    },
  })
}

export const useRemoveFromWishlistNew = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('User must be logged in to remove items from wishlist')
      
      console.log('🔄 Removing from wishlist:', { userId: user.id, productId })
      
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) {
        console.error('❌ Error removing from wishlist:', error)
        throw error
      }
      
      console.log('✅ Removed from wishlist successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-new', user?.id] })
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
        duration: 3000,
      })
    },
    onError: (error) => {
      console.error('❌ Remove from wishlist error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      })
    },
  })
}

export const useIsInWishlistNew = (productId: string) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['wishlist-check-new', user?.id, productId],
    queryFn: async () => {
      if (!user || !productId) return false
      
      const { data, error } = await supabase
        .from('wishlists')
        .select('user_id, product_id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking wishlist:', error)
        throw error
      }
      
      return !!data
    },
    enabled: !!user && !!productId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
