"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokens, auth, productsSupplier } from "@/lib/api";

// Import modular components
import OnboardingHeader from "@/components/vendor/onboarding/OnboardingHeader";
import OnboardingProgress from "@/components/vendor/onboarding/OnboardingProgress";
import StepNavigation from "@/components/vendor/onboarding/StepNavigation";
import StepHeader from "@/components/vendor/onboarding/StepHeader";
import Step1BasicInfo from "@/components/vendor/onboarding/Step1BasicInfo";
import Step2BusinessProfile from "@/components/vendor/onboarding/Step2BusinessProfile";
import Step3ProductInfo from "@/components/vendor/onboarding/Step3ProductInfo";
import Step4Inventory from "@/components/vendor/onboarding/Step4Inventory";
import Step5Sustainability from "@/components/vendor/onboarding/Step5Sustainability";
import OnboardingActions from "@/components/vendor/onboarding/OnboardingActions";
import OnboardingComplete from "@/components/vendor/onboarding/OnboardingComplete";

export default function VendorOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false); // Track if user completed signup
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [formData, setFormData] = useState({
    // Step 1 fields (Seller Signup)
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    password: "",
    agreeToTerms: false,
    // Step 2 fields - Business Onboarding (Updated to match backend)
    business_name: "",
    legal_entity_type: "",
    pan_gst_number: "",
    bank_name: "",
    bank_account_number: "",
    ifsc_code: "",
    business_address: "",
    is_msme_registered: false,
    website: "",
    description: "",
    // Document uploads
    logo: null,
    banner: null,
    pan_card: null,
    address_proof: null,
    fssai_license: null,
    trade_license: null,
    msme_certificate: null,
    other_document: null,
    other_document_name: "",
    // Step 3 fields - Product Basic Info
    name: "", // Product name
    sku: "",
    short_description: "",
    description: "",
    category_id: "",
    brand_id: "",
    price: 0,
    compare_at_price: 0,
    cost_per_item: 0,
    tags: [],
    // Step 4 fields - Product Details & Inventory
    weight: 0,
    dimensions: {},
    materials: [],
    care_instructions: "",
    origin_country: "",
    manufacturing_details: {},
    track_quantity: true,
    continue_selling: true,
    productVariants: [{ name: '', price: '', stockQuantity: '' }], // Placeholder for variants
    // Step 5 fields - Sustainability Profile (Updated to match backend)
    sustainability_practices: "",
    sustainability_certificate: null
  });

  // Check authentication and business status on mount
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is logged in
        const userTokens = tokens.get();
        if (!userTokens?.access_token) {
          // No tokens, start from Step 1 (signup)
          setCurrentStep(1);
          setIsSignedUp(false);
          setIsLoading(false);
          return;
        }

        // User is logged in, get user profile
        const userProfile = await auth.getProfile();
        if (userProfile.user_type !== 'supplier') {
          // Not a supplier, redirect to appropriate page
          router.push('/login');
          return;
        }

        // User is a supplier, check if business profile exists and onboarding status
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
          console.log('Checking onboarding status with API_BASE:', API_BASE);
          console.log('User tokens:', userTokens ? 'Present' : 'Not present');
          console.log('Access token length:', userTokens?.access_token?.length || 'N/A');
          
          // Check onboarding status first
          console.log('Making request to:', `${API_BASE}/supplier/onboarding/status`);
          const statusResponse = await fetch(`${API_BASE}/supplier/onboarding/status`, {
            headers: { 
              'Authorization': `Bearer ${userTokens.access_token}`,
              'Content-Type': 'application/json'
            }
          }).catch(error => {
            console.error('Network error when fetching onboarding status:', error);
            // Let's try to provide more specific error information
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
              throw new Error(`Network error: Unable to connect to ${API_BASE}. Please check if the backend server is running and accessible.`);
            }
            throw new Error(`Network error: ${error.message}`);
          });

          console.log('Status response received:', statusResponse.status, statusResponse.statusText);
          let statusData = null;
          if (statusResponse.ok) {
            statusData = await statusResponse.json();
            console.log('Onboarding status response:', statusData);
            
            // If onboarding is complete, check sustainability profile separately
            if (statusData.is_onboarding_complete && statusData.supplier_business) {
              try {
                console.log('Checking sustainability profile...');
                const sustainabilityResponse = await fetch(`${API_BASE}/supplier/onboarding/sustainability-profile`, {
                  headers: { 'Authorization': `Bearer ${userTokens.access_token}` }
                });
                
                if (sustainabilityResponse.ok) {
                  const sustainabilityData = await sustainabilityResponse.json();
                  console.log('Sustainability data:', sustainabilityData);
                  // If sustainability profile exists with certificate, onboarding is truly complete
                  if (sustainabilityData && sustainabilityData.certifications && sustainabilityData.certifications.length > 0) {
                    console.log('Onboarding complete, redirecting to dashboard...');
                    router.push('/vendor/dashboard');
                    return;
                  }
                } else {
                  console.log('Sustainability profile response not ok:', sustainabilityResponse.status);
                }
              } catch (sustainabilityError) {
                console.log('Sustainability profile not found, continuing onboarding...', sustainabilityError);
                // Continue with onboarding flow
              }
            }
          } else {
            console.log('Status response not ok, status:', statusResponse.status);
            const errorText = await statusResponse.text().catch(() => 'Unable to read error response');
            console.log('Status error response:', errorText);
          }

          // Check business profile
          console.log('Checking business profile...');
          const businessResponse = await fetch(`${API_BASE}/supplier/onboarding/business-profile`, {
            headers: { 'Authorization': `Bearer ${userTokens.access_token}` }
          }).catch(error => {
            console.error('Network error when fetching business profile:', error);
            throw new Error(`Network error: ${error.message}. Please check if the backend server is running.`);
          });

          console.log('Business profile response status:', businessResponse.status);
          if (businessResponse.ok) {
            // Business profile exists, check what's completed
            const businessData = await businessResponse.json();
            
            // Validate that PAN card is uploaded (required for seller account)
            const panCardDocument = businessData.documents?.find(doc => doc.document_type === 'pan_card');
            if (!panCardDocument || panCardDocument.document_status !== 'uploaded') {
              // PAN card is required, don't let seller proceed without it
              alert('PAN card upload is required to proceed with your seller account. Please complete your business profile.');
              setCurrentStep(2);
              setIsSignedUp(true);
              setIsLoading(false);
              return;
            }
            
            // Pre-fill form data with existing business info
            setFormData(prev => ({
              ...prev,
              businessName: businessData.business_name || '',
              business_name: businessData.business_name || '',
              contactPerson: businessData.contact_person || userProfile.first_name + ' ' + userProfile.last_name,
              email: businessData.email || userProfile.email,
              phone: businessData.phone || userProfile.phone,
              legal_entity_type: businessData.legal_entity_type || '',
              pan_gst_number: businessData.pan_gst_number || '',
              business_address: businessData.business_address || '',
              is_msme_registered: businessData.is_msme_registered || false,
              bank_name: businessData.bank_name || '',
              bank_account_number: businessData.bank_account_number || '',
              ifsc_code: businessData.ifsc_code || '',
              website: businessData.website || '',
              description: businessData.description || ''
            }));

            // Check if sustainability profile exists to determine starting step
            if (statusResponse.ok && statusData) {
              if (statusData.sustainability_profile) {
                // Sustainability profile exists, redirect to dashboard
                router.push('/vendor/dashboard');
                return;
              }
            }

            // Business exists but no sustainability profile, start from Step 5 (Sustainability)
            setCurrentStep(5);
            setIsSignedUp(true);
          } else if (businessResponse.status === 404) {
            // Business profile doesn't exist, start from Step 2 (Business Profile)
            // Pre-fill user info from profile
            setFormData(prev => ({
              ...prev,
              businessName: userProfile.first_name + ' ' + userProfile.last_name + ' Business',
              business_name: userProfile.first_name + ' ' + userProfile.last_name + ' Business',
              contactPerson: userProfile.first_name + ' ' + userProfile.last_name,
              email: userProfile.email,
              phone: userProfile.phone
            }));
            
            setCurrentStep(2);
            setIsSignedUp(true);
          } else {
            throw new Error('Failed to fetch business profile');
          }
        } catch (businessError) {
          console.error('Error checking business profile:', businessError);
          // If business check fails, assume no business and start from Step 2
          setFormData(prev => ({
            ...prev,
            businessName: userProfile.first_name + ' ' + userProfile.last_name + ' Business',
            business_name: userProfile.first_name + ' ' + userProfile.last_name + ' Business',
            contactPerson: userProfile.first_name + ' ' + userProfile.last_name,
            email: userProfile.email,
            phone: userProfile.phone
          }));
          
          setCurrentStep(2);
          setIsSignedUp(true);
        }

      } catch (error) {
        console.error('Error checking user status:', error);
        
        // Show user-friendly error message
        if (error.message.includes('Network error')) {
          alert('Unable to connect to the server. Please check your internet connection and try again. If the problem persists, the server may be down.');
        } else {
          alert('An error occurred while checking your account status. Please try refreshing the page.');
        }
        
        // If any error occurs, start from Step 1
        setCurrentStep(1);
        setIsSignedUp(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [router]);

  const handleChange = (field, value) => {
    console.log(`Main: handleChange called with field: ${field}, value:`, value);
    
    // Special logging for file uploads
    if (value instanceof File) {
      console.log(`Main: File upload detected for ${field}:`, {
        name: value.name,
        size: value.size,
        type: value.type
      });
    }
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('Main: Updated formData:', newData);
      return newData;
    });
  };

  // Handle Step 1 completion (signup with OTP verification)
  const handleStep1Complete = () => {
    setIsSignedUp(true);
    setCurrentStep(2); // Move to business profile step
  };

  // Handle skipping step 3 (product creation)
  const handleSkipStep3 = () => {
    console.log('Skipping product creation step');
    setCurrentStep(5); // Skip to sustainability step (Step 5)
  };

  // Handle Step 2 completion (save business data to supplier business table)
  const handleStep2Complete = async (hasExistingBusiness = false) => {
    try {
      // Prepare FormData for file uploads
      const formDataToSend = new FormData();
      
      // Required fields
      formDataToSend.append('business_name', formData.business_name || formData.businessName || '');
      formDataToSend.append('legal_entity_type', formData.legal_entity_type || '');
      formDataToSend.append('pan_gst_number', formData.pan_gst_number || '');
      formDataToSend.append('bank_name', formData.bank_name || '');
      formDataToSend.append('bank_account_number', formData.bank_account_number || '');
      formDataToSend.append('ifsc_code', formData.ifsc_code || '');
      formDataToSend.append('business_address', formData.business_address || '');
      
      // Optional fields
      formDataToSend.append('is_msme_registered', formData.is_msme_registered || false);
      if (formData.website) formDataToSend.append('website', formData.website);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.other_document_name) formDataToSend.append('other_document_name', formData.other_document_name);
      
      // File uploads (only add files that are File objects, not URLs)
      console.log('Main: Checking files for upload...');
      if (formData.logo instanceof File) {
        console.log('Main: Adding logo file:', formData.logo.name);
        formDataToSend.append('logo', formData.logo);
      }
      if (formData.banner instanceof File) {
        console.log('Main: Adding banner file:', formData.banner.name);
        formDataToSend.append('banner', formData.banner);
      }
      if (formData.pan_card instanceof File) {
        console.log('Main: Adding pan_card file:', formData.pan_card.name);
        formDataToSend.append('pan_card', formData.pan_card);
      }
      if (formData.address_proof instanceof File) {
        console.log('Main: Adding address_proof file:', formData.address_proof.name);
        formDataToSend.append('address_proof', formData.address_proof);
      }
      if (formData.fssai_license instanceof File) {
        console.log('Main: Adding fssai_license file:', formData.fssai_license.name);
        formDataToSend.append('fssai_license', formData.fssai_license);
      }
      if (formData.trade_license instanceof File) {
        console.log('Main: Adding trade_license file:', formData.trade_license.name);
        formDataToSend.append('trade_license', formData.trade_license);
      }
      if (formData.msme_certificate instanceof File) {
        console.log('Main: Adding msme_certificate file:', formData.msme_certificate.name);
        formDataToSend.append('msme_certificate', formData.msme_certificate);
      }
      if (formData.other_document instanceof File) {
        console.log('Main: Adding other_document file:', formData.other_document.name);
        formDataToSend.append('other_document', formData.other_document);
      }
      
      // Get tokens and make API call
      const userTokens = tokens.get();
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      
      // Use PUT for existing business, POST for new business
      const method = hasExistingBusiness ? 'PUT' : 'POST';
      
      const response = await fetch(`${API_BASE}/supplier/onboarding/business-onboarding`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${userTokens.access_token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${hasExistingBusiness ? 'update' : 'save'} business information`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map(err => 
                typeof err === 'string' ? err : 
                (err.msg || err.message || JSON.stringify(err))
              ).join(', ');
            } else {
              errorMessage = JSON.stringify(errorData.detail);
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `${errorMessage} (HTTP ${response.status})`;
        }
        throw new Error(errorMessage);
      }
      
      setCurrentStep(3); // Move to next step (Product Info)
    } catch (error) {
      console.error(`Failed to ${hasExistingBusiness ? 'update' : 'save'} business data:`, error);
      // Handle error - maybe show a toast or error message
      alert(`Failed to ${hasExistingBusiness ? 'update' : 'save'} business information: ` + error.message);
      throw error; // Re-throw to handle in calling function
    }
  };

  // Function to handle skip to next step with or without saving
  const handleSkipToStep3 = async (skipWithoutSave = false, hasExistingBusiness = false) => {
    if (skipWithoutSave) {
      // Skip directly without saving
      setCurrentStep(3);
    } else {
      // Save and then proceed
      await handleStep2Complete(hasExistingBusiness); // Pass the actual hasExistingBusiness flag
    }
  };

  const handleStep3Complete = async () => {
    try {
      console.log('Step 3: Starting product creation with form data:', formData);
      
      // Validate required fields before API call
      const requiredFields = {
        name: formData.name,
        category_id: formData.category_id,
        sku: formData.sku,
        price: formData.price,
        images: formData.images
      };
      
      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, value]) => {
        if (!value || (field === 'images' && (!Array.isArray(value) || value.length === 0))) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        console.error('Current form data:', formData);
        alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate images are File objects
      if (!Array.isArray(formData.images) || formData.images.some(img => !(img instanceof File))) {
        console.error('Invalid images detected:', formData.images);
        alert('Please ensure all images are properly uploaded');
        return;
      }

      const userTokens = tokens.get();
      if (!userTokens?.access_token) {
        throw new Error('No authentication token found');
      }

      // Step 1: Auto-verify product using AI
      console.log('Step 3: Starting auto-verification...');
      try {
        const verificationData = {
          title: formData.name.trim(),
          image: formData.images[0] // Use first image for verification
        };
        
        const verificationResult = await productsSupplier.verifyBeforeCreation(verificationData, userTokens.access_token);
        console.log('Step 3: Verification result:', verificationResult);
        
        // Check verification score
        if (verificationResult.probability < 0.7) {
          const message = `Product verification failed (score: ${verificationResult.probability.toFixed(2)}). 
The image and title don't match well enough. 
Please either:
1. Change the product title to better match the image
2. Upload a different product image that better matches the title

Current suggestion: ${verificationResult.suggestion || 'No suggestion available'}`;
          
          alert(message);
          return; // Stop product creation
        } else {
          // Auto-approved
          console.log(`Step 3: Product auto-approved with score: ${verificationResult.probability.toFixed(2)}`);
          alert(`✅ Product auto-approved! Verification score: ${verificationResult.probability.toFixed(2)}`);
        }
      } catch (verificationError) {
        console.warn('Step 3: Verification service unavailable, proceeding without verification:', verificationError);
        // Continue with product creation even if verification fails
        alert('⚠️ Product verification service is unavailable. Proceeding without verification.');
      }

      // Step 2: Create the product
      console.log('Step 3: Proceeding with product creation...');

      // Prepare product data according to API schema
      const productData = {
        name: formData.name.trim(),
        category_id: formData.category_id === '0' ? null : formData.category_id,
        sku: formData.sku.trim(),
        price: parseFloat(formData.price),
        images: formData.images, // File objects array
        // Optional fields
        brand_id: formData.brand_id && formData.brand_id !== '0' ? formData.brand_id : null,
        short_description: formData.short_description?.trim() || '',
        description: formData.description?.trim() || '',
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        cost_per_item: formData.cost_per_item ? parseFloat(formData.cost_per_item) : null,
        track_quantity: formData.track_quantity !== undefined ? formData.track_quantity : true,
        continue_selling: formData.continue_selling !== undefined ? formData.continue_selling : false,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions && Object.keys(formData.dimensions).length > 0 ? formData.dimensions : null,
        materials: Array.isArray(formData.materials) && formData.materials.length > 0 ? formData.materials : null,
        care_instructions: formData.care_instructions?.trim() || null,
        origin_country: formData.origin_country?.trim() || null,
        manufacturing_details: formData.manufacturing_details && Object.keys(formData.manufacturing_details).length > 0 ? formData.manufacturing_details : null,
        visibility: "visible",
        tags: Array.isArray(formData.tags) && formData.tags.length > 0 ? formData.tags : null
      };

      console.log('Step 3: Prepared product data for API:', productData);

      const result = await productsSupplier.createProduct(productData, userTokens.access_token);
      console.log('Step 3: Product created successfully:', result);
      
      // Store the created product ID for later use
      setFormData(prev => ({
        ...prev,
        createdProductId: result.id || result.product_id
      }));
      
      setCurrentStep(4); // Move to next step (inventory)
    } catch (error) {
      console.error('Failed to create product:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to create product';
      if (error.message) {
        errorMessage += ': ' + error.message;
      }
      if (error.details) {
        errorMessage += '\nDetails: ' + JSON.stringify(error.details);
      }
      
      alert(errorMessage);
    }
  };

  const handleStep4Complete = async () => {
    try {
      console.log('Step 4: Starting variant creation with form data:', formData);
      
      // Check if we have a product ID from Step 3
      if (!formData.createdProductId) {
        console.error('No product ID found from Step 3');
        alert('Product ID not found. Please go back to Step 3 and create the product first.');
        return;
      }

      // Process variants if they exist and are valid
      const variants = formData.productVariants || [];
      const validVariants = variants.filter(variant => 
        variant.sku && variant.sku.trim() && 
        variant.price && parseFloat(variant.price) > 0
      );

      if (validVariants.length > 0) {
        console.log(`Step 4: Creating ${validVariants.length} variants`);
        
        const userTokens = tokens.get();
        if (!userTokens?.access_token) {
          throw new Error('No authentication token found');
        }

        // Create variants one by one
        const createdVariants = [];
        for (const variant of validVariants) {
          try {
            const variantData = {
              sku: variant.sku.trim(),
              title: variant.title?.trim() || null,
              price: parseFloat(variant.price),
              compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
              weight: variant.weight ? parseFloat(variant.weight) : null,
              dimensions: variant.dimensions && Object.keys(variant.dimensions).length > 0 ? variant.dimensions : null,
              option1_name: variant.option1_name?.trim() || null,
              option1_value: variant.option1_value?.trim() || null,
              option2_name: variant.option2_name?.trim() || null,
              option2_value: variant.option2_value?.trim() || null,
              option3_name: variant.option3_name?.trim() || null,
              option3_value: variant.option3_value?.trim() || null,
              is_default: variant.is_default || false,
              images: variant.images || [] // Empty array for now, can be added later
            };

            console.log('Step 4: Creating variant with data:', variantData);
            
            const result = await productsSupplier.createVariant(
              formData.createdProductId, 
              variantData, 
              userTokens.access_token
            );
            
            createdVariants.push(result);
            console.log('Step 4: Variant created successfully:', result);
            
          } catch (variantError) {
            console.error('Failed to create variant:', variantError);
            // Continue with other variants, but log the error
            alert(`Failed to create variant "${variant.sku}": ${variantError.message}`);
          }
        }

        console.log(`Step 4: Successfully created ${createdVariants.length} out of ${validVariants.length} variants`);
        
        // Store created variant info
        setFormData(prev => ({
          ...prev,
          createdVariants: createdVariants
        }));
      } else {
        console.log('Step 4: No valid variants to create, skipping variant creation');
      }

      // Move to next step (sustainability)
      setCurrentStep(5);
      
    } catch (error) {
      console.error('Failed to complete Step 4:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to complete inventory setup';
      if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleStep5Complete = async () => {
    try {
      // Prepare sustainability data
      const formDataToSend = new FormData();
      
      // Required field
      formDataToSend.append('sustainability_practices', formData.sustainability_practices || '');
      
      // Optional file upload
      if (formData.sustainability_certificate instanceof File) {
        formDataToSend.append('sustainability_certificate', formData.sustainability_certificate);
      }
      
      const userTokens = tokens.get();
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      
      const response = await fetch(`${API_BASE}/supplier/onboarding/sustainability-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userTokens.access_token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save sustainability information');
      }
      
      // Onboarding complete - redirect to dashboard
      alert('Onboarding completed successfully! Redirecting to your dashboard...');
      router.push('/vendor/dashboard');
    } catch (error) {
      console.error('Failed to save sustainability data:', error);
      alert('Failed to save sustainability information: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Skip step 1 since it's handled by signup flow
    if (currentStep === 1) {
      return; // Step 1 has its own signup handling
    }
    
    // Skip Step 2 since it now has its own save button
    if (currentStep === 2) {
      return; // Step 2 has its own save handling
    }
    
    // Handle Step 3 completion (create product)
    if (currentStep === 3) {
      await handleStep3Complete();
      return;
    }

    // Handle Step 4 completion (inventory management)
    if (currentStep === 4) {
      await handleStep4Complete();
      return;
    }
    
    // Handle Step 5 completion (sustainability)
    if (currentStep === 5) {
      await handleStep5Complete();
      return;
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit sustainability profile and complete onboarding
      try {
        // Submit sustainability profile
        const sustainabilityData = {
          sustainability_practices: formData.sustainability_practices || '',
          sustainability_certificate: formData.sustainability_certificate || null
        };
        
        const userTokens = tokens.get();
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
        
        // Submit sustainability profile if there are practices to submit
        if (sustainabilityData.sustainability_practices) {
          const sustainabilityFormData = new FormData();
          sustainabilityFormData.append('sustainability_practices', sustainabilityData.sustainability_practices);
          
          if (sustainabilityData.sustainability_certificate) {
            sustainabilityFormData.append('sustainability_certificate', sustainabilityData.sustainability_certificate);
          }
          
          const response = await fetch(`${API_BASE}/supplier/onboarding/sustainability-profile`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${userTokens.access_token}`
            },
            body: sustainabilityFormData
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to save sustainability profile');
          }
        }
        
        console.log("Vendor registration completed successfully");
        setIsComplete(true);
      } catch (error) {
        console.error("Registration failed:", error);
        alert('Failed to complete onboarding: ' + error.message);
      }
    }
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Show loading state while checking user status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#12b74f] mx-auto mb-4"></div>
          <p className="text-[#1a4032] font-semibold">Checking your onboarding status...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isComplete ? (
        <OnboardingComplete />
      ) : (
        <div className="min-h-screen bg-white overflow-hidden">
          <OnboardingHeader />
          <OnboardingProgress currentStep={currentStep} />

          {/* Main Form Card */}
          <div className="max-w-[785px] mx-auto px-4">
            <div className="bg-[#f8f8f8] rounded-[20px] border border-[#666666] p-12">
              <div className="max-w-[684px] mx-auto">
                
                <StepHeader currentStep={currentStep} />
                <StepNavigation currentStep={currentStep} />

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Step 1: Seller Signup */}
                  {currentStep === 1 && (
                    <Step1BasicInfo 
                      formData={formData} 
                      handleChange={handleChange} 
                      onStepComplete={handleStep1Complete}
                    />
                  )}

                  {/* Step 2: Business and Sustainability Profile */}
                  {currentStep === 2 && (
                    <Step2BusinessProfile 
                      formData={formData} 
                      handleChange={handleChange} 
                      onSkipToNextStep={handleSkipToStep3}
                    />
                  )}

                  {/* Step 3: Product Information Wizard */}
                  {currentStep === 3 && (
                    <Step3ProductInfo 
                      formData={formData} 
                      handleChange={handleChange}
                      onSkip={handleSkipStep3}
                    />
                  )}

                  {/* Step 4: Inventory Management */}
                  {currentStep === 4 && (
                    <Step4Inventory formData={formData} handleChange={handleChange} />
                  )}

                  {/* Step 5: Sustainability Practices */}
                  {currentStep === 5 && (
                    <Step5Sustainability formData={formData} handleChange={handleChange} />
                  )}
                </form>
              </div>
            </div>
          </div>

          <OnboardingActions 
            currentStep={currentStep} 
            handleSubmit={handleSubmit} 
            handleGoBack={handleGoBack}
            hideActions={currentStep === 1 || currentStep === 2} // Hide actions for Step 1 (signup) and Step 2 (custom save button)
          />
        </div>
      )}
    </>
  );
}
