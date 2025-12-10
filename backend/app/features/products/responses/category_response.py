from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    image_url: Optional[str] = None
    icon_url: Optional[str] = None
    sort_order: int
    is_active: bool
    seo_meta: Dict[str, Any] = {}
    meta_keywords: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class CategoryTreeResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon_url: Optional[str] = None
    sort_order: int
    children: List["CategoryTreeResponse"] = []

class CategoryWithStatsResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    image_url: Optional[str] = None
    icon_url: Optional[str] = None
    sort_order: int
    is_active: bool
    products_count: int
    created_at: datetime
    updated_at: datetime
