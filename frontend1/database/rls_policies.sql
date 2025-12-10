-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Run this AFTER the main schema is created
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sustainability_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Brands are viewable by everyone" ON public.brands;
DROP POLICY IF EXISTS "Only admins can manage brands" ON public.brands;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Suppliers can manage their own products" ON public.products;
DROP POLICY IF EXISTS "Product variants are viewable by everyone" ON public.product_variants;
DROP POLICY IF EXISTS "Suppliers can manage their product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON public.product_images;
DROP POLICY IF EXISTS "Suppliers can manage their product images" ON public.product_images;
DROP POLICY IF EXISTS "Suppliers can view their product inventory" ON public.product_inventory;
DROP POLICY IF EXISTS "Suppliers can manage their product inventory" ON public.product_inventory;
DROP POLICY IF EXISTS "Sustainability scores are viewable by everyone" ON public.product_sustainability_scores;
DROP POLICY IF EXISTS "Suppliers can manage their product sustainability scores" ON public.product_sustainability_scores;
DROP POLICY IF EXISTS "Price history is viewable by everyone" ON public.product_price_history;
DROP POLICY IF EXISTS "Suppliers can create price history for their products" ON public.product_price_history;
DROP POLICY IF EXISTS "Product views are viewable by everyone" ON public.product_views;
DROP POLICY IF EXISTS "Anyone can create product views" ON public.product_views;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can view their own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can view their cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can manage their cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Suppliers can view orders with their products" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Suppliers can view order items for their products" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view payments for their orders" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view shipments for their orders" ON public.shipments;
DROP POLICY IF EXISTS "Admins can manage all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Users can view their own returns" ON public.returns;
DROP POLICY IF EXISTS "Users can create returns for their orders" ON public.returns;
DROP POLICY IF EXISTS "Admins can manage all returns" ON public.returns;
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Admins can manage all referrals" ON public.referrals;
DROP POLICY IF EXISTS "Suppliers can view their own business" ON public.supplier_businesses;
DROP POLICY IF EXISTS "Suppliers can manage their own business" ON public.supplier_businesses;
DROP POLICY IF EXISTS "Admins can view all supplier businesses" ON public.supplier_businesses;
DROP POLICY IF EXISTS "Product verifications are viewable by everyone" ON public.product_verifications;
DROP POLICY IF EXISTS "Admins can manage product verifications" ON public.product_verifications;
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can manage their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can view messages in their sessions" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.ai_chat_messages;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Addresses policies
CREATE POLICY "Users can view their own addresses" ON public.addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Brands policies
CREATE POLICY "Brands are viewable by everyone" ON public.brands
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage brands" ON public.brands
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (status = 'active' AND visibility = 'visible');

CREATE POLICY "Suppliers can manage their own products" ON public.products
    FOR ALL USING (
        supplier_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Product variants policies
CREATE POLICY "Product variants are viewable by everyone" ON public.product_variants
    FOR SELECT USING (true);

CREATE POLICY "Suppliers can manage their product variants" ON public.product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = product_id AND supplier_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Product images policies
CREATE POLICY "Product images are viewable by everyone" ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Suppliers can manage their product images" ON public.product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = product_id AND supplier_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Product inventory policies
CREATE POLICY "Suppliers can view their product inventory" ON public.product_inventory
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = product_id AND supplier_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Suppliers can manage their product inventory" ON public.product_inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = product_id AND supplier_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Product sustainability scores policies
CREATE POLICY "Sustainability scores are viewable by everyone" ON public.product_sustainability_scores
    FOR SELECT USING (true);

CREATE POLICY "Suppliers can manage their product sustainability scores" ON public.product_sustainability_scores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = product_id AND supplier_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Product price history policies
CREATE POLICY "Price history is viewable by everyone" ON public.product_price_history
    FOR SELECT USING (true);

CREATE POLICY "Suppliers can create price history for their products" ON public.product_price_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = product_id AND supplier_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Product views policies
CREATE POLICY "Product views are viewable by everyone" ON public.product_views
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create product views" ON public.product_views
    FOR INSERT WITH CHECK (true);

-- Product reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.product_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Wishlists policies
CREATE POLICY "Users can view their own wishlist" ON public.wishlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist" ON public.wishlists
    FOR ALL USING (auth.uid() = user_id);

-- Carts policies
CREATE POLICY "Users can view their own cart" ON public.carts
    FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can manage their own cart" ON public.carts
    FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Cart items policies
CREATE POLICY "Users can view their cart items" ON public.cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE id = cart_id AND (user_id = auth.uid() OR session_id IS NOT NULL)
        )
    );

CREATE POLICY "Users can manage their cart items" ON public.cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE id = cart_id AND (user_id = auth.uid() OR session_id IS NOT NULL)
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Suppliers can view orders with their products" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.order_items 
            WHERE order_id = id AND supplier_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Order items policies
CREATE POLICY "Users can view order items for their orders" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Suppliers can view order items for their products" ON public.order_items
    FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Admins can manage all order items" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Payments policies
CREATE POLICY "Users can view payments for their orders" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Shipments policies
CREATE POLICY "Users can view shipments for their orders" ON public.shipments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all shipments" ON public.shipments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Returns policies
CREATE POLICY "Users can view their own returns" ON public.returns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create returns for their orders" ON public.returns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all returns" ON public.returns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Referrals policies
CREATE POLICY "Users can view their own referrals" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage all referrals" ON public.referrals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Supplier businesses policies
CREATE POLICY "Suppliers can view their own business" ON public.supplier_businesses
    FOR SELECT USING (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can manage their own business" ON public.supplier_businesses
    FOR ALL USING (auth.uid() = supplier_id);

CREATE POLICY "Admins can view all supplier businesses" ON public.supplier_businesses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Product verifications policies
CREATE POLICY "Product verifications are viewable by everyone" ON public.product_verifications
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage product verifications" ON public.product_verifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- AI chat sessions policies
CREATE POLICY "Users can view their own chat sessions" ON public.ai_chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own chat sessions" ON public.ai_chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- AI chat messages policies
CREATE POLICY "Users can view messages in their sessions" ON public.ai_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ai_chat_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their sessions" ON public.ai_chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_chat_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- RLS policies creation completed successfully!
-- Your Supabase database now has proper Row Level Security policies.
