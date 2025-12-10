from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any
from uuid import UUID
from app.features.supplier.onboarding.models.supplier_sustainability import SupplierSustainability, SustainabilityStatusEnum

class SupplierSustainabilityCRUD:
    def __init__(self, user_token: Optional[str] = None):
        pass

    async def create_sustainability_profile(
        self,
        db: AsyncSession,
        supplier_id: UUID,
        business_id: UUID,
        sustainability_practices: str,
        certifications: Optional[List[Dict[str, Any]]] = None
    ) -> SupplierSustainability:
        sustainability = SupplierSustainability(
            supplier_id=supplier_id,
            business_id=business_id,
            sustainability_practices=sustainability_practices,
            certifications=certifications or [],
            sustainability_status=SustainabilityStatusEnum.PENDING
        )
        db.add(sustainability)
        await db.commit()
        await db.refresh(sustainability)
        return sustainability

    async def get_sustainability_by_id(self, db: AsyncSession, sustainability_id: UUID) -> Optional[SupplierSustainability]:
        result = await db.execute(select(SupplierSustainability).where(SupplierSustainability.id == sustainability_id))
        return result.scalar_one_or_none()

    async def get_sustainability_by_supplier(self, db: AsyncSession, supplier_id: UUID) -> Optional[SupplierSustainability]:
        result = await db.execute(select(SupplierSustainability).where(SupplierSustainability.supplier_id == supplier_id))
        return result.scalar_one_or_none()

    async def get_sustainability_by_business(self, db: AsyncSession, business_id: UUID) -> Optional[SupplierSustainability]:
        result = await db.execute(select(SupplierSustainability).where(SupplierSustainability.business_id == business_id))
        return result.scalar_one_or_none()

    async def update_sustainability_profile(
        self,
        db: AsyncSession,
        sustainability_id: UUID,
        sustainability_practices: Optional[str] = None,
        certifications: Optional[List[Dict[str, Any]]] = None
    ) -> Optional[SupplierSustainability]:
        sustainability = await self.get_sustainability_by_id(db, sustainability_id)
        if sustainability:
            if sustainability_practices:
                sustainability.sustainability_practices = sustainability_practices
            if certifications is not None:
                sustainability.certifications = certifications
            await db.commit()
            await db.refresh(sustainability)
        return sustainability

    async def update_sustainability_assessment(
        self,
        db: AsyncSession,
        sustainability_id: UUID,
        status: SustainabilityStatusEnum,
        sustainability_score: Optional[str] = None,
        assessment_notes: Optional[str] = None,
        assessed_by: Optional[UUID] = None
    ) -> Optional[SupplierSustainability]:
        sustainability = await self.get_sustainability_by_id(db, sustainability_id)
        if sustainability:
            sustainability.sustainability_status = status
            if sustainability_score:
                sustainability.sustainability_score = sustainability_score
            if assessment_notes:
                sustainability.assessment_notes = assessment_notes
            if assessed_by:
                sustainability.assessed_by = assessed_by
            await db.commit()
            await db.refresh(sustainability)
        return sustainability

    async def get_sustainability_by_status(self, db: AsyncSession, status: SustainabilityStatusEnum) -> List[SupplierSustainability]:
        result = await db.execute(select(SupplierSustainability).where(SupplierSustainability.sustainability_status == status))
        return result.scalars().all()

    async def delete_sustainability_profile(self, db: AsyncSession, sustainability_id: UUID) -> bool:
        sustainability = await self.get_sustainability_by_id(db, sustainability_id)
        if sustainability:
            await db.delete(sustainability)
            await db.commit()
            return True
        return False

    async def get_all_sustainability_profiles(self, db: AsyncSession) -> List[SupplierSustainability]:
        result = await db.execute(select(SupplierSustainability))
        return result.scalars().all()
