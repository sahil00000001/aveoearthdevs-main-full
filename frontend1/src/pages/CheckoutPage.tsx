import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { backendApi } from '@/services/backendApi';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Lock,
  Truck,
  CreditCard,
  MapPin,
  Check,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { cart, cartData, loading: cartLoading, getTotalPrice, getSubtotal } = useCart();
  
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [customerNotes, setCustomerNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: addresses = [], isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await backendApi.getAddresses();
    },
    enabled: !!user
  });

  const createAddressMutation = useMutation({
    mutationFn: async (addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      return await backendApi.createAddress(addressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({
        title: "Address saved",
        description: "Your address has been saved successfully.",
      });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      billing_address_id: string;
      shipping_address_id: string;
      payment_method: string;
      customer_notes?: string;
    }) => {
      return await backendApi.createOrder(orderData);
    },
    onSuccess: (order) => {
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id.substring(0, 8)} has been placed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate(`/orders?order_id=${order.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Order failed",
        description: error?.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to checkout.",
        variant: "destructive",
      });
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!cartLoading && cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checkout.",
        variant: "destructive",
      });
      navigate('/cart');
    }
  }, [user, cart, cartLoading, navigate, toast]);

  useEffect(() => {
    if (addresses.length === 0) return;
    
    const defaultShipping = addresses.find(addr => addr.is_default && addr.type === 'shipping');
    const defaultBilling = addresses.find(addr => addr.is_default && addr.type === 'billing');
    const billingAddresses = addresses.filter(addr => addr.type === 'billing');
    
    if (defaultShipping && !selectedShippingAddress) {
      setSelectedShippingAddress(defaultShipping.id);
    }
    
    if (sameAsShipping && defaultShipping) {
      setSelectedBillingAddress(defaultShipping.id);
    } else if (!sameAsShipping) {
      if (defaultBilling) {
        setSelectedBillingAddress(defaultBilling.id);
      } else if (billingAddresses.length > 0) {
        setSelectedBillingAddress(billingAddresses[0].id);
      } else if (addresses.length > 0) {
        setSelectedBillingAddress(addresses[0].id);
      }
    }
  }, [addresses, sameAsShipping]);
  
  useEffect(() => {
    if (sameAsShipping && selectedShippingAddress) {
      setSelectedBillingAddress(selectedShippingAddress);
    }
  }, [sameAsShipping, selectedShippingAddress]);

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const subtotal = getSubtotal();
  const total = getTotalPrice();
  const shipping = total > 2000 ? 0 : 100;
  const finalTotal = total + shipping;

  const handlePlaceOrder = async () => {
    if (!selectedShippingAddress) {
      toast({
        title: "Shipping address required",
        description: "Please select a shipping address.",
        variant: "destructive",
      });
      return;
    }

    const billingAddr = sameAsShipping ? selectedShippingAddress : selectedBillingAddress;
    if (!billingAddr) {
      toast({
        title: "Billing address required",
        description: "Please select a billing address.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    // Check inventory before placing order
    const outOfStockItems = cart.filter((item: any) => {
      const stock = item.product?.stock;
      return stock !== undefined && stock !== null && stock < item.quantity;
    });

    if (outOfStockItems.length > 0) {
      toast({
        title: "Out of stock",
        description: `Some items in your cart are out of stock. Please update quantities.`,
        variant: "destructive",
      });
      navigate('/cart');
      return;
    }

    setIsProcessing(true);
    try {
      await createOrderMutation.mutateAsync({
        shipping_address_id: selectedShippingAddress,
        billing_address_id: billingAddr,
        payment_method: paymentMethod,
        customer_notes: customerNotes || undefined
      });
    } catch (error) {
      console.error('Order creation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartLoading || addressesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-forest" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!user || cart.length === 0) {
    return null;
  }

  const shippingAddresses = addresses.filter(addr => addr.type === 'shipping');
  const billingAddresses = addresses.filter(addr => addr.type === 'billing');
  const allAddresses = addresses; // For same-as-shipping case, we can use any address

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-charcoal">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-forest" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shippingAddresses.length > 0 ? (
                  <RadioGroup
                    value={selectedShippingAddress}
                    onValueChange={setSelectedShippingAddress}
                  >
                    {shippingAddresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-2">
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label
                          htmlFor={address.id}
                          className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted"
                        >
                          <div className="font-semibold">
                            {address.first_name} {address.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {address.address_line_1}
                            {address.address_line_2 && `, ${address.address_line_2}`}
                            <br />
                            {address.city}, {address.state} {address.postal_code}
                            <br />
                            {address.country}
                            {address.phone && <><br />{address.phone}</>}
                          </div>
                          {address.is_default && (
                            <Badge className="mt-1" variant="secondary">Default</Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No shipping addresses found. Please add an address in your profile.
                  </p>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/profile?tab=addresses')}
                >
                  Add New Address
                </Button>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-forest" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="same-as-shipping"
                    checked={sameAsShipping}
                    onChange={(e) => {
                      setSameAsShipping(e.target.checked);
                      if (e.target.checked) {
                        setSelectedBillingAddress(selectedShippingAddress);
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="same-as-shipping" className="cursor-pointer">
                    Same as shipping address
                  </Label>
                </div>

                {!sameAsShipping && (
                  <>
                    {(billingAddresses.length > 0 || allAddresses.length > 0) ? (
                      <RadioGroup
                        value={selectedBillingAddress}
                        onValueChange={setSelectedBillingAddress}
                      >
                        {(billingAddresses.length > 0 ? billingAddresses : allAddresses).map((address) => (
                          <div key={address.id} className="flex items-start space-x-2">
                            <RadioGroupItem value={address.id} id={address.id} />
                            <Label
                              htmlFor={address.id}
                              className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted"
                            >
                              <div className="font-semibold">
                                {address.first_name} {address.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {address.address_line_1}
                                {address.address_line_2 && `, ${address.address_line_2}`}
                                <br />
                                {address.city}, {address.state} {address.postal_code}
                                <br />
                                {address.country}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No billing addresses found.
                      </p>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate('/profile?tab=addresses')}
                    >
                      Add New Address
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-forest" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted">
                        <div className="font-semibold">Credit/Debit Card</div>
                        <div className="text-sm text-muted-foreground">
                          Visa, MasterCard, RuPay
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted">
                        <div className="font-semibold">UPI</div>
                        <div className="text-sm text-muted-foreground">
                          PhonePe, Google Pay, Paytm
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Label htmlFor="netbanking" className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted">
                        <div className="font-semibold">Net Banking</div>
                        <div className="text-sm text-muted-foreground">
                          All major banks
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted">
                        <div className="font-semibold">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">
                          Pay when you receive
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any special instructions for your order..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        {formatPrice(
                          (item.product.discount && item.product.discount > 0
                            ? item.product.price * (1 - item.product.discount / 100)
                            : item.product.price) * item.quantity
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !selectedShippingAddress || (!sameAsShipping && !selectedBillingAddress) || !paymentMethod}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Secure checkout with SSL encryption
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
