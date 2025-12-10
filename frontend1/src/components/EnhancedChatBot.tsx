import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { aiService, ChatMessage, FunctionCall } from '@/services/aiService';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import AveoBuddyVideo from '@/assets/AveoBuddy.webm';
import { 
  MessageCircle, 
  X, 
  Send, 
  Leaf,
  ShoppingCart,
  Package,
  HelpCircle,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const quickActions = [
  { icon: ShoppingCart, label: 'Track Order', action: 'track' },
  { icon: Package, label: 'View Cart', action: 'cart' },
  { icon: Leaf, label: 'Eco Products', action: 'eco' },
  { icon: HelpCircle, label: 'Get Help', action: 'help' }
];

const suggestionChips = [
  "How do I calculate my carbon footprint?",
  "What are eco badges?",
  "How does the vendor program work?",
  "Show me trending products",
  "What's in my wishlist?",
  "Help me find sustainable office supplies"
];

const EnhancedChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm AveoBuddy, your sustainable shopping companion 🌱 How can I help you make better choices today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIConnected, setIsAIConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { user, isBackendConnected } = useAuth();

  // Check AI service connection on mount
  useEffect(() => {
    const checkAIConnection = async () => {
      try {
        const isAvailable = await aiService.isAvailable();
        setIsAIConnected(isAvailable);
        setConnectionStatus(isAvailable ? 'connected' : 'disconnected');
      } catch (error) {
        setIsAIConnected(false);
        setConnectionStatus('disconnected');
      }
    };
    checkAIConnection();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Click outside to close functionality
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend) return;

    if (!isAIConnected) {
      toast({
        title: 'AI Service Unavailable',
        description: 'The AI assistant is currently offline. Please try again later.',
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
      const response = await aiService.sendMessageWithAuth(textToSend);
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        function_calls: response.function_calls
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show success toast for function calls
      if (response.function_calls && response.function_calls.length > 0) {
        toast({
          title: 'Action Completed',
          description: 'I\'ve executed the requested action for you.',
        });
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      
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
        description: 'Failed to get response from AI assistant.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    const actionMessages = {
      track: "I'd be happy to help you track your order! Please share your order number.",
      cart: "Let me show you what's in your cart.",
      eco: "Here are some eco-friendly products I recommend:",
      help: "I'm here to help! What specific question do you have about our products or services?"
    };

    const message = actionMessages[action as keyof typeof actionMessages] || actionMessages.help;
    await handleSendMessage(message);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = async () => {
    try {
      await aiService.clearConversationHistory();
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm AveoBuddy, your sustainable shopping companion 🌱 How can I help you make better choices today?",
          timestamp: new Date().toISOString()
        }
      ]);
      toast({
        title: 'Chat Cleared',
        description: 'Conversation history has been cleared.',
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear conversation history.',
        variant: 'destructive',
      });
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'AI Connected';
      case 'disconnected':
        return 'AI Offline';
      default:
        return 'Checking...';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-[25px] right-[25px] z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-16 w-16 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="relative">
            <video
              className="w-8 h-8 rounded-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src={AveoBuddyVideo} type="video/webm" />
            </video>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div ref={chatRef} className="fixed bottom-[85px] right-[25px] z-50 w-96 max-h-[575px]">
      <Card className="bg-white shadow-2xl border-0 rounded-2xl overflow-hidden transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <video
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={AveoBuddyVideo} type="video/webm" />
                </video>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                  {getConnectionStatusIcon()}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">AveoBuddy</h3>
                <p className="text-xs text-green-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {getConnectionStatusText()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="h-80 p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : ''}`}>
                      <div className={`relative px-4 py-3 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl rounded-bl-2xl'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-t-2xl rounded-bl-2xl'
                      }`}
                      style={msg.role === 'user' 
                        ? {
                            borderRadius: '1rem 1rem 0.25rem 1rem'
                          }
                        : {
                            borderRadius: '1rem 1rem 1rem 0.25rem'
                          }
                      }>
                        {/* Message tail */}
                        {msg.role === 'user' && (
                          <div className="absolute -right-2 bottom-0 w-0 h-0 border-l-[8px] border-l-blue-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                        )}
                        {msg.role === 'assistant' && (
                          <div className="absolute -left-2 bottom-0 w-0 h-0 border-r-[8px] border-r-gray-200 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                        )}
                        <p className="text-sm leading-relaxed relative z-10">{msg.content}</p>
                        {msg.function_calls && msg.function_calls.length > 0 && (
                          <div className="mt-2 space-y-1 relative z-10">
                            {msg.function_calls.map((call, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                                {call.function}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                      <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                          <span className="text-sm text-gray-600">AveoBuddy is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="p-4 border-t">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.action}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.action)}
                    className="text-xs h-8"
                    disabled={!isAIConnected}
                  >
                    <action.icon className="w-3 h-3 mr-1" />
                    {action.label}
                  </Button>
                ))}
              </div>

              </div>
          </>
        )}

          {/* Input Bar - Always Visible (Even when minimized) */}
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2">
                <Input
                type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 h-11 text-sm border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg px-4 bg-white"
                  disabled={!isAIConnected || isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || !isAIConnected || isLoading}
                size="default"
                className="h-11 w-11 p-0 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center shadow-md"
                >
                  {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                  <Send className="w-5 h-5 text-white" />
                  )}
                </Button>
              </div>
            {!isMinimized && (
              <div className="flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear Chat
                </Button>
              </div>
            )}
            </div>
      </Card>
    </div>
  );
};

export default EnhancedChatBot;
