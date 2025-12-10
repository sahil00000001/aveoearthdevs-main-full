import { supabase } from '@/lib/supabase';
import { mockVendorOrderService } from './mockVendorServices';
import { supabaseVendorOrderService } from './supabaseVendorOrderService';

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
  type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
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
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
  orders_this_month: number;
  revenue_this_month: number;
}

export const vendorOrderService = {
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
      return await supabaseVendorOrderService.getOrders(vendorId, filters);
    } catch (error) {
      console.error('Error fetching orders from Supabase, falling back to mock:', error);
      return await mockVendorOrderService.getOrders(vendorId, filters);
    }
  },

  async getOrder(orderId: string): Promise<VendorOrder | null> {
    try {
      return await supabaseVendorOrderService.getOrder(orderId);
    } catch (error) {
      console.error('Error fetching order from Supabase, falling back to mock:', error);
      return await mockVendorOrderService.getOrder(orderId);
    }
  },

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<boolean> {
    try {
      return await supabaseVendorOrderService.updateOrderStatus(orderId, status, notes);
    } catch (error) {
      console.error('Error updating order status in Supabase, falling back to mock:', error);
      return await mockVendorOrderService.updateOrderStatus(orderId, status, notes);
    }
  },

  async updateTrackingInfo(orderId: string, trackingNumber: string, carrier: string): Promise<boolean> {
    try {
      return await supabaseVendorOrderService.updateTrackingInfo(orderId, trackingNumber, carrier);
    } catch (error) {
      console.error('Error updating tracking info in Supabase, falling back to mock:', error);
      return await mockVendorOrderService.updateTrackingInfo(orderId, trackingNumber, carrier);
    }
  },

  async getOrderStats(vendorId: string, period?: 'week' | 'month' | 'year'): Promise<OrderStats> {
    try {
      return await supabaseVendorOrderService.getOrderStats(vendorId, period);
    } catch (error) {
      console.error('Error fetching order stats from Supabase, falling back to mock:', error);
      return await mockVendorOrderService.getOrderStats(vendorId, period);
    }
  },

  async cancelOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      return await supabaseVendorOrderService.cancelOrder(orderId, reason);
    } catch (error) {
      console.error('Error cancelling order in Supabase, falling back to mock:', error);
      return await mockVendorOrderService.cancelOrder(orderId, reason);
    }
  },

  async processRefund(orderId: string, amount: number, reason: string): Promise<boolean> {
    try {
      return await supabaseVendorOrderService.processRefund(orderId, amount, reason);
    } catch (error) {
      console.error('Error processing refund in Supabase, falling back to mock:', error);
      return await mockVendorOrderService.processRefund(orderId, amount, reason);
    }
  }
};
