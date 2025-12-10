// Onboarding service layer - handles business logic for supplier onboarding
import { supplierOnboarding, tokens } from '../lib/api';
import { validateOnboardingData, createFormData } from '../lib/fileUtils';

class OnboardingService {
  constructor() {
    this.cache = new Map();
  }

  // Get current auth token
  getToken() {
    const userTokens = tokens.get();
    return userTokens?.access_token;
  }

  // Check if user has completed onboarding
  async getOnboardingStatus() {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');
      
      const status = await supplierOnboarding.getStatus(token);
      return status;
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      throw error;
    }
  }

  // Save business information (Step 1 & 2)
  async saveBusinessInfo(data) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      // Validate data
      const validation = validateOnboardingData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Check if business profile exists
      let existingBusiness = null;
      try {
        existingBusiness = await supplierOnboarding.getBusinessSafe(token);
      } catch (error) {
        console.error('Error checking existing business:', error);
        // Continue with creating new business
      }

      // Create or update business profile
      const result = existingBusiness 
        ? await supplierOnboarding.updateBusiness(data, token)
        : await supplierOnboarding.createBusiness(data, token);

      // Cache the result
      this.cache.set('business_info', result);
      return result;
    } catch (error) {
      console.error('Failed to save business info:', error);
      throw error;
    }
  }

  // Get business information
  async getBusinessInfo() {
    try {
      // Return cached data if available
      if (this.cache.has('business_info')) {
        return this.cache.get('business_info');
      }

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const business = await supplierOnboarding.getBusinessSafe(token);
      if (business) {
        this.cache.set('business_info', business);
      }
      return business;
    } catch (error) {
      console.error('Failed to get business info:', error);
      return null; // Return null if no business info exists yet
    }
  }

  // Upload logo
  async uploadLogo(file) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await supplierOnboarding.uploadLogo(file, token);
      return result;
    } catch (error) {
      console.error('Failed to upload logo:', error);
      throw error;
    }
  }

  // Upload banner
  async uploadBanner(file) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const result = await supplierOnboarding.uploadBanner(file, token);
      return result;
    } catch (error) {
      console.error('Failed to upload banner:', error);
      throw error;
    }
  }

  // Save sustainability practices (Step 5)
  async saveSustainabilityInfo(data) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      // Check if sustainability profile exists
      let existingSustainability = null;
      try {
        existingSustainability = await supplierOnboarding.getSustainability(token);
      } catch (error) {
        // Sustainability doesn't exist yet
      }

      const result = existingSustainability
        ? await supplierOnboarding.updateSustainability(data, token)
        : await supplierOnboarding.createSustainability(data, token);

      this.cache.set('sustainability_info', result);
      return result;
    } catch (error) {
      console.error('Failed to save sustainability info:', error);
      throw error;
    }
  }

  // Get sustainability information
  async getSustainabilityInfo() {
    try {
      if (this.cache.has('sustainability_info')) {
        return this.cache.get('sustainability_info');
      }

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const sustainability = await supplierOnboarding.getSustainability(token);
      this.cache.set('sustainability_info', sustainability);
      return sustainability;
    } catch (error) {
      console.error('Failed to get sustainability info:', error);
      return null;
    }
  }

  // Complete entire onboarding process
  async completeOnboarding(allData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      // Validate required business data
      const validation = validateOnboardingData(allData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const result = await supplierOnboarding.completeOnboarding(allData, token);
      
      // Clear cache after successful completion
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  }

  // Get all uploaded documents
  async getDocuments() {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const documents = await supplierOnboarding.getDocuments(token);
      return documents;
    } catch (error) {
      console.error('Failed to get documents:', error);
      throw error;
    }
  }

  // Delete a document
  async deleteDocument(documentId) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      await supplierOnboarding.deleteDocument(documentId, token);
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  // Get all assets
  async getAssets() {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const assets = await supplierOnboarding.listAssets(token);
      return assets;
    } catch (error) {
      console.error('Failed to get assets:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Helper to combine all onboarding data for completion
  async getAllOnboardingData() {
    try {
      const [businessInfo, sustainabilityInfo] = await Promise.all([
        this.getBusinessInfo(),
        this.getSustainabilityInfo()
      ]);

      return {
        business: businessInfo,
        sustainability: sustainabilityInfo
      };
    } catch (error) {
      console.error('Failed to get all onboarding data:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const onboardingService = new OnboardingService();
export default onboardingService;
