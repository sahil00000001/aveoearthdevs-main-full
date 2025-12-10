import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import VendorOnboardingPage from './VendorOnboardingPage';
import { 
  Store, 
  ArrowLeft, 
  Leaf, 
  BarChart3, 
  DollarSign, 
  Shield, 
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react';

const VendorPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const navigate = useNavigate();

  // Show onboarding form by default (register mode)
  // User can switch to login mode
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    contactPerson: '',
    phone: '',
    agreeToTerms: false
  });

  const handleChange = (field: string, value: string | boolean) => {
    console.log('handleChange called:', field, value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('New form data:', newData);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'register') {
        // Validate form data
        if (!formData.businessName.trim()) {
          alert('Please enter your business name!');
          return;
        }
        if (!formData.contactPerson.trim()) {
          alert('Please enter your contact person name!');
          return;
        }
        if (!formData.phone.trim()) {
          alert('Please enter your phone number!');
          return;
        }
        if (!formData.email.trim()) {
          alert('Please enter your email address!');
          return;
        }
        if (!formData.password.trim()) {
          alert('Please enter a password!');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
        if (!formData.agreeToTerms) {
          alert('Please agree to the terms and conditions!');
          return;
        }
        
        // Show success message and redirect to login
        alert('Registration successful! Please login with your credentials.');
        setMode('login');
        setFormData({
          email: formData.email, // Keep email for convenience
          password: '',
          confirmPassword: '',
          businessName: '',
          contactPerson: '',
          phone: '',
          agreeToTerms: false
        });
        return;
      }
      
      // Handle login - for demo purposes, accept any email/password
      if (formData.email && formData.password) {
        // Store vendor session in localStorage for demo
        localStorage.setItem('vendorSession', JSON.stringify({
          email: formData.email,
          businessName: formData.businessName || 'Demo Business',
          contactPerson: formData.contactPerson || 'Demo Contact',
          phone: formData.phone || '+1 (555) 123-4567',
          loginTime: new Date().toISOString()
        }));
        
        // Redirect to dashboard
        window.location.href = '/vendor/dashboard';
      } else {
        alert('Please enter both email and password!');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  // If mode is register, show the onboarding form directly
  if (mode === 'register') {
    return <VendorOnboardingPage />;
  }

  console.log('Current form data:', formData);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest/5 via-moss/10 to-clay/5 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-forest/20 to-moss/10 rounded-full blur-3xl animate-float-gentle"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-moss/20 to-clay/10 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-clay/10 to-forest/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-forest/15 rounded-full blur-2xl animate-bounce-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-moss/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Enhanced Header */}
      <nav className="relative z-10 bg-white/90 backdrop-blur-md border-b border-forest/20 shadow-lg px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-forest to-moss rounded-2xl flex items-center justify-center group-hover:from-moss group-hover:to-clay transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg">
              <Leaf className="w-6 h-6 text-white group-hover:animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xl text-forest group-hover:text-moss transition-colors duration-300 bg-gradient-to-r from-forest to-moss bg-clip-text text-transparent">AveoEarth</span>
              <span className="text-sm text-moss ml-2 font-medium">Vendor Portal</span>
            </div>
          </Link>
          
          <Link to="/" className="text-forest hover:text-moss flex items-center gap-2 group transition-all duration-300 hover:scale-105 px-4 py-2 rounded-xl hover:bg-forest/10">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Marketplace
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-md mx-auto px-4 py-12">
        {/* Enhanced Welcome Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-forest/20 to-moss/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group hover:from-moss/20 hover:to-clay/20 transition-all duration-500 hover:scale-110 hover:rotate-12 shadow-lg">
            <Store className="w-10 h-10 text-forest group-hover:text-moss transition-colors duration-300 group-hover:animate-bounce" />
          </div>
          <h1 className="text-4xl font-headline font-bold text-forest mb-3 animate-fade-in-up bg-gradient-to-r from-forest via-moss to-clay bg-clip-text text-transparent">
            Welcome Vendor
          </h1>
          <p className="text-muted-foreground text-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Sign in to your vendor account
          </p>
        </div>

        {/* Enhanced Auth Form */}
        <Card className="bg-white/95 backdrop-blur-md border-forest/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-moss/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-center text-2xl font-bold text-forest bg-gradient-to-r from-forest to-moss bg-clip-text text-transparent">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Mode Toggle - Only Sign In option, registration shows onboarding form by default */}
            <div className="flex bg-gradient-to-r from-forest/10 to-moss/10 rounded-2xl p-1 mb-6 shadow-lg">
              <button
                onClick={() => setMode('login')}
                className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 bg-gradient-to-r from-forest to-moss text-white shadow-lg"
              >
                Sign In
              </button>
              <Link 
                to="/vendor"
                className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 text-forest hover:text-moss hover:bg-forest/5 hover:scale-105 text-center"
              >
                Register
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-forest font-semibold">
                  Email Address *
                </Label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-xl text-lg transition-all duration-300 hover:border-forest/40"
                  placeholder="vendor@business.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-forest font-semibold">
                  Password *
                </Label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-xl text-lg transition-all duration-300 hover:border-forest/40"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-forest to-moss hover:from-moss hover:to-clay text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:animate-pulse"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/vendor/forgot-password" className="text-sm text-forest hover:text-moss font-semibold">
                Forgot your password?
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-forest/20 text-center">
              <p className="text-sm text-muted-foreground">
                Need help?{' '}
                <Link to="/vendor/support" className="text-forest hover:text-moss font-semibold">
                  Contact Vendor Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorPage;
