from sqlalchemy import text
from app.core.logging import get_logger
import app.database.session as db_session

logger = get_logger("indexes")

async def create_database_indexes():
    if not db_session.async_engine:
        logger.warning("Database engine not available, skipping index creation")
        return
    
    try:
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
            "CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);", 
            "CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);",
            "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);",
            "CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);",
            "CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);",
            
            "CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);",
            
            "CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone ON otp_verifications(phone);",
            "CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);",
            "CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);",
            "CREATE INDEX IF NOT EXISTS idx_otp_verifications_created_at ON otp_verifications(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_otp_verifications_type ON otp_verifications(type);",
            
            "CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);",
            "CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);",
            "CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);",
            "CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);",
            
            "CREATE INDEX IF NOT EXISTS idx_supplier_businesses_supplier_id ON supplier_businesses(supplier_id);",
            "CREATE INDEX IF NOT EXISTS idx_supplier_businesses_status ON supplier_businesses(verification_status);",
            "CREATE INDEX IF NOT EXISTS idx_supplier_businesses_created_at ON supplier_businesses(created_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_supplier_documents_supplier_id ON supplier_documents(supplier_id);",
            "CREATE INDEX IF NOT EXISTS idx_supplier_documents_business_id ON supplier_documents(business_id);",
            "CREATE INDEX IF NOT EXISTS idx_supplier_documents_type ON supplier_documents(document_type);",
            "CREATE INDEX IF NOT EXISTS idx_supplier_documents_status ON supplier_documents(document_status);",
            
            "CREATE INDEX IF NOT EXISTS idx_supplier_sustainability_supplier_id ON supplier_sustainability(supplier_id);",
            "CREATE INDEX IF NOT EXISTS idx_supplier_sustainability_business_id ON supplier_sustainability(business_id);",
            "CREATE INDEX IF NOT EXISTS idx_supplier_sustainability_status ON supplier_sustainability(sustainability_status);",
            
            "CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);",
            "CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);",
            "CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);",
            "CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);",
            
            "CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);",
            "CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active);",
            "CREATE INDEX IF NOT EXISTS idx_brands_created_at ON brands(created_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);",
            "CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);",
            "CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);",
            "CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);",
            "CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);",
            "CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);",
            "CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);",
            "CREATE INDEX IF NOT EXISTS idx_products_approval_status ON products(approval_status);",
            "CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(visibility);",
            "CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_products_approved_at ON products(approved_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_images_variant_id ON product_images(variant_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(sort_order);",
            "CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);",
            
            "CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);",
            "CREATE INDEX IF NOT EXISTS idx_product_variants_is_default ON product_variants(is_default);",
            
            "CREATE INDEX IF NOT EXISTS idx_product_inventory_product_id ON product_inventory(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_inventory_variant_id ON product_inventory(variant_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_inventory_warehouse_id ON product_inventory(warehouse_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_inventory_quantity ON product_inventory(quantity);",
            "CREATE INDEX IF NOT EXISTS idx_product_inventory_location ON product_inventory(location);",
            
            "CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);",
            "CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at);",
            "CREATE INDEX IF NOT EXISTS idx_product_views_session_id ON product_views(session_id);",
            
            "CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_wishlists_added_at ON wishlists(added_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_product_sustainability_product_id ON product_sustainability_scores(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_sustainability_score ON product_sustainability_scores(overall_score);",
            "CREATE INDEX IF NOT EXISTS idx_product_sustainability_environmental ON product_sustainability_scores(environmental_score);",
            "CREATE INDEX IF NOT EXISTS idx_product_sustainability_calculated_at ON product_sustainability_scores(calculated_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price) WHERE status = 'active' AND approval_status = 'approved';",
            "CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status, approval_status);",
            "CREATE INDEX IF NOT EXISTS idx_products_supplier_status ON products(supplier_id, status, approval_status);",
            "CREATE INDEX IF NOT EXISTS idx_products_brand_status ON products(brand_id, status, approval_status) WHERE brand_id IS NOT NULL;",
            
            "CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_addresses_type ON addresses(type);",
            "CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);",
            "CREATE INDEX IF NOT EXISTS idx_addresses_user_type ON addresses(user_id, type);",
            
            "CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);",
            "CREATE INDEX IF NOT EXISTS idx_carts_expires_at ON carts(expires_at);",
            "CREATE INDEX IF NOT EXISTS idx_carts_created_at ON carts(created_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);",
            "CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(variant_id);",
            "CREATE INDEX IF NOT EXISTS idx_cart_items_updated_at ON cart_items(updated_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);",
            "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);",
            "CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);",
            "CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);",
            "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_orders_processed_at ON orders(processed_at);",
            "CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at);",
            "CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON orders(delivered_at);",
            "CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status, created_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);",
            "CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);",
            "CREATE INDEX IF NOT EXISTS idx_order_items_supplier_id ON order_items(supplier_id);",
            "CREATE INDEX IF NOT EXISTS idx_order_items_fulfillment_status ON order_items(fulfillment_status);",
            "CREATE INDEX IF NOT EXISTS idx_order_items_tracking_number ON order_items(tracking_number);",
            "CREATE INDEX IF NOT EXISTS idx_order_items_supplier_fulfillment ON order_items(supplier_id, fulfillment_status);",
            
            "CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);",
            "CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);",
            "CREATE INDEX IF NOT EXISTS idx_payments_payment_gateway ON payments(payment_gateway);",
            "CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);",
            "CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_payments_processed_at ON payments(processed_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_shipping_methods_is_active ON shipping_methods(is_active);",
            "CREATE INDEX IF NOT EXISTS idx_shipping_methods_code ON shipping_methods(code);",
            "CREATE INDEX IF NOT EXISTS idx_shipping_methods_carrier ON shipping_methods(carrier);",
            "CREATE INDEX IF NOT EXISTS idx_shipping_methods_service_type ON shipping_methods(service_type);",
            
            "CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);",
            "CREATE INDEX IF NOT EXISTS idx_shipments_supplier_id ON shipments(supplier_id);",
            "CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);",
            "CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);",
            "CREATE INDEX IF NOT EXISTS idx_shipments_shipped_at ON shipments(shipped_at);",
            "CREATE INDEX IF NOT EXISTS idx_shipments_delivered_at ON shipments(delivered_at);",
            "CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier);",
            
            "CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);",
            "CREATE INDEX IF NOT EXISTS idx_returns_order_item_id ON returns(order_item_id);",
            "CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_returns_return_number ON returns(return_number);",
            "CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);",
            "CREATE INDEX IF NOT EXISTS idx_returns_type ON returns(type);",
            "CREATE INDEX IF NOT EXISTS idx_returns_requested_at ON returns(requested_at);",
            "CREATE INDEX IF NOT EXISTS idx_returns_user_status ON returns(user_id, status);",
            
            "CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);",
            "CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON discount_codes(is_active);",
            "CREATE INDEX IF NOT EXISTS idx_discount_codes_type ON discount_codes(type);",
            "CREATE INDEX IF NOT EXISTS idx_discount_codes_starts_at ON discount_codes(starts_at);",
            "CREATE INDEX IF NOT EXISTS idx_discount_codes_ends_at ON discount_codes(ends_at);",
            "CREATE INDEX IF NOT EXISTS idx_discount_codes_usage_count ON discount_codes(usage_count);",
            "CREATE INDEX IF NOT EXISTS idx_discount_codes_created_by ON discount_codes(created_by);",
            "CREATE INDEX IF NOT EXISTS idx_discount_codes_active_valid ON discount_codes(is_active, starts_at, ends_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_discount_usage_user_id ON discount_usage(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_discount_usage_order_id ON discount_usage(order_id);",
            "CREATE INDEX IF NOT EXISTS idx_discount_usage_discount_code_id ON discount_usage(discount_code_id);",
            "CREATE INDEX IF NOT EXISTS idx_discount_usage_used_at ON discount_usage(used_at);",
            "CREATE INDEX IF NOT EXISTS idx_discount_usage_user_code ON discount_usage(user_id, discount_code_id);",
            
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);",
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);",
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);",
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);",
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);",
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_order_id ON support_tickets(order_id);",
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority ON support_tickets(status, priority);",
            
            "CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);",
            "CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_user_id ON support_ticket_messages(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_created_at ON support_ticket_messages(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_is_internal ON support_ticket_messages(is_internal);",
            
            "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);",
            "CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);",
            "CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);",
            "CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);",
            "CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at);",
            
            "CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_user_id ON bulk_import_jobs(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_status ON bulk_import_jobs(status);",
            "CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_job_type ON bulk_import_jobs(job_type);",
            "CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_created_at ON bulk_import_jobs(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_started_at ON bulk_import_jobs(started_at);",
            "CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_completed_at ON bulk_import_jobs(completed_at);",
            "CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_user_status ON bulk_import_jobs(user_id, status);",
            
            "CREATE INDEX IF NOT EXISTS idx_email_templates_code ON email_templates(code);",
            "CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);",
            "CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);",
        ]
        
        search_indexes = [
            "CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));",
            "CREATE INDEX IF NOT EXISTS idx_categories_search ON categories USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));",
            "CREATE INDEX IF NOT EXISTS idx_brands_search ON brands USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));",
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_search ON support_tickets USING GIN(to_tsvector('english', subject || ' ' || COALESCE(description, '')));",
        ]
        
        partial_indexes = [
            "CREATE INDEX IF NOT EXISTS idx_products_active_only ON products (category_id, brand_id, price, created_at) WHERE status = 'active' AND approval_status = 'approved' AND visibility = 'visible';",
            "CREATE INDEX IF NOT EXISTS idx_orders_pending ON orders (created_at, user_id) WHERE status IN ('pending', 'confirmed', 'processing');",
            "CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id, created_at) WHERE is_read = false;",
            "CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON product_inventory (product_id, available_quantity) WHERE available_quantity <= low_stock_threshold;",
            "CREATE INDEX IF NOT EXISTS idx_discounts_active ON discount_codes (code, type, value) WHERE is_active = true AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW());",
            "CREATE INDEX IF NOT EXISTS idx_support_tickets_open ON support_tickets (priority, created_at, assigned_to) WHERE status IN ('open', 'in_progress', 'waiting_for_customer');",
        ]
        
        for index_sql in indexes:
            try:
                async with db_session.async_engine.begin() as conn:
                    await conn.execute(text(index_sql))
            except Exception as e:
                if "already exists" not in str(e) and "does not exist" not in str(e):
                    logger.warning(f"Failed to create index: {index_sql} - {e}")
        
        for index_sql in search_indexes:
            try:
                async with db_session.async_engine.begin() as conn:
                    await conn.execute(text(index_sql))
            except Exception as e:
                if "already exists" not in str(e):
                    logger.warning(f"Failed to create search index: {index_sql} - {e}")
        
        for index_sql in partial_indexes:
            try:
                async with db_session.async_engine.begin() as conn:
                    await conn.execute(text(index_sql))
            except Exception as e:
                if "already exists" not in str(e):
                    logger.warning(f"Failed to create partial index: {index_sql} - {e}")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {str(e)}")

def create_database_indexes_sync():
    logger.warning("Sync index creation is deprecated, use async version")
    return
