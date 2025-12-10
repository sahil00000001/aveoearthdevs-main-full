// Products service layer - handles business logic for product management
import { productsSupplier, productsBuyer, tokens } from '../lib/api';

class ProductsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
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

  // SUPPLIER METHODS

  // Create new product
  async createProduct(productData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.createProduct(productData, token);
      
      // Invalidate products list cache
      this.cache.delete('supplier_products');
      this.cacheTimestamps.delete('supplier_products');
      
      return result;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  // Get supplier's products with caching
  async getSupplierProducts(params = {}) {
    try {
      const cacheKey = `supplier_products_${JSON.stringify(params)}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.listProducts(params, token);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get supplier products:', error);
      throw error;
    }
  }

  // Get single product for supplier
  async getSupplierProduct(productId) {
    try {
      const cacheKey = `supplier_product_${productId}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.getProduct(productId, token);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get supplier product:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(productId, productData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.updateProduct(productId, productData, token);
      
      // Invalidate caches
      this.cache.delete(`supplier_product_${productId}`);
      this.cache.delete('supplier_products');
      this.cacheTimestamps.delete(`supplier_product_${productId}`);
      this.cacheTimestamps.delete('supplier_products');
      
      return result;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(productId) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      await productsSupplier.deleteProduct(productId, token);
      
      // Invalidate caches
      this.cache.delete(`supplier_product_${productId}`);
      this.cache.delete('supplier_products');
      this.cacheTimestamps.delete(`supplier_product_${productId}`);
      this.cacheTimestamps.delete('supplier_products');
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }

  // Update product status (active/inactive)
  async updateProductStatus(productId, status) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      await productsSupplier.updateProduct(productId, { status }, token);
      
      // Invalidate caches
      this.cache.delete(`supplier_product_${productId}`);
      this.cache.delete('supplier_products');
      this.cacheTimestamps.delete(`supplier_product_${productId}`);
      this.cacheTimestrams.delete('supplier_products');
    } catch (error) {
      console.error('Failed to update product status:', error);
      throw error;
    }
  }

  // Toggle product visibility (visible/hidden)
  async toggleProductVisibility(productId, currentVisibility) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      // Determine new visibility (opposite of current)
      const newVisibility = currentVisibility === 'hidden' ? 'visible' : 'hidden';
      
      // Create form data for application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('visibility', newVisibility);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'}/supplier/products/${productId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Invalidate caches
      this.cache.delete(`supplier_product_${productId}`);
      this.cache.delete('supplier_products');
      this.cacheTimestamps.delete(`supplier_product_${productId}`);
      this.cacheTimestamps.delete('supplier_products');
      
      return result;
    } catch (error) {
      console.error('Failed to toggle product visibility:', error);
      throw error;
    }
  }

  // Publish product
  async publishProduct(productId) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.publishProduct(productId, token);
      
      // Invalidate caches
      this.cache.delete(`supplier_product_${productId}`);
      this.cache.delete('supplier_products');
      
      return result;
    } catch (error) {
      console.error('Failed to publish product:', error);
      throw error;
    }
  }

  // Upload product images
  async uploadProductImages(productId, files) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.uploadImages(productId, files, token);
      
      // Invalidate product cache
      this.cache.delete(`supplier_product_${productId}`);
      
      return result;
    } catch (error) {
      console.error('Failed to upload product images:', error);
      throw error;
    }
  }

  // Delete product image
  async deleteProductImage(productId, imageId) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'}/supplier/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      // Invalidate product cache
      this.cache.delete(`supplier_product_${productId}`);
      
      return await response.json();
    } catch (error) {
      console.error('Failed to delete product image:', error);
      throw error;
    }
  }

  // Update inventory
  async updateInventory(productId, inventoryData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.updateInventory(productId, inventoryData, token);
      
      // Invalidate product cache
      this.cache.delete(`supplier_product_${productId}`);
      
      return result;
    } catch (error) {
      console.error('Failed to update inventory:', error);
      throw error;
    }
  }

  // Get analytics
  async getAnalytics() {
    try {
      const cacheKey = 'supplier_analytics';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.getAnalytics(token);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }

  // Get low stock products
  async getLowStockProducts() {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.getLowStock(token);
      return result;
    } catch (error) {
      console.error('Failed to get low stock products:', error);
      throw error;
    }
  }

  // Get categories for supplier
  async getCategories() {
    try {
      const cacheKey = 'supplier_categories';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.getCategories(token);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw error;
    }
  }

  // Get brands for supplier
  async getBrands() {
    try {
      const cacheKey = 'supplier_brands';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsSupplier.getBrands(token);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get brands:', error);
      throw error;
    }
  }

  // BUYER METHODS (no auth required for most)

  // Browse products for buyers
  async browseProducts(params = {}) {
    try {
      const cacheKey = `buyer_products_${JSON.stringify(params)}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const result = await productsBuyer.listProducts(params);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to browse products:', error);
      throw error;
    }
  }

  // Get product details for buyers
  async getBuyerProduct(productSlug) {
    try {
      const cacheKey = `buyer_product_${productSlug}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const result = await productsBuyer.getProduct(productSlug);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get buyer product:', error);
      throw error;
    }
  }

  // Get category tree for buyers
  async getCategoryTree() {
    try {
      const cacheKey = 'buyer_categories_tree';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const result = await productsBuyer.getCategoriesTree();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get category tree:', error);
      throw error;
    }
  }

  // Get active brands for buyers
  async getActiveBrands() {
    try {
      const cacheKey = 'buyer_active_brands';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const result = await productsBuyer.getActiveBrands();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get active brands:', error);
      throw error;
    }
  }

  // REVIEW METHODS

  // Create product review
  async createReview(productId, reviewData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await productsBuyer.createReview(productId, reviewData, token);
      
      // Invalidate related caches
      this.cache.delete(`buyer_product_reviews_${productId}`);
      this.cache.delete(`buyer_product_review_stats_${productId}`);
      
      return result;
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
  }

  // Get product reviews
  async getProductReviews(productId, params = {}) {
    try {
      const cacheKey = `buyer_product_reviews_${productId}_${JSON.stringify(params)}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const result = await productsBuyer.getReviews(productId, params);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get product reviews:', error);
      throw error;
    }
  }

  // Clear all caches
  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // Clear specific cache entries
  clearProductCache(productId = null) {
    if (productId) {
      this.cache.delete(`supplier_product_${productId}`);
      this.cache.delete(`buyer_product_${productId}`);
      this.cacheTimestamps.delete(`supplier_product_${productId}`);
      this.cacheTimestamps.delete(`buyer_product_${productId}`);
    } else {
      // Clear all product caches
      for (const key of this.cache.keys()) {
        if (key.includes('product')) {
          this.cache.delete(key);
          this.cacheTimestamps.delete(key);
        }
      }
    }
  }
}

// Create singleton instance
export const productsService = new ProductsService();
export default productsService;
