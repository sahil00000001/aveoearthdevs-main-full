"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { Check, Minus, Plus } from "lucide-react";

// Star Rating Component
function StarRating({ rating = 4.9, reviews = 524 }) {
  return (
    <div className="content-stretch flex items-center justify-start relative shrink-0 w-full">
      {/* 5 Stars */}
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="overflow-clip relative shrink-0 size-[17.929px]">
          <div className="absolute inset-[9.38%_9.38%_12.5%_9.37%]">
            <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 0L8.854 4.708L14 5.459L10.5 8.792L11.409 13L7 10.833L2.591 13L3.5 8.792L0 5.459L5.146 4.708L7 0Z" fill="#FFD700"/>
            </svg>
          </div>
        </div>
      ))}
      <div className="font-poppins leading-[0] not-italic relative shrink-0 text-gray-600 text-[11.952px] text-nowrap ml-1">
        <p className="leading-[1.3] whitespace-pre">{rating}</p>
      </div>
      <div className="font-poppins leading-[0] not-italic relative shrink-0 text-gray-600 text-[11.952px] text-nowrap">
        <p className="leading-[1.3] whitespace-pre">{` (${reviews} Feedback)`}</p>
      </div>
    </div>
  );
}

// Progress Dots Component
function ProgressDots({ images = [], currentIndex = 0, isHovered = false }) {
  // Show dots only if there are multiple images
  if (!images || images.length <= 1) {
    return null;
  }

  return (
    <div className="content-stretch flex gap-[3.984px] items-start justify-start relative shrink-0 w-full">
      {images.map((_, index) => (
        <div 
          key={index}
          className={`basis-0 grow h-[5.976px] min-h-px min-w-px rounded-[49.802px] shrink-0 transition-colors duration-300 ${
            index === currentIndex ? 'bg-emerald-600' : 'bg-gray-200'
          }`} 
        />
      ))}
    </div>
  );
}

// Add to Cart Button Component
function AddButton({ variant = "dark", onClick, disabled = false }) {
  const bgColor = variant === "dark" ? "bg-gray-800" : "bg-emerald-600";
  const hoverBgColor = variant === "dark" ? "hover:bg-gray-900" : "hover:bg-emerald-700";
  const borderColor = variant === "dark" ? "border-gray-700" : "border-emerald-600";
  
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling to parent card
    if (onClick && !disabled) {
      onClick(e);
    }
  };
  
  return (
    <div 
      className={`${bgColor} ${!disabled ? hoverBgColor : ''} relative rounded-[11.952px] shrink-0 cursor-pointer transition-all duration-200 ${!disabled ? 'hover:scale-105 hover:shadow-md' : 'opacity-50 cursor-not-allowed'}`}
      onClick={handleClick}
      data-no-navigate="true"
    >
      <div className="box-border content-stretch flex gap-[9.96px] items-center justify-center overflow-clip px-[15.937px] py-[7.968px] relative">
        <div className="relative shrink-0 size-[23.905px]">
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="flex flex-col font-reem font-normal justify-center leading-[0] relative shrink-0 text-[#e9eceb] text-[11.952px] text-nowrap">
          <p className="leading-[normal] whitespace-pre">Add</p>
        </div>
      </div>
      <div aria-hidden="true" className={`absolute ${borderColor} border-[0.996px] border-solid inset-0 pointer-events-none rounded-[11.952px]`} />
    </div>
  );
}

