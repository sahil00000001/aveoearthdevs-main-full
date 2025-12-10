import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Step1BasicInfoProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
  onStepComplete: () => void;
}

const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({ 
  formData, 
  handleChange, 
  onStepComplete 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOtpSent(true);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setErrors({ otp: 'Please enter the OTP' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      onStepComplete();
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      setErrors({ otp: 'Invalid OTP. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-forest/10 to-moss/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-forest" />
        </div>
        <h3 className="text-2xl font-headline font-bold text-charcoal mb-2">
          Let's Get Started
        </h3>
        <p className="text-charcoal/70">
          Tell us about yourself and your business to begin your journey with AveoEarth
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card className="border-2 border-forest/10">
          <CardContent className="p-6">
            <h4 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-forest" />
              Business Information
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-charcoal font-medium">
                  Business Name *
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    className={`pl-10 h-12 border-2 ${
                      errors.businessName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-forest/20 focus:border-forest focus:ring-forest/20'
                    } rounded-xl`}
                    placeholder="Enter your business name"
                  />
                </div>
                {errors.businessName && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-charcoal font-medium">
                  Contact Person *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                  <Input
                    id="contactPerson"
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                    className={`pl-10 h-12 border-2 ${
                      errors.contactPerson 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-forest/20 focus:border-forest focus:ring-forest/20'
                    } rounded-xl`}
                    placeholder="Your full name"
                  />
                </div>
                {errors.contactPerson && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.contactPerson}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-2 border-forest/10">
          <CardContent className="p-6">
            <h4 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-forest" />
              Contact Information
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-charcoal font-medium">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`pl-10 h-12 border-2 ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-forest/20 focus:border-forest focus:ring-forest/20'
                    } rounded-xl`}
                    placeholder="vendor@business.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-charcoal font-medium">
                  Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`pl-10 h-12 border-2 ${
                      errors.phone 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-forest/20 focus:border-forest focus:ring-forest/20'
                    } rounded-xl`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Section */}
      <Card className="border-2 border-forest/10">
        <CardContent className="p-6">
          <h4 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-forest" />
            Security
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-charcoal font-medium">
                Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`pl-10 h-12 border-2 ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-forest/20 focus:border-forest focus:ring-forest/20'
                  } rounded-xl`}
                  placeholder="Create a secure password"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
              <p className="text-sm text-charcoal/60">
                Password must be at least 8 characters long
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="border-2 border-forest/10">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleChange('agreeToTerms', checked)}
              className="mt-1"
            />
            <div className="space-y-2">
              <Label htmlFor="agreeToTerms" className="text-charcoal leading-relaxed">
                I agree to the{' '}
                <a href="/vendor/terms" className="text-forest hover:text-moss font-medium underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/vendor/privacy" className="text-forest hover:text-moss font-medium underline">
                  Privacy Policy
                </a>
              </Label>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.agreeToTerms}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OTP Verification */}
      {otpSent && (
        <Card className="border-2 border-forest bg-forest/5">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-forest rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-charcoal text-lg">Verify Your Email</h4>
                <p className="text-charcoal/70">
                  We've sent a verification code to <strong>{formData.email}</strong>
                </p>
              </div>
              
              <div className="max-w-xs mx-auto">
                <Label htmlFor="otp" className="text-charcoal font-medium">
                  Enter Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-center text-lg font-mono h-12 border-2 border-forest/20 focus:border-forest focus:ring-forest/20 rounded-xl"
                  placeholder="000000"
                  maxLength={6}
                />
                {errors.otp && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.otp}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center">
        {!otpSent ? (
          <Button
            onClick={handleSendOTP}
            disabled={isSubmitting}
            className="btn-primary px-8 py-3 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              'Send Verification Code'
            )}
          </Button>
        ) : (
          <Button
            onClick={handleVerifyOTP}
            disabled={isSubmitting || !otp.trim()}
            className="btn-primary px-8 py-3 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Continue'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Step1BasicInfo;
