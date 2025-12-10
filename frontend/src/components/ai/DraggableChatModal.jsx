"use client";

import { useState, useRef, useEffect } from "react";
import { chatService } from "../../services/chatService";

// Simple SVG Icons
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polygon points="22,2 15,22 11,13 2,9 22,2" fill="currentColor"/>
  </svg>
);

const BotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 7v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const MinimizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DraggableChatModal = ({ isOpen, onClose, userType = "buyer", initialPosition = null }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: userType === "supplier" 
        ? "Hello! I'm your AveoEarth AI assistant for suppliers. I can help you manage products, track orders, analyze performance, and provide business insights. How can I assist you today?"
        : "Hello! I'm your AveoEarth AI assistant. I can help you search for products, manage your cart, track orders, and much more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const headerRef = useRef(null);

  // Theme colors based on user type
  const theme = userType === "supplier" 
    ? { primary: "#1b6145", secondary: "#22c55e", light: "#dcfce7" }
    : { primary: "#76c7c0", secondary: "#6bb5ae", light: "#f0fdfa" };

  // Dragging functionality
  const handleMouseDown = (e) => {
    if (headerRef.current && headerRef.current.contains(e.target)) {
      setIsDragging(true);
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep modal within viewport bounds
      const modalWidth = 400;
      const modalHeight = isMinimized ? 60 : 500;
      const maxX = window.innerWidth - modalWidth;
      const maxY = window.innerHeight - modalHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  // Generate session ID on first load
  useEffect(() => {
    if (!sessionId) {
      // Fallback UUID generation for browsers that don't support crypto.randomUUID()
      const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        // Fallback UUID v4 generation
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      setSessionId(generateUUID());
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Get user token if available
      const userToken = localStorage.getItem('accessToken');
      
      const response = await chatService.sendMessage({
        message: userMessage.content,
        user_token: userToken,
        session_id: sessionId,
        user_type: userType
      });

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        function_calls: response.function_calls
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update session ID if provided
      if (response.session_id) {
        setSessionId(response.session_id);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col transition-all duration-200 resize overflow-hidden"
      style={{ 
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        height: isMinimized ? '60px' : '500px',
        minWidth: '300px',
        minHeight: '200px',
        maxWidth: '800px',
        maxHeight: '600px',
        zIndex: 9999,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div 
          ref={headerRef}
          className={`flex items-center justify-between p-3 border-b border-gray-200 rounded-t-lg cursor-grab active:cursor-grabbing`}
          style={{ backgroundColor: theme.light }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.primary }}
            >
              <BotIcon />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                AI Assistant {userType === "supplier" ? "- Supplier" : ""}
              </h3>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              <MinimizeIcon />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              title="Close"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Messages - Hidden when minimized */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ backgroundColor: theme.light }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 mb-1">
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <BotIcon />
                        </div>
                        <span className="text-xs text-gray-500">AI</span>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.role === 'user'
                          ? 'text-white'
                          : message.isError
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                      style={message.role === 'user' ? { backgroundColor: theme.primary } : {}}
                    >
                      <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                      {message.function_calls && message.function_calls.length > 0 && (
                        <div className="mt-1 pt-1 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            Executed {message.function_calls.length} action(s)
                          </p>
                        </div>
                      )}
                    </div>
                    <div className={`text-xs text-gray-400 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-1 mb-1">
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <BotIcon />
                      </div>
                      <span className="text-xs text-gray-500">AI</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:border-transparent"
                    style={{ 
                      maxHeight: '60px',
                      focusRingColor: theme.primary
                    }}
                    rows="1"
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    inputMessage.trim() && !isLoading
                      ? 'text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  style={inputMessage.trim() && !isLoading ? { 
                    backgroundColor: theme.primary,
                    ':hover': { backgroundColor: theme.secondary }
                  } : {}}
                >
                  <SendIcon />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {userType === "supplier" 
                  ? "Ask about products, orders, analytics, or business insights!"
                  : "Ask about products, orders, or account help!"
                }
              </p>
            </div>
          </>
        )}
        
        {/* Resize Handle - Hidden when minimized */}
        {!isMinimized && (
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
            style={{ 
              background: `linear-gradient(-45deg, transparent 30%, ${theme.primary} 30%, ${theme.primary} 40%, transparent 40%, transparent 60%, ${theme.primary} 60%, ${theme.primary} 70%, transparent 70%)`,
              borderBottomRightRadius: '8px'
            }}
            title="Resize"
          />
        )}
      </div>
  );
};

export default DraggableChatModal;
