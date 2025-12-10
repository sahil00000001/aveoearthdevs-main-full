import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/contexts/SearchContext';
import { useSearchProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { 
  Search, 
  Star, 
  Heart, 
  ShoppingCart, 
  Leaf, 
  Filter,
  Grid3X3,
  LayoutList,
  ArrowLeft
} from 'lucide-react';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  
  const { navigateToSearch } = useSearch();
  const { data: searchResults, isLoading: isSearching, error: searchError } = useSearchProducts(searchQuery);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  // Get search query from URL
  useEffect(() => {
    const query = searchParams.get('query') || searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateToSearch(searchQuery.trim());
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  const handleToggleWishlist = (product: any) => {
    if (user) {
      addToWishlist.mutate(product.id);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'relevance': return 'Relevance';
      case 'price-low': return 'Price: Low to High';
      case 'price-high': return 'Price: High to Low';
      case 'name': return 'Name: A to Z';
      case 'newest': return 'Newest First';
      default: return 'Relevance';
    }
  };

  if (isSearching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching products...</p>
        </div>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">Search Error</h2>
          <p className="text-muted-foreground mb-4">Something went wrong while searching.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-charcoal mb-2">
                Search Results
                {searchQuery && (
                  <span className="text-muted-foreground font-normal">
                    {' '}for "{searchQuery}"
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground">
                {searchResults.length} product{searchResults.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search sustainable products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </form>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none border-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none border-0"
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {searchResults.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-charcoal mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or browse our categories
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
              <Button variant="outline" asChild>
                <Link to="/products">Browse All Products</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {searchResults.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={product.image_url || '/api/placeholder/300/300'}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                            onClick={() => handleToggleWishlist(product)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                        {product.discount > 0 && (
                          <Badge className="absolute top-3 left-3 bg-clay text-white">
                            {product.discount}% OFF
                          </Badge>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-moss/20 text-forest text-xs">
                            <Leaf className="w-3 h-3 mr-1" />
                            {product.sustainability_score}%
                          </Badge>
                          {product.categories && (
                            <Badge variant="outline" className="text-xs">
                              {product.categories.name}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-charcoal mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-forest">
                              {formatPrice(product.price)}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.price / (1 - product.discount / 100))}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </>
                  ) : (
                    // List View
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={product.image_url || '/api/placeholder/96/96'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-charcoal mb-1 line-clamp-1">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-moss/20 text-forest text-xs">
                                <Leaf className="w-3 h-3 mr-1" />
                                {product.sustainability_score}%
                              </Badge>
                              {product.categories && (
                                <Badge variant="outline" className="text-xs">
                                  {product.categories.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleWishlist(product)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-forest">
                              {formatPrice(product.price)}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.price / (1 - product.discount / 100))}
                              </span>
                            )}
                          </div>
                          <Button size="sm" onClick={() => handleAddToCart(product)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
