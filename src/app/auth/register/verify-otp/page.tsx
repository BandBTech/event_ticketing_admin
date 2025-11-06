"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { verifyOtp } from "@/app/services/authService";

const VerifyOTPPage: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [passwordResetEmail, setPasswordResetEmail] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPasswordResetEmail(localStorage.getItem("registrationEmail") || "");
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    localStorage.setItem("otpCode", otpCode);
    setLoading(true);

    const payload = {
      identifier: passwordResetEmail,
      otp_code: otpCode,
      otp_type: "registration",
    };
    try {
      const data = (await verifyOtp({ ...payload })) as VerifyOTPResponse;
      toast.success(data.message);
      localStorage.setItem("passwordResetEmail", passwordResetEmail);
      router.push(`/auth/login`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = () => {
    console.log("Resend email clicked");
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-poppins font-semibold text-gray-900 mb-4">
            Verify your email
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            We sent a reset link to <br />
            <span className="text-gray-700">{passwordResetEmail}</span> <br />
            Enter the 6-digit code mentioned in <br />
            the email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Fields */}
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

          {/* Verify OTP Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Resend Email Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Haven&apos;t got the email yet?{" "}
              <button
                type="button"
                onClick={handleResendEmail}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
              >
                Resend email
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
