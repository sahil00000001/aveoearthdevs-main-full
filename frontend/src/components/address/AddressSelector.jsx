"use client";

import { useState, useEffect } from "react";
import addressService from "../../services/addressService";
import AddressForm from "./AddressForm";

const AddressSelector = ({ 
  title = "Select Address", 
  addressType = "shipping", 
  selectedAddress = null, 
  onAddressSelect, 
  onAddressChange 
}) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, [addressType]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const addressData = await addressService.getAddressesByType(addressType);
      setAddresses(addressData);
      
      // If no address is selected but we have addresses, select the default one
      if (!selectedAddress && addressData.length > 0) {
        const defaultAddress = addressData.find(addr => addr.is_default) || addressData[0];
        if (defaultAddress && onAddressSelect) {
          onAddressSelect(defaultAddress);
        }
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
    if (onAddressChange) {
      onAddressChange(address);
    }
    setShowDropdown(false);
  };

  const handleNewAddress = () => {
    setShowForm(true);
    setShowDropdown(false);
  };

  const handleSaveAddress = async (savedAddress) => {
    await loadAddresses();
    setShowForm(false);
    handleAddressSelect(savedAddress);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const formatAddressForDisplay = (address) => {
    if (!address) return '';
    
    const parts = [];
    parts.push(`${address.first_name} ${address.last_name}`);
    parts.push(address.address_line_1);
    if (address.address_line_2) parts.push(address.address_line_2);
    parts.push(`${address.city}, ${address.state} ${address.postal_code}`);
    
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="border border-gray-300 rounded-md p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="border border-gray-300 rounded-md p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Add New {addressType.charAt(0).toUpperCase() + addressType.slice(1)} Address
        </h3>
        <AddressForm
          address={{ type: addressType }}
          onSave={handleSaveAddress}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <p className="text-gray-500 mb-4">No {addressType} addresses found.</p>
          <button
            onClick={handleNewAddress}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Selected Address Display */}
          <div 
            className="border border-gray-300 rounded-md p-4 cursor-pointer hover:border-gray-400 bg-white"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {selectedAddress ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {selectedAddress.first_name} {selectedAddress.last_name}
                      </span>
                      {selectedAddress.is_default && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Default
                        </span>
                      )}
                      {selectedAddress.label && (
                        <span className="text-gray-500 text-sm">({selectedAddress.label})</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatAddressForDisplay(selectedAddress)}
                    </p>
                    {selectedAddress.phone && (
                      <p className="text-sm text-gray-600">
                        Phone: {selectedAddress.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">
                    Select an address
                  </div>
                )}
              </div>
              <div className="ml-2">
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Dropdown Options */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="py-1">
                {addresses.map(address => (
                  <div
                    key={address.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                      selectedAddress?.id === address.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {address.first_name} {address.last_name}
                      </span>
                      {address.is_default && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Default
                        </span>
                      )}
                      {address.label && (
                        <span className="text-gray-500 text-sm">({address.label})</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatAddressForDisplay(address)}
                    </p>
                    {address.phone && (
                      <p className="text-sm text-gray-600">
                        Phone: {address.phone}
                      </p>
                    )}
                  </div>
                ))}
                
                {/* Add New Address Option */}
                <div
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-t border-gray-200"
                  onClick={handleNewAddress}
                >
                  <div className="flex items-center space-x-2 text-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium">Add New Address</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
