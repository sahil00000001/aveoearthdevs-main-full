from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.auth.requests.otp_request import SendOTPRequest, VerifyOTPRequest
from app.features.auth.responses.otp_response import OTPResponse
from app.features.auth.cruds.otp_crud import OTPCrud
from app.core.whatsapp import get_whatsapp_service
from app.core.exceptions import ValidationException
from app.core.logging import get_logger
from app.core.config import settings
from app.core.base import SuccessResponse
from app.features.auth.routes.auth_routes import auth_router
from app.database.session import get_async_session

logger = get_logger("auth.routes")

@auth_router.post("/send-otp", response_model=OTPResponse)
async def send_otp(request: SendOTPRequest, db: AsyncSession = Depends(get_async_session)):
    otp_crud = OTPCrud()
    whatsapp_service = get_whatsapp_service()
    
    otp_result = await otp_crud.create_otp(db, request.phone)
    
    await whatsapp_service.send_otp(request.phone, otp_result["otp_code"])
    
    return OTPResponse(
        message="OTP sent successfully",
        expires_in=settings.OTP_EXPIRY_MINUTES * 60,
        phone=request.phone
    )

@auth_router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest, db: AsyncSession = Depends(get_async_session)):
    otp_crud = OTPCrud()
    
    is_verified = await otp_crud.verify_otp(db, request.phone, request.otp_code)
    
    if not is_verified:
        raise ValidationException("Invalid or expired OTP")
    
    return SuccessResponse(message="OTP verified successfully")
