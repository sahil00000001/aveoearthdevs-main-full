#!/usr/bin/env python3
"""Quick script to verify service role key is correct"""
import os
import sys
import base64
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings

def decode_jwt_payload(token: str) -> dict:
    """Decode JWT token to check payload"""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        payload_encoded = parts[1]
        padding = len(payload_encoded) % 4
        if padding:
            payload_encoded += '=' * (4 - padding)
        payload_bytes = base64.urlsafe_b64decode(payload_encoded)
        return json.loads(payload_bytes.decode('utf-8'))
    except Exception as e:
        return {"error": str(e)}

print("🔍 Verifying SUPABASE_SERVICE_ROLE_KEY...")
print("=" * 60)

service_role_key = settings.SUPABASE_SERVICE_ROLE_KEY.strip() if settings.SUPABASE_SERVICE_ROLE_KEY else ""

if not service_role_key:
    print("❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not set or empty!")
    print("   Please add it to backend/.env file")
    sys.exit(1)

print(f"✅ Key is present")
print(f"   Length: {len(service_role_key)} characters")
print(f"   Starts with: {service_role_key[:30]}...")
print(f"   Ends with: ...{service_role_key[-30:]}")

if not service_role_key.startswith('eyJ'):
    print("⚠️  WARNING: Key doesn't start with 'eyJ' - may not be a valid JWT token")

payload = decode_jwt_payload(service_role_key)
if "error" in payload:
    print(f"❌ ERROR: Failed to decode JWT: {payload['error']}")
    sys.exit(1)

role = payload.get('role', 'unknown')
print(f"\n📋 JWT Payload Analysis:")
print(f"   Role: {role}")
print(f"   Issuer: {payload.get('iss', 'N/A')}")
print(f"   Subject: {payload.get('sub', 'N/A')}")

if role == 'service_role':
    print(f"\n✅ CORRECT: Service role key has 'service_role' role")
    print(f"   This key should bypass RLS automatically")
    print(f"   If you're still getting 403 errors, check RLS policies in Supabase")
elif role == 'anon':
    print(f"\n❌ ERROR: Key has 'anon' role, not 'service_role'!")
    print(f"   You're using the ANON key, not the SERVICE_ROLE key!")
    print(f"   Fix: Get the SERVICE_ROLE key from Supabase Dashboard:")
    print(f"        1. Go to Supabase Dashboard")
    print(f"        2. Project Settings > API")
    print(f"        3. Copy 'service_role' key (NOT 'anon' key)")
    print(f"        4. Update SUPABASE_SERVICE_ROLE_KEY in backend/.env")
    sys.exit(1)
else:
    print(f"\n⚠️  WARNING: Key has unknown role '{role}'")
    print(f"   Expected: 'service_role'")
    print(f"   If this persists, verify the key is correct")

print("\n" + "=" * 60)



