import React, { useState, useEffect } from 'react';
import supplierAnalyticsService from '../../services/supplierAnalyticsService';
import supplierOrdersService from '../../services/supplierOrdersService';

// Icon Components
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#00b69b" strokeWidth="2" fill="none"/>
    <polyline points="17 6 23 6 23 12" stroke="#00b69b" strokeWidth="2" fill="none"/>
  </svg>
);

const OrderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#d4183d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke="#d4183d" strokeWidth="2"/>
    <line x1="12" y1="17" x2="12.01" y2="17" stroke="#d4183d" strokeWidth="2"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default function DashboardStats({ vendor }) {
  const [analytics, setAnalytics] = useState(null);
  const [orderAnalytics, setOrderAnalytics] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [analyticsData, orderData, lowStockData] = await Promise.all([
          supplierAnalyticsService.getAnalyticsOverview(30),
          supplierOrdersService.getOrderAnalytics(30),
          supplierAnalyticsService.getLowStockProducts()
        ]);

        setAnalytics(analyticsData);
        setOrderAnalytics(orderData);
        setLowStockCount(lowStockData?.low_stock_products?.length || 0);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-7 mb-6 sm:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#c6c6c6] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] p-4 sm:p-6 relative min-h-[100px] sm:min-h-[120px]">
            <div className="animate-pulse">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2 sm:mb-3"></div>
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-7 mb-6 sm:mb-8">
      {/* Total Views Card */}
      <div className="bg-white rounded-[14px] border border-[#c6c6c6] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] p-4 sm:p-6 relative min-h-[100px] sm:min-h-[120px]">
        {/* Icon container */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-6 h-6 sm:w-8 sm:h-8 bg-[#f2f2f2] rounded-[8px] sm:rounded-[10px] border border-[#dadada] flex items-center justify-center text-[#666]">
          <EyeIcon />
        </div>

        {/* Title */}
        <div className="font-['Source_Sans_Pro'] font-semibold text-[14px] sm:text-[16px] text-[#202224] opacity-70 mb-2 sm:mb-3 pr-8 sm:pr-12">
          Total Views
        </div>

        {/* Main number */}
        <div className="font-['Nunito_Sans'] font-bold text-[24px] sm:text-[28px] text-[#202224] tracking-[1px] mb-2">
          {formatNumber(analytics?.total_views || 0)}
        </div>

        {/* Trend indicator */}
        <div className="flex items-center gap-1 flex-wrap">
          <TrendingUpIcon />
          <span className="font-['Nunito_Sans'] font-semibold text-[12px] sm:text-[14px]">
            <span className="text-[#00b69b]">{formatNumber(analytics?.unique_views || 0)}</span>
            <span className="text-[#606060]"> unique viewers</span>
          </span>
        </div>
      </div>

      {/* Active Orders Card */}
      <div className="bg-white rounded-[14px] border border-[#c6c6c6] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] p-4 sm:p-6 relative min-h-[100px] sm:min-h-[120px]">
        {/* Icon container */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-6 h-6 sm:w-8 sm:h-8 bg-[#f2f2f2] rounded-[8px] sm:rounded-[10px] border border-[#dadada] flex items-center justify-center text-[#666]">
          <OrderIcon />
        </div>

        {/* Title */}
        <div className="font-['Source_Sans_Pro'] font-semibold text-[14px] sm:text-[16px] text-[#202224] opacity-70 mb-2 sm:mb-3 pr-8 sm:pr-12">
          Total Orders
        </div>

        {/* Main number */}
        <div className="font-['Nunito_Sans'] font-bold text-[24px] sm:text-[28px] text-[#202224] tracking-[1px] mb-2">
          {formatNumber(orderAnalytics?.total_orders || 0)}
        </div>

        {/* Trend indicator */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-['Nunito_Sans'] font-semibold text-[12px] sm:text-[14px]">
            <span className="text-[#00b69b]">AOV: {formatCurrency(orderAnalytics?.average_order_value || 0)}</span>
          </span>
        </div>
  
        
        {/* Trend indicator */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-['Nunito_Sans'] font-semibold text-[14px]">
            <span className="text-[#00b69b]">AOV: {formatCurrency(orderAnalytics?.average_order_value || 0)}</span>
          </span>
        </div>
      </div>

      {/* Monthly Revenue Card */}
      <div className="bg-white rounded-[14px] border border-[#c6c6c6] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] p-4 sm:p-6 relative min-h-[100px] sm:min-h-[120px]">
        {/* Icon container */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-6 h-6 sm:w-8 sm:h-8 bg-[#f2f2f2] rounded-[8px] sm:rounded-[10px] border border-[#dadada] flex items-center justify-center">
          <div className="font-['Nunito_Sans'] font-bold text-[16px] sm:text-[20px] text-[#666] tracking-[1px]">
            $
          </div>
        </div>

        {/* Title */}
        <div className="font-['Source_Sans_Pro'] font-semibold text-[14px] sm:text-[16px] text-[#202224] opacity-70 mb-2 sm:mb-3 pr-8 sm:pr-12">
          Total Revenue
        </div>

        {/* Main number */}
        <div className="font-['Nunito_Sans'] font-bold text-[24px] sm:text-[28px] text-[#202224] tracking-[1px] mb-2">
          {formatCurrency(orderAnalytics?.total_revenue || 0)}
        </div>

        {/* Trend indicator */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-['Nunito_Sans'] font-semibold text-[12px] sm:text-[14px]">
            <span className="text-[#00b69b]">Last 30 days</span>
          </span>
        </div>
      </div>

      {/* Low Stock Alert Card */}
      <div className="bg-white rounded-[14px] border border-[#c6c6c6] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] p-4 sm:p-6 relative min-h-[100px] sm:min-h-[120px]">
        {/* Icon container */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-6 h-6 sm:w-8 sm:h-8 bg-[#f2f2f2] rounded-[8px] sm:rounded-[10px] border border-[#dadada] flex items-center justify-center">
          <WarningIcon />
        </div>

        {/* Title */}
        <div className="font-['Source_Sans_Pro'] font-semibold text-[14px] sm:text-[16px] text-[#202224] opacity-70 mb-2 sm:mb-3 pr-8 sm:pr-12">
          Low Stock Alert
        </div>

        {/* Main number */}
        <div className="font-['Nunito_Sans'] font-bold text-[24px] sm:text-[28px] text-[#d4183d] tracking-[1px] mb-2">
          {formatNumber(lowStockCount)}
        </div>

        {/* Description */}
        <div className="font-['Nunito_Sans'] font-semibold text-[12px] sm:text-[14px] text-[#666666] flex-wrap">
          Items needing restocking
        </div>
      </div>
    </div>
  );
}
