// File upload utilities and validation
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  SUPPORTED_IMAGE_FORMATS: [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/webp",
    "image/gif"
  ],
  SUPPORTED_DOCUMENT_FORMATS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "text/plain"
  ]
};

export const LEGAL_ENTITY_TYPES = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership_firms", label: "Partnership Firms" },
  { value: "pvt_ltd", label: "Private Limited Company" },
  { value: "limited_liability_partnership", label: "Limited Liability Partnership (LLP)" },
  { value: "trusts_and_ngos", label: "Trusts and NGOs" }
];

export const DOCUMENT_TYPES = [
  { value: "pan_card", label: "PAN Card" },
  { value: "address_proof", label: "Address Proof" },
  { value: "fssai_license", label: "FSSAI License" },
  { value: "trade_license", label: "Trade License" },
  { value: "msme_certificate", label: "MSME Certificate" },
  { value: "sustainability_certificate", label: "Sustainability Certificate" },
  { value: "other", label: "Other Document" }
];

// File validation functions
export const validateFile = (file, type = 'document') => {
  const errors = [];
  
  if (!file) {
    return { isValid: true, errors: [] }; // Optional file
  }
  
  // Size validation
  if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
    errors.push(`File size must be less than ${FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB`);
  }
  
  // Format validation
  const allowedFormats = type === 'image' 
    ? FILE_CONSTRAINTS.SUPPORTED_IMAGE_FORMATS 
    : FILE_CONSTRAINTS.SUPPORTED_DOCUMENT_FORMATS;
    
  if (!allowedFormats.includes(file.type)) {
    const formatList = allowedFormats.map(format => format.split('/')[1]).join(', ');
    errors.push(`Supported formats: ${formatList}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateImageFile = (file) => validateFile(file, 'image');
export const validateDocumentFile = (file) => validateFile(file, 'document');

// Form validation for onboarding
export const validateOnboardingData = (data) => {
  const errors = {};
  
  // Required fields
  if (!data.business_name?.trim()) {
    errors.business_name = "Business name is required";
  }
  
  if (!data.legal_entity_type) {
    errors.legal_entity_type = "Legal entity type is required";
  }
  
  if (!data.pan_gst_number?.trim() || data.pan_gst_number.length < 10) {
    errors.pan_gst_number = "PAN/GST number must be at least 10 characters";
  }
  
  if (!data.bank_name?.trim()) {
    errors.bank_name = "Bank name is required";
  }
  
  if (!data.bank_account_number?.trim() || data.bank_account_number.length < 9) {
    errors.bank_account_number = "Bank account number must be at least 9 characters";
  }
  
  if (!data.ifsc_code?.trim() || data.ifsc_code.length !== 11) {
    errors.ifsc_code = "IFSC code must be exactly 11 characters";
  }
  
  if (!data.business_address?.trim() || data.business_address.length < 10) {
    errors.business_address = "Business address must be at least 10 characters";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper to create FormData from object (handles files properly)
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File) {
            formData.append(`${key}`, item);
          } else {
            formData.append(`${key}[${index}]`, item.toString());
          }
        });
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  return formData;
};

// Helper to format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to get file extension
export const getFileExtension = (fileName) => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};
