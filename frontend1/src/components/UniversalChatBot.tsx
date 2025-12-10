import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useVendorAuth } from '@/hooks/useVendorAuth';
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
  CheckCircle,
  Search,
  BookOpen,
  Phone,
  Mail,
  Settings,
  TrendingUp,
  Users,
  Shield,
  CreditCard,
  Truck,
  RotateCcw,
  Star,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Home,
  Store,
  BarChart3
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  function_calls?: any[];
  messageType?: 'text' | 'faq' | 'help' | 'action';
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  questions: FAQItem[];
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const UniversalChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const closeChat = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsMinimized(false);
      setIsClosing(false);
    }, 300);
  };
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAIConnected, setIsAIConnected] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated: isUserAuthenticated } = useAuth();
  const { vendor, isAuthenticated: isVendorAuthenticated } = useVendorAuth();

  // Determine user type
  const userType = isVendorAuthenticated() ? 'vendor' : isUserAuthenticated() ? 'customer' : 'guest';
  const currentUser = userType === 'vendor' ? vendor : user;

  // FAQ Categories and Questions
  const faqCategories: FAQCategory[] = [
    {
      id: 'general',
      title: 'General',
      icon: HelpCircle,
      color: 'text-blue-600',
      questions: [
        {
          id: 'what-is-aveoearth',
          question: 'What is AveoEarth?',
          answer: 'AveoEarth is a sustainable e-commerce platform that connects eco-conscious consumers with environmentally responsible vendors. We focus on promoting sustainable products and practices.',
          category: 'general',
          tags: ['platform', 'sustainability', 'eco-friendly']
        },
        {
          id: 'how-to-signup',
          question: 'How do I create an account?',
          answer: 'You can create an account by clicking the "Sign Up" button in the top right corner. Choose between a customer or vendor account, then follow the simple registration process.',
          category: 'general',
          tags: ['account', 'registration', 'signup']
        },
        {
          id: 'contact-support',
          question: 'How can I contact support?',
          answer: 'You can contact our support team through the chat widget, email at support@aveoearth.com, or call us at +1-800-AVEO-HELP. We typically respond within 24 hours.',
          category: 'general',
          tags: ['support', 'contact', 'help']
        }
      ]
    },
    {
      id: 'shopping',
      title: 'Shopping',
      icon: ShoppingCart,
      color: 'text-green-600',
      questions: [
        {
          id: 'how-to-search',
          question: 'How do I search for products?',
          answer: 'Use the search bar at the top of the page. You can search by product name, category, or keywords. Use filters to narrow down results by price, brand, or sustainability features.',
          category: 'shopping',
          tags: ['search', 'products', 'filters']
        },
        {
          id: 'add-to-cart',
          question: 'How do I add items to my cart?',
          answer: 'Click the "Add to Cart" button on any product page. You can adjust quantities and select variants before adding. Your cart will show the total and allow you to proceed to checkout.',
          category: 'shopping',
          tags: ['cart', 'add', 'products']
        },
        {
          id: 'wishlist',
          question: 'How do I use the wishlist?',
          answer: 'Click the heart icon on any product to add it to your wishlist. You can view your wishlist by clicking the heart icon in the header. Save items for later purchase.',
          category: 'shopping',
          tags: ['wishlist', 'save', 'favorites']
        }
      ]
    },
    {
      id: 'orders',
      title: 'Orders & Shipping',
      icon: Truck,
      color: 'text-purple-600',
      questions: [
        {
          id: 'track-order',
          question: 'How do I track my order?',
          answer: 'After placing an order, you\'ll receive a tracking number via email. You can also track orders in your account dashboard under "Order History".',
          category: 'orders',
          tags: ['tracking', 'orders', 'shipping']
        },
        {
          id: 'shipping-times',
          question: 'What are the shipping times?',
          answer: 'Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days. International shipping may take 7-14 business days depending on the destination.',
          category: 'orders',
          tags: ['shipping', 'delivery', 'times']
        },
        {
          id: 'return-policy',
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some items like personalized products may not be returnable.',
          category: 'orders',
          tags: ['returns', 'policy', 'refunds']
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments',
      icon: CreditCard,
      color: 'text-orange-600',
      questions: [
        {
          id: 'payment-methods',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely.',
          category: 'payments',
          tags: ['payment', 'cards', 'secure']
        },
        {
          id: 'refund-process',
          question: 'How do refunds work?',
          answer: 'Refunds are processed within 5-7 business days after we receive your returned item. The refund will be credited to your original payment method.',
          category: 'payments',
          tags: ['refunds', 'money', 'process']
        }
      ]
    },
    {
      id: 'vendor',
      title: 'Vendor Support',
      icon: Store,
      color: 'text-emerald-600',
      questions: [
        {
          id: 'become-vendor',
          question: 'How do I become a vendor?',
          answer: 'Click "Become a Vendor" in the header, complete the application form, and upload required documents. Our team will review your application within 2-3 business days.',
          category: 'vendor',
          tags: ['vendor', 'application', 'sell']
        },
        {
          id: 'vendor-dashboard',
          question: 'How do I manage my products?',
          answer: 'Use your vendor dashboard to add, edit, and manage products. You can track sales, manage inventory, and view analytics all in one place.',
          category: 'vendor',
          tags: ['dashboard', 'products', 'management']
        },
        {
          id: 'vendor-payments',
          question: 'How do I get paid?',
          answer: 'We process vendor payments monthly. You can set up your bank account details in the vendor dashboard. Payments are typically processed by the 15th of each month.',
          category: 'vendor',
          tags: ['payments', 'vendor', 'money']
        }
      ]
    },
    {
      id: 'sustainability',
      title: 'Sustainability',
      icon: Leaf,
      color: 'text-green-600',
      questions: [
        {
          id: 'eco-badges',
          question: 'What are eco-badges?',
          answer: 'Eco-badges indicate a product\'s environmental impact. They show certifications like organic, recycled, carbon-neutral, etc. Look for these badges when shopping.',
          category: 'sustainability',
          tags: ['eco', 'badges', 'environment']
        },
        {
          id: 'carbon-footprint',
          question: 'How do you calculate carbon footprint?',
          answer: 'We calculate carbon footprint based on product materials, manufacturing process, packaging, and shipping distance. This helps you make informed environmental choices.',
          category: 'sustainability',
          tags: ['carbon', 'footprint', 'environment']
        }
      ]
    }
  ];

  const quickActions = [
    { icon: Search, label: 'Search Products', action: 'search', color: 'text-blue-600' },
    { icon: ShoppingCart, label: 'View Cart', action: 'cart', color: 'text-green-600' },
    { icon: Truck, label: 'Track Order', action: 'track', color: 'text-purple-600' },
    { icon: HelpCircle, label: 'Get Help', action: 'help', color: 'text-orange-600' },
    { icon: BookOpen, label: 'Browse FAQs', action: 'faq', color: 'text-indigo-600' },
    { icon: Phone, label: 'Contact Support', action: 'contact', color: 'text-red-600' }
  ];

  const suggestionChips = [
    "How do I track my order?",
    "What payment methods do you accept?",
    "How do I become a vendor?",
    "What is your return policy?",
    "How do I search for products?",
    "What are eco-badges?",
    "How do I contact support?",
    "How do I add items to cart?"
  ];

  useEffect(() => {
    if (isOpen) {
      // Add welcome message based on user type
      const welcomeMessage: ChatMessage = {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date().toISOString(),
        messageType: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, userType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcomeMessage = () => {
    switch (userType) {
      case 'vendor':
        return `Welcome back, ${currentUser?.business_name || 'Vendor'}! I'm your AI business assistant. I can help you with analytics, recommendations, product management, and more. How can I assist you today?`;
      case 'customer':
        return `Hello ${currentUser?.first_name || 'there'}! I'm here to help you with shopping, orders, sustainability questions, and any other support you need. What can I help you with?`;
      default:
        return `Welcome to AveoEarth! I'm your AI assistant here to help you discover sustainable products, answer questions, and guide you through our platform. How can I assist you today?`;
    }
  };

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
      timestamp: new Date().toISOString(),
      messageType: 'text'
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
          user_token: currentUser?.id || 'guest',
          session_id: `universal-chat-${userType}`,
          user_type: userType
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
          function_calls: data.function_calls,
          messageType: 'text'
        };

        setMessages(prev => [...prev, aiMessage]);

        // Show success toast for function calls
        if (data.function_calls && data.function_calls.length > 0) {
          toast({
            title: 'Action Completed',
            description: 'I\'ve executed the requested action for you.',
          });
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Universal ChatBot Error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date().toISOString(),
        messageType: 'text'
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

  const handleQuickAction = (action: string) => {
    const actionMessages = {
      search: "Help me search for products",
      cart: "Show me my shopping cart",
      track: "Help me track my order",
      help: "I need help with something",
      faq: "Show me frequently asked questions",
      contact: "I want to contact support"
    };

    const message = actionMessages[action as keyof typeof actionMessages];
    if (message) {
      handleSendMessage(message);
    }
  };

  const handleFAQClick = (faq: FAQItem) => {
    const faqMessage: ChatMessage = {
      id: `faq_${Date.now()}`,
      role: 'assistant',
      content: `**${faq.question}**\n\n${faq.answer}`,
      timestamp: new Date().toISOString(),
      messageType: 'faq'
    };
    setMessages(prev => [...prev, faqMessage]);
    setActiveTab('chat');
  };

  const filteredFAQs = () => {
    let filtered = faqCategories;
    
    if (selectedCategory) {
      filtered = filtered.filter(cat => cat.id === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })).filter(cat => cat.questions.length > 0);
    }
    
    return filtered;
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-[hsl(var(--forest-deep))] to-[hsl(var(--moss-accent))] hover:from-[hsl(157_75%_12%)] hover:to-[hsl(120_40%_65%)] shadow-lg hover:shadow-xl transition-all duration-300 group"
          size="icon"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
        <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">AI</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[700px]'
    } w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AveoEarth Assistant</h3>
              <p className="text-sm text-green-100">
                {userType === 'vendor' ? 'Business Support' : 
                 userType === 'customer' ? 'Shopping Support' : 'General Help'}
              </p>
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
              onClick={closeChat}
              className="text-white hover:bg-red-500/20 h-8 w-8 border border-white/30 hover:border-red-300"
              title="Close Chat"
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
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="faq">FAQs</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col p-4 space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
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
                            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
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
                        <span className="text-sm">Thinking...</span>
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
                  placeholder="Ask me anything..."
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

            {/* FAQ Tab */}
            <TabsContent value="faq" className="flex-1 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedCategory === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                      >
                        All
                      </Button>
                      {faqCategories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.title}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* FAQ Categories */}
                  {filteredFAQs().map((category) => (
                    <Card key={category.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <category.icon className={`h-5 w-5 ${category.color}`} />
                          <span>{category.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {category.questions.map((faq) => (
                            <div
                              key={faq.id}
                              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleFAQClick(faq)}
                            >
                              <h4 className="font-medium text-sm mb-1">{faq.question}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2">{faq.answer}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {faq.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Help Tab */}
            <TabsContent value="help" className="flex-1 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <span>Contact Support</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">support@aveoearth.com</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">+1-800-AVEO-HELP</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Available 24/7 for urgent issues
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        <span>Resources</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <BookOpen className="h-4 w-4 mr-2" />
                          User Guide
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          Privacy Policy
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Terms of Service
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {userType === 'vendor' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                          <span>Vendor Resources</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Analytics Dashboard
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Package className="h-4 w-4 mr-2" />
                            Product Management
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Users className="h-4 w-4 mr-2" />
                            Customer Support
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default UniversalChatBot;
