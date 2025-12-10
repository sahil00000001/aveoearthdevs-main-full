import { supabase } from '../lib/supabase'
import { Database } from '../lib/supabase'
import { backendApi } from './backendApi'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']

type OrderItem = Database['public']['Tables']['order_items']['Row']
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

type Review = Database['public']['Tables']['reviews']['Row']
type ReviewInsert = Database['public']['Tables']['reviews']['Insert']

type WishlistItem = Database['public']['Tables']['wishlist']['Row']
type WishlistItemInsert = Database['public']['Tables']['wishlist']['Insert']

// Products API
export const productsApi = {
  // Get all products with pagination - tries backend first, then Supabase
  async getAll(page: number = 1, limit: number = 50, categoryId?: string) {
    console.log('🔍 Fetching products...', { page, limit, categoryId });
    
    // Try backend API first
    try {
      const backendResponse = await backendApi.getProducts({
        page,
        limit,
        category_id: categoryId,
      });
      
      // Backend returns {items: [], total: N, page: N, limit: N, pages: N}
      const products = backendResponse.items || [];
      const total = backendResponse.total || 0;
      
      console.log('✅ Backend API response:', { productsCount: products.length, total });
      
      // Return even if empty - backend worked correctly
      return {
        data: products.map((p: any) => ({
          ...p,
          categories: p.categories || p.category || { name: 'Uncategorized' },
        })),
        count: total,
        totalPages: backendResponse.pages || Math.ceil(total / limit) || 1,
      };
    } catch (backendError) {
      console.log('⚠️ Backend API failed, trying Supabase...', backendError);
    }
    
    // Fallback to Supabase
    try {
      // Use REST API directly for better compatibility
      let url = `${supabaseUrl}/rest/v1/products?select=id,name,price,image_url,discount,sustainability_score,stock,category_id,brand,short_description,status,approval_status&status=eq.active&approval_status=eq.approved`;
      
      if (categoryId) {
        url += `&category_id=eq.${encodeURIComponent(categoryId)}`;
      }
      
      url += `&order=created_at.desc&offset=${(page - 1) * limit}&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Supabase query failed: ${response.status}`);
      }
      
      const data = await response.json();
      // Get count from Content-Range header
      const contentRange = response.headers.get('content-range');
      const count = contentRange ? parseInt(contentRange.split('/')[1]) : data.length;

      console.log('✅ Found', data.length, 'products from Supabase');
      return {
        data: data || [],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (supabaseError) {
      console.log('⚠️ Supabase failed:', supabaseError);
    }
    
    // Don't return mock data - return empty array instead
    console.log('⚠️ No products available from backend or Supabase');
    return {
      data: [],
      count: 0,
      totalPages: 0
    };
  },

  // NO MOCK PRODUCTS - All removed
  // Products should come from backend or Supabase only

  // Get single product - tries backend first, then Supabase
  async getById(id: string) {
    console.log('🔍 Fetching single product:', id);
    
    // Try backend API first
    try {
      const backendProduct = await backendApi.getProduct(id);
      if (backendProduct) {
        console.log('✅ Found product from backend API:', backendProduct.name);
        return {
          ...backendProduct,
          categories: backendProduct.categories || { name: 'Uncategorized' },
          badges: ['Eco-Friendly', 'Sustainable', 'Organic'],
        };
      }
    } catch (backendError) {
      console.log('⚠️ Backend product fetch failed, trying Supabase...', backendError);
    }
    
    // Fallback to Supabase
    try {
      const url = `${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=*`;
      
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Supabase query failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        const product = data[0];
        console.log('✅ Found product in Supabase:', product.name);
        return {
          ...product,
          discount: product.discount || 0,
          sustainability_score: product.sustainability_score || 85,
          stock: product.stock || 100,
          categories: product.categories || { name: 'Sustainable Living' },
          badges: ['Eco-Friendly', 'Sustainable', 'Organic']
        };
      }
      throw new Error('Product not found');
    } catch (supabaseError) {
      console.log('⚠️ Supabase product fetch failed:', supabaseError);
    }
    
    // Don't return mock product - throw error instead
    console.log('⚠️ Product not available from backend or Supabase');
    throw new Error(`Product ${id} not found`);
  },

  // Search products
  async search(query: string, categoryId?: string) {
    console.log('🔍 Searching products...', { query, categoryId });
    
    // Try backend first
    try {
      const response = await backendApi.searchProducts(query, { category_id: categoryId });
      const items = response?.items || [];
      if (items.length > 0) {
        console.log('✅ Search results from backend:', items.length);
        return items;
      }
    } catch (backendError) {
      console.log('⚠️ Backend search failed, trying Supabase...', backendError);
    }
    
    // Fallback to Supabase
    try {
      let url = `${supabaseUrl}/rest/v1/products?select=id,name,price,image_url,discount,sustainability_score,stock,category_id,brand,short_description,status,approval_status&status=eq.active&approval_status=eq.approved`;
      
      // Add search filter
      const searchTerm = encodeURIComponent(query);
      url += `&or=(name.ilike.*${searchTerm}*,description.ilike.*${searchTerm}*,short_description.ilike.*${searchTerm}*)`;
      
      if (categoryId) {
        url += `&category_id=eq.${encodeURIComponent(categoryId)}`;
      }
      
      url += `&order=created_at.desc&limit=50`;
      
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Supabase search failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Search results from Supabase:', data.length);
      return data || [];
    } catch (error) {
      console.error('❌ Search error:', error);
      return [];
    }
  },

  // Create product (admin only)
  async create(product: ProductInsert) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update product (admin only)
  async update(id: string, updates: ProductUpdate) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete product (admin only)
  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get featured products - tries backend first, then Supabase, then mock
  async getFeatured(limit: number = 16) {
    console.log('🔍 Fetching featured products...', limit);
    
    // Try backend API first
    try {
      const backendProducts = await backendApi.getFeaturedProducts(limit);
      // Backend returns array or {products: []}
      const products = Array.isArray(backendProducts) ? backendProducts : (backendProducts.products || []);
      
      console.log('✅ Backend featured products response:', { productsCount: products.length });
      
      // Return even if empty - backend worked correctly
      return products.map((p: any) => ({
        ...p,
        categories: p.categories || p.category || { name: 'Uncategorized' },
      }));
    } catch (backendError) {
      console.log('⚠️ Backend featured products failed, trying Supabase...', backendError);
    }
    
    // Fallback to Supabase
    try {
      let url = `${supabaseUrl}/rest/v1/products?select=id,name,price,image_url,discount,sustainability_score,stock,category_id,brand,short_description,status,approval_status&status=eq.active&approval_status=eq.approved&is_featured=eq.true&order=created_at.desc&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Supabase query failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Found', data.length, 'featured products from Supabase');
      return data;
    } catch (supabaseError) {
      console.log('⚠️ Supabase featured products failed:', supabaseError);
    }
    
    // Don't return mock data
    console.log('⚠️ No featured products available from backend or Supabase');
    return [];
  },

  // Get eco-friendly products (high sustainability score) - tries backend first, then Supabase
  async getEcoFriendly(limit: number = 12) {
    console.log('🌱 Fetching eco-friendly products...', limit);
    
    // Try backend API first
    try {
      const backendProducts = await backendApi.getEcoFriendlyProducts(limit);
      // Backend returns array or PaginatedResponse
      const products = Array.isArray(backendProducts) ? backendProducts : ((backendProducts as any)?.items || []);
      console.log('✅ Backend eco-friendly response:', { productsCount: products.length });
      
      // Return even if empty - backend worked correctly
      return products.map((p: any) => ({
        ...p,
        categories: p.categories || p.category || { name: 'Uncategorized' },
      }));
    } catch (backendError) {
      console.log('⚠️ Backend eco-friendly products failed, trying Supabase...', backendError);
    }
    
    // Fallback to Supabase
    try {
      let url = `${supabaseUrl}/rest/v1/products?select=id,name,price,image_url,discount,sustainability_score,stock,category_id,brand,short_description,status,approval_status&status=eq.active&approval_status=eq.approved&sustainability_score=gte.80&order=sustainability_score.desc&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Supabase query failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Found', data.length, 'eco-friendly products from Supabase');
      return data;
    } catch (supabaseError) {
      console.log('⚠️ Supabase eco-friendly products failed:', supabaseError);
    }
    
    // Don't return mock data
    console.log('⚠️ No eco-friendly products available from backend or Supabase');
    return [];
  }
}

