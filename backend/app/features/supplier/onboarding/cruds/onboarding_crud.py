from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database.base import get_supabase_client
from app.core.base import BaseCrud
from app.features.supplier.onboarding.models.supplier_business import SupplierBusiness, VerificationStatusEnum
from app.features.auth.models.user import User
from app.core.exceptions import (
    NotFoundException,
    ConflictException,
    AuthorizationException
)
from app.core.logging import get_logger

logger = get_logger("onboarding.crud")

class OnboardingCrud(BaseCrud[SupplierBusiness]):
    def __init__(self, user_token: Optional[str] = None):
        client = get_supabase_client()
        super().__init__(client, SupplierBusiness)
    
    async def get_onboarding_status(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        try:
            user_result = await db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()
            
            if not user:
                raise NotFoundException("User not found")
            
            user_type = user.user_type
            
            response = {
                "user_id": str(user_id),
                "user_type": user_type,
                "is_onboarding_complete": True,
                "supplier_business": None
            }
            
            if user_type == "supplier":
                supplier_business = await self.get_by_field(db, "supplier_id", user_id)
                if supplier_business:
                    response["supplier_business"] = {
                        "id": str(supplier_business.id),
                        "business_name": supplier_business.business_name,
                        "business_type": supplier_business.business_type,
                        "verification_status": supplier_business.verification_status,
                        "logo_url": supplier_business.logo_url,
                        "banner_url": supplier_business.banner_url,
                        "created_at": supplier_business.created_at.isoformat() if supplier_business.created_at else None
                    }
                    response["is_onboarding_complete"] = supplier_business.verification_status != VerificationStatusEnum.PENDING
                else:
                    response["is_onboarding_complete"] = False
            
            return response
        except Exception as e:
            logger.error(f"Error getting onboarding status for {user_id}: {str(e)}")
            raise

    async def create_supplier_business(self, db: AsyncSession, user_id: str, business_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            user_result = await db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()
            
            if not user:
                raise NotFoundException("User not found")
            
            if user.user_type != "supplier":
                raise AuthorizationException("Only suppliers can create business profiles")
            
            existing_business = await self.get_by_field(db, "supplier_id", user_id)
            if existing_business:
                raise ConflictException("Supplier business already exists")
            
            business_data.update({
                "supplier_id": user_id,
                "verification_status": VerificationStatusEnum.PENDING,
            })
            
            created_business = await self.create(db, business_data)
            logger.info(f"Supplier business created for user: {user_id}")
            
            return created_business.to_dict()
        except Exception as e:
            logger.error(f"Error creating supplier business for {user_id}: {str(e)}")
            raise

    async def update_supplier_business(self, db: AsyncSession, user_id: str, business_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            existing_business = await self.get_by_field(db, "supplier_id", user_id)
            if not existing_business:
                raise NotFoundException("Supplier business not found")
            
            updated_business = await self.update(db, str(existing_business.id), business_data)
            logger.info(f"Supplier business updated for user: {user_id}")
            
            return updated_business.to_dict()
        except Exception as e:
            logger.error(f"Error updating supplier business for {user_id}: {str(e)}")
            raise

    async def upload_document(self, db: AsyncSession, user_id: str, document_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            supplier_business = await self.get_by_field(db, "supplier_id", user_id)
            if not supplier_business:
                raise NotFoundException("Supplier business not found")
            
            
            document_entry = {
                "id": str(uuid.uuid4()),
                "document_type": document_data["document_type"],
                "document_name": document_data["document_name"],
                "file_path": document_data["file_path"],
                "uploaded_at": datetime.utcnow().isoformat()
            }
            
            
            logger.info(f"Document uploaded for supplier: {user_id}")
            return {
                "document_id": document_entry["id"],
                "file_url": document_data["file_path"]
            }
        except Exception as e:
            logger.error(f"Error uploading document for {user_id}: {str(e)}")
            raise

    async def upload_logo(self, db: AsyncSession, user_id: str, logo_url: str) -> Dict[str, Any]:
        try:
            supplier_business = await self.get_by_field(db, "supplier_id", user_id)
            if not supplier_business:
                raise NotFoundException("Supplier business not found")
            
            updated_business = await self.update(db, str(supplier_business.id), {"logo_url": logo_url})
            logger.info(f"Logo uploaded for supplier: {user_id}")
            
            return updated_business.to_dict()
        except Exception as e:
            logger.error(f"Error uploading logo for {user_id}: {str(e)}")
            raise

    async def upload_banner(self, db: AsyncSession, user_id: str, banner_url: str) -> Dict[str, Any]:
        try:
            supplier_business = await self.get_by_field(db, "supplier_id", user_id)
            if not supplier_business:
                raise NotFoundException("Supplier business not found")
            
            updated_business = await self.update(db, str(supplier_business.id), {"banner_url": banner_url})
            logger.info(f"Banner uploaded for supplier: {user_id}")
            
            return updated_business.to_dict()
        except Exception as e:
            logger.error(f"Error uploading banner for {user_id}: {str(e)}")
            raise

    async def get_supplier_business(self, db: AsyncSession, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            business = await self.get_by_field(db, "supplier_id", user_id)
            if not business:
                return None
            
            return business.to_dict()
        except Exception as e:
            logger.error(f"Error getting supplier business for {user_id}: {str(e)}")
            return None

    async def complete_onboarding(self, db: AsyncSession, user_id: str, business_data: Dict[str, Any], uploaded_files: Dict[str, str]) -> Dict[str, Any]:
        try:
            user_result = await db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()
            
            if not user:
                raise NotFoundException("User not found")
            
            if user.user_type != "supplier":
                raise AuthorizationException("Only suppliers can complete onboarding")
            
            existing_business = await self.get_by_field(db, "supplier_id", user_id)
            
            complete_business_data = {
                **business_data,
                "supplier_id": user_id,
                "verification_status": VerificationStatusEnum.PENDING,
                "logo_url": uploaded_files.get("logo_url"),
                "banner_url": uploaded_files.get("banner_url"),
            }
            
            if existing_business:
                business_result = await self.update(db, str(existing_business.id), complete_business_data)
                logger.info(f"Supplier business updated for user: {user_id}")
            else:
                business_result = await self.create(db, complete_business_data)
                logger.info(f"Supplier business created for user: {user_id}")
            
            return business_result.to_dict()
        except Exception as e:
            logger.error(f"Error completing onboarding for {user_id}: {str(e)}")
            raise

    async def get_all_suppliers(self, db: AsyncSession, offset: int = 0, limit: int = 20, verification_status: Optional[VerificationStatusEnum] = None) -> List[SupplierBusiness]:
        try:
            query = select(SupplierBusiness)
            
            if verification_status:
                query = query.where(SupplierBusiness.verification_status == verification_status)
            
            query = query.offset(offset).limit(limit)
            result = await db.execute(query)
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error getting all suppliers: {str(e)}")
            raise

    async def get_suppliers_count(self, db: AsyncSession, verification_status: Optional[VerificationStatusEnum] = None) -> int:
        try:
            query = select(func.count(SupplierBusiness.id))
            
            if verification_status:
                query = query.where(SupplierBusiness.verification_status == verification_status)
            
            result = await db.execute(query)
            return result.scalar()
        except Exception as e:
            logger.error(f"Error getting suppliers count: {str(e)}")
            raise
