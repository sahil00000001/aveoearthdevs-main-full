import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf, Building2 } from 'lucide-react';

const OnboardingHeader = () => {
  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-forest/10 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-forest to-moss">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-headline font-bold text-xl text-charcoal">AveoEarth</span>
            <span className="text-sm text-moss ml-2 font-medium">Vendor Onboarding</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/vendor" 
            className="text-charcoal/70 hover:text-charcoal flex items-center gap-2 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
          
          <div className="flex items-center gap-2 text-sm text-charcoal/60">
            <Building2 className="w-4 h-4" />
            <span>Vendor Portal</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default OnboardingHeader;
