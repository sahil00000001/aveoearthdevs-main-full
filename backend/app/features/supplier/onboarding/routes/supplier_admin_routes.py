from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from uuid import UUID

from app.database.session import get_async_session
from app.core.role_auth import require_admin
from app.core.pagination import PaginatedResponse, PaginationParams
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger

from app.features.auth.models.user import User, UserTypeEnum
from app.features.supplier.onboarding.models.supplier_business import SupplierBusiness, VerificationStatusEnum
from app.features.supplier.onboarding.models.supplier_document import SupplierDocument, DocumentStatusEnum
from app.features.supplier.onboarding.models.supplier_sustainability import SupplierSustainability, SustainabilityStatusEnum
from app.features.supplier.onboarding.cruds.onboarding_crud import OnboardingCrud
from app.features.supplier.onboarding.cruds.supplier_document_crud import SupplierDocumentCRUD
from app.features.supplier.onboarding.cruds.supplier_sustainability_crud import SupplierSustainabilityCRUD
from app.features.supplier.onboarding.responses.supplier_business_response import (
    SupplierBusinessResponse,
    SupplierDocumentResponse,
    SupplierSustainabilityResponse
)
from app.features.supplier.onboarding.responses.suppliers_list_response import SupplierListResponse

logger = get_logger("supplier_admin")

supplier_admin_router = APIRouter(prefix="/admin/suppliers", tags=["Admin Suppliers"])

@supplier_admin_router.get("/", response_model=PaginatedResponse[SupplierListResponse])
async def get_suppliers_list(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    verification_status: Optional[VerificationStatusEnum] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    current_user: Dict[str, Any] = Depends(require_admin())
):
    pagination = PaginationParams(page=page, limit=limit)
    
    query = select(SupplierBusiness).options(
        selectinload(SupplierBusiness.supplier)
    ).join(User, SupplierBusiness.supplier_id == User.id)
    
    if verification_status:
        query = query.where(SupplierBusiness.verification_status == verification_status)
    
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (SupplierBusiness.business_name.ilike(search_filter)) |
            (User.email.ilike(search_filter)) |
            (User.first_name.ilike(search_filter)) |
            (User.last_name.ilike(search_filter))
        )
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset(pagination.offset).limit(pagination.limit)
    result = await db.execute(query)
    suppliers = result.scalars().all()
    
    supplier_responses = []
    for supplier_business in suppliers:
        document_crud = SupplierDocumentCRUD()
        documents = await document_crud.get_documents_by_supplier(db, supplier_business.supplier_id)
        
        document_responses = []
        verified_documents = 0
        for doc in documents:
            if doc.document_status == DocumentStatusEnum.VERIFIED:
                verified_documents += 1
            document_responses.append(SupplierDocumentResponse(
                id=str(doc.id),
                document_type=doc.document_type,
                document_name=doc.document_name,
                file_url=doc.file_url,
                file_size=doc.file_size,
                mime_type=doc.mime_type,
                document_status=doc.document_status,
                verification_notes=doc.verification_notes,
                verified_at=doc.verified_at,
                verified_by=str(doc.verified_by) if doc.verified_by else None,
                created_at=doc.created_at,
                updated_at=doc.updated_at
            ))
        
        sustainability_crud = SupplierSustainabilityCRUD()
        sustainability = await sustainability_crud.get_sustainability_by_supplier(db, supplier_business.supplier_id)
        has_sustainability_profile = sustainability is not None
        
        supplier_response = SupplierListResponse(
            id=str(supplier_business.id),
            supplier_id=str(supplier_business.supplier_id),
            business_name=supplier_business.business_name,
            legal_entity_type=supplier_business.legal_entity_type,
            pan_gst_number=supplier_business.pan_gst_number,
            bank_name=supplier_business.bank_name,
            bank_account_number=supplier_business.bank_account_number,
            ifsc_code=supplier_business.ifsc_code,
            business_address=supplier_business.business_address,
            is_msme_registered=supplier_business.is_msme_registered,
            website=supplier_business.website,
            description=supplier_business.description,
            logo_url=supplier_business.logo_url,
            banner_url=supplier_business.banner_url,
            verification_status=supplier_business.verification_status,
            verification_notes=supplier_business.verification_notes,
            verified_at=supplier_business.verified_at,
            verified_by=str(supplier_business.verified_by) if supplier_business.verified_by else None,
            documents=document_responses,
            created_at=supplier_business.created_at,
            updated_at=supplier_business.updated_at,
            supplier_email=supplier_business.supplier.email,
            supplier_phone=supplier_business.supplier.phone,
            supplier_first_name=supplier_business.supplier.first_name,
            supplier_last_name=supplier_business.supplier.last_name,
            total_documents=len(documents),
            verified_documents=verified_documents,
            has_sustainability_profile=has_sustainability_profile
        )
        supplier_responses.append(supplier_response)
    
    return PaginatedResponse.create(
        items=supplier_responses,
        total=total,
        page=page,
        limit=limit
    )

