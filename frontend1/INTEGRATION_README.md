# AveoEarth Frontend Integration

This document describes the complete integration of the backend API, AI service, and product verification service into the frontend1 application.

## 🚀 **Integration Overview**

The frontend now seamlessly integrates with three backend services:

1. **Backend API** - Core e-commerce functionality
2. **AI Service** - Intelligent chatbot and recommendations
3. **Product Verification Service** - AI-powered image verification

## 📁 **New Files Added**

### **Services**
- `src/services/backendApi.ts` - Backend API integration
- `src/services/aiService.ts` - AI service integration
- `src/services/productVerificationService.ts` - Product verification integration
- `src/services/enhancedApi.ts` - Unified API service with fallbacks

### **Contexts**
- `src/contexts/EnhancedAuthContext.tsx` - Enhanced authentication with backend + Supabase fallback

### **Hooks**
- `src/hooks/useEnhancedCart.ts` - Backend-integrated cart management
- `src/hooks/useEnhancedWishlist.ts` - Backend-integrated wishlist management
- `src/hooks/useEnhancedOrders.ts` - Complete order management system

### **Components**
- `src/components/EnhancedChatBot.tsx` - AI-powered chatbot with real backend integration
- `src/components/ServiceStatus.tsx` - Service connection status monitoring
- `src/components/ProductVerification.tsx` - AI-powered product image verification

### **Configuration**
- `env.local.example` - Environment configuration template

## 🔧 **Environment Configuration**

Create a `.env.local` file based on `env.local.example`:

```bash
# Backend API Configuration
VITE_BACKEND_URL=http://localhost:8000
VITE_BACKEND_API_PREFIX=/api/v1

# AI Service Configuration
VITE_AI_SERVICE_URL=http://localhost:8002

# Product Verification Service
VITE_PRODUCT_VERIFICATION_URL=http://localhost:8001

# Supabase Configuration (keeping existing)
VITE_SUPABASE_URL=https://ylhvdwizcsoelpreftpy.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_key_here

# Feature Flags
VITE_ENABLE_AI_CHATBOT=true
VITE_ENABLE_PRODUCT_VERIFICATION=true
VITE_ENABLE_BACKEND_API=true
VITE_ENABLE_SUPABASE_FALLBACK=true
```

## 🏗️ **Architecture**

### **Service Integration Pattern**
```
Frontend Components
    ↓
Enhanced API Service (enhancedApi.ts)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   Backend API   │   AI Service    │ Product Verify  │
│   (Primary)     │   (AI Features) │   (Verification)│
└─────────────────┴─────────────────┴─────────────────┘
    ↓
┌─────────────────┬─────────────────┐
│   PostgreSQL    │   Supabase     │
│   (Backend DB)  │   (Fallback)   │
└─────────────────┴─────────────────┘
```

### **Fallback Strategy**
1. **Primary**: Backend API for all operations
2. **Fallback**: Supabase for data persistence
3. **Graceful Degradation**: UI adapts based on service availability

## 🤖 **AI Integration Features**

### **Enhanced ChatBot**
- **Real Backend Integration**: Calls actual backend APIs
- **Function Calling**: 15+ integrated functions
- **Session Management**: Persistent conversation history
- **Connection Status**: Real-time service monitoring
- **Error Handling**: Graceful fallbacks and user feedback

### **Available AI Functions**
- `getProducts()` - Search and filter products
- `viewRecentOrders()` - Get order history
- `trackOrder()` - Track specific orders
- `addToCart()` - Add items to cart
- `getRecommendations()` - Get personalized suggestions
- `getUserProfile()` - Access user information
- `updateUserProfile()` - Update user details
- `getWishlist()` - Manage wishlist
- `checkout()` - Process orders
- `getSupport()` - Get help and FAQs

## 🛍️ **E-commerce Features**

### **Product Management**
- **Advanced Search**: Backend-powered search with filters
- **Categories & Brands**: Full category tree and brand management
- **Product Details**: Complete product information with variants
- **Reviews & Ratings**: User review system
- **Sustainability Scoring**: Eco-friendly product indicators

### **Shopping Experience**
- **Smart Cart**: Backend-integrated cart with real-time sync
- **Wishlist**: Persistent wishlist with backend storage
- **Order Management**: Complete order lifecycle management
- **Address Management**: Multiple shipping/billing addresses
- **Payment Integration**: Ready for payment gateway integration

### **Vendor Features**
- **Supplier Onboarding**: Complete vendor registration process
- **Product Management**: Vendor product catalog management
- **Order Management**: Vendor order processing
- **Analytics**: Vendor performance metrics

## 🔍 **Product Verification**

