import React, { useState, useEffect } from 'react';
import { LEGAL_ENTITY_TYPES } from '../../../lib/fileUtils';
import { onboardingService } from '../../../services/onboardingService';
import { tokens } from '../../../lib/api';
import FileUpload from '../../ui/FileUpload';

export default function Step2BusinessProfile({ formData, handleChange, onValidation, onSkipToNextStep }) {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [hasExistingBusiness, setHasExistingBusiness] = useState(false);

  // Debug: Log current formData
  useEffect(() => {
    console.log('Step2: Current formData:', formData);
  }, [formData]);

  // Load existing business info on mount
  useEffect(() => {
    const loadBusinessInfo = async () => {
      try {
        setIsLoading(true);
        console.log('Step2: Loading business info...');
        
        // Check if user is authenticated
        const userTokens = tokens.get();
        console.log('Step2: User tokens:', userTokens ? 'Found' : 'Not found');
        
        const businessInfo = await onboardingService.getBusinessInfo();
        console.log('Step2: Business info loaded:', businessInfo);
        
        if (businessInfo) {
          setHasExistingBusiness(true);
          console.log('Step2: Found existing business, pre-filling form...');
          
          // Store original data for comparison
          setOriginalData({
            business_name: businessInfo.business_name || '',
            legal_entity_type: businessInfo.legal_entity_type || '',
            pan_gst_number: businessInfo.pan_gst_number || '',
            business_address: businessInfo.business_address || '',
            bank_name: businessInfo.bank_name || '',
            bank_account_number: businessInfo.bank_account_number || '',
            ifsc_code: businessInfo.ifsc_code || '',
            is_msme_registered: businessInfo.is_msme_registered || false,
            website: businessInfo.website || '',
            description: businessInfo.description || '',
            other_document_name: businessInfo.other_document_name || '',
            logo: businessInfo.logo || null,
            banner: businessInfo.banner || null,
            pan_card: businessInfo.pan_card || null,
            address_proof: businessInfo.address_proof || null,
            fssai_license: businessInfo.fssai_license || null,
            trade_license: businessInfo.trade_license || null,
            msme_certificate: businessInfo.msme_certificate || null,
            other_document: businessInfo.other_document || null
          });
          
          // Map backend fields to frontend form data (using new field names)
          console.log('Step2: Calling handleChange for all fields...');
          handleChange('business_name', businessInfo.business_name || '');
          handleChange('legal_entity_type', businessInfo.legal_entity_type || '');
          handleChange('pan_gst_number', businessInfo.pan_gst_number || '');
          handleChange('business_address', businessInfo.business_address || '');
          handleChange('bank_name', businessInfo.bank_name || '');
          handleChange('bank_account_number', businessInfo.bank_account_number || '');
          handleChange('ifsc_code', businessInfo.ifsc_code || '');
          handleChange('is_msme_registered', businessInfo.is_msme_registered || false);
          handleChange('website', businessInfo.website || '');
          handleChange('description', businessInfo.description || '');
          handleChange('other_document_name', businessInfo.other_document_name || '');
          
          // Handle file fields (these might be URLs from the server)
          if (businessInfo.logo) handleChange('logo', businessInfo.logo);
          if (businessInfo.banner) handleChange('banner', businessInfo.banner);
          if (businessInfo.pan_card) handleChange('pan_card', businessInfo.pan_card);
          if (businessInfo.address_proof) handleChange('address_proof', businessInfo.address_proof);
          if (businessInfo.fssai_license) handleChange('fssai_license', businessInfo.fssai_license);
          if (businessInfo.trade_license) handleChange('trade_license', businessInfo.trade_license);
          if (businessInfo.msme_certificate) handleChange('msme_certificate', businessInfo.msme_certificate);
          if (businessInfo.other_document) handleChange('other_document', businessInfo.other_document);
          
          console.log('Step2: Form pre-fill completed');
        } else {
          setHasExistingBusiness(false);
          console.log('Step2: No existing business found');
        }
      } catch (error) {
        console.error('Step2: Failed to load business info:', error);
        setHasExistingBusiness(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessInfo();
  }, []); // Remove handleChange dependency to avoid infinite loops

  // Validate form data when it changes
  useEffect(() => {
    const validateCurrentData = () => {
      const currentStepValidation = {
        business_name: !formData.business_name?.trim() ? "Business name is required" : undefined,
        legal_entity_type: !formData.legal_entity_type ? "Legal entity type is required" : undefined,
        pan_gst_number: !formData.pan_gst_number?.trim() || formData.pan_gst_number.length < 10 
          ? "PAN/GST number must be at least 10 characters" : undefined,
        business_address: !formData.business_address?.trim() || formData.business_address.length < 10 
          ? "Business address must be at least 10 characters" : undefined,
        bank_name: !formData.bank_name?.trim() ? "Bank name is required" : undefined,
        bank_account_number: !formData.bank_account_number?.trim() || formData.bank_account_number.length < 9 
          ? "Bank account number must be at least 9 characters" : undefined,
        ifsc_code: !formData.ifsc_code?.trim() || formData.ifsc_code.length !== 11 
          ? "IFSC code must be exactly 11 characters" : undefined,
      };

      const stepErrors = Object.fromEntries(
        Object.entries(currentStepValidation).filter(([_, value]) => value !== undefined)
      );

      setErrors(stepErrors);
      
      // Notify parent about validation status
      if (onValidation) {
        onValidation(Object.keys(stepErrors).length === 0);
      }
    };

    validateCurrentData();
  }, [formData, onValidation]);

  // Function to detect if form data has changed from original
  const hasDataChanged = () => {
    if (!originalData) return true; // If no original data, treat as changed
    
    // Compare all fields
    const fieldsToCompare = [
      'business_name', 'legal_entity_type', 'pan_gst_number', 'business_address',
      'bank_name', 'bank_account_number', 'ifsc_code', 'is_msme_registered',
      'website', 'description', 'other_document_name'
    ];
    
    for (const field of fieldsToCompare) {
      if (formData[field] !== originalData[field]) {
        return true;
      }
    }
    
    // Compare file fields (check if they are different objects/files)
    const fileFields = [
      'logo', 'banner', 'pan_card', 'address_proof', 'fssai_license',
      'trade_license', 'msme_certificate', 'other_document'
    ];
    
    for (const field of fileFields) {
      const currentFile = formData[field];
      const originalFile = originalData[field];
      
      // If current is a File object and original is a string/url, it's changed
      if (currentFile instanceof File && typeof originalFile === 'string') {
        return true;
      }
      
      // If one is null/undefined and other isn't, it's changed
      if ((currentFile && !originalFile) || (!currentFile && originalFile)) {
        return true;
      }
      
      // If both are File objects, compare by name and size
      if (currentFile instanceof File && originalFile instanceof File) {
        if (currentFile.name !== originalFile.name || currentFile.size !== originalFile.size) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Function to handle save business info with change detection
  const handleSaveBusinessInfo = async () => {
    if (!hasExistingBusiness || hasDataChanged()) {
      setIsSaving(true);
      try {
        // Call the parent's save function with the hasExistingBusiness flag
        if (onSkipToNextStep) {
          await onSkipToNextStep(false, hasExistingBusiness); // Pass hasExistingBusiness to determine POST vs PUT
        }
      } catch (error) {
        console.error('Failed to save business info:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // No changes detected, skip directly to next step
      if (onSkipToNextStep) {
        onSkipToNextStep(true); // Pass true to indicate skip without save
      }
    }
  };

  const handleLogoUpload = async (file) => {
    try {
      setUploadingFiles(prev => ({ ...prev, logo: true }));
      if (file) {
        handleChange('logo', file); // Store the actual file for FormData submission
      } else {
        handleChange('logo', null);
      }
    } catch (error) {
      console.error('Failed to select logo:', error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, logo: false }));
    }
  };

  const handleBannerUpload = async (file) => {
    try {
      setUploadingFiles(prev => ({ ...prev, banner: true }));
      if (file) {
        handleChange('banner', file); // Store the actual file for FormData submission
      } else {
        handleChange('banner', null);
      }
    } catch (error) {
      console.error('Failed to select banner:', error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, banner: false }));
    }
  };

  // Add handlers for all document types
  const handleDocumentUpload = (fieldName) => async (file) => {
    try {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
      if (file) {
        handleChange(fieldName, file);
      } else {
        handleChange(fieldName, null);
      }
    } catch (error) {
      console.error(`Failed to select ${fieldName}:`, error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#12b74f]"></div>
        <span className="ml-2 text-[#1a4032]">Loading business profile...</span>
      </div>
    );
  }
  return (
    <>
      {/* Business Name */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            Business Name
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.business_name || ''}
          onChange={(e) => handleChange('business_name', e.target.value)}
          placeholder="Enter your business name"
          className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                   font-semibold text-[16px] text-[#1a4032] opacity-50
                   focus:opacity-100 focus:outline-none transition-all
                   ${errors.business_name ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
          required
        />
        {errors.business_name && (
          <p className="text-red-500 text-sm mt-1 px-4">{errors.business_name}</p>
        )}
      </div>

      {/* First Row - Legal Entity Type & PAN/GST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Legal Entity Type
            </span>
            <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.legal_entity_type || ''}
              onChange={(e) => handleChange('legal_entity_type', e.target.value)}
              className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                       font-semibold text-[16px] text-[#09101d] opacity-50
                       focus:opacity-100 focus:outline-none transition-all
                       appearance-none
                       ${errors.legal_entity_type ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
              required
            >
              <option value="">Select Type</option>
              {LEGAL_ENTITY_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-6 h-6 text-[#858c94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.legal_entity_type && (
            <p className="text-red-500 text-sm mt-1 px-4">{errors.legal_entity_type}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              PAN/GST Number
            </span>
            <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.pan_gst_number || ''}
            onChange={(e) => handleChange('pan_gst_number', e.target.value)}
            placeholder="ABCD/1234"
            className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none transition-all
                     ${errors.pan_gst_number ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
            required
          />
          {errors.pan_gst_number && (
            <p className="text-red-500 text-sm mt-1 px-4">{errors.pan_gst_number}</p>
          )}
        </div>
      </div>

      {/* Business Address */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            Business Address
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        <textarea
          value={formData.business_address || ''}
          onChange={(e) => handleChange('business_address', e.target.value)}
          placeholder="Complete business address including city state and code"
          rows={3}
          className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                   font-semibold text-[16px] text-[#1a4032] opacity-50
                   focus:opacity-100 focus:outline-none transition-all resize-none
                   ${errors.business_address ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
          required
        />
        {errors.business_address && (
          <p className="text-red-500 text-sm mt-1 px-4">{errors.business_address}</p>
        )}
      </div>

      {/* MSME Registration */}
      <div className="flex items-start gap-3 px-4">
        <input
          type="checkbox"
          id="isMsmeRegistered"
          checked={formData.is_msme_registered || false}
          onChange={(e) => handleChange('is_msme_registered', e.target.checked)}
          className="w-4 h-4 mt-0.5 bg-[rgba(80,44,10,0.2)] border-[#502c0a] rounded-[2px] 
                   focus:ring-2 focus:ring-[#502c0a] focus:outline-none"
        />
        <label htmlFor="isMsmeRegistered" className="text-[13px] text-[#09101d] leading-[20px]">
          My Business is a registered MSME Udhyam (Micro, Small & Medium Enterprise)
        </label>
      </div>

      {/* Banking Information Section */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="w-6 h-6">
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#1a4032]">
            <path fill="currentColor" d="M11.5,1L2,6V8H21V6M16,10V17H19V10M12.5,10V17H15.5V10M9,10V17H12V10M5.5,10V17H8.5V10M2,19V21H21V19"/>
          </svg>
        </div>
        <h3 className="font-reem font-medium text-[16px] text-[#1a4032]">
          Banking Information
        </h3>
      </div>

      {/* Bank Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Bank Name
            </span>
            <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.bank_name || ''}
            onChange={(e) => handleChange('bank_name', e.target.value)}
            placeholder="Enter bank name"
            className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none transition-all
                     ${errors.bank_name ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
            required
          />
          {errors.bank_name && (
            <p className="text-red-500 text-sm mt-1 px-4">{errors.bank_name}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Account Number
            </span>
            <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.bank_account_number || ''}
            onChange={(e) => handleChange('bank_account_number', e.target.value)}
            placeholder="Enter account number"
            className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none transition-all
                     ${errors.bank_account_number ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
            required
          />
          {errors.bank_account_number && (
            <p className="text-red-500 text-sm mt-1 px-4">{errors.bank_account_number}</p>
          )}
        </div>
      </div>

      {/* IFSC Code */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            IFSC Code
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.ifsc_code || ''}
          onChange={(e) => handleChange('ifsc_code', e.target.value.toUpperCase())}
          placeholder="ABCD0123456"
          maxLength={11}
          className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                   font-semibold text-[16px] text-[#1a4032] opacity-50
                   focus:opacity-100 focus:outline-none transition-all
                   ${errors.ifsc_code ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
          required
        />
        {errors.ifsc_code && (
          <p className="text-red-500 text-sm mt-1 px-4">{errors.ifsc_code}</p>
        )}
      </div>

      {/* Optional Fields Section */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="w-6 h-6">
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#1a4032]">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
          </svg>
        </div>
        <h3 className="font-reem font-medium text-[16px] text-[#1a4032]">
          Additional Information (Optional)
        </h3>
      </div>

      {/* Website and Description Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Website URL
            </span>
          </label>
          <input
            type="url"
            value={formData.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://yourcompany.com"
            className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
          />
        </div>

        <div className="flex flex-col">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Business Description
            </span>
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of your business"
            rows={3}
            className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all resize-none"
          />
        </div>
      </div>

      {/* Brand Assets Section */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="w-6 h-6">
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#1a4032]">
            <path fill="currentColor" d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z"/>
          </svg>
        </div>
        <h3 className="font-reem font-medium text-[16px] text-[#1a4032]">
          Brand Assets (Optional)
        </h3>
      </div>

      {/* Logo and Banner Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUpload
          onFileSelect={handleLogoUpload}
          accept="image/*"
          fileType="image"
          label="Business Logo"
          description="Upload your business logo"
          className="px-4"
          currentFile={formData.logo}
          isUploading={uploadingFiles.logo}
        />

        <FileUpload
          onFileSelect={handleBannerUpload}
          accept="image/*"
          fileType="image"
          label="Business Banner"
          description="Upload your business banner"
          className="px-4"
          currentFile={formData.banner}
          isUploading={uploadingFiles.banner}
        />
      </div>

      {/* Document Upload Section */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="w-6 h-6">
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#1a4032]">
            <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        </div>
        <h3 className="font-reem font-medium text-[16px] text-[#1a4032]">
          Business Documents
        </h3>
      </div>

      {/* Document Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUpload
          onFileSelect={handleDocumentUpload('pan_card')}
          accept=".pdf,.jpg,.jpeg,.png"
          fileType="document"
          label="PAN Card *"
          description="Upload PAN card document"
          className="px-4"
          currentFile={formData.pan_card}
          isUploading={uploadingFiles.pan_card}
        />

        <FileUpload
          onFileSelect={handleDocumentUpload('address_proof')}
          accept=".pdf,.jpg,.jpeg,.png"
          fileType="document"
          label="Address Proof *"
          description="Upload address proof document"
          className="px-4"
          currentFile={formData.address_proof}
          isUploading={uploadingFiles.address_proof}
        />

        <FileUpload
          onFileSelect={handleDocumentUpload('fssai_license')}
          accept=".pdf,.jpg,.jpeg,.png"
          fileType="document"
          label="FSSAI License"
          description="Upload FSSAI license (if applicable)"
          className="px-4"
          currentFile={formData.fssai_license}
          isUploading={uploadingFiles.fssai_license}
        />

        <FileUpload
          onFileSelect={handleDocumentUpload('trade_license')}
          accept=".pdf,.jpg,.jpeg,.png"
          fileType="document"
          label="Trade License"
          description="Upload trade license document"
          className="px-4"
          currentFile={formData.trade_license}
          isUploading={uploadingFiles.trade_license}
        />

        {formData.is_msme_registered && (
          <FileUpload
            onFileSelect={handleDocumentUpload('msme_certificate')}
            accept=".pdf,.jpg,.jpeg,.png"
            fileType="document"
            label="MSME Certificate"
            description="Upload MSME registration certificate"
            className="px-4"
            currentFile={formData.msme_certificate}
            isUploading={uploadingFiles.msme_certificate}
          />
        )}

        <div className="space-y-4 px-4">
          <div>
            <label className="block font-semibold text-[16px] text-[#1a4032] opacity-80 mb-2">
              Other Document Name
            </label>
            <input
              type="text"
              value={formData.other_document_name || ''}
              onChange={(e) => handleChange('other_document_name', e.target.value)}
              placeholder="e.g., Export License, ISO Certificate"
              className="w-full bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-4 py-3 
                       font-semibold text-[16px] text-[#1a4032] opacity-50
                       focus:opacity-100 focus:outline-none focus:border-[#1a4032] transition-all"
            />
          </div>
          
          {formData.other_document_name && (
            <FileUpload
              onFileSelect={handleDocumentUpload('other_document')}
              accept=".pdf,.jpg,.jpeg,.png"
              fileType="document"
              label="Other Document"
              description={`Upload ${formData.other_document_name}`}
              currentFile={formData.other_document}
              isUploading={uploadingFiles.other_document}
            />
          )}
        </div>
      </div>

      {/* Save Business Information Button */}
      <div className="flex justify-between items-center pt-8">
        {/* Go Back Button */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-white border border-[#b8b8b8] hover:bg-gray-50 text-[#484848] 
                   px-6 py-3 rounded-lg font-medium transition-all duration-200
                   flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSaveBusinessInfo}
          disabled={isSaving || isLoading}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200
            ${isSaving || isLoading
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#12b74f] hover:bg-[#0f8f3f] active:transform active:scale-95'
            }`}
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="15.708"></circle>
              </svg>
              <span>{hasExistingBusiness ? 'Updating Business Info...' : 'Saving Business Info...'}</span>
            </div>
          ) : (
            <span>{hasExistingBusiness ? 'Update & Continue' : 'Save & Continue'}</span>
          )}
        </button>
      </div>

      {/* Information about existing business */}
      {hasExistingBusiness && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4 mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Existing Business Profile Found
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>We've loaded your existing business information. You can make changes if needed, or continue to the next step if everything looks correct.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
