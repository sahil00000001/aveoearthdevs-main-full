import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useProducts, useSearchProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { 
  Filter, 
  Star, 
  Heart, 
  ShoppingCart, 
  Leaf, 
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  ChevronDown,
  Search
} from 'lucide-react';

const categories = {
  'all': 'Explore All Products', 
  'zerowaste': 'Zero Waste Essentials',
  'fashion': 'Sustainable Fashion',
  'upcycled': 'Upcycled & Repurposed',
  'beauty': 'Conscious Beauty',
  'green-tech': 'Green Technology'
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearching, setIsSearching] = useState(false);

  const currentCategory = category || 'all';
  const { data: productsData, isLoading, error } = useProducts(1, 100);
  const { data: searchResults, isLoading: isSearchLoading } = useSearchProducts(searchTerm);
  const { addToCart } = useCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { user } = useAuth();

  // Determine which data to use
  const products = isSearching ? searchResults : (productsData?.data || []);
  const isLoadingProducts = isSearching ? isSearchLoading : isLoading;

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  const handleToggleWishlist = (product: any) => {
    if (user) {
      addToWishlist.mutate(product.id);
    }
  };

  const handleBadgeChange = (badge: string) => {
    setSelectedBadges(prev => 
      prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
    );
  };

  const handleRatingChange = (rating: string) => {
    setSelectedRating(prev => 
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  const clearAllFilters = () => {
    setSelectedBadges([]);
    setSelectedRating([]);
    setSearchTerm('');
    setIsSearching(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  if (isLoadingProducts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error loading products. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-moss text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-headline font-bold">
              {categories[currentCategory as keyof typeof categories] || 'Products'}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Discover sustainable products in this category
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Search */}
              <Card>
                <CardContent className="p-4">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </form>
                  {isSearching && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleClearSearch}
                      className="w-full mt-2"
                    >
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Eco Badges Filter */}
              <Card className="p-4 space-y-2">
                <h4 className="font-bold text-base text-charcoal flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-moss" />
                  Eco Badges
                </h4>
                <div className="space-y-2">
                  {['Zero Waste', 'Organic', 'Renewable', 'Fair Trade', 'Cruelty-Free', 'Vegan'].map((badge) => (
                    <label key={badge} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-forest border-border rounded-md" 
                        checked={selectedBadges.includes(badge)}
                        onChange={() => handleBadgeChange(badge)}
                      />
                      <span className="text-sm text-gray-600">{badge}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Rating Filter */}
              <Card className="p-4 space-y-2">
                <h4 className="font-bold text-base text-charcoal">Rating</h4>
                <div className="space-y-2">
                  {['4+ Stars', '3+ Stars'].map((rating) => (
                    <label key={rating} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-forest border-border rounded-md" 
                        checked={selectedRating.includes(rating)}
                        onChange={() => handleRatingChange(rating)}
                      />
                      <span className="text-sm text-gray-600">{rating}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  {products.length} products found
                </span>
                {(selectedBadges.length > 0 || selectedRating.length > 0) && (
                  <div className="text-xs text-muted-foreground">
                    {selectedBadges.length > 0 && (
                      <span className="mr-3">{selectedBadges.length} badge filter(s)</span>
                    )}
                    {selectedRating.length > 0 && (
                      <span>{selectedRating.length} rating filter(s)</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 border border-border rounded-lg bg-background"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="eco-score">Best Eco Score</option>
                </select>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products */}
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-charcoal mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <Card key={product.id} className="group cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-2xl">
                        <img 
                          src={product.image_url || '/api/placeholder/300/300'} 
                          alt={product.name}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {user && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 text-white hover:text-red-500 bg-black/20 hover:bg-white/90 rounded-full"
                            onClick={() => handleToggleWishlist(product)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        )}
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className="bg-forest/90 text-white text-xs">
                            <Leaf className="w-3 h-3 mr-1" />
                            {product.sustainability_score}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-charcoal group-hover:text-forest transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium ml-1">4.5</span>
                            </div>
                            <span className="text-sm text-muted-foreground">(123)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Leaf className="w-4 h-4 text-moss" />
                            <span className="text-sm font-medium text-moss">{product.sustainability_score}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-charcoal">{formatPrice(product.price)}</span>
                            {product.discount > 0 && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.price / (1 - product.discount / 100))}
                              </span>
                            )}
                          </div>
                          {product.discount > 0 && (
                            <Badge className="bg-clay text-white">
                              {product.discount}% OFF
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 btn-primary"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button asChild variant="outline" className="px-3">
                            <Link to={`/product/${product.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;