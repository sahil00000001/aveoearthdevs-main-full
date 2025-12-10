import { supabase } from '../lib/supabase';

export const testDirectDatabaseAccess = async () => {
  console.log('🧪 Testing direct database access...');
  console.log('🧪 Step 1: Starting test...');
  
  try {
    console.log('🧪 Step 2: Checking auth...');
    
    // Test 1: Check current auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🧪 Step 2 result - Auth user:', user?.id, user?.email, authError);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }

    console.log('🧪 Step 3: Preparing test data...');
    
    // Test 2: Try to insert directly with minimal data
    const testData = {
      id: user.id,
      name: 'Test User',
      email: user.email,
      role: 'buyer'
    };

    console.log('🧪 Step 3 result - Test data:', testData);

    console.log('🧪 Step 4: Attempting database insert...');

    const { data, error } = await supabase
      .from('users')
      .insert(testData)
      .select()
      .single();

    console.log('🧪 Step 4 result - Insert result:', { data, error });

    if (error) {
      console.error('❌ Direct insert failed:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error };
    }

    console.log('✅ Direct insert successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Direct database test failed:', error);
    console.error('❌ Exception details:', error);
    return { success: false, error };
  } finally {
    console.log('🧪 Test completed');
  }
};
