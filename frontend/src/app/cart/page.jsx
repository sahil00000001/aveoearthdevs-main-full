"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import NewsletterSubscription from "../../components/explore/NewsletterSubscription";
import ProductCard from "../../components/ui/ProductCard";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import CouponCode from "../../components/cart/CouponCode";
import CheckoutForm from "../../components/checkout/CheckoutForm";
import CheckoutSummary from "../../components/checkout/CheckoutSummary";
import OrderConfirmation from "../../components/OrderConfirmation";
import { useCart } from "../../hooks/useCart";
import { useOrders } from "../../hooks/useOrders";

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

export default function CartPage() {
  const router = useRouter();
  const { cart, updateCartItem, removeFromCart, clearCart, loading: cartLoading } = useCart();
  const { createOrder } = useOrders();
  const [currentStep, setCurrentStep] = useState('cart'); // cart, checkout, confirmation
  const [orderData, setOrderData] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [checkoutData, setCheckoutData] = useState({
    billingAddress: null,
    shippingAddress: null,
    paymentMethod: 'cod',
    customerNotes: '',
    useDifferentShipping: false
  });

  // Recommended products data (you can replace this with API call)
  const recommendedProducts = [
    {
      id: 3,
      title: "Jute Bag | Originally Sourced",
      category: "Home & Kitchen", 
      description: "Sustainable jute bag for everyday use",
      price: 89,
      originalPrice: 120,
      rating: 4.9,
      reviews: 524,
      image: "/sample1.jpg",
      tags: ["Staff Pick", "AveoEarth Certified"],
      discount: "-31%"
    },
    {
      id: 4,
      title: "Jute Bag | Originally Sourced", 
      category: "Home & Kitchen",
      description: "Sustainable jute bag for everyday use",
      price: 89,
      originalPrice: 120,
      rating: 4.9,
      reviews: 524,
      image: "/spoons.png",
      tags: ["Staff Pick", "AveoEarth Certified"],
      discount: "-31%"
    },
    {
      id: 5,
      title: "Jute Bag | Originally Sourced",
      category: "Home & Kitchen",
      description: "Sustainable jute bag for everyday use", 
      price: 89,
      originalPrice: 120,
      rating: 4.9,
      reviews: 524,
      image: "/hero.png",
      tags: ["Staff Pick", "AveoEarth Certified"],
      discount: "-31%"
    },
    {
      id: 6,
      title: "Jute Bag | Originally Sourced",
      category: "Home & Kitchen",
      description: "Sustainable jute bag for everyday use",
      price: 89, 
      originalPrice: 120,
      rating: 4.9,
      reviews: 524,
      image: "/category1.png",
      tags: ["Staff Pick", "AveoEarth Certified"],
      discount: "-31%"
    }
  ];

  const updateCartQuantity = async (id, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(id);
      return;
    }
    await updateCartItem(id, newQuantity);
  };

  const removeItem = async (id) => {
    await removeFromCart(id);
  };

  // Calculate totals from cart
  const subtotal = cart?.items?.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 1)), 0) || 0;
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const handleCheckout = () => {
    setCurrentStep('checkout');
  };

  const handleGoBack = () => {
    if (currentStep === 'confirmation') {
      setCurrentStep('cart');
      setOrderData(null);
    } else if (currentStep === 'checkout') {
      setCurrentStep('cart');
    } else {
      router.back();
    }
  };

  const handleProceedToCheckout = () => {
    setCurrentStep('checkout');
  };

  const handleCheckoutFormUpdate = useCallback((formData) => {
    setCheckoutData(prev => ({
      ...prev,
      billingAddress: formData.billingAddress,
      shippingAddress: formData.shippingAddress,
      customerNotes: formData.orderNotes || '',
      useDifferentShipping: formData.shipToDifferentAddress || false
    }));
  }, []);

  const handlePlaceOrder = async (orderDetails) => {
    try {
      // Combine checkout data with order details
      const completeOrderData = {
        billingAddress: checkoutData.billingAddress || {
          firstName: 'John',
          lastName: 'Doe', 
          streetAddress: '123 Main St',
          city: 'City',
          state: 'State',
          country: 'India',
          postalCode: '12345',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        shippingAddress: checkoutData.useDifferentShipping ? checkoutData.shippingAddress : null,
        paymentMethod: orderDetails.paymentMethod || 'cod',
        customerNotes: checkoutData.customerNotes,
        useDifferentShipping: checkoutData.useDifferentShipping
      };

      const result = await createOrder(completeOrderData);
      
      // Immediately clear cart state for instant UI update
      // The API call will happen in the background
      clearCart().catch(error => {
        console.error('Failed to clear cart on backend:', error);
      });
      
      // Create enhanced order data for confirmation with cart items
      const enhancedOrderData = {
        ...result,
        items: cart?.items || [], // Pass the actual cart items
        customerEmail: checkoutData.billingAddress?.email || 'customer@example.com'
      };
      
      setOrderData(enhancedOrderData);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error placing order:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleContinueShopping = () => {
    router.push('/explore');
  };

  const handleOrderDetails = () => {
    if (orderData?.order_id) {
      router.push(`/account/orders/${orderData.order_id}`);
    }
  };

  const getPageTitle = () => {
    switch (currentStep) {
      case 'checkout':
        return 'Checkout';
      case 'confirmation':
        return 'Order Confirmation';
      default:
        return 'My Shopping Cart';
    }
  };

  const shouldShowFooter = currentStep !== 'confirmation';
  const shouldShowNewsletter = currentStep === 'cart';

  if (cartLoading) {
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
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-16 pb-8">
        {/* Go Back Button */}
        <div className="mb-4 pt-4">
          <button 
            onClick={handleGoBack}
            className="bg-white border border-[#b8b8b8] rounded-[4.8px] px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm"
          >
            <ArrowLeftIcon />
            <span className="font-poppins font-medium text-[#484848]">Go back</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="font-poppins font-semibold text-[#1a1a1a] text-2xl leading-[1.2]">
            {getPageTitle()}
          </h1>
        </div>

        {/* Content based on current step */}
        {currentStep === 'confirmation' ? (
          <OrderConfirmation 
            orderData={orderData}
            onContinueShopping={handleContinueShopping}
            onGoBack={handleGoBack}
            onOrderDetails={handleOrderDetails}
          />
        ) : currentStep === 'checkout' ? (
          <div className="flex flex-col xl:flex-row gap-6 max-w-[1440px] mx-auto">
            {/* Left Column - Checkout Form */}
            <div className="flex-1">
              <CheckoutForm onFormUpdate={handleCheckoutFormUpdate} />
            </div>

            {/* Right Column - Order Summary */}
            <div className="xl:w-[400px]">
              <CheckoutSummary 
                cartItems={cart?.items || []}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          </div>
        ) : (
          /* Cart View */
          <>
            <div className="flex flex-col xl:flex-row gap-6 max-w-[1440px] mx-auto">
              {/* Left Column - Cart Items */}
              <div className="flex-1">
                {/* Shopping Cart Table */}
                <div className="bg-white rounded-lg border border-[#e6e6e6] mb-6">
                  {/* Table Header */}
                  <div className="px-4 py-3 border-b border-[#e6e6e6] grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <span className="font-poppins font-medium text-[#808080] text-xs uppercase tracking-[0.42px]">
                        Product
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="font-poppins font-medium text-[#808080] text-xs uppercase tracking-[0.42px]">
                        Price
                      </span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="font-poppins font-medium text-[#808080] text-xs uppercase tracking-[0.42px]">
                        Quantity
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="font-poppins font-medium text-[#808080] text-xs uppercase tracking-[0.42px]">
                        Subtotal
                      </span>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="divide-y divide-[#e6e6e6]">
                    {cart?.items?.length > 0 ? (
                      cart.items.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          onUpdateQuantity={updateCartQuantity}
                          onRemove={removeItem}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500 mb-4">Your cart is empty</p>
                        <button
                          onClick={() => router.push('/explore')}
                          className="bg-[#2f6b4f] hover:bg-[#245a41] text-white px-6 py-2 rounded-[43px] font-poppins font-semibold text-sm transition-colors"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {cart?.items?.length > 0 && (
                    <div className="px-4 py-4 border-t border-[#e6e6e6] flex flex-col sm:flex-row justify-between gap-3">
                      <button 
                        onClick={() => router.push('/explore')}
                        className="bg-[#f2f2f2] hover:bg-[#e8e8e8] px-6 py-2.5 rounded-[43px] font-poppins font-semibold text-[#4d4d4d] text-sm transition-colors"
                      >
                        Return to shop
                      </button>
                      <button 
                        onClick={() => window.location.reload()}
                        className="bg-[#f2f2f2] hover:bg-[#e8e8e8] px-6 py-2.5 rounded-[43px] font-poppins font-semibold text-[#4d4d4d] text-sm transition-colors"
                      >
                        Update Cart
                      </button>
                    </div>
                  )}
                </div>

                {/* Coupon Code */}
                {cart?.items?.length > 0 && (
                  <CouponCode value={couponCode} onChange={setCouponCode} />
                )}
              </div>

              {/* Right Column - Cart Summary */}
              {cart?.items?.length > 0 && (
                <div className="xl:w-[380px]">
                  <CartSummary 
                    subtotal={subtotal}
                    shipping={shipping}
                    total={total}
                    onCheckout={handleCheckout}
                  />
                </div>
              )}
            </div>

            {/* You Might Like Section */}
            <div className="mt-12">
              <h2 className="font-poppins font-medium text-[#1a1a1a] text-sm text-center mb-6">
                You Might Like
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {recommendedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    imageUrl={product.image}
                    category={product.category}
                    title={product.title}
                    description={product.description}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    rating={product.rating}
                    reviews={product.reviews}
                    variant="default"
                    size="default"
                    className="w-full"
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Newsletter Subscription - Only show in cart view */}
      {shouldShowNewsletter && <NewsletterSubscription />}

      {/* Footer */}
      {shouldShowFooter && <Footer />}
    </div>
  );
}
