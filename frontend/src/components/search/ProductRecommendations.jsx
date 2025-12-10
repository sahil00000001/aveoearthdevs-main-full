"use client";

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';

export default function ProductRecommendations({ 
  type = "trending",
  productId = null,
  category = null,
  limit = 8,
  title = null,
  className = "",
  showTitle = true
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const defaultTitles = {
    trending: "Trending Products",
    "top-rated": "Top Rated Products", 
    "new-arrivals": "New Arrivals",
    "best-sellers": "Best Sellers",
    personalized: "Recommended for You",
    "cross-sell": "You might also like",
    upsell: "Upgrade Options",
    similar: "Similar Products",
    seasonal: "Seasonal Picks"
  };

  const displayTitle = title || defaultTitles[type] || "Recommended Products";

  // Mock product data
  const mockProducts = [
    {
      id: 1,
      name: "Bamboo Toothbrush Set",
      slug: "bamboo-toothbrush-set",
      short_description: "Eco-friendly bamboo toothbrushes for the whole family",
      price: 25,
      compare_at_price: 35,
      rating: 4.8,
      review_count: 156,
      primary_image: "/hero1.png",
      category_name: "Personal Care",
      images: ["/hero1.png"]
    },
    {
      id: 2,
      name: "Organic Cotton Tote Bag",
      slug: "organic-cotton-tote-bag",
      short_description: "Durable and stylish organic cotton shopping bag",
      price: 18,
      compare_at_price: 25,
      rating: 4.6,
      review_count: 89,
      primary_image: "/hero1.png",
      category_name: "Fashion",
      images: ["/hero1.png"]
    },
    {
      id: 3,
      name: "Stainless Steel Water Bottle",
      slug: "stainless-steel-water-bottle",
      short_description: "Insulated water bottle keeps drinks cold for 24 hours",
      price: 35,
      compare_at_price: 45,
      rating: 4.9,
      review_count: 234,
      primary_image: "/hero1.png",
      category_name: "Drinkware",
      images: ["/hero1.png"]
    },
    {
      id: 4,
      name: "Recycled Paper Notebook",
      slug: "recycled-paper-notebook",
      short_description: "Eco-friendly notebook made from 100% recycled paper",
      price: 12,
      compare_at_price: 18,
      rating: 4.4,
      review_count: 67,
      primary_image: "/hero1.png",
      category_name: "Stationery",
      images: ["/hero1.png"]
    },
    {
      id: 5,
      name: "Solar Power Bank",
      slug: "solar-power-bank",
      short_description: "Portable solar charger for all your devices",
      price: 45,
      compare_at_price: 60,
      rating: 4.5,
      review_count: 123,
      primary_image: "/hero1.png",
      category_name: "Tech",
      images: ["/hero1.png"]
    },
    {
      id: 6,
      name: "Hemp Fiber Yoga Mat",
      slug: "hemp-fiber-yoga-mat",
      short_description: "Natural hemp yoga mat for sustainable practice",
      price: 65,
      compare_at_price: 85,
      rating: 4.7,
      review_count: 198,
      primary_image: "/hero1.png",
      category_name: "Fitness",
      images: ["/hero1.png"]
    },
    {
      id: 7,
      name: "Wooden Kitchen Utensil Set",
      slug: "wooden-kitchen-utensil-set",
      short_description: "Complete set of sustainable bamboo kitchen tools",
      price: 28,
      compare_at_price: 40,
      rating: 4.6,
      review_count: 145,
      primary_image: "/hero1.png",
      category_name: "Kitchen",
      images: ["/hero1.png"]
    },
    {
      id: 8,
      name: "Organic Skincare Set",
      slug: "organic-skincare-set",
      short_description: "Natural skincare routine with organic ingredients",
      price: 55,
      compare_at_price: 75,
      rating: 4.8,
      review_count: 267,
      primary_image: "/hero1.png",
      category_name: "Beauty",
      images: ["/hero1.png"]
    }
  ];

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    try {
      // Simulate loading delay and provide products
      const timer = setTimeout(() => {
        const shuffledProducts = [...mockProducts].sort(() => Math.random() - 0.5);
        setProducts(shuffledProducts.slice(0, limit));
        setLoading(false);
      }, 500); // Reduced loading time

      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(true);
      setLoading(false);
    }
  }, [type, productId, category, limit]);

  if (loading) {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <h2 className="font-reem font-bold text-3xl sm:text-4xl text-[#1a4032] mb-8 text-center">{displayTitle}</h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="animate-pulse bg-white rounded-2xl p-4 shadow-lg">
              <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-3"></div>
              <div className="bg-gray-200 h-4 w-2/3 rounded mb-3"></div>
              <div className="bg-gray-200 h-6 w-1/3 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} relative py-8 sm:py-12`}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showTitle && (
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-reem font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1a4032] mb-4">
                {displayTitle}
              </h2>
              <div className="w-24 h-1 bg-eco-gradient rounded-full mx-auto"></div>
            </div>
          )}
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-poppins">Unable to load recommendations</p>
            <button 
              onClick={() => typeof window !== 'undefined' && window.location.reload()} 
              className="mt-4 text-[#1a4032] hover:text-[#2d5a45] font-medium underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return null;
  }

  return (
    <div className={`${className} relative py-8 sm:py-12`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6f4] via-[#e8e4e1] to-[#ddd7d2] opacity-50 rounded-3xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-reem font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1a4032] mb-4">
              {displayTitle}
            </h2>
            <div className="w-24 h-1 bg-eco-gradient rounded-full mx-auto"></div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <div 
              key={product.id}
              className="animate-slide-in-up hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard 
                imageUrl={product.primary_image || '/hero1.png'}
                category={product.category_name || 'Eco Products'}
                title={product.name || 'Eco Product'}
                description={product.short_description || 'Sustainable and eco-friendly product'}
                price={product.price || 25}
                originalPrice={product.compare_at_price || product.price + 10}
                rating={product.rating || 4.5}
                reviews={product.review_count || 100}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
