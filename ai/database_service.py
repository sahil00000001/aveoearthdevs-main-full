"""
Database service for personalization and recommendation system
"""

import asyncio
from sqlalchemy import create_engine, select, update, delete
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
from database_models import (
    Base, UserProfile, UserInteraction, PerformanceHistory, 
    Recommendation, BundleRecommendation, ConversationHistory, MarketTrends
)

logger = logging.getLogger("database_service")

class DatabaseService:
    def __init__(self, database_url: str = "sqlite+aiosqlite:///./personalization.db"):
        self.database_url = database_url
        self.engine = create_async_engine(database_url, echo=False)
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )
    
    async def init_db(self):
        """Initialize database tables"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully")
    
    async def get_session(self):
        """Get database session"""
        async with self.async_session() as session:
            yield session
    
    # User Profile Operations
    async def get_user_profile(self, vendor_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile by vendor ID"""
        async with self.async_session() as session:
            result = await session.execute(
                select(UserProfile).where(UserProfile.vendor_id == vendor_id)
            )
            profile = result.scalar_one_or_none()
            if profile:
                return {
                    "vendor_id": profile.vendor_id,
                    "segment": profile.segment,
                    "preferences": profile.preferences or {},
                    "behavior_patterns": profile.behavior_patterns or {},
                    "learning_rate": profile.learning_rate,
                    "confidence_score": profile.confidence_score,
                    "created_at": profile.created_at,
                    "updated_at": profile.updated_at
                }
            return None
    
    async def create_user_profile(self, vendor_id: str, segment: str = "new_vendor") -> Dict[str, Any]:
        """Create new user profile"""
        async with self.async_session() as session:
            profile = UserProfile(
                vendor_id=vendor_id,
                segment=segment,
                preferences={},
                behavior_patterns={},
                learning_rate=0.1,
                confidence_score=0.0
            )
            session.add(profile)
            await session.commit()
            await session.refresh(profile)
            return {
                "vendor_id": profile.vendor_id,
                "segment": profile.segment,
                "preferences": profile.preferences,
                "behavior_patterns": profile.behavior_patterns,
                "learning_rate": profile.learning_rate,
                "confidence_score": profile.confidence_score,
                "created_at": profile.created_at,
                "updated_at": profile.updated_at
            }
    
    async def update_user_profile(self, vendor_id: str, updates: Dict[str, Any]) -> bool:
        """Update user profile"""
        async with self.async_session() as session:
            result = await session.execute(
                update(UserProfile)
                .where(UserProfile.vendor_id == vendor_id)
                .values(**updates, updated_at=datetime.utcnow())
            )
            await session.commit()
            return result.rowcount > 0
    
    # Interaction Tracking
    async def log_interaction(self, vendor_id: str, interaction_type: str, 
                            interaction_data: Dict[str, Any], session_id: str = None) -> bool:
        """Log user interaction"""
        async with self.async_session() as session:
            interaction = UserInteraction(
                vendor_id=vendor_id,
                interaction_type=interaction_type,
                interaction_data=interaction_data,
                session_id=session_id
            )
            session.add(interaction)
            await session.commit()
            return True
    
    async def get_user_interactions(self, vendor_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get user interactions"""
        async with self.async_session() as session:
            result = await session.execute(
                select(UserInteraction)
                .where(UserInteraction.vendor_id == vendor_id)
                .order_by(UserInteraction.timestamp.desc())
                .limit(limit)
            )
            interactions = result.scalars().all()
            return [
                {
                    "id": i.id,
                    "interaction_type": i.interaction_type,
                    "interaction_data": i.interaction_data,
                    "timestamp": i.timestamp,
                    "session_id": i.session_id
                }
                for i in interactions
            ]
    
    # Performance History
    async def log_performance(self, vendor_id: str, performance_data: Dict[str, Any]) -> bool:
        """Log performance metrics"""
        async with self.async_session() as session:
            performance = PerformanceHistory(
                vendor_id=vendor_id,
                revenue=performance_data.get("revenue", 0.0),
                orders=performance_data.get("orders", 0),
                products=performance_data.get("products", 0),
                active_products=performance_data.get("active_products", 0),
                avg_order_value=performance_data.get("avg_order_value", 0.0),
                low_stock_count=performance_data.get("low_stock_count", 0),
                pending_orders=performance_data.get("pending_orders", 0)
            )
            session.add(performance)
            await session.commit()
            return True
    
    async def get_performance_history(self, vendor_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get performance history"""
        async with self.async_session() as session:
            since_date = datetime.utcnow() - timedelta(days=days)
            result = await session.execute(
                select(PerformanceHistory)
                .where(
                    PerformanceHistory.vendor_id == vendor_id,
                    PerformanceHistory.timestamp >= since_date
                )
                .order_by(PerformanceHistory.timestamp.desc())
            )
            history = result.scalars().all()
            return [
                {
                    "id": h.id,
                    "revenue": h.revenue,
                    "orders": h.orders,
                    "products": h.products,
                    "active_products": h.active_products,
                    "avg_order_value": h.avg_order_value,
                    "low_stock_count": h.low_stock_count,
                    "pending_orders": h.pending_orders,
                    "timestamp": h.timestamp
                }
                for h in history
            ]
    
    # Recommendations
    async def save_recommendation(self, vendor_id: str, recommendation_data: Dict[str, Any]) -> bool:
        """Save recommendation"""
        async with self.async_session() as session:
            recommendation = Recommendation(
                vendor_id=vendor_id,
                recommendation_id=recommendation_data["id"],
                type=recommendation_data["type"],
                title=recommendation_data["title"],
                description=recommendation_data["description"],
                priority=recommendation_data["priority"],
                impact_score=recommendation_data["impact_score"],
                confidence=recommendation_data["confidence"],
                expected_profit=recommendation_data.get("expected_profit", 0.0),
                implementation_time=recommendation_data["implementation_time"],
                success_probability=recommendation_data["success_probability"],
                personalized_reason=recommendation_data["personalized_reason"],
                action_items=recommendation_data.get("action_items", [])
            )
            session.add(recommendation)
            await session.commit()
            return True
    
    async def get_recommendations(self, vendor_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recommendations for vendor"""
        async with self.async_session() as session:
            result = await session.execute(
                select(Recommendation)
                .where(Recommendation.vendor_id == vendor_id)
                .order_by(Recommendation.created_at.desc())
                .limit(limit)
            )
            recommendations = result.scalars().all()
            return [
                {
                    "id": r.recommendation_id,
                    "type": r.type,
                    "title": r.title,
                    "description": r.description,
                    "priority": r.priority,
                    "impact_score": r.impact_score,
                    "confidence": r.confidence,
                    "expected_profit": r.expected_profit,
                    "implementation_time": r.implementation_time,
                    "success_probability": r.success_probability,
                    "personalized_reason": r.personalized_reason,
                    "action_items": r.action_items,
                    "status": r.status,
                    "created_at": r.created_at
                }
                for r in recommendations
            ]
    
    # Bundle Recommendations
    async def save_bundle_recommendation(self, vendor_id: str, bundle_data: Dict[str, Any]) -> bool:
        """Save bundle recommendation"""
        async with self.async_session() as session:
            bundle = BundleRecommendation(
                vendor_id=vendor_id,
                bundle_id=bundle_data["id"],
                bundle_name=bundle_data["bundle_name"],
                products=bundle_data["products"],
                expected_revenue=bundle_data["expected_revenue"],
                profit_margin=bundle_data["profit_margin"],
                demand_forecast=bundle_data["demand_forecast"],
                sustainability_score=bundle_data["sustainability_score"],
                market_trend=bundle_data["market_trend"],
                confidence=bundle_data["confidence"],
                personalized_factors=bundle_data.get("personalized_factors", [])
            )
            session.add(bundle)
            await session.commit()
            return True
    
    async def get_bundle_recommendations(self, vendor_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get bundle recommendations for vendor"""
        async with self.async_session() as session:
            result = await session.execute(
                select(BundleRecommendation)
                .where(BundleRecommendation.vendor_id == vendor_id)
                .order_by(BundleRecommendation.created_at.desc())
                .limit(limit)
            )
            bundles = result.scalars().all()
            return [
                {
                    "id": b.bundle_id,
                    "bundle_name": b.bundle_name,
                    "products": b.products,
                    "expected_revenue": b.expected_revenue,
                    "profit_margin": b.profit_margin,
                    "demand_forecast": b.demand_forecast,
                    "sustainability_score": b.sustainability_score,
                    "market_trend": b.market_trend,
                    "confidence": b.confidence,
                    "personalized_factors": b.personalized_factors,
                    "status": b.status,
                    "created_at": b.created_at
                }
                for b in bundles
            ]
    
    # Conversation History
    async def save_conversation(self, session_id: str, vendor_id: str, role: str, 
                              message: str, function_calls: List[Dict] = None) -> bool:
        """Save conversation message"""
        async with self.async_session() as session:
            conversation = ConversationHistory(
                session_id=session_id,
                vendor_id=vendor_id,
                role=role,
                message=message,
                function_calls=function_calls or []
            )
            session.add(conversation)
            await session.commit()
            return True
    
    async def get_conversation_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get conversation history"""
        async with self.async_session() as session:
            result = await session.execute(
                select(ConversationHistory)
                .where(ConversationHistory.session_id == session_id)
                .order_by(ConversationHistory.timestamp.desc())
                .limit(limit)
            )
            conversations = result.scalars().all()
            return [
                {
                    "id": c.id,
                    "role": c.role,
                    "message": c.message,
                    "function_calls": c.function_calls,
                    "timestamp": c.timestamp
                }
                for c in conversations
            ]
    
    # Analytics and Reporting
    async def get_user_analytics(self, vendor_id: str) -> Dict[str, Any]:
        """Get comprehensive user analytics"""
        async with self.async_session() as session:
            # Get profile
            profile_result = await session.execute(
                select(UserProfile).where(UserProfile.vendor_id == vendor_id)
            )
            profile = profile_result.scalar_one_or_none()
            
            if not profile:
                return {"error": "User profile not found"}
            
            # Get recent performance
            performance_result = await session.execute(
                select(PerformanceHistory)
                .where(PerformanceHistory.vendor_id == vendor_id)
                .order_by(PerformanceHistory.timestamp.desc())
                .limit(30)
            )
            performance_history = performance_result.scalars().all()
            
            # Get interaction count
            interaction_result = await session.execute(
                select(UserInteraction).where(UserInteraction.vendor_id == vendor_id)
            )
            interactions = interaction_result.scalars().all()
            
            # Get recommendation count
            recommendation_result = await session.execute(
                select(Recommendation).where(Recommendation.vendor_id == vendor_id)
            )
            recommendations = recommendation_result.scalars().all()
            
            return {
                "profile": {
                    "vendor_id": profile.vendor_id,
                    "segment": profile.segment,
                    "confidence_score": profile.confidence_score,
                    "created_at": profile.created_at,
                    "updated_at": profile.updated_at
                },
                "performance_history_count": len(performance_history),
                "interaction_count": len(interactions),
                "recommendation_count": len(recommendations),
                "recent_performance": [
                    {
                        "revenue": p.revenue,
                        "orders": p.orders,
                        "timestamp": p.timestamp
                    }
                    for p in performance_history[:5]
                ]
            }
    
    async def cleanup_old_data(self, days: int = 90):
        """Clean up old data"""
        async with self.async_session() as session:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Clean old interactions
            await session.execute(
                delete(UserInteraction).where(UserInteraction.timestamp < cutoff_date)
            )
            
            # Clean old conversations
            await session.execute(
                delete(ConversationHistory).where(ConversationHistory.timestamp < cutoff_date)
            )
            
            await session.commit()
            logger.info(f"Cleaned up data older than {days} days")

# Global database service instance
db_service = DatabaseService()
