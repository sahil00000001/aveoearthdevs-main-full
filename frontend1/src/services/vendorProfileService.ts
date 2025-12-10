import { supabase } from '@/lib/supabase';
import { mockVendorProfileService } from './mockVendorServices';

export interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  business_description: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_country: string;
  business_pincode: string;
  business_phone: string;
  business_email: string;
  business_website?: string;
  business_registration_number?: string;
  business_tax_id?: string;
  business_license_number?: string;
  business_established_year?: number;
  business_employee_count?: string;
  business_annual_revenue?: string;
  business_certifications?: string[];
  business_social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  contact_person_name: string;
  contact_person_designation: string;
  contact_person_phone: string;
  contact_person_email: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_ifsc_code?: string;
  bank_account_holder_name?: string;
  payment_methods: string[];
  shipping_methods: string[];
  return_policy?: string;
  warranty_policy?: string;
  sustainability_commitments?: string[];
  profile_image_url?: string;
  business_logo_url?: string;
  business_documents?: {
    registration_certificate?: string;
    tax_certificate?: string;
    license_document?: string;
    bank_statement?: string;
  };
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

export const vendorProfileService = {
  async getProfile(userId: string): Promise<VendorProfile | null> {
    // Use mock service for now
    return await mockVendorProfileService.getProfile(userId);
  },

  async createProfile(profile: Partial<VendorProfile>): Promise<VendorProfile | null> {
    return await mockVendorProfileService.createProfile(profile);
  },

  async updateProfile(userId: string, updates: Partial<VendorProfile>): Promise<VendorProfile | null> {
    return await mockVendorProfileService.updateProfile(userId, updates);
  },

  async uploadProfileImage(userId: string, file: File): Promise<string | null> {
    return await mockVendorProfileService.uploadProfileImage(userId, file);
  },

  async uploadBusinessLogo(userId: string, file: File): Promise<string | null> {
    return await mockVendorProfileService.uploadBusinessLogo(userId, file);
  },

  async uploadDocument(userId: string, file: File, documentType: string): Promise<string | null> {
    return await mockVendorProfileService.uploadDocument(userId, file, documentType);
  }
};
