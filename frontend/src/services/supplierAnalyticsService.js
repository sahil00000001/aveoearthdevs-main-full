// Supplier Analytics service layer - handles business logic for analytics and metrics
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

class SupplierAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for analytics
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

  // Get supplier analytics overview
  async getAnalyticsOverview(days = 30) {
    try {
      const cacheKey = `analytics_overview_${days}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await request(`/supplier/products/analytics/overview?days=${days}`, { token });
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get analytics overview:', error);
      throw error;
    }
  }

  // Get low stock products
  async getLowStockProducts() {
    try {
      const cacheKey = 'low_stock_products';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await request('/supplier/products/inventory/low-stock', { token });
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get low stock products:', error);
      throw error;
    }
  }

  // Get product analytics for specific product
  async getProductAnalytics(productId, days = 30) {
    try {
      const cacheKey = `product_analytics_${productId}_${days}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await request(`/supplier/products/analytics/products/${productId}?days=${days}`, { token });
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get product analytics:', error);
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

  // Get shipment analytics
  async getShipmentAnalytics(days = 30) {
    try {
      const cacheKey = `shipment_analytics_${days}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await request(`/supplier/orders/analytics/shipments?days=${days}`, { token });
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get shipment analytics:', error);
      throw error;
    }
  }

  // Get inventory data for all products with stock levels
  async getInventoryOverview(params = {}) {
    try {
      const cacheKey = `inventory_overview_${JSON.stringify(params)}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      // Get products with their inventory data
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('limit', params.page_size); // Backend expects 'limit' not 'page_size'
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const path = `/supplier/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('Fetching inventory from:', path);
      const result = await request(path, { token });
      console.log('Inventory fetch result:', result);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get inventory overview:', error);
      throw error;
    }
  }

  // Get individual product inventory
  async getProductInventory(productId) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await request(`/supplier/products/${productId}/inventory`, { token });
      return result;
    } catch (error) {
      console.error(`Failed to get inventory for product ${productId}:`, error);
      throw error;
    }
  }

  // Update product inventory
  async updateProductInventory(productId, inventoryData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await request(`/supplier/products/${productId}/inventory`, {
        method: 'PUT',
        body: inventoryData,
        token
      });

      // Invalidate inventory caches
      this.cache.delete('inventory_overview');
      this.cache.delete('low_stock_products');
      this.cacheTimestamps.delete('inventory_overview');
      this.cacheTimestamps.delete('low_stock_products');

      return result;
    } catch (error) {
      console.error('Failed to update product inventory:', error);
      throw error;
    }
  }

  // Clear all caches
  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
}

// Create a singleton instance
const supplierAnalyticsService = new SupplierAnalyticsService();
export default supplierAnalyticsService;
