// Supplier Orders service layer - handles business logic for order management
import { tokens } from '../lib/api';

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

// Generic request handler
async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (data) {
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail)) {
        message = data.detail
          .map((d) => (d?.msg ? `${d.msg}${d?.loc ? ` at ${d.loc.join('.')}` : ''}` : JSON.stringify(d)))
          .join("; ");
      } else if (data.message) message = data.message;
    }
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

class SupplierOrdersService {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for orders (more frequent updates)
  }

  // Get current auth token
  getToken() {
    const userTokens = tokens.get();
    return userTokens?.access_token;
  }

  // Check if cache is valid
  isCacheValid(key) {
    const timestamp = this.cacheTimestamps.get(key);
    return timestamp && (Date.now() - timestamp) < this.CACHE_DURATION;
  }

  // Set cache with timestamp
  setCache(key, data) {
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  // Get cache if valid
  getCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  // Get supplier orders with pagination and filtering
  async getOrders(params = {}) {
    try {
      const cacheKey = `supplier_orders_${JSON.stringify(params)}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      if (params.status) queryParams.append('status', params.status);

      const path = `/supplier/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const result = await request(path, { token });
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get supplier orders:', error);
      throw error;
    }
  }

  // Get single order item details
  async getOrderItem(orderItemId) {
    try {
      const cacheKey = `order_item_${orderItemId}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await request(`/supplier/orders/${orderItemId}`, { token });
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get order item:', error);
      throw error;
    }
  }

  // Update order item fulfillment status
  async updateOrderFulfillment(orderItemId, fulfillmentData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await request(`/supplier/orders/${orderItemId}/fulfillment`, {
        method: 'PUT',
        body: fulfillmentData,
        token
      });

      // Invalidate caches
      this.cache.delete(`order_item_${orderItemId}`);
      this.cache.delete('supplier_orders');
      this.cacheTimestamps.delete(`order_item_${orderItemId}`);
      this.cacheTimestamps.delete('supplier_orders');

      return result;
    } catch (error) {
      console.error('Failed to update order fulfillment:', error);
      throw error;
    }
  }

  // Get order analytics
  async getOrderAnalytics(days = 30) {
    try {
      const cacheKey = `order_analytics_${days}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await request(`/supplier/orders/analytics/orders?days=${days}`, { token });
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get order analytics:', error);
      throw error;
    }
  }

  // Get shipments
  async getShipments(params = {}) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const path = `/supplier/orders/shipments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const result = await request(path, { token });
      return result;
    } catch (error) {
      console.error('Failed to get shipments:', error);
      throw error;
    }
  }

  // Get returns
  async getReturns(params = {}) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const path = `/supplier/orders/returns${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const result = await request(path, { token });
      return result;
    } catch (error) {
      console.error('Failed to get returns:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const supplierOrdersService = new SupplierOrdersService();
export default supplierOrdersService;
