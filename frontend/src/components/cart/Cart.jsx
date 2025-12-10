/**
 * Cart Component
 * 
 * Complete cart management interface with add, update, remove functionality
 * and checkout integration.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  ArrowRight,
  Package,
  CreditCard
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import buyerOrdersService from '../../services/buyerOrdersService';

const Cart = ({ isOpen, onClose, showCheckoutButton = true }) => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const {
    cart,
    cartCount,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    clearCart,
    cartTotals
  } = useCart();

  const [updating, setUpdating] = useState({});
  const totals = cartTotals();

  // Handle quantity update with debouncing
  const handleQuantityUpdate = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      return handleRemoveItem(cartItemId);
    }

    setUpdating(prev => ({ ...prev, [cartItemId]: true }));
    
    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Handle item removal
  const handleRemoveItem = async (cartItemId) => {
    setUpdating(prev => ({ ...prev, [cartItemId]: true }));
    
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!isLoggedIn) {
      // Redirect to login with cart redirect
      router.push('/login?redirect=/checkout');
      return;
    }
    
    router.push('/checkout');
    onClose?.();
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    router.push('/explore');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Cart ({cartCount})
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {loading && !cart ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="text-red-500 text-center">
                <p className="font-medium">Failed to load cart</p>
                <p className="text-sm text-gray-600 mt-1">{error}</p>
              </div>
            </div>
          ) : !cart?.items || cart.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 text-center mb-6">
                Add some items to get started
              </p>
              <button
                onClick={handleContinueShopping}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-gray-100 pb-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.product?.image || item.product?.images?.[0]?.url || item.image || item.image_url || '/sample1.jpg'}
                        alt={item.product?.name || item.product_name || 'Product'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || item.product_name || 'Product'}
                      </h4>
                      
                      {(item.variant_title || item.variant?.name) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.variant_title || item.variant?.name}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-200 rounded">
                            <button
                              onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                              disabled={updating[item.id] || item.quantity <= 1}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <span className="px-2 py-1 text-sm min-w-[2rem] text-center">
                              {updating[item.id] ? '...' : item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                              disabled={updating[item.id]}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updating[item.id]}
                            className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {buyerOrdersService.formatCurrency(
                              (item.variant?.price || item.product.price) * item.quantity
                            )}
                          </p>
                          
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-500">
                              {buyerOrdersService.formatCurrency(
                                item.variant?.price || item.product.price
                              )} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                {cart.items.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="w-full text-sm text-red-600 hover:text-red-700 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-gray-200 p-4 space-y-4">
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totals.itemCount} items)</span>
                    <span className="font-medium">{buyerOrdersService.formatCurrency(totals.subtotal)}</span>
                  </div>
                  
                  {/* Add shipping, tax calculations here if needed */}
                  
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span>{buyerOrdersService.formatCurrency(totals.total)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {showCheckoutButton && (
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={handleContinueShopping}
                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Login Prompt for Guest Users */}
                {!isLoggedIn && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Sign in</strong> to save your cart and faster checkout
                    </p>
                    <button
                      onClick={() => router.push('/login')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                    >
                      Sign in now →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// Mini Cart Component for Header
export const MiniCart = ({ onOpenCart }) => {
  const { cartCount, loading } = useCart();

  return (
    <button
      onClick={onOpenCart}
      className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
    >
      <ShoppingCart className="w-6 h-6" />
      
      {!loading && cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
      
      {loading && (
        <span className="absolute -top-1 -right-1 w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></span>
      )}
    </button>
  );
};

export default Cart;
