# To run this code you need to install the following dependencies:
# pip install google-genai fastapi uvicorn httpx

import base64
import os
import json
import httpx
import asyncio
from typing import Dict, Any, Optional, List
from google import genai
from google.genai import types
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vendor_concierge import vendor_concierge

load_dotenv()

# Configuration
BACKEND_BASE_URL = "http://localhost:8000"
AI_SERVICE_PORT = 8002

# In-memory conversation storage (in production, use Redis or database)
conversation_history = {}

# Pydantic models for API
class ChatRequest(BaseModel):
    message: str
    user_token: Optional[str] = None
    session_id: Optional[str] = None
    user_type: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    function_calls: Optional[List[Dict[str, Any]]] = None
    session_id: Optional[str] = None

# HTTP Client for backend API calls
async def make_api_call(endpoint: str, method: str = "GET", data: Optional[Dict] = None, headers: Optional[Dict] = None) -> Dict[str, Any]:
    """Make HTTP requests to the backend API"""
    async with httpx.AsyncClient() as client:
        url = f"{BACKEND_BASE_URL}{endpoint}"
        
        try:
            if method == "GET":
                response = await client.get(url, headers=headers, params=data)
            elif method == "POST":
                response = await client.post(url, headers=headers, json=data)
            elif method == "PUT":
                response = await client.put(url, headers=headers, json=data)
            elif method == "DELETE":
                response = await client.delete(url, headers=headers)
            
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"error": f"API call failed: {str(e)}"}

