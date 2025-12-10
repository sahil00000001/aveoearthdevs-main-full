// Script to load sample data into Supabase database
// Run this in your browser console on the Supabase dashboard or use the SQL editor

const sampleData = `
-- First, let's check if we have any data
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as category_count FROM categories;

-- If counts are 0, run the sample data below:

-- Insert categories first
INSERT INTO public.categories (name, description) VALUES
('Home & Living', 'Eco-friendly home essentials, kitchenware, and living products'),
('Sustainable Fashion', 'Ethically made wardrobe staples, organic clothing'),
('Upcycled & Handmade', 'Artisan goods made from reclaimed materials'),
('Clean Beauty', 'Cruelty-free, natural skincare and beauty products'),
('Fitness', 'Eco-friendly fitness gear, yoga accessories, and activewear'),
('Pets', 'Sustainable pet care products, eco-friendly toys and accessories')
ON CONFLICT (name) DO NOTHING;

-- Insert products
INSERT INTO public.products (name, description, price, discount, category_id, stock, image_url, sustainability_score, created_at) VALUES
-- Home & Living Products
('Bamboo Kitchen Utensil Set', 'Eco-friendly bamboo utensil set. Heat resistant and gentle on cookware.', 1299, 32, (SELECT id FROM public.categories WHERE name = 'Home & Living' LIMIT 1), 75, '/images/bamboo-utensils.jpg', 95, NOW()),
('Organic Cotton Bath Towel', 'Soft and absorbent organic cotton bath towel. Chemical-free and sustainable.', 999, 10, (SELECT id FROM public.categories WHERE name = 'Home & Living' LIMIT 1), 80, '/images/cotton-towel.jpg', 90, NOW()),
('Beeswax Food Wraps Set', 'Set of 6 reusable beeswax food wraps. Natural alternative to plastic wrap.', 1299, 20, (SELECT id FROM public.categories WHERE name = 'Home & Living' LIMIT 1), 80, '/images/beeswax-wraps.jpg', 96, NOW()),
('Natural Jute Area Rug', 'Hand-woven jute rug. Biodegradable and adds a natural touch to your home.', 2999, 20, (SELECT id FROM public.categories WHERE name = 'Home & Living' LIMIT 1), 30, '/images/jute-rug.jpg', 85, NOW()),
('Eco-Friendly Dish Soap Refill', 'Concentrated dish soap refill. Plant-based and biodegradable.', 349, 5, (SELECT id FROM public.categories WHERE name = 'Home & Living' LIMIT 1), 200, '/images/dish-soap-refill.jpg', 92, NOW()),
('Bamboo Water Bottle', 'Premium bamboo water bottle with stainless steel interior. Naturally antibacterial.', 1299, 19, (SELECT id FROM public.categories WHERE name = 'Home & Living' LIMIT 1), 50, '/images/bamboo-bottle.jpg', 95, NOW()),

-- Sustainable Fashion
('Organic Cotton T-Shirt', '100% organic cotton t-shirt. Fair trade and sustainable fashion.', 899, 31, (SELECT id FROM public.categories WHERE name = 'Sustainable Fashion' LIMIT 1), 120, '/images/organic-tshirt.jpg', 89, NOW()),
('Linen Trousers - Earth Dye', 'Organic linen trousers with natural earth dye. Fair trade certified.', 1899, 24, (SELECT id FROM public.categories WHERE name = 'Sustainable Fashion' LIMIT 1), 60, '/images/linen-trousers.jpg', 89, NOW()),
('Hemp Denim Jacket', 'Sustainable hemp denim jacket. Durable and eco-friendly.', 2499, 20, (SELECT id FROM public.categories WHERE name = 'Sustainable Fashion' LIMIT 1), 35, '/images/hemp-jacket.jpg', 91, NOW()),

-- Clean Beauty
('Natural Skincare Set', 'Complete natural skincare routine. Cruelty-free and organic ingredients.', 1599, 15, (SELECT id FROM public.categories WHERE name = 'Clean Beauty' LIMIT 1), 45, '/images/skincare-set.jpg', 88, NOW()),
('Bamboo Makeup Brushes', 'Set of 8 bamboo makeup brushes. Vegan and sustainable.', 599, 25, (SELECT id FROM public.categories WHERE name = 'Clean Beauty' LIMIT 1), 100, '/images/bamboo-brushes.jpg', 94, NOW()),

-- Fitness
('Yoga Mat - Natural Rubber', 'Non-toxic natural rubber yoga mat. Biodegradable and eco-friendly.', 1299, 18, (SELECT id FROM public.categories WHERE name = 'Fitness' LIMIT 1), 25, '/images/yoga-mat.jpg', 87, NOW()),
('Organic Cotton Workout Set', 'Breathable organic cotton workout clothes. Sustainable activewear.', 1199, 22, (SELECT id FROM public.categories WHERE name = 'Fitness' LIMIT 1), 40, '/images/workout-set.jpg', 86, NOW()),

-- Pets
('Eco-Friendly Pet Bowl Set', 'Bamboo pet bowls with non-slip base. Sustainable pet care.', 799, 12, (SELECT id FROM public.categories WHERE name = 'Pets' LIMIT 1), 60, '/images/pet-bowls.jpg', 93, NOW()),
('Natural Pet Toys', 'Handmade natural pet toys. Safe and sustainable for your pets.', 399, 30, (SELECT id FROM public.categories WHERE name = 'Pets' LIMIT 1), 80, '/images/pet-toys.jpg', 90, NOW());

-- Check the results
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_categories FROM categories;
`;

console.log('Sample data SQL script:');
console.log(sampleData);

// Instructions for loading the data
console.log(`
📋 INSTRUCTIONS TO LOAD SAMPLE DATA:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: ylhvdwizcsoelpreftpy
3. Go to SQL Editor (left sidebar)
4. Click "New Query"
5. Copy and paste the SQL script above
6. Click "Run" to execute
7. Check the results - you should see product and category counts

After loading the data, refresh your app and the products should appear from the database!
`);
