import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import logoImage from '@/assets/logo.webp';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  CheckCircle, 
  ArrowLeft,
  Leaf,
  BarChart3,
  DollarSign,
  Shield,
  Users,
  Star,
  Award,
  Globe,
  Heart
} from 'lucide-react';

const VendorLoginPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For mock version, create a vendor session directly
      const vendorSession = {
        id: 'mock-vendor-1',
        email: formData.email,
        businessName: 'EcoFriendly Store',
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('vendorSession', JSON.stringify(vendorSession));
      navigate('/vendor/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      // For mock version, create a vendor session directly
      const vendorSession = {
        id: 'mock-vendor-1',
        email: formData.email,
        businessName: formData.businessName,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('vendorSession', JSON.stringify(vendorSession));
      navigate('/vendor/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (mode === 'login') {
      await handleLogin(e);
    } else {
      await handleRegister(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/5 via-background to-moss/5">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-forest/10 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="AveoEarth Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-headline font-bold text-xl text-charcoal">AveoEarth</span>
              <span className="text-sm text-moss ml-2 font-medium">Vendor Portal</span>
            </div>
          </Link>
          
          <Link 
            to="/" 
            className="text-charcoal/70 hover:text-charcoal flex items-center gap-2 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-4xl font-headline font-bold text-charcoal mb-3">
            Welcome <span className="text-forest">Vendor</span>
          </h1>
          <p className="text-charcoal/70 text-lg">
            {mode === 'login' 
              ? 'Sign in to your vendor account' 
              : 'Join AveoEarth as a sustainable vendor'
            }
          </p>
        </div>

        {/* Auth Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-headline text-charcoal">
              {mode === 'login' ? 'Sign In' : 'Get Started'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Mode Toggle */}
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'login' | 'register')} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-sage/10">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-forest data-[state=active]:text-white"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-forest data-[state=active]:text-white"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-charcoal font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="pl-10 h-12 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-xl"
                        placeholder="vendor@business.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-charcoal font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className="pl-10 h-12 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-xl"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm text-charcoal/70">
                        Remember me
                      </Label>
                    </div>
                    <Link 
                      to="/vendor/forgot-password" 
                      className="text-sm text-forest hover:text-moss transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-12 btn-primary text-lg font-medium">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-charcoal font-medium">
                        Business Name
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                        <Input
                          id="businessName"
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => handleChange('businessName', e.target.value)}
                          className="pl-10 h-12 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-xl"
                          placeholder="Enter your business name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPerson" className="text-charcoal font-medium">
                        Contact Person
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                        <Input
                          id="contactPerson"
                          type="text"
                          value={formData.contactPerson}
                          onChange={(e) => handleChange('contactPerson', e.target.value)}
                          className="pl-10 h-12 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-xl"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-charcoal font-medium">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className="pl-10 h-12 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-xl"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-charcoal font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="pl-10 h-12 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-xl"
                          placeholder="vendor@business.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-charcoal font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          className="pl-10 h-12 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-xl"
                          placeholder="Create a secure password"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-charcoal font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange('confirmPassword', e.target.value)}
                          className="pl-10 h-12 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-xl"
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleChange('agreeToTerms', checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-charcoal/70 leading-relaxed">
                      I agree to the{' '}
                      <Link to="/vendor/terms" className="text-forest hover:text-moss font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/vendor/privacy" className="text-forest hover:text-moss font-medium">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-12 btn-primary text-lg font-medium">
                    {isLoading ? 'Creating Account...' : 'Start Registration Process'}
                  </Button>
                  
                  <div className="mt-4">
                    <Link to="/vendor/onboarding">
                      <Button variant="outline" className="w-full h-12 border-2 border-forest/20 hover:border-forest hover:bg-forest/5 text-forest">
                        Direct Registration (Recommended)
                      </Button>
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-forest/10 text-center">
              <p className="text-sm text-charcoal/60">
                Need help?{' '}
                <Link to="/vendor/support" className="text-forest hover:text-moss font-medium">
                  Contact Vendor Support
                </Link>
              </p>
              
              {/* Test Account Button - Remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          // Create mock vendor session
                          const vendorSession = {
                            id: 'mock-vendor-1',
                            email: 'test@vendor.com',
                            businessName: 'Test Vendor Store',
                            loginTime: new Date().toISOString()
                          };
                          
                          localStorage.setItem('vendorSession', JSON.stringify(vendorSession));
                          alert('Test vendor created! Email: test@vendor.com, Password: any password');
                          
                          // Auto-fill the form
                          setFormData(prev => ({
                            ...prev,
                            email: 'test@vendor.com',
                            password: 'testpassword123'
                          }));
                        } catch (err) {
                          console.error('Error:', err);
                          alert('Error creating test vendor');
                        }
                      }}
                      className="text-xs w-full"
                    >
                      Create Test Vendor Account
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const vendorSession = {
                          id: 'mock-vendor-1',
                          email: 'test@vendor.com',
                          businessName: 'EcoFriendly Store',
                          loginTime: new Date().toISOString()
                        };
                        localStorage.setItem('vendorSession', JSON.stringify(vendorSession));
                        navigate('/vendor/dashboard');
                      }}
                      className="text-xs w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      🚀 Quick Access to Dashboard
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const vendorSession = {
                          id: 'mock-vendor-1',
                          email: 'test@vendor.com',
                          businessName: 'EcoFriendly Store',
                          loginTime: new Date().toISOString()
                        };
                        localStorage.setItem('vendorSession', JSON.stringify(vendorSession));
                        navigate('/vendor/products');
                      }}
                      className="text-xs w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      📦 Go to Products
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const vendorSession = {
                          id: 'mock-vendor-1',
                          email: 'test@vendor.com',
                          businessName: 'EcoFriendly Store',
                          loginTime: new Date().toISOString()
                        };
                        localStorage.setItem('vendorSession', JSON.stringify(vendorSession));
                        navigate('/vendor/orders');
                      }}
                      className="text-xs w-full bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                    >
                      🛒 Go to Orders
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section for Registration */}
        {mode === 'register' && (
          <Card className="mt-8 shadow-xl border-0 bg-gradient-to-br from-forest/5 to-moss/5">
            <CardContent className="p-6">
              <h3 className="font-headline font-bold text-xl text-charcoal mb-6 text-center">
                Why Sell on AveoEarth?
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-forest/10 to-forest/20 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-forest" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">Sustainable Focus</div>
                    <div className="text-sm text-charcoal/70">Reach eco-conscious customers worldwide</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sage/20 to-sage/30 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-sage" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">Analytics & Insights</div>
                    <div className="text-sm text-charcoal/70">Track your performance with detailed reports</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">Competitive Fees</div>
                    <div className="text-sm text-charcoal/70">Low transaction costs, high profit margins</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-moss/20 to-moss/30 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-moss" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">Secure Platform</div>
                    <div className="text-sm text-charcoal/70">Bank-level security for all transactions</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-clay/20 to-clay/30 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-clay" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">Growing Community</div>
                    <div className="text-sm text-charcoal/70">Join 10,000+ sustainable vendors</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-forest/10 to-moss/20 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-forest" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">Quality Assurance</div>
                    <div className="text-sm text-charcoal/70">Verified sustainable products only</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VendorLoginPage;
