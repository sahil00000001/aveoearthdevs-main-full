"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ChevronUp, ChevronDown, Star, Heart, ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import ProductRecommendations from '../../../components/search/ProductRecommendations';
import ProductQuickView from '../../../components/ui/ProductQuickView';
import { productsBuyer, productSearch, tokens } from '../../../lib/api';
import { useCart } from '../../../hooks/useCart';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const { addToCart, updateCartItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('descriptions');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartItemId, setCartItemId] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await productsBuyer.getProduct(slug);
      setProduct(productData);
      
      // Fetch related products
      if (productData?.category?.id) {
        try {
          const related = await productsBuyer.getProducts({
            category_id: productData.category.id,
            limit: 4
          });
          setRelatedProducts(related?.data || []);
        } catch (error) {
          console.warn('Failed to fetch related products:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleGoBack = () => {
    router.back();
  };

  const handleProductClick = (product) => {
    setQuickViewProduct(product);
  };

  const renderStars = (rating = 4) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-[14.4px] h-[14.4px] ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'
        }`}
      />
    ));
  };

  const getDiscountPercentage = () => {
    if (product?.compare_at_price && product?.price) {
      const discount = ((product.compare_at_price - product.price) / product.compare_at_price) * 100;
      return Math.round(discount);
    }
    return 64; // Default fallback
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e1e4e3]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              <div className="space-y-4">
                <div className="bg-gray-200 aspect-square rounded-lg"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 w-16 h-[72px] rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
                <div className="bg-gray-200 h-6 w-1/2 rounded"></div>
                <div className="bg-gray-200 h-20 rounded"></div>
                <div className="bg-gray-200 h-12 w-1/3 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#e1e4e3]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push('/explore')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Browse Products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [{ url: '/sample1.jpg' }];
  const currentImage = images[selectedImageIndex]?.url || '/sample1.jpg';

  return (
    <div className="min-h-screen bg-[#e1e4e3]">
      <Navbar />
      
      <div className="relative">
        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="absolute top-8 left-7 bg-white border border-[#b8b8b8] rounded-[4.8px] px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5 text-[#858c94]" />
          <span className="text-[#484848] font-medium">Go back</span>
        </button>

        {/* Product Detail Section */}
        <div className="pt-[100px] px-1">
          <div className="max-w-[1056px] mx-auto bg-white rounded-[8px] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Left Section - Images */}
              <div className="flex gap-4">
                {/* Thumbnail Column */}
                <div className="flex flex-col items-center gap-2">
                  <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronUp className={`w-5 h-5 ${selectedImageIndex === 0 ? 'text-gray-300' : 'text-gray-600'}`} />
                  </button>
                  
                  <div className="flex flex-col gap-[9.6px]">
                    {images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-16 h-[72px] rounded-[2px] overflow-hidden ${
                          index === selectedImageIndex ? 'border-2 border-[#272727]' : 'border border-gray-200'
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={`${product.name} - Image ${index + 1}`}
                          width={64}
                          height={72}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                    disabled={selectedImageIndex >= images.length - 1}
                  >
                    <ChevronDown className={`w-5 h-5 ${selectedImageIndex >= images.length - 1 ? 'text-gray-300' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Main Image */}
                <div className="flex-1 aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={currentImage}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right Section - Product Info */}
              <div className="space-y-6">
                {/* Product Name & Stock */}
                <div className="flex items-center gap-[6.4px]">
                  <h1 className="text-[#1a1a1a] text-[28.8px] font-semibold font-poppins leading-[1.2]">
                    {product.name}
                  </h1>
                  <span className={`text-[11.2px] font-normal px-[6.4px] py-[3.2px] rounded-[4px] ${
                    product?.status === 'active' && product?.available_stock > 0
                      ? 'bg-[#bdc0b3] text-[#272727]'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {product?.status === 'active' && product?.available_stock > 0
                      ? 'In Stock'
                      : 'Out of Stock'
                    }
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(4)}
                  </div>
                  <span className="text-[#666666] text-[11.2px] font-normal">4 Review</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-[9.6px]">
                  <div className="flex items-center gap-[3.2px]">
                    {product.compare_at_price && (
                      <span className="text-[#b3b3b3] text-[16px] line-through">
                        ₹{product.compare_at_price}
                      </span>
                    )}
                    <span className="text-[#272727] text-[19.2px] font-medium">
                      ₹{product.price}
                    </span>
                  </div>
                  <div className="bg-[rgba(106,106,106,0.1)] px-2 py-[2.4px] rounded-[30px]">
                    <span className="text-[#272727] text-[11.2px] font-medium">
                      {getDiscountPercentage()}% Off
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[0.8px] bg-gray-200 w-full"></div>

                {/* Brand */}
                <div className="flex items-center gap-[6.4px]">
                  <span className="text-[#1a1a1a] text-[11.2px] font-normal">Brand:</span>
                  <div className="bg-white border border-[#e6e6e6] rounded-[4px] w-[44.8px] h-[44.8px] flex items-center justify-center">
                    <span className="text-[#555555] text-[10.4px] font-bold font-dancing-script">
                      {product.brand?.name || 'NA'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="text-[#808080] text-[11.2px] leading-[1.5] max-w-[454px]">
                  <p className="mb-3">
                    {product.short_description || product.description || 'Description Not Available'}
                  </p>
                </div>

                {/* CTA Section */}
                <div className="flex items-center gap-[9.6px] pt-[14.4px] border-t border-[#e6e6e6]">
                  {/* Quantity Selector */}
                  <div className="bg-white border border-[#e6e6e6] rounded-[170px] p-[6.4px] flex items-center">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="bg-[#f2f2f2] rounded-full w-[27.2px] h-[27.2px] flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="text-[#1a1a1a] text-[12.8px] text-center w-8">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="bg-[#f2f2f2] rounded-full w-[27.2px] h-[27.2px] flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>

                  {/* Add to Cart Button or Quantity Controls */}
                  {addedToCart ? (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-[43px] px-6 py-[12.8px] flex-1">
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
                      disabled={isAddingToCart || !(product?.status === 'active' && product?.available_stock > 0)}
                      className={`px-8 py-[12.8px] rounded-[43px] flex items-center gap-[12.8px] flex-1 transition-all duration-200 ${
                        isAddingToCart
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : product?.status === 'active' && product?.available_stock > 0
                            ? 'bg-[#272727] text-white hover:bg-[#333333]'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                      }`}
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-[12.8px] font-semibold">Adding...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[12.8px] font-semibold">
                            {product?.status === 'active' && product?.available_stock > 0 
                              ? 'Add to Cart' 
                              : 'Out of Stock'
                            }
                          </span>
                          <ShoppingCart className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}

                  {/* Wishlist Button */}
                  <button className="bg-[#bdc0b3] p-[12.8px] rounded-[43px]">
                    <Heart className="w-4 h-4 text-gray-700" />
                  </button>
                </div>

                {/* Product Details */}
                <div className="space-y-[9.6px] text-[11.2px]">
                  <div className="flex items-start gap-[4.8px]">
                    <span className="font-medium text-[#1a1a1a]">Category:</span>
                    <span className="text-[#808080]">{product.category?.name || 'Food & Beverages'}</span>
                  </div>
                  <div className="flex items-start gap-[4.8px]">
                    <span className="font-medium text-[#1a1a1a]">Brand:</span>
                    <span className="text-[#808080]">{product.brand?.name || 'NA'}</span>
                  </div>
                  {product.sku && (
                    <div className="flex items-start gap-[4.8px]">
                      <span className="font-medium text-[#1a1a1a]">SKU:</span>
                      <span className="text-[#808080]">{product.sku}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex items-start gap-[4.8px]">
                      <span className="font-medium text-[#1a1a1a]">Weight:</span>
                      <span className="text-[#808080]">{product.weight}kg</span>
                    </div>
                  )}
                  {product.materials && product.materials.length > 0 && (
                    <div className="flex items-start gap-[4.8px]">
                      <span className="font-medium text-[#1a1a1a]">Materials:</span>
                      <span className="text-[#808080]">{product.materials.join(', ')}</span>
                    </div>
                  )}
                  {product.origin_country && (
                    <div className="flex items-start gap-[4.8px]">
                      <span className="font-medium text-[#1a1a1a]">Origin:</span>
                      <span className="text-[#808080]">{product.origin_country}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-[4.8px] flex-wrap">
                    <span className="font-medium text-[#1a1a1a]">Tags:</span>
                    {(product.tags || ['Seeds', 'Healthy', 'Chinese', 'Chia', 'Food']).map((tag, index) => (
                      <span key={index} className="text-[#808080]">{tag}{index < (product.tags || ['Seeds', 'Healthy', 'Chinese', 'Chia', 'Food']).length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="max-w-[1056px] mx-auto mt-16">
          {/* Navigation Tabs */}
          <div className="bg-[#f5f5f5] border-b border-[#e6e6e6] flex">
            {[
              { id: 'descriptions', label: 'Descriptions' },
              { id: 'additional', label: 'Additional Information' },
              { id: 'feedback', label: 'Customer Feedback' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-3 text-[12px] font-medium ${
                  activeTab === tab.id
                    ? 'text-[#1a1a1a] border-b-[1.5px] border-[#181818]'
                    : 'text-[#808080] hover:text-[#1a1a1a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white p-8">
            {activeTab === 'descriptions' && (
              <div className="flex gap-8">
                <div className="flex-1 space-y-4">
                  <div className="text-[#808080] text-[10.5px] leading-[1.5] space-y-4">
                    
                  {/* Features */}
                  {/* <div className="space-y-[10.5px]">
                    {[
                      'Packed with Omega-3 fatty acids, fiber, protein, antioxidants, and essential',
                      'Natural Energy Booster',
                      'Supports Digestion & Weight Management',
                      'Versatile Superfood'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start gap-[6px]">
                        <div className="bg-[#181818] rounded-full w-[15px] h-[15px] flex items-center justify-center mt-0.5">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-[#808080] text-[10.5px] leading-[1.4]">{feature}</span>
                      </div>
                    ))}
                  </div> */}
                  <h2 className="text-[#1a1a1a] text-[14px] font-semibold">Product Overview</h2>
                  <p className="text-[#808080] text-[10.5px] leading-[1.5]">
                    {product.short_description || 'Description Not Available'}
                  </p>
                  <h2 className="text-[#1a1a1a] text-[14px] font-semibold">Product Details</h2>
                  <p>
                      {product.description || 'No detailed description available for this product.'}
                  </p>
                    {product.care_instructions && (
                      <div>
                        <h4 className="font-semibold text-[#1a1a1a] text-[12px] mb-2">Care Instructions:</h4>
                        <p>{product.care_instructions}</p>
                      </div>
                    )}
                    {product.materials && product.materials.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[#1a1a1a] text-[12px] mb-2">Materials:</h4>
                        <p>{product.materials.join(', ')}</p>
                      </div>
                    )}
                    {product.manufacturing_details && Object.keys(product.manufacturing_details).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[#1a1a1a] text-[12px] mb-2">Manufacturing Details:</h4>
                        {Object.entries(product.manufacturing_details).map(([key, value]) => (
                          <p key={key}><strong>{key.replace('_', ' ')}:</strong> {value}</p>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right side content - Video and Features */}
                <div className="w-[402px] space-y-4">
                  {/* Video placeholder */}
                  {/* <div className="w-full h-[225px] bg-gray-200 rounded-[4.5px] flex items-center justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div> */}

                  {/* Feature cards */}
                  <div className="bg-white border border-[#e6e6e6] rounded-[4.5px] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 text-green-600">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[#1a1a1a] text-[10.5px] font-medium">{getDiscountPercentage()}% Discount</div>
                        <div className="text-[#808080] text-[9.75px]">Save your {getDiscountPercentage()}% money with us</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 text-green-600">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[#1a1a1a] text-[10.5px] font-medium">100% Organic</div>
                        <div className="text-[#808080] text-[9.75px]">100% Organic Food</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'additional' && (
              <div className="space-y-6">
                <h3 className="text-[#1a1a1a] text-[14px] font-semibold mb-4">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-[#808080] text-[10.5px]">SKU</span>
                      <span className="text-[#1a1a1a] text-[10.5px] font-medium">{product.sku || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-[#808080] text-[10.5px]">Brand</span>
                      <span className="text-[#1a1a1a] text-[10.5px] font-medium">{product.brand?.name || 'NA'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-[#808080] text-[10.5px]">Category</span>
                      <span className="text-[#1a1a1a] text-[10.5px] font-medium">{product.category?.name || 'N/A'}</span>
                    </div>
                    {product.weight && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-[#808080] text-[10.5px]">Weight</span>
                        <span className="text-[#1a1a1a] text-[10.5px] font-medium">{product.weight}kg</span>
                      </div>
                    )}
                    {product.origin_country && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-[#808080] text-[10.5px]">Origin Country</span>
                        <span className="text-[#1a1a1a] text-[10.5px] font-medium">{product.origin_country}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {product.dimensions && Object.keys(product.dimensions).length > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-[#808080] text-[10.5px]">Dimensions</span>
                        <span className="text-[#1a1a1a] text-[10.5px] font-medium">
                          {Object.entries(product.dimensions).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </span>
                      </div>
                    )}
                    {product.materials && product.materials.length > 0 && (
                      <div className="flex justify-between items-start py-2 border-b border-gray-200">
                        <span className="text-[#808080] text-[10.5px]">Materials</span>
                        <span className="text-[#1a1a1a] text-[10.5px] font-medium text-right">{product.materials.join(', ')}</span>
                      </div>
                    )}
                    {product.care_instructions && (
                      <div className="flex justify-between items-start py-2 border-b border-gray-200">
                        <span className="text-[#808080] text-[10.5px]">Care Instructions</span>
                        <span className="text-[#1a1a1a] text-[10.5px] font-medium text-right max-w-[200px]">{product.care_instructions}</span>
                      </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex justify-between items-start py-2 border-b border-gray-200">
                        <span className="text-[#808080] text-[10.5px]">Tags</span>
                        <span className="text-[#1a1a1a] text-[10.5px] font-medium text-right max-w-[200px]">{product.tags.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-[#1a1a1a] text-[14px] font-semibold">Customer Feedback</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {renderStars(4)}
                    </div>
                    <span className="text-[#666666] text-[11.2px] font-normal">4.0 (124 reviews)</span>
                  </div>
                </div>
                
                {/* Rating Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[#1a1a1a] text-[12px] font-semibold">Rating Breakdown</h4>
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-[#808080] text-[10.5px] w-6">{stars} ★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-[#808080] text-[10.5px] w-8">{Math.floor(Math.random() * 50)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[#1a1a1a] text-[12px] font-semibold">Recent Reviews</h4>
                    <div className="space-y-4">
                      {[
                        { name: 'Sarah M.', rating: 5, comment: 'Excellent quality! Very satisfied with this purchase.' },
                        { name: 'John D.', rating: 4, comment: 'Good product, fast delivery. Would recommend.' },
                        { name: 'Maria L.', rating: 5, comment: 'Love this! Exactly as described and great value.' }
                      ].map((review, index) => (
                        <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#1a1a1a] text-[10.5px] font-medium">{review.name}</span>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-[#808080] text-[10.5px] leading-[1.4]">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-[#1a1a1a] text-[14px] font-medium text-center mb-12">
            Related Products
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((relatedProduct, index) => (
              <div
                key={relatedProduct.id || index}
                className="bg-[#e9eceb] rounded-[11.952px] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProductClick(relatedProduct)}
              >
                <div className="relative h-[174px] bg-[#dedede] overflow-hidden">
                  <Image
                    src={relatedProduct.images?.[0]?.url || '/sample1.jpg'}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Tags */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className="bg-[#bdc0b3] px-2 py-1 rounded-full">
                      <span className="text-[#272727] text-[12.749px] font-normal">Staff Pick</span>
                    </div>
                    <div className="bg-[#bdc0b3] px-2 py-1 rounded-full">
                      <span className="text-[#272727] text-[12.749px] font-normal">AveoEarth Certified</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-[#3e3e3e] px-2 py-1 rounded-full">
                      <span className="text-[#e9eceb] text-[12.749px] font-normal">-31%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-3">
                  <h3 className="text-[#272727] text-[9.562px] font-normal leading-normal">
                    {relatedProduct.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-[14.343px] h-[14.343px] fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-[#696969] text-[9.562px] ml-1">4.9 (524 Feedback)</span>
                  </div>
                  
                  {/* Progress dots */}
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-1 h-[5.976px] bg-[#7e7e7e] rounded-full"></div>
                    ))}
                  </div>
                  
                  {/* Price and cart */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[#272727] text-[15.937px] font-semibold">₹{relatedProduct.price || 89}</span>
                      <div className="relative">
                        <span className="text-[#696969] text-[9.562px]">₹{relatedProduct.compare_at_price || 120}</span>
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-[#696969]"></div>
                      </div>
                    </div>
                    <button className="bg-[#272727] border border-[#272727] rounded-[7.65px] p-2">
                      <ShoppingCart className="w-4 h-4 text-[#e9eceb]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-[#eaeaea] border-t border-[rgba(26,64,50,0.1)] py-8">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
            <div>
              <h3 className="text-[#272727] text-[17.994px] font-semibold mb-1">Subscribe our Newsletter</h3>
              <p className="text-[#696969] text-[10.497px] leading-[1.5]">
                Stay updated on sustainable products, ethical sourcing, and the latest from AveoEarth.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-[#d3d3d3] border border-[#272727] rounded-[34.489px] px-4 py-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-transparent text-[#808080] text-[11.996px] outline-none w-72"
                />
              </div>
              <button className="bg-[#272727] text-[#eaeaea] px-8 py-3 rounded-[32.24px] text-[11.996px] font-semibold">
                Subscribe
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Social media icons */}
              <div className="w-[29.99px] h-[29.99px] bg-gray-300 rounded-full"></div>
              <div className="w-[29.99px] h-[29.99px] bg-gray-300 rounded-full"></div>
              <div className="w-[29.99px] h-[29.99px] bg-gray-300 rounded-full"></div>
              <div className="w-[29.99px] h-[29.99px] bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
