from typing import Generic, TypeVar, List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.core.config import settings

T = TypeVar('T')

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=settings.PAGINATION_LIMIT, ge=1, le=settings.PAGINATION_MAX_LIMIT)
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int
    has_next: bool
    has_prev: bool
    
    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        page: int,
        limit: int
    ) -> "PaginatedResponse[T]":
        pages = (total + limit - 1) // limit
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages,
            has_next=page < pages,
            has_prev=page > 1
        )

class SupabasePagination:
    @staticmethod
    def apply_pagination(
        query: Any,
        pagination: PaginationParams
    ) -> Any:
        return query.range(pagination.offset, pagination.offset + pagination.limit - 1)
    
    @staticmethod
    def get_total_count(table_name: str, supabase_client: Any, filters: Optional[Dict[str, Any]] = None) -> int:
        query = supabase_client.table(table_name).select("*", count="exact")
        
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        
        result = query.execute()
        return result.count or 0
