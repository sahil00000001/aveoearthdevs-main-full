// Mock vendor services that work without Supabase
import { mockVendorProfile, mockProducts, mockOrders, mockOrderStats, mockCategories } from '@/lib/mockData';

// Mock vendor profile service
export const mockVendorProfileService = {
  async getProfile(userId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockVendorProfile;
  },

  async createProfile(profile: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockVendorProfile, ...profile };
  },

  async updateProfile(userId: string, updates: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockVendorProfile, ...updates };
  },

  async uploadProfileImage(userId: string, file: File) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
  },

  async uploadBusinessLogo(userId: string, file: File) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop';
  },

  async uploadDocument(userId: string, file: File, documentType: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `https://example.com/documents/${documentType}-${Date.now()}.pdf`;
  }
};

// Mock vendor product service
export const mockVendorProductService = {
  async getProducts(vendorId: string, filters?: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredProducts = [...mockProducts];
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters?.status) {
      if (filters.status === 'active') {
        filteredProducts = filteredProducts.filter(p => p.is_active);
      } else if (filters.status === 'inactive') {
        filteredProducts = filteredProducts.filter(p => !p.is_active);
      }
    }
    
    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category_id === filters.category);
    }
    
    const total = filteredProducts.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      products: filteredProducts.slice(startIndex, endIndex),
      total
    };
  },

  async getProduct(productId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.find(p => p.id === productId) || null;
  },

  async createProduct(product: any) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      vendor_id: 'mock-vendor-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockProducts.unshift(newProduct);
    return newProduct;
  },

  async updateProduct(productId: string, updates: any) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...updates, updated_at: new Date().toISOString() };
      return mockProducts[index];
    }
    return null;
  },

  async deleteProduct(productId: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return true;
    }
    return false;
  },

  async uploadProductImage(productId: string, file: File, imageIndex: number) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `https://images.unsplash.com/photo-${1500000000000 + Math.random() * 1000000000}?w=400&h=400&fit=crop`;
  },

  async getCategories() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCategories;
  },

  async updateStock(productId: string, quantity: number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      product.stock_quantity = quantity;
      product.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  async toggleProductStatus(productId: string, isActive: boolean) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      product.is_active = isActive;
      product.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }
};

// Mock vendor order service
export const mockVendorOrderService = {
  async getOrders(vendorId: string, filters?: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredOrders = [...mockOrders];
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm) ||
        order.customer_name.toLowerCase().includes(searchTerm) ||
        order.customer_email.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters?.status) {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status);
    }
    
    if (filters?.payment_status) {
      filteredOrders = filteredOrders.filter(order => order.payment_status === filters.payment_status);
    }
    
    const total = filteredOrders.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      orders: filteredOrders.slice(startIndex, endIndex),
      total
    };
  },

  async getOrder(orderId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.find(o => o.id === orderId) || null;
  },

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = status as any;
      order.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  async updateTrackingInfo(orderId: string, trackingNumber: string, carrier: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.tracking_number = trackingNumber;
      order.shipping_carrier = carrier;
      order.status = 'shipped';
      order.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  async getOrderStats(vendorId: string, period?: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrderStats;
  },

  async cancelOrder(orderId: string, reason: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = 'cancelled';
      order.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  async processRefund(orderId: string, amount: number, reason: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.payment_status = 'refunded';
      order.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }
};

// Mock vendor onboarding service
export const mockVendorOnboardingService = {
  async saveBusinessProfile(data: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Store in localStorage for persistence during onboarding
    const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    const updatedData = { ...existingData, businessProfile: data };
    localStorage.setItem('onboardingData', JSON.stringify(updatedData));
    return { success: true, message: 'Business profile saved successfully!' };
  },

  async createProduct(data: any) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const product = {
      ...data,
      id: `prod-${Date.now()}`,
      vendor_id: 'mock-vendor-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store in localStorage
    const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    const updatedData = { ...existingData, product };
    localStorage.setItem('onboardingData', JSON.stringify(updatedData));
    
    return { success: true, product, message: 'Product created successfully!' };
  },

  async createVariants(productId: string, variants: any[]) {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Store variants in localStorage
    const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    const updatedData = { ...existingData, variants: { productId, variants } };
    localStorage.setItem('onboardingData', JSON.stringify(updatedData));
    
    return { success: true, message: 'Product variants created successfully!' };
  },

  async saveSustainabilityProfile(data: any) {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Store in localStorage
    const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    const updatedData = { ...existingData, sustainability: data };
    localStorage.setItem('onboardingData', JSON.stringify(updatedData));
    
    return { success: true, message: 'Sustainability profile saved successfully!' };
  },

  async completeOnboarding(formData: any) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Mock onboarding completed with data:', formData);
    // Clear onboarding data from localStorage
    localStorage.removeItem('onboardingData');
    return { success: true, message: 'Onboarding completed successfully!' };
  },

  async getOnboardingData() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return JSON.parse(localStorage.getItem('onboardingData') || '{}');
  }
};
