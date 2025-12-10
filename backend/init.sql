-- AveoEarth Database Initialization
-- ===================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS aveoearth;

-- Connect to the database
\c aveoearth;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create roles enum
CREATE TYPE user_role AS ENUM ('buyer', 'supplier', 'admin');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    user_type user_role DEFAULT 'buyer',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL,
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    cost_per_item DECIMAL(10,2),
    track_quantity BOOLEAN DEFAULT TRUE,
    continue_selling BOOLEAN DEFAULT FALSE,
    weight DECIMAL(8,3),
    dimensions JSONB DEFAULT '{}',
    materials JSONB DEFAULT '[]',
    care_instructions TEXT,
    origin_country VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    approval_status VARCHAR(50) DEFAULT 'pending',
    approval_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    visibility VARCHAR(50) DEFAULT 'visible',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags JSONB DEFAULT '[]',
    seo_meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product images table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    alt_text VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(visibility);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- Insert some demo categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('Eco-Friendly Products', 'eco-friendly', 'Sustainable and environmentally friendly products', true),
('Home & Garden', 'home-garden', 'Products for your home and garden', true),
('Fashion & Apparel', 'fashion-apparel', 'Sustainable fashion and clothing', true),
('Health & Beauty', 'health-beauty', 'Natural health and beauty products', true),
('Food & Beverages', 'food-beverages', 'Organic and healthy food products', true),
('Electronics', 'electronics', 'Energy-efficient electronic devices', true),
('Sports & Outdoors', 'sports-outdoors', 'Outdoor and sports equipment', true),
('Office & Stationery', 'office-stationery', 'Eco-friendly office supplies', true),
('Kitchen & Dining', 'kitchen-dining', 'Sustainable kitchen products', true),
('Bathroom', 'bathroom', 'Eco-friendly bathroom products', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert some demo brands
INSERT INTO brands (name, slug, description, is_active) VALUES
('EcoLife', 'ecolife', 'Sustainable living products', true),
('GreenEarth', 'greenearth', 'Environmental protection products', true),
('NatureFirst', 'naturefirst', 'Natural and organic products', true),
('Sustainable Living', 'sustainable-living', 'Eco-friendly lifestyle products', true),
('EarthWise', 'earthwise', 'Smart environmental solutions', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert demo user
INSERT INTO users (email, first_name, last_name, user_type, is_verified, is_active) VALUES
('admin@aveoearth.com', 'Admin', 'User', 'admin', true, true),
('supplier@aveoearth.com', 'Test', 'Supplier', 'supplier', true, true),
('buyer@aveoearth.com', 'Test', 'Buyer', 'buyer', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert some demo products
INSERT INTO products (
    supplier_id, category_id, brand_id, sku, name, slug, short_description, description,
    price, compare_at_price, track_quantity, weight, materials, care_instructions,
    origin_country, status, approval_status, visibility, tags
) VALUES
(
    (SELECT id FROM users WHERE email = 'supplier@aveoearth.com'),
    (SELECT id FROM categories WHERE slug = 'eco-friendly'),
    (SELECT id FROM brands WHERE slug = 'ecolife'),
    'DEMO-001', 'Eco-Friendly Water Bottle', 'eco-friendly-water-bottle',
    'Sustainable reusable water bottle',
    'Made from recycled materials, BPA-free, and perfect for staying hydrated on the go.',
    24.99, 29.99, true, 0.3, '["stainless steel"]', 'Wash with mild soap and water',
    'USA', 'active', 'approved', 'visible', '["eco", "water bottle", "sustainable", "reusable"]'
),
(
    (SELECT id FROM users WHERE email = 'supplier@aveoearth.com'),
    (SELECT id FROM categories WHERE slug = 'fashion-apparel'),
    (SELECT id FROM brands WHERE slug = 'naturefirst'),
    'DEMO-002', 'Organic Cotton T-Shirt', 'organic-cotton-t-shirt',
    'Comfortable organic cotton tee',
    'Made from 100% organic cotton, soft, breathable, and environmentally friendly.',
    19.99, 22.99, true, 0.15, '["organic cotton"]', 'Machine wash cold, gentle cycle',
    'India', 'active', 'approved', 'visible', '["organic", "cotton", "t-shirt", "fashion"]'
),
(
    (SELECT id FROM users WHERE email = 'supplier@aveoearth.com'),
    (SELECT id FROM categories WHERE slug = 'health-beauty'),
    (SELECT id FROM brands WHERE slug = 'greenearth'),
    'DEMO-003', 'Bamboo Toothbrushes Set', 'bamboo-toothbrushes-set',
    'Natural bamboo toothbrushes',
    'Set of 4 biodegradable bamboo toothbrushes with soft bristles.',
    12.99, 14.99, true, 0.1, '["bamboo"]', 'Replace every 3 months',
    'China', 'active', 'approved', 'visible', '["bamboo", "toothbrush", "eco-friendly", "biodegradable"]'
),
(
    (SELECT id FROM users WHERE email = 'supplier@aveoearth.com'),
    (SELECT id FROM categories WHERE slug = 'office-stationery'),
    (SELECT id FROM brands WHERE slug = 'earthwise'),
    'DEMO-004', 'Recycled Paper Notebook', 'recycled-paper-notebook',
    'Eco-friendly notebook',
    'Made from 100% recycled paper, perfect for jotting down notes, ideas, or sketches.',
    8.99, 9.99, true, 0.2, '["recycled paper"]', 'Keep away from moisture',
    'USA', 'active', 'approved', 'visible', '["recycled", "paper", "notebook", "spiral"]'
),
(
    (SELECT id FROM users WHERE email = 'supplier@aveoearth.com'),
    (SELECT id FROM categories WHERE slug = 'electronics'),
    (SELECT id FROM brands WHERE slug = 'sustainable-living'),
    'DEMO-005', 'Solar-Powered Charger', 'solar-powered-charger',
    'Portable solar charger',
    'Compact solar-powered charger that can power your devices using sunlight.',
    49.99, 54.99, true, 0.25, '["solar panel"]', 'Keep dry and clean',
    'China', 'active', 'approved', 'visible', '["solar", "charger", "portable", "outdoor"]'
)
ON CONFLICT (sku) DO NOTHING;

-- Insert demo product images
INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
(
    (SELECT id FROM products WHERE sku = 'DEMO-001'),
    '/media/placeholder-product.jpg',
    'Eco-Friendly Water Bottle',
    0, true
),
(
    (SELECT id FROM products WHERE sku = 'DEMO-002'),
    '/media/placeholder-product-2.jpg',
    'Organic Cotton T-Shirt',
    0, true
),
(
    (SELECT id FROM products WHERE sku = 'DEMO-003'),
    '/media/placeholder-product-3.jpg',
    'Bamboo Toothbrushes Set',
    0, true
),
(
    (SELECT id FROM products WHERE sku = 'DEMO-004'),
    '/media/placeholder-product-4.jpg',
    'Recycled Paper Notebook',
    0, true
),
(
    (SELECT id FROM products WHERE sku = 'DEMO-005'),
    '/media/placeholder-product-5.jpg',
    'Solar-Powered Charger',
    0, true
);






