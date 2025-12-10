"use client";

import StatCard from "../StatCard";
import TimeFilter from "../TimeFilter";
import ChartCard from "../ChartCard";
import SalesChart from "../SalesChart";
import ProductList from "../ProductList";
import QuickAction from "../QuickAction";
import { useState, useEffect } from "react";
import adminService from "@/services/adminService";

export default function DashboardScreen() {
  const [salesPeriod, setSalesPeriod] = useState("Today");
  const [userPeriod, setUserPeriod] = useState("Today");
  const [productPeriod, setProductPeriod] = useState("Today");
  
  // Dashboard data state
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalSuppliers: 0,
    verifiedSuppliers: 0,
    activeOrders: 0,
    shippedOrders: 0,
    avgOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const stats = await adminService.getDashboardStats();
      
      // Fetch recent orders for more detailed stats
      const ordersData = await adminService.getAllOrders({ 
        page: 1, 
        limit: 100 
      });
      
      // Calculate additional stats from orders
      const orders = ordersData.items || [];
      const activeOrders = orders.filter(order => 
        ['pending', 'confirmed', 'processing'].includes(order.status?.toLowerCase())
      ).length;
      
      const shippedOrders = orders.filter(order => 
        ['shipped', 'delivered'].includes(order.status?.toLowerCase())
      ).length;
      
      const totalRevenue = orders.reduce((sum, order) => 
        sum + (order.total_amount || 0), 0
      );
      
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
      
      setDashboardStats({
        ...stats,
        activeOrders,
        shippedOrders,
        totalRevenue,
        avgOrderValue
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7 bg-gray-200 h-64 rounded-xl"></div>
            <div className="col-span-5 bg-gray-200 h-64 rounded-xl"></div>
            <div className="col-span-12 grid grid-cols-3 gap-6">
              <div className="bg-gray-200 h-32 rounded-xl"></div>
              <div className="bg-gray-200 h-32 rounded-xl"></div>
              <div className="bg-gray-200 h-32 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load dashboard data: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Refresh Data
        </button>
      </div>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Sales Overview */}
        <div className="col-span-7">
          <ChartCard title="Sales Overview" hasDropdown dropdownValue="This Month">
            <div className="mb-6">
              <TimeFilter 
                selectedPeriod={salesPeriod} 
                onPeriodChange={setSalesPeriod} 
              />
            </div>
            <SalesChart />
          </ChartCard>
        </div>
        
        {/* Right Column - Top Products */}
        <div className="col-span-5">
          <ChartCard title="Top Products">
            <ProductList />
          </ChartCard>
        </div>
        
        {/* Stats Cards Row */}
        <div className="col-span-12 mt-6">
          <div className="grid grid-cols-3 gap-6">
            <StatCard 
              title="Active Orders"
              value={formatNumber(dashboardStats.activeOrders)}
              change="5"
              description="Currently being processed"
              icon="orders"
            />
            <StatCard 
              title="Orders Shipped"
              value={formatNumber(dashboardStats.shippedOrders)}
              change="3"
              description="Completed deliveries"
              icon="orders"
            />
            <StatCard 
              title="Avg. Order Value"
              value={formatCurrency(dashboardStats.avgOrderValue)}
              description="Average transaction amount"
              icon="trend"
            />
          </div>
        </div>
        
        {/* User Overview */}
        <div className="col-span-7 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-gray-900">User Overview</h3>
              <TimeFilter 
                selectedPeriod={userPeriod} 
                onPeriodChange={setUserPeriod} 
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <StatCard 
                title="Total Orders"
                value={formatNumber(dashboardStats.totalOrders)}
                icon="users"
              />
              <StatCard 
                title="Total Revenue"
                value={formatCurrency(dashboardStats.totalRevenue)}
                icon="users"
              />
              <StatCard 
                title="Total Suppliers"
                value={formatNumber(dashboardStats.totalSuppliers)}
                icon="users"
              />
            </div>
          </div>
        </div>
        
        {/* Product Overview */}
        <div className="col-span-12 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Product Overview</h3>
              <TimeFilter 
                selectedPeriod={productPeriod} 
                onPeriodChange={setProductPeriod} 
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <StatCard 
                title="Active Products"
                value={formatNumber(dashboardStats.totalProducts)}
                icon="orders"
              />
              <StatCard 
                title="Pending Approvals"
                value={formatNumber(dashboardStats.pendingProducts)}
                icon="orders"
              />
              <StatCard 
                title="Verified Suppliers"
                value={formatNumber(dashboardStats.verifiedSuppliers)}
                icon="orders"
              />
            </div>
          </div>
        </div>
        
        {/* System Status */}
        <div className="col-span-12 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-6">System Status</h3>
            <div className="space-y-4">
              <QuickAction title="API Uptime & Latency" />
              <QuickAction title="Payment Gateway Status" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
