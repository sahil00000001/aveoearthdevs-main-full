-- =====================================================
-- ADD BASIC CATEGORIES AND BRANDS
-- Add minimal data needed for vendor upload testing
-- =====================================================

-- Insert basic categories
INSERT INTO categories (name, description, slug, is_active, created_at, updated_at) VALUES
('Kitchen & Dining', 'Sustainable kitchen and dining products', 'kitchen-dining', true, NOW(), NOW()),
('Fashion & Accessories', 'Eco-friendly fashion and accessories', 'fashion-accessories', true, NOW(), NOW()),
('Electronics', 'Sustainable electronics and gadgets', 'electronics', true, NOW(), NOW()),
('Home & Garden', 'Eco-friendly home and garden products', 'home-garden', true, NOW(), NOW()),
('Health & Beauty', 'Natural health and beauty products', 'health-beauty', true, NOW(), NOW());

-- Insert basic brands (only using columns that exist)
INSERT INTO brands (name, description, logo_url, slug, is_active, created_at, updated_at) VALUES
('EcoLife', 'Leading sustainable lifestyle brand', 'https://example.com/ecolife-logo.png', 'ecolife', true, NOW(), NOW()),
('GreenStyle', 'Fashion-forward eco-friendly clothing', 'https://example.com/greenstyle-logo.png', 'greenstyle', true, NOW(), NOW()),
('SolarTech', 'Innovative solar-powered solutions', 'https://example.com/solartech-logo.png', 'solartech', true, NOW(), NOW()),
('GlassCraft', 'Beautiful recycled glass products', 'https://example.com/glasscraft-logo.png', 'glasscraft', true, NOW(), NOW()),
('HempWear', 'Premium hemp fabric clothing', 'https://example.com/hempwear-logo.png', 'hempwear', true, NOW(), NOW());

-- Verify the data was inserted
SELECT 'Categories inserted:' as info, COUNT(*) as count FROM categories;
SELECT 'Brands inserted:' as info, COUNT(*) as count FROM brands;

SELECT 'Sample categories:' as info;
SELECT id, name, slug FROM categories ORDER BY created_at DESC LIMIT 5;

SELECT 'Sample brands:' as info;
SELECT id, name FROM brands ORDER BY created_at DESC LIMIT 5;

SELECT 'Basic categories and brands added successfully!' as status;
