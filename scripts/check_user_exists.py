#!/usr/bin/env python3
"""Check if user exists in public.users"""
import asyncio
import httpx
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path('backend/.env'))

async def check_user():
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    user_id = '7a6261c9-bcef-4e3a-b8d1-6e590ce0ceef'
    
    async with httpx.AsyncClient() as c:
        r = await c.get(f'{url}/rest/v1/users?id=eq.{user_id}&select=id', 
                       headers={'apikey': key, 'Authorization': f'Bearer {key}'})
        print(f'Status: {r.status_code}')
        print(f'Data: {r.json()}')

asyncio.run(check_user())