// Main Product Card Component
export default function ProductCard({ 
  imageUrl = "/api/placeholder/265/132",
  images = [], // Array of image objects with url property
  category = "Home & Kitchen",
  title = "Bamboo Kitchen Essentials",
  description = "Complete sustainable Kitchen starter set",
  price = 89,
  originalPrice = 120,
  rating = 4.9,
  reviews = 524,
  variant = "default", // "default", "featured", "tall"
  size = "default", // "default", "wide"
  onClick, // Add onClick handler for quick view
  className = "", // Additional classes
  slug, // Product slug for navigation
  productId, // Product ID for navigation
  inStock = true // Add inStock prop, default true
}) {
  const router = useRouter();
  const { addToCart, updateCartItem } = useCart();
  const { isLoggedIn } = useAuth ? useAuth() : { isLoggedIn: true }; // fallback true if no hook

  // Prepare images array - use images prop if available, otherwise fallback to imageUrl
  const productImages = images && images.length > 0 
    ? images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
    : [imageUrl];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartItemId, setCartItemId] = useState(null);

  // Handle adding to cart
  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent card click
    setErrorMsg("");

    if (!isLoggedIn) {
      setErrorMsg("Please log in to add items to your cart.");
      return;
    }
    if (!inStock) {
      setErrorMsg("This item is out of stock.");
      return;
    }
    if (!productId) {
      setErrorMsg("This is a demo product. Please browse actual products to add to cart.");
      return;
    }

    setIsAddingToCart(true);
    try {
      const result = await addToCart(productId, currentQuantity);
      
      // Store the cart item ID for future quantity updates
      if (result?.items) {
        const newItem = result.items.find(item => item.product_id === productId);
        if (newItem) {
          setCartItemId(newItem.id);
        }
      }
      
      setAddedToCart(true);
      // Optional: Show success feedback
      setErrorMsg("");
    } catch (error) {
      setErrorMsg("Failed to add product to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (change) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    
    // Update local state immediately for better UX
    setCurrentQuantity(newQuantity);
    
    // If item is already in cart, update it on the server
    if (addedToCart && cartItemId) {
      try {
        await updateCartItem(cartItemId, newQuantity);
      } catch (error) {
        console.error('Failed to update cart item quantity:', error);
        // Revert local state on error
        setCurrentQuantity(currentQuantity);
        setErrorMsg('Failed to update quantity. Please try again.');
      }
    }
  };

  // Handle product click navigation
  const handleProductClick = () => {
    if (slug) {
      router.push(`/products/${slug}`);
    } else if (productId) {
      router.push(`/products/${productId}`);
    }
  };

  // Auto-cycle through images on hover
  useEffect(() => {
    if (!isHovered || productImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 800); // Change image every 800ms
    return () => clearInterval(interval);
  }, [isHovered, productImages.length]);

  // Reset to first image when not hovering
  useEffect(() => {
    if (!isHovered) {
      setCurrentImageIndex(0);
    }
  }, [isHovered]);

  const cardWidth = size === "wide" ? "w-full sm:w-[280px] lg:w-[305px]" : size === "small" ? "w-full sm:w-[200px] lg:w-[220px]" : "w-full sm:w-[240px] lg:w-[265px]";
  const cardHeight = variant === "featured" ? "h-[420px]" : size === "small" ? "h-[360px]" : "h-[410px]";
  const imageHeight = variant === "featured" ? "h-[180px]" : size === "small" ? "h-[140px]" : "h-[150px]";
  const contentPadding = "p-3 sm:p-4 lg:p-[20px]"; // Responsive padding
  const contentGap = "gap-3 sm:gap-4 lg:gap-[14px]"; // Responsive gap

  const textColor = variant === "featured" ? "text-gray-800" : "text-gray-600";
  const titleColor = "text-gray-800";
  const descColor = variant === "featured" ? "text-gray-600" : "text-gray-600";
  const priceColor = variant === "featured" ? "text-gray-800" : "text-gray-900";
  const originalPriceColor = variant === "featured" ? "text-gray-600" : "text-gray-600";

  const handleCardClick = (e) => {
    // Don't navigate if user clicked on Add to Cart button or if onClick handler exists
    if (e.target.closest('[data-no-navigate]')) {
      return;
    }
    if (onClick) {
      onClick(e);
    } else {
      handleProductClick();
    }
  };

  return (
    <div 
      className={`bg-white border border-gray-100 content-stretch flex flex-col overflow-clip relative rounded-[12px] shrink-0 ${cardWidth} ${cardHeight} cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-[1.02] ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className={`relative ${imageHeight} shrink-0 w-full overflow-hidden rounded-t-[12px]`}>
        <Image
          src={productImages[currentImageIndex] || '/placeholder-product.jpg'}
          alt={title}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Card Content - using flexbox to push price section to bottom */}
      <div className={`box-border flex flex-col ${contentPadding} relative shrink-0 w-full flex-1`}>

        {/* Top content section - grows to take available space */}
        <div className="flex flex-col gap-[14px] items-start justify-start flex-1">
          {/* Title and Category */}
          <div className="content-stretch flex flex-col gap-[3.984px] items-start justify-start leading-[0] relative shrink-0 w-full">
            <div className={`flex flex-col font-poppins font-bold justify-center not-italic relative shrink-0 ${textColor} text-[10px] sm:text-[11px] lg:text-[11.952px] w-full`}>
              <p className="leading-[normal]">{category}</p>
            </div>
            <div className={`flex flex-col font-reem font-semibold justify-start relative shrink-0 ${titleColor} text-[16px] sm:text-[18px] lg:text-[19.921px] w-full h-12 overflow-hidden`}>
              <p className="leading-[normal] line-clamp-2">{title}</p>
            </div>
          </div>

          {/* Description */}
          <div className={`flex flex-col font-poppins justify-start leading-[0] not-italic relative shrink-0 ${descColor} text-[10px] sm:text-[11px] lg:text-[11.952px] w-full h-8 overflow-hidden`}>
            <p className="leading-[normal] line-clamp-2">{description}</p>
          </div>

          {/* Rating */}
          <StarRating rating={rating} reviews={reviews} />

          {/* Progress Dots */}
          <ProgressDots 
            images={productImages} 
            currentIndex={currentImageIndex} 
            isHovered={isHovered} 
          />
        </div>

        {/* Price and Add Button - always at bottom */}
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full mt-auto pt-4">
          <div className="content-stretch flex gap-[3.984px] items-center justify-start relative shrink-0">
            <div className="content-stretch flex flex-col gap-[3.984px] items-start justify-start relative shrink-0">
              <div className={`flex flex-col font-poppins font-semibold justify-center leading-[0] not-italic relative shrink-0 ${priceColor} text-[16px] sm:text-[18px] lg:text-[19.921px] text-nowrap`}>
                <p className="leading-[normal] whitespace-pre">₹{price}</p>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[3.984px] items-start justify-start relative shrink-0">
              <div className={`flex flex-col font-poppins font-light justify-center leading-[0] not-italic relative shrink-0 ${originalPriceColor} text-[10px] sm:text-[11px] lg:text-[11.952px] text-nowrap`}>
                <p className="leading-[normal] whitespace-pre">₹{originalPrice}</p>
              </div>
              {/* Strike through line */}
              <div className="absolute h-0 left-0 top-[8.32px] w-[25.897px]">
                <div className="absolute bottom-[-0.4px] left-0 right-0 top-[-0.4px] bg-current h-[0.8px]" />
              </div>
            </div>
          </div>

          {/* Add Button or Quantity Controls */}
          {addedToCart ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-[11.952px] px-3 py-2">
              <Check className="w-3 h-3 text-emerald-600" />
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(-1);
                  }}
                  className="bg-white border border-gray-300 rounded-full w-[20px] h-[20px] flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="font-medium text-xs min-w-[16px] text-center">{currentQuantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(1);
                  }}
                  className="bg-white border border-gray-300 rounded-full w-[20px] h-[20px] flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ) : (
            <AddButton 
              variant={variant === "featured" ? "brown" : "dark"} 
              onClick={handleAddToCart}
              disabled={isAddingToCart || !isLoggedIn || !inStock}
              data-no-navigate="true"
            />
          )}
        </div>
        {/* Error message */}
        {errorMsg && (
          <div className="mt-2 text-xs text-red-600 font-poppins animate-pulse">{errorMsg}</div>
        )}
      </div>
    </div>
  );
}
