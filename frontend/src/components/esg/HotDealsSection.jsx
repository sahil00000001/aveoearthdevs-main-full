import React, { useState, useEffect, useCallback, useMemo } from 'react';

// HotDealsCard Component: Bundled here as required for a single-file application.
const HotDealsCard = ({
  title,
  price,
  originalPrice,
  rating,
  reviews,
  tags,
  discount,
  imageUrl,
  index
}) => {
  // Helper to generate a unique placeholder image based on index
  const getPlaceholderImage = useCallback((idx) => {
    const seed = (idx % 5) + 1;
    const colors = ['#10b981', '#065f46', '#34d399', '#a7f3d0', '#047857'];
    const colorIndex = idx % colors.length;
    const placeholderText = title.split(' ').map(w => w[0]).join(''); // Use initials for text
    return `https://placehold.co/400x400/${colors[colorIndex].replace('#', '')}/ffffff?text=${placeholderText}`;
  }, [title]);

  const placeholderImg = useMemo(() => getPlaceholderImage(index), [index, getPlaceholderImage]);

  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out h-full flex flex-col">
      {/* Product Image and Discount Badge */}
      <div className="relative w-full h-48 sm:h-56 bg-gray-50 overflow-hidden">
        <img
          src={placeholderImg}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transform -rotate-3">
          {discount} OFF
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* Title Fix: Ensures space for 2 lines of text is always reserved */}
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2 h-14 leading-normal overflow-hidden">{title}</h3>

        {/* Price Section */}
        <div className="flex items-baseline mb-3">
          <span className="text-2xl font-extrabold text-emerald-600">${price}</span>
          <span className="ml-2 text-sm text-gray-400 line-through">${originalPrice}</span>
          <span className="ml-3 text-xs font-medium text-red-500">Save {originalPrice - price}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <div className="flex items-center text-yellow-400 mr-2">
            {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
          </div>
          <span className="font-semibold text-gray-700 mr-1">{rating}</span>
          <span>({reviews} reviews)</span>
        </div>
        
        {/* Tags Fix: min-h-6 ensures a minimum height is reserved for the tag content, 
            preventing height differences based on the number of tags (1 vs 2). */}
        <div className="flex flex-wrap gap-2 mb-4 mt-auto min-h-6">
          {tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                tag.includes('Certified') ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Add to Cart Button */}
        <button className="w-full flex items-center justify-center gap-2 mt-2 py-2 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors duration-300 shadow-md hover:shadow-lg active:scale-[0.98]">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.72a2 2 0 0 0 2-1.58L23 6H6"/></svg>
          Quick View
        </button>
      </div>
    </div>
  );
};

