/**
 * Vendor Concierge Service - AI-powered vendor management and optimization
 */

export interface VendorAnalytics {
  total_products: number;
  active_products: number;
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  low_stock_count: number;
  pending_orders: number;
}

export interface VendorRecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  action: string;
}

export interface VendorActionItem {
  type: 'urgent' | 'important' | 'strategic';
  title: string;
  description: string;
  estimated_time: string;
}

export interface VendorInsights {
  performance: VendorAnalytics;
  insights: string[];
  recommendations: VendorRecommendation[];
  action_items: VendorActionItem[];
  sustainability: {
    current_score: number;
    improvements: string[];
    certifications_needed: string[];
    impact_metrics: {
      carbon_footprint_reduced: number;
      waste_diverted: number;
      trees_planted: number;
    };
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  function_calls?: any[];
}

class VendorConciergeService {
  private baseUrl = 'http://localhost:8002';
  private backendUrl = 'http://localhost:8000';

  async sendMessage(message: string, vendorId: string, sessionId: string = 'vendor-concierge'): Promise<{
    response: string;
    function_calls?: any[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          user_token: vendorId,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to send message to vendor concierge:', error);
      throw error;
    }
  }

  async getVendorAnalytics(vendorId: string, days: number = 30): Promise<VendorAnalytics> {
    try {
      const response = await fetch(`${this.backendUrl}/supplier/products/analytics/overview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vendorId}`,
          'Content-Type': 'application/json',
        },
        params: new URLSearchParams({ days: days.toString() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get vendor analytics:', error);
      // Return mock data for development
      return {
        total_products: 25,
        active_products: 20,
        total_revenue: 125000,
        total_orders: 45,
        avg_order_value: 2778,
        low_stock_count: 3,
        pending_orders: 2
      };
    }
  }

  async getVendorProducts(vendorId: string, status: string = 'all'): Promise<any[]> {
    try {
      const response = await fetch(`${this.backendUrl}/supplier/products/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vendorId}`,
          'Content-Type': 'application/json',
        },
        params: new URLSearchParams({ 
          status,
          limit: '100'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Failed to get vendor products:', error);
      return [];
    }
  }

  async getVendorOrders(vendorId: string, days: number = 30): Promise<any[]> {
    try {
      const response = await fetch(`${this.backendUrl}/supplier/orders/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vendorId}`,
          'Content-Type': 'application/json',
        },
        params: new URLSearchParams({ 
          limit: '50'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Failed to get vendor orders:', error);
      return [];
    }
  }

  async getLowStockProducts(vendorId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.backendUrl}/supplier/products/inventory/low-stock`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vendorId}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.low_stock_products || [];
    } catch (error) {
      console.error('Failed to get low stock products:', error);
      return [];
    }
  }

  async getDailyInsights(vendorId: string): Promise<VendorInsights> {
    try {
      const message = "Get my daily insights and performance overview";
      const response = await this.sendMessage(message, vendorId);
      
      if (response.function_calls && response.function_calls.length > 0) {
        const insightsData = response.function_calls[0].result;
        if (insightsData.daily_insights) {
          return insightsData.daily_insights;
        }
      }

      // Return mock data if no insights available
      return this.getMockInsights();
    } catch (error) {
      console.error('Failed to get daily insights:', error);
      return this.getMockInsights();
    }
  }

  async getBusinessRecommendations(vendorId: string): Promise<VendorRecommendation[]> {
    try {
      const message = "Give me AI-powered business recommendations for growth";
      const response = await this.sendMessage(message, vendorId);
      
      if (response.function_calls && response.function_calls.length > 0) {
        const recData = response.function_calls[0].result;
        if (recData.recommendations) {
          return recData.recommendations;
        }
      }

      // Return mock recommendations
      return this.getMockRecommendations();
    } catch (error) {
      console.error('Failed to get business recommendations:', error);
      return this.getMockRecommendations();
    }
  }

  async getPerformanceAnalysis(vendorId: string): Promise<any> {
    try {
      const message = "Analyze my overall business performance";
      const response = await this.sendMessage(message, vendorId);
      
      if (response.function_calls && response.function_calls.length > 0) {
        const perfData = response.function_calls[0].result;
        if (perfData.performance) {
          return perfData.performance;
        }
      }

      // Return mock performance data
      return this.getMockPerformance();
    } catch (error) {
      console.error('Failed to get performance analysis:', error);
      return this.getMockPerformance();
    }
  }

  private getMockInsights(): VendorInsights {
    return {
      performance: {
        total_products: 25,
        active_products: 20,
        total_revenue: 125000,
        total_orders: 45,
        avg_order_value: 2778,
        low_stock_count: 3,
        pending_orders: 2
      },
      insights: [
        "Your revenue has increased by 15% this month",
        "3 products are running low on stock",
        "You have 2 orders pending fulfillment"
      ],
      recommendations: this.getMockRecommendations(),
      action_items: [
        {
          type: 'urgent',
          title: 'Process Pending Orders',
          description: 'You have 2 orders waiting for fulfillment',
          estimated_time: '30 minutes'
        },
        {
          type: 'important',
          title: 'Restock Low Inventory',
          description: '3 products need restocking to avoid stockouts',
          estimated_time: '1 hour'
        },
        {
          type: 'strategic',
          title: 'Increase Average Order Value',
          description: 'Bundle related products or offer discounts for larger orders',
          estimated_time: '2-3 hours'
        }
      ],
      sustainability: {
        current_score: 7.5,
        improvements: [
          'Add more eco-friendly packaging options',
          'Obtain sustainability certifications',
          'Implement carbon offset programs'
        ],
        certifications_needed: [
          'FSC Certification for paper products',
          'GOTS Certification for organic textiles'
        ],
        impact_metrics: {
          carbon_footprint_reduced: 1250,
          waste_diverted: 890,
          trees_planted: 45
        }
      }
    };
  }

  private getMockRecommendations(): VendorRecommendation[] {
    return [
      {
        category: 'Revenue Optimization',
        title: 'Increase Average Order Value',
        description: 'Bundle related products or offer discounts for larger orders',
        priority: 'high',
        impact: 'Increase revenue by 15-25%',
        action: 'Create product bundles and implement upselling strategies'
      },
      {
        category: 'Inventory Management',
        title: 'Optimize Stock Levels',
        description: 'Several products are running low on stock',
        priority: 'high',
        impact: 'Prevent stockouts and lost sales',
        action: 'Restock low inventory items and implement automated reorder alerts'
      },
      {
        category: 'Marketing & Growth',
        title: 'Boost Product Visibility',
        description: 'Low order volume suggests need for better marketing',
        priority: 'medium',
        impact: 'Increase brand awareness and customer acquisition',
        action: 'Implement SEO optimization, social media marketing, and promotional campaigns'
      }
    ];
  }

  private getMockPerformance(): any {
    return {
      metrics: {
        total_products: 25,
        active_products: 20,
        total_revenue: 125000,
        total_orders: 45,
        avg_order_value: 2778,
        low_stock_count: 3,
        pending_orders: 2
      },
      insights: [
        'Low product activation rate - consider reviewing inactive products',
        'Revenue below growth threshold',
        '3 products are low in stock',
        '2 orders pending fulfillment'
      ],
      recommendations: this.getMockRecommendations()
    };
  }
}

export const vendorConciergeService = new VendorConciergeService();
