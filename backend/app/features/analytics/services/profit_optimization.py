from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc, text
from datetime import datetime, timedelta
import json
import math
from collections import defaultdict, Counter
import asyncio
from app.features.analytics.models.user_activity import (
    UserActivity, UserBehaviorProfile, ActivityType
)
from app.features.products.models.product import Product
from app.features.orders.models.order import Order
# from app.features.orders.models.order_item import OrderItem  # Not available yet
from app.core.logging import get_logger

logger = get_logger("profit_optimization")

class ProfitOptimizationEngine:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.logger = logger
    
    async def analyze_user_value_segments(self) -> Dict[str, Any]:
        """Analyze users by value segments for targeted marketing"""
        try:
            # Get user value analysis
            value_analysis = await self._get_user_value_analysis()
            
            # Get segment recommendations
            segment_recommendations = await self._get_segment_recommendations(value_analysis)
            
            # Get profit optimization strategies
            optimization_strategies = await self._get_optimization_strategies(value_analysis)
            
            return {
                'value_analysis': value_analysis,
                'segment_recommendations': segment_recommendations,
                'optimization_strategies': optimization_strategies,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing user value segments: {str(e)}")
            return {}
    
    async def _get_user_value_analysis(self) -> Dict[str, Any]:
        """Get comprehensive user value analysis"""
        try:
            # Get user behavior profiles with purchase data
            profiles_query = select(UserBehaviorProfile).where(
                UserBehaviorProfile.total_orders > 0
            )
            result = await self.db.execute(profiles_query)
            profiles = result.scalars().all()
            
            if not profiles:
                return {'error': 'No user data available'}
            
            # Calculate value segments
            segments = {
                'high_value': [],
                'medium_value': [],
                'low_value': [],
                'at_risk': [],
                'churned': []
            }
            
            total_revenue = 0
            total_users = len(profiles)
            
            for profile in profiles:
                total_revenue += profile.total_spent or 0
                
                # Segment users based on value and behavior
                if profile.customer_lifecycle_stage == 'churned':
                    segments['churned'].append(profile)
                elif profile.customer_lifecycle_stage == 'at_risk':
                    segments['at_risk'].append(profile)
                elif (profile.customer_lifetime_value or 0) > 1000:
                    segments['high_value'].append(profile)
                elif (profile.customer_lifetime_value or 0) > 200:
                    segments['medium_value'].append(profile)
                else:
                    segments['low_value'].append(profile)
            
            # Calculate segment metrics
            segment_metrics = {}
            for segment_name, segment_users in segments.items():
                if segment_users:
                    segment_metrics[segment_name] = {
                        'count': len(segment_users),
                        'percentage': (len(segment_users) / total_users) * 100,
                        'avg_lifetime_value': sum(u.customer_lifetime_value or 0 for u in segment_users) / len(segment_users),
                        'avg_order_value': sum(u.avg_order_value or 0 for u in segment_users) / len(segment_users),
                        'avg_orders': sum(u.total_orders or 0 for u in segment_users) / len(segment_users),
                        'total_revenue': sum(u.customer_lifetime_value or 0 for u in segment_users)
                    }
            
            # Calculate overall metrics
            avg_lifetime_value = total_revenue / total_users if total_users > 0 else 0
            
            return {
                'total_users': total_users,
                'total_revenue': total_revenue,
                'avg_lifetime_value': avg_lifetime_value,
                'segments': segment_metrics,
                'revenue_distribution': {
                    'high_value_pct': (segment_metrics.get('high_value', {}).get('total_revenue', 0) / total_revenue * 100) if total_revenue > 0 else 0,
                    'medium_value_pct': (segment_metrics.get('medium_value', {}).get('total_revenue', 0) / total_revenue * 100) if total_revenue > 0 else 0,
                    'low_value_pct': (segment_metrics.get('low_value', {}).get('total_revenue', 0) / total_revenue * 100) if total_revenue > 0 else 0
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error getting user value analysis: {str(e)}")
            return {}
    
    async def _get_segment_recommendations(self, value_analysis: Dict[str, Any]) -> Dict[str, List[str]]:
        """Get recommendations for each user segment"""
        recommendations = {
            'high_value': [
                "Offer exclusive premium products and early access to new releases",
                "Implement VIP customer service and priority support",
                "Create personalized luxury bundles with higher margins",
                "Send personalized product recommendations based on purchase history",
                "Offer loyalty rewards and exclusive discounts"
            ],
            'medium_value': [
                "Increase engagement with targeted email campaigns",
                "Offer bundle deals to increase average order value",
                "Implement cross-selling strategies for complementary products",
                "Create seasonal promotions and limited-time offers",
                "Provide personalized product recommendations"
            ],
            'low_value': [
                "Focus on retention with welcome offers and onboarding",
                "Implement price-sensitive product recommendations",
                "Create budget-friendly bundles and deals",
                "Increase engagement through content marketing",
                "Offer referral incentives to expand customer base"
            ],
            'at_risk': [
                "Implement win-back campaigns with special offers",
                "Send personalized re-engagement emails",
                "Offer exclusive discounts and limited-time deals",
                "Provide customer support to address any issues",
                "Create personalized product recommendations based on past behavior"
            ],
            'churned': [
                "Implement re-activation campaigns",
                "Offer significant discounts and incentives",
                "Send personalized win-back offers",
                "Create targeted social media campaigns",
                "Provide exceptional customer service for any inquiries"
            ]
        }
        
        return recommendations
    
    async def _get_optimization_strategies(self, value_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Get profit optimization strategies based on analysis"""
        try:
            strategies = {
                'pricing_optimization': await self._get_pricing_optimization(),
                'inventory_optimization': await self._get_inventory_optimization(),
                'marketing_optimization': await self._get_marketing_optimization(),
                'bundle_optimization': await self._get_bundle_optimization(),
                'retention_optimization': await self._get_retention_optimization()
            }
            
            return strategies
            
        except Exception as e:
            self.logger.error(f"Error getting optimization strategies: {str(e)}")
            return {}
    
    async def _get_pricing_optimization(self) -> Dict[str, Any]:
        """Get pricing optimization recommendations"""
        try:
            # Get products with high margins
            high_margin_products = await self._get_high_margin_products()
            
            # Get products with low margins
            low_margin_products = await self._get_low_margin_products()
            
            # Get price elasticity analysis
            price_elasticity = await self._get_price_elasticity_analysis()
            
            return {
                'high_margin_products': high_margin_products,
                'low_margin_products': low_margin_products,
                'price_elasticity': price_elasticity,
                'recommendations': [
                    "Increase prices on high-margin products by 5-10%",
                    "Create premium bundles with high-margin products",
                    "Implement dynamic pricing based on demand",
                    "Offer volume discounts for low-margin products",
                    "Test price points for new products"
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Error getting pricing optimization: {str(e)}")
            return {}
    
    async def _get_inventory_optimization(self) -> Dict[str, Any]:
        """Get inventory optimization recommendations"""
        try:
            # Get fast-moving products
            fast_moving = await self._get_fast_moving_products()
            
            # Get slow-moving products
            slow_moving = await self._get_slow_moving_products()
            
            # Get seasonal trends
            seasonal_trends = await self._get_seasonal_trends()
            
            return {
                'fast_moving_products': fast_moving,
                'slow_moving_products': slow_moving,
                'seasonal_trends': seasonal_trends,
                'recommendations': [
                    "Increase inventory for fast-moving products",
                    "Create clearance campaigns for slow-moving products",
                    "Implement just-in-time inventory for seasonal products",
                    "Use predictive analytics for demand forecasting",
                    "Create bundle deals for slow-moving products"
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Error getting inventory optimization: {str(e)}")
            return {}
    
    async def _get_marketing_optimization(self) -> Dict[str, Any]:
        """Get marketing optimization recommendations"""
        try:
            # Get customer acquisition cost analysis
            cac_analysis = await self._get_cac_analysis()
            
            # Get channel performance
            channel_performance = await self._get_channel_performance()
            
            # Get customer lifetime value by channel
            clv_by_channel = await self._get_clv_by_channel()
            
            return {
                'cac_analysis': cac_analysis,
                'channel_performance': channel_performance,
                'clv_by_channel': clv_by_channel,
                'recommendations': [
                    "Focus marketing spend on high-ROI channels",
                    "Implement retargeting campaigns for high-value segments",
                    "Create personalized email campaigns",
                    "Use social proof and reviews in marketing",
                    "Implement referral programs for customer acquisition"
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Error getting marketing optimization: {str(e)}")
            return {}
    
    async def _get_bundle_optimization(self) -> Dict[str, Any]:
        """Get bundle optimization recommendations"""
        try:
            # Get bundle performance analysis
            bundle_performance = await self._get_bundle_performance()
            
            # Get cross-selling opportunities
            cross_sell_opportunities = await self._get_cross_sell_opportunities()
            
            return {
                'bundle_performance': bundle_performance,
                'cross_sell_opportunities': cross_sell_opportunities,
                'recommendations': [
                    "Create more bundles with high-performing product combinations",
                    "Implement dynamic bundle pricing based on demand",
                    "Use AI to identify optimal bundle combinations",
                    "Create seasonal bundles for trending products",
                    "Implement bundle recommendations in cart"
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Error getting bundle optimization: {str(e)}")
            return {}
    
    async def _get_retention_optimization(self) -> Dict[str, Any]:
        """Get retention optimization recommendations"""
        try:
            # Get churn analysis
            churn_analysis = await self._get_churn_analysis()
            
            # Get retention strategies
            retention_strategies = await self._get_retention_strategies()
            
            return {
                'churn_analysis': churn_analysis,
                'retention_strategies': retention_strategies,
                'recommendations': [
                    "Implement win-back campaigns for at-risk customers",
                    "Create loyalty programs with tiered benefits",
                    "Send personalized re-engagement emails",
                    "Provide exceptional customer service",
                    "Create exclusive offers for loyal customers"
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Error getting retention optimization: {str(e)}")
            return {}
    
    async def _get_high_margin_products(self) -> List[Dict[str, Any]]:
        """Get products with high profit margins"""
        try:
            # This would typically query a products table with margin information
            # For now, we'll use price as a proxy for margin
            query = select(Product).where(
                and_(
                    Product.is_active == True,
                    Product.price > 100
                )
            ).order_by(desc(Product.price)).limit(10)
            
            result = await self.db.execute(query)
            products = result.scalars().all()
            
            return [
                {
                    'id': str(product.id),
                    'name': product.name,
                    'price': float(product.price),
                    'category_id': str(product.category_id),
                    'margin_estimate': 'high'
                }
                for product in products
            ]
            
        except Exception as e:
            self.logger.error(f"Error getting high margin products: {str(e)}")
            return []
    
    async def _get_low_margin_products(self) -> List[Dict[str, Any]]:
        """Get products with low profit margins"""
        try:
            query = select(Product).where(
                and_(
                    Product.is_active == True,
                    Product.price < 50
                )
            ).order_by(asc(Product.price)).limit(10)
            
            result = await self.db.execute(query)
            products = result.scalars().all()
            
            return [
                {
                    'id': str(product.id),
                    'name': product.name,
                    'price': float(product.price),
                    'category_id': str(product.category_id),
                    'margin_estimate': 'low'
                }
                for product in products
            ]
            
        except Exception as e:
            self.logger.error(f"Error getting low margin products: {str(e)}")
            return []
    
    async def _get_price_elasticity_analysis(self) -> Dict[str, Any]:
        """Get price elasticity analysis"""
        try:
            # This would typically analyze price changes vs demand
            # For now, we'll return a mock analysis
            return {
                'elastic_products': ['electronics', 'luxury_items'],
                'inelastic_products': ['necessities', 'branded_items'],
                'recommendations': [
                    "Test price increases on inelastic products",
                    "Use promotions for elastic products",
                    "Implement dynamic pricing for seasonal items"
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Error getting price elasticity analysis: {str(e)}")
            return {}
    
    async def _get_fast_moving_products(self) -> List[Dict[str, Any]]:
        """Get fast-moving products"""
        try:
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            query = select(
                Product.id,
                Product.name,
                Product.price,
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
                Product.id, Product.name, Product.price
            ).order_by(
                desc('activity_count')
            ).limit(10)
            
            result = await self.db.execute(query)
            fast_moving = result.fetchall()
            
            return [
                {
                    'id': str(product.id),
                    'name': product.name,
                    'price': float(product.price),
                    'activity_count': product.activity_count
                }
                for product in fast_moving
            ]
            
        except Exception as e:
            self.logger.error(f"Error getting fast moving products: {str(e)}")
            return []
    
    async def _get_slow_moving_products(self) -> List[Dict[str, Any]]:
        """Get slow-moving products"""
        try:
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            query = select(
                Product.id,
                Product.name,
                Product.price,
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
                Product.id, Product.name, Product.price
            ).order_by(
                asc('activity_count')
            ).limit(10)
            
            result = await self.db.execute(query)
            slow_moving = result.fetchall()
            
            return [
                {
                    'id': str(product.id),
                    'name': product.name,
                    'price': float(product.price),
                    'activity_count': product.activity_count
                }
                for product in slow_moving
            ]
            
        except Exception as e:
            self.logger.error(f"Error getting slow moving products: {str(e)}")
            return []
    
    async def _get_seasonal_trends(self) -> Dict[str, Any]:
        """Get seasonal trends analysis"""
        try:
            current_month = datetime.utcnow().month
            seasonal_categories = self._get_seasonal_categories(current_month)
            
            return {
                'current_season': self._get_season_name(current_month),
                'trending_categories': seasonal_categories,
                'recommendations': [
                    f"Focus on {category} products this season" for category in seasonal_categories
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Error getting seasonal trends: {str(e)}")
            return {}
    
    async def _get_cac_analysis(self) -> Dict[str, Any]:
        """Get customer acquisition cost analysis"""
        try:
            # This would typically calculate CAC by channel
            # For now, we'll return mock data
            return {
                'organic_search': {'cac': 25, 'conversion_rate': 0.03},
                'paid_search': {'cac': 45, 'conversion_rate': 0.05},
                'social_media': {'cac': 35, 'conversion_rate': 0.04},
                'email_marketing': {'cac': 15, 'conversion_rate': 0.08},
                'referrals': {'cac': 10, 'conversion_rate': 0.12}
            }
            
        except Exception as e:
            self.logger.error(f"Error getting CAC analysis: {str(e)}")
            return {}
    
    async def _get_channel_performance(self) -> Dict[str, Any]:
        """Get channel performance analysis"""
        try:
            # This would typically analyze performance by channel
            # For now, we'll return mock data
            return {
                'organic_search': {'revenue': 50000, 'orders': 200, 'avg_order_value': 250},
                'paid_search': {'revenue': 75000, 'orders': 300, 'avg_order_value': 250},
                'social_media': {'revenue': 30000, 'orders': 150, 'avg_order_value': 200},
                'email_marketing': {'revenue': 40000, 'orders': 200, 'avg_order_value': 200},
                'referrals': {'revenue': 25000, 'orders': 100, 'avg_order_value': 250}
            }
            
        except Exception as e:
            self.logger.error(f"Error getting channel performance: {str(e)}")
            return {}
    
    async def _get_clv_by_channel(self) -> Dict[str, Any]:
        """Get customer lifetime value by channel"""
        try:
            # This would typically calculate CLV by acquisition channel
            # For now, we'll return mock data
            return {
                'organic_search': {'avg_clv': 500, 'retention_rate': 0.7},
                'paid_search': {'avg_clv': 450, 'retention_rate': 0.6},
                'social_media': {'avg_clv': 350, 'retention_rate': 0.5},
                'email_marketing': {'avg_clv': 600, 'retention_rate': 0.8},
                'referrals': {'avg_clv': 700, 'retention_rate': 0.9}
            }
            
        except Exception as e:
            self.logger.error(f"Error getting CLV by channel: {str(e)}")
            return {}
    
    async def _get_bundle_performance(self) -> Dict[str, Any]:
        """Get bundle performance analysis"""
        try:
            # This would typically analyze bundle performance
            # For now, we'll return mock data
            return {
                'complementary_bundles': {'conversion_rate': 0.15, 'avg_revenue': 150},
                'seasonal_bundles': {'conversion_rate': 0.12, 'avg_revenue': 120},
                'promotional_bundles': {'conversion_rate': 0.25, 'avg_revenue': 200},
                'cross_sell_bundles': {'conversion_rate': 0.18, 'avg_revenue': 180},
                'upsell_bundles': {'conversion_rate': 0.08, 'avg_revenue': 300}
            }
            
        except Exception as e:
            self.logger.error(f"Error getting bundle performance: {str(e)}")
            return {}
    
    async def _get_cross_sell_opportunities(self) -> List[Dict[str, Any]]:
        """Get cross-sell opportunities"""
        try:
            # This would typically identify cross-sell opportunities
            # For now, we'll return mock data
            return [
                {
                    'product_id': 'prod_1',
                    'product_name': 'Product A',
                    'cross_sell_products': ['prod_2', 'prod_3'],
                    'opportunity_score': 0.8,
                    'expected_revenue': 100
                },
                {
                    'product_id': 'prod_2',
                    'product_name': 'Product B',
                    'cross_sell_products': ['prod_1', 'prod_4'],
                    'opportunity_score': 0.7,
                    'expected_revenue': 80
                }
            ]
            
        except Exception as e:
            self.logger.error(f"Error getting cross-sell opportunities: {str(e)}")
            return []
    
    async def _get_churn_analysis(self) -> Dict[str, Any]:
        """Get churn analysis"""
        try:
            # This would typically analyze churn patterns
            # For now, we'll return mock data
            return {
                'churn_rate': 0.15,
                'at_risk_customers': 50,
                'churn_reasons': {
                    'price_sensitivity': 0.4,
                    'poor_experience': 0.3,
                    'competitor_switching': 0.2,
                    'lifecycle_changes': 0.1
                },
                'retention_strategies': [
                    'Implement win-back campaigns',
                    'Offer personalized discounts',
                    'Improve customer service',
                    'Create loyalty programs'
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Error getting churn analysis: {str(e)}")
            return {}
    
    async def _get_retention_strategies(self) -> List[Dict[str, Any]]:
        """Get retention strategies"""
        try:
            return [
                {
                    'strategy': 'Personalized Email Campaigns',
                    'description': 'Send targeted emails based on user behavior',
                    'expected_impact': '15% increase in retention',
                    'implementation_effort': 'medium'
                },
                {
                    'strategy': 'Loyalty Program',
                    'description': 'Implement points-based loyalty program',
                    'expected_impact': '25% increase in retention',
                    'implementation_effort': 'high'
                },
                {
                    'strategy': 'Win-back Campaigns',
                    'description': 'Target at-risk customers with special offers',
                    'expected_impact': '20% reduction in churn',
                    'implementation_effort': 'low'
                }
            ]
            
        except Exception as e:
            self.logger.error(f"Error getting retention strategies: {str(e)}")
            return []
    
    def _get_seasonal_categories(self, month: int) -> List[str]:
        """Get seasonal categories based on current month"""
        seasonal_map = {
            1: ['winter_clothing', 'heating', 'hot_beverages'],
            2: ['winter_clothing', 'heating', 'valentine_gifts'],
            3: ['spring_clothing', 'gardening', 'outdoor_gear'],
            4: ['spring_clothing', 'gardening', 'outdoor_gear'],
            5: ['spring_clothing', 'gardening', 'outdoor_gear'],
            6: ['summer_clothing', 'swimming', 'outdoor_gear'],
            7: ['summer_clothing', 'swimming', 'outdoor_gear'],
            8: ['summer_clothing', 'swimming', 'outdoor_gear'],
            9: ['fall_clothing', 'back_to_school', 'outdoor_gear'],
            10: ['fall_clothing', 'halloween', 'outdoor_gear'],
            11: ['fall_clothing', 'thanksgiving', 'outdoor_gear'],
            12: ['winter_clothing', 'christmas', 'holiday_gifts']
        }
        
        return seasonal_map.get(month, ['general'])
    
    def _get_season_name(self, month: int) -> str:
        """Get season name based on month"""
        if month in [12, 1, 2]:
            return 'Winter'
        elif month in [3, 4, 5]:
            return 'Spring'
        elif month in [6, 7, 8]:
            return 'Summer'
        else:
            return 'Fall'
