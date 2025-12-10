import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vendorConciergeService, VendorInsights, VendorRecommendation } from '@/services/vendorConciergeService';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  Leaf,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const VendorAnalyticsDashboard = () => {
  const [insights, setInsights] = useState<VendorInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { vendor, isAuthenticated } = useVendorAuth();

  useEffect(() => {
    if (isAuthenticated() && vendor?.id) {
      loadInsights();
    }
  }, [isAuthenticated, vendor]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await vendorConciergeService.getDailyInsights(vendor?.id || 'mock-vendor-id');
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      case 'strategic': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
        <p className="text-gray-600 mb-4">Unable to load vendor analytics at this time</p>
        <Button onClick={loadInsights} className="bg-green-600 hover:bg-green-700">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">
                  ₹{insights.performance.total_revenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {insights.performance.revenue_growth || 0}% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">
                  {insights.performance.total_orders}
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {insights.performance.orders_growth || 0}% from last month
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Products</p>
                <p className="text-2xl font-bold text-purple-900">
                  {insights.performance.active_products}
                </p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +3 this week
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-orange-900">
                  ₹{insights.performance.avg_order_value.toLocaleString()}
                </p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {insights.performance.products_growth || 0}% from last month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Alerts & Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.performance.low_stock_count > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Package className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      Low Stock Alert
                    </p>
                    <p className="text-xs text-yellow-600">
                      {insights.performance.low_stock_count} products need restocking
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {insights.performance.low_stock_count}
                  </Badge>
                </div>
              )}

              {insights.performance.pending_orders > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">
                      Pending Orders
                    </p>
                    <p className="text-xs text-blue-600">
                      {insights.performance.pending_orders} orders waiting for fulfillment
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {insights.performance.pending_orders}
                  </Badge>
                </div>
              )}

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    All Systems Operational
                  </p>
                  <p className="text-xs text-green-600">
                    Your store is running smoothly
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Today's Action Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.action_items.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getActionTypeColor(item.type)}`}>
                    {item.type}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{item.estimated_time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations and Sustainability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span>AI Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                  <div className="text-xs text-green-600 font-medium mb-1">{rec.impact}</div>
                  <div className="text-xs text-gray-500">{rec.action}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sustainability Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <span>Sustainability Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {insights.sustainability.current_score}/10
              </div>
              <Progress 
                value={insights.sustainability.current_score * 10} 
                className="w-full h-2"
              />
              <p className="text-sm text-gray-600 mt-2">Environmental Impact Score</p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Impact Metrics</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-emerald-600">
                      {insights.sustainability.impact_metrics.carbon_footprint_reduced}
                    </div>
                    <div className="text-xs text-gray-600">kg CO2 Reduced</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-600">
                      {insights.sustainability.impact_metrics.waste_diverted}
                    </div>
                    <div className="text-xs text-gray-600">kg Waste Diverted</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-600">
                      {insights.sustainability.impact_metrics.trees_planted}
                    </div>
                    <div className="text-xs text-gray-600">Trees Planted</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Improvement Areas</h4>
                <div className="space-y-2">
                  {insights.sustainability.improvements.map((improvement, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorAnalyticsDashboard;
