import { supabase } from '../lib/supabase';

export const createProfileManually = async (userId: string, email: string) => {
  console.log('🔧 Manual profile creation START for:', email, 'ID:', userId);
  
  try {
    console.log('🔧 Step 1: Checking if profile exists...');
    
    // First, check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('🔧 Step 1 result:', { existingProfile, fetchError });

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error checking existing profile:', fetchError);
      return { success: false, error: fetchError };
    }

    if (existingProfile) {
      console.log('✅ Profile already exists:', existingProfile);
      return { success: true, data: existingProfile };
    }

    console.log('🔧 Step 2: Creating new profile...');
    
    // Create profile with minimal data
    const profileData = {
      id: userId,
      name: email.split('@')[0] || 'User',
      email: email,
      role: 'buyer'
    };

    console.log('🔧 Profile data to insert:', profileData);

    const { data, error } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single();

    console.log('🔧 Step 2 result:', { data, error });

    if (error) {
      console.error('❌ Manual profile creation failed:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error };
    }

    if (!data) {
      console.error('❌ No data returned from profile creation');
      return { success: false, error: new Error('No data returned') };
    }

    console.log('✅ Manual profile creation successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Manual profile creation exception:', error);
    console.error('❌ Exception details:', error);
    return { success: false, error };
  } finally {
    console.log('🔧 Manual profile creation END');
  }
};
