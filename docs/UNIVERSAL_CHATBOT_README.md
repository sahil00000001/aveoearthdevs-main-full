# Universal ChatBot Assistant - AveoEarth

## Overview

The Universal ChatBot Assistant is a comprehensive AI-powered support system that provides personalized assistance to all users of the AveoEarth platform. It serves as a one-stop guide for FAQs, help, and intelligent assistance across customer, vendor, and guest user types.

## Key Features

### 🤖 **Universal AI Assistant**
- **Context-Aware Responses**: Adapts responses based on user type (customer, vendor, guest)
- **Multi-Modal Interface**: Chat, FAQ browser, and help center in one widget
- **Real-Time Function Calling**: Executes backend operations based on user requests
- **Conversation Memory**: Maintains context across chat sessions

### 📚 **Comprehensive FAQ System**
- **Categorized FAQs**: General, Shopping, Orders, Payments, Vendor, Sustainability
- **Smart Search**: Search across all FAQ categories and content
- **Interactive Browsing**: Click-to-ask functionality for quick answers
- **Tag-Based Organization**: Easy filtering and discovery

### 🎯 **User Type Specific Features**

#### **Customer Mode**
- Product search and recommendations
- Shopping cart and wishlist management
- Order tracking and support
- Sustainability information and eco-friendly choices
- Account management assistance

#### **Vendor Mode**
- Business analytics and performance metrics
- Product management and inventory tools
- Order fulfillment and customer service
- Sustainability scoring and improvement suggestions
- Growth and optimization recommendations

#### **Guest Mode**
- Platform introduction and mission explanation
- Feature overview and benefits
- Account creation encouragement
- General sustainability education

### 🚀 **Quick Actions**
- **Search Products**: Instant product discovery
- **View Cart**: Quick cart access
- **Track Order**: Order status checking
- **Get Help**: Direct support access
- **Browse FAQs**: FAQ exploration
- **Contact Support**: Direct communication

### 💡 **Smart Suggestions**
- **Contextual Chips**: Pre-defined questions based on user type
- **Proactive Help**: Suggests relevant actions and information
- **Progressive Disclosure**: Shows more options as user engages

## Technical Architecture

### **Frontend Components**

#### **UniversalChatBot.tsx**
```typescript
// Main chatbot component with multi-tab interface
- Chat interface with message history
- FAQ browser with search and filtering
- Help center with resources and contact info
- Quick actions and suggestion chips
- User type detection and context switching
```

#### **Key Features**
- **Responsive Design**: Works on all screen sizes
- **Minimizable Interface**: Can be minimized to floating button
- **Real-Time Updates**: Live message streaming and status updates
- **Error Handling**: Graceful fallbacks and user feedback

### **Backend AI Service**

#### **Enhanced AI Functions**
```python
# Universal Help Functions
- getFAQ(category): Get FAQs by category
- getHelpTopics(): Get available help resources
- searchHelp(query): Search help content

# User Type Detection
- Automatic user type detection from auth context
- Context-aware system instructions
- Personalized response generation
```

#### **System Instructions**
- **Base Instruction**: Core AveoEarth assistant personality
- **Vendor Mode**: Business-focused assistance and tools
- **Customer Mode**: Shopping and support focused
- **Guest Mode**: Educational and welcoming approach

### **API Integration**

#### **Chat Endpoint**
```http
POST /chat
{
  "message": "How do I track my order?",
  "user_token": "user_id_or_guest",
  "session_id": "optional_session_id",
  "user_type": "customer|vendor|guest"
}
```

#### **Response Format**
```json
{
  "response": "AI generated response",
  "function_calls": [
    {
      "function": "function_name",
      "result": {
        "data": "function_result",
        "status": "success"
      }
    }
  ],
  "session_id": "session_id"
}
```

## Usage Examples

### **Customer Interactions**
```
User: "I want to find eco-friendly products"
Bot: "I'll help you find sustainable products! Let me search our catalog for you."
[Executes getProducts function with sustainability filters]

User: "How do I track my order?"
Bot: "You can track your order using the tracking number sent to your email or through your account dashboard under 'Order History'."
[Shows FAQ answer with additional context]
```

### **Vendor Interactions**
```
User: "Show me my sales performance"
Bot: "I'll pull up your latest sales analytics and performance metrics."
[Executes getVendorAnalytics function]

User: "What products are low in stock?"
Bot: "Let me check your inventory levels and identify products that need restocking."
[Executes getVendorInventory function]
```

### **Guest Interactions**
```
User: "What is AveoEarth?"
Bot: "AveoEarth is a sustainable e-commerce platform that connects eco-conscious consumers with environmentally responsible vendors. We focus on promoting sustainable products and practices. Would you like to learn more about our features or create an account?"
[Provides educational content and encourages engagement]
```

