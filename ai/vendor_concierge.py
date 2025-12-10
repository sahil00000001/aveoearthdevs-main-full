"""
Vendor Concierge Assistant - AI-powered vendor management and optimization
Enhanced with personalization, recommendations, and predictive capabilities
"""

import asyncio
import json
import logging
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque
import httpx
import os
from dataclasses import dataclass, asdict
from enum import Enum
from database_service import db_service

# Set up logging
logger = logging.getLogger("vendor_concierge")
logging.basicConfig(level=logging.INFO)

class UserSegment(Enum):
    NEW_VENDOR = "new_vendor"
    GROWING_VENDOR = "growing_vendor"
    ESTABLISHED_VENDOR = "established_vendor"
    PREMIUM_VENDOR = "premium_vendor"

class RecommendationType(Enum):
    PRODUCT_BUNDLE = "product_bundle"
    PRICING_OPTIMIZATION = "pricing_optimization"
    INVENTORY_MANAGEMENT = "inventory_management"
    MARKETING_STRATEGY = "marketing_strategy"
    SUSTAINABILITY_IMPROVEMENT = "sustainability_improvement"
    OPERATIONAL_EFFICIENCY = "operational_efficiency"

@dataclass
class UserProfile:
    vendor_id: str
    segment: UserSegment
    preferences: Dict[str, Any]
    behavior_patterns: Dict[str, Any]
    performance_history: List[Dict[str, Any]]
    interaction_history: List[Dict[str, Any]]
    last_updated: datetime
    learning_rate: float = 0.1
    confidence_score: float = 0.0

@dataclass
class Recommendation:
    id: str
    type: RecommendationType
    title: str
    description: str
    priority: str
    impact_score: float
    confidence: float
    expected_profit: float
    implementation_time: str
    success_probability: float
    personalized_reason: str
    action_items: List[str]
    created_at: datetime

@dataclass
class BundleRecommendation:
    id: str
    products: List[Dict[str, Any]]
    bundle_name: str
    expected_revenue: float
    profit_margin: float
    demand_forecast: float
    sustainability_score: float
    market_trend: str
    confidence: float
    personalized_factors: List[str]

