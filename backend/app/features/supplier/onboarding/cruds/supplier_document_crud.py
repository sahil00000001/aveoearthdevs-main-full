from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, select
from typing import List, Optional, Dict, Any
from uuid import UUID
from app.features.supplier.onboarding.models.supplier_document import SupplierDocument, DocumentTypeEnum, DocumentStatusEnum

class SupplierDocumentCRUD:
    def __init__(self, user_token: Optional[str] = None):
        pass

    async def create_document(
        self,
        db: AsyncSession,
        supplier_id: UUID,
        data: Dict[str, Any]
    ) -> SupplierDocument:
        document = SupplierDocument(
            supplier_id=supplier_id,
            business_id=data["business_id"],
            document_type=data["document_type"],
            document_name=data["document_name"],
            file_path=data["file_path"],
            file_url=data.get("file_url"),
            file_size=data.get("file_size"),
            mime_type=data.get("mime_type"),
            document_status=DocumentStatusEnum.UPLOADED
        )
        db.add(document)
        await db.commit()
        await db.refresh(document)
        return document

    async def get_document_by_id(self, db: AsyncSession, document_id: UUID) -> Optional[SupplierDocument]:
        result = await db.execute(select(SupplierDocument).where(SupplierDocument.id == document_id))
        return result.scalar_one_or_none()

    async def get_documents_by_supplier(self, db: AsyncSession, supplier_id: UUID) -> List[SupplierDocument]:
        result = await db.execute(select(SupplierDocument).where(SupplierDocument.supplier_id == supplier_id))
        return result.scalars().all()

    async def get_documents_by_business(self, db: AsyncSession, business_id: UUID) -> List[SupplierDocument]:
        result = await db.execute(select(SupplierDocument).where(SupplierDocument.business_id == business_id))
        return result.scalars().all()

    async def get_documents_by_type(self, db: AsyncSession, supplier_id: UUID, document_type: DocumentTypeEnum) -> List[SupplierDocument]:
        result = await db.execute(
            select(SupplierDocument).where(
                and_(
                    SupplierDocument.supplier_id == supplier_id,
                    SupplierDocument.document_type == document_type
                )
            )
        )
        return result.scalars().all()

    async def update_document_status(
        self,
        db: AsyncSession,
        document_id: UUID,
        status: DocumentStatusEnum,
        verification_notes: Optional[str] = None,
        verified_by: Optional[UUID] = None
    ) -> Optional[SupplierDocument]:
        document = await self.get_document_by_id(db, document_id)
        if document:
            document.document_status = status
            if verification_notes:
                document.verification_notes = verification_notes
            if verified_by:
                document.verified_by = verified_by
            await db.commit()
            await db.refresh(document)
        return document

    async def delete_document(self, db: AsyncSession, document_id: UUID) -> bool:
        document = await self.get_document_by_id(db, document_id)
        if document:
            await db.delete(document)
            await db.commit()
            return True
        return False

    async def get_documents_by_status(self, db: AsyncSession, status: DocumentStatusEnum) -> List[SupplierDocument]:
        result = await db.execute(select(SupplierDocument).where(SupplierDocument.document_status == status))
        return result.scalars().all()
