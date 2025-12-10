from sqlalchemy import Column, String, DateTime, Text, Integer, Float, Boolean, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.base import Base
import uuid
from datetime import datetime
from enum import Enum

class ActivityType(str, Enum):
    PAGE_VIEW = "page_view"
    PRODUCT_VIEW = "product_view"
    SEARCH = "search"
    ADD_TO_CART = "add_to_cart"
    REMOVE_FROM_CART = "remove_from_cart"
    PURCHASE = "purchase"
    WISHLIST_ADD = "wishlist_add"
    WISHLIST_REMOVE = "wishlist_remove"
    REVIEW = "review"
    RATING = "rating"
    SHARE = "share"
    EMAIL_OPEN = "email_open"
    EMAIL_CLICK = "email_click"
    PUSH_NOTIFICATION = "push_notification"
    LOGIN = "login"
    LOGOUT = "logout"
    REGISTRATION = "registration"
    CATEGORY_BROWSE = "category_browse"
    BRAND_BROWSE = "brand_browse"
    FILTER_APPLIED = "filter_applied"
    SORT_APPLIED = "sort_applied"
    COMPARISON = "comparison"
    RECOMMENDATION_VIEW = "recommendation_view"
    RECOMMENDATION_CLICK = "recommendation_click"
    BUNDLE_VIEW = "bundle_view"
    BUNDLE_ADD = "bundle_add"
    CART_ABANDONMENT = "cart_abandonment"
    RETURN_VISIT = "return_visit"
    MOBILE_APP_OPEN = "mobile_app_open"
    DESKTOP_ACCESS = "desktop_access"
    SOCIAL_LOGIN = "social_login"
    PROFILE_UPDATE = "profile_update"
    ADDRESS_UPDATE = "address_update"
    PAYMENT_METHOD_UPDATE = "payment_method_update"
    SUBSCRIPTION = "subscription"
    UNSUBSCRIPTION = "unsubscription"
    CUSTOMER_SUPPORT = "customer_support"
    FEEDBACK = "feedback"
    REFERRAL = "referral"
    LOYALTY_POINTS_EARNED = "loyalty_points_earned"
    LOYALTY_POINTS_REDEEMED = "loyalty_points_redeemed"
    COUPON_APPLIED = "coupon_applied"
    COUPON_REMOVED = "coupon_removed"
    SHIPPING_UPDATE = "shipping_update"
    DELIVERY_CONFIRMATION = "delivery_confirmation"
    RETURN_REQUEST = "return_request"
    REFUND_REQUEST = "refund_request"

class UserActivity(Base):
    __tablename__ = "user_activities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    session_id = Column(String, nullable=False, index=True)
    activity_type = Column(String, nullable=False, index=True)
    activity_data = Column(JSON, nullable=True)
    
    # Context information
    page_url = Column(Text, nullable=True)
    referrer_url = Column(Text, nullable=True)
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    device_type = Column(String, nullable=True)  # mobile, desktop, tablet
    browser = Column(String, nullable=True)
    os = Column(String, nullable=True)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    
    # Product-related context
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=True)
    
    # E-commerce specific
    cart_value = Column(Float, nullable=True)
    order_value = Column(Float, nullable=True)
    quantity = Column(Integer, nullable=True)
    price = Column(Float, nullable=True)
    discount_amount = Column(Float, nullable=True)
    shipping_cost = Column(Float, nullable=True)
    
    # Engagement metrics
    time_spent = Column(Integer, nullable=True)  # seconds
    scroll_depth = Column(Float, nullable=True)  # percentage
    click_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    
    # Recommendation context
    recommendation_id = Column(UUID(as_uuid=True), nullable=True)
    recommendation_type = Column(String, nullable=True)
    recommendation_score = Column(Float, nullable=True)
    recommendation_position = Column(Integer, nullable=True)
    
    # Conversion tracking
    conversion_value = Column(Float, nullable=True)
    conversion_type = Column(String, nullable=True)
    funnel_stage = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="activities")
    product = relationship("Product")
    category = relationship("Category")
    brand = relationship("Brand")

