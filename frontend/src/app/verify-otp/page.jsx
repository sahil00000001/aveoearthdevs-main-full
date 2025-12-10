"use client";
import { Suspense } from "react";
import OTPVerification from "../../components/forms/OTPVerification";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "../../lib/api";

function VerifyOTPContent() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") || "";
  
  return (
    <div>
      <OTPVerification
        onVerify={async (code) => {
          try {
            if (!phone) throw new Error("Missing phone number");
            await auth.verifyOtp(phone, code);
            router.push("/login");
          } catch (err) {
            alert(err.message || "Invalid or expired OTP");
          }
        }}
      />
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-b-xl border border-[#858c94] p-4 text-center">
          <p className="text-sm text-[#09101d] opacity-60 mb-3">Didn't get the code for {phone || "your phone"}?</p>
          <button
            className="bg-white text-[#502c0a] border border-[#502c0a] px-6 py-2 rounded-[62px] text-sm font-medium hover:bg-[rgba(80,44,10,0.1)] transition-colors"
            onClick={async () => {
              try {
                if (!phone) throw new Error("Missing phone number");
                await auth.sendOtp(phone);
                alert("OTP resent via WhatsApp");
              } catch (err) {
                alert(err.message || "Failed to resend OTP");
              }
            }}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
