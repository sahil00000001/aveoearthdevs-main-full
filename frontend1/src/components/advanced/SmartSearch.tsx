import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  Leaf, 
  DollarSign, 
  Clock,
  TrendingUp,
  Sparkles,
  SlidersHorizontal,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface SearchFilter {
  category: string;
  priceRange: [number, number];
  sustainabilityScore: number;
  rating: number;
  tags: string[];
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'sustainability' | 'newest';
  inStock: boolean;
  onSale: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'tag' | 'trending';
  popularity?: number;
}

interface SearchResult {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sustainabilityScore: number;
  category: string;
  tags: string[];
  inStock: boolean;
  onSale: boolean;
  description: string;
}

const SmartSearch: React.FC<{
  onSearch: (query: string, filters: SearchFilter) => void;
  onResultClick: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}> = ({ onSearch, onResultClick, placeholder = "Search sustainable products...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({
    category: 'all',
    priceRange: [0, 1000],
    sustainabilityScore: 0,
    rating: 0,
    tags: [],
    sortBy: 'relevance',
    inStock: false,
    onSale: false
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State for dynamic data
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions from Supabase
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 1) {
        setIsLoading(true);
        try {
          // Fetch categories, brands, and popular tags from Supabase
          const { data: categories } = await supabase
            .from('categories')
            .select('name, slug')
            .ilike('name', `%${query}%`)
            .limit(3);

          const { data: brands } = await supabase
            .from('brands')
            .select('name, slug')
            .ilike('name', `%${query}%`)
            .limit(2);

          const suggestions: SearchSuggestion[] = [
            ...(categories || []).map(cat => ({
              id: cat.slug,
              text: cat.name,
              type: 'category' as const,
              popularity: 90
            })),
            ...(brands || []).map(brand => ({
              id: brand.slug,
              text: brand.name,
              type: 'brand' as const,
              popularity: 85
            }))
          ];

          setSuggestions(suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [query]);

  const handleSearch = async (searchQuery: string = query, searchFilters: SearchFilter = filters) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      // Build query for Supabase
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          compare_at_price,
          short_description,
          slug,
          status,
          approval_status,
          visibility,
          published_at,
          materials,
          tags,
          categories!inner(name, slug),
          brands!inner(name, slug),
          product_images!inner(image_url, alt_text, is_primary),
          product_inventory(quantity),
          product_sustainability_scores(overall_score)
        `)
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .eq('visibility', 'visible')
        .ilike('name', `%${searchQuery}%`);

      // Apply category filter
      if (searchFilters.category !== 'all') {
        query = query.eq('categories.slug', searchFilters.category);
      }

      // Apply price range filter
      if (searchFilters.priceRange[0] > 0) {
        query = query.gte('price', searchFilters.priceRange[0]);
      }
      if (searchFilters.priceRange[1] < 1000) {
        query = query.lte('price', searchFilters.priceRange[1]);
      }

      // Apply sustainability score filter
      if (searchFilters.sustainabilityScore > 0) {
        query = query.gte('product_sustainability_scores.overall_score', searchFilters.sustainabilityScore);
      }

      // Apply stock filter
      if (searchFilters.inStock) {
        query = query.gt('product_inventory.quantity', 0);
      }

      // Apply sale filter
      if (searchFilters.onSale) {
        query = query.not('compare_at_price', 'is', null);
      }

      // Apply sorting
      switch (searchFilters.sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('published_at', { ascending: false });
          break;
        case 'sustainability':
          query = query.order('product_sustainability_scores(overall_score)', { ascending: false });
          break;
        default:
          query = query.order('name', { ascending: true });
      }

      const { data: products, error } = await query.limit(20);

      if (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } else {
        // Transform data to match SearchResult interface
        const results: SearchResult[] = (products || []).map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.compare_at_price,
          image: product.product_images?.[0]?.image_url || '/api/placeholder/200/200',
          rating: 4.5, // Default rating - you might want to add this to your schema
          sustainabilityScore: product.product_sustainability_scores?.[0]?.overall_score || 0,
          category: product.categories?.name || 'Uncategorized',
          tags: product.tags || [],
          inStock: (product.product_inventory?.[0]?.quantity || 0) > 0,
          onSale: !!product.compare_at_price,
          description: product.short_description || ''
        }));

        setSearchResults(results);
        onSearch(searchQuery, searchFilters);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch(suggestion.text);
  };

  const handleFilterChange = (key: keyof SearchFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [0, 1000],
      sustainabilityScore: 0,
      rating: 0,
      tags: [],
      sortBy: 'relevance',
      inStock: false,
      onSale: false
    });
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product': return <Search className="h-4 w-4" />;
      case 'category': return <Filter className="h-4 w-4" />;
      case 'tag': return <Leaf className="h-4 w-4" />;
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product': return 'text-blue-600';
      case 'category': return 'text-green-600';
      case 'tag': return 'text-purple-600';
      case 'trending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-20 py-2"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleSearch()}
            size="sm"
            className="h-8 px-3 bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white"
            disabled={isSearching}
          >
            {isSearching ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-2">
            <div className="space-y-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-left"
                >
                  <div className={getSuggestionColor(suggestion.type)}>
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <span className="flex-1 text-sm">{suggestion.text}</span>
                  {suggestion.popularity && (
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.popularity}%
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="absolute top-full left-0 right-0 z-40 mt-1 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Advanced Filters</h3>
                <Button onClick={clearFilters} variant="ghost" size="sm">
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="all">All Categories</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="personal-care">Personal Care</option>
                    <option value="accessories">Accessories</option>
                    <option value="drinkware">Drinkware</option>
                    <option value="storage">Storage</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                      className="w-20"
                    />
                  </div>
                </div>

                {/* Sustainability Score */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min Sustainability Score: {filters.sustainabilityScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.sustainabilityScore}
                    onChange={(e) => handleFilterChange('sustainabilityScore', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min Rating: {filters.rating}⭐
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="sustainability">Sustainability</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    />
                    <span className="text-sm">In Stock Only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.onSale}
                      onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                    />
                    <span className="text-sm">On Sale</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowFilters(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={() => handleSearch()} className="bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-30 mt-1 shadow-lg max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => onResultClick(result)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                >
                  <img
                    src={result.image}
                    alt={result.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{result.name}</h4>
                    <p className="text-xs text-gray-600 truncate">{result.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{result.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Leaf className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">{result.sustainabilityScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[hsl(var(--forest-deep))]">
                      ${result.price}
                    </div>
                    {result.originalPrice && (
                      <div className="text-xs text-gray-500 line-through">
                        ${result.originalPrice}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartSearch;


