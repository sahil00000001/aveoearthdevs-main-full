"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, tokens } from "../../lib/api";
import { useRouter } from "next/navigation";
import { countryCodes } from "../../lib/countryCodes";
import Button from "../ui/Button";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState("email"); // 'email' | 'phone'
  const [formData, setFormData] = useState({ email: "", phone: "", password: "", remember: false });
  const [dialCode, setDialCode] = useState("+91");

  const handleChange = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result =
        mode === "email"
          ? await auth.login(formData.email, formData.password)
          : await auth.loginPhone(`${dialCode}${(formData.phone || '').replace(/\s+/g, '')}`, formData.password);
      
      if (result?.tokens) {
        tokens.set(result.tokens);
        
        // Fetch and log user profile details
        try {
          const profile = await auth.getProfile(result.tokens.access_token);
          console.log("User Profile Details:", {
            userId: result.user?.id,
            email: result.user?.email,
            phone: result.user?.phone,
            userMetadata: result.user?.user_metadata,
            profile: profile
          });
          
          // Redirect based on user type
          const userType = result.user?.user_metadata?.user_type || profile?.user_type;
          if (userType === 'supplier' || userType === 'seller') {
            // Redirect to onboarding page which will check profile completion
            // and redirect to dashboard if already complete
            router.push("/vendor/onboarding");
          } else {
            router.push("/");
          }
        } catch (profileError) {
          console.log("Failed to fetch profile:", profileError.message);
          // Still log basic user info from login response
          console.log("Basic User Info:", {
            userId: result.user?.id,
            email: result.user?.email,
            phone: result.user?.phone,
            userMetadata: result.user?.user_metadata
          });
          
          // Fallback redirect based on user metadata
          const userType = result.user?.user_metadata?.user_type;
          if (userType === 'supplier' || userType === 'seller') {
            // Redirect to onboarding page which will check profile completion
            // and redirect to dashboard if already complete
            router.push("/vendor/onboarding");
          } else {
            router.push("/");
          }
        }
      }
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/signup" className="flex items-center text-[#2c3a4b] hover:text-[#502c0a] font-semibold text-base">
            <div className="w-3 h-2 mr-2 rotate-90">
              <svg viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 4L0 0H7L3.5 4Z" fill="currentColor"/>
              </svg>
            </div>
            Back
          </Link>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl text-[#09101d] mb-4">
            <span className="font-['Beth_Ellen',cursive] font-normal">Welcome </span>
            <span className="font-normal">back</span>
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-black mb-6 text-[#09101d]">Sign In</h1>
          <div className="flex items-center gap-3 mb-4">
            <Button
              type="button"
              onClick={() => setMode("email")}
              variant={mode === "email" ? "primary" : "outline"}
              size="sm"
            >
              Email login
            </Button>
            <Button
              type="button"
              onClick={() => setMode("phone")}
              variant={mode === "phone" ? "primary" : "outline"}
              size="sm"
            >
              Phone login
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "email" ? (
              <div>
                <label className="block px-4 py-0 mb-2">
                  <span className="text-[#09101d] text-base font-semibold opacity-80">Email</span>
                  <span className="text-[#da1414] text-[13px] opacity-80">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50"
                  placeholder="you@example.com"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block px-4 py-0 mb-2">
                  <span className="text-[#09101d] text-base font-semibold opacity-80">Phone</span>
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
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", (e.target.value || '').replace(/\D/g, ''))}
                    className="flex-1 px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50"
                    placeholder="Enter phone number"
                    pattern="[0-9]{6,20}"
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block px-4 py-0 mb-2">
                <span className="text-[#09101d] text-base font-semibold opacity-80">Password</span>
                <span className="text-[#da1414] text-[13px] opacity-80">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex items-center justify-between px-4">
              <label className="inline-flex items-center gap-2 text-sm text-[#09101d] opacity-60">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) => handleChange("remember", e.target.checked)}
                    className="sr-only"
                  />
                  <div 
                    className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center cursor-pointer ${
                      formData.remember 
                        ? 'bg-[rgba(80,44,10,0.2)] border-[#502c0a]' 
                        : 'bg-white border-[#858c94]'
                    }`}
                    onClick={() => handleChange("remember", !formData.remember)}
                  >
                    {formData.remember && (
                      <svg className="w-3 h-3 text-[#502c0a]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                </div>
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm text-[#502c0a] hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="px-[54px]"
              >
                Sign In
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-[#09101d] text-[13px] leading-[20px] opacity-60">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-bold text-[#502c0a]">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
