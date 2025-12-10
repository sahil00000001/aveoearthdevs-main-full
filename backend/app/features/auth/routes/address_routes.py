from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_async_session
from app.core.role_auth import get_all_users, require_admin, require_buyer
from app.core.exceptions import NotFoundException
from app.core.base import SuccessResponse
from app.core.pagination import PaginationParams, PaginatedResponse
from app.core.logging import get_logger
from app.features.auth.models.address import AddressTypeEnum
from app.features.auth.cruds.address_crud import AddressCRUD
from app.features.auth.requests.address_request import (
    AddressCreateRequest, 
    AddressUpdateRequest, 
    AddressSearchRequest
)
from app.features.auth.responses.address_response import (
    AddressResponse, 
    AddressListResponse, 
    AddressStatsResponse, 
    AddressSummaryResponse, 
    AddressSearchResponse
)

buyer_address_router = APIRouter(prefix="/addresses", tags=["Addresses"])
admin_address_router = APIRouter(prefix="/admin/addresses", tags=["Admin Addresses"])

logger = get_logger("addresses.routes")

@buyer_address_router.post("/", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(
    request: AddressCreateRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    address_data = await crud.create_address(db, current_user["id"], request)
    return AddressResponse(**address_data)

@admin_address_router.get("/", response_model=PaginatedResponse[AddressResponse])
async def get_addresses(
    address_type: Optional[AddressTypeEnum] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    pagination = PaginationParams(page=page, limit=limit)
    crud = AddressCRUD()
    return await crud.get_paginated_addresses(db, current_user["id"], pagination, address_type)

@admin_address_router.get("/by-type/{address_type}", response_model=AddressListResponse)
async def get_addresses_by_type(
    address_type: AddressTypeEnum,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    addresses = await crud.get_user_addresses(db, current_user["id"], address_type)
    return AddressListResponse(
        addresses=[AddressResponse(**addr) for addr in addresses],
        total=len(addresses)
    )

@admin_address_router.get("/count")
async def get_address_count(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    count = await crud.get_address_count(db, current_user["id"])
    return {"count": count, "user_id": current_user["id"]}

@admin_address_router.get("/stats", response_model=AddressStatsResponse)
async def get_address_stats(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    stats = await crud.get_address_stats(db, current_user["id"])
    return AddressStatsResponse(**stats)

@admin_address_router.get("/summaries", response_model=List[AddressSummaryResponse])
async def get_address_summaries(
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    summaries = await crud.get_address_summaries(db, current_user["id"])
    return [AddressSummaryResponse(**summary) for summary in summaries]

@admin_address_router.post("/search", response_model=AddressSearchResponse)
async def search_addresses(
    request: AddressSearchRequest,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    addresses = await crud.search_addresses(db, current_user["id"], request.search_term)
    return AddressSearchResponse(
        addresses=[AddressResponse(**addr) for addr in addresses],
        total=len(addresses),
        search_term=request.search_term
    )

@admin_address_router.get("/{address_id}", response_model=AddressResponse)
async def get_address(
    address_id: str,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    address_data = await crud.get_address_by_id(db, address_id, current_user["id"])
    if not address_data:
        raise NotFoundException("Address not found")
    return AddressResponse(**address_data)

@buyer_address_router.put("/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: str,
    request: AddressUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    address_data = await crud.update_address(db, address_id, current_user["id"], request)
    return AddressResponse(**address_data)

@admin_address_router.delete("/{address_id}")
async def delete_address(
    address_id: str,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    await crud.delete_address(db, address_id, current_user["id"])
    return SuccessResponse(message="Address deleted successfully")

@buyer_address_router.patch("/{address_id}/set-default", response_model=AddressResponse)
async def set_default_address(
    address_id: str,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    address_data = await crud.set_default_address(db, address_id, current_user["id"])
    return AddressResponse(**address_data)

@buyer_address_router.get("/default/{address_type}", response_model=AddressResponse)
async def get_default_address(
    address_type: AddressTypeEnum,
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    address_data = await crud.get_default_address(db, current_user["id"], address_type)
    if not address_data:
        raise NotFoundException(f"No default {address_type.value} address found")
    return AddressResponse(**address_data)

@buyer_address_router.get("/default/quick", response_model=AddressResponse)
async def get_default_address_quick(
    address_type: AddressTypeEnum = Query(..., description="Address type (shipping/billing)"),
    current_user: Dict[str, Any] = Depends(require_buyer()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    address_data = await crud.get_default_address(db, current_user["id"], address_type)
    if not address_data:
        raise NotFoundException(f"No default {address_type.value} address found")
    return AddressResponse(**address_data)

@admin_address_router.get("/{address_id}/validate")
async def validate_address_ownership(
    address_id: str,
    current_user: Dict[str, Any] = Depends(require_admin()),
    db: AsyncSession = Depends(get_async_session)
):
    crud = AddressCRUD()
    is_owner = await crud.validate_address_ownership(db, address_id, current_user["id"])
    return {"is_owner": is_owner, "address_id": address_id, "user_id": current_user["id"]}