from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.features.orders.models.shipment import ShipmentStatusEnum
from app.core.exceptions import ValidationException


class CreateShipmentRequest(BaseModel):
    order_id: str = Field(..., description="Order ID to create shipment for")
    order_item_ids: List[str] = Field(..., min_items=1, description="List of order item IDs to include")
    tracking_number: str = Field(..., description="Tracking number from carrier")
    carrier: str = Field(..., description="Shipping carrier name")
    carrier_service: Optional[str] = Field(None, description="Carrier service type")
    shipping_cost: float = Field(..., ge=0, description="Shipping cost")
    estimated_delivery_date: Optional[str] = Field(None, description="Estimated delivery date in ISO format")
    weight: Optional[float] = Field(None, gt=0, description="Package weight in kg")
    length: Optional[float] = Field(None, gt=0, description="Package length in cm")
    width: Optional[float] = Field(None, gt=0, description="Package width in cm")
    height: Optional[float] = Field(None, gt=0, description="Package height in cm")

    @field_validator("order_id")
    def validate_order_id(cls, v):
        if not v or not v.strip():
            raise ValidationException("Order ID is required")
        return v.strip()

    @field_validator("order_item_ids")
    def validate_order_item_ids(cls, v):
        if not v:
            raise ValidationException("At least one order item ID is required")
        
        clean_ids = []
        for item_id in v:
            if not item_id or not item_id.strip():
                raise ValidationException("Order item ID cannot be empty")
            clean_ids.append(item_id.strip())
        
        return clean_ids

    @field_validator("tracking_number")
    def validate_tracking_number(cls, v):
        if not v or not v.strip():
            raise ValidationException("Tracking number is required")
        return v.strip()

    @field_validator("carrier")
    def validate_carrier(cls, v):
        if not v or not v.strip():
            raise ValidationException("Carrier is required")
        allowed_carriers = ["dhl", "fedex", "ups", "aramex", "bluedart", "dtdc", "ecom", "ekart", "speedpost"]
        if v.lower() not in allowed_carriers:
            raise ValidationException(f"Carrier must be one of: {', '.join(allowed_carriers)}")
        return v.lower()

    @field_validator("shipping_cost")
    def validate_shipping_cost(cls, v):
        if v < 0:
            raise ValidationException("Shipping cost cannot be negative")
        return round(v, 2)

    @field_validator("estimated_delivery_date")
    def validate_estimated_delivery_date(cls, v):
        if v:
            try:
                estimated_date = datetime.fromisoformat(v.replace('Z', '+00:00'))
                if estimated_date <= datetime.now():
                    raise ValidationException("Estimated delivery date must be in the future")
                return v
            except ValueError:
                raise ValidationException("Invalid estimated delivery date format. Use ISO format.")
        return v


class UpdateShipmentStatusRequest(BaseModel):
    status: ShipmentStatusEnum = Field(..., description="New shipment status")
    delivery_notes: Optional[str] = Field(None, max_length=1000, description="Delivery notes")

    @field_validator("delivery_notes")
    def validate_delivery_notes(cls, v):
        if v and not v.strip():
            raise ValidationException("Delivery notes cannot be empty if provided")
        return v.strip() if v else None


class AddTrackingEventRequest(BaseModel):
    event_type: str = Field(..., description="Type of tracking event")
    description: str = Field(..., description="Event description")
    location: Optional[str] = Field(None, description="Event location")
    event_time: Optional[str] = Field(None, description="Event time in ISO format")

    @field_validator("event_type")
    def validate_event_type(cls, v):
        if not v or not v.strip():
            raise ValidationException("Event type is required")
        allowed_events = ["picked_up", "in_transit", "out_for_delivery", "delivered", "attempted_delivery", "exception", "returned"]
        if v.lower() not in allowed_events:
            raise ValidationException(f"Event type must be one of: {', '.join(allowed_events)}")
        return v.lower()

    @field_validator("description")
    def validate_description(cls, v):
        if not v or not v.strip():
            raise ValidationException("Event description is required")
        return v.strip()

    @field_validator("location")
    def validate_location(cls, v):
        if v and not v.strip():
            raise ValidationException("Location cannot be empty if provided")
        return v.strip() if v else None

    @field_validator("event_time")
    def validate_event_time(cls, v):
        if v:
            try:
                datetime.fromisoformat(v.replace('Z', '+00:00'))
                return v
            except ValueError:
                raise ValidationException("Invalid event time format. Use ISO format.")
        return v


class UpdateEstimatedDeliveryRequest(BaseModel):
    estimated_delivery_date: str = Field(..., description="New estimated delivery date in ISO format")

    @field_validator("estimated_delivery_date")
    def validate_estimated_delivery_date(cls, v):
        try:
            estimated_date = datetime.fromisoformat(v.replace('Z', '+00:00'))
            if estimated_date <= datetime.now():
                raise ValidationException("Estimated delivery date must be in the future")
            return v
        except ValueError:
            raise ValidationException("Invalid estimated delivery date format. Use ISO format.")


class ShipmentAnalyticsRequest(BaseModel):
    supplier_id: Optional[str] = Field(None, description="Filter by supplier ID")
    start_date: Optional[str] = Field(None, description="Start date in ISO format")
    end_date: Optional[str] = Field(None, description="End date in ISO format")
    carrier: Optional[str] = Field(None, description="Filter by carrier")
    status: Optional[ShipmentStatusEnum] = Field(None, description="Filter by status")

    @field_validator("supplier_id")
    def validate_supplier_id(cls, v):
        if v and not v.strip():
            raise ValidationException("Supplier ID cannot be empty if provided")
        return v.strip() if v else None

    @field_validator("carrier")
    def validate_carrier(cls, v):
        if v and not v.strip():
            raise ValidationException("Carrier cannot be empty if provided")
        return v.strip().lower() if v else None


class BulkShipmentUpdateRequest(BaseModel):
    shipment_ids: List[str] = Field(..., min_items=1, description="List of shipment IDs to update")
    status: ShipmentStatusEnum = Field(..., description="New status for all shipments")
    delivery_notes: Optional[str] = Field(None, max_length=1000, description="Delivery notes")

    @field_validator("shipment_ids")
    def validate_shipment_ids(cls, v):
        if not v:
            raise ValidationException("At least one shipment ID is required")
        
        clean_ids = []
        for shipment_id in v:
            if not shipment_id or not shipment_id.strip():
                raise ValidationException("Shipment ID cannot be empty")
            clean_ids.append(shipment_id.strip())
        
        if len(clean_ids) > 50:
            raise ValidationException("Cannot update more than 50 shipments at once")
        
        return clean_ids

    @field_validator("delivery_notes")
    def validate_delivery_notes(cls, v):
        if v and not v.strip():
            raise ValidationException("Delivery notes cannot be empty if provided")
        return v.strip() if v else None
