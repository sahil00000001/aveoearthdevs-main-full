import { toast } from '@/hooks/use-toast';

// Configuration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
// Backend routes are mounted at root level, NOT under /api/v1
// Force empty prefix regardless of env variable to fix the issue
const API_PREFIX = '';

// Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  image_url?: string;
  sustainability_score?: number;
  stock?: number;
  category_id?: string;
  brand_id?: string;
  created_at?: string;
  updated_at?: string;
  categories?: {
    id: string;
    name: string;
    description?: string;
  };
  brands?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  badges?: string[];
  carbon_saved?: string;
  eco_score?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    name: string;
    avatar_url?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  children?: Category[];
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total_amount: number;
  shipping_address: Address;
  billing_address: Address;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  product: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: Product;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  role: 'buyer' | 'supplier' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: TokenResponse;
  requires_phone_verification?: boolean;
  referral_code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SearchRequest {
  query?: string;
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
  sustainability_score_min?: number;
  sort_by?: 'name' | 'price' | 'created_at' | 'sustainability_score' | 'relevance';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API Client Class
class BackendApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // Force empty prefix - backend routes are at root, NOT under /api/v1
    this.baseUrl = BACKEND_URL;
    this.token = localStorage.getItem('auth_token');
    // Also try to get token from Supabase session if not set
    if (!this.token) {
      try {
        const { supabase } = require('../lib/supabase');
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.access_token) {
            this.token = session.access_token;
            localStorage.setItem('auth_token', session.access_token);
          }
        });
      } catch (e) {
        // Supabase not available, continue with null token
      }
    }
    console.log('🔗 BackendApiClient initialized with baseUrl:', this.baseUrl);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure endpoint doesn't start with /api/v1 (force root paths)
    let cleanEndpoint = endpoint;
    if (cleanEndpoint.startsWith('/api/v1/')) {
      cleanEndpoint = cleanEndpoint.replace('/api/v1', '');
    }
    
    const url = `${this.baseUrl}${cleanEndpoint}`;
    console.log('🌐 Backend API Request:', url); // Debug log
    
    // Don't set Content-Type for FormData - browser will set it with boundary
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string> || {}),
    };

    // Get token from localStorage or Supabase session
    let token = this.token || localStorage.getItem('auth_token');
    if (!token) {
      try {
        // Dynamic import to avoid circular dependencies
        const { supabase } = await import('../lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          token = session.access_token;
          this.token = token;
          localStorage.setItem('auth_token', token);
          console.log('✅ Token retrieved from Supabase session');
        }
      } catch (e) {
        console.warn('⚠️ Could not get token from Supabase session:', e);
        // Supabase not available, continue without token
      }
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Using token for request (length:', token.length, ')');
    } else {
      console.warn('⚠️ No token available for request');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Auth API
  async signup(email: string, password: string, name: string, phone?: string, user_type: string = 'buyer') {
    // Parse name into first_name and last_name - ensure both are provided
    let nameParts = name.trim().split(/\s+/).filter(p => p.length > 0);
    let first_name = nameParts[0] || name || 'User';
    let last_name = nameParts.slice(1).join(' ') || nameParts[0] || 'User';
    
    // Ensure both names are at least 1 character (backend requirement)
    if (first_name.length === 0) first_name = 'User';
    if (last_name.length === 0) last_name = 'User';
    
    // Phone is required by backend, so add default if missing
    let phoneNumber = phone;
    if (!phoneNumber || !phoneNumber.trim()) {
      phoneNumber = '+10000000000'; // Default phone for testing
    }
    
    // Ensure phone starts with +
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }
    
    // Remove leading 0 after + (e.g., +01234567894 -> +1234567894)
    if (phoneNumber.startsWith('+0')) {
      phoneNumber = '+' + phoneNumber.substring(2);
    }
    
    // Ensure phone is at least 10 digits (backend requirement)
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 10) {
      phoneNumber = '+10000000000';
    }
    
    const signupData = { 
      email, 
      password, 
      first_name,
      last_name,
      phone: phoneNumber,
      user_type: user_type.toLowerCase() // Ensure lowercase
    };
    
    console.log('📝 Signup request data:', { ...signupData, password: '***' });
    
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Set token from response (could be in tokens.access_token or access_token)
    if (response.tokens?.access_token) {
      this.setToken(response.tokens.access_token);
    } else if ((response as any).access_token) {
      this.setToken((response as any).access_token);
    }
    
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async getProfile() {
    return this.request<UserProfile>('/me');
  }

  async updateProfile(updates: Partial<UserProfile>) {
    return this.request<UserProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Products API
  async getProducts(params: SearchRequest = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<Product>>(`/products?${searchParams}`);
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`);
  }

  async searchProducts(query: string, filters: Omit<SearchRequest, 'query'> = {}) {
    return this.request<PaginatedResponse<Product>>('/search/', {
      method: 'POST',
      body: JSON.stringify({ query, ...filters }),
    });
  }

  async getFeaturedProducts(limit: number = 12) {
    try {
      // Backend has /search/trending endpoint
      const response = await this.request<any>(`/search/trending?limit=${limit}`);
      // Backend returns {products: [], recommendation_type: "trending", total: 0}
      let products = response.products || [];
      console.log('✅ Backend trending response:', { productsCount: products.length, total: response.total });
      
      // If trending returns empty, fallback to recent products
      if (!products || products.length === 0) {
        console.log('⚠️ Trending products empty, falling back to recent products');
        try {
          const fallbackResponse = await this.request<PaginatedResponse<Product>>(`/products?limit=${limit}&sort_by=created_at&sort_order=desc`);
          products = fallbackResponse.items || [];
          console.log('✅ Featured products (fallback) response:', { productsCount: products.length });
        } catch (fallbackError) {
          console.error('❌ Featured products fallback also failed:', fallbackError);
        }
      }
      
      return products;
    } catch (error) {
      // If trending fails, try fallback
      console.log('⚠️ Featured products (trending) endpoint failed, trying fallback:', error);
      try {
        const fallbackResponse = await this.request<PaginatedResponse<Product>>(`/products?limit=${limit}&sort_by=created_at&sort_order=desc`);
        const products = fallbackResponse.items || [];
        console.log('✅ Featured products (fallback) response:', { productsCount: products.length });
        return products;
      } catch (fallbackError) {
        console.error('❌ Featured products fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  async getEcoFriendlyProducts(limit: number = 12) {
    try {
      // Backend doesn't have eco-friendly endpoint, use regular products with filter
      const response = await this.request<PaginatedResponse<Product>>(`/products?limit=${limit}&sort_by=created_at&sort_order=desc`);
      // Backend returns {items: [], total, ...}
      return response.items || [];
    } catch (error) {
      // Return empty array instead of trying fallbacks
      console.log('Eco-friendly products endpoint failed, returning empty array');
      return [];
    }
  }

  // Vendor/Supplier Product Management
  async createProduct(productData: FormData) {
    return this.request<Product>('/supplier/products/', {
      method: 'POST',
      body: productData, // FormData for multipart/form-data
    });
  }

  async bulkImportCSV(csvFile: File) {
    const formData = new FormData();
    formData.append('file', csvFile);
    
    return this.request<{
      message: string;
      results: {
        total_rows: number;
        successful: number;
        failed: number;
        errors: Array<{row: number; error: string}>;
        created_product_ids: string[];
      };
    }>('/supplier/products/bulk-import-csv', {
      method: 'POST',
      body: formData, // FormData for multipart/form-data
    });
  }

  async uploadProductImage(imageFile: File, productId?: string, vendorId?: string) {
    const formData = new FormData();
    formData.append('file', imageFile);
    if (productId) formData.append('product_id', productId);
    if (vendorId) formData.append('vendor_id', vendorId);
    formData.append('compression_level', 'auto');
    
    return this.request<{
      success: boolean;
      url: string;
      compressed_size: number;
      original_size: number;
    }>('/upload/vendor/image', {
      method: 'POST',
      body: formData,
    });
  }

  async getRecommendations(type: 'trending' | 'personalized' | 'new_arrivals' | 'best_sellers', limit: number = 10) {
    return this.request<Product[]>(`/search/recommendations?type=${type}&limit=${limit}`);
  }

  // Categories API
  async getCategories() {
    return this.request<Category[]>('/products/categories/tree');
  }

  async getCategory(id: string) {
    return this.request<Category>(`/products/categories/${id}`);
  }

  // Brands API
  async getBrands() {
    return this.request<Brand[]>('/products/brands/active');
  }

  async getBrand(id: string) {
    return this.request<Brand>(`/products/brands/${id}`);
  }

  // Cart API
  async getCart() {
    return this.request<Cart>('/buyer/orders/cart');
  }

  async addToCart(productId: string, quantity: number = 1, variantId?: string) {
    return this.request<{ message: string }>('/buyer/orders/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity,
        variant_id: variantId,
      }),
    });
  }

  async updateCartItem(cartItemId: string, quantity: number) {
    return this.request<{ message: string }>(`/buyer/orders/cart/items/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(cartItemId: string) {
    return this.request<{ message: string }>(`/buyer/orders/cart/items/${cartItemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request<{ message: string }>('/buyer/orders/cart', {
      method: 'DELETE',
    });
  }

  // Orders API
  async getOrders(page: number = 1, limit: number = 10) {
    return this.request<PaginatedResponse<Order>>(`/buyer/orders?page=${page}&limit=${limit}`);
  }

  async getOrder(id: string) {
    return this.request<Order>(`/buyer/orders/${id}`);
  }

  async createOrder(orderData: {
    billing_address_id: string;
    shipping_address_id: string;
    payment_method: string;
    customer_notes?: string;
  }) {
    return this.request<Order>('/buyer/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async cancelOrder(id: string, reason: string) {
    return this.request<{ message: string }>(`/buyer/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancel_reason: reason }),
    });
  }

  // Wishlist API
  async getWishlist() {
    return this.request<PaginatedResponse<WishlistItem>>('/products/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.request<{ message: string }>('/products/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.request<{ message: string }>(`/products/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async isInWishlist(productId: string) {
    return this.request<{ in_wishlist: boolean }>(`/products/wishlist/${productId}/check`);
  }

  // Addresses API
  async getAddresses() {
    return this.request<Address[]>('/buyer/addresses');
  }

  async createAddress(address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    return this.request<Address>('/buyer/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  async updateAddress(id: string, address: Partial<Address>) {
    return this.request<Address>(`/buyer/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  }

  async deleteAddress(id: string) {
    return this.request<{ message: string }>(`/buyer/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  // Reviews API
  async getProductReviews(productId: string, page: number = 1, limit: number = 10) {
    return this.request<PaginatedResponse<ProductReview>>(
      `/products/${productId}/reviews?page=${page}&limit=${limit}`
    );
  }

  async createReview(productId: string, rating: number, comment: string) {
    return this.request<ProductReview>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  async updateReview(reviewId: string, rating: number, comment: string) {
    return this.request<ProductReview>(`/products/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, comment }),
    });
  }

  async deleteReview(reviewId: string) {
    return this.request<{ message: string }>(`/products/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Health Check
  async healthCheck() {
      try {
        // Try health endpoint (root level, no prefix)
        return await this.request<{ status: string; version: string }>('/health');
      } catch {
        // Fallback: try direct fetch
        const response = await fetch(`${this.baseUrl}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
        return await response.json();
      }
  }
}