class PersonalizationEngine:
    def __init__(self):
        self.recommendation_cache: Dict[str, List[Recommendation]] = {}
        self.bundle_cache: Dict[str, List[BundleRecommendation]] = {}
        self.market_trends: Dict[str, Any] = {}
        self.load_market_data()
    
    def load_market_data(self):
        """Load market trends and data"""
        # In production, this would load from external APIs or databases
        self.market_trends = {
            "trending_categories": ["sustainable_fashion", "eco_home", "organic_beauty"],
            "seasonal_trends": {
                "spring": ["gardening", "outdoor_gear", "renewable_energy"],
                "summer": ["solar_power", "water_conservation", "sustainable_travel"],
                "fall": ["eco_fashion", "energy_efficiency", "waste_reduction"],
                "winter": ["indoor_plants", "sustainable_heating", "eco_gifts"]
            },
            "price_sensitivity": 0.7,
            "sustainability_demand": 0.85
        }
    
    async def update_user_profile(self, vendor_id: str, interaction: Dict[str, Any]):
        """Update user profile based on new interaction"""
        # Log the interaction to database
        await db_service.log_interaction(
            vendor_id=vendor_id,
            interaction_type=interaction.get("type", "general"),
            interaction_data=interaction,
            session_id=interaction.get("session_id")
        )
        
        # Get or create user profile
        profile_data = await db_service.get_user_profile(vendor_id)
        if not profile_data:
            profile_data = await db_service.create_user_profile(vendor_id)
        
        # Update behavior patterns
        await self._update_behavior_patterns(vendor_id, interaction)
        
        # Update preferences
        await self._update_preferences(vendor_id, interaction)
        
        # Update segment based on performance
        await self._update_user_segment(vendor_id)
    
    async def _update_behavior_patterns(self, vendor_id: str, interaction: Dict[str, Any]):
        """Update user behavior patterns based on interaction"""
        # Get current profile
        profile_data = await db_service.get_user_profile(vendor_id)
        if not profile_data:
            return
        
        behavior_patterns = profile_data.get("behavior_patterns", {})
        interaction_type = interaction.get("type", "general")
        
        # Update behavior patterns
        if "behavior_patterns" not in behavior_patterns:
            behavior_patterns["behavior_patterns"] = {}
        
        behavior_patterns["behavior_patterns"][interaction_type] = behavior_patterns["behavior_patterns"].get(interaction_type, 0) + 1
        
        # Track time-based patterns
        hour = datetime.now().hour
        if "hourly_patterns" not in behavior_patterns:
            behavior_patterns["hourly_patterns"] = {}
        behavior_patterns["hourly_patterns"][str(hour)] = behavior_patterns["hourly_patterns"].get(str(hour), 0) + 1
        
        # Track feature usage
        if "feature_usage" in interaction:
            if "feature_usage" not in behavior_patterns:
                behavior_patterns["feature_usage"] = {}
            feature = interaction["feature_usage"]
            behavior_patterns["feature_usage"][feature] = behavior_patterns["feature_usage"].get(feature, 0) + 1
        
        # Update profile with new behavior patterns
        await db_service.update_user_profile(vendor_id, {"behavior_patterns": behavior_patterns})
    
    async def _update_preferences(self, vendor_id: str, interaction: Dict[str, Any]):
        """Update user preferences based on interaction"""
        if "preferences" not in interaction:
            return
        
        # Get current profile
        profile_data = await db_service.get_user_profile(vendor_id)
        if not profile_data:
            return
        
        preferences = profile_data.get("preferences", {})
        learning_rate = profile_data.get("learning_rate", 0.1)
        
        # Update preferences
        for key, value in interaction["preferences"].items():
            if key not in preferences:
                preferences[key] = value
            else:
                # Weighted average for preference learning
                current = preferences[key]
                if isinstance(current, (int, float)) and isinstance(value, (int, float)):
                    preferences[key] = (1 - learning_rate) * current + learning_rate * value
                else:
                    preferences[key] = value
        
        # Update profile with new preferences
        await db_service.update_user_profile(vendor_id, {"preferences": preferences})
    
    async def _update_user_segment(self, vendor_id: str):
        """Update user segment based on performance and behavior"""
        # Get performance history
        performance_history = await db_service.get_performance_history(vendor_id, days=90)
        if not performance_history:
            return
        
        # Calculate performance metrics
        recent_performance = performance_history[-30:] if len(performance_history) >= 30 else performance_history
        avg_revenue = np.mean([p.get("revenue", 0) for p in recent_performance])
        growth_rate = self._calculate_growth_rate(performance_history)
        
        # Determine segment based on metrics
        if avg_revenue < 1000 or len(performance_history) < 7:
            new_segment = "new_vendor"
        elif avg_revenue < 10000 or growth_rate < 0.1:
            new_segment = "growing_vendor"
        elif avg_revenue < 50000 or growth_rate < 0.2:
            new_segment = "established_vendor"
        else:
            new_segment = "premium_vendor"
        
        # Update segment if changed
        profile_data = await db_service.get_user_profile(vendor_id)
        if profile_data and profile_data.get("segment") != new_segment:
            await db_service.update_user_profile(vendor_id, {"segment": new_segment})
    
    def _calculate_growth_rate(self, performance_history: List[Dict[str, Any]]) -> float:
        """Calculate growth rate from performance history"""
        if len(performance_history) < 2:
            return 0.0
        
        revenues = [p.get("revenue", 0) for p in performance_history]
        if len(revenues) < 2:
            return 0.0
        
        # Calculate month-over-month growth rate
        recent_avg = np.mean(revenues[-3:]) if len(revenues) >= 3 else revenues[-1]
        older_avg = np.mean(revenues[:-3]) if len(revenues) >= 6 else revenues[0]
        
        if older_avg == 0:
            return 1.0 if recent_avg > 0 else 0.0
        
        return (recent_avg - older_avg) / older_avg

