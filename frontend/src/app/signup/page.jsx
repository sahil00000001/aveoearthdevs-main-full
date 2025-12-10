"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, tokens } from "../../lib/api";
import { countryCodes } from "../../lib/countryCodes";
import Image from "next/image";
import TermsModal from "../../components/ui/TermsModal";
import Button from "../../components/ui/Button";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    referralCode: "",
    agreeToTerms: false
  });
  const [dialCode, setDialCode] = useState("+91");
  const [error, setError] = useState("");
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.agreeToTerms) {
      return setError('Please agree to the Terms to continue.');
    }
    const phone = `${dialCode}${formData.phoneNumber?.replace(/\s+/g, '')}`;
    const email = formData.email?.trim();
    const first_name = formData.firstName?.trim();
    const last_name = formData.lastName?.trim();
    const password = formData.password;
    const user_type = 'buyer'; // Default to buyer registration
    const referral_code = (formData.referralCode || "").trim() || null;

    // Ensure phone includes international code '+' as required by backend
    if (!phone?.startsWith('+')) {
      return setError('Please include country code in phone number, e.g., +91XXXXXXXXXX');
    }
    if (!password || password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (!email || !first_name || !last_name) {
      return setError('Please fill in all required fields.');
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError('Please enter a valid email address.');
    }

    try {
      // Prepare payload and log a masked version for debugging
      const payload = { email, password, phone, first_name, last_name, user_type, referral_code };
      const payloadMasked = { ...payload, password: payload.password ? `***(${payload.password.length})` : undefined };
      console.debug("[Signup] POST /auth/signup payload:", payloadMasked);

      const result = await auth.signup(payload);
      console.debug("[Signup] response keys:", Object.keys(result || {}));
      if (result?.tokens) tokens.set(result.tokens);
      
      // TODO: Temporarily skip OTP verification
      console.debug("[Signup] OTP verification temporarily disabled");
      
      // Redirect based on user type
      if (user_type === 'supplier') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/explore'); // For buyers, redirect to explore page
      }
      
      // COMMENTED OUT: OTP verification flow
      // console.debug("[Signup] sending OTP to:", phone);
      // await auth.sendOtp(phone);
      // router.push(`/verify-otp?phone=${encodeURIComponent(phone)}`);
    } catch (err) {
      console.error("[Signup] error:", { 
        error: err,
        status: err?.status || 'unknown', 
        message: err?.message || 'Unknown error', 
        data: err?.data || null,
        stack: err?.stack
      });
      
      // More specific error messages
      let errorMessage = 'Signup failed';
      
      if (err?.status === 400) {
        errorMessage = err?.message || 'Invalid input. Please check your details.';
      } else if (err?.status === 409) {
        errorMessage = 'An account with this email or phone number already exists.';
      } else if (err?.status === 422) {
        errorMessage = 'Validation error. Please check all required fields.';
      } else if (err?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <button className="flex items-center text-[#2c3a4b] hover:text-[#502c0a] font-semibold text-base">
            <div className="w-3 h-2 mr-2 rotate-90">
              <svg viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 4L0 0H7L3.5 4Z" fill="currentColor"/>
              </svg>
            </div>
            Back
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl text-[#09101d] mb-4">
            <span className="font-['Beth_Ellen',cursive] font-normal">Join </span>
            <span className="font-normal">AveoEarth</span>
          </h1>
          <p className="text-lg text-[#666666] mt-4">
            Start your sustainable shopping journey
          </p>
        </div>

        {/* Signup Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* First Name and Last Name Row */}
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="block px-4 py-0 mb-2">
                    <span className="text-[#09101d] text-base font-semibold opacity-80">First Name</span>
                    <span className="text-[#da1414] text-[13px] opacity-80">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50"
                      placeholder="Input"
                      required
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block px-4 py-0 mb-2">
                    <span className="text-[#09101d] text-base font-semibold opacity-80">Last Name</span>
                    <span className="text-[#da1414] text-[13px] opacity-80">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50"
                      placeholder="Input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block px-4 py-0 mb-2">
                  <span className="text-[#09101d] text-base font-semibold opacity-80">Phone Number</span>
                  <span className="text-[#da1414] text-[13px] opacity-80">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                    className="px-3 py-3 border border-[#858c94] rounded-lg bg-white text-[#09101d] focus:outline-none focus:border-[#502c0a]"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.dial_code} value={c.dial_code}>
                        {c.flag} {c.dial_code} {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', (e.target.value || '').replace(/\D/g, ''))}
                    className="flex-1 px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50"
                    placeholder="Input"
                    pattern="[0-9]{6,20}"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block px-4 py-0 mb-2">
                  <span className="text-[#09101d] text-base font-semibold opacity-80">Email Address</span>
                  <span className="text-[#da1414] text-[13px] opacity-80">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50"
                  placeholder="Input"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block px-4 py-0 mb-2">
                  <span className="text-[#09101d] text-base font-semibold opacity-80">Password</span>
                  <span className="text-[#da1414] text-[13px] opacity-80">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50"
                  placeholder="Input"
                  minLength={8}
                  required
                />
                <p className="px-4 py-0 mt-2 text-[#09101d] text-[13px] leading-[20px] opacity-60">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                </p>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 px-4">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="sr-only"
                    required
                  />
                  <div 
                    className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center cursor-pointer ${
                      formData.agreeToTerms 
                        ? 'bg-[rgba(80,44,10,0.2)] border-[#502c0a]' 
                        : 'bg-white border-[#858c94]'
                    }`}
                    onClick={() => handleInputChange('agreeToTerms', !formData.agreeToTerms)}
                  >
                    {formData.agreeToTerms && (
                      <svg className="w-3 h-3 text-[#502c0a]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                </div>
                <label htmlFor="agreeToTerms" className="text-[#09101d] text-[13px] leading-[20px] cursor-pointer">
                  I agree to AveoEarth's{" "}
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="text-[#502c0a] underline hover:text-[#502c0a]/80 font-semibold"
                  >
                    Terms of Service and Privacy Policy
                  </button>
                  . I also consent to receiving marketing communications about sustainable products and ESG insights.
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={!formData.agreeToTerms}
                  variant="secondary"
                  size="lg"
                  className="px-[54px]"
                >
                  Create Account
                </Button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-8">
              <p className="text-[#09101d] text-[13px] leading-[20px] opacity-60">
                Already have an account?{" "}
                <a href="/login" className="font-bold text-[#502c0a]">
                  Sign In Here
                </a>
              </p>
            </div>
          </div>
      </main>

      {/* Terms Modal */}
      <TermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
    </div>
  );
}
