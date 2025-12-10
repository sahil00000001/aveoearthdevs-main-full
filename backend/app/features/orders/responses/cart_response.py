from typing import Optional
from pydantic import BaseModel


class CartItemResponse(BaseModel):
    id: str
    cart_id: str
    product_id: str
    variant_id: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float
    product_name: Optional[str] = None
    product_slug: Optional[str] = None
    variant_title: Optional[str] = None
    sku: Optional[str] = None
    created_at: str
    updated_at: str


class CartResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    currency: str
    subtotal: float
    tax_amount: float
    shipping_amount: float
    discount_amount: float
    total_amount: float
    items_count: int
    expires_at: Optional[str] = None
    created_at: str
    updated_at: str


class CartWithItemsResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    currency: str
    subtotal: float
    tax_amount: float
    shipping_amount: float
    discount_amount: float
    total_amount: float
    items_count: int
    expires_at: Optional[str] = None
    items: list[CartItemResponse] = []
    created_at: str
    updated_at: str