from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Dict, Any
from app.database.session import get_async_session
from app.features.analytics.services.personalization_engine import PersonalizationEngine
from app.features.analytics.services.bundle_automation import BundleAutomationEngine
from app.features.analytics.services.profit_optimization import ProfitOptimizationEngine
from app.core.logging import get_logger
from app.core.base import SuccessResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import select, func, and_, or_, desc, asc, text

logger = get_logger("dashboard_routes")

dashboard_router = APIRouter(prefix="/dashboard", tags=["Analytics Dashboard"])

class DashboardResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str

@dashboard_router.get("/overview", response_model=DashboardResponse)
async def get_dashboard_overview(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_async_session)
):
    """Get comprehensive dashboard overview"""
    try:
        from app.features.analytics.models.user_activity import (
            UserActivity, UserBehaviorProfile, RecommendationLog, BundleRecommendation
        )
        
        # Calculate date range
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get key metrics
        metrics = await _get_key_metrics(db, start_date)
        
        # Get user segmentation
        segmentation = await _get_user_segmentation(db)
        
        # Get recommendation performance
        recommendation_performance = await _get_recommendation_performance(db, start_date)
        
        # Get bundle performance
        bundle_performance = await _get_bundle_performance(db, start_date)
        
        # Get profit optimization insights
        profit_insights = await _get_profit_insights(db)
        
        # Get trending products
        trending_products = await _get_trending_products(db, start_date)
        
        # Get top categories
        top_categories = await _get_top_categories(db, start_date)
        
        # Get conversion funnel
        conversion_funnel = await _get_conversion_funnel(db, start_date)
        
        return DashboardResponse(
            success=True,
            data={
                "overview": {
                    "period_days": days,
                    "timestamp": datetime.utcnow().isoformat()
                },
                "key_metrics": metrics,
                "user_segmentation": segmentation,
                "recommendation_performance": recommendation_performance,
                "bundle_performance": bundle_performance,
                "profit_insights": profit_insights,
                "trending_products": trending_products,
                "top_categories": top_categories,
                "conversion_funnel": conversion_funnel
            },
            message="Dashboard overview generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting dashboard overview: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting dashboard overview: {str(e)}"
        )

@dashboard_router.get("/user-analytics", response_model=DashboardResponse)
async def get_user_analytics(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_async_session)
):
    """Get detailed user analytics"""
    try:
        from app.features.analytics.models.user_activity import UserActivity, UserBehaviorProfile
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get user activity trends
        activity_trends = await _get_activity_trends(db, start_date)
        
        # Get user behavior patterns
        behavior_patterns = await _get_behavior_patterns(db)
        
        # Get user engagement metrics
        engagement_metrics = await _get_engagement_metrics(db, start_date)
        
        # Get user lifecycle analysis
        lifecycle_analysis = await _get_lifecycle_analysis(db)
        
        # Get user value analysis
        value_analysis = await _get_user_value_analysis(db)
        
        return DashboardResponse(
            success=True,
            data={
                "period_days": days,
                "timestamp": datetime.utcnow().isoformat(),
                "activity_trends": activity_trends,
                "behavior_patterns": behavior_patterns,
                "engagement_metrics": engagement_metrics,
                "lifecycle_analysis": lifecycle_analysis,
                "value_analysis": value_analysis
            },
            message="User analytics generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting user analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting user analytics: {str(e)}"
        )

@dashboard_router.get("/recommendation-analytics", response_model=DashboardResponse)
async def get_recommendation_analytics(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_async_session)
):
    """Get detailed recommendation analytics"""
    try:
        from app.features.analytics.models.user_activity import RecommendationLog, BundleRecommendation
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get recommendation performance by type
        performance_by_type = await _get_recommendation_performance_by_type(db, start_date)
        
        # Get recommendation accuracy
        accuracy_metrics = await _get_recommendation_accuracy(db, start_date)
        
        # Get user engagement with recommendations
        engagement_with_recommendations = await _get_engagement_with_recommendations(db, start_date)
        
        # Get A/B test results
        ab_test_results = await _get_ab_test_results(db, start_date)
        
        # Get recommendation ROI
        recommendation_roi = await _get_recommendation_roi(db, start_date)
        
        return DashboardResponse(
            success=True,
            data={
                "period_days": days,
                "timestamp": datetime.utcnow().isoformat(),
                "performance_by_type": performance_by_type,
                "accuracy_metrics": accuracy_metrics,
                "engagement_with_recommendations": engagement_with_recommendations,
                "ab_test_results": ab_test_results,
                "recommendation_roi": recommendation_roi
            },
            message="Recommendation analytics generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting recommendation analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting recommendation analytics: {str(e)}"
        )

