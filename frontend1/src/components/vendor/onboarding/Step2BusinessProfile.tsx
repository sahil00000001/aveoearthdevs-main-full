import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LEGAL_ENTITY_TYPES } from '@/lib/constants';

interface Step2BusinessProfileProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
  onStepComplete: (hasExistingBusiness?: boolean) => void;
}

const Step2BusinessProfile: React.FC<Step2BusinessProfileProps> = ({
  formData,
  handleChange,
  onStepComplete
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required';
    }

    if (!formData.legal_entity_type) {
      newErrors.legal_entity_type = 'Legal entity type is required';
    }

    if (!formData.pan_gst_number.trim()) {
      newErrors.pan_gst_number = 'PAN/GST number is required';
    } else if (formData.pan_gst_number.length < 10) {
      newErrors.pan_gst_number = 'PAN/GST number must be at least 10 characters';
    }

    if (!formData.business_address.trim()) {
      newErrors.business_address = 'Business address is required';
    } else if (formData.business_address.length < 10) {
      newErrors.business_address = 'Business address must be at least 10 characters';
    }

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'Bank name is required';
    }

    if (!formData.bank_account_number.trim()) {
      newErrors.bank_account_number = 'Bank account number is required';
    }

    if (!formData.ifsc_code.trim()) {
      newErrors.ifsc_code = 'IFSC code is required';
    } else if (formData.ifsc_code.length !== 11) {
      newErrors.ifsc_code = 'IFSC code must be exactly 11 characters';
    }

    // Document validation
    if (formData.logo.length === 0) {
      newErrors.logo = 'Business logo is required';
    }

    if (formData.pan_card.length === 0) {
      newErrors.pan_card = 'PAN card document is required';
    }

    if (formData.address_proof.length === 0) {
      newErrors.address_proof = 'Address proof document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onStepComplete();
    } catch (error) {
      console.error('Error saving business profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (field: string, files: File[]) => {
    handleChange(field, files);
  };

  return (
    <div className="space-y-8">
      {/* Business Information Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
          Business Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="business_name" className="text-forest font-medium">
              Business Name *
            </Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => handleChange('business_name', e.target.value)}
              className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.business_name ? 'border-red-500' : ''
              }`}
              placeholder="Enter your business name"
            />
            {errors.business_name && (
              <p className="text-sm text-red-500">{errors.business_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_entity_type" className="text-forest font-medium">
              Legal Entity Type *
            </Label>
            <Select
              value={formData.legal_entity_type}
              onValueChange={(value) => handleChange('legal_entity_type', value)}
            >
              <SelectTrigger className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.legal_entity_type ? 'border-red-500' : ''
              }`}>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {LEGAL_ENTITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.legal_entity_type && (
              <p className="text-sm text-red-500">{errors.legal_entity_type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pan_gst_number" className="text-forest font-medium">
              PAN/GST Number *
            </Label>
            <Input
              id="pan_gst_number"
              value={formData.pan_gst_number}
              onChange={(e) => handleChange('pan_gst_number', e.target.value)}
              className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.pan_gst_number ? 'border-red-500' : ''
              }`}
              placeholder="Enter PAN or GST number"
            />
            {errors.pan_gst_number && (
              <p className="text-sm text-red-500">{errors.pan_gst_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-forest font-medium">
              Website (Optional)
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_address" className="text-forest font-medium">
            Business Address *
          </Label>
          <Textarea
            id="business_address"
            value={formData.business_address}
            onChange={(e) => handleChange('business_address', e.target.value)}
            className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
              errors.business_address ? 'border-red-500' : ''
            }`}
            placeholder="Enter complete business address"
            rows={3}
          />
          {errors.business_address && (
            <p className="text-sm text-red-500">{errors.business_address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-forest font-medium">
            Business Description (Optional)
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032]"
            placeholder="Describe your business and what you offer"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_msme_registered"
            checked={formData.is_msme_registered}
            onCheckedChange={(checked) => handleChange('is_msme_registered', checked)}
          />
          <Label htmlFor="is_msme_registered" className="text-forest font-medium">
            Are you registered under MSME?
          </Label>
        </div>
      </div>

      {/* Banking Information Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
          Banking Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bank_name" className="text-forest font-medium">
              Bank Name *
            </Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => handleChange('bank_name', e.target.value)}
              className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.bank_name ? 'border-red-500' : ''
              }`}
              placeholder="Enter bank name"
            />
            {errors.bank_name && (
              <p className="text-sm text-red-500">{errors.bank_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_account_number" className="text-forest font-medium">
              Account Number *
            </Label>
            <Input
              id="bank_account_number"
              value={formData.bank_account_number}
              onChange={(e) => handleChange('bank_account_number', e.target.value)}
              className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.bank_account_number ? 'border-red-500' : ''
              }`}
              placeholder="Enter account number"
            />
            {errors.bank_account_number && (
              <p className="text-sm text-red-500">{errors.bank_account_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifsc_code" className="text-forest font-medium">
              IFSC Code *
            </Label>
            <Input
              id="ifsc_code"
              value={formData.ifsc_code}
              onChange={(e) => handleChange('ifsc_code', e.target.value.toUpperCase())}
              className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
                errors.ifsc_code ? 'border-red-500' : ''
              }`}
              placeholder="Enter IFSC code"
              maxLength={11}
            />
            {errors.ifsc_code && (
              <p className="text-sm text-red-500">{errors.ifsc_code}</p>
            )}
          </div>
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
          Document Uploads
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Branding Documents */}
          <div className="space-y-4">
            <h4 className="font-medium text-forest">Branding Documents</h4>
            
            <FileUpload
              label="Business Logo"
              accept="image/*"
              onFileChange={(files) => handleFileChange('logo', files)}
              files={formData.logo}
              required
              error={errors.logo}
            />

            <FileUpload
              label="Business Banner"
              accept="image/*"
              onFileChange={(files) => handleFileChange('banner', files)}
              files={formData.banner}
            />
          </div>

          {/* Required Documents */}
          <div className="space-y-4">
            <h4 className="font-medium text-forest">Required Documents</h4>
            
            <FileUpload
              label="PAN Card"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileChange={(files) => handleFileChange('pan_card', files)}
              files={formData.pan_card}
              required
              error={errors.pan_card}
            />

            <FileUpload
              label="Address Proof"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileChange={(files) => handleFileChange('address_proof', files)}
              files={formData.address_proof}
              required
              error={errors.address_proof}
            />
          </div>

          {/* License Documents */}
          <div className="space-y-4">
            <h4 className="font-medium text-forest">License Documents</h4>
            
            <FileUpload
              label="FSSAI License"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileChange={(files) => handleFileChange('fssai_license', files)}
              files={formData.fssai_license}
            />

            <FileUpload
              label="Trade License"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileChange={(files) => handleFileChange('trade_license', files)}
              files={formData.trade_license}
            />
          </div>

          {/* Additional Documents */}
          <div className="space-y-4">
            <h4 className="font-medium text-forest">Additional Documents</h4>
            
            {formData.is_msme_registered && (
              <FileUpload
                label="MSME Certificate"
                accept=".pdf,.jpg,.jpeg,.png"
                onFileChange={(files) => handleFileChange('msme_certificate', files)}
                files={formData.msme_certificate}
              />
            )}

            <FileUpload
              label="Other Document"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileChange={(files) => handleFileChange('other_document', files)}
              files={formData.other_document}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-forest/20">
        <Button
          type="button"
          variant="outline"
          className="border-2 border-forest/20 hover:border-forest hover:bg-forest/5 text-forest"
        >
          Save as Draft
        </Button>
        
        <Button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={isLoading}
          className="bg-gradient-to-r from-forest to-moss hover:from-forest/90 hover:to-moss/90 text-white px-8"
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
};

export default Step2BusinessProfile;