class SupplierDetailResponse(SupplierBusinessResponse):
    supplier_email: str
    supplier_phone: Optional[str] = None
    supplier_first_name: Optional[str] = None
    supplier_last_name: Optional[str] = None
    sustainability_profile: Optional[SupplierSustainabilityResponse] = None

@supplier_admin_router.get("/{supplier_id}", response_model=SupplierDetailResponse)
async def get_supplier_details(
    supplier_id: UUID,
    db: AsyncSession = Depends(get_async_session),
    current_user: Dict[str, Any] = Depends(require_admin())
):
    query = select(SupplierBusiness).options(
        selectinload(SupplierBusiness.supplier)
    ).where(SupplierBusiness.supplier_id == supplier_id)
    
    result = await db.execute(query)
    supplier_business = result.scalar_one_or_none()
    
    if not supplier_business:
        raise NotFoundException("Supplier business not found")
    
    document_crud = SupplierDocumentCRUD()
    documents = await document_crud.get_documents_by_supplier(db, supplier_id)
    
    document_responses = []
    for doc in documents:
        document_responses.append(SupplierDocumentResponse(
            id=str(doc.id),
            document_type=doc.document_type,
            document_name=doc.document_name,
            file_url=doc.file_url,
            file_size=doc.file_size,
            mime_type=doc.mime_type,
            document_status=doc.document_status,
            verification_notes=doc.verification_notes,
            verified_at=doc.verified_at,
            verified_by=str(doc.verified_by) if doc.verified_by else None,
            created_at=doc.created_at,
            updated_at=doc.updated_at
        ))
    
    sustainability_crud = SupplierSustainabilityCRUD()
    sustainability = await sustainability_crud.get_sustainability_by_supplier(db, supplier_id)
    
    sustainability_response = None
    if sustainability:
        sustainability_response = SupplierSustainabilityResponse(
            id=str(sustainability.id),
            sustainability_practices=sustainability.sustainability_practices,
            certifications=sustainability.certifications or [],
            sustainability_score=sustainability.sustainability_score,
            sustainability_status=sustainability.sustainability_status,
            assessment_notes=sustainability.assessment_notes,
            assessed_at=sustainability.assessed_at,
            assessed_by=str(sustainability.assessed_by) if sustainability.assessed_by else None,
            created_at=sustainability.created_at,
            updated_at=sustainability.updated_at
        )
    
    return SupplierDetailResponse(
        id=str(supplier_business.id),
        supplier_id=str(supplier_business.supplier_id),
        business_name=supplier_business.business_name,
        legal_entity_type=supplier_business.legal_entity_type,
        pan_gst_number=supplier_business.pan_gst_number,
        bank_name=supplier_business.bank_name,
        bank_account_number=supplier_business.bank_account_number,
        ifsc_code=supplier_business.ifsc_code,
        business_address=supplier_business.business_address,
        is_msme_registered=supplier_business.is_msme_registered,
        website=supplier_business.website,
        description=supplier_business.description,
        logo_url=supplier_business.logo_url,
        banner_url=supplier_business.banner_url,
        verification_status=supplier_business.verification_status,
        verification_notes=supplier_business.verification_notes,
        verified_at=supplier_business.verified_at,
        verified_by=str(supplier_business.verified_by) if supplier_business.verified_by else None,
        documents=document_responses,
        created_at=supplier_business.created_at,
        updated_at=supplier_business.updated_at,
        supplier_email=supplier_business.supplier.email,
        supplier_phone=supplier_business.supplier.phone,
        supplier_first_name=supplier_business.supplier.first_name,
        supplier_last_name=supplier_business.supplier.last_name,
        sustainability_profile=sustainability_response
    )

