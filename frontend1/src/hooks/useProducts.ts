import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../services/api'

export const useProducts = (page: number = 1, limit: number = 12, categoryId?: string) => {
  return useQuery({
    queryKey: ['products', page, limit, categoryId],
    queryFn: () => productsApi.getAll(page, limit, categoryId),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Add timeout to prevent hanging
    meta: {
      timeout: 5000, // 5 second timeout
    },
  })
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  })
}

export const useSearchProducts = (query: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['products', 'search', query, categoryId],
    queryFn: () => productsApi.search(query, categoryId),
    enabled: query.length > 1, // Reduced from 2 to 1 for better UX
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export const useFeaturedProducts = (limit: number = 12) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => productsApi.getFeatured(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export const useEcoFriendlyProducts = (limit: number = 12) => {
  return useQuery({
    queryKey: ['products', 'eco-friendly', limit],
    queryFn: () => productsApi.getEcoFriendly(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      productsApi.update(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
