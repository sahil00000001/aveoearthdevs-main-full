import { supabase } from '@/lib/supabase';

export interface VendorProduct {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock_quantity: number;
  weight: number;
  dimensions?: string;
  materials?: string[];
  care_instructions?: string;
  sustainability_notes?: string;
  tags: string[];
  category_id: string;
  brand?: string;
  sku?: string;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  requires_shipping: boolean;
  taxable: boolean;
  tax_rate: number;
  sustainability_rating: number;
  eco_friendly_features: string[];
  certifications: string[];
  packaging_type?: string;
  return_policy_days: number;
  warranty_period_days: number;
  handling_time_days: number;
  variants: any[];
  supplier_id: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approval_status: 'pending' | 'approved' | 'rejected';
  visibility: 'visible' | 'hidden';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
}

class SupabaseVendorService {
  async getProducts(vendorId: string, filters?: {
    category?: string;
    status?: 'active' | 'inactive' | 'draft';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: VendorProduct[]; total: number }> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          product_images(image_url, alt_text, is_primary),
          product_inventory(quantity)
        `, { count: 'exact' })
        .eq('supplier_id', vendorId);

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.status) {
        if (filters.status === 'active') {
          query = query.eq('status', 'active');
        } else if (filters.status === 'inactive') {
          query = query.eq('status', 'inactive');
        } else if (filters.status === 'draft') {
          query = query.eq('status', 'draft');
        }
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex - 1);

      if (error) throw error;

      // Transform data to match VendorProduct interface
      const products: VendorProduct[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price || 0,
        compare_price: product.compare_at_price,
        cost_price: product.cost_price || 0,
        stock_quantity: product.product_inventory?.[0]?.quantity || 0,
        min_stock_quantity: product.min_stock_quantity || 0,
        weight: product.weight || 0,
        dimensions: product.dimensions,
        materials: product.materials || [],
        care_instructions: product.care_instructions,
        sustainability_notes: product.sustainability_notes,
        tags: product.tags || [],
        category_id: product.category_id,
        brand: product.brand,
        sku: product.sku,
        images: product.product_images?.map(img => img.image_url) || [],
        is_active: product.status === 'active',
        is_featured: product.is_featured || false,
        is_digital: product.is_digital || false,
        requires_shipping: product.requires_shipping !== false,
        taxable: product.taxable !== false,
        tax_rate: product.tax_rate || 0,
        sustainability_rating: product.sustainability_rating || 0,
        eco_friendly_features: product.eco_friendly_features || [],
        certifications: product.certifications || [],
        packaging_type: product.packaging_type,
        return_policy_days: product.return_policy_days || 30,
        warranty_period_days: product.warranty_period_days || 0,
        handling_time_days: product.handling_time_days || 1,
        variants: product.variants || [],
        supplier_id: product.supplier_id,
        status: product.status,
        approval_status: product.approval_status,
        visibility: product.visibility,
        published_at: product.published_at,
        created_at: product.created_at,
        updated_at: product.updated_at
      }));

      return {
        products,
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      return { products: [], total: 0 };
    }
  }

  async getProduct(productId: string): Promise<VendorProduct | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          product_images(image_url, alt_text, is_primary),
          product_inventory(quantity)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Transform data to match VendorProduct interface
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        short_description: data.short_description || '',
        price: data.price || 0,
        compare_price: data.compare_at_price,
        cost_price: data.cost_price || 0,
        stock_quantity: data.product_inventory?.[0]?.quantity || 0,
        min_stock_quantity: data.min_stock_quantity || 0,
        weight: data.weight || 0,
        dimensions: data.dimensions,
        materials: data.materials || [],
        care_instructions: data.care_instructions,
        sustainability_notes: data.sustainability_notes,
        tags: data.tags || [],
        category_id: data.category_id,
        brand: data.brand,
        sku: data.sku,
        images: data.product_images?.map(img => img.image_url) || [],
        is_active: data.status === 'active',
        is_featured: data.is_featured || false,
        is_digital: data.is_digital || false,
        requires_shipping: data.requires_shipping !== false,
        taxable: data.taxable !== false,
        tax_rate: data.tax_rate || 0,
        sustainability_rating: data.sustainability_rating || 0,
        eco_friendly_features: data.eco_friendly_features || [],
        certifications: data.certifications || [],
        packaging_type: data.packaging_type,
        return_policy_days: data.return_policy_days || 30,
        warranty_period_days: data.warranty_period_days || 0,
        handling_time_days: data.handling_time_days || 1,
        variants: data.variants || [],
        supplier_id: data.supplier_id,
        status: data.status,
        approval_status: data.approval_status,
        visibility: data.visibility,
        published_at: data.published_at,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async createProduct(product: Partial<VendorProduct>): Promise<VendorProduct | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          short_description: product.short_description,
          price: product.price,
          compare_at_price: product.compare_price,
          cost_price: product.cost_price,
          weight: product.weight,
          dimensions: product.dimensions,
          materials: product.materials,
          care_instructions: product.care_instructions,
          sustainability_notes: product.sustainability_notes,
          tags: product.tags,
          category_id: product.category_id,
          brand: product.brand,
          sku: product.sku,
          is_featured: product.is_featured,
          is_digital: product.is_digital,
          requires_shipping: product.requires_shipping,
          taxable: product.taxable,
          tax_rate: product.tax_rate,
          sustainability_rating: product.sustainability_rating,
          eco_friendly_features: product.eco_friendly_features,
          certifications: product.certifications,
          packaging_type: product.packaging_type,
          return_policy_days: product.return_policy_days,
          warranty_period_days: product.warranty_period_days,
          handling_time_days: product.handling_time_days,
          variants: product.variants,
          supplier_id: product.supplier_id,
          status: product.status || 'draft',
          approval_status: 'pending',
          visibility: 'hidden'
        })
        .select()
        .single();

      if (error) throw error;

      // Create inventory record
      if (data) {
        await supabase
          .from('product_inventory')
          .insert({
            product_id: data.id,
            quantity: product.stock_quantity || 0,
            min_quantity: product.min_stock_quantity || 0
          });
      }

      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  async updateProduct(productId: string, updates: Partial<VendorProduct>): Promise<VendorProduct | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          description: updates.description,
          short_description: updates.short_description,
          price: updates.price,
          compare_at_price: updates.compare_price,
          cost_price: updates.cost_price,
          weight: updates.weight,
          dimensions: updates.dimensions,
          materials: updates.materials,
          care_instructions: updates.care_instructions,
          sustainability_notes: updates.sustainability_notes,
          tags: updates.tags,
          category_id: updates.category_id,
          brand: updates.brand,
          sku: updates.sku,
          is_featured: updates.is_featured,
          is_digital: updates.is_digital,
          requires_shipping: updates.requires_shipping,
          taxable: updates.taxable,
          tax_rate: updates.tax_rate,
          sustainability_rating: updates.sustainability_rating,
          eco_friendly_features: updates.eco_friendly_features,
          certifications: updates.certifications,
          packaging_type: updates.packaging_type,
          return_policy_days: updates.return_policy_days,
          warranty_period_days: updates.warranty_period_days,
          handling_time_days: updates.handling_time_days,
          variants: updates.variants,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      // Update inventory if stock quantity changed
      if (updates.stock_quantity !== undefined && data) {
        await supabase
          .from('product_inventory')
          .update({
            quantity: updates.stock_quantity,
            min_quantity: updates.min_stock_quantity || 0
          })
          .eq('product_id', productId);
      }

      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      // Delete related records first
      await supabase.from('product_inventory').delete().eq('product_id', productId);
      await supabase.from('product_images').delete().eq('product_id', productId);
      await supabase.from('product_sustainability_scores').delete().eq('product_id', productId);

      // Delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async getCategories(): Promise<ProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async updateStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('product_inventory')
        .update({ quantity })
        .eq('product_id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      return false;
    }
  }

  async toggleProductStatus(productId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          status: isActive ? 'active' : 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error toggling product status:', error);
      return false;
    }
  }
}

export const supabaseVendorService = new SupabaseVendorService();
export default supabaseVendorService;
