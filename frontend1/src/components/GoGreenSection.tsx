import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Recycle, 
  Award, 
  Heart,
  ShoppingCart,
  Star,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { useEcoFriendlyProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/EnhancedAuthContext';

const GoGreenSection = () => {
  const { data: ecoProducts, isLoading, error } = useEcoFriendlyProducts(24);
  const { addToCart } = useCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { user } = useAuth();

  // Carousel state
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [cardsLoaded, setCardsLoaded] = React.useState(false);

  const productsPerPage = 12; // 3x4 grid
  const totalPages = Math.ceil((ecoProducts?.length || 0) / productsPerPage);

  // Cards loaded animation effect
  React.useEffect(() => {
    if (ecoProducts && ecoProducts.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        setCardsLoaded(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [ecoProducts, isLoading]);

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const handleToggleWishlist = (product: any) => {
    if (user) {
      // Check if product is in wishlist (simplified for now)
      addToWishlist.mutate(product.id);
    }
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentPage((prev) => (prev + 1) % totalPages);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getProductImages = (product: any) => {
    return [product.image_url, '/api/placeholder/400/400', '/api/placeholder/400/400'];
  };

  const visibleProducts = ecoProducts?.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  ) || [];

  // Loading skeleton
  const ProductSkeleton = () => (
    <div className="group flex flex-col h-full bg-gradient-to-br from-forest/5 to-moss/10 backdrop-blur-sm border border-forest/20 rounded-2xl shadow-lg animate-pulse">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-forest/20 to-moss/20 rounded-t-2xl"></div>
        <div className="absolute top-3 right-3 bg-forest/20 rounded-full w-12 h-6"></div>
        <div className="absolute top-3 left-3 bg-forest/20 rounded-full w-16 h-6"></div>
      </div>
      <div className="flex-1 flex flex-col p-4">
        <div className="h-4 bg-forest/20 rounded mb-2"></div>
        <div className="h-3 bg-moss/20 rounded w-2/3 mb-3"></div>
        <div className="flex-1"></div>
        <div className="pt-3 border-t border-forest/10 mt-3">
          <div className="w-full h-10 bg-forest/20 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-24 bg-gradient-to-br from-forest/5 via-moss/10 to-clay/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-forest/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-moss/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-clay/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-forest rounded-2xl shadow-lg animate-pulse">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <Badge className="eco-badge text-lg px-6 py-2 bg-moss text-white border-0 shadow-lg hover:bg-moss/90 transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Go Green Picks
            </Badge>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-headline font-bold text-forest mb-6 animate-fade-in-up">
            Top Eco-Friendly Products
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Handpicked sustainable products that make a real difference. 
            <span className="text-forest font-semibold animate-pulse"> Shop with purpose</span> and track your positive impact on the planet.
          </p>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-sm border border-forest/20 shadow-2xl p-8 hover:shadow-3xl transition-all duration-500">
            {isLoading ? (
              // Show loading skeletons in 3x4 grid
              <div className="grid grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              // Show error state
              <div className="text-center text-red-500 py-16">
                <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Failed to load eco-friendly products. Please try again.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-6">
                {visibleProducts.map((product, index) => (
                  <div 
                    key={`${product.id}-${currentPage}`}
                    className={`transition-all duration-700 ease-out ${
                      cardsLoaded 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-12 scale-95'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <Link 
                      to={`/product/${product.id}`}
                      className="group flex flex-col h-full bg-white/95 backdrop-blur-sm border border-forest/20 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-forest/40 overflow-hidden hover:scale-[1.02] origin-center block hover:bg-forest/5"
                    >
                      {/* Product Image */}
                      <div className="relative overflow-hidden">
                        <div className="w-full h-48 bg-forest/20 flex items-center justify-center group-hover:bg-moss/20 transition-colors duration-300">
                          <div className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity duration-300">🌱</div>
                        </div>
                        
                        {/* Eco Score Badge */}
                        <div className="absolute top-3 right-3 bg-forest text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg hover:bg-moss transition-colors duration-300 hover:scale-110">
                          <Leaf className="w-3 h-3 animate-pulse" />
                          {product.ecoScore || `${product.sustainability_score}%`}
                        </div>
                        
                        {/* Sustainability Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-moss text-white text-xs px-3 py-1 shadow-lg hover:bg-clay transition-colors duration-300 hover:scale-105">
                            <Zap className="w-3 h-3 mr-1 animate-bounce" />
                            Eco
                          </Badge>
                        </div>

                        {/* Wishlist Button */}
                        {user && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-3 right-12 w-10 h-10 p-0 bg-white/90 hover:bg-forest hover:text-white text-muted-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleWishlist(product);
                            }}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Carbon Impact */}
                        <div className="absolute bottom-3 left-3 right-3 bg-forest text-white px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-moss transition-colors duration-300 hover:scale-105">
                          <Recycle className="w-4 h-4 animate-spin" />
                          <span>-{product.carbonSaved || '1.5kg'} CO₂</span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col p-4 space-y-3">
                        <div>
                          <div className="text-sm text-moss font-semibold mb-1">
                            {product.categories?.name || 'Sustainable Living'}
                          </div>
                          <h3 className="font-bold text-charcoal text-sm leading-tight line-clamp-2 group-hover:text-forest transition-colors">
                            {product.name}
                          </h3>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1">
                          {product.badges?.slice(0, 2).map((badge: string) => (
                            <Badge key={badge} className="eco-badge text-xs bg-forest/10 text-forest border-forest/20">
                              {badge}
                            </Badge>
                          ))}
                        </div>

                        {/* Price & Discount */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-forest">
                              {formatPrice(product.price)}
                            </span>
                            {product.discount > 0 && (
                              <>
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.price / (1 - product.discount / 100))}
                                </span>
                                <Badge variant="secondary" className="text-xs bg-red-100 text-red-600">
                                  {product.discount}% OFF
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Add to Cart Button */}
                        <Button 
                          className="w-full btn-secondary group relative overflow-hidden hover:bg-forest hover:text-white transition-all duration-300 hover:scale-105"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                          Add to Cart
                        </Button>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Carousel Navigation */}
            {!isLoading && !error && totalPages > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 text-charcoal hover:text-white hover:bg-forest bg-white/80 rounded-full transition-all duration-300 z-20 shadow-lg hover:scale-110 hover:shadow-xl"
                  onClick={handlePrev}
                  disabled={isTransitioning}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-charcoal hover:text-white hover:bg-forest bg-white/80 rounded-full transition-all duration-300 z-20 shadow-lg hover:scale-110 hover:shadow-xl"
                  onClick={handleNext}
                  disabled={isTransitioning}
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Pagination Dots */}
            {!isLoading && !error && totalPages > 1 && (
              <div className="flex justify-center items-center space-x-3 mt-8">
                {Array.from({ length: totalPages }).map((_, pageIndex) => {
                  const isActive = currentPage === pageIndex;
                  return (
                    <button
                      key={pageIndex}
                      onClick={() => {
                        if (isTransitioning) return;
                        setIsTransitioning(true);
                        setCurrentPage(pageIndex);
                        setTimeout(() => setIsTransitioning(false), 300);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isActive 
                          ? 'bg-forest scale-110' 
                          : 'bg-forest/30 hover:bg-moss hover:scale-110'
                      }`}
                      disabled={isTransitioning}
                      aria-label={`Go to page ${pageIndex + 1}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Impact Summary */}
        <div className="mt-16 bg-forest/10 rounded-3xl p-8 shadow-xl border border-forest/20 hover:bg-moss/10 transition-colors duration-500">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-forest mb-2 group-hover:scale-110 transition-transform duration-300 group-hover:text-moss">8.7kg</div>
              <div className="text-sm text-muted-foreground font-medium group-hover:text-forest transition-colors duration-300">Total CO₂ Saved</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-forest mb-2 group-hover:scale-110 transition-transform duration-300 group-hover:text-moss">24</div>
              <div className="text-sm text-muted-foreground font-medium group-hover:text-forest transition-colors duration-300">Trees Planted</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-forest mb-2 group-hover:scale-110 transition-transform duration-300 group-hover:text-moss">94%</div>
              <div className="text-sm text-muted-foreground font-medium group-hover:text-forest transition-colors duration-300">Avg Eco Score</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-forest mb-2 group-hover:scale-110 transition-transform duration-300 group-hover:text-moss">5.2k</div>
              <div className="text-sm text-muted-foreground font-medium group-hover:text-forest transition-colors duration-300">Happy Customers</div>
            </div>
          </div>
        </div>

        {/* View All CTA */}
        <div className="text-center mt-16">
          <Button className="btn-hero text-lg px-8 py-4 bg-forest hover:bg-moss text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:animate-pulse">
            <Award className="w-6 h-6 mr-3 group-hover:animate-bounce" />
            View All Eco Products
            <Sparkles className="w-5 h-5 ml-2 animate-spin" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GoGreenSection;