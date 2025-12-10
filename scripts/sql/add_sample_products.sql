-- Add Sample Products to AveoEarth Database
-- This will populate the marketplace with sustainable products

-- Sample Products
INSERT INTO products (
    id, supplier_id, name, slug, sku, short_description, description,
    category_id, brand_id, price, compare_at_price, cost_per_item,
    track_quantity, weight, materials, care_instructions, origin_country,
    status, visibility, created_at, updated_at
) VALUES 
-- Eco Bamboo Water Bottle
(
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000', -- Dummy supplier ID
    'Eco Bamboo Water Bottle',
    'eco-bamboo-water-bottle',
    'BAMBOO-BOTTLE-001',
    'Sustainable bamboo water bottle for eco-conscious consumers',
    'Keep hydrated with our premium eco-friendly bamboo water bottle. Made from 100% sustainable bamboo, this bottle is perfect for daily use and helps reduce plastic waste. Features a leak-proof design and is BPA-free.',
    '550e8400-e29b-41d4-a716-446655440001', -- Home & Living
    '660e8400-e29b-41d4-a716-446655440001', -- EcoTech
    29.99,
    39.99,
    15.00,
    true,
    0.5,
    '["bamboo", "stainless steel", "silicone"]',
    'Hand wash with mild soap, air dry completely',
    'India',
    'active',
    'visible',
    NOW(),
    NOW()
),

-- Organic Cotton Tote Bag
(
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'Organic Cotton Tote Bag',
    'organic-cotton-tote-bag',
    'COTTON-TOTE-001',
    'Reusable organic cotton tote bag for sustainable shopping',
    'Say goodbye to plastic bags with our premium organic cotton tote. Made from 100% organic cotton, this durable bag can hold up to 20kg and is machine washable. Perfect for grocery shopping, beach trips, or daily errands.',
    '550e8400-e29b-41d4-a716-446655440002', -- Sustainable Fashion
    '660e8400-e29b-41d4-a716-446655440002', -- GreenLife
    15.99,
    25.99,
    8.00,
    true,
    0.2,
    '["organic cotton", "natural dyes"]',
    'Machine wash cold, air dry',
    'India',
    'active',
    'visible',
    NOW(),
    NOW()
),

-- Natural Bamboo Toothbrush Set
(
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'Natural Bamboo Toothbrush Set',
    'natural-bamboo-toothbrush-set',
    'BAMBOO-BRUSH-001',
    'Eco-friendly bamboo toothbrush set with charcoal bristles',
    'Upgrade your oral hygiene with our sustainable bamboo toothbrush set. Each brush features soft charcoal-infused bristles and a biodegradable bamboo handle. Set includes 4 brushes with different bristle firmness levels.',
    '550e8400-e29b-41d4-a716-446655440004', -- Clean Beauty
    '660e8400-e29b-41d4-a716-446655440003', -- PureBeauty
    24.99,
    34.99,
    12.00,
    true,
    0.1,
    '["bamboo", "charcoal bristles", "natural rubber"]',
    'Rinse after use, air dry, replace every 3 months',
    'India',
    'active',
    'visible',
    NOW(),
    NOW()
),

-- Solar Phone Charger
(
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'Solar Phone Charger',
    'solar-phone-charger',
    'SOLAR-CHARGER-001',
    'Portable solar charger for eco-friendly device charging',
    'Never run out of power with our high-efficiency solar phone charger. Features 20,000mAh capacity, fast charging technology, and weather-resistant design. Perfect for camping, hiking, or emergency situations.',
    '550e8400-e29b-41d4-a716-446655440007', -- Electronics & Gadgets
    '660e8400-e29b-41d4-a716-446655440001', -- EcoTech
    89.99,
    119.99,
    45.00,
    true,
    0.8,
    '["solar panels", "lithium battery", "aluminum casing"]',
    'Keep in sunlight for optimal charging, avoid extreme temperatures',
    'China',
    'active',
    'visible',
    NOW(),
    NOW()
),

-- Organic Skincare Set
(
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'Organic Skincare Set',
    'organic-skincare-set',
    'ORGANIC-SKIN-001',
    'Complete organic skincare routine for healthy, glowing skin',
    'Transform your skincare routine with our premium organic skincare set. Includes cleanser, toner, moisturizer, and serum - all made with natural ingredients like aloe vera, rosehip oil, and vitamin E. Cruelty-free and vegan.',
    '550e8400-e29b-41d4-a716-446655440004', -- Clean Beauty
    '660e8400-e29b-41d4-a716-446655440003', -- PureBeauty
    79.99,
    99.99,
    40.00,
    true,
    0.6,
    '["aloe vera", "rosehip oil", "vitamin E", "natural preservatives"]',
    'Store in cool, dry place, use within 12 months of opening',
    'India',
    'active',
    'visible',
    NOW(),
    NOW()
),

-- Compostable Food Storage Set
(
    '66666666-6666-6666-6666-666666666666',
    '00000000-0000-0000-0000-000000000000',
    'Compostable Food Storage Set',
    'compostable-food-storage-set',
    'COMPOST-STORAGE-001',
    'Zero-waste food storage containers made from plant materials',
    'Store your food sustainably with our compostable storage set. Made from plant-based materials, these containers are microwave-safe, freezer-friendly, and completely biodegradable. Set includes various sizes for all your storage needs.',
    '550e8400-e29b-41d4-a716-446655440005', -- Zero Waste
    '660e8400-e29b-41d4-a716-446655440004', -- ZeroWaste Co
    34.99,
    49.99,
    18.00,
    true,
    0.4,
    '["plant-based plastic", "cornstarch", "natural additives"]',
    'Hand wash recommended, compost after use',
    'India',
    'active',
    'visible',
    NOW(),
    NOW()
),

