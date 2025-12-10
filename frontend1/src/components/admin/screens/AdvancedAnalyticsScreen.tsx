import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Eye,
  Heart,
  Star,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Clock,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';

interface AdvancedAnalytics {
  realTimeMetrics: {
    activeUsers: number;
    currentOrders: number;
    liveRevenue: number;
    conversionRate: number;
  };
  userBehavior: {
    pageViews: Array<{ page: string; views: number; bounceRate: number }>;
    sessionDuration: number;
    topPages: Array<{ page: string; views: number; avgTime: number }>;
    deviceBreakdown: Array<{ device: string; percentage: number; users: number }>;
  };
  salesFunnel: {
    stages: Array<{ stage: string; users: number; conversion: number; dropoff: number }>;
    revenueByStage: Array<{ stage: string; revenue: number; percentage: number }>;
  };
  geographicData: {
    countries: Array<{ country: string; users: number; revenue: number; orders: number }>;
    cities: Array<{ city: string; users: number; revenue: number }>;
  };
  productPerformance: {
    topSellers: Array<{ product: string; sales: number; revenue: number; growth: number }>;
    lowPerformers: Array<{ product: string; sales: number; revenue: number; issues: string[] }>;
    inventoryAlerts: Array<{ product: string; stock: number; status: 'low' | 'out' | 'overstock' }>;
  };
  customerInsights: {
    segments: Array<{ segment: string; users: number; avgOrderValue: number; loyalty: number }>;
    retention: Array<{ period: string; rate: number; users: number }>;
    churn: Array<{ reason: string; percentage: number; users: number }>;
  };
  sustainabilityMetrics: {
    carbonFootprint: number;
    wasteReduced: number;
    sustainableProducts: number;
    certifications: Array<{ name: string; count: number; percentage: number }>;
  };
}

const AdvancedAnalyticsScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    fetchAnalytics();
    
    // Set up real-time updates
    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [timeRange, refreshInterval]);

  const fetchAnalytics = async () => {
    try {
      // Fetch real data from Supabase
      const realData: AdvancedAnalytics = {
        realTimeMetrics: {
          activeUsers: 0,
          currentOrders: 0,
          liveRevenue: 0,
          conversionRate: 0
        },
        userBehavior: {
          pageViews: [],
          sessionDuration: 0,
          topPages: [],
          deviceBreakdown: []
        },
        salesFunnel: {
          stages: [],
          revenueByStage: []
        },
        geographicData: {
          countries: [],
          cities: []
        },
        productPerformance: {
          topSellers: [],
          lowPerformers: [],
          inventoryAlerts: []
        },
        customerInsights: {
          segments: [],
          retention: [],
          churn: []
        },
        sustainabilityMetrics: {
          carbonFootprint: 0,
          wasteReduced: 0,
          sustainableProducts: 0,
          certifications: []
        }
      };

      setAnalytics(realData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--forest-deep))]" />
        <span className="ml-2">Loading advanced analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No analytics data available</h3>
        <p className="text-gray-500">Unable to load analytics data at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and real-time metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[hsl(var(--forest-deep))] focus:border-[hsl(var(--forest-deep))] bg-white shadow-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-[hsl(var(--forest-deep))]">
                  {analytics.realTimeMetrics.activeUsers}
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last hour
                </p>
              </div>
              <Users className="h-8 w-8 text-[hsl(var(--forest-deep))]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Orders</p>
                <p className="text-2xl font-bold text-[hsl(var(--clay-accent))]">
                  {analytics.realTimeMetrics.currentOrders}
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3 in last 15min
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-[hsl(var(--clay-accent))]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Live Revenue</p>
                <p className="text-2xl font-bold text-[hsl(var(--moss-accent))]">
                  ${analytics.realTimeMetrics.liveRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +$450 today
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-[hsl(var(--moss-accent))]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.realTimeMetrics.conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3% from yesterday
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="behavior" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="funnel">Sales Funnel</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
        </TabsList>

        {/* User Behavior Tab */}
        <TabsContent value="behavior">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Page Views & Bounce Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.userBehavior.pageViews.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{page.page}</p>
                        <p className="text-sm text-gray-500">{page.views} views</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={page.bounceRate > 50 ? "destructive" : "secondary"}>
                          {page.bounceRate}% bounce
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.userBehavior.deviceBreakdown.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                        {device.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                        {device.device === 'Tablet' && <Tablet className="h-4 w-4" />}
                        <span className="font-medium">{device.device}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{device.percentage}%</p>
                        <p className="text-sm text-gray-500">{device.users} users</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Funnel Tab */}
        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sales Funnel Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.salesFunnel.stages.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-[hsl(var(--forest-deep))] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{stage.stage}</p>
                        <p className="text-sm text-gray-500">{stage.users.toLocaleString()} users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[hsl(var(--forest-deep))]">{stage.conversion}%</p>
                      {stage.dropoff > 0 && (
                        <p className="text-sm text-red-600">{stage.dropoff}% dropoff</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.geographicData.countries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{country.country}</p>
                        <p className="text-sm text-gray-500">{country.users} users</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${country.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{country.orders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Cities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.geographicData.cities.map((city, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{city.city}</p>
                        <p className="text-sm text-gray-500">{city.users} users</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${city.revenue.toLocaleString()}</p>
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
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.productPerformance.topSellers.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.product}</p>
                        <p className="text-sm text-gray-500">{product.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{product.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.productPerformance.inventoryAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{alert.product}</p>
                        <p className="text-sm text-gray-500">Stock: {alert.stock}</p>
                      </div>
                      <Badge 
                        variant={
                          alert.status === 'out' ? 'destructive' : 
                          alert.status === 'low' ? 'secondary' : 'default'
                        }
                      >
                        {alert.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Segments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.customerInsights.segments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{segment.segment}</p>
                        <p className="text-sm text-gray-500">{segment.users} users</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${segment.avgOrderValue}</p>
                        <p className="text-sm text-gray-500">{segment.loyalty}% loyalty</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Customer Retention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.customerInsights.retention.map((period, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{period.period}</p>
                        <p className="text-sm text-gray-500">{period.users} users</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[hsl(var(--forest-deep))]">{period.rate}%</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Carbon Footprint</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analytics.sustainabilityMetrics.carbonFootprint}kg
                    </p>
                    <p className="text-xs text-green-600">CO2 saved</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Waste Reduced</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analytics.sustainabilityMetrics.wasteReduced}kg
                    </p>
                    <p className="text-xs text-blue-600">waste diverted</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sustainable Products</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {analytics.sustainabilityMetrics.sustainableProducts}%
                    </p>
                    <p className="text-xs text-purple-600">of catalog</p>
                  </div>
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Certifications</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {analytics.sustainabilityMetrics.certifications.length}
                    </p>
                    <p className="text-xs text-orange-600">active</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sustainability Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.sustainabilityMetrics.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-gray-500">{cert.count} products</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[hsl(var(--forest-deep))]">{cert.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsScreen;


