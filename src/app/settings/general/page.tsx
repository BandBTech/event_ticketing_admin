"use client";

import React, { useEffect, useState } from "react";
import { UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { SettingService } from "@/lib/settingService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Country } from "react-phone-number-input";
import { isValidPhoneNumber } from "libphonenumber-js";
import { toast } from "@/lib/toast";
import LoadingSkeleton from "./components/LoadingSkeleton";

export const nameValidationRegex = /^[A-Za-z\s'-]+$/;

/**
 * Creates a firstName Zod schema with proper validation.
 * - Required, min 2 characters
 * - Only allows letters, spaces, hyphens, and apostrophes
 */
export const createNameSchema = () =>
  z
    .string()
    .min(1, "Name is required.")
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters.")
    .regex(
      nameValidationRegex,
      "Name can only contain letters, spaces, hyphens, and apostrophes.",
    );

export const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Please enter a valid URL.",
  });

// Zod validation schema
const companyInfoFormSchema = z.object({
  name: createNameSchema(),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  description: z.string().optional(),
  phone: z
    .string()
    .refine(
      (val) => !val || isValidPhoneNumber(val, { defaultCountry: "DK" }),
      {
        message: "Please enter a valid phone number.",
      },
    )
    .optional(),
  address: z.string().optional(),
  logo_url: optionalUrl,
  facebook_url: optionalUrl,
  instagram_url: optionalUrl,
  linkedin_url: optionalUrl,
  twitter_url: optionalUrl,
  website_url: optionalUrl,
  youtube_url: optionalUrl,
});

type CompanyInfoFormValues = z.infer<typeof companyInfoFormSchema>;

