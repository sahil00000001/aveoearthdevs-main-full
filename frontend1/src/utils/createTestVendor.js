// Test script to create a vendor account
// Run this in the browser console after the app loads

import { supabase } from './lib/supabase';

export const createTestVendor = async () => {
  try {
    console.log('Creating test vendor account...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'test@vendor.com',
      password: 'testpassword123',
      options: {
        data: {
          business_name: 'Test Vendor Business',
          contact_person: 'Test Vendor',
          phone: '+1234567890',
          user_type: 'vendor'
        }
      }
    });

    if (error) {
      console.error('Error creating vendor:', error);
      return;
    }

    if (data.user) {
      console.log('Test vendor created successfully!');
      console.log('Email: test@vendor.com');
      console.log('Password: testpassword123');
      console.log('User ID:', data.user.id);
      
      // Create a basic vendor profile
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .insert({
          user_id: data.user.id,
          business_name: 'Test Vendor Business',
          business_email: 'test@vendor.com',
          contact_person_name: 'Test Vendor',
          contact_person_email: 'test@vendor.com',
          contact_person_phone: '+1234567890',
          business_type: 'Test Business',
          business_description: 'A test vendor for development purposes',
          is_verified: true,
          verification_status: 'approved'
        });

      if (profileError) {
        console.error('Error creating vendor profile:', profileError);
      } else {
        console.log('Vendor profile created successfully!');
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

// Make it available globally for easy testing
window.createTestVendor = createTestVendor;
