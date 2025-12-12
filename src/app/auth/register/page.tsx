"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Key,
  ChevronDown,
  X,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import * as z from "zod";
import "react-phone-number-input/style.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import { createRegisterSchema } from "@/app/lib/validations/authValidation";

const RegisterPage: React.FC = () => {
  const [countryCode, setCountryCode] = useState("JP(+81)");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const translate = (key: string, fallback?: string) =>
    t(key, { defaultValue: fallback });

  const registerSchema = createRegisterSchema(translate);
  type RegisterFormData = z.infer<typeof registerSchema>;

  const countryCodes = [
    "JP(+81)",
    "US(+1)",
    "UK(+44)",
    "IN(+91)",
    "CN(+86)",
    "AU(+61)",
  ];

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      countryCode,
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: RegisterFormData) => {
    setLoading(true);

    const payload = {
      country_code: data.countryCode,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      password: data.password,
    };

    

    try {
      router.push(
        `/auth/register/verify-otp?email=${encodeURIComponent(
          data.email
        )}&type=registration`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSignInAsOrganizer = () => {
    // Navigate to login
    redirect("/auth/login");
  };

  return (
    <div className="w-full max-w-md bg-white flex items-center justify-center my-5 rounded-2xl">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-gray-900 mb-1">
            Register{" "}
            <span className="text-blue-600 text-[16px] font-medium">
              as Admin
            </span>
          </h1>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Name Field */}
          <div className="flex gap-5">
            {/* First Name Field  */}
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-semibold text-gray-900 mb-3"
              >
                First Name
              </label>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="first_name"
                    id="first_name"
                    {...form.register("firstName")}
                    placeholder="John"
                    className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm mt-2 ml-4">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
            </div>
            {/* Last Name Field  */}
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-semibold text-gray-900 mb-3"
              >
                Last Name
              </label>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...form.register("lastName")}
                    placeholder="Doe"
                    className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm mt-2 ml-4">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-900 mb-3"
            >
              Email
            </label>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...form.register("email")}
                  placeholder="Enter email"
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-2 ml-4">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Contact Number Field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-900 mb-3"
            >
              Contact Number
            </label>
            <div className="flex space-x-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center justify-between w-32 px-3 py-4 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{countryCode}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {showCountryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                    {countryCodes.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setCountryCode(code);
                          form.setValue("countryCode", code);
                          setShowCountryDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm">{code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <input
                  {...form.register("phone")}
                  placeholder="XX-XXX-XXX"
                  value={form.watch("phone")}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    form.setValue("phone", numericValue);
                  }}
                  className="block w-full pl-4 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                {form.formState.errors.phone && (
                  <p className="text-red-500 text-sm mt-2 ml-4">
                    {form.formState.errors.phone.message}
                  </p>
                )}

                {phone && (
                  <button
                    type="button"
                    aria-label="Clear phone number"
                    onClick={() => setPhone("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                )}
              </div>
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
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  placeholder="••••••••••••"
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-2 ml-4">
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

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-900 mb-3"
            >
              Confirm Password
            </label>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...form.register("confirmPassword")}
                  placeholder="••••••••••••"
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2 ml-4">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Get Started Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center cursor-pointer"
          >
            {loading ? "Registering..." : "Get Started"}
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Sign In Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={handleSignInAsOrganizer}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
              >
                Sign in as Admin
              </button>
            </span>
          </div>
        </form>

        {/* Terms and Conditions */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By continuing, you consent to the fact that you have read and <br />
            understood our{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              terms and conditions
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              privacy policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