export default function GeneralSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [country, setCountry] = useState<Country>("NP");

  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoFormSchema),
    defaultValues: {
      name: "",
      address: "",
      email: "",
      description: "",
      phone: "",
      logo_url: "",
      facebook_url: "",
      instagram_url: "",
      linkedin_url: "",
      twitter_url: "",
      website_url: "",
      youtube_url: "",
    },
    mode: "onChange",
  });

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | string>("");
  const [uploadError, setUploadError] = useState("");

  const queryClient = useQueryClient();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["company"],
    queryFn: () => SettingService.getCompany({}),
  });

  useEffect(() => {
    if (response) {
      form.reset({
        name: response.name || "",
        address: response.address || "",
        email: response.email || "",
        description: response.description || "",
        phone: response.phone || "",
        logo_url: response.logo_url || "",
        facebook_url: response.facebook_url || "",
        instagram_url: response.instagram_url || "",
        linkedin_url: response.linkedin_url || "",
        twitter_url: response.twitter_url || "",
        website_url: response.website_url || "",
        youtube_url: response.youtube_url || "",
      });

      setPreviewUrl(response.logo_url || "");
    }
  }, [response, form]);

  const saveMutation = useMutation({
    mutationFn: (data: CompanyInfoFormValues) => {
      const payload = {
        ...data,
        logo: selectedFile,
      };

      return SettingService.updateCompany(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success(t("settings.general.companyInfoUpdated"));
      setSelectedFile("");
      setUploadError("");
    },
    onError: (error) => {
      console.error("Save error:", error);
      // toast.error("Failed to update company information");
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError(t("settings.general.pleaseUploadImageFile"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t("settings.general.imageDimension"));
      return;
    }

    setUploadError("");
    setSelectedFile(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onSubmit = (values: CompanyInfoFormValues) => {
    saveMutation.mutate(values);
  };

if (isLoading) {
  return (
    <LoadingSkeleton />
  );
}


  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-red-500">{t("settings.general.errorLoadingSettings")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("settings.general.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("settings.general.subtitle")}</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Logo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.general.companyLogo")}
            </label>
            <div className="flex items-start gap-4">
              {previewUrl ? (
                <div className="relative">
                  <Image
                    src={previewUrl}
                    alt="Company Logo"
                    width={120}
                    height={120}
                    className="rounded-lg border border-gray-300 object-cover"
                  />
                  {selectedFile && (
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-b-lg">
                       {t("settings.general.newImageSelected")}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <span className="text-gray-400 text-sm"> {t("settings.general.noLogo")}</span>
                </div>
              )}

              <div className="flex-1">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={saveMutation.isPending}
                />
                <label
                  htmlFor="logo-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    saveMutation.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <UploadSimple size={20} />
                  {selectedFile ? "Change Logo" : t("settings.general.uploadLogo")}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  {t("settings.general.imageDimension")}
                </p>
                {selectedFile && (
                  <p className="text-sm text-blue-600 mt-1">
                    {/* Selected: {selectedFile.name} */}
                  </p>
                )}
                {uploadError && (
                  <p className="text-sm text-red-500 mt-1">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Rest of form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">{t("settings.general.name")}</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    maxLength={100}
                    placeholder={t("settings.general.enterName")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 characters
                    </p>
                  </div>
                </Field>
              )}
            />

            {/* Address */}
            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="address">
                    {t("settings.general.address")}{" "}
                    <span className="text-gray-400 font-normal">
                      ({t("settings.general.optional")})
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="address"
                    maxLength={100}
                    placeholder={t("settings.general.enterAddress")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 characters
                    </p>
                  </div>
                </Field>
              )}
            />

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">{t("settings.general.email")}</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    placeholder={t("settings.general.enterEmailAddress")}
                    aria-invalid={fieldState.invalid}
                    className="bg-gray-50 text-gray-700"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Contact Number */}
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phone">
                    {t("settings.general.contactNumber")}{" "}
                    <span className="text-gray-400 font-normal">
                      ({t("settings.general.optional")})
                    </span>
                  </FieldLabel>
                  <PhoneInput
                    id="contactNumber"
                    defaultCountry={country}
                    placeholder={t("settings.general.enterPhoneNumber")}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    onKeyDown={(e) => {
                      // Only allow numbers and control keys
                      if (
                        !/^\d$/.test(e.key) &&
                        ![
                          "Backspace",
                          "Delete",
                          "ArrowLeft",
                          "ArrowRight",
                          "Tab",
                        ].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    aria-invalid={fieldState.invalid}
                    className="flex-1"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="md:col-span-2">
              {/* Description */}
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">
                      {t("settings.general.description")}{" "}
                      <span className="text-gray-400 font-normal">
                        ({t("settings.general.optional")})
                      </span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="description"
                      maxLength={500}
                      placeholder={t("settings.general.enterDescription")}
                      aria-invalid={fieldState.invalid}
                    />
                    <div className="flex justify-between items-center">
                      <p>
                        {" "}
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </p>
                      <p className="text-xs font-normal text-left text-muted-foreground">
                        {field.value?.length || 0} /500 characters
                      </p>
                    </div>
                  </Field>
                )}
              />
            </div>

            {/* Facebook URL */}
            <Controller
              name="facebook_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="facebook_url">
                    {t("settings.general.facebookURL")}{" "}
                    <span className="text-gray-400 font-normal">
                      ({t("settings.general.optional")})
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="facebook_url"
                    maxLength={100}
                    placeholder={t("settings.general.enterFacebookURL")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 characters
                    </p>
                  </div>
                </Field>
              )}
            />

            {/* Instagram URL */}
            <Controller
              name="instagram_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="instagram_url">
                    {t("settings.general.instagramURL")}{" "}
                    <span className="text-gray-400 font-normal">
                      ({t("settings.general.optional")})
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="instagram_url"
                    maxLength={100}
                    placeholder={t("settings.general.enterInstagramURL")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 characters
                    </p>
                  </div>
                </Field>
              )}
            />

            {/* Linkedin URL */}
            <Controller
              name="linkedin_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="linkedin_url">
                    {t("settings.general.linkedinURL")}{" "}
                    <span className="text-gray-400 font-normal">
                      ({t("settings.general.optional")})
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="linkedin_url"
                    maxLength={100}
                    placeholder={t("settings.general.enterLinkedInURL")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 characters
                    </p>
                  </div>
                </Field>
              )}
            />

            {/* Twitter URL */}
            <Controller
              name="twitter_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="twitter_url">
                    {t("settings.general.twitterURL")}{" "}
                    <span className="text-gray-400 font-normal">
                      ({t("settings.general.optional")})
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="twitter_url"
                    maxLength={100}
                    placeholder={t("settings.general.enterTwitterURL")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 characters
                    </p>
                  </div>
                </Field>
              )}
            />

            {/* Website URL */}
            <Controller
              name="website_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="website_url">
                    {t("settings.general.websiteURL")}{" "}
                    <span className="text-gray-400 font-normal">
                      ({t("settings.general.optional")})
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="website_url"
                    maxLength={100}
                    placeholder={t("settings.general.enterWebsiteURL")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 characters
                    </p>
                  </div>
                </Field>
              )}
            />

            {/* Youtube URL */}
            <Controller
              name="youtube_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="youtube_url">
                    {t("settings.general.youtubeURL")}{" "}
                    <span className="text-gray-400 font-normal">
                      ({t("settings.general.optional")})
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="youtube_url"
                    maxLength={100}
                    placeholder={t("settings.general.enterYouTubeURL")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 characters
                    </p>
                  </div>
                </Field>
              )}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {saveMutation.isPending
                ? t("settings.profile.saving")
                : saveMutation.isSuccess
                  ? t("settings.profile.saved")
                  : t("settings.general.saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
