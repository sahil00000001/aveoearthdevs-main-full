"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Navbar from "../../../../components/layout/Navbar";
import Footer from "../../../../components/layout/Footer";
import { useOrders } from "../../../../hooks/useOrders";
import { useAuth } from "../../../../hooks/useAuth";

// Back arrow icon
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M4.20996 4.412L9.79796 9.999L4.20996 15.587" 
      stroke="#858C94" 
      strokeWidth="1.6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      transform="rotate(180 8 8)"
    />
  </svg>
);

// Order status timeline
const OrderTimeline = ({ order }) => {
  const statuses = [
    { key: 'pending', label: 'Order Placed', icon: '📋' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '📦' },
    { key: 'cancelled', label: 'Cancelled', icon: '❌' }
  ];

  // Calculate overall order status based on item fulfillment statuses
  const calculateOverallStatus = (order) => {
    if (!order?.items || order.items.length === 0) {
      return order?.status || 'pending';
    }

    const itemStatuses = order.items.map(item => item.fulfillment_status?.toLowerCase());
    
    // Priority order: cancelled > delivered > shipped > processing > confirmed > pending
    if (itemStatuses.includes('cancelled')) {
      return 'cancelled';
    } else if (itemStatuses.includes('delivered')) {
      return 'delivered';
    } else if (itemStatuses.includes('shipped')) {
      return 'shipped';
    } else if (itemStatuses.includes('processing')) {
      return 'processing';
    } else if (itemStatuses.includes('confirmed')) {
      return 'confirmed';
    } else {
      return 'pending';
    }
  };

  const overallStatus = calculateOverallStatus(order);
  const currentStatusIndex = statuses.findIndex(s => s.key === overallStatus.toLowerCase());

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
      <div className="space-y-4">
        {statuses.map((status, index) => {
          // Only show cancelled status if the order is actually cancelled
          if (status.key === 'cancelled' && overallStatus !== 'cancelled') {
            return null;
          }
          
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const isCancelled = status.key === 'cancelled';
          
          return (
            <div key={status.key} className="flex items-center">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                isCancelled 
                  ? 'bg-red-100 text-red-800 border-2 border-red-200'
                  : isCompleted 
                  ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }`}>
                {status.icon}
              </div>
              <div className="ml-4 flex-1">
                <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {status.label}
                </p>
                {isCurrent && !isCancelled && (
                  <p className="text-sm text-green-600 font-medium">Current Status</p>
                )}
                {isCurrent && isCancelled && (
                  <p className="text-sm text-red-600 font-medium">Order Cancelled</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Order item component
const OrderItem = ({ item }) => {
  // Get consistent product image
  const getProductImage = () => {
    if (item.product?.image) return item.product.image;
    if (item.product?.images && item.product.images.length > 0) {
      return item.product.images[0].url;
    }
    return item.image || '/placeholder-product.jpg';
  };

  // Get consistent product name
  const getProductName = () => {
    return item.product_name || item.product?.name || item.name || 'Product';
  };

  // Get fulfillment status color
  const getFulfillmentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-shrink-0">
        <img
          src={getProductImage()}
          alt={getProductName()}
          className="w-16 h-16 object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {getProductName()}
        </h4>
        <p className="text-sm text-gray-500">
          Quantity: {item.quantity}
        </p>
        <div className="mt-2">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getFulfillmentStatusColor(item.fulfillment_status)}`}>
            {item.fulfillment_status || 'Pending'}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900">
          ₹{((item.unit_price || item.price || 0) * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.orderId; // This is actually the order_number from URL
  const { orders, loadOrders, loadOrderDetails: loadOrderDetailsFromHook, loadOrderPayments, createReturn, loading } = useOrders();
  const { isLoggedIn, userProfile, isLoading, isClient } = useAuth();
  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [orderId, setOrderId] = useState(null); // Store the actual order_id

  // Calculate overall order status based on item fulfillment statuses
  const calculateOverallStatus = (order) => {
    if (!order?.items || order.items.length === 0) {
      return order?.status || 'pending';
    }

    const itemStatuses = order.items.map(item => item.fulfillment_status?.toLowerCase());
    
    // Priority order: cancelled > delivered > shipped > processing > confirmed > pending
    if (itemStatuses.includes('cancelled')) {
      return 'cancelled';
    } else if (itemStatuses.includes('delivered')) {
      return 'delivered';
    } else if (itemStatuses.includes('shipped')) {
      return 'shipped';
    } else if (itemStatuses.includes('processing')) {
      return 'processing';
    } else if (itemStatuses.includes('confirmed')) {
      return 'confirmed';
    } else {
      return 'pending';
    }
  };

  const overallStatus = order ? calculateOverallStatus(order) : 'pending';

  useEffect(() => {
    console.log('OrderDetailsPage: Auth state - isLoggedIn:', isLoggedIn, 'userProfile:', !!userProfile, 'isLoading:', isLoading, 'isClient:', isClient, 'orderNumber:', orderNumber);
    
    if (isClient && !isLoading) {
      if (isLoggedIn && userProfile && orderNumber) {
        console.log('OrderDetailsPage: Loading order details...');
        // Load orders first if not loaded
        if (orders.length === 0) {
          loadOrders(1, 100).then(() => {
            loadOrderDetails();
          });
        } else {
          loadOrderDetails();
        }
      } else if (!isLoggedIn) {
        console.log('OrderDetailsPage: Not logged in, redirecting to login...');
        router.push('/login');
      }
    }
  }, [isLoggedIn, userProfile, orderNumber, isLoading, isClient, orders]);

  // Auto-refresh order status for active orders
  useEffect(() => {
    if (!order || !orderId) return;

    const shouldAutoRefresh = ['pending', 'confirmed', 'processing', 'shipped'].includes(overallStatus.toLowerCase()) && overallStatus !== 'cancelled';
    
    if (!shouldAutoRefresh) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing order status...');
      loadOrderDetails();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [overallStatus, orderId]);

  const loadOrderDetails = async () => {
    try {
      // If orders are not loaded yet, load them first
      if (orders.length === 0) {
        console.log('Loading orders to find order with number:', orderNumber);
        await loadOrders(1, 100); // Load more orders to ensure we find the right one
      }
      
      // Find the order with matching order_number from the loaded orders
      const matchingOrder = orders.find(order => order.order_number === orderNumber);
      
      if (!matchingOrder) {
        console.error('Order not found with order_number:', orderNumber, 'Available orders:', orders.map(o => o.order_number));
        return;
      }
      
      const actualOrderId = matchingOrder.id;
      console.log('Found order with ID:', actualOrderId);
      setOrderId(actualOrderId);
      
      // Now load the order details using the actual order_id
      const orderDetails = await loadOrderDetailsFromHook(actualOrderId);
      console.log('Order details loaded:', orderDetails);
      console.log('Order status:', orderDetails?.status);
      setOrder(orderDetails);
      
      // Load payment details
      const paymentDetails = await loadOrderPayments(actualOrderId);
      setPayments(paymentDetails);
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const handleGoBack = () => {
    router.push('/account/dashboard');
  };

  const handleInitiateReturn = async () => {
    try {
      if (!orderId) return;
      await createReturn(orderId, {
        reason: 'Product not as described',
        comment: 'Requesting return'
      });
      setShowReturnModal(false);
      loadOrderDetails(); // Refresh order data
    } catch (error) {
      console.error('Error initiating return:', error);
    }
  };

  const handleTrackOrder = () => {
    // Navigate to tracking page
    console.log('handleTrackOrder called with orderId:', orderId);
    if (orderId) {
      router.push(`/account/orders/${orderId}/track`);
    } else {
      console.error('orderId is not available for tracking');
    }
  };

  if (!isClient || isLoading) {
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

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  if (loading || !order) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={handleGoBack}
            className="bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm mb-4"
          >
            <ArrowLeftIcon />
            <span className="font-medium">Back to Orders</span>
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.order_number || order.id}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadOrderDetails}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Status'}
              </button>
              {['pending', 'confirmed', 'processing', 'shipped'].includes(overallStatus.toLowerCase()) && overallStatus !== 'cancelled' && (
                <button
                  onClick={handleTrackOrder}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Track Order
                </button>
              )}
              {overallStatus === 'delivered' && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Return Items
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              </div>
              <div>
                {order.items?.map((item, index) => (
                  <OrderItem key={index} item={item} />
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                </p>
                <p>{order.shipping_address?.address_line_1}</p>
                {order.shipping_address?.address_line_2 && (
                  <p>{order.shipping_address?.address_line_2}</p>
                )}
                <p>
                  {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
                </p>
                <p>{order.shipping_address?.country}</p>
                {order.shipping_address?.phone && (
                  <p className="mt-2">Phone: {order.shipping_address?.phone}</p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              {payments.length > 0 ? (
                <div className="space-y-2">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {payment.payment_method} - {payment.status}
                      </span>
                      <span className="font-medium">₹{payment.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Payment information not available</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Timeline */}
            <OrderTimeline order={order} />

            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>₹{(order.shipping_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>₹{(order.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>₹{(order.total_amount || order.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Items</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to initiate a return for this order? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReturnModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiateReturn}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
