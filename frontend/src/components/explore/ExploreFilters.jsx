"use client";

import { useState } from "react";

const ChevronDownIcon = () => (
  <svg width="9" height="5" viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 5L0 0H9L4.5 5Z" fill="#666"/>
  </svg>
);

const StarIcon = ({ filled = true }) => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M6.5 0L7.945 4.122L12.5 4.755L9.5 7.628L10.39 12.5L6.5 10.282L2.61 12.5L3.5 7.628L0.5 4.755L5.055 4.122L6.5 0Z" 
      fill={filled ? "#FFD700" : "#CCCCCC"}
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ExploreFilters({ activeFilters, onFilterChange, categories = [], brands = [], loading = false }) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    price: true,
    rating: true,
    tags: true
  });

  const [priceRange, setPriceRange] = useState([
    activeFilters.min_price || 0,
    activeFilters.max_price || 10000
  ]);

  const ratingOptions = [
    { id: "5", name: "5.0", value: 5 },
    { id: "4_and_up", name: "4.0 & up", value: 4 },
    { id: "3_and_up", name: "3.0 & up", value: 3 },
    { id: "2_and_up", name: "2.0 & up", value: 2 },
    { id: "1_and_up", name: "1.0 & up", value: 1 }
  ];

  const popularTags = [
    "Bamboo", "Jute", "Cotton", "Vegan", "Wood", "Decor", 
    "Violence Free", "Light", "Top", "Sale", "Fitness", "Organic",
    "Eco-friendly", "Sustainable", "Natural", "Handmade"
  ];

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId) => {
    onFilterChange({
      ...activeFilters,
      category_id: categoryId === "all" ? null : categoryId
    });
  };

  const handleBrandChange = (brandId) => {
    onFilterChange({
      ...activeFilters,
      brand_id: brandId === "all" ? null : brandId
    });
  };

  const handleRatingChange = (ratingId) => {
    onFilterChange({
      ...activeFilters,
      rating: ratingId
    });
  };

  const handleTagToggle = (tag) => {
    const currentTags = activeFilters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFilterChange({
      ...activeFilters,
      tags: newTags
    });
  };

  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    onFilterChange({
      ...activeFilters,
      min_price: newRange[0],
      max_price: newRange[1]
    });
  };

  return (
    <div className="w-full bg-white p-4"> {/* Reduced padding from p-6 to p-4 */}
      
      {/* All Categories Section */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between py-3 cursor-pointer"
          onClick={() => toggleSection('categories')}
        >
          <h3 className="font-poppins font-medium text-[#1a1a1a] text-[14px]">
            All Categories
          </h3>
          <div className={`transform transition-transform ${openSections.categories ? 'rotate-180' : ''}`}>
            <ChevronDownIcon />
          </div>
        </div>
        
        {openSections.categories && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <div className="relative">
                <input
                  type="radio"
                  name="category"
                  value="all"
                  checked={!activeFilters.category_id}
                  onChange={() => handleCategoryChange("all")}
                  className="sr-only"
                />
                <div className={`w-3.5 h-3.5 rounded-full border ${
                  !activeFilters.category_id 
                    ? 'border-black bg-white' 
                    : 'border-[#cccccc] bg-white'
                } flex items-center justify-center`}>
                  {!activeFilters.category_id && (
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  )}
                </div>
              </div>
              <span className="font-poppins text-[#1a1a1a] text-[10px] leading-[1.5]">
                All Categories
              </span>
            </label>
            {loading ? (
              <div className="text-gray-500 text-[10px] font-poppins">Loading categories...</div>
            ) : (
              categories?.map((category) => (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer py-1">
                  <div className="relative">
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={activeFilters.category_id === category.id}
                      onChange={() => handleCategoryChange(category.id)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 rounded-full border ${
                      activeFilters.category_id === category.id 
                        ? 'border-black bg-white' 
                        : 'border-[#cccccc] bg-white'
                    } flex items-center justify-center`}>
                      {activeFilters.category_id === category.id && (
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                      )}
                    </div>
                  </div>
                  <span className="font-poppins text-[#1a1a1a] text-[10px] leading-[1.5]">
                    {category.name} {category.product_count && `(${category.product_count})`}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e6e6e6] mb-6"></div>

      {/* Brands Section */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between py-3 cursor-pointer"
          onClick={() => toggleSection('brands')}
        >
          <h3 className="font-poppins font-medium text-[#1a1a1a] text-[14px]">
            Brands
          </h3>
          <div className={`transform transition-transform ${openSections.brands ? 'rotate-180' : ''}`}>
            <ChevronDownIcon />
          </div>
        </div>
        
        {openSections.brands && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <div className="relative">
                <input
                  type="radio"
                  name="brand"
                  value="all"
                  checked={!activeFilters.brand_id}
                  onChange={() => handleBrandChange("all")}
                  className="sr-only"
                />
                <div className={`w-3.5 h-3.5 rounded-full border ${
                  !activeFilters.brand_id 
                    ? 'border-black bg-white' 
                    : 'border-[#cccccc] bg-white'
                } flex items-center justify-center`}>
                  {!activeFilters.brand_id && (
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  )}
                </div>
              </div>
              <span className="font-poppins text-[#1a1a1a] text-[10px] leading-[1.5]">
                All Brands
              </span>
            </label>
            {loading ? (
              <div className="text-gray-500 text-[10px] font-poppins">Loading brands...</div>
            ) : (
              brands?.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2 cursor-pointer py-1">
                  <div className="relative">
                    <input
                      type="radio"
                      name="brand"
                      value={brand.id}
                      checked={activeFilters.brand_id === brand.id}
                      onChange={() => handleBrandChange(brand.id)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 rounded-full border ${
                      activeFilters.brand_id === brand.id 
                        ? 'border-black bg-white' 
                        : 'border-[#cccccc] bg-white'
                    } flex items-center justify-center`}>
                      {activeFilters.brand_id === brand.id && (
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                      )}
                    </div>
                  </div>
                  <span className="font-poppins text-[#1a1a1a] text-[10px] leading-[1.5]">
                    {brand.name} {brand.product_count && `(${brand.product_count})`}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e6e6e6] mb-6"></div>

      {/* Price Section */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between py-3 cursor-pointer"
          onClick={() => toggleSection('price')}
        >
          <h3 className="font-poppins font-medium text-[#1a1a1a] text-[14px]">
            Price
          </h3>
          <div className={`transform transition-transform ${openSections.price ? 'rotate-180' : ''}`}>
            <ChevronDownIcon />
          </div>
        </div>
        
        {openSections.price && (
          <div className="space-y-3">
            {/* Price Range Inputs */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-poppins text-gray-600 mb-1">Min Price</label>
                <input
                  type="number"
                  min="0"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newRange = [parseInt(e.target.value) || 0, priceRange[1]];
                    handlePriceRangeChange(newRange);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-[10px]"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-poppins text-gray-600 mb-1">Max Price</label>
                <input
                  type="number"
                  min={priceRange[0]}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newRange = [priceRange[0], parseInt(e.target.value) || 0];
                    handlePriceRangeChange(newRange);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-[10px]"
                  placeholder="10000"
                />
              </div>
            </div>
            
            {/* Price Range Display */}
            <div className="font-poppins text-[10px] text-[#1a1a1a]">
              <span className="text-[#4d4d4d]">Price Range: </span>
              <span className="font-medium">₹{priceRange[0]} — ₹{priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e6e6e6] mb-6"></div>

      {/* Rating Section */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between py-3 bg-[#e1e4e3] cursor-pointer"
          onClick={() => toggleSection('rating')}
        >
          <h3 className="font-poppins font-medium text-[#1a1a1a] text-[14px]">
            Rating
          </h3>
          <div className={`transform transition-transform ${openSections.rating ? 'rotate-180' : ''}`}>
            <ChevronDownIcon />
          </div>
        </div>
        
        {openSections.rating && (
          <div className="space-y-2 py-2">
            {ratingOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-2 cursor-pointer py-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={activeFilters.rating === option.id}
                    onChange={() => handleRatingChange(option.id)}
                    className="sr-only"
                  />
                  <div className={`w-3.5 h-3.5 rounded border ${
                    activeFilters.rating === option.id 
                      ? 'border-black bg-black' 
                      : 'border-[#cccccc] bg-white'
                  } flex items-center justify-center`}>
                    {activeFilters.rating === option.id && (
                      <CheckIcon />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Stars */}
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= option.value} />
                    ))}
                  </div>
                  <span className="font-poppins text-[#1a1a1a] text-[10px] ml-1">
                    {option.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e6e6e6] mb-6"></div>

      {/* Popular Tags Section */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between py-3 cursor-pointer"
          onClick={() => toggleSection('tags')}
        >
          <h3 className="font-poppins font-medium text-[#1a1a1a] text-[14px]">
            Popular Tag
          </h3>
          <div className={`transform transition-transform ${openSections.tags ? 'rotate-180' : ''}`}>
            <ChevronDownIcon />
          </div>
        </div>
        
        {openSections.tags && (
          <div className="flex flex-wrap gap-1.5 py-2">
            {popularTags.map((tag) => {
              const isActive = activeFilters.tags?.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-[10px] font-poppins transition-colors ${
                    isActive 
                      ? 'bg-black text-white' 
                      : 'bg-[#f2f2f2] text-[#1a1a1a] hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Special Offer Banner */}
      <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg p-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">69%</div>
          <div className="text-xs text-gray-600 mb-2">Discount</div>
          <div className="text-xs text-gray-800 mb-3">
            on our top sustainable products
          </div>
          <button className="text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors">
            Shop Now →
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #1a1a1a;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #1a1a1a;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
