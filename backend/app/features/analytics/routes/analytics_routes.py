from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Dict, Any
from app.database.session import get_async_session
from app.features.analytics.services.personalization_engine import PersonalizationEngine
from app.features.analytics.services.bundle_automation import BundleAutomationEngine
from app.features.analytics.services.profit_optimization import ProfitOptimizationEngine
from app.features.analytics.models.user_activity import ActivityType
from app.core.logging import get_logger
from app.core.base import SuccessResponse
from pydantic import BaseModel
from datetime import datetime

logger = get_logger("analytics_routes")

analytics_router = APIRouter(prefix="/analytics", tags=["Analytics"])

# Pydantic models for request/response
class TrackActivityRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: str
    activity_type: str
    activity_data: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None

class RecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: str
    limit: int = 10
    recommendation_type: str = "product"

class BundleRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: str
    cart_items: Optional[List[Dict[str, Any]]] = None
    limit: int = 5

class AnalyticsResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str

@analytics_router.post("/track-activity", response_model=SuccessResponse)
async def track_user_activity(
    request: TrackActivityRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """Track user activity for personalization"""
    try:
        # Validate activity type
        try:
            activity_type = ActivityType(request.activity_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid activity type: {request.activity_type}"
            )
        
        # Initialize personalization engine
        engine = PersonalizationEngine(db)
        
        # Track the activity
        await engine.track_user_activity(
            user_id=request.user_id,
            session_id=request.session_id,
            activity_type=activity_type,
            activity_data=request.activity_data,
            context=request.context
        )
        
        return SuccessResponse(
            message="Activity tracked successfully",
            data={"activity_type": request.activity_type, "session_id": request.session_id}
        )
        
    except Exception as e:
        logger.error(f"Error tracking activity: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error tracking activity: {str(e)}"
        )

@analytics_router.post("/recommendations", response_model=AnalyticsResponse)
async def get_personalized_recommendations(
    request: RecommendationRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """Get personalized recommendations for a user"""
    try:
        # Initialize personalization engine
        engine = PersonalizationEngine(db)
        
        # Get recommendations
        recommendations = await engine.get_personalized_recommendations(
            user_id=request.user_id,
            session_id=request.session_id,
            limit=request.limit,
            recommendation_type=request.recommendation_type
        )
        
        return AnalyticsResponse(
            success=True,
            data={
                "recommendations": recommendations,
                "count": len(recommendations),
                "user_id": request.user_id,
                "session_id": request.session_id,
                "timestamp": datetime.utcnow().isoformat()
            },
            message="Recommendations generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting recommendations: {str(e)}"
        )

@analytics_router.post("/bundles", response_model=AnalyticsResponse)
async def get_bundle_recommendations(
    request: BundleRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """Get automated bundle recommendations"""
    try:
        # Initialize bundle automation engine
        engine = BundleAutomationEngine(db)
        
        # Get bundle recommendations
        bundles = await engine.generate_bundle_recommendations(
            user_id=request.user_id,
            session_id=request.session_id,
            cart_items=request.cart_items,
            limit=request.limit
        )
        
        return AnalyticsResponse(
            success=True,
            data={
                "bundles": bundles,
                "count": len(bundles),
                "user_id": request.user_id,
                "session_id": request.session_id,
                "timestamp": datetime.utcnow().isoformat()
            },
            message="Bundle recommendations generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting bundle recommendations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting bundle recommendations: {str(e)}"
        )

@analytics_router.get("/user-profile/{user_id}", response_model=AnalyticsResponse)
async def get_user_behavior_profile(
    user_id: str,
    db: AsyncSession = Depends(get_async_session)
):
    """Get user behavior profile"""
    try:
        from app.features.analytics.models.user_activity import UserBehaviorProfile
        from sqlalchemy import select
        
        # Get user behavior profile
        query = select(UserBehaviorProfile).where(UserBehaviorProfile.user_id == user_id)
        result = await db.execute(query)
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User behavior profile not found"
            )
        
        # Convert profile to dict
        profile_data = {
            "user_id": str(profile.user_id),
            "preferred_categories": profile.preferred_categories,
            "preferred_brands": profile.preferred_brands,
            "price_sensitivity": profile.price_sensitivity,
            "brand_loyalty": profile.brand_loyalty,
            "deal_seeking": profile.deal_seeking,
            "impulse_buying": profile.impulse_buying,
            "research_intensive": profile.research_intensive,
            "shopping_frequency": profile.shopping_frequency,
            "preferred_shopping_time": profile.preferred_shopping_time,
            "preferred_shopping_day": profile.preferred_shopping_day,
            "avg_session_duration": profile.avg_session_duration,
            "avg_pages_per_session": profile.avg_pages_per_session,
            "bounce_rate": profile.bounce_rate,
            "return_visitor": profile.return_visitor,
            "avg_order_value": profile.avg_order_value,
            "total_orders": profile.total_orders,
            "total_spent": profile.total_spent,
            "purchase_frequency": profile.purchase_frequency,
            "risk_score": profile.risk_score,
            "customer_lifecycle_stage": profile.customer_lifecycle_stage,
            "customer_lifetime_value": profile.customer_lifetime_value,
            "personalization_score": profile.personalization_score,
            "engagement_score": profile.engagement_score,
            "last_activity_at": profile.last_activity_at.isoformat() if profile.last_activity_at else None,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat()
        }
        
        return AnalyticsResponse(
            success=True,
            data=profile_data,
            message="User behavior profile retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user behavior profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting user behavior profile: {str(e)}"
        )

@analytics_router.get("/profit-optimization", response_model=AnalyticsResponse)
async def get_profit_optimization_analysis(
    db: AsyncSession = Depends(get_async_session)
):
    """Get profit optimization analysis and recommendations"""
    try:
        # Initialize profit optimization engine
        engine = ProfitOptimizationEngine(db)
        
        # Get optimization analysis
        analysis = await engine.analyze_user_value_segments()
        
        return AnalyticsResponse(
            success=True,
            data=analysis,
            message="Profit optimization analysis generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting profit optimization analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting profit optimization analysis: {str(e)}"
        )

@analytics_router.get("/user-segments", response_model=AnalyticsResponse)
async def get_user_segments(
    db: AsyncSession = Depends(get_async_session)
):
    """Get user segmentation analysis"""
    try:
        from app.features.analytics.models.user_activity import UserBehaviorProfile
        from sqlalchemy import select, func
        
        # Get user segments
        query = select(
            UserBehaviorProfile.customer_lifecycle_stage,
            func.count(UserBehaviorProfile.id).label('count'),
            func.avg(UserBehaviorProfile.customer_lifetime_value).label('avg_clv'),
            func.avg(UserBehaviorProfile.total_orders).label('avg_orders'),
            func.sum(UserBehaviorProfile.customer_lifetime_value).label('total_revenue')
        ).group_by(UserBehaviorProfile.customer_lifecycle_stage)
        
        result = await db.execute(query)
        segments = result.fetchall()
        
        # Format segments data
        segments_data = []
        for segment in segments:
            segments_data.append({
                "stage": segment.customer_lifecycle_stage,
                "count": segment.count,
                "avg_clv": float(segment.avg_clv or 0),
                "avg_orders": float(segment.avg_orders or 0),
                "total_revenue": float(segment.total_revenue or 0)
            })
        
        return AnalyticsResponse(
            success=True,
            data={
                "segments": segments_data,
                "total_segments": len(segments_data),
                "timestamp": datetime.utcnow().isoformat()
            },
            message="User segments analysis retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting user segments: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting user segments: {str(e)}"
        )

@analytics_router.get("/recommendation-performance", response_model=AnalyticsResponse)
async def get_recommendation_performance(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_async_session)
):
    """Get recommendation performance metrics"""
    try:
        from app.features.analytics.models.user_activity import RecommendationLog
        from sqlalchemy import select, func, and_
        from datetime import datetime, timedelta
        
        # Get performance metrics for the specified period
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = select(
            RecommendationLog.recommendation_type,
            func.count(RecommendationLog.id).label('total_recommendations'),
            func.sum(RecommendationLog.impressions).label('total_impressions'),
            func.sum(RecommendationLog.clicks).label('total_clicks'),
            func.sum(RecommendationLog.conversions).label('total_conversions'),
            func.sum(RecommendationLog.revenue_generated).label('total_revenue'),
            func.avg(RecommendationLog.recommendation_score).label('avg_score')
        ).where(
            RecommendationLog.created_at >= start_date
        ).group_by(RecommendationLog.recommendation_type)
        
        result = await db.execute(query)
        performance_data = result.fetchall()
        
        # Calculate metrics
        metrics = []
        for perf in performance_data:
            impressions = perf.total_impressions or 0
            clicks = perf.total_clicks or 0
            conversions = perf.total_conversions or 0
            
            ctr = (clicks / impressions) if impressions > 0 else 0
            conversion_rate = (conversions / clicks) if clicks > 0 else 0
            
            metrics.append({
                "recommendation_type": perf.recommendation_type,
                "total_recommendations": perf.total_recommendations,
                "total_impressions": impressions,
                "total_clicks": clicks,
                "total_conversions": conversions,
                "total_revenue": float(perf.total_revenue or 0),
                "avg_score": float(perf.avg_score or 0),
                "click_through_rate": ctr,
                "conversion_rate": conversion_rate
            })
        
        return AnalyticsResponse(
            success=True,
            data={
                "performance_metrics": metrics,
                "period_days": days,
                "timestamp": datetime.utcnow().isoformat()
            },
            message="Recommendation performance metrics retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting recommendation performance: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting recommendation performance: {str(e)}"
        )

@analytics_router.get("/bundle-performance", response_model=AnalyticsResponse)
async def get_bundle_performance(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_async_session)
):
    """Get bundle recommendation performance metrics"""
    try:
        from app.features.analytics.models.user_activity import BundleRecommendation
        from sqlalchemy import select, func, and_
        from datetime import datetime, timedelta
        
        # Get bundle performance metrics for the specified period
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = select(
            BundleRecommendation.bundle_type,
            func.count(BundleRecommendation.id).label('total_bundles'),
            func.sum(BundleRecommendation.impressions).label('total_impressions'),
            func.sum(BundleRecommendation.clicks).label('total_clicks'),
            func.sum(BundleRecommendation.conversions).label('total_conversions'),
            func.sum(BundleRecommendation.revenue_generated).label('total_revenue'),
            func.avg(BundleRecommendation.recommendation_score).label('avg_score'),
            func.avg(BundleRecommendation.discount_percentage).label('avg_discount')
        ).where(
            BundleRecommendation.created_at >= start_date
        ).group_by(BundleRecommendation.bundle_type)
        
        result = await db.execute(query)
        bundle_performance = result.fetchall()
        
        # Calculate metrics
        metrics = []
        for perf in bundle_performance:
            impressions = perf.total_impressions or 0
            clicks = perf.total_clicks or 0
            conversions = perf.total_conversions or 0
            
            ctr = (clicks / impressions) if impressions > 0 else 0
            conversion_rate = (conversions / clicks) if clicks > 0 else 0
            
            metrics.append({
                "bundle_type": perf.bundle_type,
                "total_bundles": perf.total_bundles,
                "total_impressions": impressions,
                "total_clicks": clicks,
                "total_conversions": conversions,
                "total_revenue": float(perf.total_revenue or 0),
                "avg_score": float(perf.avg_score or 0),
                "avg_discount": float(perf.avg_discount or 0),
                "click_through_rate": ctr,
                "conversion_rate": conversion_rate
            })
        
        return AnalyticsResponse(
            success=True,
            data={
                "bundle_performance": metrics,
                "period_days": days,
                "timestamp": datetime.utcnow().isoformat()
            },
            message="Bundle performance metrics retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting bundle performance: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting bundle performance: {str(e)}"
        )

