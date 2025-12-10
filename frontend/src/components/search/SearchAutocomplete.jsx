"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { productSearch } from "../../lib/api";

export default function SearchAutocomplete({ 
  searchQuery, 
  onSearchChange, 
  onSearchSubmit, 
  onSelectItem,
  placeholder = "Search eco-friendly products...",
  className = ""
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && searchQuery.trim().length > 2) {
        fetchSuggestions(searchQuery.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await productSearch.autocomplete(query, 8);
      
      if (response && response.suggestions) {
        setSuggestions(response.suggestions);
        setShowSuggestions(response.suggestions.length > 0);
      } else if (response && Array.isArray(response)) {
        setSuggestions(response);
        setShowSuggestions(response.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      
      if (error.message === 'Failed to fetch') {
        console.warn('Backend API is not available. Using mock data for search suggestions.');
        
        // Mock data for demonstration when backend is not available
        const mockSuggestions = [
          {
            id: '1',
            name: 'Eco-Friendly Water Bottle',
            type: 'product',
            image: '/placeholder-product.jpg',
            price: 24.99,
            category: 'Kitchen & Dining',
            slug: 'eco-friendly-water-bottle'
          },
          {
            id: '2',
            name: 'Organic Cotton T-Shirt',
            type: 'product',
            image: '/placeholder-product.jpg',
            price: 19.99,
            category: 'Clothing',
            slug: 'organic-cotton-t-shirt'
          },
          {
            id: '3',
            name: 'Bamboo Kitchen Utensils Set',
            type: 'product',
            image: '/placeholder-product.jpg',
            price: 34.99,
            category: 'Kitchen & Dining',
            slug: 'bamboo-kitchen-utensils-set'
          },
          {
            id: '4',
            name: 'Solar-Powered Watch',
            type: 'product',
            image: '/placeholder-product.jpg',
            price: 89.99,
            category: 'Electronics',
            slug: 'solar-powered-watch'
          },
          {
            id: '5',
            name: 'Reusable Shopping Bags',
            type: 'product',
            image: '/placeholder-product.jpg',
            price: 12.99,
            category: 'Home & Garden',
            slug: 'reusable-shopping-bags'
          }
        ].filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
        );
        
        setSuggestions(mockSuggestions);
        setShowSuggestions(mockSuggestions.length > 0);
        return;
      }
      
      // Fallback: try to get products directly if autocomplete fails
      try {
        const fallbackResponse = await productSearch.search({
          query: query,
          limit: 8,
          filters: {}
        });
        if (fallbackResponse && fallbackResponse.products) {
          const productSuggestions = fallbackResponse.products.map(product => ({
            id: product.id,
            name: product.name || product.title,
            type: 'product',
            image: product.images?.[0]?.url || product.image,
            price: product.price,
            category: product.category?.name,
            slug: product.slug
          }));
          setSuggestions(productSuggestions);
          setShowSuggestions(productSuggestions.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    onSearchChange(value);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearchSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          onSearchSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (typeof window !== 'undefined') {
      if (suggestion.type === 'product') {
        // Navigate to product page
        window.location.href = `/products/${suggestion.slug || suggestion.id}`;
      } else if (suggestion.type === 'category') {
        // Navigate to category page
        window.location.href = `/explore?category=${suggestion.slug || suggestion.name}`;
      } else {
        // Set search query and submit
        onSearchChange(suggestion.name || suggestion.title || suggestion.query);
        setShowSuggestions(false);
        setTimeout(() => {
          onSearchSubmit({ preventDefault: () => {} });
        }, 100);
      }
    }
    onSelectItem?.(suggestion);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative w-full">
      <div className={`${className} flex items-center gap-2 w-full`}>
          {/* Search Icon */}
          <button type="button" onClick={onSearchSubmit} className="w-6 h-6 flex items-center justify-center">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" className="text-[#1a3d0a]">
              <path d="M16 16L12.375 12.375M14.25 7.625C14.25 11.2869 11.2869 14.25 7.625 14.25C3.96309 14.25 1 11.2869 1 7.625C1 3.96309 3.96309 1 7.625 1C11.2869 1 14.25 3.96309 14.25 7.625Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Search Input */}
          <input
            ref={searchRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            className="bg-transparent border-none outline-none text-[#1a3d0a] text-[20px] font-reem font-normal placeholder:text-[#4a7c28] w-full cursor-text"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Loading indicator */}
          {isLoading && (
            <div className="w-4 h-4 animate-spin">
              <svg className="w-full h-full text-[#1a3d0a]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-[#f8fdf8] to-[#e8f5e8] border border-[#4a7c28] rounded-2xl shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id || suggestion.name || index}`}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${
                index === selectedIndex 
                  ? 'bg-[#4a7c28]/20 text-[#1a3d0a]' 
                  : 'hover:bg-[#4a7c28]/10 text-[#2d5016]'
              } ${index === 0 ? 'rounded-t-2xl' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-2xl border-b-0' : 'border-b border-[#4a7c28]/20'
              }`}
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {/* Icon based on suggestion type */}
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4a7c28]/10 border border-[#4a7c28]/20">
                {suggestion.type === 'product' ? (
                  suggestion.image ? (
                    <img 
                      src={suggestion.image} 
                      alt={suggestion.name}
                      className="w-6 h-6 object-cover rounded-full"
                    />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#1a3d0a]">
                      <path d="M20 7L12 3L4 7L12 11L20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 7V17L12 21L20 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                ) : suggestion.type === 'category' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#1a3d0a]">
                    <path d="M3 3H21V21H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#1a3d0a]">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              {/* Suggestion content */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {suggestion.name || suggestion.title || suggestion.query}
                </div>
                {suggestion.category && (
                  <div className="text-xs text-[#4a7c28] truncate">
                    in {suggestion.category}
                  </div>
                )}
                {suggestion.price && (
                  <div className="text-xs font-semibold text-[#1a3d0a]">
                    ₹{suggestion.price}
                  </div>
                )}
              </div>

              {/* Type indicator */}
              <div className="text-xs text-[#4a7c28] opacity-70 capitalize">
                {suggestion.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
