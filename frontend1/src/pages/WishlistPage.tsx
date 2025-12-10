import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Leaf, 
  Trash2,
  Share2,
  ArrowRight,
  Filter,
  Grid3X3,
  LayoutList
} from 'lucide-react';

const WishlistPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  const { data: wishlist, isLoading, error } = useWishlist();
  const { addToCart } = useCart();
  const removeFromWishlist = useRemoveFromWishlist();
  const { user } = useAuth();

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist.mutate(productId);
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold text-charcoal">Please Sign In</h2>
          <p className="text-muted-foreground">You need to be signed in to view your wishlist.</p>
          <Button asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error loading wishlist. Please try again.</p>
        </div>
      </div>
    );
  }

  const wishlistItems = wishlist || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-moss text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8" />
              <h1 className="text-4xl lg:text-5xl font-headline font-bold">
                My Wishlist
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Your favorite sustainable products saved for later
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in wishlist
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-border rounded-lg bg-background"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
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

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-charcoal mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start adding products you love to your wishlist
            </p>
            <Button asChild>
              <Link to="/products">
                Browse Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <img 
                      src={item.image_url || '/api/placeholder/300/300'} 
                      alt={item.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:text-red-500 bg-black/20 hover:bg-white/90 rounded-full"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge className="bg-forest/90 text-white text-xs">
                        <Leaf className="w-3 h-3 mr-1" />
                        {item.sustainability_score}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-charcoal group-hover:text-forest transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.description}
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
                        <span className="text-sm font-medium text-moss">{item.sustainability_score}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-charcoal">{formatPrice(item.price)}</span>
                        {item.discount > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.price / (1 - item.discount / 100))}
                          </span>
                        )}
                      </div>
                      {item.discount > 0 && (
                        <Badge className="bg-clay text-white">
                          {item.discount}% OFF
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 btn-primary"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button asChild variant="outline" className="px-3">
                        <Link to={`/product/${item.id}`}>
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="px-3">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/products">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button>
              Add All to Cart
              <ShoppingCart className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;