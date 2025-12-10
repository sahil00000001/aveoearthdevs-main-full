import React, { useState, useEffect } from 'react';
import supplierOrdersService from '../../services/supplierOrdersService';

// Asset constants from Figma
const imgIconChevronDown = "http://localhost:3845/assets/857beec8fb96e976198bd409c96f30f532c8bdc4.svg";

export default function RecentOrders() {
  const [selectedTab, setSelectedTab] = useState('recent');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        const result = await supplierOrdersService.getOrders({ 
          page: 1, 
          page_size: 5 
        });
        setOrders(result?.items || []);
      } catch (error) {
        console.error('Failed to fetch recent orders:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedTab === 'recent') {
      fetchRecentOrders();
    }
  }, [selectedTab]);

  const getStatusStyle = (status) => {
    const statusMap = {
      'pending': { bg: '#fbbf24', text: '#000000' },
      'confirmed': { bg: '#10b981', text: '#ffffff' },
      'processing': { bg: '#3b82f6', text: '#ffffff' },
      'shipped': { bg: '#8b5cf6', text: '#ffffff' },
      'delivered': { bg: '#059669', text: '#ffffff' },
      'cancelled': { bg: '#ef4444', text: '#ffffff' },
      'returned': { bg: '#6b7280', text: '#ffffff' }
    };
    
    return statusMap[status?.toLowerCase()] || { bg: '#cecece', text: '#000000' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatOrderId = (id) => {
    return `ORD-${id?.slice(-6)?.toUpperCase() || 'XXXXXX'}`;
  };

  return (
    <div className="px-4 sm:px-7">
      {/* Tab Selector */}
      <div className="bg-[#e9e9e9] h-[34px] rounded-[20px] w-full sm:w-[284px] overflow-hidden mb-4 sm:mb-6 relative">
        {/* Active tab background */}
        <div className="absolute bg-white h-6 left-1.5 rounded-[20px] top-1/2 translate-y-[-50%] w-[120px] sm:w-[138px]">
          <div className="absolute font-['Reem_Kufi'] font-medium text-[10px] sm:text-[12px] text-black text-center top-1/2 translate-y-[-50%] w-full">
            Recent Orders
          </div>
        </div>
        
        {/* Inactive tab */}
        <div className="absolute font-['Reem_Kufi'] font-medium text-[10px] sm:text-[12px] text-black text-center top-1/2 translate-y-[-50%] left-[140px] sm:left-[170px]">
          Low Stock Items
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-[14px] border border-[#c6c6c6] p-4 sm:p-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-4 sm:mb-6 gap-4 sm:gap-0">
          <div>
            {/* Title */}
            <div className="font-['Inter'] font-semibold text-[16px] sm:text-[16px] text-black mb-1">
              Recent Orders
            </div>
            <div className="font-['Inter'] font-medium text-[14px] sm:text-[15px] text-[#909090]">
              Your Latest Customer Orders
            </div>
          </div>
          
          {/* Month selector */}
          <div className="w-20">
            <div className="bg-[#fcfdfd] border-[0.6px] border-[#818181] rounded-[4px] px-2 py-1 flex items-center justify-between">
              <span className="font-['Reem_Kufi'] font-normal text-[12px] text-[rgba(0,0,0,0.4)]">October</span>
              <img alt="" className="w-3 h-3" src={imgIconChevronDown} />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[14px] border-[0.7px] border-[#989898] p-4">
                  <div className="animate-pulse flex items-center justify-between">
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="flex-1 px-6">
                      <div className="h-3 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load orders: {error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent orders found</p>
            </div>
          ) : (
            orders.map((order, index) => {
              const statusStyle = getStatusStyle(order.fulfillment_status);
              return (
                <div key={order.id || index} className="bg-white rounded-[14px] border-[0.7px] border-[#989898] p-4">
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="font-['Poppins'] font-medium text-[14px] text-black">
                          {formatOrderId(order.order_id)}
                        </div>
                        <div 
                          className="h-[18px] rounded-[4px] px-2 flex items-center justify-center text-center inline-flex w-fit"
                          style={{ 
                            backgroundColor: statusStyle.bg,
                            minWidth: "60px"
                          }}
                        >
                          <span 
                            className="font-['Poppins'] font-medium text-[10px] capitalize"
                            style={{ color: statusStyle.text }}
                          >
                            {order.fulfillment_status}
                          </span>
                        </div>
                      </div>
                      <div className="font-['Poppins'] font-medium text-[14px] text-black">
                        {formatCurrency(order.total_price)}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="font-['Poppins'] font-medium text-[12px] text-[#8b8b8b] mb-1">
                        SKU: {order.sku}
                      </div>
                      <div className="font-['Poppins'] font-medium text-[12px] text-[#010101]">
                        {order.product_name}
                        {order.variant_title && ` - ${order.variant_title}`}
                      </div>
                      <div className="font-['Poppins'] font-medium text-[11px] text-[#666666] mt-1">
                        Qty: {order.quantity}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        className="bg-white h-[31px] w-[82px] rounded-[5px] border-[0.5px] border-[#666666] flex items-center justify-center hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          // Navigate to order details or open modal
                          console.log('View order details:', order.id);
                        }}
                      >
                        <span className="font-['Poppins'] font-normal text-[12px] text-black">
                          View Detail
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    {/* Left section - Order ID and Status */}
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <div className="font-['Poppins'] font-medium text-[14px] text-black">
                        {formatOrderId(order.order_id)}
                      </div>
                      
                      {/* Status badge */}
                      <div 
                        className="h-[18px] rounded-[4px] px-3 flex items-center justify-center text-center inline-flex w-fit"
                        style={{ 
                          backgroundColor: statusStyle.bg,
                          minWidth: "75px"
                        }}
                      >
                        <span 
                          className="font-['Poppins'] font-medium text-[10px] capitalize"
                          style={{ color: statusStyle.text }}
                        >
                          {order.fulfillment_status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Middle section - Product and Details */}
                    <div className="flex-1 px-6">
                      <div className="font-['Poppins'] font-medium text-[12px] text-[#8b8b8b] mb-1">
                        SKU: {order.sku}
                      </div>
                      <div className="font-['Poppins'] font-medium text-[12px] text-[#010101]">
                        {order.product_name}
                        {order.variant_title && ` - ${order.variant_title}`}
                      </div>
                      <div className="font-['Poppins'] font-medium text-[11px] text-[#666666] mt-1">
                        Qty: {order.quantity}
                      </div>
                    </div>
                    
                    {/* Right section - Amount and Button */}
                    <div className="flex items-center gap-4">
                      <div className="font-['Poppins'] font-medium text-[14px] text-black">
                        {formatCurrency(order.total_price)}
                      </div>
                      
                      {/* View Detail Button */}
                      <button 
                        className="bg-white h-[31px] w-[82px] rounded-[5px] border-[0.5px] border-[#666666] flex items-center justify-center hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          // Navigate to order details or open modal
                          console.log('View order details:', order.id);
                        }}
                      >
                        <span className="font-['Poppins'] font-normal text-[12px] text-black">
                          View Detail
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
