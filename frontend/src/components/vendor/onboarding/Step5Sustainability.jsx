import React, { useState } from 'react';
import FileUpload from '../../ui/FileUpload';
import EcoBadge from '../../ui/EcoBadge';

export default function Step5Sustainability({ formData, handleChange, errors = {}, onValidation }) {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [selectedPractices, setSelectedPractices] = useState(formData.selected_practices || []);
  const [selectedCertifications, setSelectedCertifications] = useState(formData.certifications || []);

  // Validation function
  const validateField = (fieldName, value) => {
    const errors = {};

    switch (fieldName) {
      case 'sustainability_practices':
        if (!value || value.trim().length < 20) {
          errors.sustainability_practices = 'Sustainability practices description must be at least 20 characters';
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

  // Handle sustainability certificate upload
  const handleCertificateUpload = async (file) => {
    try {
      setUploadingCertificate(true);
      // Add a small delay to show the loading indicator
      await new Promise(resolve => setTimeout(resolve, 500));
      if (file) {
        handleChange('sustainability_certificate', file);
      } else {
        handleChange('sustainability_certificate', null);
      }
    } catch (error) {
      console.error('Error uploading sustainability certificate:', error);
    } finally {
      setUploadingCertificate(false);
    }
  };

  // Sustainability practice options
  const sustainabilityPractices = [
    { id: 'organic', label: 'Organic Materials', icon: '🌿' },
    { id: 'recycled', label: 'Recycled Materials', icon: '♻️' },
    { id: 'renewable_energy', label: 'Renewable Energy', icon: '⚡' },
    { id: 'carbon_neutral', label: 'Carbon Neutral', icon: '🌍' },
    { id: 'plastic_free', label: 'Plastic-Free Packaging', icon: '🚫' },
    { id: 'fair_trade', label: 'Fair Trade', icon: '🤝' },
    { id: 'local_sourcing', label: 'Local Sourcing', icon: '📍' },
    { id: 'water_conservation', label: 'Water Conservation', icon: '💧' },
    { id: 'waste_reduction', label: 'Waste Reduction', icon: '🗑️' },
    { id: 'biodegradable', label: 'Biodegradable Products', icon: '🍃' }
  ];

  // Certification options
  const certificationOptions = [
    { id: 'iso14001', label: 'ISO 14001 Environmental Management' },
    { id: 'organic_certified', label: 'Organic Certification' },
    { id: 'fair_trade_certified', label: 'Fair Trade Certified' },
    { id: 'forest_stewardship', label: 'Forest Stewardship Council (FSC)' },
    { id: 'cradle_to_cradle', label: 'Cradle to Cradle Certified' },
    { id: 'energy_star', label: 'Energy Star Certified' },
    { id: 'carbon_trust', label: 'Carbon Trust Standard' },
    { id: 'rainforest_alliance', label: 'Rainforest Alliance Certified' },
    { id: 'b_corp', label: 'B Corp Certification' },
    { id: 'other', label: 'Other (Please specify)' }
  ];

  // Handle practice selection
  const handlePracticeToggle = (practiceId) => {
    const updatedPractices = selectedPractices.includes(practiceId)
      ? selectedPractices.filter(id => id !== practiceId)
      : [...selectedPractices, practiceId];
    
    setSelectedPractices(updatedPractices);
    handleChange('selected_practices', updatedPractices);
  };

  // Handle certification selection
  const handleCertificationToggle = (certId) => {
    const updatedCerts = selectedCertifications.includes(certId)
      ? selectedCertifications.filter(id => id !== certId)
      : [...selectedCertifications, certId];
    
    setSelectedCertifications(updatedCerts);
    handleChange('certifications', updatedCerts);
  };

  return (
    <>
      {/* Sustainability Practices Selection */}
      <div className="flex flex-col mb-6">
        <label className="flex items-center px-4 py-0 mb-4">
          <span className="font-semibold text-[18px] text-[var(--color-eco-primary)]">
            🌱 Select Your Sustainability Practices
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 mb-4">
          {sustainabilityPractices.map((practice) => (
            <div
              key={practice.id}
              onClick={() => handlePracticeToggle(practice.id)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${selectedPractices.includes(practice.id)
                  ? 'border-[var(--color-eco-primary)] bg-[var(--color-eco-subtle)]'
                  : 'border-gray-200 bg-white hover:border-[var(--color-eco-accent)]'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{practice.icon}</span>
                <span className="font-medium text-[var(--color-eco-primary)]">
                  {practice.label}
                </span>
                {selectedPractices.includes(practice.id) && (
                  <svg className="w-5 h-5 text-[var(--color-eco-primary)] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="flex flex-col mb-6">
        <label className="flex items-center px-4 py-0 mb-4">
          <span className="font-semibold text-[18px] text-[var(--color-eco-primary)]">
            🏆 Sustainability Certifications (Optional)
          </span>
        </label>
        
        <div className="px-4 space-y-2 mb-4">
          {certificationOptions.map((cert) => (
            <label
              key={cert.id}
              className="flex items-center p-3 rounded-lg hover:bg-[var(--color-eco-subtle)] transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCertifications.includes(cert.id)}
                onChange={() => handleCertificationToggle(cert.id)}
                className="w-4 h-4 text-[var(--color-eco-primary)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--color-eco-primary)] focus:ring-2"
              />
              <span className="ml-3 text-[var(--color-eco-primary)] font-medium">
                {cert.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sustainability Practices Description */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[var(--color-eco-primary)] opacity-80">
            📝 Detailed Sustainability Practices Description
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        <textarea
          value={formData.sustainability_practices || ''}
          onChange={(e) => handleFieldChange('sustainability_practices', e.target.value)}
          placeholder="Provide detailed information about your sustainability practices:

🌱 Environmental Impact: How do you minimize your environmental footprint?
📦 Sustainable Materials: What eco-friendly materials do you use?
⚡ Energy & Resources: How do you conserve energy and water?
♻️ Waste Management: What are your waste reduction and recycling efforts?
🤝 Ethical Sourcing: Do you follow fair trade or ethical sourcing practices?
📋 Compliance: Any environmental standards or regulations you follow?
🎯 Goals: What are your sustainability goals and achievements?"
          rows={8}
          className={`w-full bg-[var(--color-eco-subtle)] border rounded-[8px] px-4 py-3 
                   font-medium text-[16px] text-[var(--color-eco-primary)] opacity-70
                   focus:opacity-100 focus:outline-none transition-all resize-none
                   ${validationErrors.sustainability_practices || errors.sustainability_practices 
                     ? 'border-red-500 focus:border-red-500' 
                     : 'border-[var(--color-eco-accent)] focus:border-[var(--color-eco-primary)]'}`}
        />
        {(validationErrors.sustainability_practices || errors.sustainability_practices) && (
          <span className="text-red-500 text-sm mt-1 px-4">
            {validationErrors.sustainability_practices || errors.sustainability_practices}
          </span>
        )}
      </div>

      {/* Sustainability Certificate Upload */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[var(--color-eco-primary)] opacity-80">
            📄 Upload Sustainability Certificates (Optional)
          </span>
        </label>
        
        <div className="px-4">
          <FileUpload
            onFileSelect={handleCertificateUpload}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            fileType="document"
            label="Certificate Upload"
            description="Upload sustainability certificates, environmental compliance documents, or third-party verifications"
            currentFile={formData.sustainability_certificate}
            isUploading={uploadingCertificate}
          />
        </div>
      </div>

      {/* Eco Badge Preview */}
      {selectedPractices.length > 0 && (
        <div className="bg-[var(--color-eco-subtle)] border border-[var(--color-eco-accent)] rounded-lg p-4 mx-4 mb-4">
          <h3 className="text-sm font-medium text-[var(--color-eco-primary)] mb-3">
            🏷️ Your Eco Badges Preview:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedPractices.slice(0, 4).map((practiceId) => {
              const practice = sustainabilityPractices.find(p => p.id === practiceId);
              if (!practice) return null;
              
              const badgeTypeMap = {
                'organic': 'organic',
                'recycled': 'renewable',
                'renewable_energy': 'renewable',
                'carbon_neutral': 'carbonNeutral',
                'plastic_free': 'plastic_free',
                'local_sourcing': 'local',
                'fair_trade': 'verified'
              };
              
              return (
                <EcoBadge 
                  key={practiceId}
                  type={badgeTypeMap[practiceId] || 'certified'}
                  size="sm"
                />
              );
            })}
            {selectedPractices.length > 4 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{selectedPractices.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Information about sustainability benefits */}
      <div className="bg-gradient-to-r from-[var(--color-eco-subtle)] to-green-50 border border-[var(--color-eco-accent)] rounded-lg p-6 mx-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-[var(--color-eco-primary)] rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🌱</span>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-[var(--color-eco-primary)] mb-3">
              Why Join Our Sustainable Marketplace?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--color-eco-secondary)]">
              <div className="flex items-start space-x-2">
                <span>🎯</span>
                <span>Reach 50M+ eco-conscious consumers</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>🏆</span>
                <span>Get verified sustainability badges</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>📈</span>
                <span>Higher visibility in green searches</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>💚</span>
                <span>Join the largest eco-marketplace</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>🌍</span>
                <span>Track your environmental impact</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>🤝</span>
                <span>Connect with like-minded vendors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4032]"></div>
        </div>
      )}
    </>
  );
}
