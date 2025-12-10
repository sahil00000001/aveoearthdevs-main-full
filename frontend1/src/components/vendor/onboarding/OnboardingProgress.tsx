import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, title: 'Basic Info', description: 'Personal & Business Details' },
    { id: 2, title: 'Business Profile', description: 'Company Information' },
    { id: 3, title: 'Product Info', description: 'Add Your First Product' },
    { id: 4, title: 'Inventory', description: 'Stock & Variants' },
    { id: 5, title: 'Sustainability', description: 'Eco Practices' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-forest/10 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${currentStep > step.id 
                    ? 'bg-forest border-forest text-white' 
                    : currentStep === step.id 
                    ? 'bg-forest border-forest text-white ring-4 ring-forest/20' 
                    : 'bg-white border-forest/30 text-forest/30'
                  }
                `}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-charcoal' : 'text-charcoal/50'
                  }`}>
                    {step.title}
                  </div>
                  <div className={`text-xs ${
                    currentStep >= step.id ? 'text-charcoal/70' : 'text-charcoal/40'
                  }`}>
                    {step.description}
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4 transition-colors duration-300
                  ${currentStep > step.id ? 'bg-forest' : 'bg-forest/20'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-forest/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-forest to-moss h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-charcoal/60">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}% Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;
