"use client";

import { useState, useEffect } from "react";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import addressService from "../../services/addressService";

const AddressManager = ({ showTitle = true, addressType = null, onAddressSelect = null }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    loadAddresses();
  }, [addressType]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const addressData = addressType 
        ? await addressService.getAddressesByType(addressType)
        : await addressService.getAddresses();
      // Ensure addresses is always an array
      const addressesArray = Array.isArray(addressData) ? addressData : (addressData?.addresses || []);
      setAddresses(addressesArray);
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError('Failed to load addresses');
      setAddresses([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleSaveAddress = async (savedAddress) => {
    await loadAddresses(); // Reload addresses
    setShowForm(false);
    setEditingAddress(null);
    setError('');
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await addressService.deleteAddress(addressId);
      await loadAddresses(); // Reload addresses
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await addressService.setDefaultAddress(addressId);
      await loadAddresses(); // Reload addresses
    } catch (err) {
      console.error('Error setting default address:', err);
      setError('Failed to set default address');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleSelectAddress = (address) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {addressType ? `${addressType.charAt(0).toUpperCase() + addressType.slice(1)} Addresses` : 'My Addresses'}
          </h3>
          {!showForm && (
            <button
              onClick={handleAddAddress}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add New Address
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h4>
          <AddressForm
            address={editingAddress}
            onSave={handleSaveAddress}
            onCancel={handleCancel}
          />
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No addresses found.</p>
          <button
            onClick={handleAddAddress}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(address => (
            <div key={address.id} className="relative">
              <AddressCard
                address={address}
                onEdit={handleEditAddress}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefault}
              />
              {onAddressSelect && (
                <button
                  onClick={() => handleSelectAddress(address)}
                  className="absolute top-2 right-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200"
                >
                  Select
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
