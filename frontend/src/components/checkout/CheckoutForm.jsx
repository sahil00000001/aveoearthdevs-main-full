"use client";

import { useState, useEffect } from "react";
import AddressSelector from "../address/AddressSelector";

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M4 6L8 10L12 6" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default function CheckoutForm({ onFormUpdate }) {
  const [useAddressSelector, setUseAddressSelector] = useState(true);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    streetAddress: "",
    city: "",
    country: "",
    state: "",
    postalCode: "",
    email: "",
    phone: "",
    orderNotes: "",
    shipToDifferentAddress: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Convert address object to form format
  const convertAddressToFormData = (address) => {
    if (!address) return {};
    
    return {
      firstName: address.first_name || "",
      lastName: address.last_name || "", 
      companyName: address.company || "",
      streetAddress: address.address_line_1 || "",
      addressLine2: address.address_line_2 || "",
      city: address.city || "",
      country: address.country || "",
      state: address.state || "",
      postalCode: address.postal_code || "",
      email: address.email || "",
      phone: address.phone || ""
    };
  };

  // Handle billing address selection
  const handleBillingAddressSelect = (address) => {
    setSelectedBillingAddress(address);
    if (address) {
      const addressFormData = convertAddressToFormData(address);
      setFormData(prev => ({ ...prev, ...addressFormData }));
    }
  };

  // Handle shipping address selection  
  const handleShippingAddressSelect = (address) => {
    setSelectedShippingAddress(address);
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

  // Emit form changes to parent
  useEffect(() => {
    if (onFormUpdate) {
      let billingAddress;
      
      if (useAddressSelector && selectedBillingAddress) {
        // Use selected address
        billingAddress = {
          firstName: selectedBillingAddress.first_name,
          lastName: selectedBillingAddress.last_name,
          companyName: selectedBillingAddress.company || "",
          streetAddress: selectedBillingAddress.address_line_1,
          addressLine2: selectedBillingAddress.address_line_2 || "",
          city: selectedBillingAddress.city,
          state: selectedBillingAddress.state,
          country: selectedBillingAddress.country,
          postalCode: selectedBillingAddress.postal_code,
          email: selectedBillingAddress.email,
          phone: selectedBillingAddress.phone
        };
      } else {
        // Use manual form data
        billingAddress = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          streetAddress: formData.streetAddress,
          addressLine2: formData.addressLine2 || "",
          city: formData.city || '',
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode || '',
          email: formData.email,
          phone: formData.phone
        };
      }

      let shippingAddress = billingAddress; // Default to same as billing
      
      if (formData.shipToDifferentAddress) {
        if (useAddressSelector && selectedShippingAddress) {
          shippingAddress = {
            firstName: selectedShippingAddress.first_name,
            lastName: selectedShippingAddress.last_name,
            companyName: selectedShippingAddress.company || "",
            streetAddress: selectedShippingAddress.address_line_1,
            addressLine2: selectedShippingAddress.address_line_2 || "",
            city: selectedShippingAddress.city,
            state: selectedShippingAddress.state,
            country: selectedShippingAddress.country,
            postalCode: selectedShippingAddress.postal_code,
            email: selectedShippingAddress.email,
            phone: selectedShippingAddress.phone
          };
        }
        // If manual form, we'll need separate shipping form fields (not implemented in this version)
      }

      onFormUpdate({
        billingAddress,
        shippingAddress,
        orderNotes: formData.orderNotes,
        shipToDifferentAddress: formData.shipToDifferentAddress
      });
    }
  }, [formData, selectedBillingAddress, selectedShippingAddress, useAddressSelector, onFormUpdate]);

  return (
    <div className="flex flex-col gap-8">
      {/* Billing Information */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-poppins font-medium text-[#1a1a1a] text-2xl">
            Billing Information
          </h2>
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
          <div className="space-y-6">
            {/* Name Fields Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* First Name */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-[#1a1a1a] text-sm">
              First name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Your first name"
              className="bg-white h-[49px] px-4 py-3.5 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727]"
            />
          </div>
          
          {/* Last Name */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-[#1a1a1a] text-sm">
              Last name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Your last name"
              className="bg-white h-[49px] px-4 py-3.5 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727]"
            />
          </div>
          
          {/* Company Name */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-[#1a1a1a] text-sm">
              Company Name <span className="text-[grey]">(optional)</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Company name"
              className="bg-white h-[49px] px-4 py-3.5 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727]"
            />
          </div>
        </div>

        {/* Street Address */}
        <div className="flex flex-col gap-2">
          <label className="font-poppins text-[#1a1a1a] text-sm">
            Street Address
          </label>
          <input
            type="text"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
            placeholder="Street address"
            className="bg-white h-[49px] px-4 py-3.5 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727] w-full"
          />
        </div>

        {/* Country and State Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Country */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-[#1a1a1a] text-sm">
              Country / Region
            </label>
            <div className="relative">
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="bg-white h-[49px] px-4 py-3.5 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727] w-full appearance-none"
              >
                <option value="">Select</option>
                <option value="india">India</option>
                <option value="usa">United States</option>
                <option value="uk">United Kingdom</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDownIcon />
              </div>
            </div>
          </div>
          
          {/* State */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-[#1a1a1a] text-sm">
              States
            </label>
            <div className="relative">
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="bg-white h-[49px] px-4 py-3.5 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727] w-full appearance-none"
              >
                <option value="">Select State</option>
                <option value="andhra-pradesh">Andhra Pradesh</option>
                <option value="arunachal-pradesh">Arunachal Pradesh</option>
                <option value="assam">Assam</option>
                <option value="bihar">Bihar</option>
                <option value="chhattisgarh">Chhattisgarh</option>
                <option value="goa">Goa</option>
                <option value="gujarat">Gujarat</option>
                <option value="haryana">Haryana</option>
                <option value="himachal-pradesh">Himachal Pradesh</option>
                <option value="jharkhand">Jharkhand</option>
                <option value="karnataka">Karnataka</option>
                <option value="kerala">Kerala</option>
                <option value="madhya-pradesh">Madhya Pradesh</option>
                <option value="maharashtra">Maharashtra</option>
                <option value="manipur">Manipur</option>
                <option value="meghalaya">Meghalaya</option>
                <option value="mizoram">Mizoram</option>
                <option value="nagaland">Nagaland</option>
                <option value="odisha">Odisha</option>
                <option value="punjab">Punjab</option>
                <option value="rajasthan">Rajasthan</option>
                <option value="sikkim">Sikkim</option>
                <option value="tamil-nadu">Tamil Nadu</option>
                <option value="telangana">Telangana</option>
                <option value="tripura">Tripura</option>
                <option value="uttar-pradesh">Uttar Pradesh</option>
                <option value="uttarakhand">Uttarakhand</option>
                <option value="west-bengal">West Bengal</option>
                <option value="andaman-nicobar">Andaman and Nicobar Islands</option>
                <option value="chandigarh">Chandigarh</option>
                <option value="dadra-nagar-haveli-daman-diu">Dadra and Nagar Haveli and Daman and Diu</option>
                <option value="delhi">Delhi</option>
                <option value="jammu-kashmir">Jammu and Kashmir</option>
                <option value="ladakh">Ladakh</option>
                <option value="lakshadweep">Lakshadweep</option>
                <option value="puducherry">Puducherry</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDownIcon />
              </div>
            </div>
          </div>
        </div>

        {/* City and Postal Code Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-[#1a1a1a] text-sm">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              className="bg-white h-[49px] px-4 py-3.5 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727]"
            />
          </div>
          
          {/* Postal Code */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-[#1a1a1a] text-sm">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="Postal Code"
              className="bg-white h-[49px] px-4 py-3.5 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727]"
            />
          </div>
        </div>

        {/* Email and Phone Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-[#1a1a1a] text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="bg-white h-[49px] px-4 py-3.5 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727]"
            />
          </div>
          
          {/* Phone */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-[#1a1a1a] text-sm">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone number"
              className="bg-white h-[49px] px-4 py-3.5 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727]"
            />
          </div>
        </div>

        {/* Ship to Different Address Checkbox */}
        <div className="flex items-center gap-1.5">
          <input
            type="checkbox"
            id="shipToDifferentAddress"
            name="shipToDifferentAddress"
            checked={formData.shipToDifferentAddress}
            onChange={handleInputChange}
            className="w-5 h-5 border border-[#cccccc] rounded-sm"
          />
          <label 
            htmlFor="shipToDifferentAddress" 
            className="font-poppins text-[#4d4d4d] text-sm cursor-pointer"
          >
            Ship to a different address
          </label>
            </div>
          </div>
        )}

        {/* Ship to Different Address Option */}
        {formData.shipToDifferentAddress && useAddressSelector && (
          <AddressSelector
            title="Select Shipping Address"
            addressType="shipping"
            selectedAddress={selectedShippingAddress}
            onAddressSelect={handleShippingAddressSelect}
          />
        )}
      </div>

      {/* Divider */}
      <hr className="border-[#e6e6e6]" />

      {/* Additional Info */}
      <div className="space-y-5">
        <h2 className="font-poppins font-medium text-[#1a1a1a] text-2xl">
          Additional Info
        </h2>
        
        <div className="flex flex-col gap-2">
          <label className="font-poppins text-[#1a1a1a] text-sm">
            Order Notes (Optional)
          </label>
          <textarea
            name="orderNotes"
            value={formData.orderNotes}
            onChange={handleInputChange}
            placeholder="Notes about your order, e.g. special notes for delivery"
            rows={4}
            className="bg-white p-4 rounded-md border border-[#e6e6e6] font-poppins text-[#999999] text-base focus:outline-none focus:border-[#272727] resize-none"
          />
        </div>
      </div>
    </div>
  );
}