-- Organic Green Tea
(
    '77777777-7777-7777-7777-777777777777',
    '00000000-0000-0000-0000-000000000000',
    'Organic Green Tea',
    'organic-green-tea',
    'ORGANIC-TEA-001',
    'Premium organic green tea from sustainable farms',
    'Experience the pure taste of nature with our premium organic green tea. Sourced from certified organic farms, this tea is rich in antioxidants and has a delicate, refreshing flavor. Packaged in biodegradable tea bags.',
    '550e8400-e29b-41d4-a716-446655440009', -- Food & Beverages
    '660e8400-e29b-41d4-a716-446655440005', -- Organic Harvest
    12.99,
    18.99,
    6.00,
    true,
    0.1,
    '["organic green tea leaves", "biodegradable packaging"]',
    'Store in cool, dry place, use within 2 years',
    'India',
    'active',
    'visible',
    NOW(),
    NOW()
),

-- Eco Yoga Mat
(
    '88888888-8888-8888-8888-888888888888',
    '00000000-0000-0000-0000-000000000000',
    'Eco Yoga Mat',
    'eco-yoga-mat',
    'ECO-YOGA-001',
    'Sustainable yoga mat made from natural rubber',
    'Find your zen with our eco-friendly yoga mat. Made from natural rubber and recycled materials, this mat provides excellent grip and cushioning. Non-toxic and biodegradable, perfect for mindful practice.',
    '550e8400-e29b-41d4-a716-446655440005', -- Fitness
    '660e8400-e29b-41d4-a716-446655440002', -- GreenLife
    49.99,
    69.99,
    25.00,
    true,
    1.2,
    '["natural rubber", "recycled materials", "non-toxic dyes"]',
    'Wipe clean with damp cloth, air dry, avoid direct sunlight',
    'India',
    'active',
    'visible',
    NOW(),
    NOW()
),

-- Sustainable Pet Bowl Set
(
    '99999999-9999-9999-9999-999999999999',
    '00000000-0000-0000-0000-000000000000',
    'Sustainable Pet Bowl Set',
    'sustainable-pet-bowl-set',
    'PET-BOWL-001',
    'Eco-friendly pet bowls made from bamboo fiber',
    'Keep your furry friends happy and healthy with our sustainable pet bowl set. Made from bamboo fiber, these bowls are durable, easy to clean, and completely biodegradable. Set includes food and water bowls in different sizes.',
    '550e8400-e29b-41d4-a716-446655440006', -- Pets
    '660e8400-e29b-41d4-a716-446655440008', -- Pet Eco
    29.99,
    39.99,
    15.00,
    true,
    0.3,
    '["bamboo fiber", "food-grade silicone", "natural dyes"]',
    'Dishwasher safe, hand wash recommended',
    'India',
    'active',
    'visible',
    NOW(),
    NOW()
),

-- Recycled Office Supplies Set
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000000',
    'Recycled Office Supplies Set',
    'recycled-office-supplies-set',
    'OFFICE-SUPPLIES-001',
    'Complete eco-friendly office supplies made from recycled materials',
    'Green your workspace with our recycled office supplies set. Includes notebooks, pens, folders, and desk organizers - all made from recycled paper and plastic. Help reduce waste while staying organized.',
    '550e8400-e29b-41d4-a716-446655440010', -- Kids & Baby
    '660e8400-e29b-41d4-a716-446655440007', -- Garden Green
    19.99,
    29.99,
    10.00,
    true,
    0.5,
    '["recycled paper", "recycled plastic", "soy-based ink"]',
    'Store in dry place, avoid moisture',
    'India',
    'active',
    'visible',
    NOW(),
    NOW()
)
ON CONFLICT (sku) DO NOTHING;

-- Add product inventory for each product
INSERT INTO product_inventory (
    id, product_id, variant_id, quantity, reserved_quantity,
    low_stock_threshold, created_at, updated_at
) VALUES 
('inv-001', '11111111-1111-1111-1111-111111111111', NULL, 50, 0, 10, NOW(), NOW()),
('inv-002', '22222222-2222-2222-2222-222222222222', NULL, 100, 0, 20, NOW(), NOW()),
('inv-003', '33333333-3333-3333-3333-333333333333', NULL, 75, 0, 15, NOW(), NOW()),
('inv-004', '44444444-4444-4444-4444-444444444444', NULL, 25, 0, 5, NOW(), NOW()),
('inv-005', '55555555-5555-5555-5555-555555555555', NULL, 40, 0, 8, NOW(), NOW()),
('inv-006', '66666666-6666-6666-6666-666666666666', NULL, 60, 0, 12, NOW(), NOW()),
('inv-007', '77777777-7777-7777-7777-777777777777', NULL, 200, 0, 40, NOW(), NOW()),
('inv-008', '88888888-8888-8888-8888-888888888888', NULL, 30, 0, 6, NOW(), NOW()),
('inv-009', '99999999-9999-9999-9999-999999999999', NULL, 45, 0, 9, NOW(), NOW()),
('inv-010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 80, 0, 16, NOW(), NOW())
ON CONFLICT (product_id, variant_id) DO NOTHING;
