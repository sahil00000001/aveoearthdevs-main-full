import api, { uploadRequest } from './api';

class ProductsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // Get categories for products
  async getCategories() {
    try {
      const cacheKey = 'categories';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await api.productsBuyer.getCategoriesTree();
      
      // FastAPI returns data directly, not wrapped in { data: [...] }
      const categories = Array.isArray(response) ? response : (response.data || []);
      
      this.setCache(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get brands for products
  async getBrands() {
    try {
      const cacheKey = 'brands';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await api.productsBuyer.getActiveBrands();
      
      // FastAPI returns data directly, not wrapped in { data: [...] }
      const brands = Array.isArray(response) ? response : (response.data || []);
      
      this.setCache(cacheKey, brands);
      return brands;
    } catch (error) {
      console.error('Error fetching brands:', error);
      return [];
    }
  }

  // Upload product image
  async uploadProductImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'product_image');

      const response = await uploadRequest('/files/upload', { formData });
      return response.data;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  }

  // Upload inventory document
  async uploadInventoryDocument(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'inventory_document');

      const response = await uploadRequest('/files/upload', { formData });
      return response.data;
    } catch (error) {
      console.error('Error uploading inventory document:', error);
      throw error;
    }
  }

  // Upload sustainability certificate
  async uploadSustainabilityCertificate(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'sustainability_certificate');

      const response = await uploadRequest('/files/upload', { formData });
      return response.data;
    } catch (error) {
      console.error('Error uploading sustainability certificate:', error);
      throw error;
    }
  }

  // Create product (for suppliers)
  async createProduct(productData) {
    try {
      const response = await api.productsSupplier.createProduct(productData);
      
      // Clear relevant caches
      this.clearProductCaches();
      
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(productId, productData) {
    try {
      const response = await api.productsSupplier.updateProduct(productId, productData);
      
      // Clear relevant caches
      this.clearProductCaches();
      
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Get supplier products
  async getSupplierProducts(page = 1, limit = 10) {
    try {
      const cacheKey = `supplier_products_${page}_${limit}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await api.productsSupplier.getProducts({ page, limit });
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      throw error;
    }
  }

  // Get buyer products (marketplace)
  async getBuyerProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const cacheKey = `buyer_products_${queryParams}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await api.productsBuyer.getProducts(filters);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching buyer products:', error);
      throw error;
    }
  }

  // Get single product details
  async getProduct(productSlug) {
    try {
      const cacheKey = `product_${productSlug}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await api.productsBuyer.getProduct(productSlug);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Clear product-related caches
  clearProductCaches() {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes('products') || key.includes('product_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Clear all caches
  clearCache() {
    this.cache.clear();
  }
}

// Create and export singleton instance
export const productsService = new ProductsService();
