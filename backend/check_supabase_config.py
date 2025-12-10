#!/usr/bin/env python3
"""Check if Supabase configuration is loaded correctly"""
from app.core.config import settings

print("=" * 60)
print("Supabase Configuration Check")
print("=" * 60)
print(f"SUPABASE_URL: {settings.SUPABASE_URL[:50] + '...' if settings.SUPABASE_URL and len(settings.SUPABASE_URL) > 50 else (settings.SUPABASE_URL or 'NOT SET')}")
print(f"SUPABASE_SERVICE_ROLE_KEY: {'SET (' + str(len(settings.SUPABASE_SERVICE_ROLE_KEY)) + ' chars)' if settings.SUPABASE_SERVICE_ROLE_KEY else 'NOT SET'}")
print(f"SUPABASE_ANON_KEY: {'SET (' + str(len(settings.SUPABASE_ANON_KEY)) + ' chars)' if settings.SUPABASE_ANON_KEY else 'NOT SET'}")
print("=" * 60)

# Check if they're set
use_supabase = bool(settings.SUPABASE_URL) and bool(settings.SUPABASE_SERVICE_ROLE_KEY)
print(f"Can use Supabase: {use_supabase}")
print("=" * 60)



