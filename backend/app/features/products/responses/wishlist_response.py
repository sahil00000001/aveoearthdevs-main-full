from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class WishlistItemResponse(BaseModel):
    user_id: str
    product_id: str
    product: Optional[Dict[str, Any]] = None
    added_at: datetime

class WishlistResponse(BaseModel):
    user_id: str
    product_id: str
    added_at: datetime