# Function implementations that call real backend APIs
async def getProducts(query: Optional[str] = None, category: Optional[str] = None, 
                     priceRange: Optional[str] = None, sortBy: Optional[str] = None, 
                     limit: Optional[int] = 20, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Fetches products from the backend API using real product search endpoints"""
    headers = {}
    if user_token:
        headers["Authorization"] = f"Bearer {user_token}"
    
    # Use the advanced search endpoint
    search_data = {
        "query": query or "",
        "page": 1,
        "limit": limit,
        "sort_by": "relevance",
        "sort_order": "desc"
    }
    
    if category:
        search_data["category_id"] = category
    
    if priceRange and "-" in priceRange:
        try:
            min_price, max_price = priceRange.split("-")
            search_data["min_price"] = float(min_price)
            search_data["max_price"] = float(max_price)
        except ValueError:
            pass
    
    if sortBy:
        if sortBy == "price_low_high":
            search_data["sort_by"] = "price"
            search_data["sort_order"] = "asc"
        elif sortBy == "price_high_low":
            search_data["sort_by"] = "price"
            search_data["sort_order"] = "desc"
        elif sortBy == "newest":
            search_data["sort_by"] = "created_at"
            search_data["sort_order"] = "desc"
        elif sortBy == "popularity":
            search_data["sort_by"] = "views"
            search_data["sort_order"] = "desc"
    
    return await make_api_call("/search/", "POST", search_data, headers)

async def viewRecentOrders(limit: Optional[int] = 10, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Retrieves recent orders using real orders API"""
    if not user_token:
        return {
            "error": "Authentication required to view orders",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    params = {"page": 1, "limit": limit}
    
    return await make_api_call("/buyer/orders/", "GET", params, headers)

async def trackOrder(orderId: str, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Tracks order status using real orders API"""
    if not user_token:
        return {
            "error": "Authentication required to track orders",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    return await make_api_call(f"/buyer/orders/{orderId}", "GET", None, headers)

async def addToCart(productId: str, quantity: int = 1, user_token: Optional[str] = None, 
                   variantId: Optional[str] = None) -> Dict[str, Any]:
    """Adds product to cart using real cart API"""
    if not user_token:
        return {
            "error": "Authentication required to add items to cart",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    data = {
        "product_id": productId,
        "quantity": quantity
    }
    if variantId:
        data["variant_id"] = variantId
    
    return await make_api_call("/buyer/orders/cart/items", "POST", data, headers)

async def viewCart(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Views cart contents using real cart API"""
    if not user_token:
        return {
            "error": "Authentication required to view cart",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    return await make_api_call("/buyer/orders/cart", "GET", None, headers)

async def updateCartItem(cartItemId: str, quantity: int, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Updates cart item quantity using real cart API"""
    if not user_token:
        return {
            "error": "Authentication required to update cart",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    data = {"quantity": quantity}
    
    return await make_api_call(f"/buyer/orders/cart/items/{cartItemId}", "PUT", data, headers)

async def removeFromCart(cartItemId: str, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Removes item from cart using real cart API"""
    if not user_token:
        return {
            "error": "Authentication required to remove from cart",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    return await make_api_call(f"/buyer/orders/cart/items/{cartItemId}", "DELETE", None, headers)

async def checkout(paymentMethod: str, billingAddressId: str, shippingAddressId: str, 
                  user_token: Optional[str] = None, customerNotes: Optional[str] = None) -> Dict[str, Any]:
    """Initiates checkout using real orders API"""
    if not user_token:
        return {
            "error": "Authentication required for checkout",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    data = {
        "billing_address_id": billingAddressId,
        "shipping_address_id": shippingAddressId,
        "payment_method": paymentMethod
    }
    if customerNotes:
        data["customer_notes"] = customerNotes
    
    return await make_api_call("/buyer/orders/", "POST", data, headers)

async def getRecommendations(basedOn: str = "trending", limit: int = 10, 
                           user_token: Optional[str] = None) -> Dict[str, Any]:
    """Gets product recommendations using real search API"""
    headers = {}
    if user_token:
        headers["Authorization"] = f"Bearer {user_token}"
    
    try:
        if basedOn == "trending":
            params = {"limit": limit}
            return await make_api_call("/search/trending", "GET", params, headers)
        elif basedOn == "browsing_history" and user_token:
            params = {"recommendation_type": "browsing_history", "limit": limit}
            return await make_api_call("/search/personalized", "GET", params, headers)
        elif basedOn == "recent_orders" and user_token:
            params = {"recommendation_type": "purchase_history", "limit": limit}
            return await make_api_call("/search/personalized", "GET", params, headers)
        elif basedOn == "new_arrivals":
            params = {"limit": limit, "days_back": 30}
            return await make_api_call("/search/new-arrivals", "GET", params, headers)
        elif basedOn == "best_sellers":
            params = {"limit": limit, "time_period": "month"}
            return await make_api_call("/search/best-sellers", "GET", params, headers)
        elif basedOn == "top_rated":
            params = {"limit": limit}
            return await make_api_call("/search/top-rated", "GET", params, headers)
        else:
            # Default to general product search
            return await getProducts(limit=limit, user_token=user_token)
    except Exception as e:
        return {"error": f"Failed to get recommendations: {str(e)}"}

async def getUserProfile(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Gets user profile information using real profile API"""
    if not user_token:
        return {
            "error": "Authentication required to access profile",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    return await make_api_call("/me", "GET", None, headers)

async def updateUserProfile(name: Optional[str] = None, email: Optional[str] = None, 
                           phone: Optional[str] = None, bio: Optional[str] = None,
                           user_token: Optional[str] = None) -> Dict[str, Any]:
    """Updates user profile using real profile API"""
    if not user_token:
        return {
            "error": "Authentication required to update profile",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    data = {}
    if name:
        data["name"] = name
    if email:
        data["email"] = email
    if phone:
        data["phone"] = phone
    if bio:
        data["bio"] = bio
    
    # Try to update both user info and profile
    try:
        # Update basic user info first if provided
        if name or email or phone:
            user_data = {}
            if name:
                user_data["name"] = name
            if email:
                user_data["email"] = email
            if phone:
                user_data["phone"] = phone
            
            await make_api_call("/profile", "PUT", user_data, headers)
        
        # Update extended profile if bio provided
        if bio:
            profile_data = {"bio": bio}
            await make_api_call("/profile", "PUT", profile_data, headers)
        
        return {
            "message": "Profile updated successfully",
            "status": "success",
            "updated_fields": list(data.keys())
        }
    except Exception as e:
        return {"error": f"Failed to update profile: {str(e)}"}

async def getCategories(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Gets product categories using real categories API"""
    return await make_api_call("/products/categories/tree", "GET")

async def getBrands(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Gets active brands using real brands API"""
    return await make_api_call("/products/brands/active", "GET")

async def getWishlist(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Gets user's wishlist using real wishlist API"""
    if not user_token:
        return {
            "error": "Authentication required to view wishlist",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    return await make_api_call("/products/wishlist", "GET", None, headers)

async def addToWishlist(productId: str, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Adds product to wishlist using real wishlist API"""
    if not user_token:
        return {
            "error": "Authentication required to add to wishlist",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    data = {"product_id": productId}
    return await make_api_call("/products/wishlist", "POST", data, headers)

async def cancelOrder(orderId: str, cancelReason: str, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Cancels an order using real orders API"""
    if not user_token:
        return {
            "error": "Authentication required to cancel orders",
            "status": "auth_required"
        }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    data = {"cancel_reason": cancelReason}
    return await make_api_call(f"/buyer/orders/{orderId}/cancel", "POST", data, headers)

async def getSupport(topic: str) -> Dict[str, Any]:
    """Gets support information or FAQs"""
    support_topics = {
        "orders": "For order-related questions, you can view your recent orders, track order status, or cancel orders if needed. Our order management system provides real-time updates.",
        "products": "You can browse our extensive product catalog, search by categories or keywords, add items to your wishlist, and read product reviews.",
        "account": "Manage your profile information, view your order history, update preferences, and manage your addresses through your account settings.",
        "shipping": "Track your shipments in real-time, view delivery estimates, and manage shipping preferences through your order details.",
        "returns": "Initiate returns for eligible items, track return status, and manage refunds through your order history.",
        "payment": "View payment history, manage payment methods, and track payment status for your orders.",
        "cart": "Add items to cart, update quantities, remove items, and proceed to checkout when ready.",
        "wishlist": "Save products for later, organize your favorites, and easily move items to cart when ready to purchase."
    }
    
    response = support_topics.get(topic.lower(), 
        "For general support, I can help you with orders, products, account management, shipping, returns, payments, cart operations, and wishlist management. What specific area would you like help with?")
    
    return {
        "topic": topic,
        "response": response,
        "status": "info_provided",
        "available_actions": [
            "View orders", "Track orders", "Search products", "Manage cart", 
            "View wishlist", "Update profile", "Cancel order", "Get recommendations"
        ]
    }

# Vendor Concierge Functions
async def getVendorAnalytics(days: int = 30, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get comprehensive vendor analytics and performance metrics"""
    if not user_token:
        return {"error": "Authentication required for vendor analytics"}
    
    try:
        analytics = await vendor_concierge.get_vendor_analytics(user_token, days)
        return {
            "analytics": analytics,
            "status": "success",
            "message": f"Vendor analytics for the last {days} days"
        }
    except Exception as e:
        return {"error": f"Failed to get vendor analytics: {str(e)}"}

async def getVendorPerformance(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get detailed vendor performance analysis with insights and recommendations"""
    if not user_token:
        return {"error": "Authentication required for vendor performance analysis"}
    
    try:
        performance = await vendor_concierge.analyze_vendor_performance(user_token)
        return {
            "performance": performance,
            "status": "success",
            "message": "Vendor performance analysis completed"
        }
    except Exception as e:
        return {"error": f"Failed to analyze vendor performance: {str(e)}"}

async def getVendorRecommendations(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get AI-powered business recommendations for vendor growth"""
    if not user_token:
        return {"error": "Authentication required for vendor recommendations"}
    
    try:
        recommendations = await vendor_concierge.generate_business_recommendations(user_token)
        return {
            "recommendations": recommendations,
            "status": "success",
            "message": f"Generated {len(recommendations)} business recommendations"
        }
    except Exception as e:
        return {"error": f"Failed to generate recommendations: {str(e)}"}

async def getVendorDailyInsights(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get daily insights and action items for vendors"""
    if not user_token:
        return {"error": "Authentication required for daily insights"}
    
    try:
        insights = await vendor_concierge.generate_daily_insights(user_token)
        return {
            "daily_insights": insights,
            "status": "success",
            "message": "Daily insights and action items generated"
        }
    except Exception as e:
        return {"error": f"Failed to generate daily insights: {str(e)}"}

async def getVendorProducts(status: str = "all", user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get vendor's product catalog with performance metrics"""
    if not user_token:
        return {"error": "Authentication required for vendor products"}
    
    try:
        products = await vendor_concierge.get_vendor_products(user_token, status)
        return {
            "products": products,
            "total_count": len(products),
            "status": "success",
            "message": f"Retrieved {len(products)} products"
        }
    except Exception as e:
        return {"error": f"Failed to get vendor products: {str(e)}"}

async def getVendorOrders(days: int = 30, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get vendor's recent orders and fulfillment status"""
    if not user_token:
        return {"error": "Authentication required for vendor orders"}
    
    try:
        orders = await vendor_concierge.get_vendor_orders(user_token, days)
        return {
            "orders": orders,
            "total_count": len(orders),
            "status": "success",
            "message": f"Retrieved {len(orders)} recent orders"
        }
    except Exception as e:
        return {"error": f"Failed to get vendor orders: {str(e)}"}

async def getVendorInventory(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get inventory status and low stock alerts"""
    if not user_token:
        return {"error": "Authentication required for inventory data"}
    
    try:
        low_stock = await vendor_concierge.get_low_stock_products(user_token)
        return {
            "low_stock_products": low_stock,
            "alert_count": len(low_stock),
            "status": "success",
            "message": f"Found {len(low_stock)} products with low stock"
        }
    except Exception as e:
        return {"error": f"Failed to get inventory data: {str(e)}"}

async def getVendorSustainability(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get sustainability insights and improvement recommendations"""
    if not user_token:
        return {"error": "Authentication required for sustainability data"}
    
    try:
        sustainability = await vendor_concierge.get_sustainability_insights(user_token)
        return {
            "sustainability": sustainability,
            "status": "success",
            "message": "Sustainability insights and recommendations generated"
        }
    except Exception as e:
        return {"error": f"Failed to get sustainability insights: {str(e)}"}

async def getVendorBundleRecommendations(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get intelligent product bundle recommendations"""
    if not user_token:
        return {"error": "Authentication required for bundle recommendations"}
    
    try:
        bundles = await vendor_concierge.generate_bundle_recommendations(user_token)
        return {
            "bundle_recommendations": bundles,
            "total_bundles": len(bundles),
            "status": "success",
            "message": f"Generated {len(bundles)} intelligent bundle recommendations"
        }
    except Exception as e:
        return {"error": f"Failed to generate bundle recommendations: {str(e)}"}

async def getVendorPersonalizedInsights(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get comprehensive personalized insights and recommendations"""
    if not user_token:
        return {"error": "Authentication required for personalized insights"}
    
    try:
        performance = await vendor_concierge.analyze_vendor_performance(user_token)
        bundles = await vendor_concierge.generate_bundle_recommendations(user_token)
        recommendations = await vendor_concierge.generate_business_recommendations(user_token)
        
        return {
            "performance": performance,
            "bundle_recommendations": bundles,
            "business_recommendations": recommendations,
            "personalization": performance.get("personalization", {}),
            "status": "success",
            "message": "Comprehensive personalized insights generated"
        }
    except Exception as e:
        return {"error": f"Failed to generate personalized insights: {str(e)}"}

# Universal Help and FAQ Functions
async def getFAQ(category: str = "general", user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get frequently asked questions by category"""
    faq_data = {
        "general": [
            {
                "question": "What is AveoEarth?",
                "answer": "AveoEarth is a sustainable e-commerce platform that connects eco-conscious consumers with environmentally responsible vendors. We focus on promoting sustainable products and practices."
            },
            {
                "question": "How do I create an account?",
                "answer": "You can create an account by clicking the 'Sign Up' button in the top right corner. Choose between a customer or vendor account, then follow the simple registration process."
            }
        ],
        "shopping": [
            {
                "question": "How do I search for products?",
                "answer": "Use the search bar at the top of the page. You can search by product name, category, or keywords. Use filters to narrow down results by price, brand, or sustainability features."
            },
            {
                "question": "How do I add items to my cart?",
                "answer": "Click the 'Add to Cart' button on any product page. You can adjust quantities and select variants before adding. Your cart will show the total and allow you to proceed to checkout."
            }
        ],
        "orders": [
            {
                "question": "How do I track my order?",
                "answer": "After placing an order, you'll receive a tracking number via email. You can also track orders in your account dashboard under 'Order History'."
            },
            {
                "question": "What is your return policy?",
                "answer": "We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some items like personalized products may not be returnable."
            }
        ],
        "vendor": [
            {
                "question": "How do I become a vendor?",
                "answer": "Click 'Become a Vendor' in the header, complete the application form, and upload required documents. Our team will review your application within 2-3 business days."
            },
            {
                "question": "How do I manage my products?",
                "answer": "Use your vendor dashboard to add, edit, and manage products. You can track sales, manage inventory, and view analytics all in one place."
            }
        ]
    }
    
    return {
        "faqs": faq_data.get(category, faq_data["general"]),
        "category": category,
        "status": "success",
        "message": f"Retrieved FAQs for {category} category"
    }

async def getHelpTopics(user_token: Optional[str] = None) -> Dict[str, Any]:
    """Get available help topics and resources"""
    help_topics = {
        "contact": {
            "email": "support@aveoearth.com",
            "phone": "+1-800-AVEO-HELP",
            "hours": "24/7 for urgent issues"
        },
        "resources": [
            "User Guide",
            "Privacy Policy", 
            "Terms of Service",
            "Shipping Information",
            "Return Policy"
        ],
        "quick_actions": [
            "Track Order",
            "View Cart",
            "Search Products",
            "Contact Support",
            "Browse FAQs"
        ]
    }
    
    return {
        "help_topics": help_topics,
        "status": "success",
        "message": "Help topics and resources retrieved"
    }

async def searchHelp(query: str, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Search help content and FAQs"""
    # This would typically search through a knowledge base
    # For now, return mock search results
    search_results = [
        {
            "title": "How to track your order",
            "content": "You can track your order using the tracking number sent to your email or through your account dashboard.",
            "category": "orders",
            "relevance": 0.95
        },
        {
            "title": "Payment methods accepted",
            "content": "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and bank transfers.",
            "category": "payments",
            "relevance": 0.87
        }
    ]
    
    return {
        "search_results": search_results,
        "query": query,
        "total_results": len(search_results),
        "status": "success",
        "message": f"Found {len(search_results)} results for '{query}'"
    }

# Function mapping for AI tool calls
FUNCTION_MAP = {
    "getProducts": getProducts,
    "viewRecentOrders": viewRecentOrders,
    "trackOrder": trackOrder,
    "addToCart": addToCart,
    "viewCart": viewCart,
    "updateCartItem": updateCartItem,
    "removeFromCart": removeFromCart,
    "checkout": checkout,
    "getRecommendations": getRecommendations,
    "getUserProfile": getUserProfile,
    "updateUserProfile": updateUserProfile,
    "getCategories": getCategories,
    "getBrands": getBrands,
    "getWishlist": getWishlist,
    "addToWishlist": addToWishlist,
    "cancelOrder": cancelOrder,
    "getSupport": getSupport,
    # Vendor Concierge Functions
    "getVendorAnalytics": getVendorAnalytics,
    "getVendorPerformance": getVendorPerformance,
    "getVendorRecommendations": getVendorRecommendations,
    "getVendorDailyInsights": getVendorDailyInsights,
    "getVendorProducts": getVendorProducts,
    "getVendorOrders": getVendorOrders,
    "getVendorInventory": getVendorInventory,
    "getVendorSustainability": getVendorSustainability,
    "getVendorBundleRecommendations": getVendorBundleRecommendations,
    "getVendorPersonalizedInsights": getVendorPersonalizedInsights,
    # Universal Help Functions
    "getFAQ": getFAQ,
    "getHelpTopics": getHelpTopics,
    "searchHelp": searchHelp,
}

def get_conversation_context(session_id: str, max_messages: int = 5) -> List[types.Content]:
    """Get conversation history for context (last 5 messages)"""
    if session_id not in conversation_history:
        return []
    
    history = conversation_history[session_id]
    # Return last max_messages worth of conversation
    return history[-max_messages * 2:] if len(history) > max_messages * 2 else history

def add_to_conversation_history(session_id: str, user_message: str, ai_response: str):
    """Add messages to conversation history"""
    if session_id not in conversation_history:
        conversation_history[session_id] = []
    
    # Add user message
    conversation_history[session_id].append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_message)]
        )
    )
    
    # Add AI response
    conversation_history[session_id].append(
        types.Content(
            role="model",
            parts=[types.Part.from_text(text=ai_response)]
        )
    )

def get_system_instruction(user_type: Optional[str] = None, user_token: Optional[str] = None) -> types.Content:
    """Get system instruction based on user type"""
    base_instruction = """You are AveoEarth's AI assistant, a helpful and knowledgeable guide for our sustainable e-commerce platform. You help users with shopping, orders, vendor management, and general questions about our eco-friendly marketplace.

Key capabilities:
- Help users search and discover sustainable products
- Assist with order tracking and management
- Provide vendor support and business insights
- Answer questions about sustainability and eco-friendly practices
- Guide users through account management and platform features
- Offer personalized recommendations based on user preferences

Always be friendly, helpful, and focused on sustainability. When appropriate, use the available functions to provide real-time information and assistance."""

    if user_type == "vendor":
        vendor_instruction = f"""

VENDOR MODE: You are specifically helping a vendor on our platform. You have access to:
- Vendor analytics and performance metrics
- Business recommendations and optimization strategies
- Product management and inventory tools
- Order fulfillment and customer service
- Sustainability scoring and improvement suggestions

Focus on helping them grow their business, optimize their operations, and improve their sustainability impact. Use vendor-specific functions when relevant."""
        return types.Content(
            role="model",
            parts=[types.Part.from_text(text=base_instruction + vendor_instruction)],
        )
    elif user_type == "customer":
        customer_instruction = f"""

CUSTOMER MODE: You are helping a customer shopping on our platform. Focus on:
- Product discovery and recommendations
- Shopping cart and wishlist management
- Order tracking and support
- Sustainability information and eco-friendly choices
- Account management and preferences

Help them find the perfect sustainable products and have a great shopping experience."""
        return types.Content(
            role="model",
            parts=[types.Part.from_text(text=base_instruction + customer_instruction)],
        )
    else:
        guest_instruction = f"""

GUEST MODE: You are helping a visitor to our platform. Focus on:
- Introducing them to AveoEarth and our mission
- Explaining our sustainable e-commerce platform
- Helping them understand our features and benefits
- Encouraging them to create an account
- Answering general questions about sustainability and eco-friendly shopping

Be welcoming and informative, helping them understand why AveoEarth is the right choice for sustainable shopping."""
        return types.Content(
            role="model",
            parts=[types.Part.from_text(text=base_instruction + guest_instruction)],
        )
    
    # Keep only last 10 messages (5 exchanges) to prevent memory issues
    max_history = 10
    if len(conversation_history[session_id]) > max_history:
        conversation_history[session_id] = conversation_history[session_id][-max_history:]

async def execute_function_call(function_call, user_token: Optional[str] = None) -> Dict[str, Any]:
    """Execute a function call from the AI model"""
    function_name = function_call.name
    function_args = function_call.args
    
    if function_name not in FUNCTION_MAP:
        return {"error": f"Unknown function: {function_name}"}
    
    try:
        # Add user_token to function args if the function accepts it
        function = FUNCTION_MAP[function_name]
        if 'user_token' in function.__code__.co_varnames:
            function_args['user_token'] = user_token
        
        result = await function(**function_args)
        return {"function": function_name, "result": result}
    except Exception as e:
        return {"error": f"Error executing {function_name}: {str(e)}"}

async def generate_ai_response(user_input: str, user_token: Optional[str] = None, 
                              session_id: Optional[str] = None, user_type: Optional[str] = None, max_iterations: int = 5) -> Dict[str, Any]:
    """Generate AI response with function calling capability and conversation context"""
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    
    client = genai.Client(api_key=api_key)
    model = "gemini-2.0-flash-exp"
    
    # Generate session ID if not provided
    if not session_id:
        import uuid
        session_id = str(uuid.uuid4())
    
    # Get conversation context
    context_messages = get_conversation_context(session_id)
    
    # Create system instruction based on user type
    system_instruction = get_system_instruction(user_type, user_token)
    
    # Initialize conversation with system instruction, context, and new user input
    contents = [system_instruction] + context_messages.copy()
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_input)],
        )
    )
    
    tools = [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="getProducts",
                    description="Fetches a list of products based on search query, category, or filters. Use this for product search, browsing, and discovery.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "query": genai.types.Schema(type=genai.types.Type.STRING, description="Search query for products"),
                            "category": genai.types.Schema(type=genai.types.Type.STRING, description="Category ID or name to filter by"),
                            "priceRange": genai.types.Schema(type=genai.types.Type.STRING, description="Price range in format 'min-max' e.g. '10-50'"),
                            "sortBy": genai.types.Schema(
                                type=genai.types.Type.STRING,
                                enum=["price_low_high", "price_high_low", "newest", "popularity"],
                                description="How to sort the results"
                            ),
                            "limit": genai.types.Schema(type=genai.types.Type.INTEGER, description="Number of products to return (default: 20)")
                        },
                    ),
                ),
                types.FunctionDeclaration(
                    name="viewRecentOrders",
                    description="Retrieves details of the user's recent orders. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "limit": genai.types.Schema(type=genai.types.Type.INTEGER, description="Number of orders to return"),
                        },
                    ),
                ),
                types.FunctionDeclaration(
                    name="trackOrder",
                    description="Tracks the current status of a specific order. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "orderId": genai.types.Schema(type=genai.types.Type.STRING, description="The order ID to track"),
                        },
                        required=["orderId"]
                    ),
                ),
                types.FunctionDeclaration(
                    name="addToCart",
                    description="Adds a product to the user's shopping cart. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "productId": genai.types.Schema(type=genai.types.Type.STRING, description="The product ID to add"),
                            "quantity": genai.types.Schema(type=genai.types.Type.INTEGER, description="Quantity to add (default: 1)"),
                            "variantId": genai.types.Schema(type=genai.types.Type.STRING, description="Product variant ID if applicable"),
                        },
                        required=["productId"]
                    ),
                ),
                types.FunctionDeclaration(
                    name="viewCart",
                    description="Retrieves the current items in the user's shopping cart. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="updateCartItem",
                    description="Updates the quantity of an item in the cart. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "cartItemId": genai.types.Schema(type=genai.types.Type.STRING, description="The cart item ID to update"),
                            "quantity": genai.types.Schema(type=genai.types.Type.INTEGER, description="New quantity"),
                        },
                        required=["cartItemId", "quantity"]
                    ),
                ),
                types.FunctionDeclaration(
                    name="removeFromCart",
                    description="Removes an item from the shopping cart. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "cartItemId": genai.types.Schema(type=genai.types.Type.STRING, description="The cart item ID to remove"),
                        },
                        required=["cartItemId"]
                    ),
                ),
                types.FunctionDeclaration(
                    name="checkout",
                    description="Initiates the checkout process for items in the cart. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "paymentMethod": genai.types.Schema(type=genai.types.Type.STRING, description="Payment method to use"),
                            "billingAddressId": genai.types.Schema(type=genai.types.Type.STRING, description="Billing address ID"),
                            "shippingAddressId": genai.types.Schema(type=genai.types.Type.STRING, description="Shipping address ID"),
                            "customerNotes": genai.types.Schema(type=genai.types.Type.STRING, description="Optional customer notes"),
                        },
                        required=["paymentMethod", "billingAddressId", "shippingAddressId"]
                    ),
                ),
                types.FunctionDeclaration(
                    name="getRecommendations",
                    description="Suggests products based on browsing history, preferences, or trending items.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "basedOn": genai.types.Schema(
                                type=genai.types.Type.STRING,
                                enum=["browsing_history", "recent_orders", "trending", "new_arrivals", "best_sellers"],
                                description="What to base recommendations on"
                            ),
                            "limit": genai.types.Schema(type=genai.types.Type.INTEGER, description="Number of recommendations"),
                        },
                    ),
                ),
                types.FunctionDeclaration(
                    name="getUserProfile",
                    description="Retrieves user's profile information. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="updateUserProfile",
                    description="Updates the user's profile details. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "name": genai.types.Schema(type=genai.types.Type.STRING, description="User's name"),
                            "email": genai.types.Schema(type=genai.types.Type.STRING, description="User's email"),
                            "phone": genai.types.Schema(type=genai.types.Type.STRING, description="User's phone number"),
                            "bio": genai.types.Schema(type=genai.types.Type.STRING, description="User's bio/description"),
                        },
                    ),
                ),
                types.FunctionDeclaration(
                    name="getCategories",
                    description="Retrieves available product categories in a tree structure.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="getBrands",
                    description="Retrieves available active brands.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="getWishlist",
                    description="Retrieves user's wishlist items. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="addToWishlist",
                    description="Adds a product to user's wishlist. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "productId": genai.types.Schema(type=genai.types.Type.STRING, description="Product ID to add to wishlist"),
                        },
                        required=["productId"]
                    ),
                ),
                types.FunctionDeclaration(
                    name="cancelOrder",
                    description="Cancels an existing order. Requires authentication.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "orderId": genai.types.Schema(type=genai.types.Type.STRING, description="Order ID to cancel"),
                            "cancelReason": genai.types.Schema(type=genai.types.Type.STRING, description="Reason for cancellation"),
                        },
                        required=["orderId", "cancelReason"]
                    ),
                ),
                types.FunctionDeclaration(
                    name="getSupport",
                    description="Connects the user with customer support or fetches FAQs for specific topics.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "topic": genai.types.Schema(
                                type=genai.types.Type.STRING,
                                description="Support topic: orders, products, account, shipping, returns, payment, cart, wishlist"
                            ),
                        },
                        required=["topic"]
                    ),
                ),
                # Vendor Concierge Functions
                types.FunctionDeclaration(
                    name="getVendorAnalytics",
                    description="Get comprehensive vendor analytics and performance metrics. Use this to analyze business performance, revenue, orders, and key metrics.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "days": genai.types.Schema(type=genai.types.Type.INTEGER, description="Number of days to analyze (default: 30)"),
                        },
                    ),
                ),
                types.FunctionDeclaration(
                    name="getVendorPerformance",
                    description="Get detailed vendor performance analysis with insights and recommendations. Use this for comprehensive business analysis.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="getVendorRecommendations",
                    description="Get AI-powered business recommendations for vendor growth and optimization. Use this to get actionable business advice.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="getVendorDailyInsights",
                    description="Get daily insights and action items for vendors. Use this to get today's priorities and tasks.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="getVendorProducts",
                    description="Get vendor's product catalog with performance metrics. Use this to analyze product portfolio and performance.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "status": genai.types.Schema(
                                type=genai.types.Type.STRING,
                                enum=["all", "active", "inactive", "draft"],
                                description="Filter products by status (default: all)"
                            ),
                        },
                    ),
                ),
                types.FunctionDeclaration(
                    name="getVendorOrders",
                    description="Get vendor's recent orders and fulfillment status. Use this to track order performance and fulfillment.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "days": genai.types.Schema(type=genai.types.Type.INTEGER, description="Number of days to look back (default: 30)"),
                        },
                    ),
                ),
                types.FunctionDeclaration(
                    name="getVendorInventory",
                    description="Get inventory status and low stock alerts. Use this to manage inventory and prevent stockouts.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="getVendorSustainability",
                    description="Get sustainability insights and improvement recommendations. Use this to improve environmental impact and sustainability score.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="getVendorBundleRecommendations",
                    description="Get intelligent product bundle recommendations based on your product catalog and market trends. Use this to create profitable product bundles.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="getVendorPersonalizedInsights",
                    description="Get comprehensive personalized insights combining performance analysis, bundle recommendations, and business advice tailored to your vendor profile.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                # Universal Help Functions
                types.FunctionDeclaration(
                    name="getFAQ",
                    description="Get frequently asked questions by category. Use this to answer common questions about the platform, shopping, orders, or vendor topics.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "category": genai.types.Schema(
                                type=genai.types.Type.STRING,
                                enum=["general", "shopping", "orders", "payments", "vendor", "sustainability"],
                                description="FAQ category to retrieve questions from"
                            ),
                        },
                    ),
                ),
                types.FunctionDeclaration(
                    name="getHelpTopics",
                    description="Get available help topics and resources. Use this to show users what help is available and how to contact support.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={},
                    ),
                ),
                types.FunctionDeclaration(
                    name="searchHelp",
                    description="Search help content and FAQs. Use this when users ask specific questions that might be answered in our help documentation.",
                    parameters=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        properties={
                            "query": genai.types.Schema(type=genai.types.Type.STRING, description="Search query for help content"),
                        },
                        required=["query"]
                    ),
                ),
            ])
    ]
    
    generate_content_config = types.GenerateContentConfig(
        tools=tools,
    )
    
    function_call_results = []
    iteration = 0
    final_response = ""
    
    while iteration < max_iterations:
        try:
            # Generate response from AI
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            
            # Check if response contains function calls or text
            if response.candidates and response.candidates[0].content.parts:
                has_function_call = False
                text_response = ""
                
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'function_call') and part.function_call:
                        # Execute the function call
                        function_result = await execute_function_call(part.function_call, user_token)
                        function_call_results.append(function_result)
                        
                        # Add function call and result to conversation
                        contents.append(types.Content(
                            role="model",
                            parts=[types.Part(function_call=part.function_call)]
                        ))
                        contents.append(types.Content(
                            role="user",
                            parts=[types.Part(
                                function_response=types.FunctionResponse(
                                    name=part.function_call.name,
                                    response=function_result
                                )
                            )]
                        ))
                        
                        has_function_call = True
                    
                    elif hasattr(part, 'text') and part.text:
                        text_response += part.text
                
                # If we have a text response, save it and potentially return
                if text_response.strip():
                    final_response = text_response.strip()
                    # Add conversation to history
                    add_to_conversation_history(session_id, user_input, final_response)
                    
                    return {
                        "response": final_response,
                        "function_calls": function_call_results,
                        "iterations": iteration,
                        "session_id": session_id
                    }
                
                # If we had function calls but no text, continue the loop
                if has_function_call:
                    iteration += 1
                    continue
                else:
                    # No function calls and no text - something went wrong
                    break
            else:
                # No response parts - break out of loop
                break
            
        except Exception as e:
            return {"error": f"Error generating AI response: {str(e)}"}
    
    # If we get here, we've either reached max iterations or had no valid response
    if function_call_results:
        # We had function calls but no final response - create a summary
        final_response = "I've executed the requested functions but encountered an issue generating a final response. Please try rephrasing your request."
        add_to_conversation_history(session_id, user_input, final_response)
        
        return {
            "response": final_response,
            "function_calls": function_call_results,
            "iterations": iteration,
            "session_id": session_id
        }
    else:
        return {
            "error": "No valid response generated - please try again",
            "function_calls": function_call_results,
            "iterations": iteration,
            "session_id": session_id
        }

