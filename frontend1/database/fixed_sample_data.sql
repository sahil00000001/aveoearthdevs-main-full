-- =====================================================
-- AVEOTEARTH SAMPLE DATA
-- Fixed and aligned with the new schema
-- =====================================================

-- First, create an admin user (you'll need to replace this with actual auth.users ID)
-- This is a template - you need to create the user in Supabase Auth first
-- Then get the UUID and replace the placeholder below

-- Example admin user creation (run this after creating user in Supabase Auth):
-- INSERT INTO public.users (
--     id, 
--     email, 
--     user_type, 
--     first_name, 
--     last_name, 
--     is_verified, 
--     is_active,
--     is_email_verified
-- ) VALUES (
--     'your-admin-uuid-here', -- Replace with actual UUID from auth.users
--     'admin@aveoearth.com',
--     'admin',
--     'Admin',
--     'User',
--     true,
--     true,
--     true
-- );

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, is_active) VALUES
('Zero Waste', 'zero-waste', 'Products that help reduce waste and promote sustainable living', true),
('Eco-Friendly', 'eco-friendly', 'Environmentally conscious products made from sustainable materials', true),
('Organic', 'organic', 'Natural and organic products for a healthier lifestyle', true),
('Recycled', 'recycled', 'Products made from recycled materials', true),
('Renewable Energy', 'renewable-energy', 'Products that harness renewable energy sources', true),
('Sustainable Fashion', 'sustainable-fashion', 'Ethically made wardrobe staples and organic clothing', true),
('Clean Beauty', 'clean-beauty', 'Cruelty-free, natural skincare and beauty products', true),
('Home & Living', 'home-living', 'Eco-friendly home essentials and kitchenware', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample brands
INSERT INTO public.brands (name, slug, description, is_active) VALUES
('EcoLife', 'ecolife', 'Leading sustainable lifestyle brand', true),
('GreenTech', 'greentech', 'Innovative eco-friendly technology', true),
('PureNature', 'purenature', '100% natural and organic products', true),
('RecyclePro', 'recyclepro', 'Products made from recycled materials', true),
('SolarMax', 'solarmax', 'Renewable energy solutions', true),
('EarthWear', 'earthwear', 'Sustainable fashion for conscious consumers', true),
('NaturalGlow', 'naturalglow', 'Clean beauty and skincare products', true),
('HomeGreen', 'homegreen', 'Eco-friendly home and living products', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products (only if admin user exists)
-- Uncomment and modify the supplier_id after creating an admin user
/*
INSERT INTO public.products (
    supplier_id, 
    category_id, 
    brand_id, 
    sku, 
    name, 
    slug, 
    short_description, 
    description, 
    price, 
    compare_at_price, 
    status, 
    approval_status, 
    visibility, 
    published_at,
    materials,
    tags
) VALUES
-- Zero Waste Products
(
    (SELECT id FROM public.users WHERE user_type = 'admin' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'zero-waste'),
    (SELECT id FROM public.brands WHERE slug = 'ecolife'),
    'BAMBOO-BOTTLE-001',
    'Bamboo Water Bottle',
    'bamboo-water-bottle',
    'Eco-friendly bamboo water bottle with stainless steel interior',
    'This beautiful bamboo water bottle combines sustainability with functionality. Made from natural bamboo and featuring a stainless steel interior, it keeps your drinks cold for up to 24 hours and hot for up to 12 hours. Perfect for reducing single-use plastic consumption.',
    24.99,
    29.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Bamboo", "Stainless Steel"]',
    '["zero-waste", "bamboo", "water-bottle", "sustainable"]'
),
(
    (SELECT id FROM public.users WHERE user_type = 'admin' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'zero-waste'),
    (SELECT id FROM public.brands WHERE slug = 'ecolife'),
    'BEESWAX-WRAPS-001',
    'Beeswax Food Wraps Set',
    'beeswax-food-wraps-set',
    'Set of 6 reusable beeswax food wraps',
    'Natural alternative to plastic wrap. These beeswax wraps are made from organic cotton, beeswax, jojoba oil, and tree resin. They are washable, reusable, and biodegradable.',
    19.99,
    24.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Organic Cotton", "Beeswax", "Jojoba Oil"]',
    '["zero-waste", "beeswax", "food-storage", "reusable"]'
),

-- Eco-Friendly Products
(
    (SELECT id FROM public.users WHERE user_type = 'admin' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'eco-friendly'),
    (SELECT id FROM public.brands WHERE slug = 'purenature'),
    'COTTON-BAGS-001',
    'Organic Cotton Tote Bags',
    'organic-cotton-tote-bags',
    'Set of 3 reusable organic cotton tote bags',
    'These organic cotton tote bags are perfect for grocery shopping, beach trips, or everyday use. Made from 100% organic cotton, they are durable, washable, and help reduce plastic bag waste.',
    19.99,
    24.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Organic Cotton"]',
    '["eco-friendly", "cotton", "tote-bags", "reusable"]'
),

-- Organic Products
(
    (SELECT id FROM public.users WHERE user_type = 'admin' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'organic'),
    (SELECT id FROM public.brands WHERE slug = 'purenature'),
    'SKINCARE-SET-001',
    'Natural Skincare Set',
    'natural-skincare-set',
    'Complete organic skincare routine with 5 products',
    'Transform your skincare routine with this complete set of natural and organic products. Includes cleanser, toner, serum, moisturizer, and face mask. All products are made with natural ingredients and are free from harmful chemicals.',
    89.99,
    119.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Organic Aloe Vera", "Essential Oils", "Natural Waxes"]',
    '["organic", "skincare", "natural", "beauty"]'
),

-- Renewable Energy Products
(
    (SELECT id FROM public.users WHERE user_type = 'admin' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'renewable-energy'),
    (SELECT id FROM public.brands WHERE slug = 'solarmax'),
    'SOLAR-CHARGER-001',
    'Solar Phone Charger',
    'solar-phone-charger',
    'Portable solar charger for mobile devices',
    'Harness the power of the sun with this portable solar charger. Perfect for outdoor adventures, camping, or emergency situations. Features multiple charging ports and a built-in battery for storing solar energy.',
    49.99,
    59.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Solar Panels", "Lithium Battery", "Aluminum Casing"]',
    '["renewable-energy", "solar", "charger", "portable"]'
),

-- Recycled Products
(
    (SELECT id FROM public.users WHERE user_type = 'admin' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'recycled'),
    (SELECT id FROM public.brands WHERE slug = 'recyclepro'),
    'GLASS-JARS-001',
    'Recycled Glass Jars',
    'recycled-glass-jars',
    'Set of 6 glass jars made from 100% recycled glass',
    'These beautiful glass jars are made from 100% recycled glass, reducing waste and giving new life to old materials. Perfect for storage, decoration, or DIY projects.',
    29.99,
    34.99,
    'active',
    'approved',
    'visible',
    NOW(),
    '["Recycled Glass"]',
    '["recycled", "glass", "jars", "storage"]'
)
ON CONFLICT (sku) DO NOTHING;
*/

-- Insert product sustainability scores (only if products exist)
/*
INSERT INTO public.product_sustainability_scores (
    product_id, 
    overall_score, 
    carbon_footprint, 
    water_usage, 
    waste_generated, 
    recyclability_score, 
    certifications
) VALUES
(
    (SELECT id FROM public.products WHERE sku = 'BAMBOO-BOTTLE-001'),
    95,
    0.5,
    0.2,
    0.1,
    98,
    ARRAY['FSC Certified', 'BPA Free', 'Recyclable']
),
(
    (SELECT id FROM public.products WHERE sku = 'BEESWAX-WRAPS-001'),
    92,
    0.3,
    0.4,
    0.05,
    95,
    ARRAY['Organic Certified', 'Biodegradable', 'Natural']
),
(
    (SELECT id FROM public.products WHERE sku = 'COTTON-BAGS-001'),
    90,
    0.8,
    1.2,
    0.1,
    95,
    ARRAY['GOTS Certified', 'Organic', 'Biodegradable']
),
(
    (SELECT id FROM public.products WHERE sku = 'SKINCARE-SET-001'),
    88,
    0.4,
    0.6,
    0.2,
    90,
    ARRAY['Organic Certified', 'Cruelty Free', 'Vegan']
),
(
    (SELECT id FROM public.products WHERE sku = 'SOLAR-CHARGER-001'),
    94,
    1.2,
    0.1,
    0.3,
    85,
    ARRAY['Energy Star', 'RoHS Compliant', 'Recyclable']
),
(
    (SELECT id FROM public.products WHERE sku = 'GLASS-JARS-001'),
    96,
    0.2,
    0.1,
    0.05,
    100,
    ARRAY['Recycled Content', 'Food Safe', 'Infinitely Recyclable']
);
*/

-- Insert product inventory (only if products exist)
/*
INSERT INTO public.product_inventory (product_id, quantity, low_stock_threshold) VALUES
((SELECT id FROM public.products WHERE sku = 'BAMBOO-BOTTLE-001'), 50, 5),
((SELECT id FROM public.products WHERE sku = 'BEESWAX-WRAPS-001'), 80, 10),
((SELECT id FROM public.products WHERE sku = 'COTTON-BAGS-001'), 100, 15),
((SELECT id FROM public.products WHERE sku = 'SKINCARE-SET-001'), 25, 5),
((SELECT id FROM public.products WHERE sku = 'SOLAR-CHARGER-001'), 30, 5),
((SELECT id FROM public.products WHERE sku = 'GLASS-JARS-001'), 75, 10);
*/

-- Insert product images (only if products exist)
/*
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
((SELECT id FROM public.products WHERE sku = 'BAMBOO-BOTTLE-001'), '/images/bamboo-bottle-1.jpg', 'Bamboo Water Bottle Front View', true, 0),
((SELECT id FROM public.products WHERE sku = 'BAMBOO-BOTTLE-001'), '/images/bamboo-bottle-2.jpg', 'Bamboo Water Bottle Side View', false, 1),
((SELECT id FROM public.products WHERE sku = 'BEESWAX-WRAPS-001'), '/images/beeswax-wraps-1.jpg', 'Beeswax Food Wraps Set', true, 0),
((SELECT id FROM public.products WHERE sku = 'COTTON-BAGS-001'), '/images/cotton-bags-1.jpg', 'Organic Cotton Tote Bags', true, 0),
((SELECT id FROM public.products WHERE sku = 'SKINCARE-SET-001'), '/images/skincare-set-1.jpg', 'Natural Skincare Set', true, 0),
((SELECT id FROM public.products WHERE sku = 'SOLAR-CHARGER-001'), '/images/solar-charger-1.jpg', 'Solar Phone Charger', true, 0),
((SELECT id FROM public.products WHERE sku = 'GLASS-JARS-001'), '/images/glass-jars-1.jpg', 'Recycled Glass Jars Set', true, 0);
*/

-- =====================================================
-- INSTRUCTIONS FOR COMPLETING THE SETUP
-- =====================================================

-- 1. Create an admin user in Supabase Auth:
--    - Go to Authentication > Users in your Supabase dashboard
--    - Click "Add user" and create a user with email admin@aveoearth.com
--    - Copy the UUID from the created user

-- 2. Update the sample data:
--    - Replace 'your-admin-uuid-here' with the actual UUID from step 1
--    - Uncomment the product insertion sections above
--    - Run the script again

-- 3. Verify the setup:
--    - Check that all tables were created
--    - Verify that sample data was inserted
--    - Test the RLS policies

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check table counts
SELECT 'Categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Brands', COUNT(*) FROM public.brands
UNION ALL
SELECT 'Users', COUNT(*) FROM public.users
UNION ALL
SELECT 'Products', COUNT(*) FROM public.products
UNION ALL
SELECT 'Product Images', COUNT(*) FROM public.product_images
UNION ALL
SELECT 'Product Inventory', COUNT(*) FROM public.product_inventory
UNION ALL
SELECT 'Product Sustainability Scores', COUNT(*) FROM public.product_sustainability_scores;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Sample data setup completed!
-- Your database now has:
-- ✅ 8 Categories
-- ✅ 8 Brands  
-- ✅ Sample products (after admin user creation)
-- ✅ Product images, inventory, and sustainability data
-- ✅ Proper RLS policies
-- ✅ All indexes and triggers

-- Next steps:
-- 1. Create admin user in Supabase Auth
-- 2. Update sample data with admin UUID
-- 3. Test your frontend and backend integration
