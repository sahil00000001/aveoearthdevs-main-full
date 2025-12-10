import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '../services/api'
import { useAuth } from '../contexts/EnhancedAuthContext'
import { useToast } from './use-toast'

export const useWishlist = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: () => wishlistApi.getByUserId(user!.id),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useAddToWishlist = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: (productId: string) => {
      if (!user) {
        throw new Error('User must be logged in to add items to wishlist')
      }
      return wishlistApi.add(user.id, productId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] })
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

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: (productId: string) => {
      if (!user) {
        throw new Error('User must be logged in to remove items from wishlist')
      }
      return wishlistApi.remove(user.id, productId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] })
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

export const useIsInWishlist = (productId: string) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['wishlist', 'check', user?.id, productId],
    queryFn: () => wishlistApi.isInWishlist(user!.id, productId),
    enabled: !!user && !!productId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
