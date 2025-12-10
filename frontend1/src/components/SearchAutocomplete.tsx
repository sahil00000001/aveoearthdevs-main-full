import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { useSearchProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, TrendingUp, Clock, Star, Leaf } from 'lucide-react';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  className?: string;
}

// Popular search suggestions
const popularSearches = [
  'bamboo products',
  'organic cotton',
  'zero waste',
  'eco-friendly',
  'sustainable fashion',
  'natural beauty',
  'recycled materials',
  'biodegradable',
  'vegan products',
  'fair trade'
];

// Trending categories
const trendingCategories = [
  { name: 'Home & Living', icon: '🏠', count: '120+ products' },
  { name: 'Sustainable Fashion', icon: '👕', count: '85+ products' },
  { name: 'Clean Beauty', icon: '💄', count: '60+ products' },
  { name: 'Fitness', icon: '💪', count: '45+ products' },
  { name: 'Pets', icon: '🐕', count: '30+ products' }
];

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search sustainable products...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: searchResults, isLoading } = useSearchProducts(value);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(newValue.length > 0);
    setSelectedIndex(-1);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      saveRecentSearch(value.trim());
      onSubmit(value.trim());
      setIsOpen(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    saveRecentSearch(suggestion);
    onSubmit(suggestion);
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const suggestions = [
      ...(searchResults?.slice(0, 5) || []),
      ...popularSearches.slice(0, 3)
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex];
          if (typeof suggestion === 'string') {
            handleSuggestionClick(suggestion);
          } else {
            handleSuggestionClick(suggestion.name);
          }
        } else if (value.trim()) {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = [
    ...(searchResults?.slice(0, 5) || []),
    ...popularSearches.slice(0, 3)
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(value.length > 0)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all duration-200"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-forest border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search Results */}
          {searchResults && searchResults.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                Products ({searchResults.length})
              </div>
              {searchResults.slice(0, 5).map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.name)}
                  className={`w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-3 ${
                    selectedIndex === index ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={product.image_url || '/api/placeholder/32/32'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-charcoal truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ₹{product.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-moss">
                    <Leaf className="w-3 h-3" />
                    <span>{product.sustainability_score}%</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchResults?.length && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleSuggestionClick(search)}
                  className={`w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                    selectedIndex === index ? 'bg-muted/50' : ''
                  }`}
                >
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!searchResults?.length && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Popular Searches
              </div>
              {popularSearches.slice(0, 5).map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleSuggestionClick(search)}
                  className={`w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                    selectedIndex === index ? 'bg-muted/50' : ''
                  }`}
                >
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Categories */}
          <div className="p-2 border-t border-border/20">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
              Trending Categories
            </div>
            <div className="grid grid-cols-1 gap-1">
              {trendingCategories.map((category, index) => (
                <button
                  key={category.name}
                  onClick={() => handleSuggestionClick(category.name)}
                  className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {category.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Search Tips */}
          <div className="p-2 border-t border-border/20">
            <div className="text-xs text-muted-foreground px-2">
              💡 Try searching for "eco-friendly", "organic", or "sustainable"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
