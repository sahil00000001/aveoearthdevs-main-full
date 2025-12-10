// Address service for managing user addresses
import { auth, tokens } from '../lib/api';

class AddressService {
  constructor() {
    this.cache = new Map();
    this.cacheTime = 5 * 60 * 1000; // 5 minutes
  }

  // Get authentication token
  getToken() {
    const userTokens = tokens.get();
    return userTokens?.access_token;
  }

  // Cache management
  isCacheValid(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp) < this.cacheTime;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    return this.isCacheValid(key) ? cached.data : null;
  }

  clearCache() {
    this.cache.clear();
  }

  // Get all user addresses
  async getAddresses() {
    try {
      const cacheKey = 'user_addresses';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await auth.getAddresses(token);
      // Ensure response is an array
      const addresses = Array.isArray(response) ? response : (response?.addresses || []);
      this.setCache(cacheKey, addresses);
      return addresses;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  // Create a new address
  async createAddress(addressData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await auth.createAddress(addressData, token);
      this.clearCache(); // Clear cache after creating
      return response;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  // Update an existing address
  async updateAddress(addressId, addressData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await auth.updateAddress(addressId, addressData, token);
      this.clearCache(); // Clear cache after updating
      return response;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // Delete an address
  async deleteAddress(addressId) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await auth.deleteAddress(addressId, token);
      this.clearCache(); // Clear cache after deleting
      return response;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  // Set an address as default
  async setDefaultAddress(addressId) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await auth.setDefaultAddress(addressId, token);
      this.clearCache(); // Clear cache after setting default
      return response;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  // Get default address by type
  async getDefaultAddress(addressType) {
    try {
      const cacheKey = `default_address_${addressType}`;
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await auth.getDefaultAddress(addressType, token);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      // If no default address found, return null instead of throwing
      if (error.status === 404) {
        return null;
      }
      console.error('Error fetching default address:', error);
      throw error;
    }
  }

  // Get addresses by type (shipping/billing/home/work/other)
  async getAddressesByType(addressType = null) {
    try {
      const addresses = await this.getAddresses();
      
      if (!addressType) return addresses;
      
      return addresses.filter(address => address.type === addressType);
    } catch (error) {
      console.error('Error fetching addresses by type:', error);
      throw error;
    }
  }

  // Validate address data before sending to API
  validateAddressData(addressData) {
    const errors = {};

    if (!addressData.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!addressData.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!addressData.address_line_1?.trim()) {
      errors.address_line_1 = 'Address line 1 is required';
    }

    if (!addressData.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!addressData.state?.trim()) {
      errors.state = 'State is required';
    }

    if (!addressData.postal_code?.trim()) {
      errors.postal_code = 'Postal code is required';
    }

    if (!addressData.country?.trim()) {
      errors.country = 'Country is required';
    }

    if (!addressData.type) {
      errors.type = 'Address type is required';
    }

    if (addressData.phone && addressData.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    
    const parts = [];
    
    if (address.first_name && address.last_name) {
      parts.push(`${address.first_name} ${address.last_name}`);
    }
    
    if (address.company) {
      parts.push(address.company);
    }
    
    parts.push(address.address_line_1);
    
    if (address.address_line_2) {
      parts.push(address.address_line_2);
    }
    
    const cityStateParts = [];
    if (address.city) cityStateParts.push(address.city);
    if (address.state) cityStateParts.push(address.state);
    if (address.postal_code) cityStateParts.push(address.postal_code);
    
    if (cityStateParts.length > 0) {
      parts.push(cityStateParts.join(', '));
    }
    
    if (address.country && address.country !== 'India') {
      parts.push(address.country);
    }
    
    return parts.join('\n');
  }

  // Get address type options
  getAddressTypeOptions() {
    return [
      { value: 'home', label: 'Home' },
      { value: 'work', label: 'Work' },
      { value: 'billing', label: 'Billing' },
      { value: 'shipping', label: 'Shipping' },
      { value: 'other', label: 'Other' }
    ];
  }
}

export const addressService = new AddressService();
export default addressService;