### **AI-Powered Verification**
- **Single Product**: Verify one image against one title
- **Batch Comparison**: Compare one image against multiple titles
- **Confidence Scoring**: Probability-based match assessment
- **Real-time Processing**: Fast verification with progress indicators

### **Features**
- **File Validation**: Image format and size validation
- **GPU Acceleration**: Automatic CUDA detection
- **Batch Processing**: Multiple product comparison
- **Visual Feedback**: Progress bars and status indicators

## 🔐 **Authentication System**

### **Dual Authentication**
- **Primary**: Backend JWT authentication
- **Fallback**: Supabase authentication
- **Seamless Switching**: Automatic fallback on service unavailability

### **Features**
- **Multi-method Signup**: Email and phone registration
- **Profile Management**: Complete user profile system
- **Role-based Access**: Buyer, Supplier, Admin roles
- **Session Management**: Persistent login sessions

## 📊 **Service Monitoring**

### **ServiceStatus Component**
- **Real-time Monitoring**: Live service status updates
- **Connection Health**: Individual service health checks
- **User Feedback**: Clear status indicators
- **Auto-refresh**: Periodic status updates

### **Status Indicators**
- 🟢 **Connected**: Service fully operational
- 🟡 **Partial**: Some services available
- 🔴 **Offline**: All services unavailable

## 🚀 **Getting Started**

### **1. Start Backend Services**
```bash
# Backend API
cd backend
uv run main.py

# AI Service
cd ai
uv run main.py

# Product Verification Service
cd product_verification
python main.py
```

### **2. Configure Environment**
```bash
# Copy environment template
cp env.local.example .env.local

# Edit configuration
nano .env.local
```

### **3. Start Frontend**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### **4. Verify Integration**
- Check ServiceStatus component for connection status
- Test AI chatbot functionality
- Try product verification features
- Test cart and wishlist operations

## 🔄 **API Integration Flow**

### **Product Search Example**
```
User types in search → EnhancedChatBot → AI Service → Backend API → Database
                    ↓
                Response with products → AI formats response → User sees results
```

### **Cart Management Example**
```
User adds to cart → useEnhancedCart → enhancedApi → Backend API → Database
                 ↓
            Real-time update → UI updates → User sees updated cart
```

## 🛠️ **Development Notes**

### **Error Handling**
- **Service Unavailable**: Graceful fallback to Supabase
- **Network Errors**: User-friendly error messages
- **Validation Errors**: Clear validation feedback
- **Timeout Handling**: Automatic retry mechanisms

### **Performance Optimizations**
- **Caching**: React Query for data caching
- **Lazy Loading**: Component-level code splitting
- **Connection Pooling**: Efficient API connections
- **Error Boundaries**: Isolated error handling

### **Testing Strategy**
- **Unit Tests**: Individual service testing
- **Integration Tests**: End-to-end API testing
- **Error Scenarios**: Fallback behavior testing
- **Performance Tests**: Load and stress testing

## 📈 **Monitoring & Analytics**

### **Service Health**
- **Backend API**: Health check endpoint
- **AI Service**: Connection status monitoring
- **Product Verification**: Service availability
- **Database**: Connection status

### **User Analytics**
- **Usage Patterns**: Feature usage tracking
- **Error Rates**: Service error monitoring
- **Performance Metrics**: Response time tracking
- **User Feedback**: Error reporting system

## 🔮 **Future Enhancements**

### **Planned Features**
- **Real-time Notifications**: WebSocket integration
- **Advanced AI**: More sophisticated recommendations
- **Mobile App**: React Native integration
- **Analytics Dashboard**: Advanced reporting
- **Multi-language**: Internationalization support

### **Scalability Improvements**
- **Microservices**: Service decomposition
- **Load Balancing**: Traffic distribution
- **Caching Layer**: Redis integration
- **CDN Integration**: Asset optimization

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Services Not Connecting**: Check environment variables
2. **AI Chatbot Not Working**: Verify AI service is running
3. **Product Verification Failing**: Check image file format
4. **Cart Not Syncing**: Verify backend API connection

### **Debug Tools**
- **ServiceStatus Component**: Real-time service monitoring
- **Browser DevTools**: Network and console debugging
- **Backend Logs**: API request/response logging
- **AI Service Logs**: Chatbot interaction logging

## 📞 **Support**

For technical support or questions about the integration:
- Check the ServiceStatus component for service availability
- Review browser console for error messages
- Verify environment configuration
- Test individual services independently

---

**Integration Complete! 🎉**

The frontend now has full integration with all backend services while maintaining backward compatibility with Supabase for fallback scenarios.
