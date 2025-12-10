import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { enhancedApi } from '@/services/enhancedApi';
import { Order, PaginatedResponse } from '@/services/backendApi';

export const useEnhancedOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await enhancedApi.getOrders(page, limit);
      
      if (Array.isArray(response)) {
        // Fallback response format
        setOrders(response);
        setPagination({
          page: 1,
          limit: response.length,
          total: response.length,
          totalPages: 1,
        });
      } else {
        // Paginated response format
        setOrders(response.data);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.total_pages,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrder = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Note: getOrder method needs to be implemented in enhancedApi
      const order = await enhancedApi.getOrder?.(orderId);
      return order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load order';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData: {
    billing_address_id: string;
    shipping_address_id: string;
    payment_method: string;
    customer_notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const newOrder = await enhancedApi.createOrder(orderData);
      await loadOrders(); // Reload orders after creating
      toast({
        title: 'Order Created',
        description: 'Your order has been placed successfully.',
      });
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadOrders]);

  const cancelOrder = useCallback(async (orderId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      // Note: cancelOrder method needs to be implemented in enhancedApi
      await enhancedApi.cancelOrder?.(orderId, reason);
      await loadOrders(); // Reload orders after cancelling
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadOrders]);

  // Get order status color
  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get order status icon
  const getOrderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '📦';
      case 'cancelled':
        return '❌';
      case 'returned':
        return '↩️';
      default:
        return '❓';
    }
  };

  // Calculate order stats
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

  return {
    orders,
    loading,
    error,
    pagination,
    totalOrders,
    totalValue,
    pendingOrders,
    deliveredOrders,
    loadOrders,
    getOrder,
    createOrder,
    cancelOrder,
    getOrderStatusColor,
    getOrderStatusIcon,
  };
};
