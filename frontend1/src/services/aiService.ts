// AI Service Integration
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8002';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  function_calls?: FunctionCall[];
}

export interface FunctionCall {
  function: string;
  result: any;
}

export interface ChatRequest {
  message: string;
  user_token?: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  function_calls?: FunctionCall[];
  session_id?: string;
}

export interface AIServiceStats {
  active_conversations: number;
  total_messages: number;
  available_functions: string[];
  backend_url: string;
}

class AIService {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor() {
    this.baseUrl = AI_SERVICE_URL;
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('ai_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('ai_session_id', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(message: string, userToken?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          user_token: userToken,
          session_id: this.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Service Error: ${response.status} ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      
      // Update session ID if provided
      if (data.session_id) {
        this.sessionId = data.session_id;
        localStorage.setItem('ai_session_id', this.sessionId);
      }

      return data;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async getConversationHistory(): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/history/${this.sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get conversation history: ${response.status}`);
      }

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  async clearConversationHistory(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/history/${this.sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to clear conversation history: ${response.status}`);
      }
    } catch (error) {
      console.error('Error clearing conversation history:', error);
      throw error;
    }
  }

  async getServiceStats(): Promise<AIServiceStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to get service stats: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting service stats:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{
    ai_service: string;
    backend_connection: string;
    gemini_api: string;
    port: number;
    active_sessions: number;
    features: {
      real_backend_integration: boolean;
      conversation_context: boolean;
      function_calling: boolean;
      session_management: boolean;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  // Helper method to check if AI service is available
  async isAvailable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  // Helper method to get user token from auth context
  private getUserToken(): string | undefined {
    const token = localStorage.getItem('auth_token');
    return token || undefined;
  }

  // Enhanced sendMessage with automatic token injection
  async sendMessageWithAuth(message: string): Promise<ChatResponse> {
    const userToken = this.getUserToken();
    return this.sendMessage(message, userToken);
  }

  // Quick action methods for common tasks
  async searchProducts(query: string): Promise<ChatResponse> {
    return this.sendMessageWithAuth(`Search for products: ${query}`);
  }

  async getRecommendations(type: 'trending' | 'personalized' | 'eco-friendly' = 'trending'): Promise<ChatResponse> {
    return this.sendMessageWithAuth(`Show me ${type} product recommendations`);
  }

  async trackOrder(orderId: string): Promise<ChatResponse> {
    return this.sendMessageWithAuth(`Track my order ${orderId}`);
  }

  async viewCart(): Promise<ChatResponse> {
    return this.sendMessageWithAuth('Show me my cart');
  }

  async viewWishlist(): Promise<ChatResponse> {
    return this.sendMessageWithAuth('Show me my wishlist');
  }

  async getProfile(): Promise<ChatResponse> {
    return this.sendMessageWithAuth('Show me my profile');
  }

  async getHelp(topic?: string): Promise<ChatResponse> {
    const message = topic ? `Help me with ${topic}` : 'I need help';
    return this.sendMessageWithAuth(message);
  }
}

// Create singleton instance
export const aiService = new AIService();

// Export for backward compatibility
export default aiService;