@supplier_admin_router.get("/{supplier_id}/documents", response_model=List[SupplierDocumentResponse])
async def get_supplier_documents(
    supplier_id: UUID,
    db: AsyncSession = Depends(get_async_session),
    current_user: Dict[str, Any] = Depends(require_admin())
):
    document_crud = SupplierDocumentCRUD()
    documents = await document_crud.get_documents_by_supplier(db, supplier_id)
    
    return [
        SupplierDocumentResponse(
            id=str(doc.id),
            document_type=doc.document_type,
            document_name=doc.document_name,
            file_url=doc.file_url,
            file_size=doc.file_size,
            mime_type=doc.mime_type,
            document_status=doc.document_status,
            verification_notes=doc.verification_notes,
            verified_at=doc.verified_at,
            verified_by=str(doc.verified_by) if doc.verified_by else None,
            created_at=doc.created_at,
            updated_at=doc.updated_at
        )
        for doc in documents
    ]

@supplier_admin_router.get("/{supplier_id}/sustainability", response_model=SupplierSustainabilityResponse)
async def get_supplier_sustainability(
    supplier_id: UUID,
    db: AsyncSession = Depends(get_async_session),
    current_user: Dict[str, Any] = Depends(require_admin())
):
    sustainability_crud = SupplierSustainabilityCRUD()
    sustainability = await sustainability_crud.get_sustainability_by_supplier(db, supplier_id)
    
    if not sustainability:
        raise NotFoundException("Sustainability profile not found")
    
    return SupplierSustainabilityResponse(
        id=str(sustainability.id),
        sustainability_practices=sustainability.sustainability_practices,
        certifications=sustainability.certifications or [],
        sustainability_score=sustainability.sustainability_score,
        sustainability_status=sustainability.sustainability_status,
        assessment_notes=sustainability.assessment_notes,
        assessed_at=sustainability.assessed_at,
        assessed_by=str(sustainability.assessed_by) if sustainability.assessed_by else None,
        created_at=sustainability.created_at,
        updated_at=sustainability.updated_at
    )

@supplier_admin_router.put("/{supplier_id}/verification-status")
async def update_supplier_verification_status(
    supplier_id: UUID,
    verification_status: VerificationStatusEnum,
    verification_notes: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    current_user: Dict[str, Any] = Depends(require_admin())
):
    onboarding_crud = OnboardingCrud()
    supplier_business = await onboarding_crud.get_by_field(db, "supplier_id", str(supplier_id))
    
    if not supplier_business:
        raise NotFoundException("Supplier business not found")
    
    update_data = {
        "verification_status": verification_status,
        "verified_by": current_user["id"]
    }
    
    if verification_notes:
        update_data["verification_notes"] = verification_notes
    
    updated_business = await onboarding_crud.update(db, str(supplier_business.id), update_data)
    
    return {
        "message": "Supplier verification status updated successfully",
        "verification_status": verification_status,
        "verified_by": current_user["id"]
    }

@supplier_admin_router.put("/documents/{document_id}/status")
async def update_document_status(
    document_id: UUID,
    document_status: DocumentStatusEnum,
    verification_notes: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    current_user: Dict[str, Any] = Depends(require_admin())
):
    document_crud = SupplierDocumentCRUD()
    updated_document = await document_crud.update_document_status(
        db=db,
        document_id=document_id,
        status=document_status,
        verification_notes=verification_notes,
        verified_by=UUID(current_user["id"])
    )
    
    if not updated_document:
        raise NotFoundException("Document not found")
    
    return {
        "message": "Document status updated successfully",
        "document_id": str(document_id),
        "status": document_status
    }

@supplier_admin_router.put("/{supplier_id}/sustainability/assessment")
async def update_sustainability_assessment(
    supplier_id: UUID,
    sustainability_status: SustainabilityStatusEnum,
    sustainability_score: Optional[str] = None,
    assessment_notes: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    current_user: Dict[str, Any] = Depends(require_admin())
):
    sustainability_crud = SupplierSustainabilityCRUD()
    sustainability = await sustainability_crud.get_sustainability_by_supplier(db, supplier_id)
    
    if not sustainability:
        raise NotFoundException("Sustainability profile not found")
    
    updated_sustainability = await sustainability_crud.update_sustainability_assessment(
        db=db,
        sustainability_id=sustainability.id,
        status=sustainability_status,
        sustainability_score=sustainability_score,
        assessment_notes=assessment_notes,
        assessed_by=UUID(current_user["id"])
    )
    
    return {
        "message": "Sustainability assessment updated successfully",
        "sustainability_status": sustainability_status,
        "assessed_by": current_user["id"]
    }
