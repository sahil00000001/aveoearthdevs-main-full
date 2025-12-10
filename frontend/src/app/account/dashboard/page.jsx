"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import NewsletterSubscription from "../../../components/explore/NewsletterSubscription";
import { useAuth } from "../../../hooks/useAuth";
import { useOrders } from "../../../hooks/useOrders";
import { useCart } from "../../../hooks/useCart";

// Order status badge component
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-[#cecece] text-black';
      case 'confirmed':
        return 'bg-black text-white';
      case 'shipped':
        return 'bg-[#f1f1f1] text-black';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`px-2 py-1 rounded text-[10px] font-poppins font-medium ${getStatusStyles()}`}>
      {status || 'Unknown'}
    </div>
  );
};

// Order item component
const OrderItem = ({ order, onViewDetails }) => {
  // Format order data to handle different API response structures
  const formatOrderData = (order) => {
    console.log('OrderItem formatOrderData: Processing order:', order);
    const formatted = {
      id: order.order_number || order.id || order.order_id || 'N/A',
      vendor: order.supplier_name || order.vendor_name || 'Unknown Vendor',
      products: order.items ? 
        order.items.map(item => item.product_name || item.name).join(', ') :
        `${order.items_count || 1} item${order.items_count !== 1 ? 's' : ''}`,
      status: order.status || 'pending',
      date: order.created_at ? 
        new Date(order.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long', 
          year: 'numeric'
        }) : 
        'Unknown date',
      amount: order.total_amount || order.total || 0,
      image: order.items?.[0]?.image || '/spoons.png'
    };
    console.log('OrderItem formatOrderData: Formatted order:', formatted);
    return formatted;
  };

  const formattedOrder = formatOrderData(order);

  return (
    <div className="bg-white border border-[#989898] rounded-[14px] p-4 mb-4">
      <div className="flex items-center justify-between">
        {/* Product Image */}
        <div className="w-[58px] h-[58px] bg-gray-200 rounded-[4px] overflow-hidden mr-4">
          <img 
            src={formattedOrder.image} 
            alt={formattedOrder.products}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/spoons.png'; // Fallback image
            }}
          />
        </div>

        {/* Order Details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-4">
            <span className="font-poppins font-medium text-black text-[14px]">
              #{formattedOrder.id}
            </span>
            <StatusBadge status={formattedOrder.status} />
          </div>

          <div className="text-[#8b8b8b] font-poppins font-medium text-[12px]">
            {formattedOrder.vendor}
          </div>

          <div className="text-black font-poppins font-medium text-[12px]">
            {formattedOrder.products}
          </div>
        </div>

        {/* Date and Amount */}
        <div className="text-right space-y-2">
          <div className="text-[#8b8b8b] font-poppins font-medium text-[12px]">
            {formattedOrder.date}
          </div>
          <div className="text-black font-poppins font-medium text-[14px]">
            ₹{formattedOrder.amount}
          </div>
        </div>

        {/* View Detail Button */}
        <div className="ml-4">
          <button 
            onClick={() => onViewDetails(formattedOrder)}
            className="bg-white border border-[#666666] rounded-[5px] px-3 py-2 text-black font-poppins font-regular text-[12px] hover:bg-gray-50 transition-colors"
          >
            View Detail
          </button>
        </div>
      </div>
    </div>
  );
};

