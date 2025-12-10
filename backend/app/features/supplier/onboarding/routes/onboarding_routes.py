from app.features.supplier.onboarding.requests.supplier_business_request import (
    LegalEntityTypeEnum
)
from app.features.supplier.onboarding.responses.supplier_business_response import (
    SupplierBusinessResponse,
    OnboardingStatusResponse,
    BusinessOnboardingResponse,
    SupplierDocumentResponse,
    SupplierSustainabilityResponse
)
from app.features.supplier.onboarding.cruds.onboarding_crud import OnboardingCrud
from app.features.supplier.onboarding.cruds.supplier_document_crud import SupplierDocumentCRUD
from app.features.supplier.onboarding.cruds.supplier_sustainability_crud import SupplierSustainabilityCRUD
from app.features.supplier.onboarding.models.supplier_document import DocumentTypeEnum
from app.core.role_auth import require_supplier, get_all_users
from app.core.exceptions import ValidationException, NotFoundException, AuthorizationException
from app.core.logging import get_logger
from app.core.base import SuccessResponse
from app.core.supabase_storage import SupabaseStorageClient
from app.database.session import get_async_session
from fastapi import APIRouter, Depends, File, Form, status
from fastapi.datastructures import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Union
import uuid
import json
import asyncio

supplier_onboarding_router = APIRouter(prefix="/supplier/onboarding", tags=["Onboarding"])
logger = get_logger("onboarding.routes")

@supplier_onboarding_router.get("/status", response_model=OnboardingStatusResponse)
async def get_onboarding_status(
    current_user: Dict[str, Any] = Depends(get_all_users),
    db: AsyncSession = Depends(get_async_session)
):
    onboarding_crud = OnboardingCrud(current_user.get("access_token"))
    status_data = await onboarding_crud.get_onboarding_status(db, current_user["id"])
    return OnboardingStatusResponse(**status_data)

