"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Star, Heart, Minus, Plus, ShoppingCart, Eye, Check } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const ProductQuickView = ({ onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartItemId, setCartItemId] = useState(null);
  const router = useRouter();
  const { addToCart, updateCartItem } = useCart();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedImageIndex(0);
      setAddedToCart(false);
    }
  }, [product]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!product) return null;

  const handleQuantityChange = async (change) => {
    const newQuantity = Math.max(1, quantity + change);
    
    // Update local state immediately for better UX
    setQuantity(newQuantity);
    
    // If item is already in cart, update it on the server
    if (addedToCart && cartItemId) {
      try {
        await updateCartItem(cartItemId, newQuantity);
      } catch (error) {
        console.error('Failed to update cart item quantity:', error);
        // Revert local state on error
        setQuantity(quantity);
        alert('Failed to update quantity. Please try again.');
      }
    }
  };

  const handleViewDetails = () => {
    const productSlug = product?.slug || product?.id || product?.title?.toLowerCase().replace(/\s+/g, '-');
    if (productSlug) {
      router.push(`/products/${productSlug}`);
      onClose();
    }
  };

  const handleAddToCart = async () => {
    if (!product?.id) {
      alert('Product information is missing');
      return;
    }

    // Check if product is in stock
    if (product?.available_stock <= 0) {
      alert('This product is currently out of stock');
      return;
    }

    try {
      setIsAddingToCart(true);
      
      // Use the default variant if available, otherwise null
      const variantId = product.variants?.[0]?.id || null;
      
      const result = await addToCart(product.id, quantity, variantId);
      
      // Store the cart item ID for future quantity updates
      if (result?.items) {
        const newItem = result.items.find(item => item.product_id === product.id);
        if (newItem) {
          setCartItemId(newItem.id);
        }
      }
      
      setAddedToCart(true);
      
      // Reset the success state after 3 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-[18px] h-[18px] ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Transform product data to match modal structure
  const productData = {
    name: product?.name || product?.title || "Product Name",
    inStock: product?.status === 'active' && (product?.available_stock > 0),
    rating: product?.rating || 4, // Default rating if not available
    reviewCount: product?.reviews || product?.review_count || 0,
    originalPrice: product?.compare_at_price || (product?.price * 1.2) || 0,
    salePrice: product?.price || 0,
    discount: product?.compare_at_price 
      ? `${Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF`
      : "",
    // Only show actual product images, fall back to one default image if none available
    images: product?.images?.length > 0 
      ? product.images.map(img => img.url) 
      : ["/sample1.jpg"], // Single fallback image
    brand: product?.brand?.name || product?.brand_name || "AveoEarth",
    description: product?.description || product?.short_description || "Premium eco-friendly product made with sustainable materials. This product is crafted with care using organic and sustainable practices to ensure quality while being environmentally conscious.",
    category: product?.category?.name || product?.category_name || "Eco-Friendly",
    tags: product?.tags || ["Sustainable", "Eco-Friendly", "Natural", "Organic", "AveoEarth Certified"],
    sku: product?.sku || "",
    materials: product?.materials || [],
    origin_country: product?.origin_country || "",
    care_instructions: product?.care_instructions || ""
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* Left Section - Images */}
          <div className="lg:w-1/2 p-6">
            <div className="flex gap-4">
              {/* Thumbnail Column */}
              <div className="flex flex-col gap-3 w-20">
                {/* Up Arrow */}
                <button className="flex items-center justify-center h-6 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
                </button>
                
                {productData.images.map((image, index) => (
                  <div
                    key={index}
                    className={`w-20 h-[90px] rounded cursor-pointer border-2 ${
                      selectedImageIndex === index ? 'border-gray-800' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
                
                {/* Down Arrow */}
                <button className="flex items-center justify-center h-6 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
                </button>
              </div>

              {/* Main Image */}
              <div className="flex-1">
                <img
                  src={productData.images[selectedImageIndex]}
                  alt={productData.name}
                  className="w-full h-[500px] object-cover rounded"
                />
              </div>
            </div>
          </div>

          {/* Right Section - Product Details */}
          <div className="lg:w-1/2 p-6 flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                {/* Product Name & Stock */}
                <div className="flex gap-2 items-center">
                  <h1 className="font-semibold text-[36px] text-[#1a1a1a] font-['Poppins']">
                    {productData.name}
                  </h1>
                  <span className="bg-[#bdc0b3] px-2 py-1 rounded text-[#272727] text-sm font-['Poppins']">
                    {productData.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {renderStars(productData.rating)}
                    <span className="text-[#666666] text-sm ml-2 font-['Poppins']">
                      {productData.reviewCount} Review
                    </span>
                  </div>
                  <span className="text-[#b3b3b3] font-medium">•</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex gap-3 items-center">
                <div className="flex gap-1 items-center">
                  <span className="text-[#b3b3b3] text-xl line-through font-['Poppins']">
                    ₹{productData.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-[#272727] text-2xl font-medium font-['Poppins']">
                    ₹{productData.salePrice.toFixed(2)}
                  </span>
                </div>
                <span className="bg-[rgba(106,106,106,0.1)] px-2.5 py-1 rounded-[30px] text-[#272727] text-sm font-medium font-['Poppins']">
                  {productData.discount}
                </span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-200" />
            </div>

            {/* Brand & Description */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-2 items-center">
                  <span className="text-[#1a1a1a] text-sm font-['Poppins']">Brand:</span>
                  <div className="bg-white border border-[#e6e6e6] rounded w-14 h-14 flex items-center justify-center">
                    <span className="text-[#555555] text-[13px] font-bold font-['Dancing_Script']">
                      {productData.brand}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[14px] text-gray-600 leading-[1.5] font-['Poppins']">
                {productData.description.split('\n').map((line, index) => (
                  <p key={index} className={index > 0 ? 'mt-4' : ''}>{line}</p>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white border-t border-b border-[#e6e6e6] py-[18px] flex gap-3 items-center">
              {/* Quantity Selector */}
              <div className="bg-white border border-[#e6e6e6] rounded-full p-2 flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="bg-[#f2f2f2] rounded-full w-[34px] h-[34px] flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-[#1a1a1a] text-base font-['Poppins']">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="bg-[#f2f2f2] rounded-full w-[34px] h-[34px] flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button or Quantity Controls */}
              {addedToCart ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-[43px] px-6 py-3">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-sm text-green-700">Added to Cart!</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="bg-white border border-gray-300 rounded-full w-[28px] h-[28px] flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-medium text-sm min-w-[20px] text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="bg-white border border-gray-300 rounded-full w-[28px] h-[28px] flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !productData.inStock}
                  className={`px-10 py-4 rounded-[43px] flex items-center gap-4 flex-1 transition-all duration-200 ${
                    productData.inStock 
                      ? 'bg-[#272727] text-white hover:bg-[#333333]' 
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-base font-['Poppins']">Adding...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-base font-['Poppins']">
                        {productData.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </span>
                      <ShoppingCart className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {/* Wishlist Button */}
              <button className="bg-[#bdc0b3] p-4 rounded-[43px] flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* View Details Button */}
            <div className="py-3">
              <button 
                onClick={handleViewDetails}
                className="w-full bg-white border border-[#272727] text-[#272727] px-6 py-3 rounded-[43px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="font-semibold text-base font-['Poppins']">View Details</span>
              </button>
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-1.5 items-start text-sm">
                <span className="font-medium text-[#1a1a1a] font-['Poppins']">Category:</span>
                <span className="text-gray-600 font-['Poppins']">{productData.category}</span>
              </div>
              {productData.sku && (
                <div className="flex gap-1.5 items-start text-sm">
                  <span className="font-medium text-[#1a1a1a] font-['Poppins']">SKU:</span>
                  <span className="text-gray-600 font-['Poppins']">{productData.sku}</span>
                </div>
              )}
              {productData.materials.length > 0 && (
                <div className="flex gap-1.5 items-start text-sm">
                  <span className="font-medium text-[#1a1a1a] font-['Poppins']">Materials:</span>
                  <span className="text-gray-600 font-['Poppins']">{productData.materials.join(', ')}</span>
                </div>
              )}
              {productData.origin_country && (
                <div className="flex gap-1.5 items-start text-sm">
                  <span className="font-medium text-[#1a1a1a] font-['Poppins']">Origin:</span>
                  <span className="text-gray-600 font-['Poppins']">{productData.origin_country}</span>
                </div>
              )}
              <div className="flex gap-1.5 items-start text-sm flex-wrap">
                <span className="font-medium text-[#1a1a1a] font-['Poppins']">Tags:</span>
                {productData.tags.map((tag, index) => (
                  <span key={index} className="text-gray-600 font-['Poppins']">
                    {tag}{index < productData.tags.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
              {productData.care_instructions && (
                <div className="flex gap-1.5 items-start text-sm">
                  <span className="font-medium text-[#1a1a1a] font-['Poppins']">Care:</span>
                  <span className="text-gray-600 font-['Poppins']">{productData.care_instructions}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
