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

const AnalyticsScreen: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalProducts: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      usersGrowth: 0,
      productsGrowth: 0
    },
    sales: [],
    users: [],
    products: [],
    orders: [],
    topProducts: [],
    revenue: [],
    conversion: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminService.getAnalytics({ timeRange });
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // No fallback data - show empty state
        console.log('Analytics service not available');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return adminService.formatCurrency(amount);
  };

  const formatNumber = (num: number) => {
    return adminService.formatNumber(num);
  };

  const formatPercentage = (num: number) => {
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
    <div className="space-y-8">
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
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
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
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
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
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
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
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
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
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
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
            {(analyticsData.revenue || []).map((item, index) => (
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
            {(analyticsData.users || []).map((item, index) => (
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
            {(analyticsData.topProducts || []).slice(0, 5).map((product, index) => (
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
            {(analyticsData.orders || []).map((order, index) => (
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
            {(analyticsData.conversion || []).map((source, index) => (
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

      {/* Additional Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">KPIs</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>Avg. Order Value: {formatCurrency(analyticsData.overview.totalRevenue / Math.max(1, analyticsData.overview.totalOrders))}</li>
            <li>Conversion Rate: {(analyticsData.conversion?.reduce((a,c)=>a + (c.rate||0),0) / Math.max(1, analyticsData.conversion?.length||1)).toFixed(1)}%</li>
            <li>Top Product: {(analyticsData.topProducts?.[0]?.name)||'—'}</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <p className="text-sm text-gray-600">Traffic sources and revenue trends use mock data when the backend is offline so the dashboard stays usable for testing and layout validation.</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;
