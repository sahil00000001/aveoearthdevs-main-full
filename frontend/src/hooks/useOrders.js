/**
 * useOrders Hook
 * 
 * React hook for managing order operations including order creation,
 * tracking, payments, and returns.
 */
"use client"
import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import buyerOrdersService from '../services/buyerOrdersService';
import { useAuth } from './useAuth';

// Orders Context
const OrdersContext = createContext();

// Orders Provider Component
export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1, limit: 20 });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  // Load user orders
  const loadOrders = useCallback(async (page = 1, limit = 20, status = null) => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('useOrders: Calling buyerOrdersService.getUserOrders...');
      const ordersData = await buyerOrdersService.getUserOrders(page, limit, status);
      console.log('useOrders: Raw orders data:', ordersData);
      
      // Handle paginated response format
      const ordersList = ordersData?.items || ordersData || [];
      console.log('useOrders: Setting orders to:', ordersList);
      
      setOrders(ordersList);
      
      // Store pagination information
      if (ordersData && typeof ordersData === 'object') {
        setPagination({
          total: ordersData.total || ordersData.total_count || ordersList.length,
          pages: ordersData.pages || ordersData.total_pages || Math.ceil((ordersData.total || ordersData.total_count || ordersList.length) / limit),
          currentPage: page,
          limit: limit
        });
      }
    } catch (error) {
      console.error('useOrders: Failed to load orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Load order details
  const loadOrderDetails = useCallback(async (orderId) => {
    if (!isLoggedIn) return null;

    try {
      setLoading(true);
      setError(null);
      
      const orderDetails = await buyerOrdersService.getOrderDetails(orderId);
      setCurrentOrder(orderDetails);
      return orderDetails;
    } catch (error) {
      console.error('Failed to load order details:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Create new order
  const createOrder = useCallback(async (orderData) => {
    if (!isLoggedIn) {
      throw new Error('User must be logged in to create orders');
    }

    try {
      setLoading(true);
      setError(null);
      
      const order = await buyerOrdersService.createOrder(orderData);
      
      // Reload orders to include the new one
      await loadOrders();
      
      return order;
    } catch (error) {
      console.error('Failed to create order:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, loadOrders]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId, cancelReason) => {
    if (!isLoggedIn) return false;

    try {
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.cancelOrder(orderId, cancelReason);
      
      // Reload orders and current order details if needed
      await loadOrders();
      if (currentOrder?.id === orderId) {
        await loadOrderDetails(orderId);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, loadOrders, currentOrder, loadOrderDetails]);

  // Track order
  const trackOrder = useCallback(async (orderId) => {
    if (!isLoggedIn) return null;

    try {
      setLoading(true);
      setError(null);
      
      const tracking = await buyerOrdersService.trackOrder(orderId);
      return tracking;
    } catch (error) {
      console.error('Failed to track order:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Load payments
  const loadPayments = useCallback(async (page = 1, limit = 20) => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      setError(null);
      
      const paymentsData = await buyerOrdersService.getUserPayments(page, limit);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Failed to load payments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Load order payments
  const loadOrderPayments = useCallback(async (orderId) => {
    if (!isLoggedIn) return null;

    try {
      setLoading(true);
      setError(null);
      
      const orderPayments = await buyerOrdersService.getOrderPayments(orderId);
      return orderPayments;
    } catch (error) {
      console.error('Failed to load order payments:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Load returns
  const loadReturns = useCallback(async (page = 1, limit = 20) => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      setError(null);
      
      const returnsData = await buyerOrdersService.getUserReturns(page, limit);
      setReturns(returnsData);
    } catch (error) {
      console.error('Failed to load returns:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Create return request
  const createReturn = useCallback(async (orderItemId, reason, description, quantity, images = []) => {
    if (!isLoggedIn) return false;

    try {
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.createReturn(orderItemId, reason, description, quantity, images);
      
      // Reload returns to include the new one
      await loadReturns();
      
      return true;
    } catch (error) {
      console.error('Failed to create return:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, loadReturns]);

  // Load return details
  const loadReturnDetails = useCallback(async (returnId) => {
    if (!isLoggedIn) return null;

    try {
      setLoading(true);
      setError(null);
      
      const returnDetails = await buyerOrdersService.getReturnDetails(returnId);
      return returnDetails;
    } catch (error) {
      console.error('Failed to load return details:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Utility functions
  const getOrderStatusText = useCallback((status) => {
    return buyerOrdersService.getOrderStatusText(status);
  }, []);

  const getPaymentStatusText = useCallback((status) => {
    return buyerOrdersService.getPaymentStatusText(status);
  }, []);

  const formatCurrency = useCallback((amount, currency = 'INR') => {
    return buyerOrdersService.formatCurrency(amount, currency);
  }, []);

  // Load initial data when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      loadOrders();
    } else {
      // Clear data when user logs out
      setOrders([]);
      setCurrentOrder(null);
      setPayments([]);
      setReturns([]);
    }
  }, [isLoggedIn, loadOrders]);

  const value = {
    orders,
    pagination,
    currentOrder,
    payments,
    returns,
    loading,
    error,
    loadOrders,
    loadOrderDetails,
    createOrder,
    cancelOrder,
    trackOrder,
    loadPayments,
    loadOrderPayments,
    loadReturns,
    createReturn,
    loadReturnDetails,
    getOrderStatusText,
    getPaymentStatusText,
    formatCurrency,
    setCurrentOrder
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

// useOrders hook
export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

// Individual hooks for specific order operations
export const useOrderOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = useCallback(async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      const order = await buyerOrdersService.createOrder(orderData);
      return order;
    } catch (error) {
      console.error('Failed to create order:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackOrder = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      
      const tracking = await buyerOrdersService.trackOrder(orderId);
      return tracking;
    } catch (error) {
      console.error('Failed to track order:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(async (orderId, cancelReason) => {
    try {
      setLoading(true);
      setError(null);
      
      await buyerOrdersService.cancelOrder(orderId, cancelReason);
      return true;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createOrder,
    trackOrder,
    cancelOrder,
    loading,
    error
  };
};

export default useOrders;
