"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, tokens } from "../../lib/api";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const valid = form.password.length >= 8 && form.password === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    
    setIsLoading(true);
    setError("");
    setMessage("");
    
    try {
      const userTokens = tokens.get();
      if (!userTokens?.access_token) {
        setError("You must be logged in to reset your password");
        return;
      }
      
      const result = await auth.resetPassword(form.password, userTokens.access_token);
      setMessage(result?.message || "Password updated successfully");
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <span className="font-['Beth_Ellen',cursive] font-normal">Reset </span>
            <span className="font-normal">password</span>
          </h1>
          <p className="text-[#09101d] opacity-60 text-base">Set a new password for your account.</p>
        </div>

        <div className="max-w-md mx-auto">
          
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block px-4 py-0 mb-2">
                <span className="text-[#09101d] text-base font-semibold opacity-80">New password</span>
                <span className="text-[#da1414] text-[13px] opacity-80">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50 disabled:opacity-50"
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div>
              <label className="block px-4 py-0 mb-2">
                <span className="text-[#09101d] text-base font-semibold opacity-80">Confirm password</span>
                <span className="text-[#da1414] text-[13px] opacity-80">*</span>
              </label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => handleChange("confirm", e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-[#858c94] rounded-lg text-[#09101d] text-base font-semibold focus:outline-none focus:border-[#502c0a] placeholder:opacity-50 disabled:opacity-50"
                placeholder="Re-enter your password"
                required
              />
              {form.confirm && form.password !== form.confirm && (
                <p className="px-4 py-0 mt-2 text-[#da1414] text-[13px] leading-[20px]">Passwords do not match.</p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit" 
                className="bg-[#502c0a] text-white px-[54px] py-4 rounded-[62px] text-base font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!valid || isLoading}
              >
                {isLoading ? "Updating..." : "Update password"}
              </button>
            </div>
            
            {/* Back to Login Link */}
            <div className="text-center">
              <p className="text-[#09101d] text-[13px] leading-[20px] opacity-60">
                Changed your mind?{" "}
                <Link href="/login" className="font-bold text-[#502c0a]">
                  Back to login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
