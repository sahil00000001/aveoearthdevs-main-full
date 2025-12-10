import { supabase } from '../lib/supabase';

export const testSupabaseConnection = async () => {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    console.log('🔌 Step 1: Testing basic connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    console.log('🔌 Step 1 result:', { data, error });
    
    if (error) {
      console.error('❌ Basic connection failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Check auth
    console.log('🔌 Step 2: Checking auth...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔌 Step 2 result:', { user: user?.id, authError });
    
    if (!user) {
      console.error('❌ No authenticated user');
      return { success: false, error: 'No authenticated user' };
    }
    
    console.log('✅ Auth check successful');
    
    // Test 3: Try simple insert
    console.log('🔌 Step 3: Testing simple insert...');
    const testData = {
      id: user.id,
      name: 'Simple Test',
      email: user.email,
      role: 'buyer'
    };
    
    console.log('🔌 Test data:', testData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testData)
      .select()
      .single();
    
    console.log('🔌 Step 3 result:', { insertData, insertError });
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.error('❌ Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return { success: false, error: insertError };
    }
    
    console.log('✅ Insert successful:', insertData);
    return { success: true, data: insertData };
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return { success: false, error };
  } finally {
    console.log('🔌 Test completed');
  }
};

