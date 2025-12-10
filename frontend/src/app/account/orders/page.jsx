"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import { useOrders } from "../../../hooks/useOrders";
import { useAuth } from "../../../hooks/useAuth";

// Order status badge component
const OrderStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

// Order card component
const OrderCard = ({ order, onViewDetails }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-poppins font-semibold text-gray-900 text-lg">
            Order #{order.order_number || order.order_id || order.id}
          </h3>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items:</span>
          <span className="font-medium">{order.items_count || order.total_items || order.items?.length || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold text-gray-900">
            ₹{(order.total_amount || order.total || 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onViewDetails(order)}
          className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          View Details
        </button>
        {order.status === 'delivered' && (
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Return
          </button>
        )}
      </div>
    </div>
  );
};

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loading, loadOrders } = useOrders();
  const { isLoggedIn, userProfile } = useAuth();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isLoggedIn && userProfile) {
      loadOrders();
    } else if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, userProfile, loadOrders, router]);

  useEffect(() => {
    if (orders) {
      if (statusFilter === 'all') {
        setFilteredOrders(orders);
      } else {
        setFilteredOrders(orders.filter(order => 
          order.status?.toLowerCase() === statusFilter.toLowerCase()
        ));
      }
    }
  }, [orders, statusFilter]);

  const handleViewDetails = (order) => {
    router.push(`/account/orders/${order.order_number || order.order_id || order.id}`);
  };

  const orderStatuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' }
  ];

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {orderStatuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === status.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.order_id || order.id}
                order={order}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No orders found' : `No ${statusFilter} orders`}
            </h3>
            <p className="text-gray-500 mb-6">
              {statusFilter === 'all' 
                ? "You haven't placed any orders yet." 
                : `You don't have any ${statusFilter} orders.`
              }
            </p>
            <button
              onClick={() => router.push('/explore')}
              className="bg-gray-900 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