# FastAPI Application
app = FastAPI(
    title="AveoEarth AI Assistant",
    description="AI-powered assistant for AveoEarth e-commerce platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Chat endpoint for AI assistant with conversation context"""
    try:
        result = await generate_ai_response(
            request.message, 
            request.user_token, 
            request.session_id,
            request.user_type
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return ChatResponse(
            response=result.get("response", ""),
            function_calls=result.get("function_calls", []),
            session_id=result.get("session_id")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.get("/chat/history/{session_id}")
async def get_conversation_history(session_id: str):
    """Get conversation history for a session"""
    if session_id not in conversation_history:
        return {"history": [], "session_id": session_id}
    
    # Convert conversation history to a readable format
    history = []
    for content in conversation_history[session_id]:
        if content.role == "user":
            for part in content.parts:
                if hasattr(part, 'text') and part.text:
                    history.append({"role": "user", "message": part.text})
        elif content.role == "model":
            for part in content.parts:
                if hasattr(part, 'text') and part.text:
                    history.append({"role": "assistant", "message": part.text})
    
    return {"history": history, "session_id": session_id}

@app.delete("/chat/history/{session_id}")
async def clear_conversation_history(session_id: str):
    """Clear conversation history for a session"""
    if session_id in conversation_history:
        del conversation_history[session_id]
    
    return {"message": f"Conversation history cleared for session {session_id}"}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "AveoEarth AI Assistant",
        "version": "1.0.0",
        "status": "running",
        "backend_url": BACKEND_BASE_URL
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test backend connectivity
        async with httpx.AsyncClient() as client:
            backend_response = await client.get(f"{BACKEND_BASE_URL}/health")
            backend_status = "connected" if backend_response.status_code == 200 else "disconnected"
    except:
        backend_status = "disconnected"
    
    # Test Gemini API key
    gemini_status = "configured" if os.environ.get("GEMINI_API_KEY") else "not_configured"
    
    return {
        "ai_service": "healthy",
        "backend_connection": backend_status,
        "gemini_api": gemini_status,
        "port": AI_SERVICE_PORT,
        "active_sessions": len(conversation_history),
        "features": {
            "real_backend_integration": True,
            "conversation_context": True,
            "function_calling": True,
            "session_management": True
        }
    }

@app.get("/stats")
async def get_service_stats():
    """Get AI service statistics"""
    return {
        "active_conversations": len(conversation_history),
        "total_messages": sum(len(history) for history in conversation_history.values()),
        "available_functions": list(FUNCTION_MAP.keys()),
        "backend_url": BACKEND_BASE_URL
    }

def generate():
    """Legacy function for backward compatibility"""
    print("This is the legacy generate function. Use the FastAPI service instead.")
    print(f"Start the service with: uvicorn main:app --host 0.0.0.0 --port {AI_SERVICE_PORT}")

if __name__ == "__main__":
    import uvicorn
    print(f"Starting AveoEarth AI Assistant on port {AI_SERVICE_PORT}")
    print(f"Backend URL: {BACKEND_BASE_URL}")
    print("API Documentation available at: http://localhost:8002/docs")
    
    uvicorn.run(
        "main:app",
        host="localhost",
        port=AI_SERVICE_PORT,
        reload=True
    )
