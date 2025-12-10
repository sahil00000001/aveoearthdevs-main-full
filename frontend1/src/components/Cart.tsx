import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Heart,
  ArrowRight,
  Leaf
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sustainabilityScore: number;
  inStock: boolean;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onMoveToWishlist: (itemId: string) => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onMoveToWishlist,
  onCheckout
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      setAppliedCoupon(couponCode);
      setCouponCode('');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-4">Add some sustainable products to get started!</p>
          <Button className="bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white">
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({items.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Leaf className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">
                      {item.sustainabilityScore}% Sustainable
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[hsl(var(--forest-deep))] mt-1">
                    ${item.price}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-center"
                    min="0"
                  />
                  
                  <Button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-[hsl(var(--forest-deep))]">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Button
                      onClick={() => onMoveToWishlist(item.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                    >
                      <Heart className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => onRemoveItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coupon Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Coupon Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1"
            />
            <Button
              onClick={handleApplyCoupon}
              variant="outline"
              disabled={!couponCode.trim()}
            >
              Apply
            </Button>
          </div>
          {appliedCoupon && (
            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700">
                {appliedCoupon} applied
              </Badge>
              <Button
                onClick={handleRemoveCoupon}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon})</span>
                <span>-${(subtotal * 0.1).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[hsl(var(--forest-deep))]">
                  ${(total - (appliedCoupon ? subtotal * 0.1 : 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onCheckout}
            className="w-full mt-6 bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white"
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cart;

















