import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ShoppingCart, Leaf, Award, ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import heroImage from '@/assets/hero-sustainable-products.jpg';
import bambooBottle from '@/assets/product-bamboo-bottle.jpg';
import cottonBags from '@/assets/product-cotton-bags.jpg';
import skincareSet from '@/assets/product-skincare-set.jpg';

const taglines = [
  "Buy better. Live lighter.",
  "Sustainable choices, beautiful life.",
  "Earth-friendly finds, delivered."
];

// All available product images for cycling
const allImages = [bambooBottle, cottonBags, skincareSet];

// Fallback images for products without images
const fallbackImages = [bambooBottle, cottonBags, skincareSet];

const HeroSection = () => {
  const [currentTagline, setCurrentTagline] = React.useState(0);
  const [isTaglineVisible, setIsTaglineVisible] = React.useState(true);
  const [currentCarouselIndex, setCurrentCarouselIndex] = React.useState(0);
  const [cardImageIndexes, setCardImageIndexes] = React.useState<{ [key: number]: number }>({});
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [cardsLoaded, setCardsLoaded] = React.useState(false);

  const carouselRef = React.useRef<HTMLDivElement>(null);

  // Supabase integration
  const { data: featuredProducts, isLoading, error } = useFeaturedProducts(16);
  const { addToCart } = useCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { user } = useAuth();

  // Tagline animation effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsTaglineVisible(false);
      setTimeout(() => {
        setCurrentTagline((prev) => (prev + 1) % taglines.length);
        setIsTaglineVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Carousel auto-scroll effect
  React.useEffect(() => {
    if (!featuredProducts || featuredProducts.length === 0) return;
    
    const autoScrollInterval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(autoScrollInterval);
  }, [currentCarouselIndex, featuredProducts]);

  // Cards loaded animation effect
  React.useEffect(() => {
    if (featuredProducts && featuredProducts.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        setCardsLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [featuredProducts, isLoading]);

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  const handleToggleWishlist = (product: any) => {
    if (user) {
      addToWishlist.mutate(product.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getProductImages = (product: any) => {
    if (product.image_url) {
      return [product.image_url, ...fallbackImages];
    }
    return fallbackImages;
  };

  const getProductBadges = (product: any) => {
    const badges = [];
    if (product.sustainability_score >= 95) badges.push("Zero Waste");
    if (product.sustainability_score >= 90) badges.push("Organic");
    if (product.sustainability_score >= 85) badges.push("Cruelty-Free");
    return badges;
  };

  const productsPerView = 4;
  const topProducts = featuredProducts || [];
  const totalPages = Math.ceil(topProducts.length / productsPerView);
  
  // Ensure we have at least 4 pages for pagination dots
  const displayPages = Math.max(4, totalPages);

  const handleNext = () => {
    if (topProducts.length === 0 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentCarouselIndex((prevIndex) => {
      const nextIndex = (prevIndex + productsPerView);
      return nextIndex >= topProducts.length ? 0 : nextIndex;
    });
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrev = () => {
    if (topProducts.length === 0 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentCarouselIndex((prevIndex) => {
      const prevStartIndex = prevIndex - productsPerView;
      return prevStartIndex < 0 ? Math.max(0, (totalPages - 1) * productsPerView) : prevStartIndex;
    });
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleImageIndicatorClick = (e: React.MouseEvent, productId: number, imageIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCardImageIndexes(prev => ({ ...prev, [productId]: imageIndex }));
  };

  const visibleProducts = topProducts.slice(currentCarouselIndex, currentCarouselIndex + productsPerView);
  if (visibleProducts.length < productsPerView && topProducts.length >= productsPerView) {
    visibleProducts.push(...topProducts.slice(0, productsPerView - visibleProducts.length));
  }

  // Loading skeleton component
  const ProductSkeleton = () => (
    <div className="flex-none w-[calc(25%-2px)] px-3">
      <div className="group flex flex-col h-full bg-card/80 backdrop-blur-sm border border-border/20 rounded-xl shadow-lg animate-pulse">
        <div className="relative">
          <div className="w-full h-40 bg-gray-200"></div>
          <div className="absolute top-2 right-2 bg-gray-300 rounded-full w-12 h-6"></div>
        </div>
        <div className="flex-1 flex flex-col p-3">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="flex-1"></div>
          <div className="pt-2 border-t border-border/20 mt-2">
            <div className="w-full h-9 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden flex items-start justify-center">
      {/* Parallax Background */}
      <div className="absolute inset-0 parallax-layer">
        <img
          src={heroImage}
          alt="Sustainable lifestyle products"
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className="relative z-10 container mx-auto px-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Hero Content (left side, taking 2 of 5 columns) */}
          <div className="lg:col-span-2 space-y-6 slide-up text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-headline font-bold text-charcoal leading-tight">
                Sustainability
                <span className="text-forest block">Simplified</span>
              </h1>
              
              <div className="h-12 flex items-center justify-center lg:justify-start">
                <p
                  className={`text-lg lg:text-xl text-muted-foreground transition-all duration-300 ${
                    isTaglineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  {taglines[currentTagline]}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="btn-hero" asChild>
                <a href="/products">
                  Shop Collections
                  <ShoppingCart className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button variant="outline" className="btn-outline" asChild>
                <a href="/about">
                  Learn Impact
                  <Award className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </div>

            {/* Impact Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 mt-8 border-t border-border/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-forest">XXX</div>
                <div className="text-sm text-muted-foreground">Trees Planted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-forest">XXT</div>
                <div className="text-sm text-muted-foreground">CO₂ Offset</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-forest">XX</div>
                <div className="text-sm text-muted-foreground">Plastic Saved</div>
              </div>
            </div>
          </div>

          {/* Top Eco Picks Carousel (right side, taking 3 of 5 columns) */}
          <div className="lg:col-span-3 slide-up">
            <div className="lg:-ml-12 space-y-4">
              <h2 className="text-xl font-headline font-bold text-charcoal text-center lg:text-left">
                Top Picks
              </h2>
              
              <div className="relative">
                {/* Carousel Container */}
                <div ref={carouselRef} className="flex overflow-hidden relative -mx-3 transition-transform duration-300 ease-in-out">
                  {isLoading ? (
                    // Show loading skeletons
                    Array.from({ length: 4 }).map((_, index) => (
                      <ProductSkeleton key={index} />
                    ))
                  ) : error ? (
                    // Show error state
                    <div className="col-span-4 text-center text-red-500 py-8">
                      Failed to load products. Please try again.
                    </div>
                  ) : (
                    visibleProducts.map((product, index) => {
                      const productImages = getProductImages(product);
                      const badges = getProductBadges(product);
                      const currentImageIndex = cardImageIndexes[product.id] || 0;
                      
                      return (
                        <div 
                          key={`${product.id}-${currentCarouselIndex}`}
                          className={`flex-none w-[calc(25%-2px)] px-3 transition-all duration-500 ease-out ${
                            cardsLoaded 
                              ? 'opacity-100 translate-y-0' 
                              : 'opacity-0 translate-y-8'
                          }`}
                          style={{ transitionDelay: `${index * 100}ms` }}
                        >
                          <Link 
                            to={`/product/${product.id}`}
                            className="group flex flex-col h-full bg-card/80 backdrop-blur-sm border border-border/20 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:border-border/40 overflow-hidden hover:scale-[1.02] origin-center block"
                          >
                            {/* Image Section with Gallery */}
                            <div className="relative">
                              <img 
                                src={productImages[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-moss bg-background/80 px-2 py-1 rounded-full shadow-md">
                                <Leaf className="w-3 h-3" />
                                <span>{product.sustainability_score}%</span>
                              </div>
                              {/* Image Gallery Indicators */}
                              <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {productImages.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => handleImageIndicatorClick(e, product.id, index)}
                                    className={`h-2 w-2 rounded-full transition-all duration-200 ${
                                      currentImageIndex === index 
                                        ? 'bg-black/75 scale-110' 
                                        : 'bg-black/40 hover:bg-black/60'
                                    }`}
                                    aria-label={`View image ${index + 1}`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Content Section */}
                            <div className="flex-1 flex flex-col p-3">
                              <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-lg font-bold text-forest">
                                  {formatPrice(product.price)}
                                </span>
                                {product.discount > 0 && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.price / (1 - product.discount / 100))}
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="font-semibold text-charcoal text-sm leading-tight h-10 line-clamp-2">
                                {product.name}
                              </h3>

                              <div className="flex-1"></div>

                              <div className="pt-2 border-t border-border/20 mt-2">
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    className="flex-1 btn-secondary text-sm h-9"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAddToCart(product);
                                    }}
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart
                                  </Button>
                                  {user && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-9 h-9 rounded-full border-forest/30 text-forest hover:bg-forest/10"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleToggleWishlist(product);
                                      }}
                                    >
                                      <Heart className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Carousel Navigation Buttons */}
                {!isLoading && !error && topProducts.length > productsPerView && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-1/2 left-[-42px] transform -translate-y-1/2 text-charcoal hover:text-forest bg-background/50 hover:bg-background/80 rounded-full transition-all duration-300 z-20"
                      onClick={handlePrev}
                      disabled={isTransitioning}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-1/2 right-[-42px] transform -translate-y-1/2 text-charcoal hover:text-forest bg-background/50 hover:bg-background/80 rounded-full transition-all duration-300 z-20"
                      onClick={handleNext}
                      disabled={isTransitioning}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </>
                )}

                {/* Pagination Dots */}
                {!isLoading && !error && topProducts.length > 0 && (
                  <div className="flex justify-center items-center space-x-2 mt-4">
                    {Array.from({ length: displayPages }).map((_, pageIndex) => {
                      const isActive = Math.floor(currentCarouselIndex / productsPerView) === pageIndex;
                      const isVisible = pageIndex < totalPages; // Only show dots for actual pages
                      return (
                        <button
                          key={pageIndex}
                          onClick={() => {
                            if (isTransitioning || !isVisible) return;
                            setIsTransitioning(true);
                            setCurrentCarouselIndex(pageIndex * productsPerView);
                            setTimeout(() => setIsTransitioning(false), 300);
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            isActive 
                              ? 'bg-forest scale-110' 
                              : isVisible 
                                ? 'bg-forest/30 hover:bg-forest/50' 
                                : 'bg-forest/10 cursor-not-allowed'
                          }`}
                          disabled={isTransitioning || !isVisible}
                          aria-label={`Go to page ${pageIndex + 1}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="text-center pt-1">
                <Button variant="ghost" className="text-forest hover:text-forest/80 text-sm" asChild>
                  <a href="/products">
                    View All  →
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;