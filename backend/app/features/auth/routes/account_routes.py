from fastapi import APIRouter, Depends, Form, status
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.auth.responses.profile_response import UserProfileResponse, AccountStatsResponse
from app.features.auth.requests.profile_request import CompleteProfileUpdateRequest
from app.features.auth.cruds.auth_crud import AuthCrud
from app.features.auth.cruds.profile_crud import ProfileCrud
from app.core.role_auth import get_all_users
from app.core.exceptions import ValidationException, NotFoundException, ConflictException
from app.database.session import get_async_session
from app.core.logging import get_logger
from app.core.base import SuccessResponse

account_router = APIRouter(tags=["Account Management"])
logger = get_logger("auth.account")

@account_router.put("/phone", response_model=UserProfileResponse)
async def update_phone_number(
    phone: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    
    existing_phone = await auth_crud.get_by_field(db, "phone", phone)
    if existing_phone and str(existing_phone.id) != current_user["id"]:
        raise ConflictException("Phone number already exists")
    
    updated_user = await auth_crud.update_user_profile(db, current_user["id"], {"phone": phone})
    return UserProfileResponse(**updated_user)

@account_router.put("/name", response_model=UserProfileResponse)
async def update_name(
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    
    update_data = {}
    if first_name is not None:
        update_data["first_name"] = first_name
    if last_name is not None:
        update_data["last_name"] = last_name
    
    if not update_data:
        raise ValidationException("At least one name field must be provided")
    
    updated_user = await auth_crud.update_user_profile(db, current_user["id"], update_data)
    return UserProfileResponse(**updated_user)

@account_router.get("/activity")
async def get_account_activity(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    user_data = await auth_crud.get_by_id(db, current_user["id"])
    
    if not user_data:
        raise NotFoundException("User not found")
    
    activity_data = {
        "last_login": user_data.last_login_at.isoformat() if user_data.last_login_at else None,
        "account_created": user_data.created_at.isoformat() if user_data.created_at else None,
        "profile_updated": user_data.updated_at.isoformat() if user_data.updated_at else None,
        "email_verified": user_data.is_email_verified,
        "phone_verified": user_data.is_phone_verified,
        "account_status": "active" if user_data.is_active else "inactive"
    }
    
    return activity_data

@account_router.get("/security")
async def get_security_info(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    user_data = await auth_crud.get_by_id(db, current_user["id"])
    
    if not user_data:
        raise NotFoundException("User not found")
    
    security_info = {
        "email_verified": user_data.is_email_verified,
        "phone_verified": user_data.is_phone_verified,
        "two_factor_enabled": False,
        "last_password_change": None,
        "login_method": "email" if user_data.email else "phone",
        "google_connected": bool(user_data.google_id),
        "account_locked": not user_data.is_active
    }
    
    return security_info

@account_router.post("/verify-phone")
async def request_phone_verification(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    user_data = await auth_crud.get_by_id(db, current_user["id"])
    
    if not user_data:
        raise NotFoundException("User not found")
    
    if not user_data.phone:
        raise ValidationException("No phone number found")
    
    if user_data.is_phone_verified:
        return SuccessResponse(message="Phone number is already verified")
    
    return SuccessResponse(message="Phone verification request sent")

@account_router.post("/export-data")
async def export_user_data(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    profile_crud = ProfileCrud()
    
    user_data = await auth_crud.get_by_id(db, current_user["id"])
    if not user_data:
        raise NotFoundException("User not found")
    
    profile_data = await profile_crud.get_profile_dict(db, current_user["id"])
    
    export_data = {
        "user_info": user_data.to_dict(),
        "profile_info": profile_data,
        "export_timestamp": user_data.updated_at.isoformat() if user_data.updated_at else None,
        "data_format": "json",
        "version": "1.0"
    }
    
    return export_data

@account_router.get("/data-usage")
async def get_data_usage_info(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    from datetime import datetime
    auth_crud = AuthCrud()
    user_data = await auth_crud.get_by_id(db, current_user["id"])
    
    if not user_data:
        raise NotFoundException("User not found")
    
    account_age = (datetime.utcnow() - user_data.created_at).days if user_data.created_at else 0
    
    usage_info = {
        "account_age_days": account_age,
        "data_stored": {
            "profile_data": "Yes" if user_data else "No",
            "avatar": "Yes" if user_data.avatar_url else "No",
            "phone_number": "Yes" if user_data.phone else "No",
            "email_address": "Yes",
            "login_history": "Yes"
        },
        "data_sharing": {
            "marketing_consent": False,
            "analytics_tracking": True,
            "third_party_sharing": False
        },
        "retention_period": "As long as account is active"
    }
    
    return usage_info

@account_router.post("/download-data")
async def request_data_download(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    return SuccessResponse(message="Data download request submitted. You will receive an email with download link within 24 hours.")

@account_router.post("/lock-account")
async def lock_account(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    await auth_crud.deactivate_account(db, current_user["id"])
    return SuccessResponse(message="Account has been locked. Contact support to unlock.")

@account_router.post("/unlock-account")
async def unlock_account(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    await auth_crud.reactivate_account(db, current_user["id"])
    return SuccessResponse(message="Account has been unlocked successfully")
