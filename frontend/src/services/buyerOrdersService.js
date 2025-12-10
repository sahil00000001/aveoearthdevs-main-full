/**
 * Buyer Orders Service
 * 
 * Complete implementation of the buyer workflow:
 * 1. Cart Management (get, add, update, delete items)
 * 2. Order Creation and Management
 * 3. Payment Handling
 * 4. Returns Management
 * 5. Order Tracking
 */

import { buyerOrders, tokens, auth } from '../lib/api';
import addressService from './addressService';

class BuyerOrdersService {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  // Cache utilities
  isCacheValid(key) {
    const timestamp = this.cacheTimestamps.get(key);
    return timestamp && (Date.now() - timestamp) < this.cacheTTL;
  }

  setCache(key, data) {
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  getCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
    return null;
  }

  // Helper function to validate UUID format
  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Session management for guest users
  getSessionId() {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('ae_session_id');
      if (!sessionId) {
        sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ae_session_id', sessionId);
      }
      return sessionId;
    }
    return null;
  }

  clearSessionId() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ae_session_id');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const userTokens = tokens.get();
    return !!(userTokens?.access_token);
  }

  // ===================
  // CART MANAGEMENT
  // ===================

  async getCart() {
    try {
      const cacheKey = 'user_cart';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const sessionId = this.isAuthenticated() ? null : this.getSessionId();
      const cart = await buyerOrders.getCart(sessionId);
      
      this.setCache(cacheKey, cart);
      return cart;
    } catch (error) {
      console.error('Failed to get cart:', error);
      // If cart doesn't exist, return empty cart
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        const emptyCart = { items: [], total: 0, subtotal: 0, tax: 0, shipping: 0 };
        return emptyCart;
      }
      throw error;
    }
  }

  async addToCart(productId, quantity = 1, variantId = null) {
    try {
      const sessionId = this.isAuthenticated() ? null : this.getSessionId();
      const result = await buyerOrders.addToCart(productId, quantity, variantId, sessionId);
      
      // Invalidate cart cache
      this.cache.delete('user_cart');
      this.cache.delete('cart_count');
      
      return result;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  }

  async updateCartItem(cartItemId, quantity) {
    try {
      const result = await buyerOrders.updateCartItem(cartItemId, quantity);
      
      // Invalidate cart cache
      this.cache.delete('user_cart');
      this.cache.delete('cart_count');
      
      return result;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  }

  async removeCartItem(cartItemId) {
    try {
      const result = await buyerOrders.removeCartItem(cartItemId);
      
      // Invalidate cart cache
      this.cache.delete('user_cart');
      this.cache.delete('cart_count');
      
      return result;
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw error;
    }
  }

  async clearCart() {
    try {
      const sessionId = this.isAuthenticated() ? null : this.getSessionId();
      const result = await buyerOrders.clearCart(sessionId);
      
      // Invalidate cart cache
      this.cache.delete('user_cart');
      this.cache.delete('cart_count');
      
      return result;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }

  async getCartCount() {
    try {
      const cacheKey = 'cart_count';
      const cached = this.getCache(cacheKey);
      if (cached !== null) return cached;

      const sessionId = this.isAuthenticated() ? null : this.getSessionId();
      const result = await buyerOrders.getCartCount(sessionId);
      
      this.setCache(cacheKey, result.count);
      return result.count;
    } catch (error) {
      console.error('Failed to get cart count:', error);
      return 0;
    }
  }

  async transferCartToUser() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to transfer cart');
      }

      const sessionId = this.getSessionId();
      if (!sessionId) return null;

      const result = await buyerOrders.transferCart(sessionId);
      
      // Clear session after transfer
      this.clearSessionId();
      
      // Invalidate cart cache
      this.cache.delete('user_cart');
      this.cache.delete('cart_count');
      
      return result;
    } catch (error) {
      console.error('Failed to transfer cart:', error);
      throw error;
    }
  }

  // ===================
  // ORDER MANAGEMENT
  // ===================

  async createOrder(orderData) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to create orders');
      }

      // Extract the order details
      const { billingAddress, shippingAddress, paymentMethod, customerNotes, useDifferentShipping } = orderData;

      let billingAddressId;
      let shippingAddressId = null;

      // Get existing addresses to check for duplicates
      let existingAddresses = [];
      try {
        existingAddresses = await addressService.getAddresses();
        // Ensure it's an array
        if (!Array.isArray(existingAddresses)) {
          console.warn('Address service returned non-array:', existingAddresses);
          existingAddresses = [];
        }
      } catch (error) {
        console.error('Failed to fetch existing addresses:', error);
        existingAddresses = [];
      }

      // Find or create billing address
      const billingMatch = existingAddresses.find(addr =>
        addr.first_name === billingAddress.firstName &&
        addr.last_name === billingAddress.lastName &&
        addr.address_line_1 === billingAddress.streetAddress &&
        addr.city === billingAddress.city &&
        addr.postal_code === billingAddress.postalCode &&
        addr.country === billingAddress.country
      );

      if (billingMatch) {
        console.log('Found existing billing address:', billingMatch.id);
        billingAddressId = billingMatch.id;
      } else {
        console.log('Creating new billing address...');
        const createdBillingAddress = await auth.createAddress({
          type: 'billing',
          first_name: billingAddress.firstName,
          last_name: billingAddress.lastName,
          company: billingAddress.companyName || null,
          address_line_1: billingAddress.streetAddress,
          address_line_2: billingAddress.addressLine2 || null,
          city: billingAddress.city || '',
          state: billingAddress.state,
          postal_code: billingAddress.postalCode || '',
          country: billingAddress.country,
          phone: billingAddress.phone,
          is_default: false
        }, tokens.get()?.access_token);
        console.log('Created billing address:', createdBillingAddress.id);
        billingAddressId = createdBillingAddress.id;
      }

      // Find or create shipping address if different
      if (useDifferentShipping && shippingAddress) {
        const shippingMatch = existingAddresses.find(addr =>
          addr.first_name === shippingAddress.firstName &&
          addr.last_name === shippingAddress.lastName &&
          addr.address_line_1 === shippingAddress.streetAddress &&
          addr.city === shippingAddress.city &&
          addr.postal_code === shippingAddress.postalCode &&
          addr.country === shippingAddress.country
        );

        if (shippingMatch) {
          console.log('Found existing shipping address:', shippingMatch.id);
          shippingAddressId = shippingMatch.id;
        } else {
          console.log('Creating new shipping address...');
          const createdShippingAddress = await auth.createAddress({
            type: 'shipping',
            first_name: shippingAddress.firstName,
            last_name: shippingAddress.lastName,
            company: shippingAddress.companyName || null,
            address_line_1: shippingAddress.streetAddress,
            address_line_2: shippingAddress.addressLine2 || null,
            city: shippingAddress.city || '',
            state: shippingAddress.state,
            postal_code: shippingAddress.postalCode || '',
            country: shippingAddress.country,
            phone: shippingAddress.phone,
            is_default: false
          }, tokens.get()?.access_token);
          console.log('Created shipping address:', createdShippingAddress.id);
          shippingAddressId = createdShippingAddress.id;
        }
      }

      // Validate address IDs before creating order
      if (!billingAddressId || typeof billingAddressId !== 'string' || billingAddressId.trim() === '' || !this.isValidUUID(billingAddressId)) {
        throw new Error(`Invalid billing address ID: ${billingAddressId}`);
      }

      if (shippingAddressId && (!this.isValidUUID(shippingAddressId))) {
        throw new Error(`Invalid shipping address ID: ${shippingAddressId}`);
      }

      // Create the order
      console.log('Creating order with:', {
        billingAddressId,
        shippingAddressId,
        paymentMethod,
        customerNotes
      });

      const order = await buyerOrders.createOrder(billingAddressId, shippingAddressId, paymentMethod, customerNotes);
      
      // Invalidate relevant caches
      this.cache.delete('user_cart');
      this.cache.delete('cart_count');
      this.cache.delete('user_orders');
      
      return order;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  async getUserOrders(page = 1, limit = 20, status = null) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to view orders');
      }

      const cacheKey = `user_orders_${page}_${limit}_${status || 'all'}`;
      // Clear cache to ensure fresh data
      this.cache.delete(cacheKey);
      
      console.log('buyerOrdersService: Calling API buyerOrders.getUserOrders...');
      const orders = await buyerOrders.getUserOrders(page, limit, status);
      console.log('buyerOrdersService: API response:', orders);
      
      this.setCache(cacheKey, orders);
      return orders;
    } catch (error) {
      console.error('buyerOrdersService: Failed to get user orders:', error);
      throw error;
    }
  }

  async getOrderDetails(orderId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to view order details');
      }

      const cacheKey = `order_details_${orderId}`;
      // Clear cache to ensure fresh data for order status updates
      this.cache.delete(cacheKey);
      this.cacheTimestamps.delete(cacheKey);

      const order = await buyerOrders.getOrderDetails(orderId);
      
      this.setCache(cacheKey, order);
      return order;
    } catch (error) {
      console.error('Failed to get order details:', error);
      throw error;
    }
  }

  async cancelOrder(orderId, cancelReason) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to cancel orders');
      }

      const result = await buyerOrders.cancelOrder(orderId, cancelReason);
      
      // Invalidate relevant caches
      this.cache.delete(`order_details_${orderId}`);
      this.cache.delete('user_orders');
      
      return result;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  }

  // ===================
  // PAYMENT MANAGEMENT
  // ===================

  async getOrderPayments(orderId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to view payments');
      }

      const cacheKey = `order_payments_${orderId}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const payments = await buyerOrders.getOrderPayments(orderId);
      
      this.setCache(cacheKey, payments);
      return payments;
    } catch (error) {
      console.error('Failed to get order payments:', error);
      throw error;
    }
  }

  async getUserPayments(page = 1, limit = 20) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to view payments');
      }

      const cacheKey = `user_payments_${page}_${limit}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const payments = await buyerOrders.getUserPayments(page, limit);
      
      this.setCache(cacheKey, payments);
      return payments;
    } catch (error) {
      console.error('Failed to get user payments:', error);
      throw error;
    }
  }

  // ===================
  // RETURNS MANAGEMENT
  // ===================

  async createReturn(orderItemId, reason, description, quantity, images = []) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to create returns');
      }

      const result = await buyerOrders.createReturn(orderItemId, reason, description, quantity, images);
      
      // Invalidate relevant caches
      this.cache.delete('user_returns');
      
      return result;
    } catch (error) {
      console.error('Failed to create return:', error);
      throw error;
    }
  }

  async getUserReturns(page = 1, limit = 20) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to view returns');
      }

      const cacheKey = `user_returns_${page}_${limit}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const returns = await buyerOrders.getUserReturns(page, limit);
      
      this.setCache(cacheKey, returns);
      return returns;
    } catch (error) {
      console.error('Failed to get user returns:', error);
      throw error;
    }
  }

  async getReturnDetails(returnId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to view return details');
      }

      const cacheKey = `return_details_${returnId}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const returnDetails = await buyerOrders.getReturnDetails(returnId);
      
      this.setCache(cacheKey, returnDetails);
      return returnDetails;
    } catch (error) {
      console.error('Failed to get return details:', error);
      throw error;
    }
  }

  // ===================
  // ORDER TRACKING
  // ===================

  async trackOrder(orderId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be authenticated to track orders');
      }

      const cacheKey = `order_tracking_${orderId}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const tracking = await buyerOrders.trackOrder(orderId);
      
      // Shorter cache for tracking info (1 minute)
      this.cache.set(cacheKey, tracking);
      this.cacheTimestamps.set(cacheKey, Date.now());
      setTimeout(() => {
        this.cache.delete(cacheKey);
        this.cacheTimestamps.delete(cacheKey);
      }, 60000); // 1 minute
      
      return tracking;
    } catch (error) {
      console.error('Failed to track order:', error);
      throw error;
    }
  }

  // ===================
  // UTILITY METHODS
  // ===================

  // Clear all caches
  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // Get order status display text
  getOrderStatusText(status) {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'returned': 'Returned',
      'refunded': 'Refunded'
    };
    return statusMap[status] || status;
  }

  // Get payment status display text
  getPaymentStatusText(status) {
    const statusMap = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    };
    return statusMap[status] || status;
  }

  // Calculate cart totals
  calculateCartTotals(cart) {
    if (!cart?.items) return { subtotal: 0, total: 0, itemCount: 0 };

    let subtotal = 0;
    let itemCount = 0;
    
    cart.items.forEach(item => {
      // Use unit_price from cart item (backend calculation) or fallback to product price
      const price = parseFloat(item.unit_price || item.variant?.price || item.product?.price || 0);
      const quantity = parseInt(item.quantity || 1);
      subtotal += price * quantity;
      itemCount += quantity;
    });

    // Use backend totals if available, otherwise use calculated totals
    const backendSubtotal = parseFloat(cart.subtotal || 0);
    const backendTotal = parseFloat(cart.total_amount || cart.total || 0);
    
    return {
      subtotal: backendSubtotal > 0 ? backendSubtotal : subtotal,
      total: backendTotal > 0 ? backendTotal : subtotal,
      itemCount,
      currency: cart.currency || 'INR'
    };
  }

  // Format currency
  formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }
}

// Create and export a singleton instance
const buyerOrdersService = new BuyerOrdersService();
export default buyerOrdersService;
