"""
Database models for personalization and recommendation system
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import json

Base = declarative_base()

class UserProfile(Base):
    """User profile for personalization"""
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(String, unique=True, index=True, nullable=False)
    segment = Column(String, nullable=False)  # new_vendor, growing_vendor, etc.
    preferences = Column(JSON, default=dict)
    behavior_patterns = Column(JSON, default=dict)
    learning_rate = Column(Float, default=0.1)
    confidence_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    interactions = relationship("UserInteraction", back_populates="profile")
    performance_history = relationship("PerformanceHistory", back_populates="profile")
    recommendations = relationship("Recommendation", back_populates="profile")

class UserInteraction(Base):
    """User interaction tracking"""
    __tablename__ = "user_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(String, ForeignKey("user_profiles.vendor_id"), nullable=False)
    interaction_type = Column(String, nullable=False)  # analytics_view, product_view, etc.
    interaction_data = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_id = Column(String, nullable=True)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="interactions")

class PerformanceHistory(Base):
    """Performance metrics history"""
    __tablename__ = "performance_history"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(String, ForeignKey("user_profiles.vendor_id"), nullable=False)
    revenue = Column(Float, default=0.0)
    orders = Column(Integer, default=0)
    products = Column(Integer, default=0)
    active_products = Column(Integer, default=0)
    avg_order_value = Column(Float, default=0.0)
    low_stock_count = Column(Integer, default=0)
    pending_orders = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="performance_history")

class Recommendation(Base):
    """Generated recommendations"""
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(String, ForeignKey("user_profiles.vendor_id"), nullable=False)
    recommendation_id = Column(String, unique=True, nullable=False)
    type = Column(String, nullable=False)  # product_bundle, pricing_optimization, etc.
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, nullable=False)
    impact_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    expected_profit = Column(Float, default=0.0)
    implementation_time = Column(String, nullable=False)
    success_probability = Column(Float, nullable=False)
    personalized_reason = Column(Text, nullable=False)
    action_items = Column(JSON, default=list)
    status = Column(String, default="pending")  # pending, accepted, rejected, implemented
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="recommendations")

class BundleRecommendation(Base):
    """Bundle recommendations"""
    __tablename__ = "bundle_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(String, ForeignKey("user_profiles.vendor_id"), nullable=False)
    bundle_id = Column(String, unique=True, nullable=False)
    bundle_name = Column(String, nullable=False)
    products = Column(JSON, nullable=False)  # List of product data
    expected_revenue = Column(Float, nullable=False)
    profit_margin = Column(Float, nullable=False)
    demand_forecast = Column(Float, nullable=False)
    sustainability_score = Column(Float, nullable=False)
    market_trend = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    personalized_factors = Column(JSON, default=list)
    status = Column(String, default="pending")  # pending, accepted, rejected, implemented
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ConversationHistory(Base):
    """Conversation history for context"""
    __tablename__ = "conversation_history"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    vendor_id = Column(String, ForeignKey("user_profiles.vendor_id"), nullable=True)
    role = Column(String, nullable=False)  # user, assistant
    message = Column(Text, nullable=False)
    function_calls = Column(JSON, default=list)
    timestamp = Column(DateTime, default=datetime.utcnow)

class MarketTrends(Base):
    """Market trends and data"""
    __tablename__ = "market_trends"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    trend_data = Column(JSON, nullable=False)
    confidence = Column(Float, default=0.0)
    source = Column(String, nullable=False)  # api, manual, ai_generated
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
