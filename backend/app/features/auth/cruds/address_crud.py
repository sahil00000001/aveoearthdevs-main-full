from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, func
from typing import Optional, List, Dict, Any
from geoalchemy2.functions import ST_SetSRID, ST_Point, ST_GeomFromText, ST_AsText
from sqlalchemy import text

from app.features.auth.models.address import Address, AddressTypeEnum
from app.features.auth.requests.address_request import AddressCreateRequest, AddressUpdateRequest
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger
from app.core.pagination import PaginationParams, PaginatedResponse
from app.core.base import BaseCrud

logger = get_logger("crud.address")

class AddressCRUD(BaseCrud[Address]):
    def __init__(self):
        super().__init__(Address)
        self.logger = logger

    async def create_address(self, db: AsyncSession, user_id: str, request: AddressCreateRequest) -> Dict[str, Any]:
        try:
            # Handle location if provided
            location = None
            if request.latitude and request.longitude:
                # Use ST_MakePoint for geometry (not geography)
                from geoalchemy2.functions import ST_MakePoint
                location = ST_SetSRID(ST_MakePoint(request.longitude, request.latitude), 4326)
            
            if request.is_default:
                # First check if type column exists, if not use address_type
                try:
                    await db.execute(
                        update(Address)
                        .where(and_(Address.user_id == user_id, Address.type == request.type))
                        .values(is_default=False)
                    )
                except Exception as update_err:
                    error_str = str(update_err).lower()
                    if "type" in error_str and ("does not exist" in error_str or "transaction" in error_str):
                        # Rollback and try without type filter
                        await db.rollback()
                        logger.warning(f"Column 'type' not found or transaction error, trying to update without type filter: {update_err}")
                        await db.execute(
                            update(Address)
                            .where(Address.user_id == user_id)
                            .values(is_default=False)
                        )
                    else:
                        await db.rollback()
                        raise
            
            address_data = {
                "user_id": user_id,
                "type": request.type.value if hasattr(request.type, 'value') else str(request.type),
                "is_default": request.is_default,
                "label": request.label,
                "first_name": request.first_name,
                "last_name": request.last_name,
                "company": request.company,
                "address_line_1": request.address_line_1,
                "address_line_2": request.address_line_2,
                "city": request.city,
                "state": request.state,
                "postal_code": request.postal_code,
                "country": request.country,
                "phone": request.phone
            }
            # Add location if provided
            if location:
                address_data["location"] = location
            
            address = await self.create(db, address_data)
            self.logger.info(f"Created address for user {user_id}, type: {request.type}")
            return address.to_dict()
        except Exception as e:
            self.logger.error(f"Error creating address for user {user_id}: {str(e)}")
            raise ValidationException(f"Failed to create address: {str(e)}")

    async def get_user_addresses(self, db: AsyncSession, user_id: str, address_type: Optional[AddressTypeEnum] = None) -> List[Dict[str, Any]]:
        try:
            query = select(Address).where(Address.user_id == user_id)
            
            if address_type:
                query = query.where(Address.type == address_type)
            
            query = query.order_by(Address.is_default.desc(), Address.created_at.desc())
            
            result = await db.execute(query)
            addresses = result.scalars().all()
            
            self.logger.info(f"Retrieved {len(addresses)} addresses for user {user_id}")
            return [address.to_dict() for address in addresses]
        except Exception as e:
            self.logger.error(f"Error getting addresses for user {user_id}: {str(e)}")
            raise

    async def get_address_by_id(self, db: AsyncSession, address_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            query = select(Address).where(
                and_(Address.id == address_id, Address.user_id == user_id)
            )
            result = await db.execute(query)
            address = result.scalar_one_or_none()
            
            if not address:
                return None
                
            self.logger.info(f"Retrieved address {address_id} for user {user_id}")
            return address.to_dict()
        except Exception as e:
            self.logger.error(f"Error getting address {address_id} for user {user_id}: {str(e)}")
            raise

    async def get_default_address(self, db: AsyncSession, user_id: str, address_type: AddressTypeEnum) -> Optional[Dict[str, Any]]:
        try:
            query = select(Address).where(
                and_(
                    Address.user_id == user_id,
                    Address.type == address_type,
                    Address.is_default == True
                )
            )
            result = await db.execute(query)
            address = result.scalar_one_or_none()
            
            if not address:
                return None
                
            self.logger.info(f"Retrieved default {address_type} address for user {user_id}")
            return address.to_dict()
        except Exception as e:
            self.logger.error(f"Error getting default {address_type} address for user {user_id}: {str(e)}")
            raise

    async def update_address(self, db: AsyncSession, address_id: str, user_id: str, request: AddressUpdateRequest) -> Dict[str, Any]:
        try:
            address_data = await self.get_address_by_id(db, address_id, user_id)
            if not address_data:
                raise NotFoundException("Address not found")
            
            update_data = request.model_dump(exclude_unset=True)
            location = None
            
            # Handle location if provided
            if 'latitude' in update_data and 'longitude' in update_data:
                if update_data['latitude'] and update_data['longitude']:
                    from geoalchemy2.functions import ST_MakePoint
                    location = ST_SetSRID(ST_MakePoint(update_data['longitude'], update_data['latitude']), 4326)
                update_data.pop('latitude', None)
                update_data.pop('longitude', None)
            
            if location:
                update_data['location'] = location
            
            if update_data.get('is_default'):
                address_type = update_data.get('type', address_data.get('type'))
                await db.execute(
                    update(Address)
                    .where(and_(Address.user_id == user_id, Address.type == address_type))
                    .values(is_default=False)
                )
            
            updated_address = await self.update(db, address_id, update_data)
            self.logger.info(f"Updated address {address_id} for user {user_id}")
            return updated_address.to_dict()
        except NotFoundException:
            raise
        except Exception as e:
            self.logger.error(f"Error updating address {address_id} for user {user_id}: {str(e)}")
            raise ValidationException(f"Failed to update address: {str(e)}")

    async def delete_address(self, db: AsyncSession, address_id: str, user_id: str) -> bool:
        try:
            result = await db.execute(
                delete(Address)
                .where(and_(Address.id == address_id, Address.user_id == user_id))
            )
            await db.commit()
            
            success = result.rowcount > 0
            if success:
                self.logger.info(f"Deleted address {address_id} for user {user_id}")
            else:
                raise NotFoundException("Address not found")
                
            return success
        except NotFoundException:
            raise
        except Exception as e:
            await db.rollback()
            self.logger.error(f"Error deleting address {address_id} for user {user_id}: {str(e)}")
            raise ValidationException(f"Failed to delete address: {str(e)}")

    async def set_default_address(self, db: AsyncSession, address_id: str, user_id: str) -> Dict[str, Any]:
        try:
            address_data = await self.get_address_by_id(db, address_id, user_id)
            if not address_data:
                raise NotFoundException("Address not found")
            
            address_type = address_data.get('type')
            
            await db.execute(
                update(Address)
                .where(and_(Address.user_id == user_id, Address.type == address_type))
                .values(is_default=False)
            )
            
            updated_address = await self.update(db, address_id, {"is_default": True})
            
            self.logger.info(f"Set address {address_id} as default {address_type} for user {user_id}")
            return updated_address.to_dict()
        except NotFoundException:
            raise
        except Exception as e:
            self.logger.error(f"Error setting default address {address_id} for user {user_id}: {str(e)}")
            raise ValidationException(f"Failed to set default address: {str(e)}")

    async def get_paginated_addresses(self, db: AsyncSession, user_id: str, pagination: PaginationParams, address_type: Optional[AddressTypeEnum] = None) -> PaginatedResponse[Dict[str, Any]]:
        try:
            filters = {"user_id": user_id}
            if address_type:
                filters["type"] = address_type
            
            result = await self.list_paginated(db, pagination, filters, "created_at")
            
            items = [item.to_dict() for item in result.items]
            
            return PaginatedResponse.create(
                items=items,
                total=result.total,
                page=result.page,
                limit=result.limit
            )
        except Exception as e:
            self.logger.error(f"Error getting paginated addresses for user {user_id}: {str(e)}")
            raise

    async def get_shipping_addresses(self, db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
        return await self.get_user_addresses(db, user_id, AddressTypeEnum.SHIPPING)

    async def get_billing_addresses(self, db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
        return await self.get_user_addresses(db, user_id, AddressTypeEnum.BILLING)

    async def get_address_count(self, db: AsyncSession, user_id: str) -> int:
        try:
            result = await db.execute(
                select(func.count()).select_from(Address).where(Address.user_id == user_id)
            )
            return result.scalar()
        except Exception as e:
            self.logger.error(f"Error getting address count for user {user_id}: {str(e)}")
            return 0

    async def get_address_stats(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        try:
            result = await db.execute(
                select(Address).where(Address.user_id == user_id)
            )
            addresses = result.scalars().all()
            
            stats = {
                "total_addresses": len(addresses),
                "shipping_addresses": 0,
                "billing_addresses": 0,
                "home_addresses": 0,
                "work_addresses": 0,
                "other_addresses": 0,
                "has_default_shipping": False,
                "has_default_billing": False
            }
            
            for address in addresses:
                if address.type == AddressTypeEnum.SHIPPING:
                    stats["shipping_addresses"] += 1
                    if address.is_default:
                        stats["has_default_shipping"] = True
                elif address.type == AddressTypeEnum.BILLING:
                    stats["billing_addresses"] += 1
                    if address.is_default:
                        stats["has_default_billing"] = True
                elif address.type == AddressTypeEnum.HOME:
                    stats["home_addresses"] += 1
                elif address.type == AddressTypeEnum.WORK:
                    stats["work_addresses"] += 1
                elif address.type == AddressTypeEnum.OTHER:
                    stats["other_addresses"] += 1
            
            return stats
        except Exception as e:
            self.logger.error(f"Error getting address stats for user {user_id}: {str(e)}")
            return {
                "total_addresses": 0,
                "shipping_addresses": 0,
                "billing_addresses": 0,
                "home_addresses": 0,
                "work_addresses": 0,
                "other_addresses": 0,
                "has_default_shipping": False,
                "has_default_billing": False
            }

    async def create_bulk_addresses(self, db: AsyncSession, user_id: str, requests: List[AddressCreateRequest]) -> Dict[str, Any]:
        try:
            created_addresses = []
            errors = []
            
            for i, request in enumerate(requests):
                try:
                    address_data = await self.create_address(db, user_id, request)
                    created_addresses.append(address_data)
                except Exception as e:
                    errors.append(f"Address {i+1}: {str(e)}")
            
            self.logger.info(f"Bulk created {len(created_addresses)} addresses for user {user_id}")
            
            return {
                "created_addresses": created_addresses,
                "total_created": len(created_addresses),
                "errors": errors
            }
        except Exception as e:
            self.logger.error(f"Error bulk creating addresses for user {user_id}: {str(e)}")
            raise ValidationException(f"Failed to create addresses: {str(e)}")

    async def get_address_summaries(self, db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
        try:
            addresses = await self.get_user_addresses(db, user_id)
            summaries = []
            
            for address in addresses:
                full_name_parts = []
                if address.get("first_name"):
                    full_name_parts.append(address["first_name"])
                if address.get("last_name"):
                    full_name_parts.append(address["last_name"])
                full_name = " ".join(full_name_parts)
                
                address_parts = [address["address_line_1"]]
                if address.get("address_line_2"):
                    address_parts.append(address["address_line_2"])
                address_parts.extend([
                    address["city"],
                    address["state"],
                    address["postal_code"],
                    address["country"]
                ])
                formatted_address = ", ".join(address_parts)
                
                summaries.append({
                    "id": address["id"],
                    "type": address["type"],
                    "is_default": address["is_default"],
                    "label": address.get("label"),
                    "formatted_address": formatted_address,
                    "full_name": full_name
                })
            
            return summaries
        except Exception as e:
            self.logger.error(f"Error getting address summaries for user {user_id}: {str(e)}")
            return []

    async def search_addresses(self, db: AsyncSession, user_id: str, search_term: str) -> List[Dict[str, Any]]:
        try:
            search_pattern = f"%{search_term}%"
            query = select(Address).where(
                and_(
                    Address.user_id == user_id,
                    (Address.address_line_1.ilike(search_pattern) |
                     Address.city.ilike(search_pattern) |
                     Address.state.ilike(search_pattern) |
                     Address.postal_code.ilike(search_pattern) |
                     Address.label.ilike(search_pattern))
                )
            ).order_by(Address.is_default.desc(), Address.created_at.desc())
            
            result = await db.execute(query)
            addresses = result.scalars().all()
            
            return [address.to_dict() for address in addresses]
        except Exception as e:
            self.logger.error(f"Error searching addresses for user {user_id}: {str(e)}")
            return []

    async def validate_address_ownership(self, db: AsyncSession, address_id: str, user_id: str) -> bool:
        try:
            result = await db.execute(
                select(func.count()).select_from(Address).where(
                    and_(Address.id == address_id, Address.user_id == user_id)
                )
            )
            return result.scalar() > 0
        except Exception as e:
            self.logger.error(f"Error validating address ownership {address_id} for user {user_id}: {str(e)}")
            return False