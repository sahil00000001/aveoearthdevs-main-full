import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import VendorConcierge from '@/components/VendorConcierge';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Eye,
  Edit,
  Trash2,
  Star,
  ArrowUpRight,
  BarChart3,
  Leaf,
  Zap,
  Sparkles,
  LogOut
} from 'lucide-react';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { vendor, loading, signOut, isAuthenticated } = useVendorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for vendor auth to finish loading
    if (loading) {
      return;
    }
    
    // For mock version, check if vendor exists in localStorage
    const session = localStorage.getItem('vendorSession');
    if (!session && !isAuthenticated()) {
      navigate('/vendor');
    }
  }, [loading, isAuthenticated, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="w-8 h-8 text-white" />
          </div>
          <p className="text-forest text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // For mock version, show dashboard if vendor session exists
  const session = localStorage.getItem('vendorSession');
  if (!session && !isAuthenticated()) {
    return null;
  }

  // State for real data
  const [stats, setStats] = useState([
    {
      title: 'Total Revenue',
      value: '₹0',
      change: '0%',
      trend: 'neutral',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Orders',
      value: '0',
      change: '0%',
      trend: 'neutral',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Products Sold',
      value: '0',
      change: '0%',
      trend: 'neutral',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Active Products',
      value: '0',
      change: '0',
      trend: 'neutral',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]);

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendor?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch vendor stats
        const { data: products } = await supabase
          .from('products')
          .select('id, name, price, status, approval_status')
          .eq('supplier_id', vendor.id);

        const { data: orders } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('vendor_id', vendor.id);

        // Calculate stats
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        const totalOrders = orders?.length || 0;
        const activeProducts = products?.filter(p => p.status === 'active' && p.approval_status === 'approved').length || 0;
        const totalProducts = products?.length || 0;

        // Update stats
        setStats(prev => prev.map(stat => {
          switch (stat.title) {
            case 'Total Revenue':
              return { ...stat, value: `₹${totalRevenue.toLocaleString()}` };
            case 'Total Orders':
              return { ...stat, value: totalOrders.toString() };
            case 'Active Products':
              return { ...stat, value: activeProducts.toString() };
            case 'Products Sold':
              return { ...stat, value: '0' }; // This would need order_items table
            default:
              return stat;
          }
        }));

        // Set recent orders (empty for now - would need orders table)
        setRecentOrders([]);
        
        // Set top products (empty for now - would need sales data)
        setTopProducts([]);

      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, [vendor?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className="p-6 lg:p-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-bold text-forest mb-2 bg-gradient-to-r from-forest to-moss bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">Welcome back! Here's your business overview</p>
          </div>
          <Button className="bg-gradient-to-r from-forest to-moss hover:from-moss hover:to-clay text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:animate-pulse">
            <Plus className="w-5 h-5 mr-2" />
            Add Products
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="bg-white/95 backdrop-blur-md border-forest/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-moss/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-forest group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="w-4 h-4 text-green-600 animate-bounce-slow" />
                      <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 ${stat.bgColor} rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                    <stat.icon className={`w-8 h-8 ${stat.color} group-hover:animate-pulse`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="bg-white/95 backdrop-blur-md border-forest/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
            <CardHeader className="bg-gradient-to-r from-forest/10 to-moss/10 rounded-t-2xl">
              <CardTitle className="text-2xl font-bold text-forest flex items-center gap-3">
                <div className="w-10 h-10 bg-forest rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-forest/5 to-moss/5 hover:from-forest/10 hover:to-moss/10 transition-all duration-300 hover:scale-105 group/item border border-forest/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-forest group-hover/item:text-moss transition-colors duration-300">{order.id}</span>
                        <Badge className={`${getStatusColor(order.status)} group-hover/item:scale-110 transition-transform duration-300`}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                      <p className="text-sm font-medium text-forest group-hover/item:text-moss transition-colors duration-300">{order.product}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-forest group-hover/item:text-moss transition-colors duration-300">{order.amount}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button className="bg-gradient-to-r from-forest to-moss hover:from-moss hover:to-clay text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  View All Orders
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-white/95 backdrop-blur-md border-forest/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
            <CardHeader className="bg-gradient-to-r from-moss/10 to-clay/10 rounded-t-2xl">
              <CardTitle className="text-2xl font-bold text-forest flex items-center gap-3">
                <div className="w-10 h-10 bg-moss rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-5 h-5 text-white" />
                </div>
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-moss/5 to-clay/5 hover:from-moss/10 hover:to-clay/10 transition-all duration-300 hover:scale-105 group/item border border-moss/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-forest/20 to-moss/20 rounded-3xl flex items-center justify-center group-hover/item:scale-110 group-hover/item:rotate-12 transition-all duration-500">
                      <div className="text-2xl group-hover/item:animate-bounce-slow">🌱</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-forest mb-1 group-hover/item:text-moss transition-colors duration-300">{product.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-green-600" />
                          {product.sales} sales
                        </span>
                        <span className="font-semibold text-forest">{product.revenue}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current animate-pulse-slow" />
                          <span className="font-semibold">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-2">
                        <Leaf className="w-4 h-4 text-green-600 animate-spin" />
                        <span className="text-sm font-bold text-green-600">{product.sustainability}%</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" className="p-2 bg-forest/10 hover:bg-forest/20 text-forest hover:text-moss transition-all duration-300 hover:scale-110">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="p-2 bg-moss/10 hover:bg-moss/20 text-moss hover:text-clay transition-all duration-300 hover:scale-110">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button className="bg-gradient-to-r from-moss to-clay hover:from-clay hover:to-forest text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Manage Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 bg-gradient-to-r from-forest/15 via-moss/10 to-clay/15 border-forest/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-forest mb-6 flex items-center gap-3 animate-fade-in-up">
              <div className="w-12 h-12 bg-gradient-to-r from-forest to-moss rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <Zap className="w-6 h-6 text-white animate-pulse" />
              </div>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button className="bg-gradient-to-br from-forest to-moss hover:from-moss hover:to-clay text-white p-6 h-auto flex flex-col items-center gap-3 hover:scale-110 transition-all duration-500 hover:shadow-2xl rounded-3xl group/action">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover/action:scale-110 group-hover/action:rotate-12 transition-all duration-500">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg">Add New Product</span>
              </Button>
              <Button className="bg-gradient-to-br from-moss to-clay hover:from-clay hover:to-forest text-white p-6 h-auto flex flex-col items-center gap-3 hover:scale-110 transition-all duration-500 hover:shadow-2xl rounded-3xl group/action">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover/action:scale-110 group-hover/action:rotate-12 transition-all duration-500">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg">View Analytics</span>
              </Button>
              <Button className="bg-gradient-to-br from-clay to-forest hover:from-forest hover:to-moss text-white p-6 h-auto flex flex-col items-center gap-3 hover:scale-110 transition-all duration-500 hover:shadow-2xl rounded-3xl group/action">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover/action:scale-110 group-hover/action:rotate-12 transition-all duration-500">
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg">Customer Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Vendor Concierge */}
        <VendorConcierge />
    </div>
  );
};

export default VendorDashboard;
