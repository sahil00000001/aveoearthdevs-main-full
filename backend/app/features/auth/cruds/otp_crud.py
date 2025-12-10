from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import secrets
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.features.auth.models.otp_verification import OTPVerification, OTPTypeEnum
from app.features.auth.models.user import User
from app.core.exceptions import ValidationException, RateLimitException
from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger("auth.crud")

class OTPCrud(BaseCrud[OTPVerification]):
    def __init__(self):
        super().__init__(get_supabase_client(), OTPVerification)
    
    async def create_otp(self, db: AsyncSession, phone: str, otp_type: str = "phone", user_id: Optional[str] = None) -> Dict[str, Any]:
        try:
            await self.cleanup_expired_otps(db, phone)
            otp_code = "".join(secrets.choice(string.digits) for _ in range(6))
            expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
            otp_data = {
                "user_id": user_id,
                "phone": phone,
                "otp_code": otp_code,
                "type": getattr(OTPTypeEnum, otp_type.upper(), OTPTypeEnum.PHONE),
                "expires_at": expires_at,
                "attempts": 0
            }
            await self.create(db, otp_data)
            logger.info(f"OTP created for phone: {phone}")
            return {
                "otp_code": otp_code,
                "expires_at": expires_at,
                "phone": phone
            }
        except Exception as e:
            logger.error(f"OTP creation error: {str(e)}")
            raise ValidationException("Failed to create OTP")
    
    async def verify_otp(self, db: AsyncSession, phone: str, otp_code: str) -> bool:
        try:
            result = await db.execute(
                select(OTPVerification)
                .where(OTPVerification.phone == phone)
                .where(OTPVerification.otp_code == otp_code)
                .order_by(OTPVerification.created_at.desc())
                .limit(1)
            )
            otp_record = result.scalar_one_or_none()
            
            # Check for any recent OTP for rate limiting
            if not otp_record:
                # Check if there's any recent OTP to increment attempts
                recent_result = await db.execute(
                    select(OTPVerification)
                    .where(OTPVerification.phone == phone)
                    .where(OTPVerification.expires_at > datetime.utcnow())
                    .order_by(OTPVerification.created_at.desc())
                    .limit(1)
                )
                recent_otp = recent_result.scalar_one_or_none()
                if recent_otp and recent_otp.attempts < settings.OTP_MAX_ATTEMPTS:
                    await db.execute(
                        update(OTPVerification)
                        .where(OTPVerification.id == recent_otp.id)
                        .values(attempts=recent_otp.attempts + 1)
                    )
                    await db.commit()
                return False
                
            if otp_record.verified_at:
                return False
            if otp_record.expires_at < datetime.utcnow():
                return False
            if otp_record.attempts >= settings.OTP_MAX_ATTEMPTS:
                raise RateLimitException(f"Maximum OTP verification attempts exceeded for phone: {phone}")
                
            await db.execute(
                update(OTPVerification)
                .where(OTPVerification.id == otp_record.id)
                .values(verified_at=datetime.utcnow())
            )
            
            if otp_record.user_id:
                await db.execute(
                    update(User)
                    .where(User.id == otp_record.user_id)
                    .values(is_phone_verified=True)
                )
            
            await db.commit()
            logger.info(f"OTP verified for phone: {phone}")
            return True
        except RateLimitException:
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"OTP verification error: {str(e)}")
            return False
    
    async def cleanup_expired_otps(self, db: AsyncSession, phone: str):
        try:
            await db.execute(
                delete(OTPVerification)
                .where(OTPVerification.phone == phone)
                .where(OTPVerification.expires_at < datetime.utcnow())
            )
            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.error(f"OTP cleanup error: {str(e)}")
