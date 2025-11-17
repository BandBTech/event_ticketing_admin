"use client";

import React, { useState } from "react";
import * as z from "zod";
import { useTranslation } from "next-i18next";
import { Eye, EyeOff, Mail, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { login } from "@/app/services/authService";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const createLoginSchema = (t: (key: string, fallback?: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t("Email is required"))
      .email(t("Invalid email address")),
    password: z
      .string()
      .min(6, t("Password is too short"))
      .max(100, t("Password is too long")),
    rememberMe: z.boolean(),
  });

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  const translate = (key: string, fallback?: string) =>
    t(key, { defaultValue: fallback });

  const loginSchema = createLoginSchema(translate);
  type LoginFormData = z.infer<typeof loginSchema>;

  const handleRedirectForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onBlur",
  });

  const handleRedirectRegister = () => {
    router.push("/auth/register");
  };
  const handleSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const response = await login(data);
      localStorage.setItem("token", response.token);
      toast.success(response.message);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white flex items-center justify-center rounded-2xl">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-poppins font-semibold text-gray-900 mb-1">
            Login{" "}
            <span className="text-blue-600 text-[16px] font-medium">
              as Admin
            </span>
          </h1>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-900 mb-3"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                {...form.register("email")}
                placeholder="Enter email address"
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-900 mb-3"
            >
              Password
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
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                {...form.register("rememberMe")}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />

              <label
                htmlFor="remember-me"
                className="ml-3 text-sm font-semibold text-gray-900"
              >
                Remember Me
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
              onClick={handleRedirectForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
                onClick={handleRedirectRegister}
              >
                Sign up here.
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
