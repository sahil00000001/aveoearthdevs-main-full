import { backendApi, productsApi, categoriesApi, ordersApi, wishlistApi, cartApi } from './backendApi';
import { aiService } from './aiService';
import { productVerificationService } from './productVerificationService';

// Enhanced API service that combines backend, AI, and verification services
class EnhancedApiService {
  private isBackendConnected: boolean = false;
  private isAIConnected: boolean = false;
  private isVerificationConnected: boolean = false;

  constructor() {
    this.checkConnections();
  }

  private async checkConnections() {
    // Check backend connection
    try {
      await backendApi.healthCheck();
      this.isBackendConnected = true;
      console.log('✅ Backend API connected');
    } catch (error) {
      this.isBackendConnected = false;
      console.log('⚠️ Backend API not available');
    }

    // Check AI service connection
    try {
      await aiService.healthCheck();
      this.isAIConnected = true;
      console.log('✅ AI Service connected');
    } catch (error) {
      this.isAIConnected = false;
      console.log('⚠️ AI Service not available');
    }

    // Check product verification service connection
    try {
      await productVerificationService.healthCheck();
      this.isVerificationConnected = true;
      console.log('✅ Product Verification Service connected');
    } catch (error) {
      this.isVerificationConnected = false;
      console.log('⚠️ Product Verification Service not available');
    }
  }

  // Connection status
  getConnectionStatus() {
    return {
      backend: this.isBackendConnected,
      ai: this.isAIConnected,
      verification: this.isVerificationConnected,
    };
  }

