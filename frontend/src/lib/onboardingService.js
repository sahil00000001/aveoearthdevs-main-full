import api, { uploadRequest } from './api';

class OnboardingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // Get onboarding status
  async getOnboardingStatus() {
    try {
      const response = await api.supplierOnboarding.getStatus();
      return response.data;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      throw error;
    }
  }

  // Submit basic information (Step 1)
  async submitBasicInfo(data) {
    try {
      const response = await api.supplierOnboarding.createBusiness(data);
      
      // Clear status cache
      this.clearStatusCache();
      
      return response;
    } catch (error) {
      console.error('Error submitting basic info:', error);
      throw error;
    }
  }

  // Submit business profile (Step 2)
  async submitBusinessProfile(data) {
    try {
      const response = await api.supplierOnboarding.updateBusiness(data);
      
      // Clear status cache
      this.clearStatusCache();
      
      return response;
    } catch (error) {
      console.error('Error submitting business profile:', error);
      throw error;
    }
  }

  // Submit product information (Step 3)
  async submitProductInfo(data) {
    try {
      const response = await api.supplierOnboarding.completeOnboarding(data);
      
      // Clear status cache
      this.clearStatusCache();
      
      return response;
    } catch (error) {
      console.error('Error submitting product info:', error);
      throw error;
    }
  }

  // Submit inventory details (Step 4)
  async submitInventoryDetails(data) {
    try {
      const response = await api.supplierOnboarding.completeOnboarding(data);
      
      // Clear status cache
      this.clearStatusCache();
      
      return response;
    } catch (error) {
      console.error('Error submitting inventory details:', error);
      throw error;
    }
  }

  // Submit sustainability info (Step 5)
  async submitSustainabilityInfo(data) {
    try {
      const response = await api.supplierOnboarding.completeOnboarding(data);
      
      // Clear status cache
      this.clearStatusCache();
      
      return response;
    } catch (error) {
      console.error('Error submitting sustainability info:', error);
      throw error;
    }
  }

  // Complete onboarding
  async completeOnboarding() {
    try {
      const response = await api.supplierOnboarding.completeOnboarding({});
      
      // Clear all caches
      this.clearCache();
      
      return response;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  // Get business information for pre-filling forms
  async getBusinessInfo() {
    try {
      const cacheKey = 'business_info';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const response = await api.supplierOnboarding.getBusiness();
      const businessInfo = response.data;
      
      this.setCache(cacheKey, businessInfo);
      return businessInfo;
    } catch (error) {
      console.error('Error fetching business info:', error);
      return null;
    }
  }

  // Upload file for onboarding
  async uploadFile(file, type) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await uploadRequest('/files/upload', { formData });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Upload logo
  async uploadLogo(file) {
    return this.uploadFile(file, 'company_logo');
  }

  // Upload banner
  async uploadBanner(file) {
    return this.uploadFile(file, 'company_banner');
  }

  // Upload business document
  async uploadBusinessDocument(file) {
    return this.uploadFile(file, 'business_document');
  }

  // Clear status-related caches
  clearStatusCache() {
    this.cache.delete('onboarding_status');
    this.cache.delete('business_info');
  }

  // Clear all caches
  clearCache() {
    this.cache.clear();
  }
}

// Create and export singleton instance
export const onboardingService = new OnboardingService();
