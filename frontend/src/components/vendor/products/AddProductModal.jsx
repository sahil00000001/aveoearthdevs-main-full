import React, { useState, useEffect } from 'react';
import { productsService } from '../../../lib/productsService';
import { productsSupplier, tokens } from '../../../lib/api';

export default function AddProductModal({ isOpen, onClose, onProductAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    short_description: '',
    description: '',
    category_id: '',
    brand_id: '',
    price: '',
    compare_at_price: '',
    weight: '',
    origin_country: '',
    materials: [],
    dimensions: { length: 0, width: 0, height: 0 },
    manufacturing_details: { process: '', location: '' },
    images: [],
    tags: []
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [currentMaterialInput, setCurrentMaterialInput] = useState('');
  
  // Verification state
  const [verificationState, setVerificationState] = useState({
    isVerifying: false,
    result: null,
    error: null
  });

  // Load categories and brands on component mount
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = tokens.get()?.access_token;
      
      console.log('Loading categories and brands...', { token: !!token });
      
      if (!token) {
        console.warn('No access token found, using fallback data');
        setCategories([
          { id: '1', name: 'Home & Living' },
          { id: '2', name: 'Fashion' },
          { id: '3', name: 'Food & Beverage' },
          { id: '4', name: 'Beauty & Personal Care' },
          { id: '5', name: 'Pets' }
        ]);
        setBrands([
          { id: '1', name: 'Eco-Friendly Co.' },
          { id: '2', name: 'Green Living' },
          { id: '3', name: 'Natural Choice' },
          { id: '4', name: 'Sustainable Goods' }
        ]);
        return;
      }
      
      const [categoriesData, brandsData] = await Promise.all([
        productsSupplier.getCategories(token),
        productsSupplier.getBrands(token)
      ]);
      
      console.log('Raw API response:', { categoriesData, brandsData });
      
      // Process categories tree into flat list if needed
      let processedCategories = [];
      if (categoriesData) {
        if (Array.isArray(categoriesData)) {
          // If already flat array
          processedCategories = categoriesData;
        } else if (categoriesData.categories && Array.isArray(categoriesData.categories)) {
          // If wrapped in categories property
          processedCategories = categoriesData.categories;
        } else {
          // If tree structure, flatten it
          const flattenCategories = (cats, parentName = '') => {
            let flat = [];
            if (Array.isArray(cats)) {
              cats.forEach(cat => {
                const name = parentName ? `${parentName} > ${cat.name}` : cat.name;
                flat.push({ id: cat.id, name: name });
                if (cat.children && cat.children.length > 0) {
                  flat = flat.concat(flattenCategories(cat.children, name));
                }
              });
            }
            return flat;
          };
          processedCategories = flattenCategories(categoriesData);
        }
      }
      
      // Process brands
      let processedBrands = [];
      if (brandsData) {
        if (Array.isArray(brandsData)) {
          processedBrands = brandsData;
        } else if (brandsData.brands && Array.isArray(brandsData.brands)) {
          processedBrands = brandsData.brands;
        }
      }
      
      console.log('Processed data:', { 
        categories: processedCategories?.length || 0, 
        brands: processedBrands?.length || 0 
      });
      
      setCategories(processedCategories || []);
      setBrands(processedBrands || []);
    } catch (error) {
      console.error('Error loading product data:', error);
      // Fallback data in case of error
      setCategories([
        { id: '1', name: 'Home & Living' },
        { id: '2', name: 'Fashion' },
        { id: '3', name: 'Food & Beverage' },
        { id: '4', name: 'Beauty & Personal Care' },
        { id: '5', name: 'Pets' }
      ]);
      setBrands([
        { id: '1', name: 'Eco-Friendly Co.' },
        { id: '2', name: 'Green Living' },
        { id: '3', name: 'Natural Choice' },
        { id: '4', name: 'Sustainable Goods' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleDimensionsChange = (dimension, value) => {
    const dimensions = formData.dimensions || {};
    const newDimensions = { ...dimensions, [dimension]: parseFloat(value) || 0 };
    handleChange('dimensions', newDimensions);
  };

  const handleManufacturingChange = (detail, value) => {
    const manufacturingDetails = formData.manufacturing_details || {};
    const newDetails = { ...manufacturingDetails, [detail]: value };
    handleChange('manufacturing_details', newDetails);
  };

  const handleTagKeyPress = (e) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = currentTagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      handleChange('tags', [...formData.tags, tag]);
      setCurrentTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleMaterialKeyPress = (e) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      addMaterial();
    }
  };

  const addMaterial = () => {
    const material = currentMaterialInput.trim();
    if (material && !formData.materials.includes(material)) {
      handleChange('materials', [...formData.materials, material]);
      setCurrentMaterialInput('');
    }
  };

  const removeMaterial = (materialToRemove) => {
    handleChange('materials', formData.materials.filter(material => material !== materialToRemove));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    handleChange('images', [...formData.images, ...files]);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleChange('images', newImages);
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.short_description?.trim()) newErrors.short_description = 'Short description is required';
    if (!formData.description?.trim()) newErrors.description = 'Product description is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.origin_country?.trim()) newErrors.origin_country = 'Origin country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const token = tokens.get()?.access_token;
      
      const result = await productsSupplier.createProduct(formData, token);
      console.log('Product created successfully:', result);
      
      // Reset form
      setFormData({
        name: '',
        sku: '',
        short_description: '',
        description: '',
        category_id: '',
        brand_id: '',
        price: '',
        compare_at_price: '',
        weight: '',
        origin_country: '',
        materials: [],
        dimensions: { length: 0, width: 0, height: 0 },
        manufacturing_details: { process: '', location: '' },
        images: [],
        tags: []
      });
      
      onProductAdded && onProductAdded(result);
      onClose();
    } catch (error) {
      console.error('Failed to create product:', error);
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#1a4032]">Add New Product</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1a4032]">Basic Information</h3>
            
            {/* Product Name */}
            <div className="flex flex-col">
              <label className="flex items-center mb-2">
                <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
                  Product Name
                </span>
                <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter product name"
                className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                         font-semibold text-[16px] text-[#1a4032] opacity-50
                         focus:opacity-100 focus:outline-none transition-all
                         ${errors.name ? 'border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
                required
              />
              {errors.name && (
                <span className="text-red-500 text-sm mt-1">{errors.name}</span>
              )}
            </div>

            {/* SKU */}
            <div className="flex flex-col">
              <label className="flex items-center mb-2">
                <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
                  SKU (Stock Keeping Unit)
                </span>
                <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="e.g., PRD-001"
                className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                         font-semibold text-[16px] text-[#1a4032] opacity-50
                         focus:opacity-100 focus:outline-none transition-all
                         ${errors.sku ? 'border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
                required
              />
              {errors.sku && (
                <span className="text-red-500 text-sm mt-1">{errors.sku}</span>
              )}
            </div>

            {/* Short Description */}
            <div className="flex flex-col">
              <label className="flex items-center mb-2">
                <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
                  Short Description
                </span>
                <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
              </label>
              <textarea
                value={formData.short_description || ''}
                onChange={(e) => handleChange('short_description', e.target.value)}
                placeholder="Brief product summary (appears in listings)"
                rows={2}
                className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                         font-semibold text-[16px] text-[#1a4032] opacity-50
                         focus:opacity-100 focus:outline-none transition-all resize-none
                         ${errors.short_description ? 'border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
                required
              />
              {errors.short_description && (
                <span className="text-red-500 text-sm mt-1">{errors.short_description}</span>
              )}
            </div>

            {/* Full Description */}
            <div className="flex flex-col">
              <label className="flex items-center mb-2">
                <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
                  Product Description
                </span>
                <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed product description, features, and benefits"
                rows={4}
                className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                         font-semibold text-[16px] text-[#1a4032] opacity-50
                         focus:opacity-100 focus:outline-none transition-all resize-none
                         ${errors.description ? 'border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
                required
              />
              {errors.description && (
                <span className="text-red-500 text-sm mt-1">{errors.description}</span>
              )}
            </div>
          </div>

          {/* Category and Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1a4032]">Category & Brand</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Product Category */}
              <div className="flex flex-col flex-1">
                <label className="flex items-center mb-2">
                  <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
                    Product Category
                  </span>
                  <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
                </label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => handleChange('category_id', e.target.value)}
                  className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                           font-semibold text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none transition-all
                           ${errors.category_id ? 'border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
                  required
                >
                  <option value="">
                    {loading ? 'Loading categories...' : 'Select Category'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <span className="text-red-500 text-sm mt-1">{errors.category_id}</span>
                )}
              </div>

              {/* Brand */}
              <div className="flex flex-col flex-1">
                <label className="flex items-center mb-2">
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
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1a4032]">Pricing</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Price */}
              <div className="flex flex-col flex-1">
                <label className="flex items-center mb-2">
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
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                           font-semibold text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none transition-all
                           ${errors.price ? 'border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
                  required
                />
                {errors.price && (
                  <span className="text-red-500 text-sm mt-1">{errors.price}</span>
                )}
              </div>

              {/* Compare at Price */}
              <div className="flex flex-col flex-1">
                <label className="flex items-center mb-2">
                  <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
                    Compare at Price (₹)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compare_at_price || ''}
                  onChange={(e) => handleChange('compare_at_price', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                           font-semibold text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Physical Properties */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1a4032]">Physical Properties</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Weight */}
              <div className="flex flex-col flex-1">
                <label className="flex items-center mb-2">
                  <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
                    Weight (kg)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight || ''}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                           font-semibold text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>

              {/* Origin Country */}
              <div className="flex flex-col flex-1">
                <label className="flex items-center mb-2">
                  <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
                    Origin Country
                  </span>
                  <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.origin_country || ''}
                  onChange={(e) => handleChange('origin_country', e.target.value)}
                  placeholder="e.g., India"
                  className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                           font-semibold text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none transition-all
                           ${errors.origin_country ? 'border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
                  required
                />
                {errors.origin_country && (
                  <span className="text-red-500 text-sm mt-1">{errors.origin_country}</span>
                )}
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold text-[16px] text-[#1a4032] opacity-80 mb-2">
                  Length (cm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dimensions?.length || ''}
                  onChange={(e) => handleDimensionsChange('length', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                           font-semibold text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-[16px] text-[#1a4032] opacity-80 mb-2">
                  Width (cm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dimensions?.width || ''}
                  onChange={(e) => handleDimensionsChange('width', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                           font-semibold text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-[16px] text-[#1a4032] opacity-80 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dimensions?.height || ''}
                  onChange={(e) => handleDimensionsChange('height', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                           font-semibold text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1a4032]">Materials</h3>
            
            <div className="flex flex-col">
              <label className="font-semibold text-[16px] text-[#1a4032] opacity-80 mb-2">
                Materials (Press comma to add)
              </label>
              <input
                type="text"
                value={currentMaterialInput}
                onChange={(e) => setCurrentMaterialInput(e.target.value)}
                onKeyPress={handleMaterialKeyPress}
                onBlur={addMaterial}
                placeholder="Type material and press comma"
                className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                         font-semibold text-[16px] text-[#1a4032] opacity-50
                         focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
              />
              {formData.materials.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.materials.map((material, index) => (
                    <span
                      key={index}
                      className="bg-[#1a4032] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {material}
                      <button
                        type="button"
                        onClick={() => removeMaterial(material)}
                        className="text-white hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1a4032]">Tags</h3>
            
            <div className="flex flex-col">
              <label className="font-semibold text-[16px] text-[#1a4032] opacity-80 mb-2">
                Product Tags (Press comma to add)
              </label>
              <input
                type="text"
                value={currentTagInput}
                onChange={(e) => setCurrentTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                onBlur={addTag}
                placeholder="Type tag and press comma"
                className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                         font-semibold text-[16px] text-[#1a4032] opacity-50
                         focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[#1a4032] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-white hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1a4032]">Product Images</h3>
            
            <div className="flex flex-col">
              <label className="font-semibold text-[16px] text-[#1a4032] opacity-80 mb-2">
                Upload Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                         font-semibold text-[16px] text-[#1a4032] opacity-50
                         focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
              />
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Verification */}
          {formData.images.length > 0 && formData.name.trim() && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a4032]">Product Verification</h3>
              
              <div className="bg-[#f9fbe7] border border-[#858c94] rounded-[8px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-[16px] text-[#1a4032] opacity-80">
                      Image-Title Verification
                    </h4>
                    <p className="text-sm text-[#1a4032] opacity-60 mt-1">
                      Verify that your product image matches the product name
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyProduct}
                    disabled={verificationState.isVerifying}
                    className="bg-[#1a4032] text-white px-4 py-2 rounded-[8px] font-semibold text-sm
                             hover:bg-[#0f2419] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verificationState.isVerifying ? 'Verifying...' : 'Verify Product'}
                  </button>
                </div>
                
                {verificationState.result && (
                  <div className={`p-3 rounded-md border ${
                    verificationState.result.probability >= 0.7 
                      ? 'bg-green-100 border-green-300' 
                      : 'bg-red-100 border-red-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">
                        {verificationState.result.probability >= 0.7 ? '✅ Verification Passed' : '❌ Verification Failed'}
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round(verificationState.result.probability * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm mt-1 opacity-80">
                      {verificationState.result.explanation || 'AI verification analysis completed.'}
                    </p>
                    {verificationState.result.probability < 0.7 && (
                      <p className="text-sm mt-2 text-red-700 font-medium">
                        ⚠️ Consider updating your product name or image to better match each other before creating the product.
                      </p>
                    )}
                  </div>
                )}
                
                {verificationState.error && (
                  <div className="p-3 rounded-md bg-red-100 border border-red-300">
                    <p className="text-sm text-red-700">
                      ❌ Verification Error: {verificationState.error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manufacturing Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1a4032]">Manufacturing Details</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col flex-1">
                <label className="font-semibold text-[16px] text-[#1a4032] opacity-80 mb-2">
                  Manufacturing Process
                </label>
                <input
                  type="text"
                  value={formData.manufacturing_details?.process || ''}
                  onChange={(e) => handleManufacturingChange('process', e.target.value)}
                  placeholder="e.g., Handmade, Machine-made"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                           font-semibold text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="font-semibold text-[16px] text-[#1a4032] opacity-80 mb-2">
                  Manufacturing Location
                </label>
                <input
                  type="text"
                  value={formData.manufacturing_details?.location || ''}
                  onChange={(e) => handleManufacturingChange('location', e.target.value)}
                  placeholder="e.g., Mumbai, India"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                           font-semibold text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#1a4032] text-white rounded-lg hover:bg-[#2d5a42] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
