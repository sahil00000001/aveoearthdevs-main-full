from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update, func
from app.core.base import BaseCrud
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger
from app.core.pagination import PaginationParams, PaginatedResponse
from app.features.orders.models.payment import Payment, PaymentMethodStatusEnum
from app.features.orders.models.order import Order, PaymentStatusEnum
from app.features.orders.responses.payment_response import PaymentResponse, PaymentWithOrderResponse, PaymentAnalyticsResponse
from app.database.base import get_supabase_client

logger = get_logger("crud.payment")


class PaymentCrud(BaseCrud[Payment]):
    def __init__(self):
        super().__init__(get_supabase_client(), Payment)

    async def create_payment(self, db: AsyncSession, order_id: str, payment_method: str, payment_gateway: str, amount: float, gateway_transaction_id: Optional[str] = None) -> PaymentResponse:
        try:
            order_query = select(Order).where(Order.id == order_id)
            order_result = await db.execute(order_query)
            order = order_result.scalar_one_or_none()
            
            if not order:
                raise NotFoundException("Order not found")

            if float(order.total_amount) != amount:
                raise ValidationException("Payment amount does not match order total")

            payment_data = {
                "order_id": order_id,
                "payment_method": payment_method,
                "payment_gateway": payment_gateway,
                "gateway_transaction_id": gateway_transaction_id,
                "amount": amount,
                "currency": order.currency,
                "status": PaymentMethodStatusEnum.PENDING
            }

            payment = await self.create(db, payment_data)
            
            logger.info(f"Created payment for order {order.order_number}: {payment.id}")
            return PaymentResponse(**payment.to_dict())
        except Exception as e:
            logger.error(f"Error creating payment: {str(e)}")
            raise

    async def process_payment(self, db: AsyncSession, payment_id: str, gateway_response: Dict[str, Any], success: bool = True) -> PaymentResponse:
        try:
            payment = await self.get_by_id(db, payment_id)
            if not payment:
                raise NotFoundException("Payment not found")

            update_data = {
                "gateway_response": gateway_response,
                "processed_at": datetime.utcnow()
            }

            if success:
                update_data["status"] = PaymentMethodStatusEnum.COMPLETED
                await self._update_order_payment_status(db, str(payment.order_id), PaymentStatusEnum.PAID)
            else:
                update_data["status"] = PaymentMethodStatusEnum.FAILED
                update_data["failure_reason"] = gateway_response.get("error_message", "Payment processing failed")

            updated_payment = await self.update(db, payment_id, update_data)
            
            logger.info(f"Processed payment {payment_id}: {'success' if success else 'failed'}")
            return PaymentResponse(**updated_payment.to_dict())
        except Exception as e:
            logger.error(f"Error processing payment: {str(e)}")
            raise

    async def cancel_payment(self, db: AsyncSession, payment_id: str, reason: str) -> PaymentResponse:
        try:
            payment = await self.get_by_id(db, payment_id)
            if not payment:
                raise NotFoundException("Payment not found")

            if payment.status not in [PaymentMethodStatusEnum.PENDING, PaymentMethodStatusEnum.PROCESSING]:
                raise ValidationException("Payment cannot be cancelled in current status")

            update_data = {
                "status": PaymentMethodStatusEnum.CANCELLED,
                "failure_reason": reason,
                "processed_at": datetime.utcnow()
            }

            updated_payment = await self.update(db, payment_id, update_data)
            await self._update_order_payment_status(db, str(payment.order_id), PaymentStatusEnum.CANCELLED)
            
            logger.info(f"Cancelled payment {payment_id}")
            return PaymentResponse(**updated_payment.to_dict())
        except Exception as e:
            logger.error(f"Error cancelling payment: {str(e)}")
            raise

    async def initiate_refund(self, db: AsyncSession, payment_id: str, refund_amount: float, reason: str) -> PaymentResponse:
        try:
            payment = await self.get_by_id(db, payment_id)
            if not payment:
                raise NotFoundException("Payment not found")

            if payment.status != PaymentMethodStatusEnum.COMPLETED:
                raise ValidationException("Only completed payments can be refunded")

            total_refunded = float(payment.refund_amount) if payment.refund_amount else 0
            if total_refunded + refund_amount > float(payment.amount):
                raise ValidationException("Refund amount exceeds available balance")

            new_refund_amount = total_refunded + refund_amount
            
            if new_refund_amount >= float(payment.amount):
                new_status = PaymentMethodStatusEnum.REFUNDED
                order_payment_status = PaymentStatusEnum.REFUNDED
            else:
                new_status = PaymentMethodStatusEnum.PARTIALLY_REFUNDED if total_refunded > 0 else PaymentMethodStatusEnum.COMPLETED
                order_payment_status = PaymentStatusEnum.PARTIALLY_REFUNDED

            update_data = {
                "refund_amount": new_refund_amount,
                "status": new_status
            }

            updated_payment = await self.update(db, payment_id, update_data)
            await self._update_order_payment_status(db, str(payment.order_id), order_payment_status)
            
            logger.info(f"Initiated refund for payment {payment_id}: {refund_amount}")
            return PaymentResponse(**updated_payment.to_dict())
        except Exception as e:
            logger.error(f"Error initiating refund: {str(e)}")
            raise

    async def get_order_payments(self, db: AsyncSession, order_id: str) -> List[PaymentResponse]:
        try:
            payments_query = select(Payment).where(Payment.order_id == order_id)
            payments_result = await db.execute(payments_query)
            payments = payments_result.scalars().all()
            
            return [PaymentResponse(**payment.to_dict()) for payment in payments]
        except Exception as e:
            logger.error(f"Error getting order payments: {str(e)}")
            raise

    async def get_user_payments(self, db: AsyncSession, user_id: str, pagination: PaginationParams) -> PaginatedResponse[PaymentWithOrderResponse]:
        try:
            query = select(Payment).join(Order).where(Order.user_id == user_id)
            query = query.order_by(Payment.created_at.desc())
            
            count_query = select(func.count()).select_from(Payment).join(Order).where(Order.user_id == user_id)
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            query = query.offset(pagination.offset).limit(pagination.limit)
            payments_result = await db.execute(query)
            payments = payments_result.scalars().all()

            payments_data = []
            for payment in payments:
                payment_dict = payment.to_dict()
                
                order_query = select(Order).where(Order.id == payment.order_id)
                order_result = await db.execute(order_query)
                order = order_result.scalar_one_or_none()
                if order:
                    payment_dict["order"] = {
                        "id": str(order.id),
                        "order_number": order.order_number,
                        "total_amount": float(order.total_amount)
                    }
                
                payments_data.append(PaymentWithOrderResponse(**payment_dict))

            return PaginatedResponse.create(
                items=payments_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting user payments: {str(e)}")
            raise

    async def get_payment_analytics(self, db: AsyncSession, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> PaymentAnalyticsResponse:
        try:
            query = select(Payment)
            
            if start_date:
                query = query.where(Payment.created_at >= start_date)
            if end_date:
                query = query.where(Payment.created_at <= end_date)

            payments_result = await db.execute(query)
            payments = payments_result.scalars().all()

            total_payments = len(payments)
            total_amount = sum(float(payment.amount) for payment in payments)
            total_refunded = sum(float(payment.refund_amount) if payment.refund_amount else 0 for payment in payments)
            
            status_counts = {}
            for status in PaymentMethodStatusEnum:
                status_counts[status.value] = sum(1 for payment in payments if payment.status == status)

            payment_method_counts = {}
            for payment in payments:
                method = payment.payment_method
                payment_method_counts[method] = payment_method_counts.get(method, 0) + 1

            gateway_counts = {}
            for payment in payments:
                gateway = payment.payment_gateway
                gateway_counts[gateway] = gateway_counts.get(gateway, 0) + 1

            successful_payments = [p for p in payments if p.status == PaymentMethodStatusEnum.COMPLETED]
            success_rate = (len(successful_payments) / total_payments * 100) if total_payments > 0 else 0

            analytics_data = {
                "total_payments": total_payments,
                "total_amount": total_amount,
                "total_refunded": total_refunded,
                "net_amount": total_amount - total_refunded,
                "success_rate": success_rate,
                "status_breakdown": status_counts,
                "payment_method_breakdown": payment_method_counts,
                "gateway_breakdown": gateway_counts,
                "period": {
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None
                }
            }
            return PaymentAnalyticsResponse(**analytics_data)
        except Exception as e:
            logger.error(f"Error getting payment analytics: {str(e)}")
            raise

    async def get_failed_payments(self, db: AsyncSession, pagination: PaginationParams) -> PaginatedResponse[PaymentWithOrderResponse]:
        try:
            query = select(Payment).where(Payment.status == PaymentMethodStatusEnum.FAILED)
            query = query.order_by(Payment.created_at.desc())
            
            count_query = select(func.count()).select_from(Payment).where(Payment.status == PaymentMethodStatusEnum.FAILED)
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            query = query.offset(pagination.offset).limit(pagination.limit)
            payments_result = await db.execute(query)
            payments = payments_result.scalars().all()

            payments_data = []
            for payment in payments:
                payment_dict = payment.to_dict()
                
                order_query = select(Order).where(Order.id == payment.order_id)
                order_result = await db.execute(order_query)
                order = order_result.scalar_one_or_none()
                if order:
                    payment_dict["order"] = {
                        "id": str(order.id),
                        "order_number": order.order_number,
                        "user_id": str(order.user_id)
                    }
                
                payments_data.append(PaymentWithOrderResponse(**payment_dict))

            return PaginatedResponse.create(
                items=payments_data,
                total=total,
                page=pagination.page,
                limit=pagination.limit
            )
        except Exception as e:
            logger.error(f"Error getting failed payments: {str(e)}")
            raise

    async def retry_payment(self, db: AsyncSession, payment_id: str, new_gateway_transaction_id: Optional[str] = None) -> PaymentResponse:
        try:
            payment = await self.get_by_id(db, payment_id)
            if not payment:
                raise NotFoundException("Payment not found")

            if payment.status != PaymentMethodStatusEnum.FAILED:
                raise ValidationException("Only failed payments can be retried")

            update_data = {
                "status": PaymentMethodStatusEnum.PENDING,
                "failure_reason": None,
                "processed_at": None
            }
            
            if new_gateway_transaction_id:
                update_data["gateway_transaction_id"] = new_gateway_transaction_id

            updated_payment = await self.update(db, payment_id, update_data)
            await self._update_order_payment_status(db, str(payment.order_id), PaymentStatusEnum.PENDING)
            
            logger.info(f"Retrying payment {payment_id}")
            return PaymentResponse(**updated_payment.to_dict())
        except Exception as e:
            logger.error(f"Error retrying payment: {str(e)}")
            raise

    async def _update_order_payment_status(self, db: AsyncSession, order_id: str, payment_status: PaymentStatusEnum):
        try:
            await db.execute(
                update(Order)
                .where(Order.id == order_id)
                .values(payment_status=payment_status)
            )
            await db.commit()
        except Exception as e:
            logger.error(f"Error updating order payment status: {str(e)}")
            raise
