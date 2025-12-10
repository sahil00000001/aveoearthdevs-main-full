import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import { vendorOrderService, OrderStats } from '@/services/vendorOrderService';
import { vendorProductService } from '@/services/vendorProductService';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  Eye, 
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Zap
} from 'lucide-react';

const VendorAnalyticsPage = () => {
  const { vendor, isAuthenticated, loading: vendorLoading } = useVendorAuth();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  // State for real data
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [customerMetrics, setCustomerMetrics] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    averageOrderValue: 0,
    customerLifetimeValue: 0,
    retentionRate: 0
  });
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState({
    carbonFootprintReduced: 0,
    wasteDiverted: 0,
    treesPlanted: 0,
    plasticBottlesSaved: 0,
    energySaved: 0,
    waterSaved: 0
  });

  useEffect(() => {
    // Wait for vendor auth to finish loading
    if (vendorLoading) {
      return;
    }

    // Load data immediately if vendor session exists (for mock version)
    const session = localStorage.getItem('vendorSession');
    if (session || vendor?.id) {
      loadAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [vendor, vendorLoading, timeRange]);

  const loadAnalytics = async () => {
    // Use mock vendor ID if no vendor from auth
    const vendorId = vendor?.id || 'mock-vendor-1';
    
    setIsLoading(true);
    try {
      // Simulate a quick load for mock data
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const orderStats = await vendorOrderService.getOrderStats(vendorId, timeRange as any);
      setStats(orderStats);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <p className="text-forest text-lg">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-forest mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your business performance and insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold text-forest">
                          {stats ? formatCurrency(stats.total_revenue) : '₹0'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">+12.5%</span>
                        </div>
                      </div>
                      <DollarSign className="w-8 h-8 text-forest" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold text-forest">
                          {stats ? formatNumber(stats.total_orders) : '0'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">+8.2%</span>
                        </div>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-forest" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                        <p className="text-2xl font-bold text-forest">
                          {stats ? formatCurrency(stats.average_order_value) : '₹0'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">+5.3%</span>
                        </div>
                      </div>
                      <TrendingUp className="w-8 h-8 text-forest" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                        <p className="text-2xl font-bold text-forest">89</p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">+3</span>
                        </div>
                      </div>
                      <Package className="w-8 h-8 text-forest" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Sales Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-end justify-between gap-2">
                    {salesData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center gap-2 flex-1">
                        <div 
                          className="bg-gradient-to-t from-forest to-moss rounded-t w-full transition-all duration-500 hover:opacity-80"
                          style={{ height: `${(data.sales / 70000) * 300}px` }}
                        />
                        <span className="text-xs text-muted-foreground">{data.month}</span>
                        <span className="text-xs font-medium">{formatCurrency(data.sales)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Status Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Order Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats && [
                        { label: 'Delivered', value: stats.delivered_orders, color: 'bg-green-500' },
                        { label: 'Shipped', value: stats.shipped_orders, color: 'bg-blue-500' },
                        { label: 'Processing', value: stats.processing_orders, color: 'bg-purple-500' },
                        { label: 'Pending', value: stats.pending_orders, color: 'bg-yellow-500' },
                        { label: 'Cancelled', value: stats.cancelled_orders, color: 'bg-red-500' },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-sm">{item.label}</span>
                          </div>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Customer Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Customers</span>
                        <span className="font-medium">{formatNumber(customerMetrics.totalCustomers)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">New This Month</span>
                        <span className="font-medium">{customerMetrics.newCustomers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Returning</span>
                        <span className="font-medium">{customerMetrics.returningCustomers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Retention Rate</span>
                        <span className="font-medium">{customerMetrics.retentionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Lifetime Value</span>
                        <span className="font-medium">{formatCurrency(customerMetrics.customerLifetimeValue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <div className="space-y-6">
              {/* Sales Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-forest">
                        {stats ? formatCurrency(stats.revenue_this_month) : '₹0'}
                      </p>
                      <p className="text-sm text-muted-foreground">This Month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-forest">
                        {stats ? formatCurrency(stats.total_revenue) : '₹0'}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-forest">
                        {stats ? formatNumber(stats.orders_this_month) : '0'}
                      </p>
                      <p className="text-sm text-muted-foreground">Orders This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-forest to-moss h-2 rounded-full transition-all duration-500"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(category.sales)}</span>
                          <span>{category.percentage}% of total</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(product.revenue)}</p>
                          <div className="flex items-center gap-1">
                            {product.growth > 0 ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.growth > 0 ? '+' : ''}{product.growth}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sustainability Tab */}
          <TabsContent value="sustainability">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-forest">{sustainabilityMetrics.carbonFootprintReduced} kg</p>
                    <p className="text-sm text-muted-foreground">CO2 Reduced</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-forest">{sustainabilityMetrics.wasteDiverted} kg</p>
                    <p className="text-sm text-muted-foreground">Waste Diverted</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-forest">{sustainabilityMetrics.energySaved} kWh</p>
                    <p className="text-sm text-muted-foreground">Energy Saved</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Activity className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-forest">{sustainabilityMetrics.treesPlanted}</p>
                    <p className="text-sm text-muted-foreground">Trees Planted</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Package className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-forest">{sustainabilityMetrics.plasticBottlesSaved}</p>
                    <p className="text-sm text-muted-foreground">Plastic Bottles Saved</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Activity className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-forest">{sustainabilityMetrics.waterSaved} L</p>
                    <p className="text-sm text-muted-foreground">Water Saved</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Environmental Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl font-bold text-white">95%</span>
                    </div>
                    <h3 className="text-xl font-semibold text-forest mb-2">Sustainability Score</h3>
                    <p className="text-muted-foreground">
                      Your products are making a positive environmental impact
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorAnalyticsPage;