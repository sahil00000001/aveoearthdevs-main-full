import { useState } from 'react';
import supplierOrdersService from '../../../services/supplierOrdersService';

export default function OrderRow({ order, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const handleStatusChange = async (newStatus) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      
      // Map frontend status values to API expected values
      const statusMapping = {
        'pending': 'pending',
        'confirmed': 'processing', // Map confirmed to processing
        'processing': 'processing',
        'shipped': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled'
      };
      
      const apiStatus = statusMapping[newStatus] || 'pending';
      
      await supplierOrdersService.updateOrderFulfillment(order.originalOrder.id, {
        fulfillment_status: apiStatus
      });

      // Notify parent component of status update
      if (onStatusUpdate) {
        onStatusUpdate(order.originalOrder.id, newStatus);
      }

      // Update local order status
      order.status = newStatus;
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewDetails = async () => {
    if (showDetails) {
      setShowDetails(false);
      return;
    }

    try {
      const details = await supplierOrdersService.getOrderItem(order.originalOrder.id);
      setOrderDetails(details);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      alert('Failed to load order details. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white rounded-[14px] border-[0.7px] border-[#989898] p-3 sm:p-4 mb-3 sm:mb-4">
        {/* Mobile Layout - Stacked */}
        <div className="block sm:hidden space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-reem font-medium text-[14px] text-black mb-1">{order.id}</div>
              <div className="font-poppins font-medium text-[13px] text-black">{order.product}</div>
              <div className="font-poppins font-medium text-[11px] text-[#8b8b8b]">{order.market}</div>
            </div>
            <div className="text-right">
              <div className="font-poppins font-medium text-[13px] text-black mb-1">₹{order.total.replace('$$', '')}</div>
              <div className="font-poppins font-medium text-[11px] text-black">{order.date}</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="font-poppins font-medium text-[11px] text-black">{order.items}</div>
            <div className="flex items-center gap-2">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className={`px-2 py-1 rounded text-xs font-medium border-0 ${getStatusColor(order.status)} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleViewDetails}
                className="bg-[#fcfdfd] border-[0.6px] border-[#818181] rounded-[4px] px-2 py-1 hover:bg-gray-50 transition-colors"
              >
                <span className="font-reem text-[11px] text-[#969696]">
                  {showDetails ? 'Hide' : 'View'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Grid */}
        <div className="hidden sm:flex items-center">
          {/* Order ID */}
          <div className="w-[120px] text-center">
            <span className="font-reem font-medium text-[14px] text-black">{order.id}</span>
          </div>

          {/* Product Info */}
          <div className="w-[180px] text-center">
            <div className="flex flex-col items-center">
              <span className="font-poppins font-medium text-[14px] text-black">{order.product}</span>
              <span className="font-poppins font-medium text-[12px] text-[#8b8b8b]">{order.market}</span>
            </div>
          </div>

          {/* Items */}
          <div className="w-[120px] text-center">
            <span className="font-poppins font-medium text-[12px] text-black">{order.items}</span>
          </div>

          {/* Total */}
          <div className="w-[120px] text-center">
            <span className="font-poppins font-medium text-[12px] text-black">₹{order.total.replace('$$', '')}</span>
          </div>

          {/* Date */}
          <div className="w-[120px] text-center">
            <span className="font-poppins font-medium text-[12px] text-black">{order.date}</span>
          </div>

          {/* Status */}
          <div className="w-[120px] text-center">
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className={`px-2 py-1 rounded text-xs font-medium border-0 ${getStatusColor(order.status)} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Action */}
          <div className="w-[120px] text-center">
            <button
              onClick={handleViewDetails}
              className="bg-[#fcfdfd] border-[0.6px] border-[#818181] rounded-[4px] px-3 py-1 hover:bg-gray-50 transition-colors"
            >
              <span className="font-reem text-[12px] text-[#969696]">
                {showDetails ? 'Hide Details' : 'View Details'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Order Details */}
      {showDetails && orderDetails && (
        <div className="bg-gray-50 rounded-[14px] border border-[#c6c6c6] p-4 sm:p-6 mb-3 sm:mb-4 ml-0 sm:ml-8">
          <h4 className="font-inter font-semibold text-[14px] sm:text-[16px] text-black mb-3 sm:mb-4">Order Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Customer:</span>
              <span className="ml-2 text-gray-900">
                {orderDetails.order?.shipping_address?.first_name && orderDetails.order?.shipping_address?.last_name
                  ? `${orderDetails.order.shipping_address.first_name} ${orderDetails.order.shipping_address.last_name}`
                  : orderDetails.order?.billing_address?.first_name && orderDetails.order?.billing_address?.last_name
                  ? `${orderDetails.order.billing_address.first_name} ${orderDetails.order.billing_address.last_name}`
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Email:</span>
              <span className="ml-2 text-gray-900">
                {orderDetails.order?.shipping_address?.email || orderDetails.order?.billing_address?.email || 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Phone:</span>
              <span className="ml-2 text-gray-900">
                {orderDetails.order?.shipping_address?.phone || orderDetails.order?.billing_address?.phone || 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Address:</span>
              <span className="ml-2 text-gray-900">
                {orderDetails.order?.shipping_address
                  ? `${orderDetails.order.shipping_address.address_line_1 || ''}${orderDetails.order.shipping_address.address_line_2 ? ', ' + orderDetails.order.shipping_address.address_line_2 : ''}, ${orderDetails.order.shipping_address.city || ''}, ${orderDetails.order.shipping_address.state || ''} ${orderDetails.order.shipping_address.postal_code || ''}`
                  : 'N/A'}
              </span>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <span className="font-medium text-gray-600">Notes:</span>
              <span className="ml-2 text-gray-900">
                {orderDetails.order?.customer_notes || 'No notes'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
