import React, { useState, useEffect } from 'react';
import OrderTableHeader from './OrderTableHeader';
import OrderRow from './OrderRow';
import supplierOrdersService from '../../../services/supplierOrdersService';

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0
  });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        page_size: pagination.page_size
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const result = await supplierOrdersService.getOrders(params);
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

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (newStatus) => {
    setStatusFilter(newStatus);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filter changes
  };

  const handleStatusUpdate = (orderItemId, newStatus) => {
    // Update the order status in the local state
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderItemId
          ? { ...order, fulfillment_status: newStatus }
          : order
      )
    );
  };

  const formatOrderId = (id) => {
    return `ORD-${id?.slice(-6)?.toUpperCase() || 'XXXXXX'}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0).replace('₹', '₹');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-[14px] border border-[#c6c6c6] overflow-hidden">
        <OrderTableHeader />
        <div className="p-4 sm:p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border-b">
                <div className="flex-1 space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 sm:w-20 h-3 sm:h-4 bg-gray-200 rounded"></div>
                <div className="w-12 sm:w-16 h-3 sm:h-4 bg-gray-200 rounded"></div>
                <div className="w-16 sm:w-20 h-4 sm:h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[14px] border border-[#c6c6c6] p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load orders: {error}</p>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[14px] border border-[#c6c6c6]">
      {/* Table Header */}
      <div className="p-4 sm:p-7 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
          <h3 className="font-inter font-semibold text-[14px] sm:text-[16px] text-black">
            All Orders ({pagination.total})
          </h3>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="bg-[#fcfdfd] border-[0.6px] border-[#818181] rounded-[4px] px-3 py-2 text-[12px] sm:text-[14px] text-[rgba(0,0,0,0.4)] font-reem w-full sm:w-auto"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <OrderTableHeader />
      </div>

      {/* Table Body */}
      <div className="px-4 sm:px-7 pb-4 sm:pb-7 space-y-3 sm:space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {statusFilter ? `No ${statusFilter} orders found` : 'No orders found'}
            </p>
          </div>
        ) : (
          orders.map((order, index) => {
            // Transform order data to match OrderRow expectations
            const transformedOrder = {
              id: formatOrderId(order.order_id),
              product: order.product_name,
              market: order.sku, // Using SKU as market identifier
              items: `${order.quantity} Items`,
              total: formatCurrency(order.total_price),
              date: formatDate(order.created_at),
              status: order.fulfillment_status || 'pending',
              originalOrder: order // Keep original data for actions
            };
            
            return <OrderRow key={`${order.id}-${index}`} order={transformedOrder} onStatusUpdate={handleStatusUpdate} />;
          })
        )}
      </div>
      
      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-2 pb-4">
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.total_pages}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
