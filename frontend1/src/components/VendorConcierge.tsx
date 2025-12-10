import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import { 
  MessageCircle, 
  X, 
  Send, 
  Leaf,
  TrendingUp,
  Package,
  ShoppingCart,
  BarChart3,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Sparkles,
  Bot,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  function_calls?: any[];
}

interface VendorInsights {
  performance: {
    total_products: number;
    active_products: number;
    total_revenue: number;
    total_orders: number;
    avg_order_value: number;
    low_stock_count: number;
    pending_orders: number;
  };
  insights: string[];
  recommendations: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    priority: string;
    impact_score: number;
    confidence: number;
    expected_profit: number;
    implementation_time: string;
    success_probability: number;
    personalized_reason: string;
    action_items: string[];
    created_at: string;
  }>;
  bundle_recommendations?: Array<{
    id: string;
    products: Array<{
      id: string;
      name: string;
      price: number;
      category: string;
    }>;
    bundle_name: string;
    expected_revenue: number;
    profit_margin: number;
    demand_forecast: number;
    sustainability_score: number;
    market_trend: string;
    confidence: number;
    personalized_factors: string[];
  }>;
  action_items: Array<{
    type: string;
    title: string;
    description: string;
    estimated_time: string;
  }>;
  sustainability: {
    current_score: number;
    improvements: string[];
    certifications_needed: string[];
    impact_metrics: {
      carbon_footprint_reduced: number;
      waste_diverted: number;
      trees_planted: number;
    };
    personalized_tips?: string[];
  };
  personalization?: {
    user_segment: string;
    confidence_score: number;
    last_updated: string;
  };
}

const quickActions = [
  { icon: BarChart3, label: 'Analytics', action: 'analytics', color: 'text-blue-600' },
  { icon: Target, label: 'Performance', action: 'performance', color: 'text-green-600' },
  { icon: Lightbulb, label: 'Recommendations', action: 'recommendations', color: 'text-yellow-600' },
  { icon: Package, label: 'Bundles', action: 'bundles', color: 'text-purple-600' },
  { icon: Sparkles, label: 'Personalized', action: 'personalized', color: 'text-pink-600' },
  { icon: Leaf, label: 'Sustainability', action: 'sustainability', color: 'text-emerald-600' },
  { icon: Clock, label: 'Daily Insights', action: 'daily', color: 'text-orange-600' }
];

const suggestionChips = [
  "Show me my business performance",
  "What should I focus on today?",
  "How can I increase my revenue?",
  "Create product bundles for me",
  "Give me personalized recommendations",
  "Analyze my product performance",
  "What's my sustainability score?",
  "Show me intelligent insights"
];

const VendorConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAIConnected, setIsAIConnected] = useState(true);
  const [insights, setInsights] = useState<VendorInsights | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { vendor, isAuthenticated } = useVendorAuth();

  useEffect(() => {
    if (isOpen && isAuthenticated()) {
      // Load initial insights when opening
      loadInitialInsights();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadInitialInsights = async () => {
    try {
      const response = await fetch('http://localhost:8002/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Get my daily insights and performance overview",
          user_token: vendor?.id || 'mock-vendor-id',
          session_id: 'vendor-concierge'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.function_calls && data.function_calls.length > 0) {
          // Process the insights data
          const insightsData = data.function_calls[0].result;
          if (insightsData.daily_insights) {
            setInsights(insightsData.daily_insights);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load initial insights:', error);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend) return;

    if (!isAIConnected) {
      toast({
        title: 'AI Service Unavailable',
        description: 'The vendor concierge is currently offline. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8002/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          user_token: vendor?.id || 'mock-vendor-id',
          session_id: 'vendor-concierge'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          function_calls: data.function_calls
        };

        setMessages(prev => [...prev, aiMessage]);

        // Update insights if function calls contain relevant data
        if (data.function_calls && data.function_calls.length > 0) {
          const functionResult = data.function_calls[0].result;
          if (functionResult.daily_insights) {
            setInsights(functionResult.daily_insights);
          } else if (functionResult.performance) {
            setInsights(prev => ({ ...prev, ...functionResult.performance }));
          }
        }

        // Show success toast for function calls
        if (data.function_calls && data.function_calls.length > 0) {
          toast({
            title: 'Analysis Complete',
            description: 'I\'ve analyzed your business data and provided insights.',
          });
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Vendor Concierge Error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: 'Error',
        description: 'Failed to get response from vendor concierge.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const actionMessages = {
      analytics: "Show me my business analytics and performance metrics",
      performance: "Analyze my overall business performance",
      recommendations: "Give me AI-powered business recommendations",
      bundles: "Create intelligent product bundles for me",
      personalized: "Give me personalized insights and recommendations",
      inventory: "Check my inventory status and low stock alerts",
      sustainability: "Show my sustainability score and improvement suggestions",
      daily: "What should I focus on today? Show me my daily insights"
    };

    const message = actionMessages[action as keyof typeof actionMessages];
    if (message) {
      handleSendMessage(message);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      case 'strategic': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </Button>
        <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">AI</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[600px]'
    } w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Vendor Concierge</h3>
              <p className="text-sm text-green-100">AI Business Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col p-4 space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.action)}
                    className="flex flex-col items-center space-y-1 h-16 text-xs"
                  >
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2">
                {suggestionChips.slice(0, 4).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-xs h-8 bg-gray-100 hover:bg-gray-200"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {msg.role === 'assistant' && (
                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          {msg.role === 'user' && (
                            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{msg.content}</p>
                            {msg.function_calls && msg.function_calls.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {msg.function_calls.map((call, index) => (
                                  <div key={index} className="text-xs bg-white/20 rounded p-2">
                                    <strong>{call.function}:</strong> {call.result?.message || 'Executed'}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analyzing your business...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about your business performance..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !message.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="flex-1 p-4">
              <ScrollArea className="h-full">
                {insights ? (
                  <div className="space-y-6">
                    {/* Performance Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <span>Performance Overview</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              ₹{insights.performance.total_revenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Total Revenue</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {insights.performance.total_orders}
                            </div>
                            <div className="text-sm text-gray-600">Total Orders</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {insights.performance.active_products}
                            </div>
                            <div className="text-sm text-gray-600">Active Products</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {insights.performance.avg_order_value.toFixed(0)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Order Value</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Items */}
                    {insights.action_items && insights.action_items.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-orange-600" />
                            <span>Today's Action Items</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {insights.action_items.map((item, index) => (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getActionTypeColor(item.type)}`}>
                                  {item.type}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{item.title}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{item.estimated_time}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recommendations */}
                    {insights.recommendations && insights.recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Lightbulb className="h-5 w-5 text-yellow-600" />
                            <span>AI Recommendations</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {insights.recommendations.map((rec, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm">{rec.title}</h4>
                                  <Badge className={getPriorityColor(rec.priority)}>
                                    {rec.priority}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs text-green-600 font-medium">
                                    Expected Profit: ₹{rec.expected_profit?.toFixed(0) || 'N/A'}
                                  </div>
                                  <div className="text-xs text-blue-600">
                                    Confidence: {(rec.confidence * 100)?.toFixed(0) || 'N/A'}%
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">{rec.personalized_reason}</div>
                                <div className="text-xs text-gray-500">{rec.implementation_time}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Bundle Recommendations */}
                    {insights.bundle_recommendations && insights.bundle_recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-purple-600" />
                            <span>Smart Bundle Recommendations</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {insights.bundle_recommendations.map((bundle, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm">{bundle.bundle_name}</h4>
                                  <Badge className="bg-purple-100 text-purple-800">
                                    {bundle.market_trend}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div className="text-xs">
                                    <span className="font-medium">Expected Revenue:</span> ₹{bundle.expected_revenue.toFixed(0)}
                                  </div>
                                  <div className="text-xs">
                                    <span className="font-medium">Profit Margin:</span> {(bundle.profit_margin * 100).toFixed(0)}%
                                  </div>
                                  <div className="text-xs">
                                    <span className="font-medium">Demand Forecast:</span> {bundle.demand_forecast.toFixed(1)}
                                  </div>
                                  <div className="text-xs">
                                    <span className="font-medium">Confidence:</span> {(bundle.confidence * 100).toFixed(0)}%
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  <span className="font-medium">Products:</span> {bundle.products.map(p => p.name).join(', ')}
                                </div>
                                <div className="text-xs text-green-600">
                                  {bundle.personalized_factors.join(' • ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Personalization Info */}
                    {insights.personalization && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Sparkles className="h-5 w-5 text-pink-600" />
                            <span>Personalization Profile</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-pink-600 capitalize">
                                {insights.personalization.user_segment.replace('_', ' ')}
                              </div>
                              <div className="text-sm text-gray-600">User Segment</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {(insights.personalization.confidence_score * 100).toFixed(0)}%
                              </div>
                              <div className="text-sm text-gray-600">AI Confidence</div>
                            </div>
                          </div>
                          <div className="mt-4 text-xs text-gray-500 text-center">
                            Last updated: {new Date(insights.personalization.last_updated).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Sustainability */}
                    {insights.sustainability && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Leaf className="h-5 w-5 text-emerald-600" />
                            <span>Sustainability Score</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center mb-4">
                            <div className="text-3xl font-bold text-emerald-600">
                              {insights.sustainability.current_score}/10
                            </div>
                            <div className="text-sm text-gray-600">Current Score</div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Improvements:</h4>
                            {insights.sustainability.improvements.map((improvement, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{improvement}</span>
                              </div>
                            ))}
                          </div>
                          {insights.sustainability.personalized_tips && insights.sustainability.personalized_tips.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="font-medium text-sm text-pink-600">Personalized Tips:</h4>
                              {insights.sustainability.personalized_tips.map((tip, index) => (
                                <div key={index} className="text-xs text-pink-600 flex items-center space-x-2">
                                  <Sparkles className="h-3 w-3" />
                                  <span>{tip}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Yet</h3>
                    <p className="text-gray-600 mb-4">Start a conversation to get AI-powered business insights</p>
                    <Button onClick={() => setActiveTab('chat')} className="bg-green-600 hover:bg-green-700">
                      Start Chat
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default VendorConcierge;