class RecommendationEngine:
    def __init__(self, personalization_engine: PersonalizationEngine):
        self.personalization_engine = personalization_engine
        self.market_data = {}
        self.load_market_data()
    
    def load_market_data(self):
        """Load market trends and data"""
        # In production, this would load from external APIs or databases
        self.market_data = {
            "trending_categories": ["sustainable_fashion", "eco_home", "organic_beauty"],
            "seasonal_trends": {
                "spring": ["gardening", "outdoor_gear", "renewable_energy"],
                "summer": ["solar_power", "water_conservation", "sustainable_travel"],
                "fall": ["eco_fashion", "energy_efficiency", "waste_reduction"],
                "winter": ["indoor_plants", "sustainable_heating", "eco_gifts"]
            },
            "price_sensitivity": 0.7,  # Market price sensitivity factor
            "sustainability_demand": 0.85  # Growing demand for sustainable products
        }
    
    async def generate_personalized_recommendations(self, vendor_id: str, context: Dict[str, Any]) -> List[Recommendation]:
        """Generate personalized recommendations based on user profile and context"""
        profile_data = await db_service.get_user_profile(vendor_id)
        if not profile_data:
            return await self._generate_default_recommendations(vendor_id, context)
        
        recommendations = []
        
        # Generate recommendations based on user segment
        segment = profile_data.get("segment", "new_vendor")
        if segment == "new_vendor":
            recommendations.extend(await self._generate_new_vendor_recommendations(profile_data, context))
        elif segment == "growing_vendor":
            recommendations.extend(await self._generate_growing_vendor_recommendations(profile_data, context))
        elif segment == "established_vendor":
            recommendations.extend(await self._generate_established_vendor_recommendations(profile_data, context))
        else:  # premium_vendor
            recommendations.extend(await self._generate_premium_vendor_recommendations(profile_data, context))
        
        # Add personalized recommendations based on behavior patterns
        recommendations.extend(await self._generate_behavior_based_recommendations(profile_data, context))
        
        # Sort by impact score and confidence
        recommendations.sort(key=lambda x: (x.impact_score * x.confidence), reverse=True)
        
        # Save recommendations to database
        for rec in recommendations[:10]:
            await db_service.save_recommendation(vendor_id, asdict(rec))
        
        return recommendations[:10]  # Return top 10 recommendations
    
    async def _generate_new_vendor_recommendations(self, profile_data: Dict[str, Any], context: Dict[str, Any]) -> List[Recommendation]:
        """Generate recommendations for new vendors"""
        recommendations = []
        
        # Product optimization
        recommendations.append(Recommendation(
            id=f"new_vendor_{datetime.now().timestamp()}",
            type=RecommendationType.PRODUCT_BUNDLE,
            title="Optimize Your First Product Listings",
            description="Focus on creating compelling product descriptions with high-quality images and clear sustainability benefits",
            priority="high",
            impact_score=0.8,
            confidence=0.9,
            expected_profit=500.0,
            implementation_time="2-3 hours",
            success_probability=0.85,
            personalized_reason="New vendors typically see 40% higher conversion rates with optimized listings",
            action_items=[
                "Write detailed product descriptions",
                "Add high-quality product images",
                "Highlight sustainability features",
                "Set competitive pricing"
            ],
            created_at=datetime.now()
        ))
        
        # Marketing strategy
        recommendations.append(Recommendation(
            id=f"marketing_{datetime.now().timestamp()}",
            type=RecommendationType.MARKETING_STRATEGY,
            title="Build Your Brand Presence",
            description="Create a strong brand identity and start building customer trust through consistent messaging",
            priority="high",
            impact_score=0.7,
            confidence=0.8,
            expected_profit=300.0,
            implementation_time="1-2 days",
            success_probability=0.75,
            personalized_reason="New vendors need strong branding to compete effectively",
            action_items=[
                "Create brand guidelines",
                "Develop consistent messaging",
                "Set up social media presence",
                "Write compelling vendor bio"
            ],
            created_at=datetime.now()
        ))
        
        return recommendations
    
    async def _generate_growing_vendor_recommendations(self, profile_data: Dict[str, Any], context: Dict[str, Any]) -> List[Recommendation]:
        """Generate recommendations for growing vendors"""
        recommendations = []
        
        # Inventory management
        recommendations.append(Recommendation(
            id=f"inventory_{datetime.now().timestamp()}",
            type=RecommendationType.INVENTORY_MANAGEMENT,
            title="Implement Smart Inventory Management",
            description="Use data-driven insights to optimize stock levels and reduce carrying costs",
            priority="medium",
            impact_score=0.6,
            confidence=0.8,
            expected_profit=800.0,
            implementation_time="1 week",
            success_probability=0.8,
            personalized_reason="Growing vendors often struggle with inventory optimization",
            action_items=[
                "Analyze sales patterns",
                "Set up automated reorder points",
                "Implement ABC analysis",
                "Optimize storage costs"
            ],
            created_at=datetime.now()
        ))
        
        return recommendations
    
    async def _generate_established_vendor_recommendations(self, profile_data: Dict[str, Any], context: Dict[str, Any]) -> List[Recommendation]:
        """Generate recommendations for established vendors"""
        recommendations = []
        
        # Advanced bundling
        recommendations.append(Recommendation(
            id=f"bundling_{datetime.now().timestamp()}",
            type=RecommendationType.PRODUCT_BUNDLE,
            title="Create High-Value Product Bundles",
            description="Develop strategic product bundles to increase average order value and customer satisfaction",
            priority="high",
            impact_score=0.9,
            confidence=0.85,
            expected_profit=2000.0,
            implementation_time="2-3 days",
            success_probability=0.9,
            personalized_reason="Established vendors have the product range for effective bundling",
            action_items=[
                "Analyze customer purchase patterns",
                "Identify complementary products",
                "Create bundle packages",
                "Test pricing strategies"
            ],
            created_at=datetime.now()
        ))
        
        return recommendations
    
    async def _generate_premium_vendor_recommendations(self, profile_data: Dict[str, Any], context: Dict[str, Any]) -> List[Recommendation]:
        """Generate recommendations for premium vendors"""
        recommendations = []
        
        # Advanced analytics
        recommendations.append(Recommendation(
            id=f"analytics_{datetime.now().timestamp()}",
            type=RecommendationType.OPERATIONAL_EFFICIENCY,
            title="Implement Advanced Analytics Dashboard",
            description="Use predictive analytics to forecast demand and optimize operations",
            priority="medium",
            impact_score=0.8,
            confidence=0.9,
            expected_profit=5000.0,
            implementation_time="1-2 weeks",
            success_probability=0.85,
            personalized_reason="Premium vendors can benefit from advanced analytics for optimization",
            action_items=[
                "Set up predictive models",
                "Implement demand forecasting",
                "Create performance dashboards",
                "Automate decision making"
            ],
            created_at=datetime.now()
        ))
        
        return recommendations
    
    async def _generate_behavior_based_recommendations(self, profile_data: Dict[str, Any], context: Dict[str, Any]) -> List[Recommendation]:
        """Generate recommendations based on user behavior patterns"""
        recommendations = []
        
        # Analyze behavior patterns
        behavior_patterns = profile_data.get("behavior_patterns", {}).get("behavior_patterns", {})
        feature_usage = profile_data.get("behavior_patterns", {}).get("feature_usage", {})
        
        # If user frequently asks about inventory
        if behavior_patterns.get("inventory_query", 0) > 3:
            recommendations.append(Recommendation(
                id=f"inventory_behavior_{datetime.now().timestamp()}",
                type=RecommendationType.INVENTORY_MANAGEMENT,
                title="Automate Your Inventory Alerts",
                description="Based on your frequent inventory questions, consider setting up automated low-stock alerts",
                priority="medium",
                impact_score=0.6,
                confidence=0.7,
                expected_profit=400.0,
                implementation_time="30 minutes",
                success_probability=0.8,
                personalized_reason="You frequently ask about inventory, suggesting this would be valuable",
                action_items=[
                    "Set up low-stock alerts",
                    "Configure reorder points",
                    "Enable email notifications"
                ],
                created_at=datetime.now()
            ))
        
        return recommendations
    
    async def _generate_default_recommendations(self, vendor_id: str, context: Dict[str, Any]) -> List[Recommendation]:
        """Generate default recommendations for new users"""
        return [
            Recommendation(
                id=f"default_{datetime.now().timestamp()}",
                type=RecommendationType.PRODUCT_BUNDLE,
                title="Welcome to AveoEarth Vendor Concierge",
                description="Let's start by analyzing your current performance and identifying growth opportunities",
                priority="high",
                impact_score=0.5,
                confidence=0.6,
                expected_profit=0.0,
                implementation_time="5 minutes",
                success_probability=0.9,
                personalized_reason="New user onboarding",
                action_items=[
                    "Complete vendor profile setup",
                    "Upload your first products",
                    "Set up payment methods",
                    "Configure shipping options"
                ],
                created_at=datetime.now()
            )
        ]
    
    async def generate_bundle_recommendations(self, vendor_id: str, products: List[Dict[str, Any]]) -> List[BundleRecommendation]:
        """Generate intelligent product bundle recommendations"""
        profile_data = await db_service.get_user_profile(vendor_id)
        bundles = []
        
        # Analyze product relationships
        product_categories = [p.get("category", "") for p in products]
        category_counts = defaultdict(int)
        for cat in product_categories:
            category_counts[cat] += 1
        
        # Generate bundles based on category combinations
        for category, count in category_counts.items():
            if count >= 2:  # Need at least 2 products in category
                category_products = [p for p in products if p.get("category") == category]
                
                # Create different bundle sizes
                for bundle_size in [2, 3, 4]:
                    if len(category_products) >= bundle_size:
                        bundle_products = category_products[:bundle_size]
                        
                        # Calculate bundle metrics
                        total_price = sum(p.get("price", 0) for p in bundle_products)
                        bundle_discount = 0.1  # 10% discount for bundles
                        bundle_price = total_price * (1 - bundle_discount)
                        
                        # Estimate demand based on individual product performance
                        avg_views = np.mean([p.get("views", 0) for p in bundle_products])
                        demand_forecast = avg_views * 0.1  # 10% of views convert to bundle interest
                        
                        bundles.append(BundleRecommendation(
                            id=f"bundle_{category}_{bundle_size}_{datetime.now().timestamp()}",
                            products=bundle_products,
                            bundle_name=f"{category.title()} Essentials Bundle",
                            expected_revenue=bundle_price * demand_forecast,
                            profit_margin=0.3,  # 30% profit margin
                            demand_forecast=demand_forecast,
                            sustainability_score=0.8,  # High for sustainable products
                            market_trend="growing",
                            confidence=0.7,
                            personalized_factors=[
                                f"Based on your {category} product performance",
                                "Matches current market trends",
                                "Optimized for your customer base"
                            ]
                        ))
        
        # Cross-category bundles
        if len(set(product_categories)) >= 2:
            # Find complementary categories
            complementary_pairs = [
                ("sustainable_fashion", "eco_accessories"),
                ("organic_beauty", "natural_skincare"),
                ("eco_home", "renewable_energy")
            ]
            
            for cat1, cat2 in complementary_pairs:
                cat1_products = [p for p in products if p.get("category") == cat1]
                cat2_products = [p for p in products if p.get("category") == cat2]
                
                if cat1_products and cat2_products:
                    # Create cross-category bundle
                    bundle_products = [cat1_products[0], cat2_products[0]]
                    total_price = sum(p.get("price", 0) for p in bundle_products)
                    bundle_price = total_price * 0.85  # 15% discount
                    
                    bundles.append(BundleRecommendation(
                        id=f"cross_bundle_{cat1}_{cat2}_{datetime.now().timestamp()}",
                        products=bundle_products,
                        bundle_name=f"{cat1.replace('_', ' ').title()} & {cat2.replace('_', ' ').title()} Combo",
                        expected_revenue=bundle_price * 5,  # Estimate 5 sales per month
                        profit_margin=0.35,
                        demand_forecast=5.0,
                        sustainability_score=0.9,
                        market_trend="trending",
                        confidence=0.8,
                        personalized_factors=[
                            "Cross-category appeal increases market reach",
                            "Complementary products enhance customer value",
                            "Higher profit margin potential"
                        ]
                    ))
        
        # Sort by expected revenue and confidence
        bundles.sort(key=lambda x: x.expected_revenue * x.confidence, reverse=True)
        
        # Save bundle recommendations to database
        for bundle in bundles[:5]:
            await db_service.save_bundle_recommendation(vendor_id, asdict(bundle))
        
        return bundles[:5]  # Return top 5 bundle recommendations

