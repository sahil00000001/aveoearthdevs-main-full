import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useProducts, useSearchProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useSearch } from '@/contexts/SearchContext';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import {
  Search,
  Filter,
  Star,
  Heart,
  ShoppingCart,
  Leaf,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  TrendingUp
} from 'lucide-react';

const AllProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const { data: productsData, isLoading, error } = useProducts(currentPage, 50, selectedCategory);
  const { data: searchResults, isLoading: isSearchLoading } = useSearchProducts(searchQuery, selectedCategory);
  const { addToCart } = useCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { user } = useAuth();
  const { navigateToSearch } = useSearch();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
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

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="product-card group cursor-pointer">
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
            {product.badges?.map((badge: string, index: number) => (
              <Badge key={index} className="bg-forest/90 text-white text-xs">
                {badge}
              </Badge>
            ))}
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
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-moss text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-headline font-bold">
              Sustainable Products
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Discover eco-friendly products that make a difference for our planet
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <h3 className="font-semibold text-charcoal">Search</h3>
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={(query) => {
                  if (query.trim()) {
                    setIsSearching(true);
                  } else {
                    setIsSearching(false);
                  }
                }}
                placeholder="Search products..."
                className="w-full"
              />
              {isSearching && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearSearch}
                  className="w-full"
                >
                  Clear Search
                </Button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h3 className="font-semibold text-charcoal">Categories</h3>
              <div className="space-y-1">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('')}
                >
                  All Products
                </Button>
                <Button
                  variant={selectedCategory === 'Zero Waste' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('Zero Waste')}
                >
                  Zero Waste
                </Button>
                <Button
                  variant={selectedCategory === 'Sustainable Fashion' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('Sustainable Fashion')}
                >
                  Sustainable Fashion
                </Button>
                <Button
                  variant={selectedCategory === 'Natural Beauty' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('Natural Beauty')}
                >
                  Natural Beauty
                </Button>
                <Button
                  variant={selectedCategory === 'Green Technology' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('Green Technology')}
                >
                  Green Technology
                </Button>
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <h3 className="font-semibold text-charcoal">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-background"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="eco-score">Best Eco Score</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  Showing {products.length} products
                </span>
              </div>
              
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

            {/* Products Grid */}
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
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {productsData && productsData.totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: productsData.totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(productsData.totalPages, prev + 1))}
                  disabled={currentPage === productsData.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProductsPage;