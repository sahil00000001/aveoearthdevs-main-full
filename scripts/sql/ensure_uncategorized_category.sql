-- Ensure "Uncategorized" category exists for bulk upload
-- Users must choose from existing categories, but RPC function can use "Uncategorized" as default if NULL
INSERT INTO categories (id, name, slug, description, is_active, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Uncategorized',
    'uncategorized',
    'Default category for products without a specific category',
    true,
    999,
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Verify it was created
SELECT id, name, slug FROM categories WHERE slug = 'uncategorized' AND is_active = true;



