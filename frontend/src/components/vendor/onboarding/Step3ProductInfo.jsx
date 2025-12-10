import React, { useState, useEffect } from 'react';
import { productsService } from '../../../lib/productsService';
import { productsSupplier, tokens } from '../../../lib/api';

export default function Step3ProductInfo({ formData, handleChange, errors = {}, onValidation, onSkip }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [tagInput, setTagInput] = useState(''); // For current tag input
  const [imagePreviews, setImagePreviews] = useState([]); // For image previews
  const [verificationState, setVerificationState] = useState({
    isVerifying: false,
    result: null,
    error: null
  });

  // Load categories and brands on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, brandsData] = await Promise.all([
          productsService.getCategories(),
          productsService.getBrands()
        ]);
        
        setCategories(categoriesData || []);
        setBrands(brandsData || []);
      } catch (error) {
        console.error('Error loading product data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Initialize image previews if formData.images already exists
  useEffect(() => {
    if (formData.images && Array.isArray(formData.images)) {
      const previews = formData.images.map((image, index) => {
        if (image instanceof File) {
          return {
            id: index,
            file: image,
            url: URL.createObjectURL(image),
            name: image.name
          };
        }
        return null;
      }).filter(Boolean);
      setImagePreviews(previews);
    }
  }, []);

  // Handle image selection
  const handleImageSelection = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = Array.isArray(formData.images) ? formData.images : [];
    
    // Add new files to existing images
    const newImages = [...currentImages, ...files];
    
    // Update form data with actual File objects
    handleChange('images', newImages);
    
    // Validate images
    const fieldErrors = validateField('images', newImages);
    setValidationErrors(prev => ({
      ...prev,
      images: fieldErrors.images || null
    }));
    
    // Create previews for new images
    const newPreviews = files.map((file, index) => ({
      id: currentImages.length + index,
      file: file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Clear the input
    e.target.value = '';
  };

  // Remove image
  const removeImage = (indexToRemove) => {
    const currentImages = Array.isArray(formData.images) ? formData.images : [];
    const newImages = currentImages.filter((_, index) => index !== indexToRemove);
    
    // Update form data
    handleChange('images', newImages);
    
    // Validate images after removal
    const fieldErrors = validateField('images', newImages);
    setValidationErrors(prev => ({
      ...prev,
      images: fieldErrors.images || null
    }));
    
    // Update previews and cleanup blob URLs
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove);
      // Cleanup removed URL
      const removedPreview = prev[indexToRemove];
      if (removedPreview?.url) {
        URL.revokeObjectURL(removedPreview.url);
      }
      return newPreviews.map((preview, newIndex) => ({
        ...preview,
        id: newIndex
      }));
    });
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, []);

  // Validation function
  const validateField = (fieldName, value) => {
    const errors = {};

    switch (fieldName) {
      case 'name':
        if (!value || value.trim().length < 2) {
          errors.name = 'Product name must be at least 2 characters';
        } else if (value.length > 255) {
          errors.name = 'Product name cannot exceed 255 characters';
        }
        break;
      case 'sku':
        if (!value || value.trim().length < 1) {
          errors.sku = 'SKU is required';
        } else if (!/^[A-Z0-9-_]+$/i.test(value)) {
          errors.sku = 'SKU can only contain letters, numbers, hyphens, and underscores';
        }
        break;
      case 'category_id':
        if (!value || value === '' || value === '0') {
          errors.category_id = 'Please select a category';
        }
        break;
      case 'price':
        if (!value || parseFloat(value) <= 0) {
          errors.price = 'Price must be greater than 0';
        }
        break;
      case 'compare_at_price':
        const price = parseFloat(formData.price) || 0;
        if (value && parseFloat(value) <= price) {
          errors.compare_at_price = 'Compare at price must be greater than price';
        }
        break;
      case 'images':
        if (!value || !Array.isArray(value) || value.length === 0) {
          errors.images = 'At least one product image is required';
        } else if (value.length > 10) {
          errors.images = 'Maximum 10 images allowed';
        } else {
          // Check if all images are valid File objects
          const invalidImages = value.filter(img => !(img instanceof File));
          if (invalidImages.length > 0) {
            errors.images = 'All images must be valid files';
          }
        }
        break;
      case 'short_description':
        if (!value || value.trim().length < 10) {
          errors.short_description = 'Short description must be at least 10 characters';
        } else if (value.length > 500) {
          errors.short_description = 'Short description cannot exceed 500 characters';
        }
        break;
      case 'description':
        if (value && value.length > 5000) {
          errors.description = 'Description cannot exceed 5000 characters';
        }
        break;
    }

    return errors;
  };

  // Handle field change with validation
  const handleFieldChange = (fieldName, value) => {
    handleChange(fieldName, value);
    
    // Validate field
    const fieldErrors = validateField(fieldName, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors[fieldName] || null
    }));

    // Call parent validation if provided
    if (onValidation) {
      onValidation(fieldName, !fieldErrors[fieldName]);
    }
  };

  // Tag management functions
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    
    // Check if comma was typed
    if (value.includes(',')) {
      const newTag = value.replace(',', '').trim();
      if (newTag) {
        addTag(newTag);
      }
      setTagInput(''); // Clear input after adding tag
    } else {
      setTagInput(value);
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag) {
        addTag(newTag);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput) {
      // Remove last tag if backspace is pressed on empty input
      removeLastTag();
    }
  };

  const addTag = (tagText) => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    if (!currentTags.includes(tagText)) {
      const newTags = [...currentTags, tagText];
      handleChange('tags', newTags);
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    handleChange('tags', newTags);
  };

  const removeLastTag = () => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    if (currentTags.length > 0) {
      const newTags = currentTags.slice(0, -1);
      handleChange('tags', newTags);
    }
  };

  // Verification function
  const handleVerifyProduct = async () => {
    // Validate required fields for verification
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter a product name before verification');
      return;
    }

    if (!formData.images || !Array.isArray(formData.images) || formData.images.length === 0) {
      alert('Please upload at least one product image before verification');
      return;
    }

    setVerificationState({ isVerifying: true, result: null, error: null });

    try {
      const userTokens = tokens.get();
      if (!userTokens?.access_token) {
        throw new Error('No authentication token found');
      }

      const verificationData = {
        title: formData.name.trim(),
        image: formData.images[0] // Use first image for verification
      };

      const result = await productsSupplier.verifyBeforeCreation(verificationData, userTokens.access_token);
      
      setVerificationState({
        isVerifying: false,
        result: result,
        error: null
      });

    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationState({
        isVerifying: false,
        result: null,
        error: error.message || 'Verification failed'
      });
    }
  };

  return (
    <>
      {/* Product Name */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            Product Name
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="Enter product name"
          className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                   font-semibold text-[16px] text-[#1a4032] opacity-50
                   focus:opacity-100 focus:outline-none transition-all
                   ${validationErrors.name || errors.name 
                     ? 'border-red-500 focus:border-red-500' 
                     : 'border-[#858c94] focus:border-[#1a4032]'}`}
          required
        />
        {(validationErrors.name || errors.name) && (
          <span className="text-red-500 text-sm mt-1 px-4">
            {validationErrors.name || errors.name}
          </span>
        )}
      </div>

      {/* SKU */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            SKU (Stock Keeping Unit)
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.sku || ''}
          onChange={(e) => handleFieldChange('sku', e.target.value)}
          placeholder="e.g., PRD-001"
          className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                   font-semibold text-[16px] text-[#1a4032] opacity-50
                   focus:opacity-100 focus:outline-none transition-all
                   ${validationErrors.sku || errors.sku 
                     ? 'border-red-500 focus:border-red-500' 
                     : 'border-[#858c94] focus:border-[#1a4032]'}`}
          required
        />
        {(validationErrors.sku || errors.sku) && (
          <span className="text-red-500 text-sm mt-1 px-4">
            {validationErrors.sku || errors.sku}
          </span>
        )}
      </div>

      {/* Short Description */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            Short Description
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        <textarea
          value={formData.short_description || ''}
          onChange={(e) => handleFieldChange('short_description', e.target.value)}
          placeholder="Brief product summary (appears in listings)"
          rows={2}
          className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                   font-semibold text-[16px] text-[#1a4032] opacity-50
                   focus:opacity-100 focus:outline-none transition-all resize-none
                   ${validationErrors.short_description || errors.short_description 
                     ? 'border-red-500 focus:border-red-500' 
                     : 'border-[#858c94] focus:border-[#1a4032]'}`}
          required
        />
        {(validationErrors.short_description || errors.short_description) && (
          <span className="text-red-500 text-sm mt-1 px-4">
            {validationErrors.short_description || errors.short_description}
          </span>
        )}
      </div>

      {/* Full Description */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            Product Description
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Detailed product description, features, and benefits"
          rows={4}
          className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                   font-semibold text-[16px] text-[#1a4032] opacity-50
                   focus:opacity-100 focus:outline-none transition-all resize-none
                   ${validationErrors.description || errors.description 
                     ? 'border-red-500 focus:border-red-500' 
                     : 'border-[#858c94] focus:border-[#1a4032]'}`}
          required
        />
        {(validationErrors.description || errors.description) && (
          <span className="text-red-500 text-sm mt-1 px-4">
            {validationErrors.description || errors.description}
          </span>
        )}
      </div>

      {/* Category and Brand */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Category */}
        <div className="flex flex-col flex-1">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Product Category
            </span>
            <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
          </label>
          <select
            value={formData.category_id || ''}
            onChange={(e) => handleFieldChange('category_id', e.target.value)}
            className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none transition-all
                     ${validationErrors.category_id || errors.category_id 
                       ? 'border-red-500 focus:border-red-500' 
                       : 'border-[#858c94] focus:border-[#1a4032]'}`}
            required
          >
            <option value="">
              {loading ? 'Loading categories...' : 'Select Category'}
            </option>
            {!loading && categories.length === 0 && (
              <option value="" disabled>No categories available</option>
            )}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {(validationErrors.category_id || errors.category_id) && (
            <span className="text-red-500 text-sm mt-1 px-4">
              {validationErrors.category_id || errors.category_id}
            </span>
          )}
        </div>

        {/* Brand */}
        <div className="flex flex-col flex-1">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Brand (Optional)
            </span>
          </label>
          <select
            value={formData.brand_id || ''}
            onChange={(e) => handleChange('brand_id', e.target.value)}
            className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
          >
            <option value="">
              {loading ? 'Loading brands...' : 'Select Brand'}
            </option>
            {!loading && brands.length === 0 && (
              <option value="" disabled>No brands available</option>
            )}
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pricing */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Price */}
        <div className="flex flex-col flex-1">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Price (₹)
            </span>
            <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price || ''}
            onChange={(e) => handleFieldChange('price', e.target.value)}
            placeholder="0.00"
            className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none transition-all
                     ${validationErrors.price || errors.price 
                       ? 'border-red-500 focus:border-red-500' 
                       : 'border-[#858c94] focus:border-[#1a4032]'}`}
            required
          />
          {(validationErrors.price || errors.price) && (
            <span className="text-red-500 text-sm mt-1 px-4">
              {validationErrors.price || errors.price}
            </span>
          )}
        </div>

        {/* Compare At Price */}
        <div className="flex flex-col flex-1">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Compare At Price (₹)
            </span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.compare_at_price || ''}
            onChange={(e) => handleChange('compare_at_price', e.target.value)}
            placeholder="0.00 (optional)"
            className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
          />
        </div>

        {/* Cost Per Item */}
        <div className="flex flex-col flex-1">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Cost Per Item (₹)
            </span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.cost_per_item || ''}
            onChange={(e) => handleChange('cost_per_item', e.target.value)}
            placeholder="0.00 (optional)"
            className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
          />
        </div>
      </div>

      {/* Product Images */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            Product Images *
          </span>
          <span className="text-gray-400 text-[13px] opacity-80 ml-1">(Required - at least 1 image)</span>
        </label>
        
        {/* Image Upload Input */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelection}
          className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                   font-semibold text-[16px] text-[#1a4032] opacity-50
                   focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all
                   file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                   file:text-sm file:font-semibold file:bg-[#12b74f] file:text-white
                   hover:file:bg-[#0ea344]"
        />
        
        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 px-4">
            <h4 className="text-sm font-semibold text-[#1a4032] mb-3">
              Selected Images ({imagePreviews.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={preview.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white 
                             rounded-full w-6 h-6 flex items-center justify-center text-sm
                             opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Remove image"
                  >
                    ×
                  </button>
                  
                  {/* Image name */}
                  <p className="mt-1 text-xs text-gray-600 truncate" title={preview.name}>
                    {preview.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mt-2 px-4">
          Upload high-quality product images (JPG, PNG). Multiple images supported. First image will be the main product image.
        </p>
        
        {validationErrors.images && (
          <p className="text-red-500 text-sm mt-1 px-4">{validationErrors.images}</p>
        )}
      </div>

      {/* Product Verification Section */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            AI Product Verification
          </span>
          <span className="text-gray-400 text-[13px] opacity-80">(Optional Preview)</span>
        </div>
        
        <div className="px-4">
          <p className="text-sm text-gray-600 mb-3">
            Test if your product image matches the title using AI. This helps ensure better product quality.
          </p>
          
          <button
            type="button"
            onClick={handleVerifyProduct}
            disabled={verificationState.isVerifying || !formData.name?.trim() || !formData.images?.length}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#12b74f] text-white font-semibold 
                     rounded-lg hover:bg-[#0ea344] disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all duration-200"
          >
            {verificationState.isVerifying ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Verifying...
              </>
            ) : (
              <>
                🔍 Preview Verification
              </>
            )}
          </button>
          
          {/* Verification Results */}
          {verificationState.result && (
            <div className={`mt-3 p-3 rounded-lg border ${
              verificationState.result.probability >= 0.7 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${
                  verificationState.result.probability >= 0.7 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {verificationState.result.probability >= 0.7 ? '✅' : '⚠️'}
                </span>
                <span className={`font-semibold ${
                  verificationState.result.probability >= 0.7 ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  Score: {(verificationState.result.probability * 100).toFixed(1)}%
                </span>
              </div>
              <p className={`text-sm ${
                verificationState.result.probability >= 0.7 ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {verificationState.result.probability >= 0.7 
                  ? 'Great! Your image and title match well. This product will be auto-approved.' 
                  : 'The image and title don\'t match well. Consider updating either the title or image for better approval chances.'
                }
              </p>
              {verificationState.result.suggestion && (
                <p className={`text-sm mt-1 ${
                  verificationState.result.score >= 0.7 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  💡 {verificationState.result.suggestion}
                </p>
              )}
            </div>
          )}
          
          {/* Verification Error */}
          {verificationState.error && (
            <div className="mt-3 p-3 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-600">❌</span>
                <span className="font-semibold text-red-800">Verification Failed</span>
              </div>
              <p className="text-sm text-red-700">{verificationState.error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            Product Tags
          </span>
        </label>
        
        {/* Tags Container */}
        <div className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 min-h-[50px]
                      focus-within:border-[#1a4032] transition-all">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Existing Tags */}
            {Array.isArray(formData.tags) && formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-[#12b74f] text-white text-sm font-semibold 
                         px-3 py-1 rounded-full hover:bg-[#0ea344] transition-colors"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-white hover:text-gray-200 focus:outline-none"
                  aria-label={`Remove ${tag} tag`}
                >
                  ×
                </button>
              </span>
            ))}
            
            {/* Tag Input */}
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder={Array.isArray(formData.tags) && formData.tags.length > 0 ? "Add another tag..." : "eco-friendly, sustainable, organic"}
              className="flex-1 min-w-[120px] bg-transparent border-none outline-none 
                       font-semibold text-[16px] text-[#1a4032] placeholder-gray-400"
            />
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-1 px-4">
          Type and press comma or Enter to add tags. Click × to remove tags.
        </p>
      </div>

      {/* Skip Option */}
      {onSkip && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-2 text-[#1a4032] border border-[#1a4032] rounded-lg 
                     hover:bg-[#1a4032] hover:text-white transition-all duration-200
                     font-semibold"
          >
            Skip Product Creation
          </button>
        </div>
      )}
    </>
  );
}
