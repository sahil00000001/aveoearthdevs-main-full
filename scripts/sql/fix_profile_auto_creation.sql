-- =====================================================
-- AUTO-CREATE USER_PROFILES WHEN USERS ARE CREATED
-- This trigger automatically creates a user_profile
-- entry when a new user is inserted into the users table
-- =====================================================

-- Function to create profile when user is created
CREATE OR REPLACE FUNCTION create_user_profile_on_user_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into user_profiles if it doesn't exist
    INSERT INTO user_profiles (user_id, preferences, social_links, notification_settings, created_at, updated_at)
    SELECT
        NEW.id,
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb,
        NOW(),
        NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM user_profiles up WHERE up.user_id = NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_user_profile ON users;

-- Create trigger to auto-create profile
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_on_user_insert();

-- Also create profiles for existing users without profiles
INSERT INTO user_profiles (user_id, preferences, social_links, notification_settings, created_at, updated_at)
SELECT 
    u.id,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    COALESCE(u.created_at, NOW()),
    COALESCE(u.updated_at, NOW())
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = u.id
);

-- Verify trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_create_user_profile';

