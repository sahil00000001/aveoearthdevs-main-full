import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Eye,
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  Leaf,
  Zap,
  LogOut
} from 'lucide-react';

const VendorAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { vendor, loading, signOut, isAuthenticated } = useVendorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate('/vendor');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest/5 via-moss/10 to-clay/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-forest text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalRevenue: 245680,
      totalOrders: 1234,
      totalProducts: 89,
      conversionRate: 3.2,
      avgOrderValue: 199.1,
      customerSatisfaction: 4.8
    },
    revenue: [
      { month: 'Jan', revenue: 45000, orders: 180 },
      { month: 'Feb', revenue: 52000, orders: 210 },
      { month: 'Mar', revenue: 48000, orders: 195 },
      { month: 'Apr', revenue: 61000, orders: 245 },
      { month: 'May', revenue: 55000, orders: 220 },
      { month: 'Jun', revenue: 68000, orders: 275 }
    ],
    topProducts: [
      { name: 'Organic Bamboo Sheets', sales: 234, revenue: 58466, growth: 12.5 },
      { name: 'Eco Water Bottle', sales: 189, revenue: 24611, growth: 8.3 },
      { name: 'Sustainable Tote Bag', sales: 156, revenue: 12444, growth: -2.1 },
      { name: 'Bamboo Cutlery Set', sales: 98, revenue: 8802, growth: 15.7 },
      { name: 'Natural Loofah Sponge', sales: 145, revenue: 5805, growth: 22.1 }
    ],
    sustainability: {
      avgScore: 92.5,
      ecoFriendlyProducts: 78,
      carbonSaved: 1250,
      treesPlanted: 45
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className="p-8 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-forest hover:text-moss hover:scale-110 transition-all duration-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-forest mb-2 bg-gradient-to-r from-forest to-moss bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">Track your business performance and sustainability impact</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-3 border-2 border-forest/20 rounded-2xl focus:border-forest focus:ring-4 focus:ring-forest/20 bg-white/90 backdrop-blur-sm hover:border-forest/40 transition-all duration-300"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button className="bg-gradient-to-r from-forest to-moss hover:from-moss hover:to-clay text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <Card className="bg-white/95 backdrop-blur-md border-forest/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-forest group-hover:scale-110 transition-transform duration-300">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 animate-bounce-slow" />
                  <span className="text-sm font-semibold text-green-600">+12.5%</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <DollarSign className="w-8 h-8 text-green-600 group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-forest/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-forest">{analyticsData.overview.totalOrders}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-forest/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-forest">{analyticsData.overview.conversionRate}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">+0.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-forest/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Order Value</p>
                <p className="text-2xl font-bold text-forest">{formatCurrency(analyticsData.overview.avgOrderValue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">+5.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-forest/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Products</p>
                <p className="text-2xl font-bold text-forest">{analyticsData.overview.totalProducts}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">+3</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-forest/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Satisfaction</p>
                <p className="text-2xl font-bold text-forest">{analyticsData.overview.customerSatisfaction}/5</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">+0.2</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card className="bg-white/90 backdrop-blur-sm border-forest/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-forest flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.revenue.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-forest/5 hover:bg-forest/10 transition-colors duration-300">
                  <div>
                    <p className="font-semibold text-forest">{item.month}</p>
                    <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-forest">{formatCurrency(item.revenue)}</p>
                    <div className="w-24 h-2 bg-forest/20 rounded-full mt-1">
                      <div 
                        className="h-2 bg-forest rounded-full" 
                        style={{ width: `${(item.revenue / 70000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-white/90 backdrop-blur-sm border-forest/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-forest flex items-center gap-2">
              <Package className="w-5 h-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product, index) => {
                const GrowthIcon = getGrowthIcon(product.growth);
                return (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-forest/5 hover:bg-forest/10 transition-colors duration-300">
                    <div className="flex-1">
                      <h4 className="font-semibold text-forest mb-1">{product.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{product.sales} sales</span>
                        <span>{formatCurrency(product.revenue)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${getGrowthColor(product.growth)}`}>
                        <GrowthIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{product.growth}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sustainability Impact */}
      <Card className="mt-8 bg-gradient-to-r from-forest/10 to-moss/10 border-forest/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-forest flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Sustainability Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-forest mb-2">{analyticsData.sustainability.avgScore}%</div>
              <div className="text-sm text-muted-foreground">Avg Eco Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-forest mb-2">{analyticsData.sustainability.ecoFriendlyProducts}</div>
              <div className="text-sm text-muted-foreground">Eco-Friendly Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-forest mb-2">{analyticsData.sustainability.carbonSaved}kg</div>
              <div className="text-sm text-muted-foreground">CO₂ Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-forest mb-2">{analyticsData.sustainability.treesPlanted}</div>
              <div className="text-sm text-muted-foreground">Trees Planted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAnalytics;