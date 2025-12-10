"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function VendorLogin() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    contactPerson: "",
    phone: "",
    agreeToTerms: false
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "register") {
        // Redirect to the detailed onboarding flow
        router.push("/vendor/onboarding");
        return;
      }
      
      // Handle login
      console.log("Vendor auth data:", formData);
      
      // For now, just redirect to dashboard
      router.push("/vendor/dashboard");
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-gray-900">AveoEarth</span>
            <span className="text-sm text-gray-500 ml-2">Vendor Portal</span>
          </Link>
          
          <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
            </svg>
            Back to Marketplace
          </Link>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏪</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <span className="font-['Beth_Ellen',cursive] font-normal">Welcome</span> Vendor
          </h1>
          <p className="text-gray-600">
            {mode === "login" 
              ? "Sign in to your vendor account" 
              : "Join AveoEarth as a sustainable vendor"
            }
          </p>
        </div>

        {/* Auth Form */}
        <Card>
          <CardContent className="p-6">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  mode === "login"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  mode === "register"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleChange("businessName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your business name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleChange("contactPerson", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="vendor@business.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Create a secure password"
                  required
                />
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              )}

              {mode === "register" && (
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleChange("agreeToTerms", e.target.checked)}
                    className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link href="/vendor/terms" className="text-green-600 hover:text-green-700">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/vendor/privacy" className="text-green-600 hover:text-green-700">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}

              <Button type="submit" className="w-full">
                {mode === "login" ? "Sign In" : "Start Registration Process"}
              </Button>
              
              {mode === "register" && (
                <div className="mt-3">
                  <Link href="/vendor/onboarding">
                    <Button variant="outline" className="w-full">
                      Direct Registration (Recommended)
                    </Button>
                  </Link>
                </div>
              )}
            </form>

            {mode === "login" && (
              <div className="mt-4 text-center">
                <Link href="/vendor/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                  Forgot your password?
                </Link>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <Link href="/vendor/support" className="text-green-600 hover:text-green-700">
                  Contact Vendor Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section for Registration */}
        {mode === "register" && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Why Sell on AveoEarth?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">🌱</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Sustainable Focus</div>
                    <div className="text-sm text-gray-600">Reach eco-conscious customers</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">📊</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Analytics & Insights</div>
                    <div className="text-sm text-gray-600">Track your performance</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600">💰</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Competitive Fees</div>
                    <div className="text-sm text-gray-600">Low transaction costs</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
