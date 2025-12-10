from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.features.orders.models.shipment import ShipmentStatusEnum


class ShipmentItemResponse(BaseModel):
    id: str
    shipment_id: str
    order_item_id: str
    product_id: str
    variant_id: Optional[str] = None
    quantity: int
    created_at: datetime
    updated_at: datetime


class ShipmentResponse(BaseModel):
    id: str
    order_id: str
    supplier_id: str
    tracking_number: str
    carrier: str
    carrier_service: Optional[str] = None
    status: ShipmentStatusEnum
    weight: Optional[float] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    shipping_cost: float
    estimated_delivery_date: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    shipping_address: Dict[str, Any]
    tracking_events: List[Dict[str, Any]] = []
    delivery_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ShipmentWithItemsResponse(BaseModel):
    id: str
    order_id: str
    supplier_id: str
    tracking_number: str
    carrier: str
    carrier_service: Optional[str] = None
    status: ShipmentStatusEnum
    weight: Optional[float] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    shipping_cost: float
    estimated_delivery_date: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    shipping_address: Dict[str, Any]
    tracking_events: List[Dict[str, Any]] = []
    delivery_notes: Optional[str] = None
    items: List[ShipmentItemResponse] = []
    created_at: datetime
    updated_at: datetime


class ShipmentSummaryResponse(BaseModel):
    id: str
    tracking_number: str
    carrier: str
    status: ShipmentStatusEnum
    shipping_cost: float
    estimated_delivery_date: Optional[datetime] = None
    created_at: datetime


class TrackingResponse(BaseModel):
    tracking_number: str
    carrier: str
    status: ShipmentStatusEnum
    estimated_delivery_date: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    tracking_events: List[Dict[str, Any]] = []
    delivery_notes: Optional[str] = None


class ShipmentAnalyticsResponse(BaseModel):
    total_shipments: int
    total_shipping_cost: float
    average_delivery_time_hours: Optional[float] = None
    status_breakdown: Dict[str, int]
    carrier_breakdown: Dict[str, int]
    period: Dict[str, Optional[str]]


class BulkShipmentUpdateResponse(BaseModel):
    message: str
    updated_count: int
    failed_count: int
    failed_shipments: List[Dict[str, str]] = []
