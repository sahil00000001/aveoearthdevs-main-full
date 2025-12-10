"use client";

import { useState, useEffect } from "react";
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  TruckIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import adminService from "@/services/adminService";

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    sales: [],
    users: [],
    products: [],
    orders: [],
    topProducts: [],
    revenue: [],
    conversion: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data
      const [dashboardStats, salesData, topProducts] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getSalesChartData({ period: timeRange }),
        adminService.getTopProducts({ period: timeRange, limit: 10 })
      ]);

      // Mock additional analytics data (in real app, these would come from API)
      const mockAnalytics = {
        overview: {
          totalRevenue: 125430,
          totalOrders: 342,
          totalUsers: 1250,
          totalProducts: 28,
          revenueGrowth: 12.5,
          ordersGrowth: 8.3,
          usersGrowth: 15.2,
          productsGrowth: 5.7
        },
        sales: salesData.data || [],
        users: generateMockUserData(),
        products: generateMockProductData(),
        orders: generateMockOrderData(),
        topProducts: topProducts || [],
        revenue: generateMockRevenueData(),
        conversion: generateMockConversionData()
      };

      setAnalyticsData(mockAnalytics);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockUserData = () => [
    { month: "Jan", new: 120, returning: 80 },
    { month: "Feb", new: 150, returning: 95 },
    { month: "Mar", new: 180, returning: 110 },
    { month: "Apr", new: 200, returning: 125 },
    { month: "May", new: 220, returning: 140 },
    { month: "Jun", new: 250, returning: 160 }
  ];

  const generateMockProductData = () => [
    { category: "Eco-Friendly", count: 45, revenue: 25000 },
    { category: "Organic", count: 32, revenue: 18000 },
    { category: "Sustainable", count: 28, revenue: 22000 },
    { category: "Zero-Waste", count: 15, revenue: 12000 }
  ];

  const generateMockOrderData = () => [
    { status: "Completed", count: 280, percentage: 82 },
    { status: "Processing", count: 35, percentage: 10 },
    { status: "Pending", count: 20, percentage: 6 },
    { status: "Cancelled", count: 7, percentage: 2 }
  ];

  const generateMockRevenueData = () => [
    { month: "Jan", revenue: 15000, orders: 45 },
    { month: "Feb", revenue: 18000, orders: 52 },
    { month: "Mar", revenue: 22000, orders: 68 },
    { month: "Apr", revenue: 25000, orders: 75 },
    { month: "May", revenue: 28000, orders: 82 },
    { month: "Jun", revenue: 32000, orders: 95 }
  ];

  const generateMockConversionData = () => [
    { source: "Organic Search", visitors: 1200, conversions: 48, rate: 4.0 },
    { source: "Social Media", visitors: 800, conversions: 24, rate: 3.0 },
    { source: "Direct", visitors: 600, conversions: 30, rate: 5.0 },
    { source: "Email", visitors: 400, conversions: 28, rate: 7.0 },
    { source: "Referral", visitors: 300, conversions: 18, rate: 6.0 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const formatPercentage = (num) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  if (loading) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-black">Analytics</h1>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600 font-medium">
              {formatPercentage(analyticsData.overview.revenueGrowth)}
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalOrders)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600 font-medium">
              {formatPercentage(analyticsData.overview.ordersGrowth)}
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalUsers)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600 font-medium">
              {formatPercentage(analyticsData.overview.usersGrowth)}
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalProducts)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <CubeIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-sm text-emerald-600 font-medium">
              {formatPercentage(analyticsData.overview.productsGrowth)}
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {analyticsData.revenue.map((item, index) => (
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

        {/* User Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {analyticsData.users.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="flex gap-1 mb-1">
                  <div 
                    className="w-4 bg-blue-500 rounded-t"
                    style={{ height: `${(item.new / 300) * 150}px` }}
                    title={`New: ${item.new}`}
                  ></div>
                  <div 
                    className="w-4 bg-purple-500 rounded-t"
                    style={{ height: `${(item.returning / 200) * 150}px` }}
                    title={`Returning: ${item.returning}`}
                      ></div>
                    </div>
                <span className="text-xs text-gray-500">{item.month}</span>
                </div>
              ))}
            </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">New Users</span>
        </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-600">Returning Users</span>
              </div>
              </div>
            </div>
              </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {analyticsData.topProducts.slice(0, 5).map((product, index) => (
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
                  <p className="text-sm font-medium text-gray-900">{product.likes} likes</p>
              </div>
            </div>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
            <div className="space-y-4">
            {analyticsData.orders.map((order, index) => (
              <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === 'Completed' ? 'bg-emerald-500' :
                    order.status === 'Processing' ? 'bg-blue-500' :
                    order.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{order.status}</span>
                  </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{order.count}</p>
                  <p className="text-xs text-gray-500">{order.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Conversion Sources */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Sources</h3>
            <div className="space-y-4">
            {analyticsData.conversion.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  <span className="text-sm text-gray-500">{source.rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${source.rate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{source.visitors} visitors</span>
                  <span>{source.conversions} conversions</span>
                    </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
