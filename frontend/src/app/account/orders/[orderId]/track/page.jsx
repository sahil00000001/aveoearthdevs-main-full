"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Navbar from "../../../../../components/layout/Navbar";
import Footer from "../../../../../components/layout/Footer";
import { useOrders } from "../../../../../hooks/useOrders";
import { useAuth } from "../../../../../hooks/useAuth";

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

// Tracking timeline component
const TrackingTimeline = ({ trackingData, order }) => {
  // Create timeline events based on order status and shipments
  const createTimelineEvents = () => {
    const events = [];
    
    // Always show order placed
    events.push({
      status: 'Order Placed',
      description: 'Your order has been received and is being processed',
      timestamp: order?.created_at || new Date().toISOString(),
      location: 'Online Store'
    });
    
    // Add events based on order status
    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order?.status?.toLowerCase())) {
      events.push({
        status: 'Order Confirmed',
        description: 'Your order has been confirmed and is being prepared',
        timestamp: order?.created_at || new Date().toISOString(),
        location: 'Warehouse'
      });
    }
    
    if (['processing', 'shipped', 'delivered'].includes(order?.status?.toLowerCase())) {
      events.push({
        status: 'Processing',
        description: 'Your order is being processed for shipment',
        timestamp: order?.created_at || new Date().toISOString(),
        location: 'Warehouse'
      });
    }
    
    if (['shipped', 'delivered'].includes(order?.status?.toLowerCase())) {
      events.push({
        status: 'Shipped',
        description: 'Your order has been shipped and is on the way',
        timestamp: new Date().toISOString(),
        location: 'Distribution Center'
      });
    }
    
    if (order?.status?.toLowerCase() === 'delivered') {
      events.push({
        status: 'Delivered',
        description: 'Your order has been successfully delivered',
        timestamp: order?.delivered_at || new Date().toISOString(),
        location: 'Delivery Address'
      });
    }
    
    return events;
  };

  const trackingEvents = createTimelineEvents();

  return (
    <div className="space-y-6">
      {trackingEvents.map((event, index) => (
        <div key={index} className="relative">
          {/* Timeline line */}
          {index < trackingEvents.length - 1 && (
            <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
          )}
          
          <div className="flex items-start space-x-4">
            {/* Timeline dot */}
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            
            {/* Event details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">{event.status}</h4>
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              {event.location && (
                <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Shipping details component
const ShippingDetails = ({ order, trackingData }) => {
  const shipments = trackingData?.shipments || [];
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Details</h3>
      
      {shipments.length > 0 ? (
        <div className="space-y-6">
          {shipments.map((shipment, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tracking Number</label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded mt-1">
                    {shipment.tracking_number || 'Not available'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Carrier</label>
                    <p className="text-sm text-gray-900">{shipment.carrier || 'Standard Delivery'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Service</label>
                    <p className="text-sm text-gray-900">{shipment.carrier_service || 'Standard'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Shipping Cost</label>
                    <p className="text-sm text-gray-900">₹{shipment.shipping_cost?.toFixed(2) || '0.00'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Estimated Delivery</label>
                    <p className="text-sm text-gray-900">
                      {shipment.estimated_delivery_date 
                        ? new Date(shipment.estimated_delivery_date).toLocaleDateString()
                        : 'To be determined'
                      }
                    </p>
                  </div>
                </div>
                
                {(shipment.weight || shipment.length || shipment.width || shipment.height) && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Package Details</label>
                    <div className="text-sm text-gray-900 mt-1 grid grid-cols-2 gap-2">
                      {shipment.weight && <span>Weight: {shipment.weight}kg</span>}
                      {shipment.length && shipment.width && shipment.height && (
                        <span>Dimensions: {shipment.length}×{shipment.width}×{shipment.height}cm</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Items in This Shipment</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {shipment.order_item_ids?.length || 0} item(s)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tracking Number</label>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded mt-1">
              {order?.order_number || 'Not available'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Carrier</label>
            <p className="text-sm text-gray-900">Standard Delivery</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Estimated Delivery</label>
            <p className="text-sm text-gray-900">To be determined</p>
          </div>
        </div>
      )}
      
      {/* Delivery Address */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <label className="text-sm font-medium text-gray-700">Delivery Address</label>
        <div className="text-sm text-gray-900 mt-1">
          <p>{order?.shipping_address?.first_name} {order?.shipping_address?.last_name}</p>
          <p>{order?.shipping_address?.address_line_1}</p>
          {order?.shipping_address?.address_line_2 && (
            <p>{order?.shipping_address?.address_line_2}</p>
          )}
          <p>
            {order?.shipping_address?.city}, {order?.shipping_address?.state} {order?.shipping_address?.postal_code}
          </p>
          <p>{order?.shipping_address?.country}</p>
          {order?.shipping_address?.phone && (
            <p className="mt-1">Phone: {order?.shipping_address?.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TrackOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId;
  const { loadOrderDetails, trackOrder, loading } = useOrders();
  const { isLoggedIn, userProfile } = useAuth();
  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);

  console.log('TrackOrderPage - orderId:', orderId, 'isLoggedIn:', isLoggedIn);

  useEffect(() => {
    if (isLoggedIn && orderId) {
      console.log('TrackOrderPage - Loading order and tracking data...');
      loadOrderAndTracking();
    } else if (!isLoggedIn) {
      console.log('TrackOrderPage - Not logged in, redirecting to login');
      router.push('/login');
    } else {
      console.log('TrackOrderPage - Missing orderId or not logged in');
    }
  }, [isLoggedIn, orderId]);

  const loadOrderAndTracking = async () => {
    try {
      console.log('Loading order details for tracking page...');
      const orderDetails = await loadOrderDetails(orderId);
      console.log('Order details loaded:', orderDetails);
      setOrder(orderDetails);
      
      // Try to load tracking data, but don't fail if it's not available
      try {
        console.log('Loading tracking data...');
        const tracking = await trackOrder(orderId);
        console.log('Tracking data loaded:', tracking);
        setTrackingData(tracking);
      } catch (trackingError) {
        console.warn('Tracking data not available:', trackingError);
        // Set default tracking data
        setTrackingData({
          events: [
            {
              status: 'Order Placed',
              description: 'Your order has been received and is being processed',
              timestamp: orderDetails?.created_at || new Date().toISOString(),
              location: 'Online Store'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const handleGoBack = () => {
    router.push(`/account/orders/${orderId}`);
  };

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
        <div className="mb-8">
          <button 
            onClick={handleGoBack}
            className="bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm mb-4"
          >
            <ArrowLeftIcon />
            <span className="font-medium">Back to Order Details</span>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Track Order #{trackingData?.order_number || order?.order_number || order?.order_id || order?.id}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Tracking Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking History</h3>
              <TrackingTimeline trackingData={trackingData} order={order} />
            </div>
          </div>

          {/* Right Column - Shipping Details */}
          <div>
            <ShippingDetails order={order} trackingData={trackingData} />
            
            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize">{trackingData?.status || order?.status || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span>{order?.items_count || order?.total_items || order?.items?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">₹{(order?.total_amount || order?.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-4">
                If you have questions about your order or tracking, we're here to help.
              </p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