@supplier_onboarding_router.post("/business-profile", response_model=SupplierBusinessResponse, status_code=status.HTTP_201_CREATED)
async def create_business_profile(
    business_name: str = Form(...),
    legal_entity_type: LegalEntityTypeEnum = Form(...),
    pan_gst_number: str = Form(...),
    bank_name: str = Form(...),
    bank_account_number: str = Form(...),
    ifsc_code: str = Form(...),
    business_address: str = Form(...),
    is_msme_registered: bool = Form(False),
    website: Union[str, None] = Form(None),
    description: Union[str, None] = Form(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    data = {
        "business_name": business_name,
        "legal_entity_type": legal_entity_type,
        "pan_gst_number": pan_gst_number,
        "bank_name": bank_name,
        "bank_account_number": bank_account_number,
        "ifsc_code": ifsc_code,
        "business_address": business_address,
        "is_msme_registered": is_msme_registered,
        "website": website if website and website.strip() else None,
        "description": description if description and description.strip() else None
    }
    
    onboarding_crud = OnboardingCrud(current_user.get("access_token"))
    try:
        business_data = await onboarding_crud.create_supplier_business(db, current_user["id"], data)
        return SupplierBusinessResponse(**business_data)
    except Exception as e:
        logger.error(f"Error creating supplier business: {str(e)}")
        raise ValidationException(f"Failed to create supplier business: {str(e)}")

@supplier_onboarding_router.put("/business-profile", response_model=SupplierBusinessResponse)
async def update_business_profile(
    business_name: Union[str, None] = Form(None),
    legal_entity_type: Union[LegalEntityTypeEnum, None] = Form(None),
    pan_gst_number: Union[str, None] = Form(None),
    bank_name: Union[str, None] = Form(None),
    bank_account_number: Union[str, None] = Form(None),
    ifsc_code: Union[str, None] = Form(None),
    business_address: Union[str, None] = Form(None),
    is_msme_registered: Union[bool, None] = Form(None),
    website: Union[str, None] = Form(None),
    description: Union[str, None] = Form(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    data = {}
    if business_name and business_name.strip():
        data["business_name"] = business_name
    if legal_entity_type:
        data["legal_entity_type"] = legal_entity_type
    if pan_gst_number and pan_gst_number.strip():
        data["pan_gst_number"] = pan_gst_number
    if bank_name and bank_name.strip():
        data["bank_name"] = bank_name
    if bank_account_number and bank_account_number.strip():
        data["bank_account_number"] = bank_account_number
    if ifsc_code and ifsc_code.strip():
        data["ifsc_code"] = ifsc_code
    if business_address and business_address.strip():
        data["business_address"] = business_address
    if is_msme_registered is not None:
        data["is_msme_registered"] = is_msme_registered
    if website and website.strip():
        data["website"] = website
    if description and description.strip():
        data["description"] = description
    
    onboarding_crud = OnboardingCrud(current_user.get("access_token"))
    try:
        business_data = await onboarding_crud.update_supplier_business(db, current_user["id"], data)
        return SupplierBusinessResponse(**business_data)
    except Exception as e:
        logger.error(f"Error updating supplier business: {str(e)}")
        raise ValidationException(f"Failed to update supplier business: {str(e)}")

@supplier_onboarding_router.get("/business-profile", response_model=SupplierBusinessResponse)
async def get_business_profile(
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    onboarding_crud = OnboardingCrud(current_user.get("access_token"))
    business_data = await onboarding_crud.get_supplier_business(db, current_user["id"])
    if not business_data:
        raise NotFoundException("Supplier business not found")
    return SupplierBusinessResponse(**business_data)

@supplier_onboarding_router.delete("/business-profile")
async def delete_business_profile(
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    onboarding_crud = OnboardingCrud(current_user.get("access_token"))
    business = await onboarding_crud.get_supplier_business(db, current_user["id"])
    if not business:
        raise NotFoundException("Business profile not found")
    
    if business.get("logo_url"):
        try:
            delete_file_from_url(business["logo_url"])
        except:
            pass
    
    if business.get("banner_url"):
        try:
            delete_file_from_url(business["banner_url"])
        except:
            pass
    
    doc_crud = SupplierDocumentCRUD()
    documents = await doc_crud.get_documents_by_supplier(db, uuid.UUID(current_user["id"]))
    for doc in documents:
        if doc.file_url:
            try:
                delete_file_from_url(doc.file_url)
            except:
                pass
        try:
            await doc_crud.delete_document(db, doc.id)
        except:
            pass
    
    await onboarding_crud.delete_supplier_business(db, current_user["id"])
    return SuccessResponse(message="Business profile deleted successfully")

@supplier_onboarding_router.get("/documents", response_model=List[SupplierDocumentResponse])
async def get_supplier_documents(
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    doc_crud = SupplierDocumentCRUD()
    documents = await doc_crud.get_documents_by_supplier(db, uuid.UUID(current_user["id"]))
    return [SupplierDocumentResponse(**doc.to_dict()) for doc in documents]

@supplier_onboarding_router.delete("/document/{document_id}")
async def delete_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    doc_crud = SupplierDocumentCRUD()
    document = await doc_crud.get_document_by_id(db, uuid.UUID(document_id))
    
    if not document or str(document.supplier_id) != current_user["id"]:
        raise NotFoundException("Document not found")
    
    try:
        storage_client = SupabaseStorageClient()
        blob_path = extract_blob_path_from_url(document.file_path)
        if blob_path:
            storage_client.delete_file("supplier-assets", blob_path)
    except:
        pass
    
    success = await doc_crud.delete_document(db, uuid.UUID(document_id))
    if success:
        return SuccessResponse(message="Document deleted successfully")
    raise ValidationException("Failed to delete document")

@supplier_onboarding_router.post("/sustainability-profile", response_model=SupplierSustainabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_sustainability_profile(
    sustainability_practices: str = Form(...),
    sustainability_certificate: Union[UploadFile, str, None] = File(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    onboarding_crud = OnboardingCrud(current_user.get("access_token"))
    business = await onboarding_crud.get_supplier_business(db, current_user["id"])
    if not business:
        raise NotFoundException("Supplier business not found. Please complete business profile first.")
    
    certificate_url = None
    if (sustainability_certificate and hasattr(sustainability_certificate, 'filename') and 
        hasattr(sustainability_certificate, 'content_type') and hasattr(sustainability_certificate, 'size') and 
        sustainability_certificate.filename and sustainability_certificate.filename.strip() != "" and sustainability_certificate.size > 0):
        try:
            certificate_url = await upload_supplier_document(sustainability_certificate, current_user["id"], "sustainability_certificate")
        except Exception as e:
            logger.error(f"Certificate upload failed: {str(e)}")
            raise ValidationException(f"Certificate upload failed: {str(e)}")
    elif sustainability_certificate == "":
        certificate_url = ""
    
    certifications = []
    if certificate_url:
        certifications = [{"name": "sustainability_certificate", "file_url": certificate_url}]
    
    sustainability_crud = SupplierSustainabilityCRUD()
    sustainability_data = await sustainability_crud.create_sustainability_profile(
        db,
        supplier_id=uuid.UUID(current_user["id"]),
        business_id=uuid.UUID(business["id"]),
        sustainability_practices=sustainability_practices,
        certifications=certifications
    )
    
    return SupplierSustainabilityResponse(**sustainability_data.to_dict())

@supplier_onboarding_router.get("/sustainability-profile", response_model=SupplierSustainabilityResponse)
async def get_sustainability_profile(
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    sustainability_crud = SupplierSustainabilityCRUD()
    sustainability = await sustainability_crud.get_sustainability_by_supplier(db, uuid.UUID(current_user["id"]))
    if not sustainability:
        raise NotFoundException("Sustainability profile not found")
    return SupplierSustainabilityResponse(**sustainability.to_dict())

@supplier_onboarding_router.put("/sustainability-profile", response_model=SupplierSustainabilityResponse)
async def update_sustainability_profile(
    sustainability_practices: Union[str, None] = Form(None),
    sustainability_certificate: Union[UploadFile, str, None] = File(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    sustainability_crud = SupplierSustainabilityCRUD()
    sustainability = await sustainability_crud.get_sustainability_by_supplier(db, uuid.UUID(current_user["id"]))
    if not sustainability:
        raise NotFoundException("Sustainability profile not found")
    
    if hasattr(sustainability, 'certifications') and sustainability.certifications:
        for cert in sustainability.certifications:
            if isinstance(cert, dict) and cert.get('file_url'):
                try:
                    delete_file_from_url(cert['file_url'])
                except:
                    pass
    
    cert_list = None
    if (sustainability_certificate and hasattr(sustainability_certificate, 'filename') and 
        hasattr(sustainability_certificate, 'content_type') and hasattr(sustainability_certificate, 'size') and 
        sustainability_certificate.filename and sustainability_certificate.filename.strip() != "" and sustainability_certificate.size > 0):
        try:
            certificate_url = await upload_supplier_document(sustainability_certificate, current_user["id"], "sustainability_certificate")
            cert_list = [{"name": "sustainability_certificate", "file_url": certificate_url}]
        except Exception as e:
            logger.error(f"Certificate upload failed: {str(e)}")
            raise ValidationException(f"Certificate upload failed: {str(e)}")
    elif sustainability_certificate == "":
        cert_list = []
    
    updated_sustainability = await sustainability_crud.update_sustainability_profile(
        db,
        sustainability_id=sustainability.id,
        sustainability_practices=sustainability_practices if sustainability_practices and sustainability_practices.strip() else None,
        certifications=cert_list
    )
    
    return SupplierSustainabilityResponse(**updated_sustainability.to_dict())

@supplier_onboarding_router.delete("/sustainability-profile")
async def delete_sustainability_profile(
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    sustainability_crud = SupplierSustainabilityCRUD()
    sustainability = await sustainability_crud.get_sustainability_by_supplier(db, uuid.UUID(current_user["id"]))
    if not sustainability:
        raise NotFoundException("Sustainability profile not found")
    
    if hasattr(sustainability, 'certifications') and sustainability.certifications:
        for cert in sustainability.certifications:
            if isinstance(cert, dict) and cert.get('file_url'):
                try:
                    delete_file_from_url(cert['file_url'])
                except:
                    pass
    
    await sustainability_crud.delete_sustainability_profile(db, sustainability.id)
    return SuccessResponse(message="Sustainability profile deleted successfully")

@supplier_onboarding_router.post("/business-onboarding", response_model=BusinessOnboardingResponse, status_code=status.HTTP_201_CREATED)
async def business_onboarding(
    business_name: str = Form(...),
    legal_entity_type: LegalEntityTypeEnum = Form(...),
    pan_gst_number: str = Form(...),
    bank_name: str = Form(...),
    bank_account_number: str = Form(...),
    ifsc_code: str = Form(...),
    business_address: str = Form(...),
    is_msme_registered: bool = Form(False),
    website: Union[str, None] = Form(None),
    description: Union[str, None] = Form(None),
    logo: Union[UploadFile, str, None] = File(None),
    banner: Union[UploadFile, str, None] = File(None),
    pan_card: Union[UploadFile, str, None] = File(None),
    address_proof: Union[UploadFile, str, None] = File(None),
    fssai_license: Union[UploadFile, str, None] = File(None),
    trade_license: Union[UploadFile, str, None] = File(None),
    msme_certificate: Union[UploadFile, str, None] = File(None),
    other_document: Union[UploadFile, str, None] = File(None),
    other_document_name: Union[str, None] = Form(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    
    try:
        file_urls = {}
        all_upload_tasks = []
        
        if (logo and hasattr(logo, 'filename') and hasattr(logo, 'content_type') and 
            hasattr(logo, 'size') and logo.filename and logo.filename.strip() != "" and logo.size > 0):
            logger.info(f"Processing logo upload: {logo.filename}, {logo.content_type}")
            all_upload_tasks.append(("logo", upload_supplier_logo(logo, current_user["id"])))
        elif logo == "":
            file_urls["logo_url"] = ""
        else:
            logger.info(f"No logo to upload - type: {type(logo)}")
        
        if (banner and hasattr(banner, 'filename') and hasattr(banner, 'content_type') and 
            hasattr(banner, 'size') and banner.filename and banner.filename.strip() != "" and banner.size > 0):
            logger.info(f"Processing banner upload: {banner.filename}, {banner.content_type}")
            all_upload_tasks.append(("banner", upload_supplier_banner(banner, current_user["id"])))
        elif banner == "":
            file_urls["banner_url"] = ""
        else:
            logger.info(f"No banner to upload - type: {type(banner)}")
        
        documents_to_upload = [
            (pan_card, DocumentTypeEnum.PAN_CARD, "pan_card"),
            (address_proof, DocumentTypeEnum.ADDRESS_PROOF, "address_proof"),
            (fssai_license, DocumentTypeEnum.FSSAI_LICENSE, "fssai_license"),
            (trade_license, DocumentTypeEnum.TRADE_LICENSE, "trade_license"),
            (msme_certificate, DocumentTypeEnum.MSME_CERTIFICATE, "msme_certificate")
        ]
        
        if (other_document and hasattr(other_document, 'filename') and hasattr(other_document, 'content_type') and 
            hasattr(other_document, 'size') and other_document.filename and other_document.filename.strip() != "" and other_document.size > 0):
            if not other_document_name or not other_document_name.strip():
                raise ValidationException("'other_document_name' is required when uploading 'other_document'")
            documents_to_upload.append((other_document, DocumentTypeEnum.OTHER, other_document_name or "other_document"))
        
        valid_documents = []
        for file_obj, doc_type, doc_name in documents_to_upload:
            has_valid_file = (
                file_obj is not None and
                hasattr(file_obj, 'filename') and 
                hasattr(file_obj, 'content_type') and 
                hasattr(file_obj, 'size') and
                file_obj.filename is not None and
                file_obj.filename.strip() != "" and
                file_obj.size > 0
            )
            
            if has_valid_file:
                logger.info(f"Document details: filename={file_obj.filename}, content_type={file_obj.content_type}, size={file_obj.size}")
                all_upload_tasks.append((f"document_{doc_type.value}", upload_supplier_document(file_obj, current_user["id"], doc_type.value)))
                valid_documents.append((file_obj, doc_type, doc_name))
        
        if all_upload_tasks:
            try:
                logger.info(f"Starting concurrent upload of {len(all_upload_tasks)} files")
                results = await asyncio.gather(*[task[1] for task in all_upload_tasks], return_exceptions=True)
                
                for i, (upload_type, _) in enumerate(all_upload_tasks):
                    result = results[i]
                    if isinstance(result, Exception):
                        logger.error(f"{upload_type} upload failed: {str(result)}")
                        raise ValidationException(f"{upload_type} upload failed: {str(result)}")
                    else:
                        if upload_type.startswith("document_"):
                            file_urls[upload_type] = result
                        else:
                            file_urls[f"{upload_type}_url"] = result
                        logger.info(f"{upload_type} uploaded successfully: {result}")
                        
            except Exception as e:
                logger.error(f"Concurrent file upload failed: {str(e)}")
                raise ValidationException(f"File upload failed: {str(e)}")
        
        logo_url = file_urls.get("logo_url")
        banner_url = file_urls.get("banner_url")
        
        business_data = {
            "business_name": business_name.strip(),
            "legal_entity_type": legal_entity_type,
            "pan_gst_number": pan_gst_number.strip(),
            "bank_name": bank_name.strip(),
            "bank_account_number": bank_account_number.strip(),
            "ifsc_code": ifsc_code.strip(),
            "business_address": business_address.strip(),
            "is_msme_registered": is_msme_registered,
            "website": website.strip() if website and website.strip() else None,
            "description": description.strip() if description and description.strip() else None,
            "logo_url": logo_url,
            "banner_url": banner_url
        }
        
        logger.info(f"Creating business with data")
        onboarding_crud = OnboardingCrud(current_user.get("access_token"))
        business_result = await onboarding_crud.create_supplier_business(db, current_user["id"], business_data)
        logger.info(f"Business created with ID: {business_result['id']}")
        
        uploaded_documents = []
        doc_crud = SupplierDocumentCRUD()
        
        for i, (file_obj, doc_type, doc_name) in enumerate(valid_documents):
            doc_key = f"document_{doc_type.value}"
            if doc_key in file_urls:
                file_url = file_urls[doc_key]
                logger.info(f"Processing uploaded document: {doc_name}")
                
                try:
                    document_data = await doc_crud.create_document(
                        db,
                        supplier_id=uuid.UUID(current_user["id"]),
                        data={
                            "business_id": uuid.UUID(business_result["id"]),
                            "document_type": doc_type,
                            "document_name": doc_name,
                            "file_path": extract_blob_path_from_url(file_url)[1],
                            "file_url": file_url,
                            "file_size": file_obj.size if hasattr(file_obj, 'size') else 0,
                            "mime_type": file_obj.content_type
                        }
                    )
                    uploaded_documents.append(document_data.to_dict())
                    logger.info(f"Document saved to database: {document_data.id}")
                except Exception as e:
                    logger.error(f"Error saving document to database: {str(e)}")
        
        business_response = SupplierBusinessResponse(**business_result)
        if uploaded_documents:
            logger.info(f"Adding {len(uploaded_documents)} documents to response")
            business_response.documents = [SupplierDocumentResponse(**doc) for doc in uploaded_documents]
        
        logger.info(f"Onboarding completed successfully. Uploaded files: {file_urls}")
        
        return BusinessOnboardingResponse(
            message="Business onboarding completed successfully",
            supplier_business=business_response,
            uploaded_files=file_urls
        )
    
    except Exception as e:
        logger.error(f"Complete onboarding error: {str(e)}")
        try:
            for key, url in file_urls.items():
                if url and url != "":
                    delete_file_from_url(url)
        except:
            pass
        raise ValidationException(f"Onboarding failed: {str(e)}")

@supplier_onboarding_router.put("/business-onboarding", response_model=BusinessOnboardingResponse)
async def update_business_onboarding(
    business_name: Union[str, None] = Form(None),
    legal_entity_type: Union[LegalEntityTypeEnum, None] = Form(None),
    pan_gst_number: Union[str, None] = Form(None),
    bank_name: Union[str, None] = Form(None),
    bank_account_number: Union[str, None] = Form(None),
    ifsc_code: Union[str, None] = Form(None),
    business_address: Union[str, None] = Form(None),
    is_msme_registered: Union[bool, None] = Form(None),
    website: Union[str, None] = Form(None),
    description: Union[str, None] = Form(None),
    logo: Union[UploadFile, str, None] = File(None),
    banner: Union[UploadFile, str, None] = File(None),
    pan_card: Union[UploadFile, str, None] = File(None),
    address_proof: Union[UploadFile, str, None] = File(None),
    fssai_license: Union[UploadFile, str, None] = File(None),
    trade_license: Union[UploadFile, str, None] = File(None),
    msme_certificate: Union[UploadFile, str, None] = File(None),
    other_document: Union[UploadFile, str, None] = File(None),
    other_document_name: Union[str, None] = Form(None),
    current_user: Dict[str, Any] = Depends(require_supplier()),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        file_urls = {}
        upload_tasks = []
        
        onboarding_crud = OnboardingCrud(current_user.get("access_token"))
        existing_business = await onboarding_crud.get_supplier_business(db, current_user["id"])
        if not existing_business:
            raise NotFoundException("Business profile not found. Please create business profile first.")
        
        if (logo and hasattr(logo, 'filename') and hasattr(logo, 'content_type') and 
            hasattr(logo, 'size') and logo.filename and logo.filename.strip() != "" and logo.size > 0):
            if existing_business.get("logo_url"):
                try:
                    delete_file_from_url(existing_business["logo_url"])
                except:
                    pass
            upload_tasks.append(("logo", upload_supplier_logo(logo, current_user["id"])))
        elif logo == "":
            if existing_business.get("logo_url"):
                try:
                    delete_file_from_url(existing_business["logo_url"])
                except:
                    pass
            file_urls["logo_url"] = ""
        
        if (banner and hasattr(banner, 'filename') and hasattr(banner, 'content_type') and 
            hasattr(banner, 'size') and banner.filename and banner.filename.strip() != "" and banner.size > 0):
            if existing_business.get("banner_url"):
                try:
                    delete_file_from_url(existing_business["banner_url"])
                except:
                    pass
            upload_tasks.append(("banner", upload_supplier_banner(banner, current_user["id"])))
        elif banner == "":
            if existing_business.get("banner_url"):
                try:
                    delete_file_from_url(existing_business["banner_url"])
                except:
                    pass
            file_urls["banner_url"] = ""
        
        if upload_tasks:
            try:
                results = await asyncio.gather(*[task[1] for task in upload_tasks], return_exceptions=True)
                for i, (upload_type, _) in enumerate(upload_tasks):
                    result = results[i]
                    if isinstance(result, Exception):
                        raise ValidationException(f"{upload_type.capitalize()} upload failed: {str(result)}")
                    else:
                        file_urls[f"{upload_type}_url"] = result
            except Exception as e:
                raise ValidationException(f"File upload failed: {str(e)}")
        
        logo_url = file_urls.get("logo_url")
        banner_url = file_urls.get("banner_url")
        
        documents_to_upload = [
            (pan_card, DocumentTypeEnum.PAN_CARD, "pan_card"),
            (address_proof, DocumentTypeEnum.ADDRESS_PROOF, "address_proof"),
            (fssai_license, DocumentTypeEnum.FSSAI_LICENSE, "fssai_license"),
            (trade_license, DocumentTypeEnum.TRADE_LICENSE, "trade_license"),
            (msme_certificate, DocumentTypeEnum.MSME_CERTIFICATE, "msme_certificate")
        ]
        
        if (other_document and hasattr(other_document, 'filename') and hasattr(other_document, 'content_type') and 
            hasattr(other_document, 'size') and other_document.filename and other_document.filename.strip() != "" and other_document.size > 0):
            if not other_document_name or not other_document_name.strip():
                raise ValidationException("'other_document_name' is required when uploading 'other_document'")
            documents_to_upload.append((other_document, DocumentTypeEnum.OTHER, other_document_name or "other_document"))
        
        business_data = {}
        if business_name and business_name.strip():
            business_data["business_name"] = business_name.strip()
        if legal_entity_type:
            business_data["legal_entity_type"] = legal_entity_type
        if pan_gst_number and pan_gst_number.strip():
            business_data["pan_gst_number"] = pan_gst_number.strip()
        if bank_name and bank_name.strip():
            business_data["bank_name"] = bank_name.strip()
        if bank_account_number and bank_account_number.strip():
            business_data["bank_account_number"] = bank_account_number.strip()
        if ifsc_code and ifsc_code.strip():
            business_data["ifsc_code"] = ifsc_code.strip()
        if business_address and business_address.strip():
            business_data["business_address"] = business_address.strip()
        if is_msme_registered is not None:
            business_data["is_msme_registered"] = is_msme_registered
        if website and website.strip():
            business_data["website"] = website.strip()
        if description and description.strip():
            business_data["description"] = description.strip()
        if logo_url is not None:
            business_data["logo_url"] = logo_url
        if banner_url is not None:
            business_data["banner_url"] = banner_url
        
        if business_data:
            business_result = await onboarding_crud.update_supplier_business(db, current_user["id"], business_data)
        else:
            business_result = existing_business
        
        uploaded_documents = []
        doc_crud = SupplierDocumentCRUD()
        
        valid_documents = []
        for file_obj, doc_type, doc_name in documents_to_upload:
            has_valid_file = (
                file_obj is not None and
                hasattr(file_obj, 'filename') and 
                hasattr(file_obj, 'content_type') and 
                hasattr(file_obj, 'size') and
                file_obj.filename is not None and
                file_obj.filename.strip() != "" and
                file_obj.size > 0
            )
            
            if has_valid_file:
                valid_documents.append((file_obj, doc_type, doc_name))
        
        if valid_documents:
            try:
                existing_documents = await doc_crud.get_documents_by_supplier(db, uuid.UUID(current_user["id"]))
                
                for file_obj, doc_type, doc_name in valid_documents:
                    for existing_doc in existing_documents:
                        if existing_doc.document_type == doc_type:
                            try:
                                if existing_doc.file_url:
                                    delete_file_from_url(existing_doc.file_url)
                                await doc_crud.delete_document(db, existing_doc.id)
                            except:
                                pass
                
                upload_coroutines = [
                    upload_supplier_document(file_obj, current_user["id"], doc_type.value)
                    for file_obj, doc_type, doc_name in valid_documents
                ]
                
                upload_results = await asyncio.gather(*upload_coroutines, return_exceptions=True)
                
                for i, (file_obj, doc_type, doc_name) in enumerate(valid_documents):
                    result = upload_results[i]
                    
                    if isinstance(result, Exception):
                        logger.error(f"Error uploading document {doc_name}: {str(result)}")
                        continue
                    
                    file_url = result
                    
                    if file_url:
                        document_data = await doc_crud.create_document(
                            db,
                            supplier_id=uuid.UUID(current_user["id"]),
                            data={
                                "business_id": uuid.UUID(business_result["id"]),
                                "document_type": doc_type,
                                "document_name": doc_name,
                                "file_path": extract_blob_path_from_url(file_url)[1],
                                "file_url": file_url,
                                "file_size": file_obj.size if hasattr(file_obj, 'size') else 0,
                                "mime_type": file_obj.content_type
                            }
                        )
                        uploaded_documents.append(document_data.to_dict())
                        file_urls[f"document_{doc_type.value}"] = file_url
                        
            except Exception as e:
                logger.error(f"Error in concurrent document upload: {str(e)}")
        
        business_response = SupplierBusinessResponse(**business_result)
        if uploaded_documents:
            business_response.documents = [SupplierDocumentResponse(**doc) for doc in uploaded_documents]
        
        return BusinessOnboardingResponse(
            message="Business onboarding updated successfully",
            supplier_business=business_response,
            uploaded_files=file_urls
        )
    
    except Exception as e:
        logger.error(f"Update business onboarding error: {str(e)}")
        try:
            for key, url in file_urls.items():
                if url and url != "":
                    delete_file_from_url(url)
        except:
            pass
        raise ValidationException(f"Business onboarding update failed: {str(e)}")

@supplier_onboarding_router.post("/upload-logo", response_model=SupplierBusinessResponse)
async def upload_logo(
     logo: Union[UploadFile, str, None] = File(None), 
     current_user: Dict[str, Any] = Depends(require_supplier()),
     db: AsyncSession = Depends(get_async_session)
):
    if not logo or not (hasattr(logo, 'filename') and hasattr(logo, 'content_type') and 
                        hasattr(logo, 'size') and logo.filename and logo.filename.strip() != "" and logo.size > 0):
        raise ValidationException("Logo file is required")
    
    try:
        onboarding_crud = OnboardingCrud(current_user.get("access_token"))
        existing_business = await onboarding_crud.get_supplier_business(db, current_user["id"])
        
        if existing_business and existing_business.get("logo_url"):
            try:
                delete_file_from_url(existing_business["logo_url"])
            except:
                pass
        
        logo_url = await upload_supplier_logo(logo, current_user["id"])
        business_data = await onboarding_crud.upload_logo(db, current_user["id"], logo_url)
        return SupplierBusinessResponse(**business_data)
    except Exception as e:
        logger.error(f"Logo upload error: {str(e)}")
        raise ValidationException("Logo upload failed")

@supplier_onboarding_router.post("/upload-banner", response_model=SupplierBusinessResponse)
async def upload_banner(
     banner: Union[UploadFile, str, None] = File(None), 
     current_user: Dict[str, Any] = Depends(require_supplier()),
     db: AsyncSession = Depends(get_async_session)
):
    if not banner or not (hasattr(banner, 'filename') and hasattr(banner, 'content_type') and 
                          hasattr(banner, 'size') and banner.filename and banner.filename.strip() != "" and banner.size > 0):
        raise ValidationException("Banner file is required")
    
    try:
        onboarding_crud = OnboardingCrud(current_user.get("access_token"))
        existing_business = await onboarding_crud.get_supplier_business(db, current_user["id"])
        
        if existing_business and existing_business.get("banner_url"):
            try:
                delete_file_from_url(existing_business["banner_url"])
            except:
                pass
        
        banner_url = await upload_supplier_banner(banner, current_user["id"])
        business_data = await onboarding_crud.upload_banner(db, current_user["id"], banner_url)
        return SupplierBusinessResponse(**business_data)
    except Exception as e:
        logger.error(f"Banner upload error: {str(e)}")
        raise ValidationException("Banner upload failed")

@supplier_onboarding_router.get("/assets")
async def list_assets(
    current_user: Dict[str, Any] = Depends(require_supplier())
):
    storage_client = SupabaseStorageClient()
    from app.core.config import settings
    try:
        client = get_storage_client()
        bucket = client.get_bucket(settings.GCP_BUCKET_SUPPLIER_ASSETS)
        assets = []
        for blob in bucket.list_blobs():
            if current_user["id"] in blob.name:
                assets.append({
                    "name": blob.name,
                    "url": f"{settings.GCP_CDN_BASE_URL}/{settings.GCP_BUCKET_SUPPLIER_ASSETS}/{blob.name}",
                    "size": blob.size or 0,
                    "created_at": blob.time_created.isoformat() if blob.time_created else None,
                    "updated_at": blob.updated.isoformat() if blob.updated else None
                })
        return {"bucket": settings.GCP_BUCKET_SUPPLIER_ASSETS, "assets": assets, "total": len(assets)}
    except Exception as e:
        logger.error(f"Failed to list assets: {str(e)}")
        raise ValidationException(f"Failed to list assets: {str(e)}")

@supplier_onboarding_router.delete("/assets/{file_name}")
async def delete_asset(
    file_name: str,
    current_user: Dict[str, Any] = Depends(require_supplier())
):
    if current_user["id"] not in file_name:
        raise AuthorizationException("You can only delete your own files")
    
    from app.core.config import settings
    storage_client = SupabaseStorageClient()
    try:
        client = get_storage_client()
        success = client.delete_file(settings.GCP_BUCKET_SUPPLIER_ASSETS, file_name)
        if success:
            logger.info(f"Asset {file_name} deleted by supplier {current_user['id']}")
            return SuccessResponse(message=f"File {file_name} deleted successfully")
        else:
            raise NotFoundException(f"File {file_name} not found")
    except Exception as e:
        logger.error(f"Failed to delete asset {file_name}: {str(e)}")
        raise ValidationException(f"Failed to delete file: {str(e)}")