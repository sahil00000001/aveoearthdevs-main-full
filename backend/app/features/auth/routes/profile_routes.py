from fastapi import APIRouter, Depends, UploadFile, File, Form, status, HTTPException
from typing import Dict, Any, Optional, Union
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.auth.responses.profile_response import (
    ProfileResponse, UserProfileResponse, CompleteUserProfileResponse,
    AvatarUploadResponse, AccountStatsResponse
)
from app.features.auth.requests.profile_request import (
    ProfileUpdateRequest, UserProfileUpdateRequest, PreferencesUpdateRequest,
    NotificationSettingsRequest, SocialLinksRequest, CompleteProfileUpdateRequest
)
from app.features.auth.cruds.profile_crud import ProfileCrud
from app.features.auth.cruds.auth_crud import AuthCrud
from app.core.role_auth import get_all_users
from app.core.exceptions import ValidationException, AuthenticationException, NotFoundException
from app.core.supabase_storage import SupabaseStorageClient, upload_user_avatar, delete_file_from_url
from app.database.session import get_async_session
from app.core.logging import get_logger
from app.core.base import SuccessResponse
from app.core.config import settings
from datetime import datetime

profile_router = APIRouter(tags=["Profile"])
logger = get_logger("auth.profile")

@profile_router.get("/profile", response_model=ProfileResponse)
async def get_user_profile(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    profile_data = await profile_crud.get_or_create_by_user_id(db, current_user["id"])
    
    profile_dict = {
        "id": str(profile_data.id),
        "user_id": str(profile_data.user_id),
        "date_of_birth": profile_data.date_of_birth,
        "gender": profile_data.gender,
        "bio": profile_data.bio,
        "preferences": profile_data.preferences or {},
        "social_links": profile_data.social_links or {},
        "notification_settings": profile_data.notification_settings or {},
        "created_at": profile_data.created_at,
        "updated_at": profile_data.updated_at
    }
    
    return ProfileResponse(**profile_dict)

@profile_router.get("/me", response_model=CompleteUserProfileResponse)
async def get_complete_profile(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    if not current_user or not current_user.get("id"):
        raise HTTPException(status_code=401, detail="Authentication required")
    
    auth_crud = AuthCrud()
    try:
        user_data = await auth_crud.get_full_user_profile(db, current_user["id"])
        return CompleteUserProfileResponse(**user_data)
    except NotFoundException:
        # User authenticated in Supabase but doesn't exist in database - create them
        logger.info(f"User {current_user['id']} authenticated but not in database, creating user record")
        try:
            # Create user record from current_user data (from Supabase Auth)
            from app.features.auth.models.user import UserTypeEnum
            user_type_str = current_user.get("user_role", "buyer").lower()
            user_type_enum = UserTypeEnum.BUYER
            if user_type_str == "supplier":
                user_type_enum = UserTypeEnum.SUPPLIER
            elif user_type_str == "admin":
                user_type_enum = UserTypeEnum.ADMIN
            
            # Create user using REST API to ensure it persists immediately
            admin_client = AuthCrud.admin_client
            
            user_rest_data = {
                "id": current_user["id"],
                "email": current_user.get("email", ""),
                "phone": current_user.get("phone") or "+10000000000",
                "user_type": user_type_str,
                "first_name": current_user.get("first_name") or "User",
                "last_name": current_user.get("last_name") or "",
                "is_verified": current_user.get("is_verified", True),
                "is_active": True
            }
            
            # Insert via REST API
            rest_response = admin_client.table("users").insert(user_rest_data).execute()
            if rest_response.data:
                logger.info(f"✅ Created user {current_user['id']} via REST API")
                # Now try to get full profile again
                user_data = await auth_crud.get_full_user_profile(db, current_user["id"])
                return CompleteUserProfileResponse(**user_data)
        except Exception as create_error:
            logger.error(f"Failed to create user record: {create_error}")
            # Return profile from current_user if creation fails
            from datetime import datetime
            return CompleteUserProfileResponse(
                id=current_user["id"],
                email=current_user.get("email", "unknown@example.com"),
                first_name=current_user.get("first_name", "User"),
                last_name=current_user.get("last_name", ""),
                phone=current_user.get("phone", "+10000000000"),
                user_type=current_user.get("user_role", "buyer"),
                is_verified=current_user.get("is_verified", True),
                is_active=True,
                is_phone_verified=False,
                is_email_verified=current_user.get("is_verified", True),
                referral_code="",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                profile=None
            )
    except Exception as e:
        logger.error(f"Failed to load profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load profile: {str(e)}")

@profile_router.put("/me", response_model=UserProfileResponse)
async def update_basic_profile(
    request: ProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    profile_data = request.model_dump(exclude_none=True)
    
    if "avatar_url" in profile_data and profile_data["avatar_url"] == "":
        user_obj = await auth_crud.get_by_id(db, current_user["id"])
        if user_obj and user_obj.avatar_url:
            try:
                delete_file_from_url(user_obj.avatar_url)
            except:
                pass
    
    updated_user = await auth_crud.update_user_profile(db, current_user["id"], profile_data)
    return UserProfileResponse(**updated_user)

@profile_router.put("/profile", response_model=ProfileResponse)
async def update_user_profile(
    request: UserProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    profile_data = request.model_dump(exclude_none=True)
    updated_profile = await profile_crud.update_profile(db, current_user["id"], profile_data)
    return ProfileResponse(**updated_profile.to_dict())

@profile_router.put("/complete", response_model=CompleteUserProfileResponse)
async def update_complete_profile(
    request: CompleteProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    profile_crud = ProfileCrud()
    
    user_data = {}
    profile_data = {}
    
    request_dict = request.model_dump(exclude_none=True)
    
    user_fields = ["first_name", "last_name", "phone"]
    for field in user_fields:
        if field in request_dict:
            user_data[field] = request_dict[field]
    
    profile_fields = ["date_of_birth", "gender", "bio", "preferences", "social_links", "notification_settings"]
    for field in profile_fields:
        if field in request_dict:
            profile_data[field] = request_dict[field]
    
    if user_data:
        await auth_crud.update_user_profile(db, current_user["id"], user_data)
    
    if profile_data:
        await profile_crud.update_profile(db, current_user["id"], profile_data)
    
    updated_user_data = await auth_crud.get_full_user_profile(db, current_user["id"])
    return CompleteUserProfileResponse(**updated_user_data)

@profile_router.put("/preferences", response_model=ProfileResponse)
async def update_preferences(
    request: PreferencesUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    preferences = request.model_dump(exclude_none=True)
    updated_profile = await profile_crud.update_preferences(db, current_user["id"], preferences)
    return ProfileResponse(**updated_profile.to_dict())

@profile_router.put("/notifications", response_model=ProfileResponse)
async def update_notification_settings(
    request: NotificationSettingsRequest,
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    settings = request.model_dump(exclude_none=True)
    updated_profile = await profile_crud.update_notification_settings(db, current_user["id"], settings)
    return ProfileResponse(**updated_profile.to_dict())

@profile_router.put("/social-links", response_model=ProfileResponse)
async def update_social_links(
    request: SocialLinksRequest,
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    social_links = request.model_dump(exclude_none=True)
    updated_profile = await profile_crud.update_social_links(db, current_user["id"], social_links)
    return ProfileResponse(**updated_profile.to_dict())

@profile_router.post("/avatar", response_model=AvatarUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_avatar(
    avatar: Union[UploadFile, str, None] = File(None),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    if not avatar or (isinstance(avatar, str) and avatar == ""):
        raise ValidationException("Avatar file is required")
    
    if isinstance(avatar, str):
        raise ValidationException("Avatar must be a file upload")
    
    auth_crud = AuthCrud()
    
    user_obj = await auth_crud.get_by_id(db, current_user["id"])
    if user_obj and user_obj.avatar_url:
        try:
            delete_file_from_url(user_obj.avatar_url)
        except:
            pass
    
    try:
        avatar_url = await upload_user_avatar(avatar, current_user["id"])
        await auth_crud.update_avatar(db, current_user["id"], avatar_url)
        
        return AvatarUploadResponse(
            message="Avatar uploaded successfully",
            avatar_url=avatar_url,
            user_id=current_user["id"]
        )
    except Exception as e:
        logger.error(f"Avatar upload failed: {str(e)}")
        raise ValidationException(f"Failed to upload avatar: {str(e)}")

@profile_router.put("/avatar", response_model=AvatarUploadResponse)
async def update_avatar(
    avatar: Union[UploadFile, str, None] = File(None),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    
    user_obj = await auth_crud.get_by_id(db, current_user["id"])
    if user_obj and user_obj.avatar_url:
        try:
            delete_file_from_url(user_obj.avatar_url)
        except:
            pass
    
    if avatar and isinstance(avatar, str) and avatar != "":
        await auth_crud.update_avatar(db, current_user["id"], avatar)
        return AvatarUploadResponse(
            message="Avatar updated successfully",
            avatar_url=avatar,
            user_id=current_user["id"]
        )
    
    if not avatar or (isinstance(avatar, str) and avatar == ""):
        await auth_crud.delete_avatar(db, current_user["id"])
        return AvatarUploadResponse(
            message="Avatar removed successfully",
            avatar_url="",
            user_id=current_user["id"]
        )
    
    try:
        avatar_url = await upload_user_avatar(avatar, current_user["id"])
        await auth_crud.update_avatar(db, current_user["id"], avatar_url)
        
        return AvatarUploadResponse(
            message="Avatar updated successfully",
            avatar_url=avatar_url,
            user_id=current_user["id"]
        )
    except Exception as e:
        logger.error(f"Avatar update failed: {str(e)}")
        raise ValidationException(f"Failed to update avatar: {str(e)}")

@profile_router.delete("/avatar")
async def delete_avatar(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    
    user_obj = await auth_crud.get_by_id(db, current_user["id"])
    if user_obj and user_obj.avatar_url:
        try:
            delete_file_from_url(user_obj.avatar_url)
        except:
            pass
    
    await auth_crud.delete_avatar(db, current_user["id"])
    return SuccessResponse(message="Avatar deleted successfully")

@profile_router.delete("/profile")
async def delete_profile(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    profile_crud = ProfileCrud()
    
    user_obj = await auth_crud.get_by_id(db, current_user["id"])
    if user_obj and user_obj.avatar_url:
        try:
            delete_file_from_url(user_obj.avatar_url)
        except:
            pass
    
    deleted = await profile_crud.delete_profile(db, current_user["id"])
    
    if deleted:
        return SuccessResponse(message="Profile deleted successfully")
    else:
        raise NotFoundException("Profile not found")

@profile_router.post("/deactivate")
async def deactivate_account(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    await auth_crud.deactivate_account(db, current_user["id"])
    return SuccessResponse(message="Account deactivated successfully")

@profile_router.post("/reactivate")
async def reactivate_account(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    await auth_crud.reactivate_account(db, current_user["id"])
    return SuccessResponse(message="Account reactivated successfully")

@profile_router.get("/stats", response_model=AccountStatsResponse)
async def get_account_stats(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    from datetime import datetime
    auth_crud = AuthCrud()
    user_obj = await auth_crud.get_by_id(db, current_user["id"])
    
    if not user_obj:
        raise NotFoundException("User not found")
    
    account_age = (datetime.utcnow() - user_obj.created_at).days
    
    return AccountStatsResponse(
        account_age_days=account_age
    )

@profile_router.get("/overview", response_model=CompleteUserProfileResponse)
async def get_account_overview(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    user_data = await auth_crud.get_full_user_profile(db, current_user["id"])
    return CompleteUserProfileResponse(**user_data)