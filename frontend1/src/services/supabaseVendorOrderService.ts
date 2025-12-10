import { supabase } from '@/lib/supabase';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  vendor_id: string;
  created_at: string;
}

export interface OrderAddress {
  id: string;
  order_id: string;
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
  phone: string;
}

export interface VendorOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  payment_method: string;
  payment_reference?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  notes?: string;
  tracking_number?: string;
  shipping_carrier?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  return_reason?: string;
  return_notes?: string;
  items: OrderItem[];
  addresses: OrderAddress[];
  created_at: string;
  updated_at: string;
}

export interface OrderStats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  orders_this_week: number;
  revenue_this_week: number;
  orders_this_month: number;
  revenue_this_month: number;
}

class SupabaseVendorOrderService {
  async getOrders(vendorId: string, filters?: {
    status?: string;
    payment_status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: VendorOrder[]; total: number }> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          users(name, email, phone),
          order_items(
            id,
            product_id,
            variant_id,
            quantity,
            price,
            products(name, sku)
          ),
          order_addresses(
            id,
            type,
            first_name,
            last_name,
            company,
            address_line_1,
            address_line_2,
            city,
            state,
            postal_code,
            country,
            phone
          )
        `, { count: 'exact' })
        .eq('vendor_id', vendorId);

      if (filters?.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,users.name.ilike.%${filters.search}%,users.email.ilike.%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.payment_status && filters.payment_status !== 'all') {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex - 1);

      if (error) throw error;

      // Transform data to match VendorOrder interface
      const orders: VendorOrder[] = (data || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_id: order.customer_id,
        customer_name: order.users?.name || 'Unknown',
        customer_email: order.users?.email || '',
        customer_phone: order.users?.phone,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        payment_reference: order.payment_reference,
        subtotal: order.subtotal || 0,
        tax_amount: order.tax_amount || 0,
        shipping_amount: order.shipping_amount || 0,
        discount_amount: order.discount_amount || 0,
        total_amount: order.total_amount || 0,
        currency: order.currency || 'USD',
        notes: order.notes,
        tracking_number: order.tracking_number,
        shipping_carrier: order.shipping_carrier,
        estimated_delivery_date: order.estimated_delivery_date,
        actual_delivery_date: order.actual_delivery_date,
        return_reason: order.return_reason,
        return_notes: order.return_notes,
        items: (order.order_items || []).map(item => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.products?.name || 'Unknown Product',
          product_sku: item.products?.sku || '',
          quantity: item.quantity || 0,
          unit_price: item.price || 0,
          total_price: (item.price || 0) * (item.quantity || 0),
          vendor_id: vendorId,
          created_at: item.created_at
        })),
        addresses: (order.order_addresses || []).map(addr => ({
          id: addr.id,
          order_id: addr.order_id,
          type: addr.type,
          first_name: addr.first_name,
          last_name: addr.last_name,
          company: addr.company,
          address_line_1: addr.address_line_1,
          address_line_2: addr.address_line_2,
          city: addr.city,
          state: addr.state,
          postal_code: addr.postal_code,
          country: addr.country,
          phone: addr.phone
        })),
        created_at: order.created_at,
        updated_at: order.updated_at
      }));

      return {
        orders,
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      return { orders: [], total: 0 };
    }
  }

  async getOrder(orderId: string): Promise<VendorOrder | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users(name, email, phone),
          order_items(
            id,
            product_id,
            variant_id,
            quantity,
            price,
            products(name, sku)
          ),
          order_addresses(
            id,
            type,
            first_name,
            last_name,
            company,
            address_line_1,
            address_line_2,
            city,
            state,
            postal_code,
            country,
            phone
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Transform data to match VendorOrder interface
      return {
        id: data.id,
        order_number: data.order_number,
        customer_id: data.customer_id,
        customer_name: data.users?.name || 'Unknown',
        customer_email: data.users?.email || '',
        customer_phone: data.users?.phone,
        status: data.status,
        payment_status: data.payment_status,
        payment_method: data.payment_method,
        payment_reference: data.payment_reference,
        subtotal: data.subtotal || 0,
        tax_amount: data.tax_amount || 0,
        shipping_amount: data.shipping_amount || 0,
        discount_amount: data.discount_amount || 0,
        total_amount: data.total_amount || 0,
        currency: data.currency || 'USD',
        notes: data.notes,
        tracking_number: data.tracking_number,
        shipping_carrier: data.shipping_carrier,
        estimated_delivery_date: data.estimated_delivery_date,
        actual_delivery_date: data.actual_delivery_date,
        return_reason: data.return_reason,
        return_notes: data.return_notes,
        items: (data.order_items || []).map(item => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.products?.name || 'Unknown Product',
          product_sku: item.products?.sku || '',
          quantity: item.quantity || 0,
          unit_price: item.price || 0,
          total_price: (item.price || 0) * (item.quantity || 0),
          vendor_id: data.vendor_id,
          created_at: item.created_at
        })),
        addresses: (data.order_addresses || []).map(addr => ({
          id: addr.id,
          order_id: addr.order_id,
          type: addr.type,
          first_name: addr.first_name,
          last_name: addr.last_name,
          company: addr.company,
          address_line_1: addr.address_line_1,
          address_line_2: addr.address_line_2,
          city: addr.city,
          state: addr.state,
          postal_code: addr.postal_code,
          country: addr.country,
          phone: addr.phone
        })),
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  async updateTrackingInfo(orderId: string, trackingNumber: string, carrier: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          shipping_carrier: carrier,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating tracking info:', error);
      return false;
    }
  }

  async getOrderStats(vendorId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<OrderStats> {
    try {
      // Calculate date range based on period
      const now = new Date();
      let dateFrom: string;
      
      switch (period) {
        case 'week':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'month':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'year':
          dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Fetch all orders for the vendor
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('vendor_id', vendorId)
        .gte('created_at', dateFrom);

      if (error) throw error;

      const ordersList = orders || [];
      
      // Calculate stats
      const total_orders = ordersList.length;
      const total_revenue = ordersList.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      const pending_orders = ordersList.filter(o => o.status === 'pending').length;
      const processing_orders = ordersList.filter(o => o.status === 'processing').length;
      const shipped_orders = ordersList.filter(o => o.status === 'shipped').length;
      const delivered_orders = ordersList.filter(o => o.status === 'delivered').length;
      const cancelled_orders = ordersList.filter(o => o.status === 'cancelled').length;

      // Calculate this week stats
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const orders_this_week = ordersList.filter(o => new Date(o.created_at) >= weekStart).length;
      const revenue_this_week = ordersList
        .filter(o => new Date(o.created_at) >= weekStart)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // Calculate this month stats
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const orders_this_month = ordersList.filter(o => new Date(o.created_at) >= monthStart).length;
      const revenue_this_month = ordersList
        .filter(o => new Date(o.created_at) >= monthStart)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      return {
        total_orders,
        total_revenue,
        pending_orders,
        processing_orders,
        shipped_orders,
        delivered_orders,
        cancelled_orders,
        orders_this_week,
        revenue_this_week,
        orders_this_month,
        revenue_this_month
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        total_orders: 0,
        total_revenue: 0,
        pending_orders: 0,
        processing_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0,
        orders_this_week: 0,
        revenue_this_week: 0,
        orders_this_month: 0,
        revenue_this_month: 0
      };
    }
  }

  async cancelOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          return_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    }
  }

  async processRefund(orderId: string, amount: number, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'refunded',
          return_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }
}

export const supabaseVendorOrderService = new SupabaseVendorOrderService();
export default supabaseVendorOrderService;
