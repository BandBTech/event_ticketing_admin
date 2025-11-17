"use client";

import React, { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { verifyOtp } from "@/app/services/authService";
import { resendOTP } from "@/app/services/authService";
import { useSearchParams } from "next/navigation";

const VerifyOTPPageContent: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  interface VerifyOTPResponse {
    message: string;
  }
  interface ResendOTPResponse {
    message: string;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    localStorage.setItem("otpCode", otpCode);
    setLoading(true);

    const payload = {
      identifier: email ?? "",
      otp_code: otpCode,
      otp_type: "registration",
    };
    try {
      const data = (await verifyOtp({ ...payload })) as VerifyOTPResponse;
      toast.success(data.message);
      router.push(`/auth/login`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendLoading(true);

    const payload = {
      identifier: email ?? "",
      otp_type: "registration",
    };
    try {
      const data = (await resendOTP({ ...payload })) as ResendOTPResponse;
      toast.success(data.message);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white flex items-center justify-center rounded-2xl">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-poppins font-semibold text-gray-900 mb-4">
            Verify your email
          </h1>
          <p className="text-md text-gray-500 leading-relaxed">
            Enter the 6-digit code sent to <br />
            <span className="text-gray-700 font-semibold">{email}</span> <br />
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 border border-gray-200 rounded-lg text-center text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="•"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center grid">
            <span className="text-sm text-gray-600">
              Haven&apos;t got the email yet?{" "}
              <button
                type="button"
                onClick={handleResendEmail}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
              >
                {resendLoading ? "Resendiing..." : "Resend"}
              </button>
            </span>
            <span className="text-sm text-gray-500">
              Check your spam folder if you don&apos;t see the email
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function VerifyOTPPage() {
  return (
    <Suspense fallback="Loading...">
      <VerifyOTPPageContent />
    </Suspense>
  );
}