  // Products API with fallback
  async getProducts(params: any = {}) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.getProducts(params);
      } catch (error) {
        console.log('⚠️ Backend products failed, using fallback');
      }
    }
    return await productsApi.getAll(params.page, params.limit, params.category_id);
  }

  async getProduct(id: string) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.getProduct(id);
      } catch (error) {
        console.log('⚠️ Backend product failed, using fallback');
      }
    }
    return await productsApi.getById(id);
  }

  async searchProducts(query: string, filters: any = {}) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.searchProducts(query, filters);
      } catch (error) {
        console.log('⚠️ Backend search failed, using fallback');
      }
    }
    return await productsApi.search(query, filters.category_id);
  }

  async getFeaturedProducts(limit: number = 12) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.getFeaturedProducts(limit);
      } catch (error) {
        console.log('⚠️ Backend featured products failed, using fallback');
      }
    }
    return await productsApi.getFeatured(limit);
  }

  async getEcoFriendlyProducts(limit: number = 12) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.getEcoFriendlyProducts(limit);
      } catch (error) {
        console.log('⚠️ Backend eco-friendly products failed, using fallback');
      }
    }
    return await productsApi.getEcoFriendly(limit);
  }

  // Categories API
  async getCategories() {
    if (this.isBackendConnected) {
      try {
        return await backendApi.getCategories();
      } catch (error) {
        console.log('⚠️ Backend categories failed, using fallback');
      }
    }
    return await categoriesApi.getAll();
  }

  // Cart API with backend integration
  async getCart() {
    if (this.isBackendConnected) {
      try {
        return await backendApi.getCart();
      } catch (error) {
        console.log('⚠️ Backend cart failed, using localStorage fallback');
      }
    }
    return { items: cartApi.getCart(), total_amount: 0 };
  }

  async addToCart(productId: string, quantity: number = 1, variantId?: string) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.addToCart(productId, quantity, variantId);
      } catch (error) {
        console.log('⚠️ Backend add to cart failed, using localStorage fallback');
      }
    }
    // Fallback to localStorage
    const product = await this.getProduct(productId);
    return cartApi.addToCart(product, quantity);
  }

  async updateCartItem(cartItemId: string, quantity: number) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.updateCartItem(cartItemId, quantity);
      } catch (error) {
        console.log('⚠️ Backend update cart item failed');
        throw error;
      }
    }
    // Fallback to localStorage
    return cartApi.updateQuantity(cartItemId, quantity);
  }

  async removeFromCart(cartItemId: string) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.removeFromCart(cartItemId);
      } catch (error) {
        console.log('⚠️ Backend remove from cart failed');
        throw error;
      }
    }
    // Fallback to localStorage
    return cartApi.removeFromCart(cartItemId);
  }

  // Orders API
  async getOrders(page: number = 1, limit: number = 10) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.getOrders(page, limit);
      } catch (error) {
        console.log('⚠️ Backend orders failed, using fallback');
      }
    }
    return await ordersApi.getByUserId('current_user');
  }

  async createOrder(orderData: any) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.createOrder(orderData);
      } catch (error) {
        console.log('⚠️ Backend create order failed');
        throw error;
      }
    }
    throw new Error('Order creation requires backend connection');
  }

  // Wishlist API
  async getWishlist() {
    if (this.isBackendConnected) {
      try {
        return await backendApi.getWishlist();
      } catch (error) {
        console.log('⚠️ Backend wishlist failed, using fallback');
      }
    }
    return await wishlistApi.getByUserId('current_user');
  }

  async addToWishlist(productId: string) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.addToWishlist(productId);
      } catch (error) {
        console.log('⚠️ Backend add to wishlist failed');
        throw error;
      }
    }
    return await wishlistApi.add('current_user', productId);
  }

  async removeFromWishlist(productId: string) {
    if (this.isBackendConnected) {
      try {
        return await backendApi.removeFromWishlist(productId);
      } catch (error) {
        console.log('⚠️ Backend remove from wishlist failed');
        throw error;
      }
    }
    return await wishlistApi.remove('current_user', productId);
  }

  // AI Service integration
  async sendAIMessage(message: string) {
    if (this.isAIConnected) {
      try {
        return await aiService.sendMessageWithAuth(message);
      } catch (error) {
        console.log('⚠️ AI service failed:', error);
        throw error;
      }
    }
    throw new Error('AI service not available');
  }

  async getAIRecommendations(type: 'trending' | 'personalized' | 'eco-friendly' = 'trending') {
    if (this.isAIConnected) {
      try {
        return await aiService.getRecommendations(type);
      } catch (error) {
        console.log('⚠️ AI recommendations failed:', error);
        throw error;
      }
    }
    throw new Error('AI service not available');
  }

  async searchProductsWithAI(query: string) {
    if (this.isAIConnected) {
      try {
        return await aiService.searchProducts(query);
      } catch (error) {
        console.log('⚠️ AI product search failed:', error);
        throw error;
      }
    }
    throw new Error('AI service not available');
  }

  // Product Verification Service
  async verifyProduct(imageFile: File, title: string) {
    if (this.isVerificationConnected) {
      try {
        return await productVerificationService.verifyProduct(imageFile, title);
      } catch (error) {
        console.log('⚠️ Product verification failed:', error);
        throw error;
      }
    }
    throw new Error('Product verification service not available');
  }

  async verifyProductBatch(imageFile: File, titles: string[]) {
    if (this.isVerificationConnected) {
      try {
        return await productVerificationService.verifyProductBatch(imageFile, titles);
      } catch (error) {
        console.log('⚠️ Batch product verification failed:', error);
        throw error;
      }
    }
    throw new Error('Product verification service not available');
  }

  // Health checks
  async checkAllServices() {
    const status = {
      backend: false,
      ai: false,
      verification: false,
    };

    try {
      await backendApi.healthCheck();
      status.backend = true;
    } catch (error) {
      console.log('Backend health check failed:', error);
    }

    try {
      await aiService.healthCheck();
      status.ai = true;
    } catch (error) {
      console.log('AI service health check failed:', error);
    }

    try {
      await productVerificationService.healthCheck();
      status.verification = true;
    } catch (error) {
      console.log('Product verification health check failed:', error);
    }

    return status;
  }
}

// Create singleton instance
export const enhancedApi = new EnhancedApiService();

// Export individual services for backward compatibility
export { backendApi, aiService, productVerificationService };
export { productsApi, categoriesApi, ordersApi, wishlistApi, cartApi };

export default enhancedApi;