class VendorConciergeService:
    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url
        self.client = httpx.AsyncClient(timeout=30.0)
        self.personalization_engine = PersonalizationEngine()
        self.recommendation_engine = RecommendationEngine(self.personalization_engine)
    
    async def get_vendor_analytics(self, vendor_id: str, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive vendor analytics with personalization"""
        try:
            response = await self.client.get(
                f"{self.backend_url}/supplier/products/analytics/overview",
                params={"days": days},
                headers={"Authorization": f"Bearer {vendor_id}"}
            )
            if response.status_code == 200:
                analytics = response.json()
                
                # Update user profile with analytics data
                await self.personalization_engine.update_user_profile(vendor_id, {
                    "type": "analytics_view",
                    "data": analytics,
                    "timestamp": datetime.now().isoformat()
                })
                
                return analytics
        except Exception as e:
            logger.error(f"Failed to get vendor analytics: {e}")
        return {}
    
    async def get_vendor_products(self, vendor_id: str, status: str = "all") -> List[Dict[str, Any]]:
        """Get vendor's product catalog with enhanced data"""
        try:
            response = await self.client.get(
                f"{self.backend_url}/supplier/products/",
                params={"status": status, "limit": 100},
                headers={"Authorization": f"Bearer {vendor_id}"}
            )
            if response.status_code == 200:
                data = response.json()
                products = data.get("items", [])
                
                # Update user profile with product data
                await self.personalization_engine.update_user_profile(vendor_id, {
                    "type": "product_view",
                    "product_count": len(products),
                    "status": status,
                    "timestamp": datetime.now().isoformat()
                })
                
                return products
        except Exception as e:
            logger.error(f"Failed to get vendor products: {e}")
        return []
    
    async def get_vendor_orders(self, vendor_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get recent vendor orders with performance tracking"""
        try:
            response = await self.client.get(
                f"{self.backend_url}/supplier/orders/orders",
                params={"limit": 50},
                headers={"Authorization": f"Bearer {vendor_id}"}
            )
            if response.status_code == 200:
                data = response.json()
                orders = data.get("items", [])
                
                # Update performance history
                if orders:
                    total_revenue = sum(order.get("total_amount", 0) for order in orders)
                    await self.personalization_engine.update_user_profile(vendor_id, {
                        "type": "performance_update",
                        "revenue": total_revenue,
                        "orders": len(orders),
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Log performance metrics to database
                    await db_service.log_performance(vendor_id, {
                        "revenue": total_revenue,
                        "orders": len(orders),
                        "products": 0,  # Will be updated when products are fetched
                        "active_products": 0,
                        "avg_order_value": total_revenue / len(orders) if orders else 0,
                        "low_stock_count": 0,
                        "pending_orders": len([o for o in orders if o.get("fulfillment_status") == "pending"])
                    })
                
                return orders
        except Exception as e:
            logger.error(f"Failed to get vendor orders: {e}")
        return []
    
    async def get_low_stock_products(self, vendor_id: str) -> List[Dict[str, Any]]:
        """Get products with low stock"""
        try:
            response = await self.client.get(
                f"{self.backend_url}/supplier/products/inventory/low-stock",
                headers={"Authorization": f"Bearer {vendor_id}"}
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("low_stock_products", [])
        except Exception as e:
            logger.error(f"Failed to get low stock products: {e}")
        return []
    
    async def analyze_vendor_performance(self, vendor_id: str) -> Dict[str, Any]:
        """Comprehensive vendor performance analysis with personalization"""
        analytics = await self.get_vendor_analytics(vendor_id)
        products = await self.get_vendor_products(vendor_id)
        orders = await self.get_vendor_orders(vendor_id)
        low_stock = await self.get_low_stock_products(vendor_id)
        
        # Calculate key metrics
        total_products = len(products)
        active_products = len([p for p in products if p.get("status") == "active"])
        total_revenue = analytics.get("total_revenue", 0)
        total_orders = analytics.get("total_orders", 0)
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Get personalized recommendations
        context = {
            "analytics": analytics,
            "products": products,
            "orders": orders,
            "low_stock": low_stock
        }
        
        recommendations = await self.recommendation_engine.generate_personalized_recommendations(vendor_id, context)
        
        # Performance insights with personalization
        insights = []
        profile_data = await db_service.get_user_profile(vendor_id)
        
        if profile_data:
            segment = profile_data.get("segment", "new_vendor")
            insights.append(f"Based on your {segment} status, here are personalized insights:")
        
        # Product performance insights
        if active_products / total_products < 0.8:
            insights.append("Low product activation rate - consider reviewing inactive products")
        
        # Revenue insights
        if total_revenue < 10000:
            insights.append("Revenue below growth threshold")
        
        # Inventory insights
        if len(low_stock) > 0:
            insights.append(f"{len(low_stock)} products are low in stock")
        
        # Order fulfillment insights
        pending_orders = len([o for o in orders if o.get("fulfillment_status") == "pending"])
        if pending_orders > 5:
            insights.append(f"{pending_orders} orders pending fulfillment")
        
        return {
            "vendor_id": vendor_id,
            "metrics": {
                "total_products": total_products,
                "active_products": active_products,
                "total_revenue": total_revenue,
                "total_orders": total_orders,
                "avg_order_value": avg_order_value,
                "low_stock_count": len(low_stock),
                "pending_orders": pending_orders
            },
            "insights": insights,
            "recommendations": [asdict(rec) for rec in recommendations],
            "low_stock_products": low_stock[:5],
            "recent_orders": orders[:5],
            "personalization": {
                "user_segment": profile_data.get("segment", "new_vendor") if profile_data else "new_vendor",
                "confidence_score": profile_data.get("confidence_score", 0.0) if profile_data else 0.0,
                "last_updated": profile_data.get("updated_at").isoformat() if profile_data and profile_data.get("updated_at") else None
            }
        }
    
    async def generate_business_recommendations(self, vendor_id: str) -> List[Dict[str, Any]]:
        """Generate AI-powered business recommendations with personalization"""
        context = await self.analyze_vendor_performance(vendor_id)
        recommendations = await self.recommendation_engine.generate_personalized_recommendations(vendor_id, context)
        
        return [asdict(rec) for rec in recommendations]
    
    async def generate_bundle_recommendations(self, vendor_id: str) -> List[Dict[str, Any]]:
        """Generate intelligent product bundle recommendations"""
        products = await self.get_vendor_products(vendor_id, "active")
        bundles = await self.recommendation_engine.generate_bundle_recommendations(vendor_id, products)
        
        return [asdict(bundle) for bundle in bundles]
    
    async def get_sustainability_insights(self, vendor_id: str) -> Dict[str, Any]:
        """Get sustainability performance insights and recommendations"""
        profile_data = await db_service.get_user_profile(vendor_id)
        
        # Base sustainability score
        base_score = 7.5
        
        # Adjust based on user behavior
        if profile_data:
            behavior_patterns = profile_data.get("behavior_patterns", {})
            sustainability_queries = behavior_patterns.get("behavior_patterns", {}).get("sustainability_query", 0)
            if sustainability_queries > 5:
                base_score += 1.0  # Reward interest in sustainability
        
        return {
            "current_score": min(base_score, 10.0),
            "improvements": [
                "Add more eco-friendly packaging options",
                "Obtain sustainability certifications",
                "Implement carbon offset programs",
                "Use renewable energy in manufacturing"
            ],
            "certifications_needed": [
                "FSC Certification for paper products",
                "GOTS Certification for organic textiles",
                "Fair Trade Certification"
            ],
            "impact_metrics": {
                "carbon_footprint_reduced": 1250,  # kg CO2
                "waste_diverted": 890,  # kg
                "trees_planted": 45
            },
            "personalized_tips": [
                "Based on your product categories, consider FSC certification",
                "Your customer base values sustainability - highlight eco-friendly features",
                "Consider bundling sustainable products together"
            ] if profile else []
        }
    
    async def generate_daily_insights(self, vendor_id: str) -> Dict[str, Any]:
        """Generate daily insights and action items with personalization"""
        performance = await self.analyze_vendor_performance(vendor_id)
        recommendations = await self.generate_business_recommendations(vendor_id)
        sustainability = await self.get_sustainability_insights(vendor_id)
        bundles = await self.generate_bundle_recommendations(vendor_id)
        
        # Generate daily action items
        action_items = []
        
        # Check for urgent items
        if performance["metrics"]["pending_orders"] > 0:
            action_items.append({
                "type": "urgent",
                "title": "Process Pending Orders",
                "description": f"You have {performance['metrics']['pending_orders']} orders waiting for fulfillment",
                "estimated_time": "30 minutes"
            })
        
        if performance["metrics"]["low_stock_count"] > 0:
            action_items.append({
                "type": "important",
                "title": "Restock Low Inventory",
                "description": f"{performance['metrics']['low_stock_count']} products need restocking",
                "estimated_time": "1 hour"
            })
        
        # Add top recommendation as action item
        if recommendations:
            top_rec = recommendations[0]
            action_items.append({
                "type": "strategic",
                "title": top_rec["title"],
                "description": top_rec["description"],
                "estimated_time": "2-3 hours"
            })
        
        # Add bundle recommendation if available
        if bundles:
            top_bundle = bundles[0]
            action_items.append({
                "type": "revenue",
                "title": f"Create '{top_bundle['bundle_name']}' Bundle",
                "description": f"Expected revenue: ₹{top_bundle['expected_revenue']:.0f}",
                "estimated_time": "1 hour"
            })
        
        return {
            "date": datetime.now().isoformat(),
            "vendor_id": vendor_id,
            "performance_summary": performance["metrics"],
            "action_items": action_items,
            "recommendations": recommendations[:3],
            "bundle_recommendations": bundles[:2],
            "sustainability_insights": sustainability,
            "personalization": performance.get("personalization", {}),
            "quick_stats": {
                "today_orders": len([o for o in performance["recent_orders"] 
                                   if datetime.fromisoformat(o.get("created_at", "").replace("Z", "+00:00")).date() == datetime.now().date()]),
                "weekly_revenue": performance["metrics"]["total_revenue"],
                "active_products": performance["metrics"]["active_products"]
            }
        }

# Global instance
vendor_concierge = VendorConciergeService()
