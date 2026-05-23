"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import {
  EyeIcon,
  KeyIcon,
  EyeClosedIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService, AuthError } from "@/services/authService";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordRequirements } from "@/app/components/PasswordRequirements";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validation";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.title = `${t("webTitle.resetPassword")} | Timro-Ticket`;
  }, [locale]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const otpParam = searchParams.get("otp");

    if (!emailParam || !otpParam) {
      // Redirect to forgot password if email or OTP is missing
      router.push("/auth/forgot-password");
      return;
    }

    setEmail(emailParam);
    setOtp(otpParam);
  }, [searchParams, router]);

    // Use centralized schema with memoization
  const schema = useMemo(
    () => resetPasswordSchema((key, fallback, params) => key),
    [],
  );

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError("");

    try {
      await authService.resetPassword({
        otp: otp,
        email_token: email,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });

      // Show success toast
      toast.success(
        "auth.toast.passwordResetSuccess",
        "Password reset successful!",
      );

      setIsSuccess(true);

      // Redirect to login immediately
      router.push("/auth/login");
    } catch (err) {
      // Show error toast
      if (err instanceof AuthError) {
        toast.error(
          "auth.toast.serverError",
          err.message || "Failed to reset password. Please try again.",
        );
      } else {
        toast.error(
          "auth.toast.serverError",
          "Failed to reset password. Please try again.",
        );
      }
    } finally {
      sessionStorage.removeItem("password_reset_email");
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-700">
              {t("common.loader.resettingPassword")}
            </p>
          </div>
        </div>
      )}
      <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-8 sm:py-20">
        <div className="w-full max-w-[480px] relative z-10">
          <div className="relative">
            <div className="glass-login-card rounded-2xl p-4 sm:p-6">
              <div className="space-y-6 p-2 sm:p-3">
                {/* Back Button */}
                {/* <Link
                href="/forgot-password"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeftIcon size={16} />
                {t("auth.resetPassword.back", "Back")}
              </Link> */}

                {/* Header */}
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                    {t("auth.resetPassword.title", "Reset Password")}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {t("auth.resetPassword.subtitle", "Set a new password for")}{" "}
                    <strong>{email}</strong>
                  </p>
                </div>

                {isSuccess ? (
                  /* Success Message */
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-sm text-green-700 text-center">
                        {t(
                          "auth.resetPassword.successMessage",
                          "Password reset successful! Redirecting to login...",
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Error Message */}
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    {/* Form */}
                    <Form {...form}>
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-900">
                                {t(
                                  "auth.resetPassword.newPassword",
                                  "New Password",
                                )}
                              </FormLabel>
                              <FormControl>
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
                                    type={showNewPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder={t(
                                      "auth.login.passwordPlaceholder",
                                      "••••••••••••",
                                    )}
                                    className={cn(
                                      "h-12 pl-16 pr-16 login-input",
                                      form.formState.errors.newPassword &&
                                        "border-destructive",
                                    )}
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowNewPassword(!showNewPassword)
                                    }
                                    // disabled={loginMutation.isPending}
                                    aria-label={
                                      showNewPassword
                                        ? t(
                                            "auth.login.hidePassword",
                                            "Hide password",
                                          )
                                        : t(
                                            "auth.login.showPassword",
                                            "Show password",
                                          )
                                    }
                                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors disabled:cursor-not-allowed"
                                  >
                                    {showNewPassword ? (
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
                              </FormControl>
                               {/* {form.formState.errors.newPassword &&
                                form.formState.errors.newPassword.message !==
                                  "Invalid input" &&
                                !form.formState.errors.newPassword.message?.includes(
                                  "must be at least 8 characters",
                                ) &&
                                !form.formState.errors.newPassword.message?.includes(
                                  "uppercase and one lowercase",
                                ) &&
                                !form.formState.errors.newPassword.message?.includes(
                                  "special character",
                                ) &&
                                !form.formState.errors.newPassword.message?.includes(
                                  "numeric digit",
                                ) && <TranslatedFormMessage t={t} />} */}
                              <PasswordRequirements
                                password={form.watch("newPassword")}
                              />
                            </FormItem>
                          )}
                        />

                        {/* Confirm Password Field */}
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-900">
                                {t(
                                  "auth.resetPassword.confirmPassword",
                                  "Confirm Password",
                                )}
                              </FormLabel>
                              <FormControl>
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
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    autoComplete="confirm-password"
                                    placeholder={t(
                                      "auth.login.passwordPlaceholder",
                                      "••••••••••••",
                                    )}
                                    className={cn(
                                      "h-12 pl-16 pr-16 login-input",
                                      form.formState.errors.confirmPassword &&
                                        "border-destructive",
                                    )}
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword,
                                      )
                                    }
                                    aria-label={
                                      showConfirmPassword
                                        ? t(
                                            "auth.login.hidePassword",
                                            "Hide password",
                                          )
                                        : t(
                                            "auth.login.showPassword",
                                            "Show password",
                                          )
                                    }
                                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors disabled:cursor-not-allowed"
                                  >
                                    {showConfirmPassword ? (
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
                              </FormControl>
                              <TranslatedFormMessage t={t} />
                            </FormItem>
                          )}
                        />

                        {/* Submit Button */}
                        <div className="space-y-4 pt-2">
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                              "w-full h-12 rounded-lg font-medium transition-all duration-200",
                              "bg-blue-600 hover:bg-blue-700 text-white",
                              "shadow-lg hover:shadow-xl",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              isLoading && "animate-pulse",
                            )}
                          >
                            {isLoading
                              ? t(
                                  "auth.resetPassword.resetting",
                                  "Resetting...",
                                )
                              : t(
                                  "auth.resetPassword.resetButton",
                                  "Reset Password",
                                )}
                          </Button>
                        </div>
                      </form>
                    </Form>

                    {/* Back to Login */}
                    <div className="text-center">
                      <Link
                        href="/auth/login"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {t("auth.resetPassword.backToLogin", "Back to login")}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          {t("common.loading", "Loading...")}
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