## Configuration

### **Environment Variables**
```bash
# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key
AI_SERVICE_URL=http://localhost:8002

# Backend API Configuration
BACKEND_API_URL=http://localhost:8000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### **Component Props**
```typescript
interface UniversalChatBotProps {
  // No props required - automatically detects user type
  // from auth context
}
```

## Customization

### **Adding New FAQ Categories**
```typescript
const faqCategories: FAQCategory[] = [
  {
    id: 'new_category',
    title: 'New Category',
    icon: NewIcon,
    color: 'text-blue-600',
    questions: [
      {
        id: 'question_id',
        question: 'Question text?',
        answer: 'Answer text',
        category: 'new_category',
        tags: ['tag1', 'tag2']
      }
    ]
  }
];
```

### **Adding New Quick Actions**
```typescript
const quickActions = [
  { 
    icon: NewIcon, 
    label: 'New Action', 
    action: 'new_action', 
    color: 'text-blue-600' 
  }
];
```

### **Customizing System Instructions**
```python
def get_system_instruction(user_type: Optional[str] = None):
    # Add custom instructions based on user type
    if user_type == "custom_type":
        return custom_instruction
    # ... existing logic
```

## Performance Optimization

### **Frontend Optimizations**
- **Lazy Loading**: Components load only when needed
- **Message Virtualization**: Efficient rendering of long chat histories
- **Debounced Search**: Prevents excessive API calls during typing
- **Memoized Components**: Reduces unnecessary re-renders

### **Backend Optimizations**
- **Function Caching**: Cached results for frequently called functions
- **Session Management**: Efficient conversation history storage
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Error Recovery**: Graceful handling of API failures

## Monitoring and Analytics

### **Key Metrics**
- **Response Time**: Average time to generate responses
- **Function Call Success Rate**: Percentage of successful function executions
- **User Satisfaction**: Feedback and rating collection
- **FAQ Effectiveness**: Most viewed and helpful FAQ items

### **Logging**
```python
# AI Service Logs
logger.info(f"Chat request from {user_type} user: {message}")
logger.info(f"Function call executed: {function_name}")
logger.error(f"AI service error: {error_message}")
```

## Security Considerations

### **Authentication**
- **Token Validation**: Validates user tokens for authenticated requests
- **Session Security**: Secure session management and cleanup
- **Rate Limiting**: Prevents abuse and DoS attacks

### **Data Privacy**
- **Message Encryption**: Sensitive data encrypted in transit
- **Session Cleanup**: Automatic cleanup of old conversation data
- **GDPR Compliance**: User data handling according to privacy regulations

## Future Enhancements

### **Planned Features**
- **Voice Interface**: Speech-to-text and text-to-speech capabilities
- **Multi-Language Support**: Internationalization and localization
- **Advanced Analytics**: Detailed conversation analytics and insights
- **Integration APIs**: Third-party service integrations
- **Mobile App**: Native mobile chatbot experience

### **AI Improvements**
- **Custom Models**: Fine-tuned models for specific use cases
- **Sentiment Analysis**: Emotion detection and response adaptation
- **Predictive Assistance**: Proactive help based on user behavior
- **Learning System**: Continuous improvement from user interactions

## Troubleshooting

### **Common Issues**

#### **Chat Not Responding**
```bash
# Check AI service status
curl http://localhost:8002/health

# Check logs
docker logs ai-service
```

#### **Function Calls Failing**
```bash
# Verify backend API connectivity
curl http://localhost:8000/health

# Check function permissions
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/vendor/analytics
```

#### **FAQ Not Loading**
```typescript
// Check component state
console.log(faqCategories);
console.log(filteredFAQs());

// Verify data structure
console.log(selectedCategory, searchQuery);
```

### **Debug Mode**
```typescript
// Enable debug logging
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Chat message:', message);
  console.log('User type:', userType);
  console.log('Response:', response);
}
```

## Support and Maintenance

### **Regular Maintenance**
- **FAQ Updates**: Regular review and update of FAQ content
- **Function Testing**: Periodic testing of all AI functions
- **Performance Monitoring**: Continuous monitoring of response times
- **User Feedback**: Regular collection and analysis of user feedback

### **Contact Information**
- **Technical Support**: dev@aveoearth.com
- **AI Service Issues**: ai-support@aveoearth.com
- **General Questions**: support@aveoearth.com

---

The Universal ChatBot Assistant represents a significant advancement in user experience, providing intelligent, context-aware assistance that adapts to each user's needs while maintaining the core mission of promoting sustainability and eco-friendly practices.
