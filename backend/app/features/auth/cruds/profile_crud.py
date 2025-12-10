from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.features.auth.models.user_profile import UserProfile
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger

logger = get_logger("crud.profiles")

class ProfileCrud(BaseCrud[UserProfile]):
    def __init__(self):
        super().__init__(get_supabase_client(), UserProfile)
        self.logger = get_logger("crud.profiles")
    
    async def get_or_create_by_user_id(self, db: AsyncSession, user_id: str):
        result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = result.scalar_one_or_none()
        
        if profile:
            return profile
            
        profile_data = {
            "user_id": user_id,
            "preferences": {},
            "social_links": {},
            "notification_settings": {}
        }
        created_profile = await self.create(db, profile_data)
        return created_profile
    
    async def get_profile_by_user_id(self, db: AsyncSession, user_id: str) -> Optional[UserProfile]:
        result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        return result.scalar_one_or_none()
    
    async def update_profile(self, db: AsyncSession, user_id: str, profile_data: Dict[str, Any]) -> UserProfile:
        profile = await self.get_profile_by_user_id(db, user_id)
        if not profile:
            raise NotFoundException("Profile not found")
        
        update_data = {}
        
        if "date_of_birth" in profile_data:
            update_data["date_of_birth"] = profile_data["date_of_birth"]
        if "gender" in profile_data:
            update_data["gender"] = profile_data["gender"]
        if "bio" in profile_data:
            update_data["bio"] = profile_data["bio"]
        if "preferences" in profile_data:
            update_data["preferences"] = profile_data["preferences"]
        if "social_links" in profile_data:
            update_data["social_links"] = profile_data["social_links"]
        if "notification_settings" in profile_data:
            update_data["notification_settings"] = profile_data["notification_settings"]
        
        if not update_data:
            return profile
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.execute(
            update(UserProfile)
            .where(UserProfile.user_id == user_id)
            .values(**update_data)
            .returning(UserProfile)
        )
        updated_profile = result.scalar_one_or_none()
        
        if not updated_profile:
            raise NotFoundException("Profile not found")
        
        await db.commit()
        await db.refresh(updated_profile)
        return updated_profile
    
    async def update_preferences(self, db: AsyncSession, user_id: str, preferences: Dict[str, Any]) -> UserProfile:
        profile = await self.get_profile_by_user_id(db, user_id)
        if not profile:
            profile = await self.get_or_create_by_user_id(db, user_id)
        
        current_preferences = profile.preferences or {}
        current_preferences.update(preferences)
        
        return await self.update_profile(db, user_id, {"preferences": current_preferences})
    
    async def update_notification_settings(self, db: AsyncSession, user_id: str, settings: Dict[str, Any]) -> UserProfile:
        profile = await self.get_profile_by_user_id(db, user_id)
        if not profile:
            profile = await self.get_or_create_by_user_id(db, user_id)
        
        current_settings = profile.notification_settings or {}
        current_settings.update(settings)
        
        return await self.update_profile(db, user_id, {"notification_settings": current_settings})
    
    async def update_social_links(self, db: AsyncSession, user_id: str, social_links: Dict[str, Any]) -> UserProfile:
        profile = await self.get_profile_by_user_id(db, user_id)
        if not profile:
            profile = await self.get_or_create_by_user_id(db, user_id)
        
        current_links = profile.social_links or {}
        current_links.update(social_links)
        
        return await self.update_profile(db, user_id, {"social_links": current_links})
    
    async def delete_profile(self, db: AsyncSession, user_id: str) -> bool:
        result = await db.execute(
            delete(UserProfile).where(UserProfile.user_id == user_id)
        )
        await db.commit()
        return result.rowcount > 0
    
    async def get_profile_dict(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        profile = await self.get_or_create_by_user_id(db, user_id)
        return profile.to_dict()