// Main HotDealsSection Component
export default function HotDealsSection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const allProducts = useMemo(() => [
    {
      title: "Jute Bag | Originally Sourced",
      price: 89,
      originalPrice: 120,
      rating: 4.9,
      reviews: 524,
      tags: ["Staff Pick", "AveoEarth Certified"],
      discount: "-31%",
      category: "Home & Living"
    },
    {
      title: "Eco Bamboo Bottle",
      price: 45,
      originalPrice: 60,
      rating: 4.7,
      reviews: 312,
      tags: ["Best Seller", "AveoEarth Certified"],
      discount: "-25%",
      category: "Drinkware"
    },
    {
      title: "Organic Cotton Tote",
      price: 65,
      originalPrice: 85,
      rating: 4.8,
      reviews: 289,
      tags: ["Staff Pick", "Eco-Friendly"],
      discount: "-24%",
      category: "Sustainable Fashion" // Changed from 'Fashion' to match categories list
    },
    {
      title: "Recycled Paper Notebook",
      price: 35,
      originalPrice: 50,
      rating: 4.6,
      reviews: 156,
      tags: ["New Arrival", "AveoEarth Certified"],
      discount: "-30%",
      category: "Stationery"
    },
    {
      title: "Hemp Fiber Mat",
      price: 125,
      originalPrice: 180,
      rating: 4.9,
      reviews: 432,
      tags: ["Premium", "Staff Pick"],
      discount: "-31%",
      category: "Home & Living"
    },
    {
      title: "Cork Phone Case",
      price: 55,
      originalPrice: 75,
      rating: 4.5,
      reviews: 201,
      tags: ["Trending", "Eco-Friendly"],
      discount: "-27%",
      category: "Upcycled & Handmade" // Changed from 'Tech Accessories' to match categories list
    },
    {
      title: "Organic Cotton T-Shirt",
      price: 85,
      originalPrice: 110,
      rating: 4.8,
      reviews: 289,
      tags: ["Organic", "Fashion"],
      discount: "-23%",
      category: "Sustainable Fashion" // Changed from 'Fashion' to match categories list
    },
    {
      title: "Bamboo Dinnerware Set",
      price: 145,
      originalPrice: 195,
      rating: 4.9,
      reviews: 156,
      tags: ["Premium", "Staff Pick"],
      discount: "-26%",
      category: "Home & Living"
    },
    {
      title: "Recycled Plastic Pen",
      price: 25,
      originalPrice: 35,
      rating: 4.6,
      reviews: 89,
      tags: ["Eco-Friendly", "Affordable"],
      discount: "-29%",
      category: "Stationery"
    },
    {
      title: "Steel Water Tumbler",
      price: 65,
      originalPrice: 85,
      rating: 4.7,
      reviews: 234,
      tags: ["Durable", "Best Seller"],
      discount: "-24%",
      category: "Drinkware"
    },
    {
      title: "Natural Moisturizer",
      price: 95,
      originalPrice: 125,
      rating: 4.5,
      reviews: 167,
      tags: ["Vegan", "Clean"],
      discount: "-24%",
      category: "Clean Beauty" // New product for 'Clean Beauty'
    },
    {
      title: "Linen Throw Pillow",
      price: 75,
      originalPrice: 100,
      rating: 4.8,
      reviews: 198,
      tags: ["Comfort", "Natural"],
      discount: "-25%",
      category: "Home & Living"
    }
  ], []);

  const categories = ['all', 'Home & Living', 'Sustainable Fashion', 'Drinkware', 'Stationery', 'Upcycled & Handmade', 'Clean Beauty', 'Pets', 'Fitness'];

  const filteredProducts = useMemo(() => activeFilter === 'all'
    ? allProducts
    : allProducts.filter(product => product.category === activeFilter)
  , [activeFilter, allProducts]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Home & Living': '🏠',
      'Sustainable Fashion': '👕',
      'Upcycled & Handmade': '🎨',
      'Clean Beauty': '✨',
      'Pets': '🐾',
      'Fitness': '💪',
      'Drinkware': '🥤',
      'Stationery': '📝'
    };
    return icons[category] || '🌱';
  };
  
  // Custom keyframes for animations (must be inline since no external CSS is allowed)
  const customStyles = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes blob {
      0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
      50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    }
    @keyframes float {
      0% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(3deg); }
      100% { transform: translateY(0) rotate(0deg); }
    }
  `;

  return (
    <section className="relative w-full py-16 sm:py-24 bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/50 overflow-hidden min-h-screen font-sans">
      <style>{customStyles}</style>
      
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-emerald-200/20 rounded-full animate-[blob_10s_ease-in-out_infinite] opacity-50"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-emerald-300/15 rounded-full animate-[float_8s_ease-in-out_infinite]" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-emerald-400/10 rounded-full animate-[blob_12s_reverse_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }}></div>
        {/* Grid Pattern: The SVG is fully encoded to prevent compilation errors */}
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12 sm:mb-16 space-y-6">
          <div className="space-y-6">
            
            
            {/* Title */}
            <h2 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl text-gray-800 leading-tight">
              Hot <span className="text-emerald-700">Deals</span>
            </h2>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover amazing eco-friendly products at unbeatable prices. Limited stock available!
            </p>
          </div>
        </div>

        {/* Modern Filter Section */}
        <div className="flex flex-col items-center space-y-8 mb-12 sm:mb-16">
          {/* Filter Header */}
          <div className="flex items-center gap-4 text-gray-800">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent flex-1 max-w-20"></div>
            <span className="font-semibold text-lg whitespace-nowrap">Filter by Category</span>
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent flex-1 max-w-20"></div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 max-w-5xl">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange(category)}
                className={`
                  px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 
                  hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap
                  ${
                    activeFilter === category
                      ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-300/50'
                      : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-lg border border-gray-200'
                  }
                `}
              >
                {category === 'all' ? '🌟 All Products' : `${getCategoryIcon(category)} ${category}`}
              </button>
            ))}
          </div>
          
          {/* Results Count */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-600 px-4 py-2 rounded-full text-sm border border-gray-200 shadow-inner">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Showing <span className="font-bold text-emerald-600">{filteredProducts.length}</span> products</span>
            </div>
          </div>
        </div>

        {/* Modern Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 lg:gap-8 min-h-[400px]">
          {filteredProducts.map((product, index) => (
            <div 
              key={`${activeFilter}-${index}`}
              className="group opacity-0 transform transition-all duration-300" 
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: `slideInUp 0.6s ease-out forwards ${index * 0.1}s`
              }}
            >
              <div className="relative">
                <HotDealsCard 
                  {...product}
                  index={index}
                />
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/0 via-emerald-400/5 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/70 rounded-3xl shadow-xl border border-gray-100 mt-10 mx-auto max-w-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <span className="text-4xl">🔎</span>
            </div>
            <h3 className="font-bold text-2xl text-gray-800 mb-3">No deals right now!</h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed px-4">
              Looks like we're fresh out of hot deals in the <span className="font-semibold text-emerald-600">{activeFilter}</span> category. Try another filter!
            </p>
            <button 
              onClick={() => setActiveFilter('all')}
              className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors shadow-lg hover:shadow-xl transform active:scale-95"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Modern CTA Button */}
        <div className="flex justify-center mt-16 sm:mt-20">
          <button 
            // In a real app, this would use a router or state change
            onClick={() => console.log('Navigating to explore page...')}
            className="group relative bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Button Content */}
            <div className="relative flex items-center gap-3">
              <span className="text-xl">🛍️</span>
              <span>Explore All Deals</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </button>
        </div>
      </div>
    </section>
  );
}