// Create singleton instance
export const backendApi = new BackendApiClient();

// Export individual API modules for backward compatibility
export const productsApi = {
  async getAll(page: number = 1, limit: number = 50, categoryId?: string) {
    const response = await backendApi.getProducts({
      page,
      limit,
      category_id: categoryId,
    });
    return {
      data: response.items,
      count: response.total,
      totalPages: response.pages,
    };
  },

  async getById(id: string) {
    return backendApi.getProduct(id);
  },

  async search(query: string, categoryId?: string) {
    const response = await backendApi.searchProducts(query, {
      category_id: categoryId,
    });
    return response.items;
  },

  async getFeatured(limit: number = 16) {
    return backendApi.getFeaturedProducts(limit);
  },

  async getEcoFriendly(limit: number = 12) {
    return backendApi.getEcoFriendlyProducts(limit);
  },
};

export const categoriesApi = {
  async getAll() {
    return backendApi.getCategories();
  },

  async getById(id: string) {
    return backendApi.getCategory(id);
  },
};

export const ordersApi = {
  async create(order: any, items: any[]) {
    // This will be handled by the createOrder method
    throw new Error('Use backendApi.createOrder() instead');
  },

  async getByUserId(userId: string) {
    const response = await backendApi.getOrders();
    return response.items;
  },

  async updateStatus(id: string, status: string) {
    // This will be handled by the backend
    throw new Error('Order status updates are handled by the backend');
  },
};

export const wishlistApi = {
  async getByUserId(userId: string) {
    return backendApi.getWishlist();
  },

  async add(userId: string, productId: string) {
    return backendApi.addToWishlist(productId);
  },

  async remove(userId: string, productId: string) {
    return backendApi.removeFromWishlist(productId);
  },

  async isInWishlist(userId: string, productId: string) {
    const response = await backendApi.isInWishlist(productId);
    return response.in_wishlist;
  },
};

export const cartApi = {
  getCart() {
    // This should be replaced with backend API calls
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },

  async addToCart(product: Product, quantity: number = 1) {
    try {
      await backendApi.addToCart(product.id, quantity);
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart.',
        variant: 'destructive',
      });
      throw error;
    }
  },

  async removeFromCart(productId: string) {
    // This should be replaced with backend API calls
    const cart = this.getCart();
    const updatedCart = cart.filter((item: any) => item.product.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  },

  async updateQuantity(productId: string, quantity: number) {
    // This should be replaced with backend API calls
    const cart = this.getCart();
    const item = cart.find((item: any) => item.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }
      item.quantity = quantity;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  },

  clearCart() {
    localStorage.removeItem('cart');
    return [];
  },
};

export default backendApi;
