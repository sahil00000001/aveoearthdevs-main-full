import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import { vendorOrderService, VendorOrder, OrderStats } from '@/services/vendorOrderService';
import { 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  RefreshCw
} from 'lucide-react';

const VendorOrdersPage = () => {
  const { vendor, isAuthenticated } = useVendorAuth();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');

  useEffect(() => {
    // Load data immediately if vendor session exists (for mock version)
    const session = localStorage.getItem('vendorSession');
    if (session || vendor?.id) {
      loadOrders();
      loadStats();
    }
  }, [vendor, currentPage, searchTerm, statusFilter, paymentStatusFilter]);

  const loadOrders = async () => {
    // Use mock vendor ID if no vendor from auth
    const vendorId = vendor?.id || 'mock-vendor-1';
    
    setIsLoading(true);
    try {
      // Simulate a quick load for mock data
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { orders: orderList, total } = await vendorOrderService.getOrders(vendorId, {
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        payment_status: paymentStatusFilter === 'all' ? undefined : paymentStatusFilter,
        page: currentPage,
        limit: 10
      });
      setOrders(orderList);
      setTotalOrders(total);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    // Use mock vendor ID if no vendor from auth
    const vendorId = vendor?.id || 'mock-vendor-1';
    
    try {
      const orderStats = await vendorOrderService.getOrderStats(vendorId, 'month');
      setStats(orderStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      // Simulate a quick update for mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = await vendorOrderService.updateOrderStatus(orderId, newStatus, updateNotes);
      if (success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any, notes: updateNotes }
            : order
        ));
        setUpdateNotes('');
        setIsDialogOpen(false);
        setSelectedOrder(null);
        alert('Order status updated successfully!');
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTrackingUpdate = async (orderId: string) => {
    if (!trackingNumber || !carrier) return;

    setIsUpdating(true);
    try {
      // Simulate a quick update for mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = await vendorOrderService.updateTrackingInfo(orderId, trackingNumber, carrier);
      if (success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                tracking_number: trackingNumber,
                shipping_carrier: carrier,
                status: 'shipped'
              }
            : order
        ));
        setTrackingNumber('');
        setCarrier('');
        setIsDialogOpen(false);
        setSelectedOrder(null);
        alert('Tracking information updated successfully!');
      } else {
        alert('Failed to update tracking information');
      }
    } catch (error) {
      console.error('Error updating tracking info:', error);
      alert('Error updating tracking information');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setIsUpdating(true);
    try {
      const success = await vendorOrderService.cancelOrder(orderId, 'Cancelled by vendor');
      if (success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        ));
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'returned': return <RefreshCw className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      case 'partially_refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <p className="text-forest text-lg">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-forest mb-2">Order Management</h1>
          <p className="text-muted-foreground">Manage and track your orders</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-forest">{stats.total_orders}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-forest" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-forest">₹{stats.total_revenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-forest" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                    <p className="text-2xl font-bold text-forest">₹{stats.average_order_value.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-forest" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-forest">{stats.orders_this_month}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-forest" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-forest">{order.order_number}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </Badge>
                          <Badge className={getPaymentStatusColor(order.payment_status)}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span>{order.customer_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold text-forest">₹{order.total_amount.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>{order.items.length} item(s)</span>
                          </div>
                        </div>

                        {order.tracking_number && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Tracking:</span> {order.tracking_number} ({order.shipping_carrier})
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            disabled={isUpdating}
                          >
                            Confirm
                          </Button>
                        )}
                        
                        {order.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(order.id, 'processing')}
                            disabled={isUpdating}
                          >
                            Process
                          </Button>
                        )}
                        
                        {order.status === 'processing' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDialogOpen(true);
                            }}
                            disabled={isUpdating}
                          >
                            Ship
                          </Button>
                        )}
                        
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isUpdating}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No orders found</h3>
                <p className="text-gray-500">Orders will appear here when customers place them</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalOrders > 10 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalOrders / 10)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalOrders / 10), prev + 1))}
                disabled={currentPage >= Math.ceil(totalOrders / 10)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Number:</span>
                      <span className="font-medium">{selectedOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>
                        {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-bold text-forest">₹{selectedOrder.total_amount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{selectedOrder.customer_phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.unit_price.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="font-bold text-forest">₹{item.total_price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {selectedOrder.addresses && selectedOrder.addresses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.addresses.find(addr => addr.type === 'shipping') && (
                      <div className="space-y-1">
                        <p className="font-medium">
                          {selectedOrder.addresses.find(addr => addr.type === 'shipping')?.first_name} {selectedOrder.addresses.find(addr => addr.type === 'shipping')?.last_name}
                        </p>
                        <p>{selectedOrder.addresses.find(addr => addr.type === 'shipping')?.address_line_1}</p>
                        {selectedOrder.addresses.find(addr => addr.type === 'shipping')?.address_line_2 && (
                          <p>{selectedOrder.addresses.find(addr => addr.type === 'shipping')?.address_line_2}</p>
                        )}
                        <p>
                          {selectedOrder.addresses.find(addr => addr.type === 'shipping')?.city}, {selectedOrder.addresses.find(addr => addr.type === 'shipping')?.state} {selectedOrder.addresses.find(addr => addr.type === 'shipping')?.postal_code}
                        </p>
                        <p>{selectedOrder.addresses.find(addr => addr.type === 'shipping')?.country}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-4">
                {selectedOrder.status === 'processing' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Add Tracking Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tracking-number">Tracking Number</Label>
                        <Input
                          id="tracking-number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Enter tracking number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="carrier">Shipping Carrier</Label>
                        <Input
                          id="carrier"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          placeholder="e.g., FedEx, UPS, DHL"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleTrackingUpdate(selectedOrder.id)}
                      disabled={!trackingNumber || !carrier || isUpdating}
                      className="w-full"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Updating...' : 'Mark as Shipped'}
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold">Update Order Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
                      <Button
                        key={status}
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                        disabled={isUpdating || selectedOrder.status === status}
                        className="text-sm"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                  
                  <div>
                    <Label htmlFor="update-notes">Notes (Optional)</Label>
                    <Input
                      id="update-notes"
                      value={updateNotes}
                      onChange={(e) => setUpdateNotes(e.target.value)}
                      placeholder="Add notes about this update"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorOrdersPage;