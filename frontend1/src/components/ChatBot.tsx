import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AveoBuddyVideo from '@/assets/AveoBuddy.webm';
import { 
  MessageCircle, 
  X, 
  Send, 
  Leaf,
  ShoppingCart,
  Package,
  HelpCircle,
  Minimize2
} from 'lucide-react';

const quickActions = [
  { icon: ShoppingCart, label: 'Track Order', action: 'track' },
  { icon: Package, label: 'Return Item', action: 'return' },
  { icon: Leaf, label: 'Eco Impact', action: 'impact' },
  { icon: HelpCircle, label: 'Get Help', action: 'help' }
];

const suggestionChips = [
  "What's your most eco-friendly product?",
  "How do I calculate my carbon footprint?",
  "Tell me about your sustainability mission",
  "What are eco badges?",
  "How does the vendor program work?"
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! I'm AveoBuddy, your sustainable shopping companion 🌱 How can I help you make better choices today?",
      time: '12:34'
    }
  ]);

  const handleQuickAction = (action: string) => {
    const actionMessages = {
      track: "I'd be happy to help you track your order! Please share your order number.",
      return: "I can guide you through our hassle-free return process. What item would you like to return?",
      impact: "Great question! Your purchases have helped plant 3 trees and offset 2.1kg of CO₂ this month. 🌿",
      help: "I'm here to help! What specific question do you have about our products or services?"
    };

    addMessage('user', quickActions.find(qa => qa.action === action)?.label || '');
    setTimeout(() => {
      addMessage('bot', actionMessages[action as keyof typeof actionMessages]);
    }, 500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addMessage('user', suggestion);
    
    // Simulate bot response
    setTimeout(() => {
      if (suggestion.includes('eco-friendly')) {
        addMessage('bot', "Our bamboo water bottle is our #1 eco-friendly pick! It's made from sustainable bamboo, comes with a cork lid, and saves 250+ plastic bottles per year. Plus, every purchase plants a tree! 🌳");
      } else if (suggestion.includes('carbon footprint')) {
        addMessage('bot', "I can help you calculate that! Our products show individual CO₂ savings. Your current cart will offset 1.8kg CO₂. Want me to suggest more eco-friendly alternatives?");
      } else if (suggestion.includes('sustainability mission')) {
        addMessage('bot', "We're on a mission to make sustainable living accessible! Every product is carefully vetted for environmental impact, ethical sourcing, and quality. We've planted 50K+ trees and offset 25T of CO₂ so far! 🌍");
      } else if (suggestion.includes('eco badges')) {
        addMessage('bot', "Eco badges help you shop consciously! Look for: 🌱 Zero Waste, ♻️ Recycled Materials, 🌿 Organic, 🔄 Compostable, and ⚡ Energy Efficient. Each badge means real environmental benefits!");
      } else if (suggestion.includes('vendor program')) {
        addMessage('bot', "Our vendor program helps sustainable brands reach conscious consumers! We provide marketing support, impact tracking, and fair commission rates. Interested in joining our green marketplace?");
      }
    }, 800);
  };

  const addMessage = (type: 'user' | 'bot', text: string) => {
    const newMessage = {
      type,
      text,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    addMessage('user', message);
    setMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      addMessage('bot', "Thanks for your question! I'm processing your request and will have personalized eco-friendly recommendations for you shortly. 🌱");
    }, 1000);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50" style={{ 
        paddingBottom: '20px',
        paddingRight: '20px',
        maxWidth: 'calc(100vw - 20px)',
        maxHeight: 'calc(100vh - 20px)'
      }}>
        <div
          onClick={() => setIsOpen(true)}
          className="w-56 h-64 cursor-pointer hover:scale-105 transition-all duration-300"
          style={{
            overflow: 'visible',
            transformOrigin: 'center center'
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
            title="AveoBuddy - Your Sustainable Shopping Companion"
            style={{ 
              transform: 'translate(0, 0)',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <source src={AveoBuddyVideo} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 transition-all duration-300 shadow-hero ${
        isMinimized ? 'h-14' : 'h-96'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20 bg-forest rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
                title="AveoBuddy"
              >
                <source src={AveoBuddyVideo} type="video/webm" />
              </video>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">AveoBuddy</div>
              <div className="text-xs text-moss/80">Sustainable Shopping Companion</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 p-0 text-white hover:bg-white/20"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 p-0 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-48 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.type === 'user' 
                      ? 'bg-forest text-white' 
                      : 'bg-muted text-charcoal'
                  }`}>
                    <div>{msg.text}</div>
                    <div className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-moss/80' : 'text-muted-foreground'
                    }`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <div className="text-xs text-muted-foreground mb-2">Quick actions:</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.action}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAction(action.action)}
                      className="h-8 text-xs justify-start"
                    >
                      <action.icon className="w-3 h-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground mb-2">Try asking:</div>
                <div className="space-y-1">
                  {suggestionChips.slice(0, 2).map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 text-xs mr-1 mb-1"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border/20">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about sustainable products..."
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="w-8 h-8 p-0 bg-forest hover:bg-forest/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatBot;