from typing import Optional, List, Dict, Any
from datetime import datetime
import secrets
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update, func, or_
from app.core.base import BaseCrud
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger
from app.core.pagination import PaginationParams, PaginatedResponse
from app.features.orders.models.return_refund import Return, Refund, ReturnReasonEnum, ReturnStatusEnum, RefundStatusEnum
from app.features.orders.models.order import Order, OrderItem
from app.features.orders.models.payment import Payment
from app.features.orders.responses.return_response import ReturnResponse, ReturnWithOrderItemResponse, RefundResponse, RefundAnalyticsResponse
from app.database.base import get_supabase_client

logger = get_logger("crud.return_refund")


class ReturnCrud(BaseCrud[Return]):
    def __init__(self):
        super().__init__(get_supabase_client(), Return)

    def _generate_return_number(self) -> str:
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        return f"RT{timestamp}{random_part}"

    async def create_return_request(self, db: AsyncSession, user_id: str, order_item_id: str, reason: ReturnReasonEnum, description: str, quantity: int, images: Optional[List[str]] = None) -> ReturnResponse:
        try:
            order_item_query = select(OrderItem).join(Order).where(and_(OrderItem.id == order_item_id, Order.user_id == user_id))
            order_item_result = await db.execute(order_item_query)
            order_item = order_item_result.scalar_one_or_none()
            
            if not order_item:
                raise NotFoundException("Order item not found")

            if quantity > order_item.quantity:
                raise ValidationException("Return quantity cannot exceed ordered quantity")

            existing_returns_query = select(func.sum(Return.quantity)).where(and_(Return.order_item_id == order_item_id, Return.status.in_([ReturnStatusEnum.REQUESTED, ReturnStatusEnum.APPROVED, ReturnStatusEnum.COMPLETED])))
            existing_returns_result = await db.execute(existing_returns_query)
            existing_return_quantity = existing_returns_result.scalar() or 0

            if existing_return_quantity + quantity > order_item.quantity:
                raise ValidationException("Total return quantity cannot exceed ordered quantity")

            return_data = {
                "order_id": order_item.order_id,
                "order_item_id": order_item_id,
                "user_id": user_id,
                "supplier_id": order_item.supplier_id,
                "return_number": self._generate_return_number(),
                "reason": reason,
                "description": description,
                "quantity": quantity,
                "images": images or [],
                "requested_at": datetime.utcnow(),
                "status": ReturnStatusEnum.REQUESTED
            }

            return_request = await self.create(db, return_data)
            
            logger.info(f"Created return request {return_request.return_number}")
            return ReturnResponse(**return_request.to_dict())
        except Exception as e:
            logger.error(f"Error creating return request: {str(e)}")
            raise

    async def approve_return(self, db: AsyncSession, return_id: str, admin_notes: Optional[str] = None) -> ReturnResponse:
        try:
            return_request = await self.get_by_id(db, return_id)
            if not return_request:
                raise NotFoundException("Return request not found")

            if return_request.status != ReturnStatusEnum.REQUESTED:
                raise ValidationException("Only requested returns can be approved")

            update_data = {
                "status": ReturnStatusEnum.APPROVED,
                "approved_at": datetime.utcnow()
            }
            
            if admin_notes:
                update_data["admin_notes"] = admin_notes

            updated_return = await self.update(db, return_id, update_data)
            
            logger.info(f"Approved return request {return_request.return_number}")
            return ReturnResponse(**updated_return.to_dict())
        except Exception as e:
            logger.error(f"Error approving return: {str(e)}")
            raise

    async def reject_return(self, db: AsyncSession, return_id: str, rejection_reason: str) -> ReturnResponse:
        try:
            return_request = await self.get_by_id(db, return_id)
            if not return_request:
                raise NotFoundException("Return request not found")

            if return_request.status != ReturnStatusEnum.REQUESTED:
                raise ValidationException("Only requested returns can be rejected")

            update_data = {
                "status": ReturnStatusEnum.REJECTED,
                "rejected_at": datetime.utcnow(),
                "rejection_reason": rejection_reason
            }

            updated_return = await self.update(db, return_id, update_data)
            
            logger.info(f"Rejected return request {return_request.return_number}")
            return ReturnResponse(**updated_return.to_dict())
        except Exception as e:
            logger.error(f"Error rejecting return: {str(e)}")
            raise

    async def update_return_shipping(self, db: AsyncSession, return_id: str, tracking_number: str) -> ReturnResponse:
        try:
            return_request = await self.get_by_id(db, return_id)
            if not return_request:
                raise NotFoundException("Return request not found")

            if return_request.status != ReturnStatusEnum.APPROVED:
                raise ValidationException("Only approved returns can be shipped")

            update_data = {
                "status": ReturnStatusEnum.ITEM_SHIPPED,
                "return_tracking_number": tracking_number,
                "item_shipped_at": datetime.utcnow()
            }

            updated_return = await self.update(db, return_id, update_data)
            
            logger.info(f"Updated return shipping for {return_request.return_number}")
            return ReturnResponse(**updated_return.to_dict())
        except Exception as e:
            logger.error(f"Error updating return shipping: {str(e)}")
            raise

    async def mark_return_received(self, db: AsyncSession, return_id: str, admin_notes: Optional[str] = None) -> Dict[str, Any]:
        try:
            return_request = await self.get_by_id(db, return_id)
            if not return_request:
                raise NotFoundException("Return request not found")

            if return_request.status != ReturnStatusEnum.ITEM_SHIPPED:
                raise ValidationException("Only shipped returns can be marked as received")

            update_data = {
                "status": ReturnStatusEnum.ITEM_RECEIVED,
                "item_received_at": datetime.utcnow()
            }
            
            if admin_notes:
                update_data["admin_notes"] = admin_notes

            updated_return = await self.update(db, return_id, update_data)
            
            logger.info(f"Marked return as received {return_request.return_number}")
            return updated_return.to_dict()
        except Exception as e:
            logger.error(f"Error marking return as received: {str(e)}")
            raise

    async def complete_return(self, db: AsyncSession, return_id: str, admin_notes: Optional[str] = None) -> Dict[str, Any]:
        try:
            return_request = await self.get_by_id(db, return_id)
            if not return_request:
                raise NotFoundException("Return request not found")

            if return_request.status not in [ReturnStatusEnum.ITEM_RECEIVED, ReturnStatusEnum.INSPECTING]:
                raise ValidationException("Only received or inspecting returns can be completed")

            update_data = {
                "status": ReturnStatusEnum.COMPLETED,
                "completed_at": datetime.utcnow()
            }
            
            if admin_notes:
                update_data["admin_notes"] = admin_notes

            updated_return = await self.update(db, return_id, update_data)
            
            logger.info(f"Completed return {return_request.return_number}")
            return updated_return.to_dict()
        except Exception as e:
            logger.error(f"Error completing return: {str(e)}")
            raise

    async def get_user_returns(self, db: AsyncSession, user_id: str, pagination: PaginationParams) -> PaginatedResponse[Dict[str, Any]]:
        try:
            query = select(Return).where(Return.user_id == user_id)
            query = query.order_by(Return.created_at.desc())
            
            count_query = select(func.count()).select_from(Return).where(Return.user_id == user_id)
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            query = query.offset(pagination.offset).limit(pagination.limit)
            returns_result = await db.execute(query)
            returns = returns_result.scalars().all()

            returns_data = []
            for return_request in returns:
                return_dict = return_request.to_dict()
                
                order_item_query = select(OrderItem).where(OrderItem.id == return_request.order_item_id)
                order_item_result = await db.execute(order_item_query)
                order_item = order_item_result.scalar_one_or_none()
                if order_item:
                    return_dict["order_item"] = order_item.to_dict()
                
                returns_data.append(ReturnWithOrderItemResponse(**return_dict))

            return PaginatedResponse.create(
                items=returns_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting user returns: {str(e)}")
            raise

    async def get_supplier_returns(self, db: AsyncSession, supplier_id: str, pagination: PaginationParams, status: Optional[ReturnStatusEnum] = None) -> PaginatedResponse[ReturnWithOrderItemResponse]:
        try:
            query = select(Return).where(Return.supplier_id == supplier_id)
            
            if status:
                query = query.where(Return.status == status)
            
            query = query.order_by(Return.created_at.desc())
            
            count_query = select(func.count()).select_from(Return).where(Return.supplier_id == supplier_id)
            if status:
                count_query = count_query.where(Return.status == status)
            
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            query = query.offset(pagination.offset).limit(pagination.limit)
            returns_result = await db.execute(query)
            returns = returns_result.scalars().all()

            returns_data = []
            for return_request in returns:
                return_dict = return_request.to_dict()
                
                order_item_query = select(OrderItem).where(OrderItem.id == return_request.order_item_id)
                order_item_result = await db.execute(order_item_query)
                order_item = order_item_result.scalar_one_or_none()
                if order_item:
                    return_dict["order_item"] = order_item.to_dict()
                
                returns_data.append(ReturnWithOrderItemResponse(**return_dict))

            return PaginatedResponse.create(
                items=returns_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting supplier returns: {str(e)}")
            raise


class RefundCrud(BaseCrud[Refund]):
    def __init__(self):
        super().__init__(get_supabase_client(), Refund)

    def _generate_refund_number(self) -> str:
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        return f"RF{timestamp}{random_part}"

    async def create_refund(self, db: AsyncSession, return_id: str, payment_id: str, amount: float, admin_notes: Optional[str] = None) -> RefundResponse:
        try:
            return_query = select(Return).where(Return.id == return_id)
            return_result = await db.execute(return_query)
            return_request = return_result.scalar_one_or_none()
            
            if not return_request:
                raise NotFoundException("Return request not found")

            if return_request.status != ReturnStatusEnum.COMPLETED:
                raise ValidationException("Only completed returns can be refunded")

            payment_query = select(Payment).where(Payment.id == payment_id)
            payment_result = await db.execute(payment_query)
            payment = payment_result.scalar_one_or_none()
            
            if not payment:
                raise NotFoundException("Payment not found")

            if str(payment.order_id) != str(return_request.order_id):
                raise ValidationException("Payment does not belong to the return order")

            refund_data = {
                "return_id": return_id,
                "order_id": return_request.order_id,
                "payment_id": payment_id,
                "refund_number": self._generate_refund_number(),
                "amount": amount,
                "currency": payment.currency,
                "status": RefundStatusEnum.PENDING,
                "admin_notes": admin_notes
            }

            refund = await self.create(db, refund_data)
            
            logger.info(f"Created refund {refund.refund_number} for return {return_request.return_number}")
            return RefundResponse(**refund.to_dict())
        except Exception as e:
            logger.error(f"Error creating refund: {str(e)}")
            raise

    async def process_refund(self, db: AsyncSession, refund_id: str, gateway_refund_id: str, gateway_response: Dict[str, Any], success: bool = True) -> RefundResponse:
        try:
            refund = await self.get_by_id(db, refund_id)
            if not refund:
                raise NotFoundException("Refund not found")

            update_data = {
                "gateway_refund_id": gateway_refund_id,
                "gateway_response": gateway_response,
                "processed_at": datetime.utcnow()
            }

            if success:
                update_data["status"] = RefundStatusEnum.COMPLETED
            else:
                update_data["status"] = RefundStatusEnum.FAILED
                update_data["failure_reason"] = gateway_response.get("error_message", "Refund processing failed")

            updated_refund = await self.update(db, refund_id, update_data)
            
            logger.info(f"Processed refund {refund.refund_number}: {'success' if success else 'failed'}")
            return RefundResponse(**updated_refund.to_dict())
        except Exception as e:
            logger.error(f"Error processing refund: {str(e)}")
            raise

    async def cancel_refund(self, db: AsyncSession, refund_id: str, reason: str) -> RefundResponse:
        try:
            refund = await self.get_by_id(db, refund_id)
            if not refund:
                raise NotFoundException("Refund not found")

            if refund.status not in [RefundStatusEnum.PENDING, RefundStatusEnum.PROCESSING]:
                raise ValidationException("Only pending or processing refunds can be cancelled")

            update_data = {
                "status": RefundStatusEnum.CANCELLED,
                "failure_reason": reason,
                "processed_at": datetime.utcnow()
            }

            updated_refund = await self.update(db, refund_id, update_data)
            
            logger.info(f"Cancelled refund {refund.refund_number}")
            return RefundResponse(**updated_refund.to_dict())
        except Exception as e:
            logger.error(f"Error cancelling refund: {str(e)}")
            raise

    async def get_return_refunds(self, db: AsyncSession, return_id: str) -> List[RefundResponse]:
        try:
            refunds_query = select(Refund).where(Refund.return_id == return_id)
            refunds_result = await db.execute(refunds_query)
            refunds = refunds_result.scalars().all()
            
            return [RefundResponse(**refund.to_dict()) for refund in refunds]
        except Exception as e:
            logger.error(f"Error getting return refunds: {str(e)}")
            raise

    async def get_refund_analytics(self, db: AsyncSession, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> RefundAnalyticsResponse:
        try:
            query = select(Refund)
            
            if start_date:
                query = query.where(Refund.created_at >= start_date)
            if end_date:
                query = query.where(Refund.created_at <= end_date)

            refunds_result = await db.execute(query)
            refunds = refunds_result.scalars().all()

            total_refunds = len(refunds)
            total_amount = sum(float(refund.amount) for refund in refunds)
            
            status_counts = {}
            for status in RefundStatusEnum:
                status_counts[status.value] = sum(1 for refund in refunds if refund.status == status)

            completed_refunds = [r for r in refunds if r.status == RefundStatusEnum.COMPLETED]
            success_rate = (len(completed_refunds) / total_refunds * 100) if total_refunds > 0 else 0

            analytics_data = {
                "total_refunds": total_refunds,
                "total_amount": total_amount,
                "success_rate": success_rate,
                "status_breakdown": status_counts,
                "period": {
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None
                }
            }
            return RefundAnalyticsResponse(**analytics_data)
        except Exception as e:
            logger.error(f"Error getting refund analytics: {str(e)}")
            raise
