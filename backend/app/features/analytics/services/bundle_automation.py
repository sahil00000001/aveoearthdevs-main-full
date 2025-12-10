from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc, text
from datetime import datetime, timedelta
import json
import math
from collections import defaultdict, Counter
import asyncio
from app.features.analytics.models.user_activity import (
    UserActivity, UserBehaviorProfile, BundleRecommendation, ActivityType
)
from app.features.products.models.product import Product
from app.features.products.models.category import Category
from app.features.products.models.brand import Brand
from app.core.logging import get_logger

logger = get_logger("bundle_automation")

class BundleAutomationEngine:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.logger = logger
    
    async def generate_bundle_recommendations(
        self,
        user_id: Optional[str],
        session_id: str,
        cart_items: List[Dict[str, Any]] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Generate automated bundle recommendations"""
        try:
            bundles = []
            
            # Get user behavior profile for personalization
            user_profile = None
            if user_id:
                profile_query = select(UserBehaviorProfile).where(
                    UserBehaviorProfile.user_id == user_id
                )
                result = await self.db.execute(profile_query)
                user_profile = result.scalar_one_or_none()
            
            # Generate different types of bundles
            bundle_types = [
                "complementary",
                "seasonal", 
                "promotional",
                "cross_sell",
                "upsell"
            ]
            
            for bundle_type in bundle_types:
                type_bundles = await self._generate_bundle_type(
                    bundle_type, user_profile, cart_items, limit
                )
                bundles.extend(type_bundles)
            
            # Sort by recommendation score and return top bundles
            bundles.sort(key=lambda x: x['recommendation_score'], reverse=True)
            
            # Log bundle recommendations
            if bundles:
                await self._log_bundle_recommendations(user_id, session_id, bundles)
            
            return bundles[:limit]
            
        except Exception as e:
            self.logger.error(f"Error generating bundle recommendations: {str(e)}")
            return []
    
    async def _generate_bundle_type(
        self,
        bundle_type: str,
        user_profile: Optional[UserBehaviorProfile],
        cart_items: List[Dict[str, Any]] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Generate bundles of a specific type"""
        bundles = []
        
        try:
            if bundle_type == "complementary":
                bundles = await self._generate_complementary_bundles(user_profile, cart_items)
            elif bundle_type == "seasonal":
                bundles = await self._generate_seasonal_bundles(user_profile)
            elif bundle_type == "promotional":
                bundles = await self._generate_promotional_bundles(user_profile)
            elif bundle_type == "cross_sell":
                bundles = await self._generate_cross_sell_bundles(user_profile, cart_items)
            elif bundle_type == "upsell":
                bundles = await self._generate_upsell_bundles(user_profile, cart_items)
            
            return bundles[:limit]
            
        except Exception as e:
            self.logger.error(f"Error generating {bundle_type} bundles: {str(e)}")
            return []
    
    async def _generate_complementary_bundles(
        self,
        user_profile: Optional[UserBehaviorProfile],
        cart_items: List[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Generate complementary product bundles"""
        bundles = []
        
        try:
            # Get frequently bought together products
            frequently_together = await self._get_frequently_bought_together()
            
            for product_group in frequently_together:
                if len(product_group) >= 2:
                    bundle = await self._create_bundle_from_products(
                        product_group, "complementary", user_profile
                    )
                    if bundle:
                        bundles.append(bundle)
            
            return bundles
            
        except Exception as e:
            self.logger.error(f"Error generating complementary bundles: {str(e)}")
            return []
    
    async def _generate_seasonal_bundles(
        self,
        user_profile: Optional[UserBehaviorProfile]
    ) -> List[Dict[str, Any]]:
        """Generate seasonal bundles based on current season and trends"""
        bundles = []
        
        try:
            current_month = datetime.utcnow().month
            seasonal_categories = self._get_seasonal_categories(current_month)
            
            # Get trending products in seasonal categories
            for category_id in seasonal_categories:
                trending_products = await self._get_trending_products_in_category(
                    category_id, limit=3
                )
                
                if len(trending_products) >= 2:
                    bundle = await self._create_bundle_from_products(
                        trending_products, "seasonal", user_profile
                    )
                    if bundle:
                        bundles.append(bundle)
            
            return bundles
            
        except Exception as e:
            self.logger.error(f"Error generating seasonal bundles: {str(e)}")
            return []
    
    async def _generate_promotional_bundles(
        self,
        user_profile: Optional[UserBehaviorProfile]
    ) -> List[Dict[str, Any]]:
        """Generate promotional bundles with discounts"""
        bundles = []
        
        try:
            # Get products with high margins for promotional bundles
            high_margin_products = await self._get_high_margin_products()
            
            # Create promotional bundles with attractive discounts
            for product_group in high_margin_products:
                if len(product_group) >= 2:
                    bundle = await self._create_promotional_bundle(
                        product_group, user_profile
                    )
                    if bundle:
                        bundles.append(bundle)
            
            return bundles
            
        except Exception as e:
            self.logger.error(f"Error generating promotional bundles: {str(e)}")
            return []
    
    async def _generate_cross_sell_bundles(
        self,
        user_profile: Optional[UserBehaviorProfile],
        cart_items: List[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Generate cross-sell bundles based on cart contents"""
        bundles = []
        
        try:
            if not cart_items:
                return bundles
            
            # Get cross-sell products for each cart item
            for cart_item in cart_items:
                product_id = cart_item.get('product_id')
                if product_id:
                    cross_sell_products = await self._get_cross_sell_products(product_id)
                    
                    if cross_sell_products:
                        bundle = await self._create_bundle_from_products(
                            cross_sell_products, "cross_sell", user_profile
                        )
                        if bundle:
                            bundles.append(bundle)
            
            return bundles
            
        except Exception as e:
            self.logger.error(f"Error generating cross-sell bundles: {str(e)}")
            return []
    
    async def _generate_upsell_bundles(
        self,
        user_profile: Optional[UserBehaviorProfile],
        cart_items: List[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Generate upsell bundles with premium products"""
        bundles = []
        
        try:
            # Get premium products in user's preferred categories
            premium_products = await self._get_premium_products(user_profile)
            
            # Create upsell bundles
            for product_group in premium_products:
                if len(product_group) >= 2:
                    bundle = await self._create_bundle_from_products(
                        product_group, "upsell", user_profile
                    )
                    if bundle:
                        bundles.append(bundle)
            
            return bundles
            
        except Exception as e:
            self.logger.error(f"Error generating upsell bundles: {str(e)}")
            return []
    
    async def _get_frequently_bought_together(self) -> List[List[Product]]:
        """Get products that are frequently bought together"""
        try:
            # Query for products that appear together in orders
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            query = text("""
                SELECT 
                    p1.id as product1_id,
                    p2.id as product2_id,
                    COUNT(*) as frequency
                FROM order_items oi1
                JOIN order_items oi2 ON oi1.order_id = oi2.order_id
                JOIN products p1 ON oi1.product_id = p1.id
                JOIN products p2 ON oi2.product_id = p2.id
                WHERE oi1.product_id != oi2.product_id
                AND oi1.created_at >= :thirty_days_ago
                GROUP BY p1.id, p2.id
                HAVING COUNT(*) >= 2
                ORDER BY frequency DESC
                LIMIT 20
            """)
            
            result = await self.db.execute(query, {"thirty_days_ago": thirty_days_ago})
            frequent_pairs = result.fetchall()
            
            # Group products that appear together
            product_groups = defaultdict(set)
            for pair in frequent_pairs:
                product_groups[pair.product1_id].add(pair.product2_id)
                product_groups[pair.product2_id].add(pair.product1_id)
            
            # Convert to product objects
            bundles = []
            for main_product_id, related_product_ids in product_groups.items():
                if len(related_product_ids) >= 1:
                    # Get main product
                    main_product_query = select(Product).where(Product.id == main_product_id)
                    main_result = await self.db.execute(main_product_query)
                    main_product = main_result.scalar_one_or_none()
                    
                    if main_product:
                        # Get related products
                        related_products_query = select(Product).where(
                            and_(
                                Product.id.in_(list(related_product_ids)[:2]),  # Limit to 2 related products
                                Product.is_active == True
                            )
                        )
                        related_result = await self.db.execute(related_products_query)
                        related_products = related_result.scalars().all()
                        
                        if related_products:
                            bundle_products = [main_product] + list(related_products)
                            bundles.append(bundle_products)
            
            return bundles
            
        except Exception as e:
            self.logger.error(f"Error getting frequently bought together: {str(e)}")
            return []
    
    async def _get_trending_products_in_category(
        self,
        category_id: str,
        limit: int = 3
    ) -> List[Product]:
        """Get trending products in a specific category"""
        try:
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            
            query = select(
                Product.id,
                Product.name,
                Product.price,
                Product.category_id,
                Product.brand_id,
                Product.images,
                func.count(UserActivity.id).label('view_count')
            ).join(
                UserActivity, Product.id == UserActivity.product_id
            ).where(
                and_(
                    Product.category_id == category_id,
                    Product.is_active == True,
                    UserActivity.activity_type == ActivityType.PRODUCT_VIEW.value,
                    UserActivity.created_at >= seven_days_ago
                )
            ).group_by(
                Product.id, Product.name, Product.price, Product.category_id, Product.brand_id, Product.images
            ).order_by(
                desc('view_count')
            ).limit(limit)
            
            result = await self.db.execute(query)
            trending_products = result.fetchall()
            
            # Convert to Product objects
            products = []
            for product_data in trending_products:
                product_query = select(Product).where(Product.id == product_data.id)
                product_result = await self.db.execute(product_query)
                product = product_result.scalar_one_or_none()
                if product:
                    products.append(product)
            
            return products
            
        except Exception as e:
            self.logger.error(f"Error getting trending products: {str(e)}")
            return []
    
    async def _get_high_margin_products(self) -> List[List[Product]]:
        """Get products with high profit margins for promotional bundles"""
        try:
            # This would typically query a products table with margin information
            # For now, we'll get products with higher prices as a proxy
            query = select(Product).where(
                and_(
                    Product.is_active == True,
                    Product.price > 100  # Assuming higher price = higher margin
                )
            ).order_by(desc(Product.price)).limit(10)
            
            result = await self.db.execute(query)
            high_margin_products = result.scalars().all()
            
            # Group into bundles of 2-3 products
            bundles = []
            for i in range(0, len(high_margin_products), 2):
                bundle = high_margin_products[i:i+3]
                if len(bundle) >= 2:
                    bundles.append(bundle)
            
            return bundles
            
        except Exception as e:
            self.logger.error(f"Error getting high margin products: {str(e)}")
            return []
    
    async def _get_cross_sell_products(self, product_id: str) -> List[Product]:
        """Get cross-sell products for a given product"""
        try:
            # Get the product's category
            product_query = select(Product).where(Product.id == product_id)
            product_result = await self.db.execute(product_query)
            product = product_result.scalar_one_or_none()
            
            if not product:
                return []
            
            # Get related products in the same category
            related_query = select(Product).where(
                and_(
                    Product.category_id == product.category_id,
                    Product.id != product_id,
                    Product.is_active == True
                )
            ).limit(3)
            
            result = await self.db.execute(related_query)
            related_products = result.scalars().all()
            
            return related_products
            
        except Exception as e:
            self.logger.error(f"Error getting cross-sell products: {str(e)}")
            return []
    
    async def _get_premium_products(
        self,
        user_profile: Optional[UserBehaviorProfile]
    ) -> List[List[Product]]:
        """Get premium products for upsell bundles"""
        try:
            # Get products in user's preferred categories with higher prices
            preferred_categories = user_profile.preferred_categories if user_profile else []
            
            if not preferred_categories:
                # Fallback to general premium products
                query = select(Product).where(
                    and_(
                        Product.is_active == True,
                        Product.price > 200  # Premium price threshold
                    )
                ).order_by(desc(Product.price)).limit(6)
            else:
                query = select(Product).where(
                    and_(
                        Product.category_id.in_(preferred_categories),
                        Product.is_active == True,
                        Product.price > 150  # Premium price threshold
                    )
                ).order_by(desc(Product.price)).limit(6)
            
            result = await self.db.execute(query)
            premium_products = result.scalars().all()
            
            # Group into bundles
            bundles = []
            for i in range(0, len(premium_products), 2):
                bundle = premium_products[i:i+3]
                if len(bundle) >= 2:
                    bundles.append(bundle)
            
            return bundles
            
        except Exception as e:
            self.logger.error(f"Error getting premium products: {str(e)}")
            return []
    
    async def _create_bundle_from_products(
        self,
        products: List[Product],
        bundle_type: str,
        user_profile: Optional[UserBehaviorProfile]
    ) -> Optional[Dict[str, Any]]:
        """Create a bundle from a list of products"""
        try:
            if len(products) < 2:
                return None
            
            # Calculate bundle pricing
            individual_price = sum(float(product.price) for product in products)
            bundle_price = individual_price * 0.85  # 15% discount
            discount_percentage = 15.0
            savings_amount = individual_price - bundle_price
            
            # Calculate recommendation score
            recommendation_score = self._calculate_bundle_score(products, user_profile)
            
            # Create bundle name
            bundle_name = f"{bundle_type.title()} Bundle"
            if bundle_type == "complementary":
                bundle_name = "Perfect Together Bundle"
            elif bundle_type == "seasonal":
                bundle_name = "Seasonal Special Bundle"
            elif bundle_type == "promotional":
                bundle_name = "Limited Time Bundle"
            elif bundle_type == "cross_sell":
                bundle_name = "Complete Your Order Bundle"
            elif bundle_type == "upsell":
                bundle_name = "Premium Upgrade Bundle"
            
            bundle = {
                'id': f"bundle_{bundle_type}_{len(products)}",
                'name': bundle_name,
                'type': bundle_type,
                'products': [
                    {
                        'id': str(product.id),
                        'name': product.name,
                        'price': float(product.price),
                        'image_url': product.images[0] if product.images else None,
                        'category_id': str(product.category_id),
                        'brand_id': str(product.brand_id) if product.brand_id else None
                    }
                    for product in products
                ],
                'individual_price': individual_price,
                'bundle_price': bundle_price,
                'discount_percentage': discount_percentage,
                'savings_amount': savings_amount,
                'recommendation_score': recommendation_score,
                'confidence_score': min(1.0, recommendation_score + 0.2),
                'expected_conversion_rate': self._calculate_expected_conversion_rate(
                    bundle_type, recommendation_score, user_profile
                ),
                'expected_revenue': bundle_price * self._calculate_expected_conversion_rate(
                    bundle_type, recommendation_score, user_profile
                ),
                'bundle_reason': self._get_bundle_reason(bundle_type, products, user_profile)
            }
            
            return bundle
            
        except Exception as e:
            self.logger.error(f"Error creating bundle: {str(e)}")
            return None
    
    async def _create_promotional_bundle(
        self,
        products: List[Product],
        user_profile: Optional[UserBehaviorProfile]
    ) -> Optional[Dict[str, Any]]:
        """Create a promotional bundle with higher discount"""
        try:
            if len(products) < 2:
                return None
            
            # Calculate bundle pricing with higher discount
            individual_price = sum(float(product.price) for product in products)
            bundle_price = individual_price * 0.75  # 25% discount
            discount_percentage = 25.0
            savings_amount = individual_price - bundle_price
            
            # Higher recommendation score for promotional bundles
            recommendation_score = 0.9
            
            bundle = {
                'id': f"bundle_promotional_{len(products)}",
                'name': "Limited Time Promotional Bundle",
                'type': 'promotional',
                'products': [
                    {
                        'id': str(product.id),
                        'name': product.name,
                        'price': float(product.price),
                        'image_url': product.images[0] if product.images else None,
                        'category_id': str(product.category_id),
                        'brand_id': str(product.brand_id) if product.brand_id else None
                    }
                    for product in products
                ],
                'individual_price': individual_price,
                'bundle_price': bundle_price,
                'discount_percentage': discount_percentage,
                'savings_amount': savings_amount,
                'recommendation_score': recommendation_score,
                'confidence_score': 0.95,
                'expected_conversion_rate': 0.15,  # Higher for promotional
                'expected_revenue': bundle_price * 0.15,
                'bundle_reason': "Limited time offer - Save 25% on this bundle!"
            }
            
            return bundle
            
        except Exception as e:
            self.logger.error(f"Error creating promotional bundle: {str(e)}")
            return None
    
    def _calculate_bundle_score(
        self,
        products: List[Product],
        user_profile: Optional[UserBehaviorProfile]
    ) -> float:
        """Calculate recommendation score for a bundle"""
        base_score = 0.6
        
        # Category preference bonus
        if user_profile and user_profile.preferred_categories:
            category_matches = sum(
                1 for product in products 
                if str(product.category_id) in user_profile.preferred_categories
            )
            base_score += (category_matches / len(products)) * 0.2
        
        # Brand preference bonus
        if user_profile and user_profile.preferred_brands:
            brand_matches = sum(
                1 for product in products 
                if product.brand_id and str(product.brand_id) in user_profile.preferred_brands
            )
            base_score += (brand_matches / len(products)) * 0.2
        
        # Price sensitivity adjustment
        if user_profile and user_profile.price_sensitivity:
            avg_price = sum(float(product.price) for product in products) / len(products)
            if user_profile.price_sensitivity < 0.5:  # Low price sensitivity
                if avg_price > 100:
                    base_score += 0.1
            elif user_profile.price_sensitivity > 0.7:  # High price sensitivity
                if avg_price < 100:
                    base_score += 0.1
        
        return min(1.0, base_score)
    
    def _calculate_expected_conversion_rate(
        self,
        bundle_type: str,
        recommendation_score: float,
        user_profile: Optional[UserBehaviorProfile]
    ) -> float:
        """Calculate expected conversion rate for a bundle"""
        base_rate = 0.05  # 5% base conversion rate
        
        # Bundle type multiplier
        type_multipliers = {
            'complementary': 1.2,
            'seasonal': 1.1,
            'promotional': 1.5,
            'cross_sell': 1.3,
            'upsell': 0.8
        }
        
        base_rate *= type_multipliers.get(bundle_type, 1.0)
        
        # Recommendation score multiplier
        base_rate *= recommendation_score
        
        # User profile multiplier
        if user_profile:
            if user_profile.impulse_buying:
                base_rate *= 1.3
            if user_profile.deal_seeking and bundle_type == 'promotional':
                base_rate *= 1.4
            if user_profile.customer_lifecycle_stage == 'loyal':
                base_rate *= 1.2
        
        return min(0.3, base_rate)  # Cap at 30%
    
    def _get_bundle_reason(
        self,
        bundle_type: str,
        products: List[Product],
        user_profile: Optional[UserBehaviorProfile]
    ) -> str:
        """Get human-readable reason for bundle recommendation"""
        reasons = {
            'complementary': "These products are frequently bought together",
            'seasonal': "Perfect for the current season",
            'promotional': "Limited time offer with great savings",
            'cross_sell': "Complete your order with these related items",
            'upsell': "Upgrade to premium versions"
        }
        
        base_reason = reasons.get(bundle_type, "Recommended bundle for you")
        
        # Add personalization
        if user_profile and user_profile.preferred_categories:
            category_matches = sum(
                1 for product in products 
                if str(product.category_id) in user_profile.preferred_categories
            )
            if category_matches > 0:
                base_reason += " based on your preferences"
        
        return base_reason
    
    def _get_seasonal_categories(self, month: int) -> List[str]:
        """Get seasonal categories based on current month"""
        seasonal_map = {
            1: ['winter_clothing', 'heating', 'hot_beverages'],  # January
            2: ['winter_clothing', 'heating', 'valentine_gifts'],  # February
            3: ['spring_clothing', 'gardening', 'outdoor_gear'],  # March
            4: ['spring_clothing', 'gardening', 'outdoor_gear'],  # April
            5: ['spring_clothing', 'gardening', 'outdoor_gear'],  # May
            6: ['summer_clothing', 'swimming', 'outdoor_gear'],  # June
            7: ['summer_clothing', 'swimming', 'outdoor_gear'],  # July
            8: ['summer_clothing', 'swimming', 'outdoor_gear'],  # August
            9: ['fall_clothing', 'back_to_school', 'outdoor_gear'],  # September
            10: ['fall_clothing', 'halloween', 'outdoor_gear'],  # October
            11: ['fall_clothing', 'thanksgiving', 'outdoor_gear'],  # November
            12: ['winter_clothing', 'christmas', 'holiday_gifts']  # December
        }
        
        return seasonal_map.get(month, ['general'])
    
    async def _log_bundle_recommendations(
        self,
        user_id: Optional[str],
        session_id: str,
        bundles: List[Dict[str, Any]]
    ) -> None:
        """Log bundle recommendations for performance tracking"""
        try:
            for bundle in bundles:
                bundle_log = BundleRecommendation(
                    user_id=user_id,
                    session_id=session_id,
                    bundle_name=bundle['name'],
                    bundle_type=bundle['type'],
                    bundle_products=[p['id'] for p in bundle['products']],
                    individual_price=bundle['individual_price'],
                    bundle_price=bundle['bundle_price'],
                    discount_percentage=bundle['discount_percentage'],
                    savings_amount=bundle['savings_amount'],
                    recommendation_score=bundle['recommendation_score'],
                    confidence_score=bundle['confidence_score'],
                    expected_conversion_rate=bundle['expected_conversion_rate'],
                    expected_revenue=bundle['expected_revenue']
                )
                
                self.db.add(bundle_log)
            
            await self.db.commit()
            
        except Exception as e:
            self.logger.error(f"Error logging bundle recommendations: {str(e)}")
            await self.db.rollback()
