"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/app/services/authService";
import { toast } from "react-hot-toast";

interface ForgotPasswordResponse {
  message: string;
}

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = (await forgotPassword({ email })) as ForgotPasswordResponse;
      toast.success(data.message);
      localStorage.setItem("passwordResetEmail", email);
      router.push(`/auth/verify-otp`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
        setError(err.message);
      } else {
        toast.error(error || "Something went wrong");
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="w-full max-w-md bg-white flex items-center justify-center rounded-2xl">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-left">
          <h1 className="text-4xl font-poppins font-semibold text-gray-900">
            Forgot Password
          </h1>
          <p className="text-gray-500 text-md mt-1">
            Enter your email to receive a password reset code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-900 mb-3"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter email address"
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>

          {/* Reset Password Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-4 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          >
            {loading ? "Loading..." : "Reset Password"}
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

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
