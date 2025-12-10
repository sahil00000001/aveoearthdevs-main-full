# CRITICAL: Update Supabase RPC Function

The SQL function needs to be updated in Supabase SQL Editor to fix enum casting issues.

## Steps:
1. Go to Supabase Dashboard > SQL Editor
2. Run the contents of `fix_bulk_upload_sql_function.sql`

The key fix is adding explicit enum casts:
- `p_status::product_status`
- `p_approval_status::product_approval`  
- `p_visibility::product_visibility`

This fixes the error: `column "status" is of type product_status but expression is of type character varying`



