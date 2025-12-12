"use client";

import React, { useState } from "react";
import Navbar from "@/app/components/Navbar/Navbar";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { useLanguageStore } from "@/store/languageStore";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";
import { toast } from "@/lib/toast";
import {
  EyeIcon,
  EnvelopeIcon,
  KeyIcon,
  EyeClosedIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { createValidationHelpers } from "@/lib/validation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/hooks/useTranslation";
import { AuthError } from "@/lib/authService";
import { OrganizerService } from "@/lib/organizerService";
import { useRouter } from "next/navigation";

const createBasicInfoSchema = (
  t: (key: string, fallback?: string) => string
) => {
  const v = createValidationHelpers(t);

  return z.object({
    firstName: z
      .string()
      .min(1, v.required("First name"))
      .min(3, v.minLength("First name", 3))
      .max(50, v.maxLength("First name", 50)),
    lastName: z
      .string()
      .min(1, v.required("Last name"))
      .min(3, v.minLength("Last name", 3))
      .max(50, v.maxLength("Last name", 50)),
    email: z.string().min(1, v.required("Email")).email(v.email("Email")),
    password: z.string().min(1, v.required("Password")),
    phone: z
      .string()
      .min(1, v.required("Contact number"))
      .refine((val) => isValidPhoneNumber(val), v.phone("Phone")),
  });
};

export default function AddOrganizerPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const defaultCountry = "NP";

  const onBasicInfoSubmit = async (data: BasicInfoData) => {
    try {
      const phoneNumber = parsePhoneNumber(data.phone);
      const countryCode = phoneNumber?.countryCallingCode
        ? `+${phoneNumber.countryCallingCode}`
        : undefined;
      const phone = phoneNumber?.nationalNumber || data.phone;

      const payload = {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: phone,
        password: data.password,
        country_code: countryCode,
      };

      await OrganizerService.createOrganizer(payload);

      toast.success(
        "auth.toast.otpSent",
        "Verification code sent to your email"
      );
      router.push("/organisers");
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(
          "",
          error.message || "Registration failed. Please try again.",
          error.details
        );
      } else {
        toast.error("", "Registration failed. Please try again.");
      }
    } finally {
    }
  };

  const basicInfoSchema = createBasicInfoSchema(t);
  type BasicInfoData = z.infer<typeof basicInfoSchema>;

  const basicInfoForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
    },
    mode: "onChange",
  });

  const {
    formState: { errors },
  } = basicInfoForm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div>
        <Navbar title="Create Organiser" addMessage="" handleOpen={() => {}} />
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Basic Information Section */}
          <div className="border-b border-gray-200">
            <button className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">
                Basic Information
              </h3>
            </button>
          </div>

          <form
            onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)}
            className="px-6 pb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* First Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="first_name"
                  className="text-sm font-medium text-gray-900 block"
                >
                  {/* {t("auth.login.email")} */}
                  First Name
                </label>
                <div className="relative">
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                    aria-hidden="true"
                  >
                    <UserIcon
                      weight="duotone"
                      size={24}
                      className="text-gray-600"
                    />
                  </div>
                  <Input
                    id="first_name"
                    type="text"
                    autoComplete="first_name"
                    placeholder="Enter First Name"
                    className={cn(
                      "h-12 pl-16 pr-4 login-input",
                      errors.firstName && "border-destructive"
                    )}
                    {...basicInfoForm.register("firstName")}
                  />
                </div>
                {errors.firstName && (
                  <p
                    className="text-sm text-destructive font-medium"
                    role="alert"
                  >
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="last_name"
                  className="text-sm font-medium text-gray-900 block"
                >
                  {/* {t("auth.login.email")} */}
                  Last Name
                </label>
                <div className="relative">
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                    aria-hidden="true"
                  >
                    <UserIcon
                      weight="duotone"
                      size={24}
                      className="text-gray-600"
                    />
                  </div>
                  <Input
                    id="last_name"
                    type="text"
                    autoComplete="last_name"
                    placeholder="Enter Last Name"
                    className={cn(
                      "h-12 pl-16 pr-4 login-input",
                      errors.lastName && "border-destructive"
                    )}
                    {...basicInfoForm.register("lastName")}
                  />
                </div>
                {errors.lastName && (
                  <p
                    className="text-sm text-destructive font-medium"
                    role="alert"
                  >
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900 block"
                >
                  {/* {t("auth.login.email")} */}
                  Email Address
                </label>
                <div className="relative">
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                    aria-hidden="true"
                  >
                    <EnvelopeIcon
                      weight="duotone"
                      size={24}
                      className="text-gray-600"
                    />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter Email Address"
                    className={cn(
                      "h-12 pl-16 pr-4 login-input",
                      errors.email && "border-destructive"
                    )}
                    {...basicInfoForm.register("email")}
                  />
                </div>
                {errors.email && (
                  <p
                    className="text-sm text-destructive font-medium"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-900 block"
                >
                  {t("auth.login.password")}
                </label>
                <div className="relative">
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                    aria-hidden="true"
                  >
                    <KeyIcon
                      weight="duotone"
                      size={24}
                      className="text-gray-600"
                    />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    className={cn(
                      "h-12 pl-16 pr-16 login-input",
                      errors.password && "border-destructive"
                    )}
                    {...basicInfoForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? t("auth.login.hidePassword")
                        : t("auth.login.showPassword")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeIcon
                        weight="duotone"
                        size={24}
                        className="text-gray-600"
                      />
                    ) : (
                      <EyeClosedIcon
                        weight="duotone"
                        size={24}
                        className="text-gray-600"
                      />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    className="text-sm text-destructive font-medium"
                    role="alert"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div className="mt-4">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-900 block"
              >
                {t("auth.signup.phone", "Contact Number")}
              </label>
              <Controller
                name="phone"
                control={basicInfoForm.control}
                render={({ field }) => (
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    defaultCountry={defaultCountry}
                    placeholder={t(
                      "auth.signup.phonePlaceholder",
                      "981-234-5678"
                    )}
                    className={cn(
                      basicInfoForm.formState.errors.phone &&
                        "border-destructive"
                    )}
                  />
                )}
              />
              {basicInfoForm.formState.errors.phone && (
                <p className="text-sm text-destructive font-medium">
                  {basicInfoForm.formState.errors.phone.message}
                </p>
              )}
            </div>
            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between">
                <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Create Organizer
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
