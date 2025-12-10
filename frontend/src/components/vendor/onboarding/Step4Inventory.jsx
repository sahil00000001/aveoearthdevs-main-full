import React, { useState, useEffect } from 'react';

export default function Step4Inventory({ formData, handleChange, errors = {}, onValidation }) {
  const [validationErrors, setValidationErrors] = useState({});
  const [variants, setVariants] = useState(formData.productVariants || [{ 
    sku: '', 
    title: '', 
    price: '', 
    compare_at_price: '', 
    weight: '',
    option1_name: '',
    option1_value: '',
    option2_name: '',
    option2_value: '',
    option3_name: '',
    option3_value: '',
    is_default: false 
  }]);

  // Validation function
  const validateField = (fieldName, value) => {
    const errors = {};

    switch (fieldName) {
      case 'weight':
        if (value && parseFloat(value) < 0) {
          errors.weight = 'Weight cannot be negative';
        }
        break;
      case 'origin_country':
        if (!value || value.trim().length < 2) {
          errors.origin_country = 'Origin country is required';
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

  // Handle variants
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
    handleChange('productVariants', newVariants);
  };

  const addVariant = () => {
    const newVariants = [...variants, { 
      sku: '', 
      title: '', 
      price: '', 
      compare_at_price: '', 
      weight: '',
      option1_name: '',
      option1_value: '',
      option2_name: '',
      option2_value: '',
      option3_name: '',
      option3_value: '',
      is_default: false 
    }];
    setVariants(newVariants);
    handleChange('productVariants', newVariants);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
      handleChange('productVariants', newVariants);
    }
  };

  // Handle materials array
  const handleMaterialsChange = (value) => {
    const materialsArray = value.split(',').map(material => material.trim()).filter(material => material);
    handleChange('materials', materialsArray);
  };

  // Handle dimensions object
  const handleDimensionsChange = (dimension, value) => {
    const dimensions = formData.dimensions || {};
    const newDimensions = { ...dimensions, [dimension]: parseFloat(value) || 0 };
    handleChange('dimensions', newDimensions);
  };

  // Handle manufacturing details object
  const handleManufacturingChange = (detail, value) => {
    const manufacturingDetails = formData.manufacturing_details || {};
    const newDetails = { ...manufacturingDetails, [detail]: value };
    handleChange('manufacturing_details', newDetails);
  };

  return (
    <>
      {/* Physical Properties */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-[18px] text-[#1a4032] mb-4">Physical Properties</h3>
        
        {/* Weight */}
        <div className="flex flex-col mb-4">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Weight (kg)
            </span>
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={formData.weight || ''}
            onChange={(e) => handleFieldChange('weight', e.target.value)}
            placeholder="0.000"
            className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none transition-all
                     ${validationErrors.weight || errors.weight 
                       ? 'border-red-500 focus:border-red-500' 
                       : 'border-[#858c94] focus:border-[#1a4032]'}`}
          />
          {(validationErrors.weight || errors.weight) && (
            <span className="text-red-500 text-sm mt-1 px-4">
              {validationErrors.weight || errors.weight}
            </span>
          )}
        </div>

        {/* Dimensions */}
        <div className="flex flex-col mb-4">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Dimensions (L × W × H in cm)
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.dimensions?.length || ''}
              onChange={(e) => handleDimensionsChange('length', e.target.value)}
              placeholder="Length"
              className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-2 sm:px-3 py-2 sm:py-3 
                       font-semibold text-[14px] sm:text-[16px] text-[#1a4032] opacity-50
                       focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.dimensions?.width || ''}
              onChange={(e) => handleDimensionsChange('width', e.target.value)}
              placeholder="Width"
              className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-2 sm:px-3 py-2 sm:py-3 
                       font-semibold text-[14px] sm:text-[16px] text-[#1a4032] opacity-50
                       focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.dimensions?.height || ''}
              onChange={(e) => handleDimensionsChange('height', e.target.value)}
              placeholder="Height"
              className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-2 sm:px-3 py-2 sm:py-3 
                       font-semibold text-[14px] sm:text-[16px] text-[#1a4032] opacity-50
                       focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Materials and Care */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-[18px] text-[#1a4032] mb-4">Materials and Care</h3>
        
        {/* Materials */}
        <div className="flex flex-col mb-4">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Materials
            </span>
          </label>
          <input
            type="text"
            value={Array.isArray(formData.materials) ? formData.materials.join(', ') : (formData.materials || '')}
            onChange={(e) => handleMaterialsChange(e.target.value)}
            placeholder="cotton, polyester, bamboo (comma separated)"
            className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
          />
        </div>

        {/* Care Instructions */}
        <div className="flex flex-col mb-4">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Care Instructions
            </span>
          </label>
          <textarea
            value={formData.care_instructions || ''}
            onChange={(e) => handleChange('care_instructions', e.target.value)}
            placeholder="Washing, storage, and maintenance instructions"
            rows={3}
            className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all resize-none"
          />
        </div>
      </div>

      {/* Origin and Manufacturing */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-[18px] text-[#1a4032] mb-4">Origin and Manufacturing</h3>
        
        {/* Origin Country */}
        <div className="flex flex-col mb-4">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Origin Country
            </span>
            <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.origin_country || ''}
            onChange={(e) => handleFieldChange('origin_country', e.target.value)}
            placeholder="e.g., India"
            className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none transition-all
                     ${validationErrors.origin_country || errors.origin_country 
                       ? 'border-red-500 focus:border-red-500' 
                       : 'border-[#858c94] focus:border-[#1a4032]'}`}
            required
          />
          {(validationErrors.origin_country || errors.origin_country) && (
            <span className="text-red-500 text-sm mt-1 px-4">
              {validationErrors.origin_country || errors.origin_country}
            </span>
          )}
        </div>

        {/* Manufacturing Details */}
        <div className="flex flex-col mb-4">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032]">Manufacturing Details</span>
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={formData.manufacturing_details?.process || ''}
                  onChange={(e) => handleManufacturingChange('process', e.target.value)}
                  placeholder="Manufacturing process"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 sm:px-4 sm:py-3 
                           font-semibold text-[14px] sm:text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={formData.manufacturing_details?.facility || ''}
                  onChange={(e) => handleManufacturingChange('facility', e.target.value)}
                  placeholder="Facility type"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 sm:px-4 sm:py-3 
                           font-semibold text-[14px] sm:text-[16px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-[18px] text-[#1a4032] mb-4">Inventory Settings</h3>
        
        {/* Track Quantity */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="track_quantity"
            checked={formData.track_quantity || false}
            onChange={(e) => handleChange('track_quantity', e.target.checked)}
            className="w-4 h-4 text-[#12b74f] border-gray-300 rounded focus:ring-[#12b74f]"
          />
          <label htmlFor="track_quantity" className="ml-2 text-[16px] text-[#1a4032] font-semibold">
            Track quantity for this product
          </label>
        </div>

        {/* Continue Selling */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="continue_selling"
            checked={formData.continue_selling || false}
            onChange={(e) => handleChange('continue_selling', e.target.checked)}
            className="w-4 h-4 text-[#12b74f] border-gray-300 rounded focus:ring-[#12b74f]"
          />
          <label htmlFor="continue_selling" className="ml-2 text-[16px] text-[#1a4032] font-semibold">
            Continue selling when out of stock
          </label>
        </div>
      </div>

      {/* Product Variants */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-[18px] text-[#1a4032] mb-4">Product Variants</h3>
        <p className="text-sm text-gray-600 mb-4">
          Create different variations of your product (e.g., different sizes, colors, materials).
        </p>
        
        {variants.map((variant, index) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-[16px] text-[#1a4032]">Variant {index + 1}</h4>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Remove
                </button>
              )}
            </div>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  SKU (Required)
                </label>
                <input
                  type="text"
                  value={variant.sku || ''}
                  onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                  placeholder="e.g., PROD-RED-L"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={variant.title || ''}
                  onChange={(e) => handleVariantChange(index, 'title', e.target.value)}
                  placeholder="e.g., Red Large"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  Price (₹) (Required)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={variant.price || ''}
                  onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  Compare at Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={variant.compare_at_price || ''}
                  onChange={(e) => handleVariantChange(index, 'compare_at_price', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
            </div>

            {/* Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={variant.weight || ''}
                  onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                  placeholder="0.000"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`default_variant_${index}`}
                  checked={variant.is_default || false}
                  onChange={(e) => {
                    // If this variant is being set as default, unset all others
                    if (e.target.checked) {
                      const newVariants = variants.map((v, i) => ({
                        ...v,
                        is_default: i === index
                      }));
                      setVariants(newVariants);
                      handleChange('productVariants', newVariants);
                    } else {
                      handleVariantChange(index, 'is_default', false);
                    }
                  }}
                  className="w-4 h-4 text-[#12b74f] border-gray-300 rounded focus:ring-[#12b74f]"
                />
                <label htmlFor={`default_variant_${index}`} className="ml-2 text-sm font-semibold text-[#1a4032]">
                  Set as default variant
                </label>
              </div>
            </div>

            {/* Option 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  Option 1 Name (e.g., Color, Size)
                </label>
                <input
                  type="text"
                  value={variant.option1_name || ''}
                  onChange={(e) => handleVariantChange(index, 'option1_name', e.target.value)}
                  placeholder="e.g., Color"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  Option 1 Value
                </label>
                <input
                  type="text"
                  value={variant.option1_value || ''}
                  onChange={(e) => handleVariantChange(index, 'option1_value', e.target.value)}
                  placeholder="e.g., Red"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
            </div>

            {/* Option 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  Option 2 Name (Optional)
                </label>
                <input
                  type="text"
                  value={variant.option2_name || ''}
                  onChange={(e) => handleVariantChange(index, 'option2_name', e.target.value)}
                  placeholder="e.g., Size"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  Option 2 Value
                </label>
                <input
                  type="text"
                  value={variant.option2_value || ''}
                  onChange={(e) => handleVariantChange(index, 'option2_value', e.target.value)}
                  placeholder="e.g., Large"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
            </div>

            {/* Option 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  Option 3 Name (Optional)
                </label>
                <input
                  type="text"
                  value={variant.option3_name || ''}
                  onChange={(e) => handleVariantChange(index, 'option3_name', e.target.value)}
                  placeholder="e.g., Material"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#1a4032] mb-1">
                  Option 3 Value
                </label>
                <input
                  type="text"
                  value={variant.option3_value || ''}
                  onChange={(e) => handleVariantChange(index, 'option3_value', e.target.value)}
                  placeholder="e.g., Cotton"
                  className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-2 
                           font-semibold text-[14px] text-[#1a4032] opacity-50
                           focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addVariant}
          className="w-full bg-[#12b74f] text-white font-semibold py-2 px-4 rounded-lg 
                   hover:bg-[#0ea344] transition-colors"
        >
          Add Another Variant
        </button>
      </div>
    </>
  );
}
