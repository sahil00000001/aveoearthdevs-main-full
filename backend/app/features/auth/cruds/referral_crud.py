from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.features.auth.models.referral import Referral, ReferralStatusEnum
from app.features.auth.models.user import User
from app.core.logging import get_logger

logger = get_logger("crud.referrals")

class ReferralCrud(BaseCrud[Referral]):
    def __init__(self):
        super().__init__(get_supabase_client(), Referral)
        self.logger = get_logger("crud.referrals")

    async def get_referral_count(self, db: AsyncSession, user_id: str) -> int:
        try:
            result = await db.execute(
                select(func.count()).select_from(Referral)
                .where(Referral.referrer_id == user_id)
                .where(Referral.status == ReferralStatusEnum.COMPLETED)
            )
            return result.scalar() or 0
        except Exception as e:
            self.logger.error(f"Error getting referral count for {user_id}: {str(e)}")
            return 0

    async def get_user_referrals(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        try:
            result = await db.execute(
                select(Referral)
                .options(selectinload(Referral.referee))
                .where(Referral.referrer_id == user_id)
                .order_by(Referral.created_at.desc())
            )
            referrals = result.scalars().all()

            total_referrals = len(referrals)
            completed_referrals = len([r for r in referrals if r.status == ReferralStatusEnum.COMPLETED])
            pending_referrals = len([r for r in referrals if r.status == ReferralStatusEnum.PENDING])

            referral_data = []
            for r in referrals:
                ref_dict = {
                    "id": str(r.id),
                    "referral_code": r.referral_code,
                    "status": r.status,
                    "completed_at": r.completed_at.isoformat() if r.completed_at else None,
                    "created_at": r.created_at.isoformat() if r.created_at else None
                }
                if r.referee:
                    ref_dict["referee"] = {
                        "id": str(r.referee.id),
                        "email": r.referee.email,
                        "first_name": r.referee.first_name,
                        "last_name": r.referee.last_name,
                        "created_at": r.referee.created_at.isoformat() if r.referee.created_at else None
                    }
                referral_data.append(ref_dict)

            return {
                "total_referrals": total_referrals,
                "completed_referrals": completed_referrals,
                "pending_referrals": pending_referrals,
                "referrals": referral_data
            }
        except Exception as e:
            self.logger.error(f"Error getting user referrals for {user_id}: {str(e)}")
            return {
                "total_referrals": 0,
                "completed_referrals": 0,
                "pending_referrals": 0,
                "referrals": []
            }

    async def create_referral_record(self, db: AsyncSession, referrer_id: str, referee_id: str, referral_code: str) -> Referral:
        try:
            referral_data = {
                "referrer_id": referrer_id,
                "referee_id": referee_id,
                "referral_code": referral_code,
                "status": ReferralStatusEnum.COMPLETED,
                "completed_at": datetime.utcnow()
            }
            
            created_referral = await self.create(db, referral_data)
            self.logger.info(f"Referral record created: {referrer_id} -> {referee_id}")
            return created_referral
        except Exception as e:
            self.logger.error(f"Error creating referral record: {str(e)}")
            raise

    async def get_referrals_by_code(self, db: AsyncSession, referral_code: str) -> List[Referral]:
        try:
            result = await db.execute(select(Referral).where(Referral.referral_code == referral_code))
            return list(result.scalars().all())
        except Exception as e:
            self.logger.error(f"Error getting referrals by code {referral_code}: {str(e)}")
            return []
