-- Add categories to the database (from CategoryBubbles.tsx + additional ones)
INSERT INTO categories (id, name, slug, description, is_active, sort_order, created_at, updated_at) VALUES
-- Frontend categories (6 main ones from CategoryBubbles.tsx)
('550e8400-e29b-41d4-a716-446655440001', 'Home & Living', 'home-living', 'Eco-friendly home essentials, kitchenware, and living products', true, 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Sustainable Fashion', 'sustainable-fashion', 'Ethically made wardrobe staples, organic clothing', true, 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Upcycled & Handmade', 'upcycled-handmade', 'Artisan goods made from reclaimed materials', true, 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Clean Beauty', 'clean-beauty', 'Cruelty-free, natural skincare and beauty products', true, 4, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Fitness', 'fitness', 'Eco-friendly fitness gear, yoga accessories, and activewear', true, 5, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Pets', 'pets', 'Sustainable pet care products, eco-friendly toys and accessories', true, 6, NOW(), NOW()),

-- Additional categories (4 more)
('550e8400-e29b-41d4-a716-446655440007', 'Electronics & Gadgets', 'electronics-gadgets', 'Sustainable electronics, gadgets, and tech accessories', true, 7, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Health & Wellness', 'health-wellness', 'Natural health products, organic supplements, and wellness items', true, 8, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Food & Beverages', 'food-beverages', 'Organic food, sustainable beverages, and eco-friendly consumables', true, 9, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'Kids & Baby', 'kids-baby', 'Sustainable baby products, eco-friendly children\'s items, and organic kids\' essentials', true, 10, NOW(), NOW());

-- Add some brands as well
INSERT INTO brands (id, name, slug, description, is_active, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'EcoTech', 'ecotech', 'Leading sustainable technology solutions', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'GreenHome', 'greenhome', 'Eco-friendly home and living products', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'OrganicWear', 'organicwear', 'Sustainable fashion and organic clothing', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'NaturalHealth', 'naturalhealth', 'Natural health and wellness products', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', 'PureBeauty', 'purebeauty', 'Natural beauty and personal care products', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440006', 'FarmFresh', 'farmfresh', 'Organic food and sustainable beverages', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440007', 'ActiveGreen', 'activegreen', 'Sustainable sports and outdoor gear', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440008', 'GreenOffice', 'greenoffice', 'Eco-friendly office and business supplies', true, NOW(), NOW());
