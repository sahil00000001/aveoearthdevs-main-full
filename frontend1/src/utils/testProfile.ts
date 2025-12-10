import { supabase } from '../lib/supabase';

export const testProfileCreation = async (userId: string, email: string) => {
  try {
    console.log('🧪 Testing profile creation for:', email, 'ID:', userId);
    
    // Test 1: Check current auth status
    const { data: { user: authUser } } = await supabase.auth.getUser();
    console.log('🧪 Current auth user:', authUser?.id, authUser?.email);
    
    // Test 2: Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('🧪 Fetch result:', { existingUser, fetchError });

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching user:', fetchError);
      console.error('❌ Fetch error details:', {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint
      });
      return { success: false, error: fetchError };
    }

    if (!existingUser) {
      console.log('🧪 Creating test profile...');
      
      const testUserData = {
        id: userId,
        name: email.split('@')[0] || 'Test User',
        email: email,
        role: 'buyer'
      };

      console.log('🧪 User data to insert:', testUserData);

      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert(testUserData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating test profile:', insertError);
        console.error('❌ Insert error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Check if it's an RLS policy error
        if (insertError.code === '42501') {
          console.error('🚨 RLS POLICY ERROR: Row-level security policy is blocking profile creation');
          console.error('🚨 SOLUTION: Run the RLS fix script in Supabase SQL editor');
        }
        
        return { success: false, error: insertError };
      }

      if (!newProfile) {
        console.error('❌ No profile returned from insert operation');
        return { success: false, error: new Error('No profile returned from insert') };
      }

      console.log('✅ Test profile created successfully:', newProfile);
      return { success: true, data: newProfile };
    } else {
      console.log('✅ Test profile already exists:', existingUser);
      return { success: true, data: existingUser };
    }
  } catch (error) {
    console.error('❌ Test profile creation failed:', error);
    return { success: false, error };
  }
};
