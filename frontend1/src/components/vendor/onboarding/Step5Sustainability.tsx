import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/FileUpload';
import { CheckCircle, Leaf } from 'lucide-react';

interface Step5SustainabilityProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const Step5Sustainability: React.FC<Step5SustainabilityProps> = ({
  formData,
  handleChange
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sustainability_practices.trim()) {
      newErrors.sustainability_practices = 'Sustainability practices are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteOnboarding = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Onboarding completed successfully! Welcome to AveoEarth!');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (field: string, files: File[]) => {
    handleChange(field, files);
  };

  return (
    <div className="space-y-8">
      {/* Sustainability Practices Section */}
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-forest to-moss rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-forest mb-2">
            Sustainability Practices
          </h3>
          <p className="text-gray-600">
            Share your commitment to sustainability and environmental responsibility
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sustainability_practices" className="text-forest font-medium">
            Describe Your Sustainability Practices *
          </Label>
          <Textarea
            id="sustainability_practices"
            value={formData.sustainability_practices}
            onChange={(e) => handleChange('sustainability_practices', e.target.value)}
            className={`bg-[#f9fbe7] border-[#858c94] focus:border-[#1a4032] ${
              errors.sustainability_practices ? 'border-red-500' : ''
            }`}
            placeholder="Describe your sustainability practices, environmental initiatives, eco-friendly processes, waste reduction efforts, renewable energy usage, carbon footprint reduction, sustainable sourcing, etc."
            rows={6}
          />
          {errors.sustainability_practices && (
            <p className="text-sm text-red-500">{errors.sustainability_practices}</p>
          )}
          <p className="text-sm text-gray-600">
            This information will be displayed on your vendor profile and help customers understand your environmental commitment.
          </p>
        </div>
      </div>

      {/* Sustainability Certificates Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest border-b border-forest/20 pb-2">
          Sustainability Certificates & Documentation
        </h3>
        
        <div className="space-y-4">
          <FileUpload
            label="Sustainability Certificate"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileChange={(files) => handleFileChange('sustainability_certificate', files)}
            files={formData.sustainability_certificate}
            maxSize={10}
          />
          <p className="text-sm text-gray-600">
            Upload any sustainability certificates, environmental compliance documents, or third-party certifications you have received.
          </p>
        </div>
      </div>

      {/* Sustainability Tips Section */}
      <div className="bg-gradient-to-r from-forest/5 to-moss/5 rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-forest flex items-center gap-2">
          <Leaf className="w-5 h-5" />
          Sustainability Tips for Vendors
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="space-y-2">
            <h5 className="font-medium text-forest">Product Packaging</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use recyclable or biodegradable packaging materials</li>
              <li>Minimize packaging size and weight</li>
              <li>Use reusable containers when possible</li>
              <li>Provide clear recycling instructions</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-forest">Shipping & Logistics</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>Optimize shipping routes to reduce emissions</li>
              <li>Use carbon-neutral shipping options</li>
              <li>Consolidate orders to reduce packaging</li>
              <li>Partner with eco-friendly logistics providers</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-forest">Product Sourcing</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>Source materials from sustainable suppliers</li>
              <li>Use organic or natural ingredients when possible</li>
              <li>Support fair trade and ethical practices</li>
              <li>Choose local suppliers to reduce transportation</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-forest">Business Operations</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use renewable energy sources</li>
              <li>Implement waste reduction programs</li>
              <li>Digitalize processes to reduce paper usage</li>
              <li>Educate customers about sustainability</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-moss/10 to-forest/10 rounded-lg p-6">
        <h4 className="font-semibold text-forest mb-4">Benefits of Sustainable Practices</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-forest/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-forest font-bold">🌱</span>
            </div>
            <h5 className="font-medium text-forest mb-1">Environmental Impact</h5>
            <p className="text-gray-600">Reduce your carbon footprint and contribute to a healthier planet</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-forest/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-forest font-bold">💰</span>
            </div>
            <h5 className="font-medium text-forest mb-1">Cost Savings</h5>
            <p className="text-gray-600">Reduce operational costs through energy efficiency and waste reduction</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-forest/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-forest font-bold">👥</span>
            </div>
            <h5 className="font-medium text-forest mb-1">Customer Appeal</h5>
            <p className="text-gray-600">Attract environmentally conscious customers and build brand loyalty</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center pt-6 border-t border-forest/20">
        <Button
          type="button"
          onClick={handleCompleteOnboarding}
          disabled={isLoading}
          className="bg-gradient-to-r from-forest to-moss hover:from-forest/90 hover:to-moss/90 text-white px-12 py-3 text-lg"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Completing Onboarding...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Onboarding
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step5Sustainability;