class UserBehaviorProfile(Base):
    __tablename__ = "user_behavior_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Behavioral patterns
    preferred_categories = Column(JSON, nullable=True)
    preferred_brands = Column(JSON, nullable=True)
    price_sensitivity = Column(Float, nullable=True)  # 0-1 scale
    brand_loyalty = Column(Float, nullable=True)  # 0-1 scale
    deal_seeking = Column(Boolean, default=False)
    impulse_buying = Column(Boolean, default=False)
    research_intensive = Column(Boolean, default=False)
    
    # Shopping patterns
    shopping_frequency = Column(String, nullable=True)  # daily, weekly, monthly, seasonal
    preferred_shopping_time = Column(String, nullable=True)  # morning, afternoon, evening, night
    preferred_shopping_day = Column(String, nullable=True)  # weekday, weekend
    seasonal_patterns = Column(JSON, nullable=True)
    
    # Device and channel preferences
    preferred_device = Column(String, nullable=True)  # mobile, desktop, tablet
    preferred_browser = Column(String, nullable=True)
    preferred_payment_method = Column(String, nullable=True)
    preferred_shipping_method = Column(String, nullable=True)
    
    # Engagement patterns
    avg_session_duration = Column(Integer, nullable=True)  # seconds
    avg_pages_per_session = Column(Float, nullable=True)
    bounce_rate = Column(Float, nullable=True)
    return_visitor = Column(Boolean, default=False)
    
    # Purchase behavior
    avg_order_value = Column(Float, nullable=True)
    total_orders = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    last_purchase_date = Column(DateTime, nullable=True)
    purchase_frequency = Column(Float, nullable=True)  # orders per month
    
    # Content preferences
    preferred_content_type = Column(JSON, nullable=True)  # videos, images, text, reviews
    preferred_communication_channel = Column(JSON, nullable=True)  # email, sms, push, in-app
    
    # Risk and fraud indicators
    risk_score = Column(Float, default=0.0)  # 0-1 scale
    fraud_indicators = Column(JSON, nullable=True)
    
    # Lifecycle stage
    customer_lifecycle_stage = Column(String, nullable=True)  # new, active, at_risk, churned, loyal
    customer_lifetime_value = Column(Float, default=0.0)
    predicted_churn_probability = Column(Float, nullable=True)
    
    # Personalization scores
    personalization_score = Column(Float, default=0.0)  # 0-1 scale
    recommendation_accuracy = Column(Float, nullable=True)
    engagement_score = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_activity_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="behavior_profile")

class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    session_id = Column(String, nullable=False)
    
    # Recommendation details
    recommendation_type = Column(String, nullable=False)  # product, bundle, category, content
    recommendation_algorithm = Column(String, nullable=False)  # collaborative, content-based, hybrid
    recommendation_score = Column(Float, nullable=False)
    recommendation_position = Column(Integer, nullable=False)
    
    # Recommended items
    recommended_items = Column(JSON, nullable=False)  # List of recommended item IDs
    recommended_categories = Column(JSON, nullable=True)
    recommended_brands = Column(JSON, nullable=True)
    
    # Context
    context_data = Column(JSON, nullable=True)
    user_segment = Column(String, nullable=True)
    personalization_factors = Column(JSON, nullable=True)
    
    # Performance tracking
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    revenue_generated = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User")

class BundleRecommendation(Base):
    __tablename__ = "bundle_recommendations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    session_id = Column(String, nullable=False)
    
    # Bundle details
    bundle_name = Column(String, nullable=False)
    bundle_type = Column(String, nullable=False)  # complementary, seasonal, promotional, cross-sell
    bundle_products = Column(JSON, nullable=False)  # List of product IDs in bundle
    
    # Pricing
    individual_price = Column(Float, nullable=False)
    bundle_price = Column(Float, nullable=False)
    discount_percentage = Column(Float, nullable=False)
    savings_amount = Column(Float, nullable=False)
    
    # Recommendation metrics
    recommendation_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    expected_conversion_rate = Column(Float, nullable=True)
    expected_revenue = Column(Float, nullable=True)
    
    # Performance tracking
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    revenue_generated = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User")
