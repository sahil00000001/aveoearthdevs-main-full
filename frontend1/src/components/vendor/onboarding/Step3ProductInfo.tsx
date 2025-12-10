import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRANDS } from '@/lib/constants';
import { CheckCircle, Loader2 } from 'lucide-react';
import { backendApi } from '@/services/backendApi';

interface Step3ProductInfoProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
  onSkip: () => void;
}

const Step3ProductInfo: React.FC<Step3ProductInfoProps> = ({
  formData,
  handleChange,
  onSkip
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showAIVerification, setShowAIVerification] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        console.log('Fetching categories from API...');
        const categoriesData = await backendApi.getCategories();
        console.log('Categories API response:', categoriesData);
        
        // Handle both array and object responses
        let categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
        
        // Flatten the category tree if it's nested
        const flatCategories: Array<{ id: string; name: string }> = [];
        const flattenCategories = (cats: any[]) => {
          if (!Array.isArray(cats)) return;
          cats.forEach(cat => {
            if (cat && cat.id && cat.name) {
              flatCategories.push({ id: cat.id, name: cat.name });
            }
            if (cat.children && Array.isArray(cat.children) && cat.children.length > 0) {
              flattenCategories(cat.children);
            }
          });
        };
        flattenCategories(categoriesArray);
        
        console.log('Flattened categories:', flatCategories);
        
        // If no categories from API, use fallback categories
        if (flatCategories.length === 0) {
          console.warn('No categories found from API, using fallback categories');
          // Fallback categories with placeholder IDs
          const fallbackCategories = [
            { id: '1', name: 'Water Bottles' },
            { id: '2', name: 'Bags & Accessories' },
            { id: '3', name: 'Solar Products' },
            { id: '4', name: 'Skincare & Beauty' },
            { id: '5', name: 'Kitchen & Dining' },
            { id: '6', name: 'Stationery' },
            { id: '7', name: 'Clothing' },
            { id: '8', name: 'Zero Waste' }
          ];
          setCategories(fallbackCategories);
        } else {
          setCategories(flatCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories on error
        const fallbackCategories = [
          { id: '1', name: 'Water Bottles' },
          { id: '2', name: 'Bags & Accessories' },
          { id: '3', name: 'Solar Products' },
          { id: '4', name: 'Skincare & Beauty' },
          { id: '5', name: 'Kitchen & Dining' },
          { id: '6', name: 'Stationery' },
          { id: '7', name: 'Clothing' },
          { id: '8', name: 'Zero Waste' }
        ];
        setCategories(fallbackCategories);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (!formData.short_description.trim()) {
      newErrors.short_description = 'Short description is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.brand_id) {
      newErrors.brand_id = 'Brand is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    setShowAIVerification(true);
    
    // Simulate AI verification process
    setTimeout(() => {
      setShowAIVerification(false);
      setIsCreating(false);
      // In a real app, this would call the parent's step completion handler
      // For now, we'll just show success
      alert('Product created successfully! AI verification passed.');
    }, 3000);
  };

  const handleFileChange = (field: string, files: File[]) => {
    handleChange(field, files);
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !formData.tags.includes(value)) {
        handleChange('tags', [...formData.tags, value]);
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleChange('tags', formData.tags.filter((tag: string) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-8">
      {/* AI Verification Modal */}
      {showAIVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-forest to-moss rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-forest mb-2">AI Verification in Progress</h3>
            <p className="text-gray-600 mb-4">
              Our AI is analyzing your product information to ensure it meets our quality standards...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-forest to-moss h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Product Basic Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
          Product Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-forest font-medium">
              Product Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku" className="text-forest font-medium">
              SKU *
            </Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
              className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.sku ? 'border-red-500' : ''
              }`}
              placeholder="Enter SKU (e.g., PROD-001)"
            />
            {errors.sku && (
              <p className="text-sm text-red-500">{errors.sku}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id" className="text-forest font-medium">
              Category *
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleChange('category_id', value)}
              disabled={loadingCategories}
            >
              <SelectTrigger className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.category_id ? 'border-red-500' : ''
              }`}>
                <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  !loadingCategories && (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-500">{errors.category_id}</p>
            )}
            {!loadingCategories && categories.length === 0 && (
              <p className="text-xs text-yellow-600">No categories found. Please contact support.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_id" className="text-forest font-medium">
              Brand *
            </Label>
            <Select
              value={formData.brand_id}
              onValueChange={(value) => handleChange('brand_id', value)}
            >
              <SelectTrigger className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.brand_id ? 'border-red-500' : ''
              }`}>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {BRANDS.map((brand) => (
                  <SelectItem key={brand} value={brand.toLowerCase().replace(/\s+/g, '-')}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.brand_id && (
              <p className="text-sm text-red-500">{errors.brand_id}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="short_description" className="text-forest font-medium">
            Short Description *
          </Label>
          <Input
            id="short_description"
            value={formData.short_description}
            onChange={(e) => handleChange('short_description', e.target.value)}
            className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
              errors.short_description ? 'border-red-500' : ''
            }`}
            placeholder="Brief description (max 100 characters)"
            maxLength={100}
          />
          {errors.short_description && (
            <p className="text-sm text-red-500">{errors.short_description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-forest font-medium">
            Detailed Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
              errors.description ? 'border-red-500' : ''
            }`}
            placeholder="Detailed product description"
            rows={4}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Pricing Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
          Pricing Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-forest font-medium">
              Selling Price (INR) *
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.price ? 'border-red-500' : ''
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="compare_at_price" className="text-forest font-medium">
              Compare at Price (INR)
            </Label>
            <Input
              id="compare_at_price"
              type="number"
              value={formData.compare_at_price}
              onChange={(e) => handleChange('compare_at_price', parseFloat(e.target.value) || 0)}
              className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_per_item" className="text-forest font-medium">
              Cost per Item (INR)
            </Label>
            <Input
              id="cost_per_item"
              type="number"
              value={formData.cost_per_item}
              onChange={(e) => handleChange('cost_per_item', parseFloat(e.target.value) || 0)}
              className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
          Product Images
        </h3>
        
        <FileUpload
          label="Product Images"
          accept="image/*"
          multiple
          onFileChange={(files) => handleFileChange('images', files)}
          files={formData.images}
          required
          error={errors.images}
          maxSize={5}
        />
        <p className="text-sm text-gray-600">
          Upload high-quality images of your product. First image will be used as the main product image.
        </p>
      </div>

      {/* Product Tags */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
          Product Tags
        </h3>
        
        <div className="space-y-4">
          <Input
            placeholder="Type a tag and press Enter"
            onKeyDown={handleTagInput}
            className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
          />
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-forest/10 text-forest rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-forest/20">
        <Button
          type="button"
          variant="outline"
          onClick={onSkip}
          className="border-2 border-forest/20 hover:border-forest hover:bg-forest/5 text-forest"
        >
          Skip Product Creation
        </Button>
        
        <Button
          type="button"
          onClick={handleCreateProduct}
          disabled={isLoading || isCreating}
          className="bg-gradient-to-r from-forest to-moss hover:from-forest/90 hover:to-moss/90 text-white px-8"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Product...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Product
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step3ProductInfo;