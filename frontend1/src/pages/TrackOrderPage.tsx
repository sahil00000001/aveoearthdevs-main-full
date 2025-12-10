import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/services/backendApi';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  MapPin,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Leaf,
  Loader2
} from 'lucide-react';

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState(searchParams.get('order_id') || '');
  const [trackingNumber, setTrackingNumber] = useState('');

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      return await backendApi.getOrder(orderId);
    },
    enabled: !!orderId && !!user
  });

  const handleTrack = () => {
    if (!orderId && !trackingNumber) {
      toast({
        title: "Order ID or Tracking Number required",
        description: "Please enter an order ID or tracking number.",
        variant: "destructive",
      });
      return;
    }
    
    if (orderId) {
      refetch();
    } else if (trackingNumber) {
      setOrderId(trackingNumber);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, typeof Package> = {
      pending: Clock,
      confirmed: Package,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      returned: RefreshCw
    };
    return icons[status] || Package;
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned'
    };
    return statusMap[status] || status;
  };

  const buildTimeline = (order: any) => {
    const timeline = [];
    
    if (order.created_at) {
      timeline.push({
        status: 'confirmed',
        timestamp: order.created_at,
        description: 'Order confirmed',
        location: 'Order Center'
      });
    }

    if (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
      timeline.push({
        status: 'processing',
        timestamp: order.updated_at || order.created_at,
        description: 'Order being processed',
        location: 'Warehouse'
      });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      timeline.push({
        status: 'shipped',
        timestamp: order.updated_at || order.created_at,
        description: 'Package shipped',
        location: 'Origin Warehouse'
      });
    }

    if (order.status === 'delivered') {
      timeline.push({
        status: 'delivered',
        timestamp: order.updated_at || order.created_at,
        description: 'Package delivered',
        location: 'Customer Address'
      });
    }

    if (order.status === 'cancelled') {
      timeline.push({
        status: 'cancelled',
        timestamp: order.updated_at || order.created_at,
        description: 'Order cancelled',
        location: 'Order Center'
      });
    }

    return timeline.reverse();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-forest" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-moss text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-headline font-bold">
              Track Your Order
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Track your order status and delivery
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/orders')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Track Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="order-id">Order ID</Label>
                <Input
                  id="order-id"
                  placeholder="Enter Order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleTrack}>
                  <Search className="w-4 h-4 mr-2" />
                  Track
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load order details'}
            </AlertDescription>
          </Alert>
        )}

        {order && (
          <div className="space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order #{order.id?.substring(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  {(() => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <Badge className={`${getStatusColor(order.status)} text-sm`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {getStatusText(order.status)}
                      </Badge>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="text-xl font-bold">{formatPrice(order.total_amount)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Status</Label>
                    <p className="text-lg font-semibold capitalize">{order.payment_status || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Method</Label>
                    <p className="text-lg font-semibold">{order.payment_method || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buildTimeline(order).map((event, index) => {
                    const StatusIcon = getStatusIcon(event.status);
                    const isLast = index === 0;
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isLast ? 'bg-forest text-white' : 'bg-muted text-muted-foreground'
                          }`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          {!isLast && <div className="w-0.5 h-full bg-border mt-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="font-semibold">{event.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(event.timestamp)}
                          </div>
                          {event.location && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 border-b pb-4 last:border-b-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.product?.image_url || '/api/placeholder/64/64'}
                          alt={item.product?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.product?.name || 'Product'}</div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div className="text-right font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-forest" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                    <br />
                    {order.shipping_address.address_line_1}
                    {order.shipping_address.address_line_2 && (
                      <><br />{order.shipping_address.address_line_2}</>
                    )}
                    <br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    <br />
                    {order.shipping_address.country}
                    {order.shipping_address.phone && (
                      <><br />{order.shipping_address.phone}</>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!order && !isLoading && !error && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No order found</h3>
              <p className="text-muted-foreground mb-4">
                Enter an order ID above to track your order.
              </p>
              <Button onClick={() => navigate('/orders')}>
                View All Orders
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
