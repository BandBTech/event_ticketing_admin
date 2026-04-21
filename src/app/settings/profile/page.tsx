"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { AuthError } from "@/services/authService";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";

// Validation schema
const createProfileSchema = () => {
  return z.object({
    firstName: z
      .string()
      .min(1, "settings.profile.validation.firstNameRequired")
      .min(3, "settings.profile.validation.firstNameMinLength")
      .max(50, "settings.profile.validation.firstNameMaxLength"),
    lastName: z
      .string()
      .min(1, "settings.profile.validation.lastNameRequired")
      .min(3, "settings.profile.validation.lastNameMinLength")
      .max(50, "settings.profile.validation.lastNameMaxLength"),
    phone: z
      .string()
      .min(1, "settings.profile.validation.phoneRequired")
      .refine((val) => typeof val === "string" && isValidPhoneNumber(val), {
        message: "settings.profile.validation.phoneInvalid",
      }),
  });
};

type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;

export default function ProfileSettingsPage() {
  const { user, fetchProfile } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const schema = useMemo(() => createProfileSchema(), []);

  // Helper function to combine country code and phone number
  const getFullPhoneNumber = (phone?: string, countryCode?: string): string => {
    if (!phone) return "";
    if (!countryCode) return phone;
    // If phone already starts with +, return as is
    if (phone.startsWith("+")) return phone;
    // Combine country code and phone number
    return `${countryCode}${phone}`;
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: getFullPhoneNumber(user?.phone, user?.countryCode),
    },
    mode: "onChange",
  });

  const isInitialMount = useRef(true);
  const prevUserRef = useRef<string | null>(null);

  // Update form when user data changes (e.g., after profile fetch)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevUserRef.current = JSON.stringify(user);
      return;
    }

    const currentUserStr = JSON.stringify(user);
    if (user && prevUserRef.current !== currentUserStr) {
      prevUserRef.current = currentUserStr;
      const fullPhone =
        user.phone && user.countryCode && !user.phone.startsWith("+")
          ? `${user.countryCode}${user.phone}`
          : user.phone || "";

      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: fullPhone,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      // Parse phone number if provided to extract country code
      let parsedPhone = data.phone;
      let countryCode: string | undefined = undefined;

      if (data.phone && isValidPhoneNumber(data.phone)) {
        const parsed = parsePhoneNumber(data.phone);
        if (parsed) {
          parsedPhone = parsed.nationalNumber;
          countryCode = `+${parsed.countryCallingCode}`;
        }
      }

      await authService.updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: parsedPhone || undefined,
        country_code: countryCode,
      });

      await fetchProfile();
      toast.success(
        "settings.toast.profileUpdated",
        "Profile updated successfully!",
      );
      setIsEditing(false);
    } catch (error) {
      // Error handled silently
      if (error instanceof AuthError) {
        toast.error(
          "settings.toast.updateFailed",
          error.message || "Failed to update profile",
        );
      } else {
        toast.error("settings.toast.updateFailed", "Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: getFullPhoneNumber(user?.phone, user?.countryCode),
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            {t("settings.profile.title", "Profile Settings")}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t("settings.profile.subtitle", "Manage your personal information")}
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm"
            style={{
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(20px)",
            }}
          >
            <PencilIcon size={16} weight="duotone" />
            {t("settings.profile.editProfile", "Edit Profile")}
          </Button>
        )}
      </div>

      {/* Profile Form */}
      <div className="glass-card rounded-xl p-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
            {user?.isEmailVerified && (
              <span className="inline-flex items-center px-2 py-0.5 mt-2 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                ✓ {t("status.verified", "Verified")}
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      required
                      className="text-sm font-medium text-gray-900"
                    >
                      {t("settings.profile.firstName", "First Name")}
                    </FormLabel>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <UserIcon
                          weight="duotone"
                          size={18}
                          className="text-gray-600"
                        />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          disabled={!isEditing || isLoading}
                          className={cn(
                            "h-11 pl-11 pr-4",
                            !isEditing && "bg-gray-50 cursor-not-allowed",
                          )}
                          maxLength={50}
                        />
                      </FormControl>
                      {isEditing && (
                        <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                          <p>
                            <TranslatedFormMessage t={t} />
                          </p>
                          <p className="text-xs font-normal text-left text-muted-foreground">
                            {field.value?.toString().length || 0} /50{" "}
                            {t("common.characters", "characters")}
                          </p>
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      required
                      className="text-sm font-medium text-gray-900"
                    >
                      {t("settings.profile.lastName", "Last Name")}
                    </FormLabel>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <UserIcon
                          weight="duotone"
                          size={18}
                          className="text-gray-600"
                        />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          disabled={!isEditing || isLoading}
                          className={cn(
                            "h-11 pl-11 pr-4",
                            !isEditing && "bg-gray-50 cursor-not-allowed",
                          )}
                          maxLength={50}
                        />
                      </FormControl>
                      {isEditing && (
                        <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                          <p>
                            <TranslatedFormMessage t={t} />
                          </p>
                          <p className="text-xs font-normal text-left text-muted-foreground">
                            {field.value?.toString().length || 0} /50{" "}
                            {t("common.characters", "characters")}
                          </p>
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-900 block"
              >
                {t("settings.profile.emailAddress", "Email Address")}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <EnvelopeIcon
                    weight="duotone"
                    size={18}
                    className="text-gray-600"
                  />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="h-11 pl-11 pr-4 bg-gray-50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500">
                {t(
                  "settings.profile.emailCannotBeChanged",
                  "Email cannot be changed.",
                )}
              </p>
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-medium text-gray-900"
                  >
                    {t("settings.profile.phoneNumber", "Phone Number")}
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || "")}
                      disabled={!isEditing || isLoading}
                      defaultCountry="NP"
                      className={cn(
                        !isEditing && "opacity-50 cursor-not-allowed",
                      )}
                    />
                  </FormControl>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isLoading || !form.formState.isDirty}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading
                    ? t("settings.profile.saving", "Saving...")
                    : t("settings.profile.saveChanges", "Save Changes")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-600 border-none"
                >
                  {t("settings.profile.cancel", "Cancel")}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
