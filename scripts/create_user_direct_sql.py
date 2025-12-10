#!/usr/bin/env python3
"""
Create user directly using Supabase Python client (more reliable than httpx)
"""
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client

# Load environment variables
env_paths = [
    Path(__file__).parent.parent / "backend" / ".env",
    Path(__file__).parent.parent.parent / "backend" / ".env",
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)
        print(f"Loaded .env from: {env_path}")
        break

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

async def create_user_direct(email: str, password: str, user_type: str = "buyer"):
    """Create user using Supabase Python client"""
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        return False
    
    print(f"Creating user via Supabase Python client...")
    print(f"   Email: {email}")
    print(f"   User Type: {user_type}")
    
    # Create admin client
    admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    user_id = None
    
    # Step 1: Get or create user in auth.users
    try:
        print(f"\nStep 1: Getting or creating user in auth.users...")
        user_id = None
        try:
            # Check if user exists - try get_user_by_email first
            existing = admin_client.auth.admin.get_user_by_email(email)
            if existing and existing.user:
                user_id = existing.user.id
                print(f"   OK: User already exists in auth.users: {user_id}")
        except Exception as get_err:
            # If get_user_by_email fails, try listing users
            try:
                print(f"   get_user_by_email failed, trying list_users...")
                all_users_response = admin_client.auth.admin.list_users()
                # list_users returns a UserListResponse object with .users attribute
                # But it might also be a list directly - check both
                if hasattr(all_users_response, 'users'):
                    users_list = all_users_response.users
                elif isinstance(all_users_response, list):
                    users_list = all_users_response
                else:
                    users_list = []
                
                for u in users_list:
                    user_email = getattr(u, 'email', None) or (u.get('email') if isinstance(u, dict) else None)
                    if user_email == email:
                        user_id = getattr(u, 'id', None) or (u.get('id') if isinstance(u, dict) else None)
                        print(f"   OK: Found user via list_users: {user_id}")
                        break
            except Exception as list_err:
                print(f"   list_users also failed: {list_err}")
                import traceback
                print(f"   Traceback: {traceback.format_exc()}")
        
        if not user_id:
            # User doesn't exist, create it
            try:
                auth_response = admin_client.auth.admin.create_user({
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": {
                        "user_type": user_type,
                        "first_name": "Test",
                        "last_name": "User"
                    }
                })
                if auth_response and auth_response.user:
                    user_id = auth_response.user.id
                    print(f"   OK: Created user in auth.users: {user_id}")
            except Exception as create_err:
                error_str = str(create_err).lower()
                if "already" in error_str or "exists" in error_str:
                    # Try to get user again via list_users
                    try:
                        all_users_response = admin_client.auth.admin.list_users()
                        if hasattr(all_users_response, 'users'):
                            users_list = all_users_response.users
                        elif isinstance(all_users_response, list):
                            users_list = all_users_response
                        else:
                            users_list = []
                        
                        for u in users_list:
                            user_email = getattr(u, 'email', None) or (u.get('email') if isinstance(u, dict) else None)
                            if user_email == email:
                                user_id = getattr(u, 'id', None) or (u.get('id') if isinstance(u, dict) else None)
                                print(f"   OK: User exists (found after create error): {user_id}")
                                break
                        if not user_id:
                            print(f"   ERROR: User creation failed and couldn't find existing: {create_err}")
                            return False
                    except Exception as list_err2:
                        print(f"   ERROR: Could not get existing user: {list_err2}")
                        return False
                else:
                    print(f"   ERROR: Failed to create user: {create_err}")
                    return False
    except Exception as e:
        print(f"   ERROR: Failed to get/create user in auth.users: {e}")
        return False
    
    if not user_id:
        print(f"   ERROR: No user ID obtained")
        return False
    
    # Step 2: Create user in public.users using Supabase client
    try:
        print(f"\nStep 2: Creating user in public.users...")
        
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
        
        # Use Supabase client table insert (more reliable than httpx)
        try:
            response = admin_client.table("users").insert(user_rest_data).execute()
            if response.data and len(response.data) > 0:
                print(f"   OK: Created user in public.users")
                print(f"   User data: {response.data[0]}")
                return True
            else:
                print(f"   WARNING: No data returned from insert")
        except Exception as insert_err:
            error_str = str(insert_err).lower()
            if "duplicate" in error_str or "already exists" in error_str or "unique" in error_str:
                print(f"   INFO: User already exists in public.users")
                return True
            else:
                print(f"   ERROR: Failed to create user: {insert_err}")
                # Try to check if user exists
                try:
                    check = admin_client.table("users").select("id").eq("id", user_id).execute()
                    if check.data and len(check.data) > 0:
                        print(f"   OK: User exists (verified via select)")
                        return True
                except Exception:
                    pass
                return False
    except Exception as e:
        print(f"   ERROR: Exception during user creation: {e}")
        return False

async def main():
    import argparse
    parser = argparse.ArgumentParser(description="Create test user via Supabase Python client")
    parser.add_argument("--email", default="cart_test_buyer@test.com", help="Email for test user")
    parser.add_argument("--password", default="Test123!@#", help="Password for test user")
    parser.add_argument("--type", default="buyer", choices=["buyer", "supplier", "admin"], help="User type")
    
    args = parser.parse_args()
    
    success = await create_user_direct(args.email, args.password, args.type)
    
    if success:
        print(f"\n✅ SUCCESS: User created/verified successfully!")
        print(f"   Email: {args.email}")
        print(f"   Password: {args.password}")
    else:
        print(f"\n❌ FAILED: Could not create user")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)

