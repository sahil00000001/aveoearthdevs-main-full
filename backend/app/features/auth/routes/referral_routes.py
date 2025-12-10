from fastapi import APIRouter, Depends
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.auth.cruds.otp_crud import OTPCrud
from app.features.auth.cruds.referral_crud import ReferralCrud
from app.features.auth.requests.phone_referral_request import PhoneReferralRequest
from app.features.auth.responses.referral_response import UserReferralResponse
from app.features.auth.responses.user_response import UserResponse
from app.features.auth.cruds.auth_crud import AuthCrud
from app.core.role_auth import get_all_users
from app.core.exceptions import ValidationException, AuthenticationException
from app.database.session import get_async_session
from app.core.whatsapp import get_whatsapp_service
from app.core.logging import get_logger
from app.core.config import settings
from app.features.auth.responses.otp_response import OTPResponse
from pydantic import BaseModel

referral_router = APIRouter(prefix="/referral", tags=["Referral"])
logger = get_logger("auth.referral")

@referral_router.get("/referrals", response_model=UserReferralResponse)
async def get_user_referrals(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    referral_data = await auth_crud.get_user_referral_stats(db, current_user["id"])
    
    try:
        return UserReferralResponse(**referral_data)
    except Exception as e:
        logger.error(f"Error creating UserReferralResponse: {str(e)}")
        raise ValidationException(f"Error processing referral data: {str(e)}")

@referral_router.post("/phone-referral")
async def update_phone_and_referral(
    request: PhoneReferralRequest,
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    auth_crud = AuthCrud()
    updated_user = await auth_crud.update_phone_and_referral(
        db,
        current_user["id"], 
        request.phone, 
        request.referral_code
    )
    
    if request.phone:
        otp_crud = OTPCrud()
        whatsapp_service = get_whatsapp_service()
        
        otp_result = await otp_crud.create_otp(db, request.phone, "phone", current_user["id"])
        await whatsapp_service.send_otp(request.phone, otp_result["otp_code"])
        
        otp_response = OTPResponse(
            message="Phone number updated and OTP sent",
            expires_in=settings.OTP_EXPIRY_MINUTES * 60,
            phone=request.phone
        )
        try:
            return {"user": UserResponse(**updated_user), "otp": otp_response}
        except Exception as e:
            logger.error(f"Error creating UserResponse: {str(e)}")
            raise ValidationException(f"Error processing user data: {str(e)}")
    
    from app.core.base import SuccessResponse
    try:
        return {"user": UserResponse(**updated_user), "result": SuccessResponse(message="Information updated successfully")}
    except Exception as e:
        logger.error(f"Error creating UserResponse: {str(e)}")
        raise ValidationException(f"Error processing user data: {str(e)}")

@referral_router.get("/referrals/count")
async def get_referral_count(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    referral_crud = ReferralCrud()
    count = await referral_crud.get_referral_count(db, current_user["id"])
    
    class ReferralCountResponse(BaseModel):
        user_id: str
        referral_count: int
        referral_code: Any
    return ReferralCountResponse(user_id=current_user["id"], referral_count=count, referral_code=current_user.get("referral_code"))
