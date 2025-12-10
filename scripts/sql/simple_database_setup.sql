-- Simple Database Setup - Only Categories and Brands
-- This avoids user authentication issues and foreign key constraints

-- Add categories (from CategoryBubbles.tsx)
INSERT INTO categories (id, name, slug, description, parent_id, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Home & Living', 'home-living', 'Sustainable home essentials and eco-friendly living products', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Sustainable Fashion', 'sustainable-fashion', 'Ethical and eco-friendly clothing and accessories', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Clean Beauty', 'clean-beauty', 'Natural and organic beauty and personal care products', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Green Tech', 'green-tech', 'Energy-efficient and sustainable technology solutions', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Zero Waste', 'zero-waste', 'Products to help you live a zero-waste lifestyle', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Organic Food', 'organic-food', 'Organic and locally sourced food products', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Eco Travel', 'eco-travel', 'Sustainable travel gear and accessories', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Garden & Outdoor', 'garden-outdoor', 'Sustainable gardening and outdoor living products', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Pet Care', 'pet-care', 'Eco-friendly pet products and accessories', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'Office & Work', 'office-work', 'Sustainable office supplies and work accessories', NULL, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Add brands
INSERT INTO brands (id, name, slug, description, website_url, logo_url, is_active, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'EcoTech', 'ecotech', 'Leading sustainable technology solutions', 'https://ecotech.com', NULL, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'GreenLife', 'greenlife', 'Premium eco-friendly lifestyle products', 'https://greenlife.com', NULL, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'PureBeauty', 'purebeauty', 'Natural and organic beauty products', 'https://purebeauty.com', NULL, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'ZeroWaste Co', 'zerowaste-co', 'Complete zero-waste living solutions', 'https://zerowaste.co', NULL, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', 'Organic Harvest', 'organic-harvest', 'Fresh organic food and produce', 'https://organicharvest.com', NULL, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440006', 'EcoTravel', 'ecotravel', 'Sustainable travel gear and accessories', 'https://ecotravel.com', NULL, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440007', 'Garden Green', 'garden-green', 'Sustainable gardening solutions', 'https://gardengreen.com', NULL, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440008', 'Pet Eco', 'pet-eco', 'Eco-friendly pet care products', 'https://peteco.com', NULL, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
