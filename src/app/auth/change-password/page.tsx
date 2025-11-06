"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Key } from "lucide-react";
import { redirect } from "next/navigation";
import { resetPassword } from "@/app/services/authService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const ChangePasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPasswordResetEmail(localStorage.getItem("passwordResetEmail") || "");
      setOtpCode(localStorage.getItem("otpCode") || "");
    }
  }, []);

  interface ResetPasswordResponse {
    message: string;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      email_token: passwordResetEmail,
      reset_token: otpCode,
      new_password: password,
      confirm_password: confirmPassword,
    };

    try {
      const data = (await resetPassword({
        ...payload,
      })) as ResetPasswordResponse;
      toast.success(data.message);
      localStorage.setItem("passwordResetEmail", passwordResetEmail);
      router.push(`/auth/login`);
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToLogin = () => {
    // Handle navigation back to login page
    console.log("Return to login page");
    redirect("/auth/login");
  };

  return (
    <div className="w-full max-w-md bg-white flex items-center justify-center rounded-2xl">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-left">
          <h1 className="text-4xl font-poppins font-semibold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-md text-gray-500 leading-relaxed">
            Set a new password for
            <span className="text-gray-700 font-semibold ml-2">{passwordResetEmail}</span> <br />
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-900 mb-3"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-900 mb-3"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
                )}
              </button>
            </div>
          </div>

          {/* Update Password Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>

          {/* Return to Login Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleReturnToLogin}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
            >
              Return to login page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