// Categories API
export const categoriesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(category: CategoryInsert) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Orders API
export const ordersApi = {
  async create(order: OrderInsert, items: OrderItemInsert[]) {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = items.map(item => ({
      ...item,
      order_id: orderData.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return orderData
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, image_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async updateStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Reviews API
export const reviewsApi = {
  async getByProductId(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users(name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(review: ReviewInsert) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select(`
        *,
        users(name)
      `)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<ReviewInsert>) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        users(name)
      `)
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Wishlist API - Use backend API to bypass RLS permission issues
export const wishlistApi = {
  async getByUserId(userId: string) {
    try {
      console.log('🔄 Fetching wishlist for user:', userId)
      
      // Use backend API instead of direct Supabase to bypass RLS
      const { backendApi } = await import('./backendApi')
      const response = await backendApi.getWishlist()
      
      // Backend returns PaginatedResponse with items array
      const items = response?.items || (Array.isArray(response) ? response : [])
      console.log('✅ Wishlist fetched successfully:', items?.length || 0, 'items')
      return items
    } catch (error) {
      console.error('❌ Wishlist fetch failed:', error)
      // Fallback to empty array instead of throwing
      return []
    }
  },

  async add(userId: string, productId: string) {
    try {
      console.log('🔄 Adding to wishlist:', { userId, productId })
      
      // Use backend API instead of direct Supabase to bypass RLS
      const { backendApi } = await import('./backendApi')
      const result = await backendApi.addToWishlist(productId)
      
      console.log('✅ Added to wishlist successfully')
      return result
    } catch (error) {
      console.error('❌ Add to wishlist failed:', error)
      throw error
    }
  },

  async remove(userId: string, productId: string) {
    try {
      console.log('🔄 Removing from wishlist:', { userId, productId })
      
      // Use backend API instead of direct Supabase to bypass RLS
      const { backendApi } = await import('./backendApi')
      await backendApi.removeFromWishlist(productId)
      
      console.log('✅ Removed from wishlist successfully')
      return true
    } catch (error) {
      console.error('❌ Remove from wishlist failed:', error)
      throw error
    }
  },

  async isInWishlist(userId: string, productId: string) {
    try {
      console.log('🔄 Checking if in wishlist:', { userId, productId })
      
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking wishlist status:', error)
        throw error
      }
      
      const isInWishlist = !!data
      console.log('✅ Wishlist check result:', isInWishlist)
      return isInWishlist
    } catch (error) {
      console.error('❌ Wishlist check failed:', error)
      throw error
    }
  }
}

// Cart API (using localStorage for now, can be moved to database later)
export const cartApi = {
  getCart() {
    if (typeof window === 'undefined') return []
    const cart = localStorage.getItem('cart')
    return cart ? JSON.parse(cart) : []
  },

  addToCart(product: Product, quantity: number = 1) {
    const cart = this.getCart()
    const existingItem = cart.find((item: any) => item.product.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ product, quantity })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    return cart
  },

  removeFromCart(productId: string) {
    const cart = this.getCart()
    const updatedCart = cart.filter((item: any) => item.product.id !== productId)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    return updatedCart
  },

  updateQuantity(productId: string, quantity: number) {
    const cart = this.getCart()
    const item = cart.find((item: any) => item.product.id === productId)
    
    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId)
      }
      item.quantity = quantity
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    return cart
  },

  clearCart() {
    localStorage.removeItem('cart')
    return []
  }
}
