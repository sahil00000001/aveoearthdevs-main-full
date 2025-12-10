"use client";

import { useState } from "react";
import Image from "next/image";
import Card, { CardContent, CardHeader } from "../ui/Card";
import Button from "../ui/Button";

export default function VendorOnboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Business Information
    businessName: "",
    businessType: "",
    registrationNumber: "",
    taxId: "",
    website: "",
    description: "",
    
    // Bank Account Details
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    
    // File Uploads
    logo: null,
    banner: null,
    kycDocuments: [],
    
    // Contact Information
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    businessAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: ""
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: "Business Information", icon: "🏢" },
    { id: 2, title: "Contact & Address", icon: "📍" },
    { id: 3, title: "Bank Details", icon: "🏦" },
    { id: 4, title: "Documents & Media", icon: "📄" },
    { id: 5, title: "Review & Submit", icon: "✅" }
  ];

  const businessTypes = [
    "Sole Proprietorship",
    "Partnership",
    "LLC",
    "Corporation",
    "Cooperative",
    "Non-Profit"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileUpload = (field, files) => {
    if (field === 'kycDocuments') {
      const newFiles = Array.from(files).map(file => ({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        preview: URL.createObjectURL(file)
      }));
      setFormData(prev => ({ 
        ...prev, 
        [field]: [...prev[field], ...newFiles]
      }));
    } else {
      const file = files[0];
      setFormData(prev => ({ 
        ...prev, 
        [field]: file ? {
          file,
          name: file.name,
          preview: URL.createObjectURL(file)
        } : null
      }));
    }
  };

  const removeFile = (field, index = null) => {
    if (field === 'kycDocuments' && index !== null) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
        if (!formData.businessType) newErrors.businessType = "Business type is required";
        if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
        if (!formData.taxId.trim()) newErrors.taxId = "Tax ID is required";
        break;
      case 2:
        if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required";
        if (!formData.contactEmail.trim()) newErrors.contactEmail = "Contact email is required";
        if (!formData.contactPhone.trim()) newErrors.contactPhone = "Contact phone is required";
        if (!formData.businessAddress.trim()) newErrors.businessAddress = "Business address is required";
        break;
      case 3:
        if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required";
        if (!formData.accountNumber.trim()) newErrors.accountNumber = "Account number is required";
        if (!formData.accountHolderName.trim()) newErrors.accountHolderName = "Account holder name is required";
        break;
      case 4:
        if (!formData.logo) newErrors.logo = "Company logo is required";
        if (formData.kycDocuments.length === 0) newErrors.kycDocuments = "At least one KYC document is required";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateStep(4)) {
      try {
        // Here you would typically submit to your API
        console.log("Vendor onboarding data:", formData);
        onComplete(formData);
      } catch (error) {
        console.error("Onboarding submission failed:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  currentStep >= step.id 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {currentStep > step.id ? "✓" : step.icon}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-green-600" : "text-gray-500"
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    currentStep > step.id ? "bg-green-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-800">
            {steps.find(step => step.id === currentStep)?.title}
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          {currentStep === 1 && <BusinessInformationStep formData={formData} onChange={handleInputChange} errors={errors} businessTypes={businessTypes} />}
          {currentStep === 2 && <ContactAddressStep formData={formData} onChange={handleInputChange} errors={errors} />}
          {currentStep === 3 && <BankDetailsStep formData={formData} onChange={handleInputChange} errors={errors} />}
          {currentStep === 4 && <DocumentsMediaStep formData={formData} onFileUpload={handleFileUpload} onRemoveFile={removeFile} errors={errors} />}
          {currentStep === 5 && <ReviewSubmitStep formData={formData} />}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 5 ? (
              <Button onClick={handleNext}>
                Next Step
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Submit Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 1: Business Information
function BusinessInformationStep({ formData, onChange, errors, businessTypes }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => onChange('businessName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.businessName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your business name"
          />
          {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            value={formData.businessType}
            onChange={(e) => onChange('businessType', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.businessType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select business type</option>
            {businessTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.businessType && <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registration Number *
          </label>
          <input
            type="text"
            value={formData.registrationNumber}
            onChange={(e) => onChange('registrationNumber', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.registrationNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter registration number"
          />
          {errors.registrationNumber && <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax ID *
          </label>
          <input
            type="text"
            value={formData.taxId}
            onChange={(e) => onChange('taxId', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.taxId ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter tax ID"
          />
          {errors.taxId && <p className="mt-1 text-sm text-red-600">{errors.taxId}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => onChange('website', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Describe your business and the products you sell..."
          />
        </div>
      </div>
    </div>
  );
}

// Step 2: Contact & Address
function ContactAddressStep({ formData, onChange, errors }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Person *
          </label>
          <input
            type="text"
            value={formData.contactPerson}
            onChange={(e) => onChange('contactPerson', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.contactPerson ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Full name"
          />
          {errors.contactPerson && <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => onChange('contactEmail', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.contactEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="contact@business.com"
          />
          {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Phone *
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => onChange('contactPhone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.contactPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address *
          </label>
          <input
            type="text"
            value={formData.businessAddress}
            onChange={(e) => onChange('businessAddress', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.businessAddress ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Street address"
          />
          {errors.businessAddress && <p className="mt-1 text-sm text-red-600">{errors.businessAddress}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="City"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State/Province
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => onChange('state', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="State or Province"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP/Postal Code
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => onChange('zipCode', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="ZIP or Postal Code"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => onChange('country', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Country"
          />
        </div>
      </div>
    </div>
  );
}

// Step 3: Bank Details
function BankDetailsStep({ formData, onChange, errors }) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-amber-800">
          <span className="text-lg">🔒</span>
          <span className="font-medium">Secure Information</span>
        </div>
        <p className="text-sm text-amber-700 mt-1">
          Your banking information is encrypted and used only for payment processing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Name *
          </label>
          <input
            type="text"
            value={formData.bankName}
            onChange={(e) => onChange('bankName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.bankName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Your bank name"
          />
          {errors.bankName && <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Holder Name *
          </label>
          <input
            type="text"
            value={formData.accountHolderName}
            onChange={(e) => onChange('accountHolderName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.accountHolderName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Name on account"
          />
          {errors.accountHolderName && <p className="mt-1 text-sm text-red-600">{errors.accountHolderName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number *
          </label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => onChange('accountNumber', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.accountNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Account number"
          />
          {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Routing Number
          </label>
          <input
            type="text"
            value={formData.routingNumber}
            onChange={(e) => onChange('routingNumber', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Routing number (if applicable)"
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: Documents & Media
function DocumentsMediaStep({ formData, onFileUpload, onRemoveFile, errors }) {
  const acceptedDocTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Logo *
        </label>
        <div className="flex items-start gap-4">
          <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors ${
            errors.logo ? 'border-red-500' : 'border-gray-300'
          }`}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFileUpload('logo', e.target.files)}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              {formData.logo ? (
                <div className="space-y-2">
                  <Image 
                    src={formData.logo.preview} 
                    alt="Logo preview" 
                    width={64} 
                    height={64} 
                    className="mx-auto rounded"
                  />
                  <p className="text-sm text-gray-600">{formData.logo.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📷</span>
                  </div>
                  <p className="text-sm text-gray-600">Upload logo</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                </div>
              )}
            </label>
          </div>
          {formData.logo && (
            <Button variant="outline" size="sm" onClick={() => onRemoveFile('logo')}>
              Remove
            </Button>
          )}
        </div>
        {errors.logo && <p className="mt-1 text-sm text-red-600">{errors.logo}</p>}
      </div>

      {/* Banner Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Image (Optional)
        </label>
        <div className="flex items-start gap-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors w-full">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFileUpload('banner', e.target.files)}
              className="hidden"
              id="banner-upload"
            />
            <label htmlFor="banner-upload" className="cursor-pointer">
              {formData.banner ? (
                <div className="space-y-2">
                  <Image 
                    src={formData.banner.preview} 
                    alt="Banner preview" 
                    width={200} 
                    height={80} 
                    className="mx-auto rounded"
                  />
                  <p className="text-sm text-gray-600">{formData.banner.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-24 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🖼️</span>
                  </div>
                  <p className="text-sm text-gray-600">Upload banner image</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB (1200x400 recommended)</p>
                </div>
              )}
            </label>
          </div>
          {formData.banner && (
            <Button variant="outline" size="sm" onClick={() => onRemoveFile('banner')}>
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* KYC Documents */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          KYC Documents *
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Upload business registration, tax documents, or other verification documents.
        </p>
        
        <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors ${
          errors.kycDocuments ? 'border-red-500' : 'border-gray-300'
        }`}>
          <input
            type="file"
            accept={acceptedDocTypes}
            multiple
            onChange={(e) => onFileUpload('kycDocuments', e.target.files)}
            className="hidden"
            id="kyc-upload"
          />
          <label htmlFor="kyc-upload" className="cursor-pointer">
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-sm text-gray-600">Upload KYC documents</p>
              <p className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG up to 10MB each</p>
            </div>
          </label>
        </div>

        {/* Display uploaded documents */}
        {formData.kycDocuments.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.kycDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {doc.type.includes('image') ? '🖼️' : '📄'}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onRemoveFile('kycDocuments', index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        {errors.kycDocuments && <p className="mt-1 text-sm text-red-600">{errors.kycDocuments}</p>}
      </div>
    </div>
  );
}

// Step 5: Review & Submit
function ReviewSubmitStep({ formData }) {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-green-800 mb-2">
          <span className="text-lg">✅</span>
          <span className="font-medium">Review Your Information</span>
        </div>
        <p className="text-sm text-green-700">
          Please review all information before submitting. You can go back to make changes if needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <h3 className="font-medium text-gray-800">Business Information</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {formData.businessName}</div>
              <div><span className="font-medium">Type:</span> {formData.businessType}</div>
              <div><span className="font-medium">Registration:</span> {formData.registrationNumber}</div>
              <div><span className="font-medium">Tax ID:</span> {formData.taxId}</div>
              {formData.website && <div><span className="font-medium">Website:</span> {formData.website}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <h3 className="font-medium text-gray-800">Contact Information</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Contact:</span> {formData.contactPerson}</div>
              <div><span className="font-medium">Email:</span> {formData.contactEmail}</div>
              <div><span className="font-medium">Phone:</span> {formData.contactPhone}</div>
              <div><span className="font-medium">Address:</span> {formData.businessAddress}</div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <h3 className="font-medium text-gray-800">Bank Information</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Bank:</span> {formData.bankName}</div>
              <div><span className="font-medium">Account Holder:</span> {formData.accountHolderName}</div>
              <div><span className="font-medium">Account:</span> ***{formData.accountNumber.slice(-4)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <h3 className="font-medium text-gray-800">Uploaded Documents</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {formData.logo && <div><span className="font-medium">Logo:</span> ✅ Uploaded</div>}
              {formData.banner && <div><span className="font-medium">Banner:</span> ✅ Uploaded</div>}
              <div><span className="font-medium">KYC Documents:</span> {formData.kycDocuments.length} files</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {formData.description && (
        <Card>
          <CardHeader>
            <h3 className="font-medium text-gray-800">Business Description</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{formData.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
