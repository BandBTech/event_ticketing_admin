"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  EyeIcon,
  EyeClosedIcon,
  KeyIcon,
  ArrowsClockwise as ArrowsClockwiseIcon,
  UserIcon,
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
import { authService } from "@/services/authService";
import { AuthError } from "@/services/authService";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { createValidationHelpers } from "@/lib/validation";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { PasswordRequirements } from "@/app/components/PasswordRequirements";

// Validation schema
const createChangePasswordSchema = (
  t: (key: string, fallback?: string) => string,
) => {
  const v = createValidationHelpers(t);

  return z
    .object({
      currentPassword: z
        .string()
        .min(1, "settings.security.validation.currentPasswordRequired"),
      newPassword: z
        .string()
        .min(1, "settings.security.validation.newPasswordRequired")
        .min(8, "settings.security.validation.newPasswordTooShort")
        .max(50, "settings.security.validation.newPasswordTooLong")
        .regex(/(?=.*[a-z])(?=.*[A-Z])/)
        .regex(/[^A-Za-z0-9]/)
        .regex(/[0-9]/),
      confirmPassword: z
        .string()
        .min(1, "settings.security.validation.confirmPasswordRequired"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "settings.security.validation.passwordMismatch",
      path: ["confirmPassword"],
    });
};

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = createChangePasswordSchema(t);
  type ChangePasswordFormData = z.infer<typeof schema>;

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = form;

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });

      // Password changed successfully, now logout and redirect
      toast.success(
        "settings.security.passwordChangedSuccessfully",
        "Password changed successfully",
        t("auth.toast.passwordChangedLogin"),
      );

      // Use setTimeout to ensure toast is shown before logout
      setTimeout(async () => {
        await logout();
        router.push("/auth/login");
      }, 500);
    } catch (error) {
      setIsLoading(false);
      if (error instanceof AuthError) {
        toast.error(
          "",
          error.message || "Failed to change password",
          error.details,
        );
      } else {
        toast.error(
          "auth.toast.passwordChangeFailed",
          "Failed to change password",
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          {t("settings.security.title", "Security Settings")}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {t(
            "settings.security.subtitle",
            "Manage your password and authentication",
          )}
        </p>
      </div>

      {/* Change Password Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("settings.security.changePassword", "Change Password")}
            </h2>
            <p className="text-sm text-gray-600">
              {t(
                "settings.security.changePasswordDesc",
                "Update your password regularly to keep your account secure",
              )}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <div>
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel
                      required
                      className="text-sm font-semibold text-gray-700"
                    >
                      {t(
                        "settings.security.currentPassword",
                        "Current Password",
                      )}
                    </FormLabel>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600">
                        <KeyIcon
                          weight="duotone"
                          size={18}
                          className="text-gray-600"
                        />
                      </div>
                      <FormControl>
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder={t(
                            "settings.security.currentPasswordPlaceholder",
                            "Enter current password",
                          )}
                          maxLength={50}
                          className={cn(
                            "h-11 pl-11 pr-12",
                            errors.currentPassword && "border-destructive",
                          )}
                          disabled={isLoading}
                          {...register("currentPassword")}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showCurrentPassword ? (
                          <EyeIcon
                            size={18}
                            className="text-gray-600"
                            weight="duotone"
                          />
                        ) : (
                          <EyeClosedIcon
                            size={18}
                            className="text-gray-600"
                            weight="duotone"
                          />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between items-start min-h-[1.25rem] px-1">
                      <div className="flex-1">
                        <TranslatedFormMessage t={t} />
                      </div>
                      <p className="text-xs font-normal text-muted-foreground shrink-0 ml-2">
                        {field.value?.toString().length ?? 0}/50{" "}
                        {t("common.characters", "characters")}
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* New Password */}
            <div>
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel
                      required
                      className="text-sm font-semibold text-gray-700"
                    >
                      {t("settings.security.newPassword", "New Password")}
                    </FormLabel>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600">
                        <KeyIcon
                          weight="duotone"
                          size={18}
                          className="text-gray-600"
                        />
                      </div>
                      <FormControl>
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder={t(
                            "settings.security.newPasswordPlaceholder",
                            "Enter new password",
                          )}
                          maxLength={50}
                          className={cn(
                            "h-11 pl-11 pr-12",
                            errors.newPassword && "border-destructive",
                          )}
                          disabled={isLoading}
                          {...register("newPassword")}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showNewPassword ? (
                          <EyeIcon
                            size={18}
                            className="text-gray-600"
                            weight="duotone"
                          />
                        ) : (
                          <EyeClosedIcon
                            size={18}
                            className="text-gray-600"
                            weight="duotone"
                          />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between items-start min-h-[1.25rem] px-1">
                      <div className="flex-1">
                        <TranslatedFormMessage t={t} />
                      </div>
                      <p className="text-xs font-normal text-muted-foreground shrink-0 ml-2">
                        {field.value?.toString().length ?? 0}/50{" "}
                        {t("common.characters", "characters")}
                      </p>
                    </div>
                    <PasswordRequirements password={watch("newPassword")} />
                  </FormItem>
                )}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel
                      required
                      className="text-sm font-semibold text-gray-700"
                    >
                      {t(
                        "settings.security.confirmPassword",
                        "Confirm New Password",
                      )}
                    </FormLabel>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600">
                        <KeyIcon
                          weight="duotone"
                          size={18}
                          className="text-gray-600"
                        />
                      </div>
                      <FormControl>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder={t(
                            "settings.security.confirmPasswordPlaceholder",
                            "Enter new password again",
                          )}
                          maxLength={50}
                          className={cn(
                            "h-11 pl-11 pr-12",
                            errors.confirmPassword && "border-destructive",
                          )}
                          disabled={isLoading}
                          {...register("confirmPassword")}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeIcon
                            size={18}
                            className="text-gray-600"
                            weight="duotone"
                          />
                        ) : (
                          <EyeClosedIcon
                            size={18}
                            className="text-gray-600"
                            weight="duotone"
                          />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between items-start min-h-[1.25rem] px-1">
                      <div className="flex-1">
                        <TranslatedFormMessage t={t} />
                      </div>
                      <p className="text-xs font-normal text-muted-foreground shrink-0 ml-2">
                        {field.value?.toString().length ?? 0}/50{" "}
                        {t("common.characters", "characters")}
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading
                  ? t("settings.security.updating", "Updating...")
                  : t("settings.security.updateButton", "Update Password")}
              </Button>
              <Button
                type="button"
                onClick={() => reset()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600"
              >
                {t("common.cancelButton", "Cancel")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