// Pagination component
const Pagination = ({ totalPages = 1, currentPage = 1, onPageChange }) => {
  const getVisiblePages = () => {
    const pages = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      {/* Previous Button */}
      <button 
        className="bg-[#f2f2f2] p-2 rounded-full"
        onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="rotate-90">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange && onPageChange(page)}
            className={`w-9 h-9 rounded-full text-[16px] font-poppins font-medium transition-colors ${
              page === currentPage 
                ? 'bg-black text-white' 
                : 'bg-[#e9eceb] text-[#666666] hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
        
        {currentPage < totalPages - 2 && (
          <>
            <span className="bg-[#e9eceb] w-9 h-9 rounded-full flex items-center justify-center text-[#666666] font-poppins">
              ...
            </span>
            <button
              onClick={() => onPageChange && onPageChange(totalPages)}
              className="bg-[#e9eceb] text-[#666666] hover:bg-gray-300 w-9 h-9 rounded-full text-[16px] font-poppins font-regular transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next Button */}
      <button 
        className="bg-[#e9eceb] border border-[#e6e6e6] p-2 rounded-full"
        onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="-rotate-90">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default function BuyerDashboard() {
  const router = useRouter();
  const { userProfile, isLoggedIn, isLoading, getUserName } = useAuth();
  const { orders, pagination, loading: ordersLoading, loadOrders } = useOrders();
  const { cart, cartCount, loading: cartLoading, loadCart } = useCart();
  
  const [selectedMonth, setSelectedMonth] = useState("October");
  const [recentOrders, setRecentOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  // Load user orders when component mounts or page changes
  useEffect(() => {
    if (isLoggedIn && userProfile) {
      console.log('Dashboard: Loading user orders and cart...');
      loadUserOrders(currentPage);
      loadCart();
    }
  }, [isLoggedIn, userProfile, currentPage]);

  const loadUserOrders = async (page = 1) => {
    try {
      console.log('Dashboard: Calling loadOrders with page:', page);
      await loadOrders(page);
      console.log('Dashboard: Orders loaded:', orders);
    } catch (error) {
      console.error('Dashboard: Failed to load orders:', error);
    }
  };

  // Filter and prepare recent orders (last 5)
  useEffect(() => {
    console.log('Dashboard: Processing orders for display:', orders);
    if (orders && orders.length > 0) {
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      const recent = sortedOrders.slice(0, 5);
      console.log('Dashboard: Recent orders:', recent);
      setRecentOrders(recent);
    } else {
      console.log('Dashboard: No orders to display');
      setRecentOrders([]);
    }
  }, [orders]);

  // Get user data from auth
  const userData = {
    name: getUserName(),
    role: userProfile?.user_type === 'supplier' ? 'Vendor' : 'Customer',
    email: userProfile?.email || 'N/A',
    phone: userProfile?.phone || userProfile?.mobile || 'N/A',
    address: userProfile?.address || 'Address not provided',
    avatar: userProfile?.avatar || userProfile?.profile_image || "/sample1.jpg"
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (order) => {
    console.log('handleViewDetails: Processing order:', order);
    // Navigate to order details page using the order ID
    const orderId = order.id || order.order_id;
    if (orderId) {
      router.push(`/account/orders/${orderId}`);
    } else {
      console.error('No order ID found for navigation');
    }
  };

  // Show loading state
  if (isLoading || ordersLoading || cartLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show login redirect if not authenticated
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#e1e4e3]">
      <Navbar />
      
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-16 xl:px-[62px] pb-8">
        <div className="max-w-[1440px] mx-auto">
          
          {/* Profile Section */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Left Column - Profile Card */}
            <div className="bg-white border border-[#e6e6e6] rounded-[8px] p-8 flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Profile Image */}
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={userData.avatar} 
                    alt={userData.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="font-poppins font-medium text-[#1a1a1a] text-[20px] leading-[1.5] mb-1">
                    {userData.name}
                  </h1>
                  <p className="font-poppins font-regular text-[14px] text-gray-500 mb-4">
                    {userData.role}
                  </p>
                  
                  <div className="space-y-2 text-left">
                    <p className="font-poppins font-regular text-[#666666] text-[14px]">
                      {userData.address}
                    </p>
                    <p className="font-poppins font-regular text-[#1a1a1a] text-[16px]">
                      {userData.email}
                    </p>
                    <p className="font-poppins font-regular text-[#1a1a1a] text-[16px]">
                      {userData.phone}
                    </p>
                  </div>

                  <button className="mt-4 bg-[#272727] hover:bg-[#1a1a1a] text-white font-poppins font-semibold text-[12.8px] px-8 py-[12.8px] rounded-[34.4px] transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Stats */}
            <div className="flex flex-col gap-4 lg:w-[291px]">
              {/* Shopping Cart */}
              <div className="bg-white border border-[#e6e6e6] rounded-[8px] p-4 min-h-[200px] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-nunito font-semibold text-[#272727] text-[14px] tracking-[0.3px]">
                    Shopping Cart ({cartCount || 0})
                  </h3>
                  <button 
                    onClick={() => router.push('/cart')}
                    className="text-[#666666] hover:text-black text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                {cartLoading ? (
                  <div className="flex justify-center py-8 flex-1">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                ) : cart?.items && cart.items.length > 0 ? (
                  <div className="space-y-3 flex-1">
                    {cart.items.slice(0, 3).map((item, index) => (
                      <div key={item.id || index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                          <img 
                            src={item.product?.image || item.product?.images?.[0]?.url || item.image || '/spoons.png'} 
                            alt={item.product?.name || item.product_name || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/spoons.png';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {item.product?.name || item.product_name || 'Product'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          ₹{item.total_price || (item.unit_price * item.quantity) || 0}
                        </div>
                      </div>
                    ))}
                    {cart.items.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{cart.items.length - 3} more items
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 flex-1 flex flex-col justify-center">
                    <p className="text-sm text-gray-500 mb-2">Your cart is empty</p>
                    <button
                      onClick={() => router.push('/explore')}
                      className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-white border border-[#c6c6c6] rounded-[14px] p-6">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="font-inter font-semibold text-black text-[16px] mb-2">
                  Recent Orders
                </h2>
                <p className="font-inter font-medium text-[#909090] text-[15px]">
                  Your Latest Customer Orders
                </p>
              </div>

              {/* Month Selector */}
              <div className="relative">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-[#fcfdfd] border border-[#818181] rounded-[4px] px-3 py-2 text-[12px] text-[rgba(0,0,0,0.4)] font-reem appearance-none pr-8"
                >
                  <option value="October">October</option>
                  <option value="September">September</option>
                  <option value="August">August</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {console.log('Dashboard render: recentOrders:', recentOrders)}
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <OrderItem key={order.id || index} order={order} onViewDetails={handleViewDetails} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-4">No recent orders found</p>
                  <button
                    onClick={() => router.push('/explore')}
                    className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Pagination - only show if there are orders */}
            {recentOrders.length > 0 && (
              <Pagination 
                totalPages={pagination.pages || 1} 
                currentPage={currentPage} 
                onPageChange={handlePageChange} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <NewsletterSubscription />

      {/* Footer */}
      <Footer />
    </div>
  );
}
