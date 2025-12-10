import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Package } from 'lucide-react';

interface Step4InventoryProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const Step4Inventory: React.FC<Step4InventoryProps> = ({
  formData,
  handleChange
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'Valid weight is required';
    }

    if (!formData.origin_country.trim()) {
      newErrors.origin_country = 'Origin country is required';
    }

    if (formData.materials.length === 0) {
      newErrors.materials = 'At least one material is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveInventory = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Inventory saved successfully!');
    } catch (error) {
      console.error('Error saving inventory:', error);
      alert('Failed to save inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaterialInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !formData.materials.includes(value)) {
        handleChange('materials', [...formData.materials, value]);
        e.currentTarget.value = '';
      }
    }
  };

  const removeMaterial = (materialToRemove: string) => {
    handleChange('materials', formData.materials.filter((material: string) => material !== materialToRemove));
  };

  const addVariant = () => {
    const newVariant = {
      sku: '',
      title: '',
      price: 0,
      compare_at_price: 0,
      stock_quantity: 0,
      option1_name: '',
      option1_value: '',
      option2_name: '',
      option2_value: '',
      option3_name: '',
      option3_value: ''
    };
    handleChange('productVariants', [...formData.productVariants, newVariant]);
  };

  const removeVariant = (index: number) => {
    const newVariants = formData.productVariants.filter((_: any, i: number) => i !== index);
    handleChange('productVariants', newVariants);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...formData.productVariants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    handleChange('productVariants', newVariants);
  };

  return (
    <div className="space-y-8">
      {/* Product Details Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
          Product Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-forest font-medium">
              Weight (kg) *
            </Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
              className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.weight ? 'border-red-500' : ''
              }`}
              placeholder="0.0"
              min="0"
              step="0.1"
            />
            {errors.weight && (
              <p className="text-sm text-red-500">{errors.weight}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin_country" className="text-forest font-medium">
              Origin Country *
            </Label>
            <Input
              id="origin_country"
              value={formData.origin_country}
              onChange={(e) => handleChange('origin_country', e.target.value)}
              className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.origin_country ? 'border-red-500' : ''
              }`}
              placeholder="Enter origin country"
            />
            {errors.origin_country && (
              <p className="text-sm text-red-500">{errors.origin_country}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="length" className="text-forest font-medium">
              Length (cm)
            </Label>
            <Input
              id="length"
              type="number"
              value={formData.dimensions.length}
              onChange={(e) => handleChange('dimensions', { ...formData.dimensions, length: parseFloat(e.target.value) || 0 })}
              className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="width" className="text-forest font-medium">
              Width (cm)
            </Label>
            <Input
              id="width"
              type="number"
              value={formData.dimensions.width}
              onChange={(e) => handleChange('dimensions', { ...formData.dimensions, width: parseFloat(e.target.value) || 0 })}
              className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="text-forest font-medium">
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              value={formData.dimensions.height}
              onChange={(e) => handleChange('dimensions', { ...formData.dimensions, height: parseFloat(e.target.value) || 0 })}
              className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="materials" className="text-forest font-medium">
            Materials *
          </Label>
          <Input
            placeholder="Type a material and press Enter"
            onKeyDown={handleMaterialInput}
            className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
              errors.materials ? 'border-red-500' : ''
            }`}
          />
          {errors.materials && (
            <p className="text-sm text-red-500">{errors.materials}</p>
          )}
          
          {formData.materials.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.materials.map((material: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-forest/10 text-forest rounded-full text-sm"
                >
                  {material}
                  <button
                    type="button"
                    onClick={() => removeMaterial(material)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="care_instructions" className="text-forest font-medium">
            Care Instructions
          </Label>
          <Textarea
            id="care_instructions"
            value={formData.care_instructions}
            onChange={(e) => handleChange('care_instructions', e.target.value)}
            className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
            placeholder="Enter care instructions for the product"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="manufacturer" className="text-forest font-medium">
              Manufacturer
            </Label>
            <Input
              id="manufacturer"
              value={formData.manufacturing_details.manufacturer}
              onChange={(e) => handleChange('manufacturing_details', { ...formData.manufacturing_details, manufacturer: e.target.value })}
              className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
              placeholder="Enter manufacturer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturing_country" className="text-forest font-medium">
              Manufacturing Country
            </Label>
            <Input
              id="manufacturing_country"
              value={formData.manufacturing_details.country}
              onChange={(e) => handleChange('manufacturing_details', { ...formData.manufacturing_details, country: e.target.value })}
              className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
              placeholder="Enter manufacturing country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturing_date" className="text-forest font-medium">
              Manufacturing Date
            </Label>
            <Input
              id="manufacturing_date"
              type="date"
              value={formData.manufacturing_details.date}
              onChange={(e) => handleChange('manufacturing_details', { ...formData.manufacturing_details, date: e.target.value })}
              className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
            />
          </div>
        </div>
      </div>

      {/* Inventory Settings */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
          Inventory Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="track_quantity"
              checked={formData.track_quantity}
              onCheckedChange={(checked) => handleChange('track_quantity', checked)}
            />
            <Label htmlFor="track_quantity" className="text-forest font-medium">
              Track quantity for this product
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="continue_selling"
              checked={formData.continue_selling}
              onCheckedChange={(checked) => handleChange('continue_selling', checked)}
            />
            <Label htmlFor="continue_selling" className="text-forest font-medium">
              Continue selling when out of stock
            </Label>
          </div>
        </div>
      </div>

      {/* Product Variants */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
            Product Variants
          </h3>
          <Button
            type="button"
            variant="outline"
            onClick={addVariant}
            className="border-2 border-forest/20 hover:border-forest hover:bg-forest/5 text-forest"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.productVariants.map((variant: any, index: number) => (
            <div key={index} className="border border-forest/20 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-forest">Variant {index + 1}</h4>
                {formData.productVariants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-forest font-medium">SKU</Label>
                  <Input
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, 'sku', e.target.value.toUpperCase())}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="VARIANT-SKU-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-forest font-medium">Title</Label>
                  <Input
                    value={variant.title}
                    onChange={(e) => updateVariant(index, 'title', e.target.value)}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="Variant title"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-forest font-medium">Price (INR)</Label>
                  <Input
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-forest font-medium">Compare at Price (INR)</Label>
                  <Input
                    type="number"
                    value={variant.compare_at_price}
                    onChange={(e) => updateVariant(index, 'compare_at_price', parseFloat(e.target.value) || 0)}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-forest font-medium">Stock Quantity</Label>
                  <Input
                    type="number"
                    value={variant.stock_quantity}
                    onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-forest font-medium">Option 1 Name</Label>
                  <Input
                    value={variant.option1_name}
                    onChange={(e) => updateVariant(index, 'option1_name', e.target.value)}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="e.g., Size"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-forest font-medium">Option 1 Value</Label>
                  <Input
                    value={variant.option1_value}
                    onChange={(e) => updateVariant(index, 'option1_value', e.target.value)}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="e.g., Small"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-forest font-medium">Option 2 Name</Label>
                  <Input
                    value={variant.option2_name}
                    onChange={(e) => updateVariant(index, 'option2_name', e.target.value)}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="e.g., Color"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-forest font-medium">Option 2 Value</Label>
                  <Input
                    value={variant.option2_value}
                    onChange={(e) => updateVariant(index, 'option2_value', e.target.value)}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="e.g., Blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-forest font-medium">Option 3 Name</Label>
                  <Input
                    value={variant.option3_name}
                    onChange={(e) => updateVariant(index, 'option3_name', e.target.value)}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="e.g., Material"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-forest font-medium">Option 3 Value</Label>
                  <Input
                    value={variant.option3_value}
                    onChange={(e) => updateVariant(index, 'option3_value', e.target.value)}
                    className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
                    placeholder="e.g., Cotton"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-forest/20">
        <Button
          type="button"
          variant="outline"
          className="border-2 border-forest/20 hover:border-forest hover:bg-forest/5 text-forest"
        >
          Skip
        </Button>
        
        <Button
          type="button"
          onClick={handleSaveInventory}
          disabled={isLoading}
          className="bg-gradient-to-r from-forest to-moss hover:from-forest/90 hover:to-moss/90 text-white px-8"
        >
          {isLoading ? 'Saving...' : 'Save Inventory'}
        </Button>
      </div>
    </div>
  );
};

export default Step4Inventory;