from fastapi import APIRouter, Depends, Form
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.auth.responses.profile_response import ProfileResponse
from app.features.auth.requests.profile_request import PreferencesUpdateRequest, NotificationSettingsRequest
from app.features.auth.cruds.profile_crud import ProfileCrud
from app.core.role_auth import get_all_users
from app.core.exceptions import ValidationException, NotFoundException
from app.database.session import get_async_session
from app.core.logging import get_logger
from app.core.base import SuccessResponse

settings_router = APIRouter(tags=["User Settings"])
logger = get_logger("auth.settings")

@settings_router.get("/preferences", response_model=ProfileResponse)
async def get_user_preferences(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    profile_data = await profile_crud.get_or_create_by_user_id(db, current_user["id"])
    return ProfileResponse(**profile_data.to_dict())

@settings_router.put("/language")
async def update_language_preference(
    language: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    if language not in ["en", "es", "fr", "de", "it", "pt", "zh", "ja", "ko", "ar", "hi", "ru"]:
        raise ValidationException("Unsupported language code")
    
    profile_crud = ProfileCrud()
    updated_profile = await profile_crud.update_preferences(
        db, current_user["id"], {"language": language}
    )
    return SuccessResponse(message=f"Language updated to {language}")

@settings_router.put("/timezone")
async def update_timezone_preference(
    timezone: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    updated_profile = await profile_crud.update_preferences(
        db, current_user["id"], {"timezone": timezone}
    )
    return SuccessResponse(message=f"Timezone updated to {timezone}")

@settings_router.put("/currency")
async def update_currency_preference(
    currency: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    if currency not in ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL"]:
        raise ValidationException("Unsupported currency code")
    
    profile_crud = ProfileCrud()
    updated_profile = await profile_crud.update_preferences(
        db, current_user["id"], {"currency": currency}
    )
    return SuccessResponse(message=f"Currency updated to {currency}")

@settings_router.put("/theme")
async def update_theme_preference(
    theme: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    if theme not in ["light", "dark", "auto"]:
        raise ValidationException("Theme must be 'light', 'dark', or 'auto'")
    
    profile_crud = ProfileCrud()
    updated_profile = await profile_crud.update_preferences(
        db, current_user["id"], {"theme": theme}
    )
    return SuccessResponse(message=f"Theme updated to {theme}")

@settings_router.put("/marketing-consent")
async def update_marketing_consent(
    marketing_emails: bool = Form(...),
    newsletter: bool = Form(True),
    promotional_offers: bool = Form(True),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    
    preferences = {
        "marketing_emails": marketing_emails,
        "newsletter": newsletter,
        "promotional_offers": promotional_offers
    }
    
    updated_profile = await profile_crud.update_preferences(db, current_user["id"], preferences)
    return SuccessResponse(message="Marketing preferences updated")

@settings_router.put("/privacy")
async def update_privacy_settings(
    profile_visibility: str = Form("public"),
    show_online_status: bool = Form(True),
    allow_friend_requests: bool = Form(True),
    show_purchase_history: bool = Form(False),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    if profile_visibility not in ["public", "private", "friends_only"]:
        raise ValidationException("Profile visibility must be 'public', 'private', or 'friends_only'")
    
    profile_crud = ProfileCrud()
    
    privacy_settings = {
        "profile_visibility": profile_visibility,
        "show_online_status": show_online_status,
        "allow_friend_requests": allow_friend_requests,
        "show_purchase_history": show_purchase_history
    }
    
    updated_profile = await profile_crud.update_preferences(db, current_user["id"], privacy_settings)
    return SuccessResponse(message="Privacy settings updated")

@settings_router.put("/notifications/email")
async def update_email_notifications(
    order_updates: bool = Form(True),
    promotional_emails: bool = Form(True),
    security_alerts: bool = Form(True),
    newsletter: bool = Form(True),
    product_recommendations: bool = Form(True),
    price_alerts: bool = Form(True),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    
    email_settings = {
        "email_notifications": True,
        "order_updates": order_updates,
        "promotional_emails": promotional_emails,
        "security_alerts": security_alerts,
        "newsletter": newsletter,
        "product_recommendations": product_recommendations,
        "price_alerts": price_alerts
    }
    
    updated_profile = await profile_crud.update_notification_settings(db, current_user["id"], email_settings)
    return SuccessResponse(message="Email notification preferences updated")

@settings_router.put("/notifications/push")
async def update_push_notifications(
    enabled: bool = Form(True),
    order_updates: bool = Form(True),
    promotional_offers: bool = Form(False),
    price_alerts: bool = Form(True),
    wishlist_alerts: bool = Form(True),
    review_reminders: bool = Form(True),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    
    push_settings = {
        "push_notifications": enabled,
        "push_order_updates": order_updates,
        "push_promotional_offers": promotional_offers,
        "push_price_alerts": price_alerts,
        "push_wishlist_alerts": wishlist_alerts,
        "push_review_reminders": review_reminders
    }
    
    updated_profile = await profile_crud.update_notification_settings(db, current_user["id"], push_settings)
    return SuccessResponse(message="Push notification preferences updated")

@settings_router.put("/notifications/sms")
async def update_sms_notifications(
    enabled: bool = Form(False),
    order_updates: bool = Form(True),
    security_alerts: bool = Form(True),
    delivery_updates: bool = Form(True),
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    
    sms_settings = {
        "sms_notifications": enabled,
        "sms_order_updates": order_updates,
        "sms_security_alerts": security_alerts,
        "sms_delivery_updates": delivery_updates
    }
    
    updated_profile = await profile_crud.update_notification_settings(db, current_user["id"], sms_settings)
    return SuccessResponse(message="SMS notification preferences updated")

@settings_router.post("/reset-preferences")
async def reset_all_preferences(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    
    default_preferences = {
        "language": "en",
        "timezone": "UTC",
        "currency": "USD",
        "theme": "light",
        "marketing_emails": False,
        "newsletter": False,
        "promotional_offers": False,
        "profile_visibility": "public",
        "show_online_status": True,
        "allow_friend_requests": True,
        "show_purchase_history": False
    }
    
    default_notifications = {
        "email_notifications": True,
        "push_notifications": True,
        "sms_notifications": False,
        "order_updates": True,
        "security_alerts": True,
        "promotional_emails": False,
        "newsletter": False,
        "product_recommendations": False,
        "price_alerts": False
    }
    
    await profile_crud.update_preferences(db, current_user["id"], default_preferences)
    await profile_crud.update_notification_settings(db, current_user["id"], default_notifications)
    
    return SuccessResponse(message="All preferences reset to default values")

@settings_router.get("/export")
async def export_settings(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    profile_crud = ProfileCrud()
    profile_data = await profile_crud.get_profile_dict(db, current_user["id"])
    
    settings_export = {
        "preferences": profile_data.get("preferences", {}),
        "notification_settings": profile_data.get("notification_settings", {}),
        "social_links": profile_data.get("social_links", {}),
        "export_date": profile_data.get("updated_at"),
        "version": "1.0"
    }
    
    return settings_export