@dashboard_router.get("/profit-analytics", response_model=DashboardResponse)
async def get_profit_analytics(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_async_session)
):
    """Get detailed profit optimization analytics"""
    try:
        # Initialize profit optimization engine
        engine = ProfitOptimizationEngine(db)
        
        # Get comprehensive profit analysis
        profit_analysis = await engine.analyze_user_value_segments()
        
        # Get revenue optimization insights
        revenue_insights = await _get_revenue_insights(db, days)
        
        # Get cost optimization insights
        cost_insights = await _get_cost_insights(db, days)
        
        # Get margin analysis
        margin_analysis = await _get_margin_analysis(db, days)
        
        # Get customer lifetime value trends
        clv_trends = await _get_clv_trends(db, days)
        
        return DashboardResponse(
            success=True,
            data={
                "period_days": days,
                "timestamp": datetime.utcnow().isoformat(),
                "profit_analysis": profit_analysis,
                "revenue_insights": revenue_insights,
                "cost_insights": cost_insights,
                "margin_analysis": margin_analysis,
                "clv_trends": clv_trends
            },
            message="Profit analytics generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting profit analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting profit analytics: {str(e)}"
        )

# Helper functions for dashboard data
async def _get_key_metrics(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get key performance metrics"""
    try:
        from app.features.analytics.models.user_activity import UserActivity, UserBehaviorProfile
        
        # Total users
        total_users_query = select(func.count(UserBehaviorProfile.id))
        total_users_result = await db.execute(total_users_query)
        total_users = total_users_result.scalar()
        
        # Active users (last 30 days)
        active_users_query = select(func.count(UserBehaviorProfile.id)).where(
            UserBehaviorProfile.last_activity_at >= start_date
        )
        active_users_result = await db.execute(active_users_query)
        active_users = active_users_result.scalar()
        
        # Total activities
        total_activities_query = select(func.count(UserActivity.id)).where(
            UserActivity.created_at >= start_date
        )
        total_activities_result = await db.execute(total_activities_query)
        total_activities = total_activities_result.scalar()
        
        # Average session duration
        avg_session_duration_query = select(func.avg(UserBehaviorProfile.avg_session_duration))
        avg_session_duration_result = await db.execute(avg_session_duration_query)
        avg_session_duration = avg_session_duration_result.scalar() or 0
        
        # Total revenue
        total_revenue_query = select(func.sum(UserBehaviorProfile.customer_lifetime_value))
        total_revenue_result = await db.execute(total_revenue_query)
        total_revenue = total_revenue_result.scalar() or 0
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_activities": total_activities,
            "avg_session_duration": float(avg_session_duration),
            "total_revenue": float(total_revenue),
            "revenue_per_user": float(total_revenue / total_users) if total_users > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"Error getting key metrics: {str(e)}")
        return {}

async def _get_user_segmentation(db: AsyncSession) -> Dict[str, Any]:
    """Get user segmentation analysis"""
    try:
        from app.features.analytics.models.user_activity import UserBehaviorProfile
        
        # Get segments by lifecycle stage
        segments_query = select(
            UserBehaviorProfile.customer_lifecycle_stage,
            func.count(UserBehaviorProfile.id).label('count'),
            func.avg(UserBehaviorProfile.customer_lifetime_value).label('avg_clv'),
            func.sum(UserBehaviorProfile.customer_lifetime_value).label('total_revenue')
        ).group_by(UserBehaviorProfile.customer_lifecycle_stage)
        
        result = await db.execute(segments_query)
        segments = result.fetchall()
        
        segment_data = []
        for segment in segments:
            segment_data.append({
                "stage": segment.customer_lifecycle_stage,
                "count": segment.count,
                "avg_clv": float(segment.avg_clv or 0),
                "total_revenue": float(segment.total_revenue or 0)
            })
        
        return {"segments": segment_data}
        
    except Exception as e:
        logger.error(f"Error getting user segmentation: {str(e)}")
        return {}

async def _get_recommendation_performance(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get recommendation performance metrics"""
    try:
        from app.features.analytics.models.user_activity import RecommendationLog
        
        # Get overall recommendation performance
        performance_query = select(
            func.count(RecommendationLog.id).label('total_recommendations'),
            func.sum(RecommendationLog.impressions).label('total_impressions'),
            func.sum(RecommendationLog.clicks).label('total_clicks'),
            func.sum(RecommendationLog.conversions).label('total_conversions'),
            func.sum(RecommendationLog.revenue_generated).label('total_revenue')
        ).where(RecommendationLog.created_at >= start_date)
        
        result = await db.execute(performance_query)
        performance = result.fetchone()
        
        impressions = performance.total_impressions or 0
        clicks = performance.total_clicks or 0
        conversions = performance.total_conversions or 0
        
        ctr = (clicks / impressions) if impressions > 0 else 0
        conversion_rate = (conversions / clicks) if clicks > 0 else 0
        
        return {
            "total_recommendations": performance.total_recommendations or 0,
            "total_impressions": impressions,
            "total_clicks": clicks,
            "total_conversions": conversions,
            "total_revenue": float(performance.total_revenue or 0),
            "click_through_rate": ctr,
            "conversion_rate": conversion_rate
        }
        
    except Exception as e:
        logger.error(f"Error getting recommendation performance: {str(e)}")
        return {}

async def _get_bundle_performance(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get bundle performance metrics"""
    try:
        from app.features.analytics.models.user_activity import BundleRecommendation
        
        # Get overall bundle performance
        performance_query = select(
            func.count(BundleRecommendation.id).label('total_bundles'),
            func.sum(BundleRecommendation.impressions).label('total_impressions'),
            func.sum(BundleRecommendation.clicks).label('total_clicks'),
            func.sum(BundleRecommendation.conversions).label('total_conversions'),
            func.sum(BundleRecommendation.revenue_generated).label('total_revenue'),
            func.avg(BundleRecommendation.discount_percentage).label('avg_discount')
        ).where(BundleRecommendation.created_at >= start_date)
        
        result = await db.execute(performance_query)
        performance = result.fetchone()
        
        impressions = performance.total_impressions or 0
        clicks = performance.total_clicks or 0
        conversions = performance.total_conversions or 0
        
        ctr = (clicks / impressions) if impressions > 0 else 0
        conversion_rate = (conversions / clicks) if clicks > 0 else 0
        
        return {
            "total_bundles": performance.total_bundles or 0,
            "total_impressions": impressions,
            "total_clicks": clicks,
            "total_conversions": conversions,
            "total_revenue": float(performance.total_revenue or 0),
            "avg_discount": float(performance.avg_discount or 0),
            "click_through_rate": ctr,
            "conversion_rate": conversion_rate
        }
        
    except Exception as e:
        logger.error(f"Error getting bundle performance: {str(e)}")
        return {}

async def _get_profit_insights(db: AsyncSession) -> Dict[str, Any]:
    """Get profit optimization insights"""
    try:
        # This would typically calculate profit insights
        # For now, we'll return mock data
        return {
            "revenue_optimization_opportunities": [
                "Increase prices on high-margin products by 5-10%",
                "Create premium bundles with high-margin products",
                "Implement dynamic pricing based on demand"
            ],
            "cost_optimization_opportunities": [
                "Reduce inventory costs for slow-moving products",
                "Optimize marketing spend on high-ROI channels",
                "Implement automated customer service"
            ],
            "margin_improvement_suggestions": [
                "Focus on high-margin product categories",
                "Create exclusive products with higher margins",
                "Implement upselling strategies"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting profit insights: {str(e)}")
        return {}

async def _get_trending_products(db: AsyncSession, start_date: datetime) -> List[Dict[str, Any]]:
    """Get trending products"""
    try:
        from app.features.analytics.models.user_activity import UserActivity
        from app.features.products.models.product import Product
        
        # Get trending products based on activity
        trending_query = select(
            Product.id,
            Product.name,
            Product.price,
            func.count(UserActivity.id).label('activity_count')
        ).join(
            UserActivity, Product.id == UserActivity.product_id
        ).where(
            and_(
                UserActivity.activity_type.in_([
                    'product_view', 'add_to_cart', 'purchase'
                ]),
                UserActivity.created_at >= start_date
            )
        ).group_by(
            Product.id, Product.name, Product.price
        ).order_by(
            desc('activity_count')
        ).limit(10)
        
        result = await db.execute(trending_query)
        trending = result.fetchall()
        
        return [
            {
                "id": str(product.id),
                "name": product.name,
                "price": float(product.price),
                "activity_count": product.activity_count
            }
            for product in trending
        ]
        
    except Exception as e:
        logger.error(f"Error getting trending products: {str(e)}")
        return []

async def _get_top_categories(db: AsyncSession, start_date: datetime) -> List[Dict[str, Any]]:
    """Get top categories by activity"""
    try:
        from app.features.analytics.models.user_activity import UserActivity
        from app.features.products.models.category import Category
        
        # Get top categories
        categories_query = select(
            Category.id,
            Category.name,
            func.count(UserActivity.id).label('activity_count')
        ).join(
            UserActivity, Category.id == UserActivity.category_id
        ).where(
            UserActivity.created_at >= start_date
        ).group_by(
            Category.id, Category.name
        ).order_by(
            desc('activity_count')
        ).limit(10)
        
        result = await db.execute(categories_query)
        categories = result.fetchall()
        
        return [
            {
                "id": str(category.id),
                "name": category.name,
                "activity_count": category.activity_count
            }
            for category in categories
        ]
        
    except Exception as e:
        logger.error(f"Error getting top categories: {str(e)}")
        return []

async def _get_conversion_funnel(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get conversion funnel analysis"""
    try:
        from app.features.analytics.models.user_activity import UserActivity
        
        # Get funnel stages
        funnel_stages = [
            'page_view',
            'product_view',
            'add_to_cart',
            'purchase'
        ]
        
        funnel_data = {}
        for stage in funnel_stages:
            stage_query = select(func.count(UserActivity.id)).where(
                and_(
                    UserActivity.activity_type == stage,
                    UserActivity.created_at >= start_date
                )
            )
            result = await db.execute(stage_query)
            count = result.scalar()
            funnel_data[stage] = count
        
        # Calculate conversion rates
        conversion_rates = {}
        if funnel_data['page_view'] > 0:
            conversion_rates['page_to_product'] = funnel_data['product_view'] / funnel_data['page_view']
        if funnel_data['product_view'] > 0:
            conversion_rates['product_to_cart'] = funnel_data['add_to_cart'] / funnel_data['product_view']
        if funnel_data['add_to_cart'] > 0:
            conversion_rates['cart_to_purchase'] = funnel_data['purchase'] / funnel_data['add_to_cart']
        
        return {
            "funnel_data": funnel_data,
            "conversion_rates": conversion_rates
        }
        
    except Exception as e:
        logger.error(f"Error getting conversion funnel: {str(e)}")
        return {}

# Additional helper functions for detailed analytics
async def _get_activity_trends(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get user activity trends"""
    # Implementation for activity trends
    return {"trends": "Activity trends data"}

async def _get_behavior_patterns(db: AsyncSession) -> Dict[str, Any]:
    """Get user behavior patterns"""
    # Implementation for behavior patterns
    return {"patterns": "Behavior patterns data"}

async def _get_engagement_metrics(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get user engagement metrics"""
    # Implementation for engagement metrics
    return {"metrics": "Engagement metrics data"}

async def _get_lifecycle_analysis(db: AsyncSession) -> Dict[str, Any]:
    """Get user lifecycle analysis"""
    # Implementation for lifecycle analysis
    return {"analysis": "Lifecycle analysis data"}

async def _get_user_value_analysis(db: AsyncSession) -> Dict[str, Any]:
    """Get user value analysis"""
    # Implementation for user value analysis
    return {"analysis": "User value analysis data"}

async def _get_recommendation_performance_by_type(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get recommendation performance by type"""
    # Implementation for performance by type
    return {"performance": "Performance by type data"}

async def _get_recommendation_accuracy(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get recommendation accuracy metrics"""
    # Implementation for accuracy metrics
    return {"accuracy": "Accuracy metrics data"}

async def _get_engagement_with_recommendations(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get user engagement with recommendations"""
    # Implementation for engagement with recommendations
    return {"engagement": "Engagement with recommendations data"}

async def _get_ab_test_results(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get A/B test results"""
    # Implementation for A/B test results
    return {"ab_tests": "A/B test results data"}

async def _get_recommendation_roi(db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
    """Get recommendation ROI"""
    # Implementation for recommendation ROI
    return {"roi": "Recommendation ROI data"}

async def _get_revenue_insights(db: AsyncSession, days: int) -> Dict[str, Any]:
    """Get revenue optimization insights"""
    # Implementation for revenue insights
    return {"insights": "Revenue insights data"}

async def _get_cost_insights(db: AsyncSession, days: int) -> Dict[str, Any]:
    """Get cost optimization insights"""
    # Implementation for cost insights
    return {"insights": "Cost insights data"}

async def _get_margin_analysis(db: AsyncSession, days: int) -> Dict[str, Any]:
    """Get margin analysis"""
    # Implementation for margin analysis
    return {"analysis": "Margin analysis data"}

async def _get_clv_trends(db: AsyncSession, days: int) -> Dict[str, Any]:
    """Get customer lifetime value trends"""
    # Implementation for CLV trends
    return {"trends": "CLV trends data"}
