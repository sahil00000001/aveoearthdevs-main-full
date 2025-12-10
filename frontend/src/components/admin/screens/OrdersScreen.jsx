"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TruckIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from "@heroicons/react/24/outline";
import adminService from "@/services/adminService";

export default function OrdersScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Data state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await adminService.getAllOrders({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      
      setOrders(result.items || []);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0,
        total_pages: result.total_pages || 0
      }));
      
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setOrderItems(order.items || []);
    setShowOrderModal(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      // Refresh orders
      await fetchOrders();
      
      // Update selected order if modal is open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800', text: 'Processing' },
      shipped: { color: 'bg-indigo-100 text-indigo-800', text: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      refunded: { color: 'bg-gray-100 text-gray-800', text: 'Refunded' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-black">Orders Management</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-12 rounded-lg mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-black">Orders Management</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load orders: {error}</p>
          <button 
            onClick={fetchOrders}
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
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Orders Management</h1>
        <button 
          onClick={fetchOrders}
          className="bg-[#1a4032] hover:bg-[#0f2319] text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by order number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.order_number || order.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.shipping_address?.name || 'Unknown Customer'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shipping_address?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(order.total_amount || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.payment_status || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openOrderModal(order)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Order Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Confirm Order"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}
                        {['confirmed', 'processing'].includes(order.status) && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="Mark as Shipped"
                          >
                            <TruckIcon className="h-4 w-4" />
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Cancel Order"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.total_pages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Details: #{selectedOrder.order_number || selectedOrder.id}
            </h3>
            
            {/* Order Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Information</h4>
                  <p className="text-sm text-gray-600">Order ID: {selectedOrder.id}</p>
                  <p className="text-sm text-gray-600">
                    Order Number: #{selectedOrder.order_number || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {getStatusBadge(selectedOrder.status)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                  <p className="text-sm text-gray-600">
                    Name: {selectedOrder.shipping_address?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {selectedOrder.shipping_address?.email || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {selectedOrder.shipping_address?.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment & Shipping</h4>
                  <p className="text-sm text-gray-600">
                    Total: ₹{(selectedOrder.total_amount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment: {selectedOrder.payment_status || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment Status: {selectedOrder.payment_status || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shipping_address && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                <div className="text-sm text-gray-600">
                  <p>{selectedOrder.shipping_address.name}</p>
                  <p>{selectedOrder.shipping_address.street_address}</p>
                  <p>
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                  </p>
                  <p>{selectedOrder.shipping_address.country}</p>
                  {selectedOrder.shipping_address.phone && <p>Phone: {selectedOrder.shipping_address.phone}</p>}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
              
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No items found for this order</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={item.id || index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 h-16 w-16">
                        {item.product_image ? (
                          <img 
                            className="h-16 w-16 rounded-lg object-cover" 
                            src={item.product_image} 
                            alt={item.product_name || 'Product'} 
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h5 className="font-medium text-gray-900">
                          {item.product_name || 'Unknown Product'}
                        </h5>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity || 1}
                        </p>
                        <p className="text-sm text-gray-600">
                          Price: ₹{(item.unit_price || 0).toLocaleString()} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ₹{((item.unit_price || 0) * (item.quantity || 1)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Update Actions */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Confirm Order
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                  >
                    Start Processing
                  </button>
                )}
                {['confirmed', 'processing'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
                {!['cancelled', 'delivered', 'refunded'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                  setOrderItems([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
