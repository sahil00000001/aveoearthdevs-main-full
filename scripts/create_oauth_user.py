"""
Script to create a user in public.users table from Supabase Auth
Useful for OAuth users who exist in auth.users but not in public.users
"""
import asyncio
import sys
import os

# Add backend directory to path
backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

from app.core.config import settings
from app.features.auth.cruds.auth_crud import AuthCrud
import httpx

async def create_user_from_auth(user_id: str):
    """Create user in public.users from auth.users"""
    auth_crud = AuthCrud()
    admin_client = auth_crud.admin_client
    
    # Get user from Supabase Auth
    try:
        auth_user_response = admin_client.auth.admin.get_user_by_id(user_id)
        if not auth_user_response or not hasattr(auth_user_response, 'user') or not auth_user_response.user:
            print(f"❌ User {user_id} not found in auth.users")
            return False
        
        auth_user = auth_user_response.user
        user_email = getattr(auth_user, 'email', '')
        user_metadata = getattr(auth_user, 'user_metadata', {}) or {}
        
        # Extract user info
        user_type = user_metadata.get('user_type', user_metadata.get('role', 'buyer')).lower()
        full_name = user_metadata.get("full_name") or user_metadata.get("name") or ""
        first_name = user_metadata.get("first_name") or (full_name.split()[0] if full_name else "User")
        last_name = user_metadata.get("last_name") or (" ".join(full_name.split()[1:]) if full_name and len(full_name.split()) > 1 else "")
        phone = getattr(auth_user, 'phone', None) or "+10000000000"
        is_verified = getattr(auth_user, 'email_confirmed_at', None) is not None
        
        # Prepare user data
        user_data = {
            "id": str(user_id),
            "email": user_email,
            "phone": phone,
            "user_type": user_type,
            "first_name": first_name,
            "last_name": last_name,
            "is_verified": is_verified,
            "is_active": True,
            "is_email_verified": is_verified,
            "is_phone_verified": False
        }
        
        print(f"Creating user: {user_email} ({user_id})")
        print(f"User data: {user_data}")
        
        # Create via REST API
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            rest_url = f"{settings.SUPABASE_URL}/rest/v1/users"
            headers = {
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(rest_url, json=user_data, headers=headers)
                print(f"Response status: {response.status_code}")
                print(f"Response: {response.text[:500]}")
                
                if response.status_code in [200, 201]:
                    print(f"✅ User created successfully!")
                    return True
                elif response.status_code == 409:
                    print(f"✅ User already exists!")
                    return True
                else:
                    print(f"❌ Failed to create user: {response.status_code} - {response.text}")
                    return False
        else:
            print("❌ SUPABASE_URL or SERVICE_ROLE_KEY not configured")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python create_oauth_user.py <user_id>")
        print("Example: python create_oauth_user.py 40b6897a-fef0-4394-b2dd-e92a7cacfd04")
        sys.exit(1)
    
    user_id = sys.argv[1]
    result = asyncio.run(create_user_from_auth(user_id))
    sys.exit(0 if result else 1)

