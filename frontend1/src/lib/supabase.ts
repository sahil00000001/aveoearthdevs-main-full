import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Debug Supabase connection (only in development)
if (import.meta.env.DEV) {
  console.log('🔗 Supabase connection:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length
  });
}

// Only show error in development, not in production
if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn('⚠️ Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'aveo-earth-app'
    }
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'buyer' | 'supplier'
          phone?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          alternate_address?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: 'admin' | 'buyer' | 'supplier'
          phone?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          alternate_address?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'buyer' | 'supplier'
          phone?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          alternate_address?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          discount: number
          category_id: string
          stock: number
          image_url: string
          sustainability_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          discount?: number
          category_id: string
          stock: number
          image_url: string
          sustainability_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          discount?: number
          category_id?: string
          stock?: number
          image_url?: string
          sustainability_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          comment?: string
          created_at?: string
        }
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      inventory_log: {
        Row: {
          id: string
          product_id: string
          change: number
          reason: string
          timestamp: string
        }
        Insert: {
          id?: string
          product_id: string
          change: number
          reason: string
          timestamp?: string
        }
        Update: {
          id?: string
          product_id?: string
          change?: number
          reason?: string
          timestamp?: string
        }
      }
      sustainability_metrics: {
        Row: {
          id: string
          product_id: string
          carbon_footprint: number
          materials_used: string[]
          certifications: string[]
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          carbon_footprint: number
          materials_used: string[]
          certifications: string[]
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          carbon_footprint?: number
          materials_used?: string[]
          certifications?: string[]
          created_at?: string
        }
      }
    }
  }
}
