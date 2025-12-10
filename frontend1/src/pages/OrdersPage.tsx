import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RotateCcw,
  Eye,
  Download,
  Star,
  Calendar,
  Filter,
  Leaf,
  ArrowRight,
  Loader2
} from 'lucide-react';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: ordersResponse, isLoading, refetch } = useQuery({
    queryKey: ['orders', user?.id, currentPage, selectedStatus],
    queryFn: async () => {
      if (!user) return null;
      return await backendApi.getOrders(currentPage, 10);
    },
    enabled: !!user
  });

  const orders = ordersResponse?.data || ordersResponse?.items || [];
  const totalOrders = ordersResponse?.total || 0;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-gray-100 text-gray-800',
    'in-transit': 'bg-yellow-100 text-yellow-800'
  };

  const statusIcons: Record<string, typeof Package> = {
    pending: Package,
    confirmed: Package,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
    returned: RotateCcw,
    'in-transit': Truck
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
      'in-transit': 'In Transit'
    };
    return statusMap[status] || status;
  };

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item: any) => 
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await backendApi.cancelOrder(orderId, 'Cancelled by user');
      toast({
        title: 'Order cancelled',
        description: 'Your order has been cancelled successfully.',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Please login to view your orders</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-forest" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  const ordersByStatus = {
    all: orders,
    pending: orders.filter((order: any) => order.status === 'pending'),
    confirmed: orders.filter((order: any) => ['confirmed', 'processing'].includes(order.status)),
    shipped: orders.filter((order: any) => ['shipped', 'in-transit'].includes(order.status)),
    delivered: orders.filter((order: any) => order.status === 'delivered'),
    cancelled: orders.filter((order: any) => order.status === 'cancelled')
  };

  const OrderCard = ({ order }: { order: any }) => {
    const StatusIcon = statusIcons[order.status] || Package;
    const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-800';
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">Order #{order.id?.substring(0, 8)}</h3>
                  <Badge className={`${statusColor} text-xs`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {getStatusText(order.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Ordered on {formatDate(order.created_at)}
                  </span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/orders?order_id=${order.id}`)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                {order.status === 'pending' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
                    className="text-destructive"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product?.image_url || '/api/placeholder/48/48'}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.product?.name || 'Product'}</div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </div>
                    </div>
                    <div className="text-right">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.status === 'shipped' || order.status === 'in-transit' ? (
              <div className="border-t pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/track-order?order_id=${order.id}`)}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-moss text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-headline font-bold">
              My Orders
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Track and manage your orders
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedStatus === 'all' 
                      ? "You haven't placed any orders yet."
                      : `You don't have any ${selectedStatus} orders.`}
                  </p>
                  <Button onClick={() => navigate('/products')}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: any) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {totalOrders > 10 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {currentPage} of {Math.ceil(totalOrders / 10)}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= Math.ceil(totalOrders / 10)}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