@analytics_router.post("/track-recommendation-interaction", response_model=SuccessResponse)
async def track_recommendation_interaction(
    recommendation_id: str,
    interaction_type: str = Query(..., description="Type of interaction: view, click, conversion"),
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session)
):
    """Track user interactions with recommendations"""
    try:
        from app.features.analytics.models.user_activity import RecommendationLog
        from sqlalchemy import select, update
        
        # Get the recommendation log
        query = select(RecommendationLog).where(RecommendationLog.id == recommendation_id)
        result = await db.execute(query)
        recommendation = result.scalar_one_or_none()
        
        if not recommendation:
            raise HTTPException(
                status_code=404,
                detail="Recommendation not found"
            )
        
        # Update interaction counts
        if interaction_type == "view":
            recommendation.impressions += 1
        elif interaction_type == "click":
            recommendation.clicks += 1
        elif interaction_type == "conversion":
            recommendation.conversions += 1
        
        await db.commit()
        
        return SuccessResponse(
            message="Recommendation interaction tracked successfully",
            data={
                "recommendation_id": recommendation_id,
                "interaction_type": interaction_type,
                "impressions": recommendation.impressions,
                "clicks": recommendation.clicks,
                "conversions": recommendation.conversions
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking recommendation interaction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error tracking recommendation interaction: {str(e)}"
        )

@analytics_router.post("/track-bundle-interaction", response_model=SuccessResponse)
async def track_bundle_interaction(
    bundle_id: str,
    interaction_type: str = Query(..., description="Type of interaction: view, click, conversion"),
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session)
):
    """Track user interactions with bundle recommendations"""
    try:
        from app.features.analytics.models.user_activity import BundleRecommendation
        from sqlalchemy import select, update
        
        # Get the bundle recommendation
        query = select(BundleRecommendation).where(BundleRecommendation.id == bundle_id)
        result = await db.execute(query)
        bundle = result.scalar_one_or_none()
        
        if not bundle:
            raise HTTPException(
                status_code=404,
                detail="Bundle recommendation not found"
            )
        
        # Update interaction counts
        if interaction_type == "view":
            bundle.impressions += 1
        elif interaction_type == "click":
            bundle.clicks += 1
        elif interaction_type == "conversion":
            bundle.conversions += 1
        
        await db.commit()
        
        return SuccessResponse(
            message="Bundle interaction tracked successfully",
            data={
                "bundle_id": bundle_id,
                "interaction_type": interaction_type,
                "impressions": bundle.impressions,
                "clicks": bundle.clicks,
                "conversions": bundle.conversions
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking bundle interaction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error tracking bundle interaction: {str(e)}"
        )
