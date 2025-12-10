import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Leaf,
  Shield,
  Truck,
  Tag,
  ArrowRight,
  Heart,
  Lock,
} from "lucide-react";

const CartPage = () => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const { 
    cart, 
    getTotalItems, 
    getTotalPrice, 
    getSubtotal,
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  const { addToWishlist } = useWishlist();
  const { user } = useAuth();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleMoveToWishlist = (product: any) => {
    if (user) {
      addToWishlist.mutate(product.id);
      removeFromCart(product.id);
    }
  };

  const handleApplyCoupon = () => {
    // Mock coupon validation
    if (couponCode.toLowerCase() === "eco10") {
      setAppliedCoupon("ECO10");
    } else {
      setAppliedCoupon(null);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const subtotal = getSubtotal(); // Original price before any discounts
  const productDiscounts = getTotalPrice(); // Price after product discounts
  const productDiscountAmount = subtotal - productDiscounts;
  const shipping = productDiscounts > 2000 ? 0 : 100;
  const couponDiscount = appliedCoupon ? productDiscounts * 0.1 : 0;
  const total = productDiscounts + shipping - couponDiscount;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold text-charcoal">Your cart is empty</h2>
          <p className="text-muted-foreground">Add some sustainable products to get started!</p>
          <Button asChild>
            <Link to="/products">
              Browse Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-moss text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShoppingCart className="w-8 h-8" />
              <h1 className="text-4xl lg:text-5xl font-headline font-bold">
                Shopping Cart
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Review your sustainable choices
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-charcoal">
                Cart Items ({getTotalItems()})
              </h2>
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                Clear Cart
              </Button>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <Card key={item.product.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.product.image_url || '/api/placeholder/80/80'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-charcoal truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.product.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {item.product.sustainability_score && (
                            <Badge className="bg-moss/20 text-forest text-xs">
                              <Leaf className="w-3 h-3 mr-1" />
                              {item.product.sustainability_score}%
                            </Badge>
                          )}
                          {item.product.discount && item.product.discount > 0 && (
                            <Badge className="bg-clay text-white text-xs">
                              {item.product.discount}% OFF
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          <div className="text-lg font-bold text-charcoal">
                            {formatPrice((item.product.discount && item.product.discount > 0 
                              ? item.product.price * (1 - item.product.discount / 100) 
                              : item.product.price) * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-muted-foreground">
                              {formatPrice(item.product.discount && item.product.discount > 0 
                                ? item.product.price * (1 - item.product.discount / 100) 
                                : item.product.price)} each
                            </div>
                          )}
                          {item.product.discount > 0 && (
                            <div className="text-xs text-green-600">
                              {item.product.discount}% off
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveToWishlist(item.product)}
                            className="h-8 w-8 p-0"
                            disabled={!user}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coupon Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button onClick={handleApplyCoupon} variant="outline">
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      Coupon {appliedCoupon} applied! 10% off
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {productDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Product Discounts</span>
                      <span>-{formatPrice(productDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon Discount ({appliedCoupon})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
                  <Lock className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>

                {/* Security & Trust */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Free shipping on orders over ₹2,000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    <span>Carbon neutral delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Continue Shopping</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover more sustainable products
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/products">
                    Browse Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;