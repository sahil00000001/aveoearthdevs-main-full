import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  TruckIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import adminService from '../../../services/adminService';

const DashboardScreen: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    activeOrders: 0,
    shippedOrders: 0,
    avgOrderValue: 0,
    totalSuppliers: 0,
    verifiedSuppliers: 0,
    pendingProducts: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const stats = await adminService.getDashboardStats();
        setDashboardStats(stats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // No fallback data - show empty state
        console.log('Admin dashboard service not available');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return adminService.formatCurrency(amount);
  };

  const formatNumber = (num: number) => {
    return adminService.formatNumber(num);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Admin Dashboard</h1>
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
          <button className="px-4 py-2 bg-[hsl(var(--forest-deep))] text-white rounded-lg hover:bg-[hsl(157_75%_12%)] transition-colors flex items-center gap-2 shadow-sm">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600 font-medium">+12.5%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.totalOrders)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600 font-medium">+8.3%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.totalUsers)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600 font-medium">+15.2%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.totalProducts)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <CubeIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600 font-medium">+5.7%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.activeOrders)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Currently being processed</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.verifiedSuppliers)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TruckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Out of {formatNumber(dashboardStats.totalSuppliers)} total</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.pendingProducts)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Products awaiting approval</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[
              { month: "Jan", revenue: 15000 },
              { month: "Feb", revenue: 18000 },
              { month: "Mar", revenue: 22000 },
              { month: "Apr", revenue: 25000 },
              { month: "May", revenue: 28000 },
              { month: "Jun", revenue: 32000 }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-emerald-500 rounded-t"
                  style={{ height: `${(item.revenue / 35000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                <span className="text-xs font-medium text-gray-700">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {[
              { name: "Bamboo Spoons", orders: 2345, revenue: 12500 },
              { name: "Wooden Baskets", orders: 1890, revenue: 9800 },
              { name: "Jute Bags", orders: 1654, revenue: 8200 },
              { name: "Eco-friendly Plates", orders: 1432, revenue: 7100 }
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
