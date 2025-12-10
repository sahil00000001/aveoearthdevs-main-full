from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from datetime import datetime, timedelta
import json
import math
from collections import defaultdict, Counter
import asyncio
from app.features.analytics.models.user_activity import (
    UserActivity, UserBehaviorProfile, RecommendationLog, BundleRecommendation,
    ActivityType
)
from app.features.products.models.product import Product
from app.features.products.models.category import Category
from app.features.products.models.brand import Brand
from app.core.logging import get_logger

logger = get_logger("personalization_engine")

class PersonalizationEngine:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.logger = logger
    
    async def track_user_activity(
        self,
        user_id: Optional[str],
        session_id: str,
        activity_type: ActivityType,
        activity_data: Dict[str, Any],
        context: Dict[str, Any] = None
    ) -> None:
        """Track user activity for personalization"""
        try:
            activity = UserActivity(
                user_id=user_id,
                session_id=session_id,
                activity_type=activity_type.value,
                activity_data=activity_data,
                page_url=context.get('page_url') if context else None,
                referrer_url=context.get('referrer_url') if context else None,
                user_agent=context.get('user_agent') if context else None,
                ip_address=context.get('ip_address') if context else None,
                device_type=context.get('device_type') if context else None,
                browser=context.get('browser') if context else None,
                os=context.get('os') if context else None,
                country=context.get('country') if context else None,
                city=context.get('city') if context else None,
                product_id=activity_data.get('product_id') if activity_data else None,
                category_id=activity_data.get('category_id') if activity_data else None,
                brand_id=activity_data.get('brand_id') if activity_data else None,
                cart_value=activity_data.get('cart_value') if activity_data else None,
                order_value=activity_data.get('order_value') if activity_data else None,
                quantity=activity_data.get('quantity') if activity_data else None,
                price=activity_data.get('price') if activity_data else None,
                time_spent=activity_data.get('time_spent') if activity_data else None,
                scroll_depth=activity_data.get('scroll_depth') if activity_data else None,
                recommendation_id=activity_data.get('recommendation_id') if activity_data else None,
                recommendation_type=activity_data.get('recommendation_type') if activity_data else None,
                recommendation_score=activity_data.get('recommendation_score') if activity_data else None,
                recommendation_position=activity_data.get('recommendation_position') if activity_data else None,
                conversion_value=activity_data.get('conversion_value') if activity_data else None,
                conversion_type=activity_data.get('conversion_type') if activity_data else None,
                funnel_stage=activity_data.get('funnel_stage') if activity_data else None
            )
            
            self.db.add(activity)
            await self.db.commit()
            
            # Update behavior profile asynchronously
            if user_id:
                asyncio.create_task(self._update_behavior_profile(user_id))
                
        except Exception as e:
            self.logger.error(f"Error tracking user activity: {str(e)}")
            await self.db.rollback()
    
    async def _update_behavior_profile(self, user_id: str) -> None:
        """Update user behavior profile based on recent activities"""
        try:
            # Get recent activities (last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            activities_query = select(UserActivity).where(
                and_(
                    UserActivity.user_id == user_id,
                    UserActivity.created_at >= thirty_days_ago
                )
            )
            result = await self.db.execute(activities_query)
            activities = result.scalars().all()
            
            if not activities:
                return
            
            # Calculate behavioral metrics
            behavior_data = self._calculate_behavior_metrics(activities)
            
            # Get or create behavior profile
            profile_query = select(UserBehaviorProfile).where(
                UserBehaviorProfile.user_id == user_id
            )
            result = await self.db.execute(profile_query)
            profile = result.scalar_one_or_none()
            
            if not profile:
                profile = UserBehaviorProfile(user_id=user_id)
                self.db.add(profile)
            
            # Update profile with calculated metrics
            self._update_profile_with_metrics(profile, behavior_data)
            
            await self.db.commit()
            
        except Exception as e:
            self.logger.error(f"Error updating behavior profile: {str(e)}")
            await self.db.rollback()
    
    def _calculate_behavior_metrics(self, activities: List[UserActivity]) -> Dict[str, Any]:
        """Calculate behavioral metrics from user activities"""
        metrics = {
            'preferred_categories': [],
            'preferred_brands': [],
            'price_sensitivity': 0.0,
            'brand_loyalty': 0.0,
            'deal_seeking': False,
            'impulse_buying': False,
            'research_intensive': False,
            'shopping_frequency': 'monthly',
            'preferred_shopping_time': 'afternoon',
            'preferred_shopping_day': 'weekend',
            'avg_session_duration': 0,
            'avg_pages_per_session': 0.0,
            'bounce_rate': 0.0,
            'return_visitor': False,
            'avg_order_value': 0.0,
            'total_orders': 0,
            'total_spent': 0.0,
            'purchase_frequency': 0.0,
            'risk_score': 0.0,
            'customer_lifecycle_stage': 'new',
            'customer_lifetime_value': 0.0,
            'personalization_score': 0.0,
            'engagement_score': 0.0
        }
        
        # Category and brand preferences
        category_counts = Counter()
        brand_counts = Counter()
        price_points = []
        brand_consistency = []
        
        # Shopping patterns
        session_durations = []
        pages_per_session = []
        order_values = []
        purchase_dates = []
        
        # Device and time patterns
        device_types = Counter()
        shopping_times = Counter()
        shopping_days = Counter()
        
        # Engagement metrics
        total_clicks = 0
        total_views = 0
        total_time_spent = 0
        
        for activity in activities:
            # Category and brand preferences
            if activity.category_id:
                category_counts[activity.category_id] += 1
            if activity.brand_id:
                brand_counts[activity.brand_id] += 1
                brand_consistency.append(activity.brand_id)
            
            # Price sensitivity
            if activity.price:
                price_points.append(activity.price)
            
            # Shopping patterns
            if activity.time_spent:
                session_durations.append(activity.time_spent)
            if activity.order_value:
                order_values.append(activity.order_value)
                purchase_dates.append(activity.created_at)
            
            # Device and time patterns
            if activity.device_type:
                device_types[activity.device_type] += 1
            if activity.created_at:
                shopping_times[activity.created_at.hour] += 1
                shopping_days[activity.created_at.weekday()] += 1
            
            # Engagement
            total_clicks += activity.click_count or 0
            total_views += activity.view_count or 0
            total_time_spent += activity.time_spent or 0
        
        # Calculate metrics
        if category_counts:
            metrics['preferred_categories'] = [cat for cat, count in category_counts.most_common(5)]
        if brand_counts:
            metrics['preferred_brands'] = [brand for brand, count in brand_counts.most_common(5)]
            # Brand loyalty calculation
            if len(brand_consistency) > 1:
                most_common_brand = Counter(brand_consistency).most_common(1)[0][1]
                metrics['brand_loyalty'] = most_common_brand / len(brand_consistency)
        
        # Price sensitivity
        if price_points:
            price_std = math.sqrt(sum((p - sum(price_points)/len(price_points))**2 for p in price_points) / len(price_points))
            price_mean = sum(price_points) / len(price_points)
            metrics['price_sensitivity'] = min(1.0, price_std / price_mean if price_mean > 0 else 0)
        
        # Shopping frequency
        if purchase_dates:
            days_between_purchases = []
            for i in range(1, len(purchase_dates)):
                days_between_purchases.append((purchase_dates[i] - purchase_dates[i-1]).days)
            if days_between_purchases:
                avg_days = sum(days_between_purchases) / len(days_between_purchases)
                if avg_days <= 7:
                    metrics['shopping_frequency'] = 'daily'
                elif avg_days <= 30:
                    metrics['shopping_frequency'] = 'weekly'
                else:
                    metrics['shopping_frequency'] = 'monthly'
        
        # Device preference
        if device_types:
            metrics['preferred_device'] = device_types.most_common(1)[0][0]
        
        # Shopping time preference
        if shopping_times:
            metrics['preferred_shopping_time'] = self._get_time_period(shopping_times.most_common(1)[0][0])
        
        # Shopping day preference
        if shopping_days:
            metrics['preferred_shopping_day'] = 'weekend' if shopping_days.most_common(1)[0][0] >= 5 else 'weekday'
        
        # Engagement metrics
        if session_durations:
            metrics['avg_session_duration'] = sum(session_durations) / len(session_durations)
        if total_views > 0:
            metrics['avg_pages_per_session'] = total_views / len(set(activity.session_id for activity in activities))
            metrics['bounce_rate'] = 1.0 - (total_clicks / total_views) if total_views > 0 else 0.0
        
        # Purchase metrics
        if order_values:
            metrics['avg_order_value'] = sum(order_values) / len(order_values)
            metrics['total_orders'] = len(order_values)
            metrics['total_spent'] = sum(order_values)
            metrics['purchase_frequency'] = len(order_values) / 30  # orders per month
        
        # Customer lifecycle stage
        if metrics['total_orders'] == 0:
            metrics['customer_lifecycle_stage'] = 'new'
        elif metrics['total_orders'] >= 10:
            metrics['customer_lifecycle_stage'] = 'loyal'
        elif metrics['total_orders'] >= 3:
            metrics['customer_lifecycle_stage'] = 'active'
        else:
            metrics['customer_lifecycle_stage'] = 'at_risk'
        
        # Customer lifetime value
        metrics['customer_lifetime_value'] = metrics['total_spent']
        
        # Personalization score (combination of engagement and purchase behavior)
        engagement_score = min(1.0, (total_clicks + total_views) / 100)
        purchase_score = min(1.0, metrics['total_orders'] / 10)
        metrics['personalization_score'] = (engagement_score + purchase_score) / 2
        
        # Engagement score
        metrics['engagement_score'] = engagement_score
        
        return metrics
    
    def _get_time_period(self, hour: int) -> str:
        """Convert hour to time period"""
        if 6 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 18:
            return 'afternoon'
        elif 18 <= hour < 22:
            return 'evening'
        else:
            return 'night'
    
    def _update_profile_with_metrics(self, profile: UserBehaviorProfile, metrics: Dict[str, Any]) -> None:
        """Update behavior profile with calculated metrics"""
        profile.preferred_categories = metrics['preferred_categories']
        profile.preferred_brands = metrics['preferred_brands']
        profile.price_sensitivity = metrics['price_sensitivity']
        profile.brand_loyalty = metrics['brand_loyalty']
        profile.deal_seeking = metrics['deal_seeking']
        profile.impulse_buying = metrics['impulse_buying']
        profile.research_intensive = metrics['research_intensive']
        profile.shopping_frequency = metrics['shopping_frequency']
        profile.preferred_shopping_time = metrics['preferred_shopping_time']
        profile.preferred_shopping_day = metrics['preferred_shopping_day']
        profile.avg_session_duration = metrics['avg_session_duration']
        profile.avg_pages_per_session = metrics['avg_pages_per_session']
        profile.bounce_rate = metrics['bounce_rate']
        profile.return_visitor = metrics['return_visitor']
        profile.avg_order_value = metrics['avg_order_value']
        profile.total_orders = metrics['total_orders']
        profile.total_spent = metrics['total_spent']
        profile.purchase_frequency = metrics['purchase_frequency']
        profile.risk_score = metrics['risk_score']
        profile.customer_lifecycle_stage = metrics['customer_lifecycle_stage']
        profile.customer_lifetime_value = metrics['customer_lifetime_value']
        profile.personalization_score = metrics['personalization_score']
        profile.engagement_score = metrics['engagement_score']
        profile.last_activity_at = datetime.utcnow()
    
    async def get_personalized_recommendations(
        self,
        user_id: Optional[str],
        session_id: str,
        limit: int = 10,
        recommendation_type: str = "product"
    ) -> List[Dict[str, Any]]:
        """Get personalized recommendations for a user"""
        try:
            recommendations = []
            
            if user_id:
                # Get user behavior profile
                profile_query = select(UserBehaviorProfile).where(
                    UserBehaviorProfile.user_id == user_id
                )
                result = await self.db.execute(profile_query)
                profile = result.scalar_one_or_none()
                
                if profile:
                    # Generate recommendations based on profile
                    recommendations = await self._generate_profile_based_recommendations(
                        profile, limit, recommendation_type
                    )
            
            # If no user profile or insufficient data, use collaborative filtering
            if not recommendations:
                recommendations = await self._generate_collaborative_recommendations(
                    user_id, session_id, limit, recommendation_type
                )
            
            # Log recommendations
            if recommendations:
                await self._log_recommendations(
                    user_id, session_id, recommendations, recommendation_type
                )
            
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Error getting personalized recommendations: {str(e)}")
            return []
    
    async def _generate_profile_based_recommendations(
        self,
        profile: UserBehaviorProfile,
        limit: int,
        recommendation_type: str
    ) -> List[Dict[str, Any]]:
        """Generate recommendations based on user behavior profile"""
        recommendations = []
        
        try:
            if recommendation_type == "product":
                # Get products from preferred categories and brands
                query = select(Product).where(
                    and_(
                        Product.is_active == True,
                        or_(
                            Product.category_id.in_(profile.preferred_categories or []),
                            Product.brand_id.in_(profile.preferred_brands or [])
                        )
                    )
                ).limit(limit * 2)  # Get more to filter by price sensitivity
                
                result = await self.db.execute(query)
                products = result.scalars().all()
                
                # Filter by price sensitivity
                if profile.price_sensitivity and profile.price_sensitivity < 0.5:
                    # Low price sensitivity - show premium products
                    products = [p for p in products if p.price > profile.avg_order_value * 1.2]
                elif profile.price_sensitivity and profile.price_sensitivity > 0.7:
                    # High price sensitivity - show budget products
                    products = [p for p in products if p.price < profile.avg_order_value * 0.8]
                
                # Convert to recommendation format
                for product in products[:limit]:
                    recommendations.append({
                        'id': str(product.id),
                        'type': 'product',
                        'name': product.name,
                        'price': float(product.price),
                        'category_id': str(product.category_id),
                        'brand_id': str(product.brand_id) if product.brand_id else None,
                        'image_url': product.images[0] if product.images else None,
                        'recommendation_score': self._calculate_product_score(product, profile),
                        'recommendation_reason': self._get_recommendation_reason(product, profile)
                    })
            
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating profile-based recommendations: {str(e)}")
            return []
    
    async def _generate_collaborative_recommendations(
        self,
        user_id: Optional[str],
        session_id: str,
        limit: int,
        recommendation_type: str
    ) -> List[Dict[str, Any]]:
        """Generate recommendations using collaborative filtering"""
        recommendations = []
        
        try:
            # Get popular products from recent activities
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            popular_products_query = select(
                Product.id,
                Product.name,
                Product.price,
                Product.category_id,
                Product.brand_id,
                Product.images,
                func.count(UserActivity.id).label('activity_count')
            ).join(
                UserActivity, Product.id == UserActivity.product_id
            ).where(
                and_(
                    UserActivity.activity_type.in_([
                        ActivityType.PRODUCT_VIEW.value,
                        ActivityType.ADD_TO_CART.value,
                        ActivityType.PURCHASE.value
                    ]),
                    UserActivity.created_at >= thirty_days_ago,
                    Product.is_active == True
                )
            ).group_by(
                Product.id, Product.name, Product.price, Product.category_id, Product.brand_id, Product.images
            ).order_by(
                desc('activity_count')
            ).limit(limit)
            
            result = await self.db.execute(popular_products_query)
            popular_products = result.fetchall()
            
            for product in popular_products:
                recommendations.append({
                    'id': str(product.id),
                    'type': 'product',
                    'name': product.name,
                    'price': float(product.price),
                    'category_id': str(product.category_id),
                    'brand_id': str(product.brand_id) if product.brand_id else None,
                    'image_url': product.images[0] if product.images else None,
                    'recommendation_score': 0.8,  # Default score for popular items
                    'recommendation_reason': 'Popular among other users'
                })
            
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating collaborative recommendations: {str(e)}")
            return []
    
    def _calculate_product_score(self, product: Product, profile: UserBehaviorProfile) -> float:
        """Calculate recommendation score for a product based on user profile"""
        score = 0.5  # Base score
        
        # Category preference
        if profile.preferred_categories and str(product.category_id) in profile.preferred_categories:
            score += 0.3
        
        # Brand preference
        if profile.preferred_brands and product.brand_id and str(product.brand_id) in profile.preferred_brands:
            score += 0.2
        
        # Price sensitivity
        if profile.avg_order_value:
            price_ratio = product.price / profile.avg_order_value
            if profile.price_sensitivity and profile.price_sensitivity < 0.5:
                # Low price sensitivity - prefer higher priced items
                if price_ratio > 1.2:
                    score += 0.1
            elif profile.price_sensitivity and profile.price_sensitivity > 0.7:
                # High price sensitivity - prefer lower priced items
                if price_ratio < 0.8:
                    score += 0.1
        
        return min(1.0, score)
    
    def _get_recommendation_reason(self, product: Product, profile: UserBehaviorProfile) -> str:
        """Get human-readable reason for recommendation"""
        reasons = []
        
        if profile.preferred_categories and str(product.category_id) in profile.preferred_categories:
            reasons.append("matches your preferred categories")
        
        if profile.preferred_brands and product.brand_id and str(product.brand_id) in profile.preferred_brands:
            reasons.append("from your favorite brands")
        
        if profile.avg_order_value and product.price <= profile.avg_order_value * 1.1:
            reasons.append("fits your budget")
        
        if not reasons:
            return "recommended for you"
        
        return f"recommended because it {' and '.join(reasons)}"
    
    async def _log_recommendations(
        self,
        user_id: Optional[str],
        session_id: str,
        recommendations: List[Dict[str, Any]],
        recommendation_type: str
    ) -> None:
        """Log recommendations for performance tracking"""
        try:
            recommendation_log = RecommendationLog(
                user_id=user_id,
                session_id=session_id,
                recommendation_type=recommendation_type,
                recommendation_algorithm="hybrid",
                recommendation_score=sum(r.get('recommendation_score', 0) for r in recommendations) / len(recommendations),
                recommendation_position=0,
                recommended_items=[r['id'] for r in recommendations],
                context_data={'user_segment': 'personalized'},
                user_segment='personalized'
            )
            
            self.db.add(recommendation_log)
            await self.db.commit()
            
        except Exception as e:
            self.logger.error(f"Error logging recommendations: {str(e)}")
            await self.db.rollback()
