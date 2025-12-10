from pydantic import BaseModel, Field

class WishlistAddRequest(BaseModel):
    product_id: str = Field(..., min_length=1)

class WishlistFilterRequest(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
