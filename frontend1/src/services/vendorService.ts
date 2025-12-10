// Vendor service for managing vendor-related operations
interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface VendorProduct {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  weight: number;
  dimensions: string;
  materials: string;
  care_instructions: string;
  sustainability_notes: string;
  tags: string[];
  vendor_id: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
}

interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

class VendorService {
  private baseUrl = '/api/vendor';

  async getVendorProfile(): Promise<Vendor> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendor profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      // Return mock data for development
      return {
        id: 'vendor-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        businessName: 'Eco Products Co.',
        businessType: 'Manufacturer',
        address: {
          street: '123 Green Street',
          city: 'Eco City',
          state: 'EC',
          zipCode: '12345',
          country: 'USA'
        },
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async updateVendorProfile(vendor: Partial<Vendor>): Promise<Vendor> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendor),
      });
      if (!response.ok) {
        throw new Error('Failed to update vendor profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      throw error;
    }
  }

  async getVendorStats(): Promise<VendorStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendor stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      // Return empty data when service unavailable
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingProducts: 0,
        approvedProducts: 0,
        rejectedProducts: 0,
        lowStockItems: 0,
        outOfStockItems: 0
      };
    }
  }

  async getVendorProducts(): Promise<VendorProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendor products');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      // Return mock data for development
      return [
        {
          id: 'product-1',
          name: 'Bamboo Toothbrush Set',
          description: 'Eco-friendly bamboo toothbrushes with biodegradable bristles',
          short_description: 'Bamboo toothbrush set',
          price: 15.99,
          stock_quantity: 100,
          category_id: 'personal-care',
          is_active: true,
          is_featured: true,
          weight: 0.1,
          dimensions: '20cm x 2cm',
          materials: 'Bamboo, Nylon bristles',
          care_instructions: 'Rinse after use, air dry',
          sustainability_notes: '100% biodegradable handle',
          tags: ['bamboo', 'biodegradable', 'personal-care'],
          vendor_id: 'vendor-1',
          images: ['/api/placeholder/300/300'],
          status: 'approved',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'product-2',
          name: 'Organic Cotton Tote Bag',
          description: 'GOTS certified organic cotton shopping tote',
          short_description: 'Organic cotton tote',
          price: 12.50,
          stock_quantity: 50,
          category_id: 'accessories',
          is_active: true,
          is_featured: false,
          weight: 0.2,
          dimensions: '40cm x 35cm',
          materials: '100% Organic Cotton',
          care_instructions: 'Machine wash cold',
          sustainability_notes: 'GOTS certified organic cotton',
          tags: ['organic', 'cotton', 'reusable'],
          vendor_id: 'vendor-1',
          images: ['/api/placeholder/300/300'],
          status: 'approved',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
    }
  }

  async createProduct(product: Partial<VendorProduct>): Promise<VendorProduct> {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, product: Partial<VendorProduct>): Promise<VendorProduct> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async getVendorOrders(): Promise<VendorOrder[]> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendor orders');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      // Return mock data for development
      return [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          items: [
            {
              productId: 'product-1',
              productName: 'Bamboo Toothbrush Set',
              quantity: 2,
              price: 15.99
            }
          ],
          totalAmount: 31.98,
          status: 'processing',
          shippingAddress: {
            street: '456 Customer St',
            city: 'Customer City',
            state: 'CC',
            zipCode: '54321',
            country: 'USA'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
  }

  async updateOrderStatus(orderId: string, status: VendorOrder['status']): Promise<VendorOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getVendorAnalytics(timeRange: string = '30d'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendor analytics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor analytics:', error);
      // Return empty data when service unavailable
      return {
        revenue: [],
        orders: [],
        topProducts: []
      };
    }
  }
}

export const vendorService = new VendorService();
export default vendorService;


