// Profile service for managing user profile data
import { auth, tokens } from '../lib/api';

class ProfileService {
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

  // Update basic profile (name, phone)
  async updateBasicProfile(profileData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await auth.updateProfile(profileData, token);
      this.clearCache(); // Clear cache after updating
      return response;
    } catch (error) {
      console.error('Error updating basic profile:', error);
      throw error;
    }
  }

  // Update complete profile (includes extended profile fields)
  async updateCompleteProfile(profileData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await auth.updateCompleteProfile(profileData, token);
      this.clearCache(); // Clear cache after updating
      return response;
    } catch (error) {
      console.error('Error updating complete profile:', error);
      throw error;
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const cacheKey = 'user_profile';
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await auth.getProfile(token);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  // Validate profile data
  validateBasicProfile(profileData) {
    const errors = {};

    if (!profileData.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!profileData.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (profileData.phone && profileData.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate complete profile data
  validateCompleteProfile(profileData) {
    const basicValidation = this.validateBasicProfile(profileData);
    const errors = { ...basicValidation.errors };

    // Additional validations for extended profile
    if (profileData.date_of_birth) {
      const birthDate = new Date(profileData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        errors.date_of_birth = 'You must be at least 13 years old';
      }
      
      if (birthDate > today) {
        errors.date_of_birth = 'Birth date cannot be in the future';
      }
    }

    if (profileData.bio && profileData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Get gender options
  getGenderOptions() {
    return [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' }
    ];
  }

  // Format user name
  formatUserName(user) {
    if (!user) return 'User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    if (user.first_name) {
      return user.first_name;
    }
    
    if (user.name) {
      return user.name;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  }

  // Get user initials for avatar
  getUserInitials(user) {
    if (!user) return 'U';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }
    
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
  }

  // Default notification settings
  getDefaultNotificationSettings() {
    return {
      email_marketing: true,
      email_orders: true,
      email_security: true,
      sms_orders: false,
      sms_marketing: false,
      push_orders: true,
      push_marketing: false
    };
  }

  // Default preferences
  getDefaultPreferences() {
    return {
      language: 'en',
      currency: 'INR',
      theme: 'light',
      newsletter: true,
      recommendations: true
    };
  }

  // Sanitize profile data before sending
  sanitizeProfileData(profileData) {
    const sanitized = {};
    
    // Basic fields
    if (profileData.first_name) sanitized.first_name = profileData.first_name.trim();
    if (profileData.last_name) sanitized.last_name = profileData.last_name.trim();
    if (profileData.phone) sanitized.phone = profileData.phone.trim();
    if (profileData.avatar_url) sanitized.avatar_url = profileData.avatar_url;
    
    // Extended fields
    if (profileData.date_of_birth) sanitized.date_of_birth = profileData.date_of_birth;
    if (profileData.gender) sanitized.gender = profileData.gender;
    if (profileData.bio) sanitized.bio = profileData.bio.trim();
    
    // JSON fields
    if (profileData.preferences) sanitized.preferences = profileData.preferences;
    if (profileData.notification_settings) sanitized.notification_settings = profileData.notification_settings;
    if (profileData.social_links) sanitized.social_links = profileData.social_links;
    
    return sanitized;
  }
}

export const profileService = new ProfileService();
export default profileService;
