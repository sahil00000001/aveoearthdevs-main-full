-- Add Sample Products (Simple Version)
-- Using existing category and brand IDs

-- First, let's get the actual category and brand IDs from the database
-- We'll use the first available category and brand

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
    'Keep hydrated with our premium eco-friendly bamboo water bottle. Made from 100% sustainable bamboo, this bottle is perfect for daily use and helps reduce plastic waste.',
    (SELECT id FROM categories LIMIT 1), -- Use first available category
    (SELECT id FROM brands LIMIT 1), -- Use first available brand
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
    'Say goodbye to plastic bags with our premium organic cotton tote. Made from 100% organic cotton, this durable bag can hold up to 20kg and is machine washable.',
    (SELECT id FROM categories LIMIT 1 OFFSET 1), -- Use second category
    (SELECT id FROM brands LIMIT 1 OFFSET 1), -- Use second brand
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
    'Upgrade your oral hygiene with our sustainable bamboo toothbrush set. Each brush features soft charcoal-infused bristles and a biodegradable bamboo handle.',
    (SELECT id FROM categories LIMIT 1 OFFSET 2), -- Use third category
    (SELECT id FROM brands LIMIT 1 OFFSET 2), -- Use third brand
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
    'Never run out of power with our high-efficiency solar phone charger. Features 20,000mAh capacity, fast charging technology, and weather-resistant design.',
    (SELECT id FROM categories LIMIT 1 OFFSET 3), -- Use fourth category
    (SELECT id FROM brands LIMIT 1 OFFSET 3), -- Use fourth brand
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
    'Transform your skincare routine with our premium organic skincare set. Includes cleanser, toner, moisturizer, and serum - all made with natural ingredients.',
    (SELECT id FROM categories LIMIT 1 OFFSET 4), -- Use fifth category
    (SELECT id FROM brands LIMIT 1 OFFSET 4), -- Use fifth brand
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
)
ON CONFLICT (sku) DO NOTHING;
