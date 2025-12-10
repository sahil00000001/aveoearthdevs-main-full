/**
 * Checkout Component
 * 
 * Complete checkout flow with address management, payment integration,
 * and order creation.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  Shield, 
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';
import buyerOrdersService from '../../services/buyerOrdersService';
import AddressSelector from '../address/AddressSelector';

const Checkout = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { cart, cartTotals, clearCart } = useCart();
  const { createOrder, loading: orderLoading } = useOrders();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useAddressSelector, setUseAddressSelector] = useState(true);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [agreeToPolicies, setAgreeToPolicies] = useState(false);

  const totals = cartTotals();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/checkout');
    }
  }, [isLoggedIn, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart?.items || cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  // Handle address input changes
  const handleBillingChange = (field, value) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
    if (sameAsBilling) {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleShippingChange = (field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  // Handle same as billing toggle
  const handleSameAsBillingToggle = (checked) => {
    setSameAsBilling(checked);
    if (checked) {
      setShippingAddress({ ...billingAddress });
    }
  };

  // Handle billing address selection
  const handleBillingAddressSelect = (address) => {
    setSelectedBillingAddress(address);
    if (address) {
      const addressData = {
        firstName: address.first_name,
        lastName: address.last_name,
        email: address.email,
        phone: address.phone,
        streetAddress: address.address_line_1,
        addressLine2: address.address_line_2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country
      };
      setBillingAddress(addressData);
      if (sameAsBilling) {
        setShippingAddress(addressData);
      }
    }
  };

  // Handle shipping address selection
  const handleShippingAddressSelect = (address) => {
    setSelectedShippingAddress(address);
    if (address) {
      const addressData = {
        firstName: address.first_name,
        lastName: address.last_name,
        email: address.email,
        phone: address.phone,
        streetAddress: address.address_line_1,
        addressLine2: address.address_line_2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country
      };
      setShippingAddress(addressData);
    }
  };

  // Toggle between address selector and manual form
  const toggleAddressSelector = () => {
    setUseAddressSelector(!useAddressSelector);
    if (useAddressSelector) {
      // Reset selected addresses when switching to manual
      setSelectedBillingAddress(null);
      setSelectedShippingAddress(null);
    }
  };

  // Validate address
  const validateAddress = (address) => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'streetAddress', 'city', 'state', 'postalCode'];
    return required.every(field => address[field]?.trim());
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (step === 1) {
      if (!validateAddress(billingAddress) || (!sameAsBilling && !validateAddress(shippingAddress))) {
        setError('Please fill in all required fields');
        return;
      }
    }
    
    setError(null);
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setError(null);
  };

  // Handle order creation
  const handleCreateOrder = async () => {
    // Check if user has agreed to policies
    if (!agreeToPolicies) {
      setError('Please agree to the Terms & Conditions, Privacy Policy, and Refund Policy to proceed with the payment.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        billingAddress,
        shippingAddress: sameAsBilling ? billingAddress : shippingAddress,
        paymentMethod,
        customerNotes: customerNotes || null,
        useDifferentShipping: !sameAsBilling
      };

      const order = await createOrder(orderData);

      // Clear cart after successful order
      await clearCart();

      // Redirect to order confirmation
      router.push(`/orders/${order.id}/confirmation`);

    } catch (error) {
      console.error('Failed to create order:', error);
      setError(error.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn || !cart?.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Review' }
            ].map((stepItem, index) => (
              <div key={stepItem.num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepItem.num 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepItem.num ? <Check className="w-4 h-4" /> : stepItem.num}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= stepItem.num ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stepItem.label}
                </span>
                {index < 2 && <div className="w-8 h-px bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Information
                  </h2>

                  {/* Billing Address */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Billing Address</h3>
                      <button
                        type="button"
                        onClick={toggleAddressSelector}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {useAddressSelector ? 'Enter manually' : 'Use saved address'}
                      </button>
                    </div>

                    {useAddressSelector ? (
                      <AddressSelector
                        title="Select Billing Address"
                        addressType="billing"
                        selectedAddress={selectedBillingAddress}
                        onAddressSelect={handleBillingAddressSelect}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="First Name *"
                          value={billingAddress.firstName}
                          onChange={(e) => handleBillingChange('firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Last Name *"
                          value={billingAddress.lastName}
                          onChange={(e) => handleBillingChange('lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="email"
                          placeholder="Email *"
                          value={billingAddress.email}
                          onChange={(e) => handleBillingChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="tel"
                          placeholder="Phone *"
                          value={billingAddress.phone}
                          onChange={(e) => handleBillingChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Address Line 1 *"
                          value={billingAddress.streetAddress}
                          onChange={(e) => handleBillingChange('streetAddress', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent md:col-span-2"
                        />
                        <input
                          type="text"
                          placeholder="Address Line 2"
                          value={billingAddress.addressLine2}
                          onChange={(e) => handleBillingChange('addressLine2', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent md:col-span-2"
                        />
                        <input
                          type="text"
                          placeholder="City *"
                          value={billingAddress.city}
                          onChange={(e) => handleBillingChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="State *"
                          value={billingAddress.state}
                          onChange={(e) => handleBillingChange('state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Postal Code *"
                          value={billingAddress.postalCode}
                          onChange={(e) => handleBillingChange('postalCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Country *"
                          value={billingAddress.country}
                          onChange={(e) => handleBillingChange('country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="sameAsBilling"
                        checked={sameAsBilling}
                        onChange={(e) => handleSameAsBillingToggle(e.target.checked)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sameAsBilling" className="text-sm font-medium text-gray-700">
                        Shipping address is the same as billing address
                      </label>
                    </div>

                    {!sameAsBilling && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">Shipping Address</h3>
                          <button
                            type="button"
                            onClick={toggleAddressSelector}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {useAddressSelector ? 'Enter manually' : 'Use saved address'}
                          </button>
                        </div>

                        {useAddressSelector ? (
                          <AddressSelector
                            title="Select Shipping Address"
                            addressType="shipping"
                            selectedAddress={selectedShippingAddress}
                            onAddressSelect={handleShippingAddressSelect}
                          />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="First Name *"
                              value={shippingAddress.firstName}
                              onChange={(e) => handleShippingChange('firstName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              placeholder="Last Name *"
                              value={shippingAddress.lastName}
                              onChange={(e) => handleShippingChange('lastName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="email"
                              placeholder="Email *"
                              value={shippingAddress.email}
                              onChange={(e) => handleShippingChange('email', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="tel"
                              placeholder="Phone *"
                              value={shippingAddress.phone}
                              onChange={(e) => handleShippingChange('phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              placeholder="Address Line 1 *"
                              value={shippingAddress.streetAddress}
                              onChange={(e) => handleShippingChange('streetAddress', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent md:col-span-2"
                            />
                            <input
                              type="text"
                              placeholder="Address Line 2"
                              value={shippingAddress.addressLine2}
                              onChange={(e) => handleShippingChange('addressLine2', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent md:col-span-2"
                            />
                            <input
                              type="text"
                              placeholder="City *"
                              value={shippingAddress.city}
                              onChange={(e) => handleShippingChange('city', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              placeholder="State *"
                              value={shippingAddress.state}
                              onChange={(e) => handleShippingChange('state', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              placeholder="Postal Code *"
                              value={shippingAddress.postalCode}
                              onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              placeholder="Country *"
                              value={shippingAddress.country}
                              onChange={(e) => handleShippingChange('country', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </h2>

                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-medium">Credit/Debit Card</span>
                        </div>
                      </label>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          <span className="font-medium">UPI Payment</span>
                        </div>
                      </label>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5" />
                          <span className="font-medium">Cash on Delivery</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review Order */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>

                  {/* Customer Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Special instructions for your order..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>{item.product.name} × {item.quantity}</span>
                          <span>{buyerOrdersService.formatCurrency(
                            (item.variant?.price || item.product.price) * item.quantity
                          )}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Policy Agreement */}
              {step === 3 && (
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="policy-agreement"
                      checked={agreeToPolicies}
                      onChange={(e) => setAgreeToPolicies(e.target.checked)}
                      className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label htmlFor="policy-agreement" className="text-sm text-gray-700 cursor-pointer">
                        I have reviewed the{' '}
                        <a
                          href="/TermsandConditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 underline"
                        >
                          Terms & Conditions
                        </a>
                        ,{' '}
                        <a
                          href="/PrivacyPolicy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 underline"
                        >
                          Privacy Policy
                        </a>
                        ,{' '}
                        <a
                          href="/RefundsandCancellation"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 underline"
                        >
                          Shipping & Delivery and Refunds & Cancellation
                        </a>{' '}
                        policies and I agree to proceed with the payment.
                      </label>
                    </div>
                  </div>
                  {!agreeToPolicies && error && error.includes('Please agree') && (
                    <p className="mt-2 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleCreateOrder}
                    disabled={loading || orderLoading || !agreeToPolicies}
                    className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading || orderLoading ? 'Creating Order...' : 'Place Order'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              {/* Items */}
              <div className="space-y-3 mb-6">
                {cart?.items?.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={item.product.images?.[0]?.url || '/sample1.jpg'}
                        alt={item.product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {buyerOrdersService.formatCurrency(
                        (item.variant?.price || item.product.price) * item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{buyerOrdersService.formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>{buyerOrdersService.formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
