from datetime import datetime
from typing import Any, Dict, List, Optional, Type, TypeVar, Generic
from sqlalchemy import Column, DateTime, UUID, func, select, update, delete
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
import uuid
from pydantic import BaseModel
from app.core.logging import get_logger
from app.core.exceptions import NotFoundException, ValidationException
from app.core.pagination import PaginationParams, PaginatedResponse

logger = get_logger("base")

Base = declarative_base()

M = TypeVar('M')

class BaseTimeStamp:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class BaseUUID:
    @declared_attr
    def id(cls):
        return Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

class BaseCrud(Generic[M]):
    def __init__(self, supabase_or_model: Any, model_class: Optional[Type[M]] = None):
        if model_class is None:
            self.client = None
            self.model_class = supabase_or_model
        else:
            self.client = supabase_or_model
            self.model_class = model_class
        self.logger = get_logger(f"crud.{self.model_class.__tablename__}")

    async def get_by_id(self, db: AsyncSession, id: str) -> Optional[M]:
        try:
            from app.core.config import settings
            query = select(self.model_class).where(self.model_class.id == id)
            # Use execution options to avoid prepared statements for pgbouncer compatibility
            if "supabase.co" in (settings.DATABASE_URL or ""):
                # Bind execution options to the statement before execution
                result = await db.execute(query.execution_options(prepared_statement_cache_size=0))
            else:
                result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            self.logger.error(f"Error getting {self.model_class.__tablename__} by id {id}: {str(e)}")
            raise

    async def get_by_field(self, db: AsyncSession, field: str, value: Any) -> Optional[M]:
        try:
            from app.core.config import settings
            query = select(self.model_class).where(getattr(self.model_class, field) == value)
            # Use execution options to avoid prepared statements for pgbouncer compatibility
            if "supabase.co" in (settings.DATABASE_URL or ""):
                result = await db.execute(query.execution_options(prepared_statement_cache_size=0))
            else:
                result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            self.logger.error(f"Error getting {self.model_class.__tablename__} by {field}={value}: {str(e)}")
            raise

    async def create(self, db: AsyncSession, data: Dict[str, Any], commit: bool = True) -> M:
        try:
            from app.core.config import settings
            if "id" not in data or data["id"] is None:
                data["id"] = uuid4()  # UUID object, not string
            elif isinstance(data.get("id"), str):
                # Convert string UUID to UUID object if needed
                try:
                    data["id"] = uuid.UUID(data["id"])
                except (ValueError, TypeError):
                    pass  # Keep as string if conversion fails
            
            # CRITICAL: Handle user_type enum conversion for User model
            # SQLAlchemy Enum with native_enum=False stores the VALUE as a string
            # We MUST pass the string VALUE directly, NOT the enum object
            # SQLAlchemy will convert it to enum internally, but we need to ensure lowercase string
            if "user_type" in data:
                # Import UserTypeEnum if creating User model
                if self.model_class.__name__ == "User":
                    from app.features.auth.models.user import UserTypeEnum
                    # CRITICAL: Always pass the string VALUE, not the enum object
                    if isinstance(data["user_type"], str):
                        # Already a string - ensure lowercase
                        data["user_type"] = data["user_type"].lower()
                    elif isinstance(data["user_type"], UserTypeEnum):
                        # It's an enum object - extract the .value (string)
                        data["user_type"] = data["user_type"].value
                    else:
                        # Unknown type - default to "buyer" string
                        data["user_type"] = "buyer"
                    
                    # Validate it's one of the allowed lowercase values
                    valid_types = ["buyer", "supplier", "admin"]
                    if data["user_type"] not in valid_types:
                        data["user_type"] = "buyer"  # Default fallback
                    
                    # Log the value being passed (for debugging)
                    self.logger.info(f"User user_type being set to: '{data['user_type']}' (type: {type(data['user_type']).__name__})")
            
            data["created_at"] = datetime.utcnow()
            data["updated_at"] = datetime.utcnow()
            
            db_obj = self.model_class(**data)
            db.add(db_obj)
            
            if commit:
                # Use flush first to catch any errors before commit
                try:
                    await db.flush()
                    await db.commit()
                    # Refresh the object - use execution options if needed
                    if "supabase.co" in (settings.DATABASE_URL or ""):
                        # For pgbouncer, we may need to re-query instead of refresh
                        # Try refresh first, but catch errors
                        try:
                            await db.refresh(db_obj)
                        except Exception as refresh_err:
                            # If refresh fails, re-query the object
                            self.logger.warning(f"Refresh failed, re-querying object: {refresh_err}")
                            try:
                                select_query = select(self.model_class).where(self.model_class.id == db_obj.id)
                                result = await db.execute(select_query.execution_options(prepared_statement_cache_size=0))
                                refreshed_obj = result.scalar_one_or_none()
                                if refreshed_obj:
                                    db_obj = refreshed_obj
                            except Exception:
                                # If re-query also fails, continue with the object we have
                                pass
                    else:
                        await db.refresh(db_obj)
                except Exception as commit_err:
                    await db.rollback()
                    raise
            else:
                await db.flush()
            
            self.logger.info(f"Created {self.model_class.__tablename__} with id: {db_obj.id}")
            return db_obj
        except Exception as e:
            if commit:
                await db.rollback()
            self.logger.error(f"Error creating {self.model_class.__tablename__}: {str(e)}")
            raise

    async def update(self, db: AsyncSession, id: str, data: Dict[str, Any], commit: bool = True) -> M:
        try:
            data["updated_at"] = datetime.utcnow()
            
            result = await db.execute(
                update(self.model_class)
                .where(self.model_class.id == id)
                .values(**data)
                .returning(self.model_class)
            )
            db_obj = result.scalar_one_or_none()
            
            if not db_obj:
                raise NotFoundException(f"{self.model_class.__tablename__.title()} not found")
            
            if commit:
                await db.commit()
                await db.refresh(db_obj)
            else:
                await db.flush()
            
            self.logger.info(f"Updated {self.model_class.__tablename__} with id: {id}")
            return db_obj
        except Exception as e:
            if commit:
                await db.rollback()
            self.logger.error(f"Error updating {self.model_class.__tablename__} {id}: {str(e)}")
            raise

    async def delete(self, db: AsyncSession, id: str) -> bool:
        try:
            from app.core.config import settings
            query = delete(self.model_class).where(self.model_class.id == id)
            
            # Use execution options to avoid prepared statements for pgbouncer compatibility
            if "supabase.co" in (settings.DATABASE_URL or ""):
                result = await db.execute(query.execution_options(prepared_statement_cache_size=0))
            else:
                result = await db.execute(query)
            
            if result.rowcount == 0:
                raise NotFoundException(f"{self.model_class.__tablename__.title()} not found")
            
            await db.commit()
            self.logger.info(f"Deleted {self.model_class.__tablename__} with id: {id}")
            return True
        except Exception as e:
            await db.rollback()
            self.logger.error(f"Error deleting {self.model_class.__tablename__} {id}: {str(e)}")
            raise
    
    async def list_paginated(
        self,
        db: AsyncSession,
        pagination: PaginationParams,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None
    ) -> PaginatedResponse[M]:
        try:
            query = select(self.model_class)
            
            if filters:
                for key, value in filters.items():
                    if hasattr(self.model_class, key):
                        query = query.where(getattr(self.model_class, key) == value)
            
            if order_by and hasattr(self.model_class, order_by):
                query = query.order_by(getattr(self.model_class, order_by).desc())
            elif hasattr(self.model_class, 'created_at'):
                query = query.order_by(self.model_class.created_at.desc())
            
            count_query = select(func.count()).select_from(self.model_class)
            if filters:
                for key, value in filters.items():
                    if hasattr(self.model_class, key):
                        count_query = count_query.where(getattr(self.model_class, key) == value)
            
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            # Get paginated results
            paginated_query = query.offset(pagination.offset).limit(pagination.limit)
            result = await db.execute(paginated_query)
            items = result.scalars().all()
            
            return PaginatedResponse.create(
                items=list(items),
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            self.logger.error(f"Error listing {self.model_class.__tablename__}: {str(e)}")
            raise

class SuccessResponse(BaseModel):
    message: str
    success: bool = True
