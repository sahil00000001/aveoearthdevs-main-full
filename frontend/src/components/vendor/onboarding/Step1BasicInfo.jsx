import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, tokens } from '../../../lib/api';
import { countryCodes } from '../../../lib/countryCodes';
import TermsModal from '../../../components/ui/TermsModal';

export default function Step1BasicInfo({ formData, handleChange, onValidation, onStepComplete }) {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [dialCode, setDialCode] = useState("+91");
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Validate form data when it changes
  useEffect(() => {
    const validateCurrentData = () => {
      if (showLogin) {
        // Login validation
        const loginValidation = {
          email: !loginData.email?.trim() ? "Email is required" : 
                 !/\S+@\S+\.\S+/.test(loginData.email) ? "Invalid email format" : undefined,
          password: !loginData.password ? "Password is required" : undefined,
        };
        
        const stepErrors = Object.fromEntries(
          Object.entries(loginValidation).filter(([_, value]) => value !== undefined)
        );
        setErrors(stepErrors);
        if (onValidation) {
          onValidation(Object.keys(stepErrors).length === 0);
        }
        return;
      }

      // Signup validation (removed businessName)
      const currentStepValidation = {
        contactPerson: !formData.contactPerson?.trim() ? "Contact person is required" : undefined,
        email: !formData.email?.trim() ? "Email is required" : 
               !/\S+@\S+\.\S+/.test(formData.email) ? "Invalid email format" : undefined,
        phone: !formData.phone?.trim() ? "Phone number is required" : undefined,
        password: !formData.password || formData.password.length < 8 ? "Password must be at least 8 characters" : undefined,
        agreeToTerms: !formData.agreeToTerms ? "You must agree to terms and conditions" : undefined,
      };

      if (otpSent && !otpCode.trim()) {
        currentStepValidation.otpCode = "OTP verification is required";
      }

      const stepErrors = Object.fromEntries(
        Object.entries(currentStepValidation).filter(([_, value]) => value !== undefined)
      );

      setErrors(stepErrors);
      
      // Notify parent about validation status
      if (onValidation) {
        onValidation(Object.keys(stepErrors).length === 0 && (!otpSent || otpCode.length === 6));
      }
    };

    validateCurrentData();
  }, [formData, otpCode, otpSent, showLogin, loginData, onValidation]);

  const handleSignup = async () => {
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      const phone = `${dialCode}${formData.phone?.replace(/\s+/g, '')}`;
      
      // Prepare signup payload for seller
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        phone: phone,
        first_name: formData.contactPerson.split(' ')[0] || formData.contactPerson,
        last_name: formData.contactPerson.split(' ').slice(1).join(' ') || '',
        user_type: 'supplier', // Set as supplier/seller
      };

      console.debug("[Seller Signup] Payload:", { ...payload, password: `***(${payload.password.length})` });
      
      const result = await auth.signup(payload);
      console.log("[Seller Signup] Success:", result);
      
      if (result?.tokens) {
        tokens.set(result.tokens);
      }
      
      // Send OTP
      try {
        console.log("[OTP Send] Attempting to send OTP to:", phone);
        await auth.sendOtp(phone);
        console.log("[OTP Send] Success");
        setOtpSent(true);
        setErrors({});
      } catch (otpError) {
        console.error("[OTP Send] Error:", otpError);
        console.error("[OTP Send] Error details:", {
          message: otpError.message,
          status: otpError.status,
          data: otpError.data
        });
        
        // If OTP fails, we can either:
        // 1. Show error and let user retry
        // 2. Skip OTP for now and proceed (for testing)
        
        // For now, let's show an error but allow proceeding without OTP
        setErrors({ 
          general: `Signup successful! However, OTP sending failed: ${otpError.message}. You can proceed to the next step.` 
        });
        
        // Auto-proceed to next step after 3 seconds
        setTimeout(() => {
          if (onStepComplete) {
            onStepComplete();
          }
        }, 3000);
      }
      
    } catch (error) {
      console.error("[Seller Signup] Error:", error);
      setErrors({ general: error.message || 'Signup failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setErrors({ otpCode: "Please enter a valid 6-digit OTP" });
      return;
    }

    setIsLoading(true);
    try {
      const phone = `${dialCode}${formData.phone?.replace(/\s+/g, '')}`;
      await auth.verifyOtp(phone, otpCode);
      
      // OTP verified successfully - move to next step
      setErrors({});
      if (onStepComplete) {
        onStepComplete();
      }
      
    } catch (error) {
      console.error("[OTP Verification] Error:", error);
      setErrors({ otpCode: error.message || 'Invalid or expired OTP' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      const result = await auth.login(loginData.email, loginData.password);
      if (result?.tokens) {
        tokens.set(result.tokens);
      }
      
      // Check user type and onboarding status
      const userProfile = await auth.getProfile(result.tokens.access_token);
      if (userProfile.user_type !== 'supplier') {
        setErrors({ general: 'This login is only for suppliers. Please use buyer login instead.' });
        return;
      }

      // Check onboarding status via API
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
        const statusResponse = await fetch(`${API_BASE}/supplier/onboarding/status`, {
          headers: { 'Authorization': `Bearer ${result.tokens.access_token}` }
        });
        const status = await statusResponse.json();
        
        if (status.supplier_business) {
          // Business already exists, redirect to dashboard
          router.push('/vendor/dashboard');
        } else {
          // No business profile, continue with onboarding
          setErrors({});
          if (onStepComplete) {
            onStepComplete();
          }
        }
      } catch (statusError) {
        // If status check fails, assume needs onboarding
        setErrors({});
        if (onStepComplete) {
          onStepComplete();
        }
      }

    } catch (error) {
      console.error("[Supplier Login] Error:", error);
      setErrors({ general: error.message || 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const phone = `${dialCode}${formData.phone?.replace(/\s+/g, '')}`;
      await auth.sendOtp(phone);
      setErrors({});
    } catch (error) {
      console.error("[Resend OTP] Error:", error);
      setErrors({ general: error.message || 'Failed to resend OTP' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#12b74f]"></div>
        <span className="ml-2 text-[#1a4032]">
          {otpSent ? 'Verifying OTP...' : showLogin ? 'Logging in...' : 'Creating your account...'}
        </span>
      </div>
    );
  }

  // Show login form if user chooses to login
  if (showLogin) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-[#1a4032] mb-2">Login to Continue Onboarding</h3>
          <p className="text-[#666666]">
            Enter your supplier account credentials
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a4032] mb-2">Email Address</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3
                       font-semibold text-[16px] text-[#1a4032] focus:outline-none transition-all
                       ${errors.email ? 'border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a4032] mb-2">Password</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password"
              className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3
                       font-semibold text-[16px] text-[#1a4032] focus:outline-none transition-all
                       ${errors.password ? 'border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <div className="text-red-500 text-sm text-center">{errors.general}</div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading || Object.keys(errors).length > 0}
            className="w-full bg-[#12b74f] hover:bg-[#0e9c42] disabled:bg-gray-400 text-white py-3 rounded-[8px] font-semibold transition-colors mb-4"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center">
            <button
              onClick={() => setShowLogin(false)}
              className="text-[#12b74f] hover:text-[#0e9c42] font-semibold"
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show OTP verification if OTP has been sent
  if (otpSent) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-[#1a4032] mb-2">Verify Your Phone Number</h3>
          <p className="text-[#666666]">
            Enter the 6-digit code sent to {dialCode}{formData.phone}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 text-center text-xl tracking-widest
                       font-semibold text-[#1a4032] focus:outline-none transition-all
                       ${errors.otpCode ? 'border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
              maxLength="6"
            />
            {errors.otpCode && (
              <p className="text-red-500 text-sm mt-1">{errors.otpCode}</p>
            )}
          </div>

          {errors.general && (
            <div className="text-red-500 text-sm text-center">{errors.general}</div>
          )}

          <button
            onClick={handleVerifyOtp}
            disabled={isLoading || otpCode.length !== 6}
            className="w-full bg-[#12b74f] hover:bg-[#0e9c42] disabled:bg-gray-400 text-white py-3 rounded-[8px] font-semibold transition-colors"
          >
            Verify OTP
          </button>

          <div className="text-center space-y-2">
            <button
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-[#12b74f] hover:text-[#0e9c42] font-semibold block mx-auto"
            >
              Resend OTP
            </button>
            
            {/* Skip OTP button for testing */}
            <button
              onClick={() => {
                if (onStepComplete) {
                  onStepComplete();
                }
              }}
              className="text-[#666666] hover:text-[#12b74f] font-semibold text-sm block mx-auto"
            >
              Skip OTP (Testing)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Login Option */}
      <div className="text-center mb-6">
        <p className="text-[#666666] mb-4">Already have a supplier account?</p>
        <button
          type="button"
          onClick={() => setShowLogin(true)}
          className="text-[#12b74f] hover:text-[#0e9c42] font-semibold text-lg underline"
        >
          Login to Continue Onboarding
        </button>
      </div>

      <div className="border-b border-gray-300 mb-6"></div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-[#1a4032] mb-2">Create New Supplier Account</h3>
        <p className="text-[#666666]">Fill in your details to get started</p>
      </div>

      {/* Contact Person & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Contact Person
            </span>
            <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
            placeholder="Your Full name"
            className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none transition-all
                     ${errors.contactPerson ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
            required
          />
          {errors.contactPerson && (
            <p className="text-red-500 text-sm mt-1 px-4">{errors.contactPerson}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="flex items-center px-4 py-0 mb-2">
            <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
              Email Address
            </span>
            <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter Email Address"
            className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#1a4032] opacity-50
                     focus:opacity-100 focus:outline-none transition-all
                     ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 px-4">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Phone Number */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#09101d] opacity-80">
            Phone Number
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        <div className="flex gap-2">
          <select
            value={dialCode}
            onChange={(e) => setDialCode(e.target.value)}
            className="bg-[#f9fbe7] border border-[#858c94] rounded-[8px] px-3 py-3 
                     font-semibold text-[16px] text-[#09101d] opacity-50
                     focus:opacity-100 focus:outline-none focus:border-[#09101d] transition-all"
          >
            {countryCodes.map((country, index) => (
              <option key={`${country.dial_code}-${country.name}-${index}`} value={country.dial_code}>
                {country.flag} {country.dial_code}
              </option>
            ))}
          </select>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter Your Number"
            className={`flex-1 bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                     font-semibold text-[16px] text-[#09101d] opacity-50
                     focus:opacity-100 focus:outline-none transition-all
                     ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#09101d]'}`}
            required
          />
        </div>
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1 px-4">{errors.phone}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="flex flex-col">
        <label className="flex items-center px-4 py-0 mb-2">
          <span className="font-semibold text-[16px] text-[#1a4032] opacity-80">
            Password
          </span>
          <span className="text-[#da1414] text-[13px] opacity-80 ml-1">*</span>
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Create Strong Password"
          className={`w-full bg-[#f9fbe7] border rounded-[8px] px-4 py-3 
                   font-semibold text-[16px] text-[#1a4032] opacity-50
                   focus:opacity-100 focus:outline-none transition-all
                   ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-[#858c94] focus:border-[#1a4032]'}`}
          required
        />
        {errors.password ? (
          <p className="text-red-500 text-sm mt-1 px-4">{errors.password}</p>
        ) : (
          <p className="px-4 mt-2 text-[13px] text-[#09101d] opacity-60">
            Password must be at least 8 characters with uppercase, lowercase, number, and special character.
          </p>
        )}
      </div>

      {/* General Error Display */}
      {errors.general && (
        <div className="text-red-500 text-sm text-center mb-4">{errors.general}</div>
      )}

      {/* Terms and Conditions */}
      <div className="flex items-start gap-3 px-4">
        <input
          type="checkbox"
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
          className="w-4 h-4 mt-0.5 bg-[rgba(80,44,10,0.2)] border-[#502c0a] rounded-[2px] 
                   focus:ring-2 focus:ring-[#502c0a] focus:outline-none"
          required
        />
        <label htmlFor="agreeToTerms" className="text-[13px] text-[#09101d] leading-[20px]">
          I agree to AveoEarth's{" "}
          <button
            type="button"
            onClick={() => setIsTermsModalOpen(true)}
            className="text-[#1a4032] underline hover:text-[#1a4032]/80 font-semibold"
          >
            Terms of Service and Privacy Policy
          </button>
          . I also consent to receiving marketing communications about sustainable products and ESG insights.
        </label>
      </div>
      {errors.agreeToTerms && (
        <p className="text-red-500 text-sm px-4 -mt-2">{errors.agreeToTerms}</p>
      )}

      {/* Signup Button */}
      <div className="flex flex-col mt-6">
        <button
          type="button"
          onClick={handleSignup}
          disabled={isLoading || Object.keys(errors).length > 0 || !formData.agreeToTerms}
          className="w-full bg-[#12b74f] hover:bg-[#0e9c42] disabled:bg-gray-400 text-white py-3 rounded-[8px] font-semibold transition-colors"
        >
          {isLoading ? 'Creating Account...' : 'Create Seller Account'}
        </button>
      </div>

      {/* Terms Modal */}
      <TermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
    </>
  );
}
