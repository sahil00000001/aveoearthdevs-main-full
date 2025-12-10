"use client";

import { useState } from "react";
import addressService from "../../services/addressService";

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const [loading, setLoading] = useState(false);

  const handleSetDefault = async () => {
    if (address.is_default) return; // Already default
    
    setLoading(true);
    try {
      await onSetDefault(address.id);
    } catch (error) {
      console.error('Error setting default address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await onDelete(address.id);
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      home: 'bg-emerald-100 text-emerald-800',
      work: 'bg-blue-100 text-blue-800',
      billing: 'bg-purple-100 text-purple-800',
      shipping: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
      {/* Header with type and default badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(address.type)}`}>
            {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
          </span>
          {address.is_default && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              Default
            </span>
          )}
          {address.label && (
            <span className="text-gray-500 text-sm">({address.label})</span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(address)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-1 text-gray-700">
        <div className="font-medium">
          {address.first_name} {address.last_name}
        </div>
        
        {address.company && (
          <div className="text-sm text-gray-600">{address.company}</div>
        )}
        
        <div className="text-sm">
          {address.address_line_1}
        </div>
        
        {address.address_line_2 && (
          <div className="text-sm">
            {address.address_line_2}
          </div>
        )}
        
        <div className="text-sm">
          {address.city}, {address.state} {address.postal_code}
        </div>
        
        {address.country && address.country !== 'India' && (
          <div className="text-sm">
            {address.country}
          </div>
        )}
        
        {address.phone && (
          <div className="text-sm text-gray-600">
            Phone: {address.phone}
          </div>
        )}
      </div>

      {/* Set as Default Button */}
      {!address.is_default && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handleSetDefault}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {loading ? 'Setting as default...' : `Set as default ${address.type}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressCard;
