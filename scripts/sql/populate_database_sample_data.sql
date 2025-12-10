-- =====================================================
-- POPULATE DATABASE WITH MINIMAL SAMPLE DATA
-- This script adds essential data to test all workflows
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, description, slug, is_active, created_at, updated_at) VALUES
('Kitchen & Dining', 'Sustainable kitchen and dining products', 'kitchen-dining', true, NOW(), NOW()),
('Fashion & Accessories', 'Eco-friendly fashion and accessories', 'fashion-accessories', true, NOW(), NOW()),
('Electronics', 'Sustainable electronics and gadgets', 'electronics', true, NOW(), NOW()),
('Home & Garden', 'Eco-friendly home and garden products', 'home-garden', true, NOW(), NOW()),
('Health & Beauty', 'Natural health and beauty products', 'health-beauty', true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert sample brands
INSERT INTO brands (name, description, logo_url, website_url, is_active, created_at, updated_at) VALUES
('EcoLife', 'Leading sustainable lifestyle brand', 'https://example.com/ecolife-logo.png', 'https://ecolife.com', true, NOW(), NOW()),
('GreenStyle', 'Fashion-forward eco-friendly clothing', 'https://example.com/greenstyle-logo.png', 'https://greenstyle.com', true, NOW(), NOW()),
('SolarTech', 'Innovative solar-powered solutions', 'https://example.com/solartech-logo.png', 'https://solartech.com', true, NOW(), NOW()),
('GlassCraft', 'Beautiful recycled glass products', 'https://example.com/glasscraft-logo.png', 'https://glasscraft.com', true, NOW(), NOW()),
('HempWear', 'Premium hemp fabric clothing', 'https://example.com/hempwear-logo.png', 'https://hempwear.com', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (
    name, description, price, category_id, brand_id, stock_quantity, 
    sustainability_score, weight, dimensions, material, color, size, 
    sku, tags, status, approval_status, visibility, created_at, updated_at
) VALUES
(
    'Eco Bamboo Water Bottle',
    'Sustainable bamboo water bottle with leak-proof design',
    24.99,
    (SELECT id FROM categories WHERE slug = 'kitchen-dining' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'EcoLife' LIMIT 1),
    50,
    9.2,
    '0.3 kg',
    '20x8x8 cm',
    'Bamboo',
    'Natural',
    '500ml',
    'BAMBOO-BOTTLE-001',
    'bamboo,sustainable,water bottle,eco-friendly',
    'active',
    'approved',
    'visible',
    NOW(),
    NOW()
),
(
    'Organic Cotton Tote Bag',
    'Reusable organic cotton tote bag for shopping',
    12.99,
    (SELECT id FROM categories WHERE slug = 'fashion-accessories' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'GreenStyle' LIMIT 1),
    100,
    9.5,
    '0.2 kg',
    '40x35x10 cm',
    'Organic Cotton',
    'Natural',
    'Large',
    'COTTON-TOTE-002',
    'cotton,organic,tote bag,reusable',
    'active',
    'approved',
    'visible',
    NOW(),
    NOW()
),
(
    'Solar Power Bank',
    'Portable solar power bank for eco-friendly charging',
    89.99,
    (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'SolarTech' LIMIT 1),
    25,
    8.8,
    '0.5 kg',
    '15x8x2 cm',
    'Recycled Plastic',
    'Black',
    '10000mAh',
    'SOLAR-POWER-003',
    'solar,power bank,renewable energy,portable',
    'active',
    'approved',
    'visible',
    NOW(),
    NOW()
),
(
    'Recycled Glass Storage Jar',
    'Beautiful recycled glass jar for food storage',
    18.99,
    (SELECT id FROM categories WHERE slug = 'kitchen-dining' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'GlassCraft' LIMIT 1),
    75,
    9.7,
    '0.4 kg',
    '12x12x12 cm',
    'Recycled Glass',
    'Clear',
    '1L',
    'GLASS-JAR-004',
    'glass,recycled,storage,food safe',
    'active',
    'approved',
    'visible',
    NOW(),
    NOW()
),
(
    'Hemp Fabric T-Shirt',
    'Comfortable hemp fabric t-shirt, sustainable fashion',
    29.99,
    (SELECT id FROM categories WHERE slug = 'fashion-accessories' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'HempWear' LIMIT 1),
    60,
    9.3,
    '0.3 kg',
    'Regular Fit',
    'Hemp Fabric',
    'Natural',
    'Medium',
    'HEMP-SHIRT-005',
    'hemp,fabric,t-shirt,sustainable fashion',
    'active',
    'approved',
    'visible',
    NOW(),
    NOW()
);

-- Insert sample product images (placeholder URLs)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order, created_at, updated_at)
SELECT 
    p.id,
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
    p.name || ' - Main Image',
    true,
    1,
    NOW(),
    NOW()
FROM products p
WHERE p.sku = 'BAMBOO-BOTTLE-001';

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order, created_at, updated_at)
SELECT 
    p.id,
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    p.name || ' - Main Image',
    true,
    1,
    NOW(),
    NOW()
FROM products p
WHERE p.sku = 'COTTON-TOTE-002';

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order, created_at, updated_at)
SELECT 
    p.id,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    p.name || ' - Main Image',
    true,
    1,
    NOW(),
    NOW()
FROM products p
WHERE p.sku = 'SOLAR-POWER-003';

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order, created_at, updated_at)
SELECT 
    p.id,
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
    p.name || ' - Main Image',
    true,
    1,
    NOW(),
    NOW()
FROM products p
WHERE p.sku = 'GLASS-JAR-004';

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order, created_at, updated_at)
SELECT 
    p.id,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    p.name || ' - Main Image',
    true,
    1,
    NOW(),
    NOW()
FROM products p
WHERE p.sku = 'HEMP-SHIRT-005';

-- Insert sample inventory records
INSERT INTO product_inventory (product_id, quantity_available, quantity_reserved, quantity_sold, low_stock_threshold, created_at, updated_at)
SELECT 
    p.id,
    p.stock_quantity,
    0,
    0,
    10,
    NOW(),
    NOW()
FROM products p;

-- Verify the data was inserted
SELECT 'Categories inserted:' as info, COUNT(*) as count FROM categories;
SELECT 'Brands inserted:' as info, COUNT(*) as count FROM brands;
SELECT 'Products inserted:' as info, COUNT(*) as count FROM products;
SELECT 'Product images inserted:' as info, COUNT(*) as count FROM product_images;
SELECT 'Inventory records inserted:' as info, COUNT(*) as count FROM product_inventory;

SELECT 'Sample products:' as info;
SELECT p.name, p.price, c.name as category, b.name as brand, p.status, p.approval_status, p.visibility
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN brands b ON p.brand_id = b.id
ORDER BY p.created_at DESC;

SELECT 'Database population completed successfully!' as status;
