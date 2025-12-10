# AveoEarth AI Assistant

An intelligent AI assistant for the AveoEarth e-commerce platform, powered by Google's Gemini AI with function calling capabilities.

## Features

- **Natural Language Interface**: Chat with users in natural language
- **Function Calling**: Automatically calls backend APIs based on user requests
- **Product Search**: Find and filter products from the catalog
- **User Profile Management**: Access and update user profiles
- **Smart Recommendations**: Get personalized product recommendations
- **Order Management**: (Placeholder for future order/cart functionality)
- **Customer Support**: Provide help and FAQ responses

## Setup

### Prerequisites

- Python 3.12+
- UV package manager
- Google Gemini API key
- Backend service running on port 8000

### Installation

1. **Set up environment variables**:
   Create a `.env` file in the `ai` directory:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Install dependencies**:
   ```bash
   cd ai
   uv sync
   ```

### Running the Service

Start the AI assistant service:
```bash
uv run main.py
```

The service will start on `http://localhost:8002`

## API Endpoints

### Chat Endpoint
```
POST /chat
```

**Request:**
```json
{
  "message": "Show me sustainable office supplies",
  "user_token": "optional_bearer_token"
}
```

**Response:**
```json
{
  "response": "Here are some sustainable office supplies I found for you...",
  "function_calls": [
    {
      "function": "getProducts",
      "result": {...}
    }
  ]
}
```

### Health Check
```
GET /health
```

Returns service health status including backend connectivity and Gemini API configuration.

## Available Functions

The AI assistant can automatically call these backend functions:

### Product Functions
- `getProducts(query, category, priceRange, sortBy)` - Search products
- `getRecommendations(basedOn)` - Get product recommendations

### User Functions  
- `getUserProfile()` - Get user profile information
- `updateUserProfile(name, email, phone)` - Update profile details

### Order Functions (Placeholder)
- `viewRecentOrders(limit)` - View recent orders
- `trackOrder(orderId)` - Track order status
- `addToCart(productId, quantity)` - Add items to cart
- `viewCart()` - View cart contents
- `checkout(paymentMethod, addressId)` - Process checkout

### Support Functions
- `getSupport(topic)` - Get help and FAQ responses

## Function Calling Flow

1. User sends a message to `/chat`
2. AI analyzes the message and determines if any functions need to be called
3. Functions are executed and results are passed back to the AI
4. AI generates a natural language response incorporating the function results
5. Process repeats until no more function calls are needed (max 5 iterations)

## Backend Integration

The service integrates with these backend endpoints:

- `GET /products/` - Product search and filtering
- `GET /profile` - User profile information  
- `POST /search/trending` - Trending products
- `POST /search/personalized` - Personalized recommendations
- `GET /health` - Backend health check

## Testing

Run the test suite to verify functionality:
```bash
uv run test_ai_service.py
```

This will test:
- Backend connectivity
- Product search functionality
- AI chat responses
- Function calling capabilities

## Example Conversations

**Product Search:**
```
User: "I need eco-friendly office supplies"
AI: [Calls getProducts with eco-friendly filters]
AI: "I found several sustainable office supplies for you..."
```

**Profile Management:**
```
User: "Show me my profile"
AI: [Calls getUserProfile]
AI: "Here's your current profile information..."
```

**Recommendations:**
```
User: "What's trending?"
AI: [Calls getRecommendations with basedOn="trending"]
AI: "Here are the trending products right now..."
```

## Configuration

### Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)

### Service Configuration

- Backend URL: `http://localhost:8000` (configurable in `main.py`)
- AI Service Port: `8002` (configurable in `main.py`)
- Max Function Call Iterations: `5` (configurable in `generate_ai_response`)

## Development

### Adding New Functions

1. Create the function implementation in `main.py`
2. Add it to the `FUNCTION_MAP` dictionary
3. Add the function declaration to the `tools` list
4. Test with the test suite

### Error Handling

- API errors are captured and returned as structured responses
- Function call failures are logged and handled gracefully
- Maximum iteration limits prevent infinite loops

## Troubleshooting

### Common Issues

1. **Gemini API not configured**: Set `GEMINI_API_KEY` in `.env`
2. **Backend not accessible**: Ensure backend is running on port 8000
3. **Function call failures**: Check backend endpoint availability

### Logs

The service provides detailed logging for debugging function calls and API interactions.

## Future Enhancements

- Cart and order management (when backend APIs are implemented)
- User authentication integration
- Conversation history
- Multi-language support
- Voice interface
- Integration with more backend services
