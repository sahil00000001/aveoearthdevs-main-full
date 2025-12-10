#!/usr/bin/env python3
"""
Create a test user via Supabase Admin API to bypass rate limits
This uses the service role key which bypasses rate limiting
"""
import os
import sys
import asyncio
import httpx
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables - try multiple locations
env_paths = [
    Path(__file__).parent.parent.parent / ".env",
    Path(__file__).parent.parent / "backend" / ".env",
    Path(__file__).parent.parent.parent / "backend" / ".env",
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)
        print(f"Loaded .env from: {env_path}")
        break
else:
    load_dotenv()  # Try default location

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    print("⚠️ SUPABASE_URL not found in .env, checking backend/.env...")
    backend_env = Path(__file__).parent.parent / "backend" / ".env"
    if backend_env.exists():
        load_dotenv(dotenv_path=backend_env, override=True)
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

async def create_test_user_via_admin(email: str, password: str, user_type: str = "buyer"):
    """Create a test user using Supabase Admin API (bypasses rate limits)"""
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
        sys.exit(1)
    
    print(f"Creating test user via Admin API...")
    print(f"   Email: {email}")
    print(f"   User Type: {user_type}")
    
    # Step 1: Create user in Supabase Auth via Admin API
    auth_url = f"{SUPABASE_URL}/auth/v1/admin/users"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    auth_data = {
        "email": email,
        "password": password,
        "email_confirm": True,  # Auto-confirm email
        "user_metadata": {
            "user_type": user_type,
            "first_name": "Test",
            "last_name": "User"
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Create user in auth.users
            print(f"\nStep 1: Creating user in auth.users...")
            auth_response = await client.post(auth_url, json=auth_data, headers=headers)
            
            if auth_response.status_code in [200, 201]:
                auth_user_data = auth_response.json()
                user_id = auth_user_data.get("id") or auth_user_data.get("user", {}).get("id")
                print(f"   OK: User created in auth.users: {user_id}")
            elif auth_response.status_code == 422:
                # User might already exist
                error_data = auth_response.json()
                if "email_exists" in str(error_data) or "already been registered" in str(error_data):
                    print(f"   INFO: User already exists in auth.users, fetching user ID...")
                    # Use Supabase Python client approach to get user by email
                    try:
                        from supabase import create_client
                        admin_supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
                        existing_user = admin_supabase.auth.admin.list_users()
                        # Find user by email
                        user_id = None
                        for user in existing_user.users:
                            if user.email == email:
                                user_id = user.id
                                break
                        
                        if user_id:
                            print(f"   ✅ Found existing user: {user_id}")
                        else:
                            # Try alternative method - direct REST API call
                            list_url = f"{SUPABASE_URL}/auth/v1/admin/users"
                            list_response = await client.get(list_url, headers=headers, params={"per_page": 1000})
                            if list_response.status_code == 200:
                                users_data = list_response.json()
                                users_list = users_data.get("users", [])
                                for u in users_list:
                                    if u.get("email") == email:
                                        user_id = u.get("id")
                                        print(f"   ✅ Found existing user: {user_id}")
                                        break
                            
                            if not user_id:
                                print(f"   ❌ User exists but couldn't find user ID")
                                print(f"   💡 You can still use this user for testing - email: {email}")
                                return None
                    except Exception as e:
                        print(f"   ⚠️ Could not fetch user ID: {e}")
                        print(f"   💡 User exists - you can use email: {email} for testing")
                        return None
                else:
                    print(f"   ❌ Failed to create user: {auth_response.text}")
                    sys.exit(1)
            else:
                print(f"   ❌ Failed to create user: {auth_response.status_code} - {auth_response.text}")
                sys.exit(1)
            
            # Step 2: Create user in public.users table via REST API
            print(f"\nStep 2: Creating user in public.users table...")
            users_rest_url = f"{SUPABASE_URL}/rest/v1/users"
            
            user_rest_data = {
                "id": user_id,
                "email": email,
                "phone": "+10000000000",
                "user_type": user_type.lower(),
                "first_name": "Test",
                "last_name": "User",
                "is_verified": True,
                "is_active": True,
                "is_email_verified": True,
                "is_phone_verified": False
            }
            
            rest_headers = {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            rest_response = await client.post(users_rest_url, json=user_rest_data, headers=rest_headers)
            
            if rest_response.status_code in [200, 201]:
                rest_user_data = rest_response.json()
                print(f"   ✅ User created in public.users table")
                if isinstance(rest_user_data, list) and len(rest_user_data) > 0:
                    print(f"   User ID: {rest_user_data[0].get('id')}")
                elif isinstance(rest_user_data, dict):
                    print(f"   User ID: {rest_user_data.get('id')}")
            elif rest_response.status_code == 409:
                print(f"   ⚠️ User already exists in public.users (409)")
            else:
                print(f"   ⚠️ Warning: Could not create user in public.users: {rest_response.status_code}")
                print(f"   Response: {rest_response.text[:200]}")
                # Don't fail - user exists in auth.users, can be created later
            
            print(f"\nOK: Test user created successfully!")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
            print(f"   User ID: {user_id}")
            print(f"\n💡 You can now use this user for testing:")
            print(f"   node tests/test_cart_iterative.js")
            print(f"   Or login with: {email} / {password}")
            
            return user_id
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

async def reset_user_password(email: str, new_password: str):
    """Reset password for existing user via Admin API"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
        sys.exit(1)
    
    print(f"Resetting password for user: {email}")
    
    auth_url = f"{SUPABASE_URL}/auth/v1/admin/users"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # First, get user by email
        list_url = f"{SUPABASE_URL}/auth/v1/admin/users"
        list_response = await client.get(list_url, headers=headers, params={"per_page": 1000})
        
        if list_response.status_code != 200:
            print(f"❌ Failed to list users: {list_response.status_code}")
            sys.exit(1)
        
        users_data = list_response.json()
        users_list = users_data.get("users", [])
        
        user_id = None
        for u in users_list:
            if u.get("email") == email:
                user_id = u.get("id")
                break
        
        if not user_id:
            print(f"❌ User not found: {email}")
            sys.exit(1)
        
        # Update password
        update_url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"
        update_data = {
            "password": new_password,
            "email_confirm": True  # Also confirm email
        }
        
        update_response = await client.put(update_url, json=update_data, headers=headers)
        
        if update_response.status_code in [200, 201]:
            print(f"OK: Password reset successfully!")
            print(f"   Email: {email}")
            print(f"   New Password: {new_password}")
            print(f"   User ID: {user_id}")
            
            # Ensure user exists in public.users table
            print(f"\nEnsuring user exists in public.users table...")
            users_rest_url = f"{SUPABASE_URL}/rest/v1/users"
            rest_headers = {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            # Check if user exists
            check_url = f"{users_rest_url}?id=eq.{user_id}&select=id"
            check_response = await client.get(check_url, headers=rest_headers)
            
            print(f"   Check response status: {check_response.status_code}")
            if check_response.status_code == 200:
                existing_users = check_response.json()
                print(f"   Check response data: {existing_users}")
                if isinstance(existing_users, list) and len(existing_users) > 0:
                    print(f"   OK: User already exists in public.users")
                else:
                    print(f"   User not found, creating...")
                    # Create user in public.users
                    user_rest_data = {
                        "id": user_id,
                        "email": email,
                        "phone": "+10000000000",
                        "user_type": "buyer",
                        "first_name": "Test",
                        "last_name": "User",
                        "is_verified": True,
                        "is_active": True,
                        "is_email_verified": True,
                        "is_phone_verified": False
                    }
                    
                    print(f"   Creating user with data: {list(user_rest_data.keys())}")
                    create_response = await client.post(users_rest_url, json=user_rest_data, headers=rest_headers)
                    print(f"   Create response status: {create_response.status_code}")
                    print(f"   Create response: {create_response.text[:500]}")
                    
                    if create_response.status_code in [200, 201]:
                        print(f"   OK: Created user in public.users")
                    elif create_response.status_code == 409:
                        print(f"   INFO: User already exists in public.users (409)")
                    else:
                        print(f"   ERROR: Could not create user in public.users: {create_response.status_code}")
                        print(f"   Response: {create_response.text[:500]}")
            elif check_response.status_code == 403:
                print(f"   WARNING: 403 permission denied when checking user")
                print(f"   Response: {check_response.text[:300]}")
                print(f"   Attempting to create user anyway...")
                # Try to create anyway
                user_rest_data = {
                    "id": user_id,
                    "email": email,
                    "phone": "+10000000000",
                    "user_type": "buyer",
                    "first_name": "Test",
                    "last_name": "User",
                    "is_verified": True,
                    "is_active": True,
                    "is_email_verified": True,
                    "is_phone_verified": False
                }
                create_response = await client.post(users_rest_url, json=user_rest_data, headers=rest_headers)
                print(f"   Create response status: {create_response.status_code}")
                if create_response.status_code in [200, 201]:
                    print(f"   OK: Created user in public.users")
                else:
                    print(f"   ERROR: Create failed: {create_response.status_code} - {create_response.text[:300]}")
            else:
                print(f"   WARNING: Check failed with status {check_response.status_code}")
                print(f"   Response: {check_response.text[:300]}")
        else:
            print(f"❌ Failed to reset password: {update_response.status_code} - {update_response.text}")
            sys.exit(1)

async def main():
    import argparse
    parser = argparse.ArgumentParser(description="Create test user via Supabase Admin API")
    parser.add_argument("--email", default="cart_test_buyer@test.com", help="Email for test user")
    parser.add_argument("--password", default="Test123!@#", help="Password for test user")
    parser.add_argument("--type", default="buyer", choices=["buyer", "supplier", "admin"], help="User type")
    parser.add_argument("--reset-password", action="store_true", help="Reset password for existing user")
    
    args = parser.parse_args()
    
    if args.reset_password:
        await reset_user_password(args.email, args.password)
    else:
        await create_test_user_via_admin(args.email, args.password, args.type)

if __name__ == "__main__":
    asyncio.run(main())

