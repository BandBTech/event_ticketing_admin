"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Eye, EyeOff, Key } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/app/services/authService";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const createChangePasswordSchema = () =>
  z
    .object({
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password is too long"),
      confirmPassword: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password is too long"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords must match",
      path: ["confirmPassword"],
    });

type ChangePasswordFormData = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;

const ChangePasswordContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOtpCode(localStorage.getItem("otpCode") || "");
    }
  }, []);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(createChangePasswordSchema()),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  interface ResetPasswordResponse {
    message: string;
  }

  const onSubmit = async (data: ChangePasswordFormData) => {
    setLoading(true);
    try {
      const res = (await resetPassword({
        email_token: email ?? "",
        reset_token: otpCode,
        new_password: data.password,
        confirm_password: data.confirmPassword,
      })) as ResetPasswordResponse;
      toast.success(res.message);
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToLogin = () => router.push("/auth/login");

  return (
    <div className="w-full max-w-md bg-white flex items-center justify-center rounded-2xl">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        <div className="mb-8 text-left">
          <h1 className="text-4xl font-poppins font-semibold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-md text-gray-500 leading-relaxed">
            Set a new password for
            <span className="text-gray-700 font-semibold ml-2">{email}</span>
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* New Password */}
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
                {...form.register("password")}
                placeholder="••••••••••••"
                className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
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
                {...form.register("confirmPassword")}
                placeholder="••••••••••••"
                className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>

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

export default function ChangePasswordPage() {
  return (
    <Suspense fallback="Loading...">
      <ChangePasswordContent />
    </Suspense>
  );
}
