"use client";

import React, { useEffect, useState, useMemo } from "react";
import { UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { SettingService } from "@/services/settingService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Country } from "react-phone-number-input";
import { toast } from "@/lib/toast";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { createCompanyInfoFormSchema } from "@/lib/validation";

export default function GeneralSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [country, setCountry] = useState<Country>("NP");
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const schema = useMemo(() => createCompanyInfoFormSchema(t), []);

  type CompanyInfoFormValues = z.infer<typeof schema>;
  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(schema),
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
  const isPending = saveMutation.isPending;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-red-500">
            {t("settings.general.errorLoadingSettings")}
          </p>
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-6"
          >
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
                    <span className="text-gray-400 text-sm">
                      {" "}
                      {t("settings.general.noLogo")}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isPending}
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      isPending ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <UploadSimple size={20} />
                    {selectedFile
                      ? "Change Logo"
                      : t("settings.general.uploadLogo")}
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
              {/* Name  */}
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel
                      required
                      className="text-sm font-medium text-gray-900"
                    >
                      {t("settings.general.name", "Name")}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="name"
                          maxLength={100}
                          placeholder={t("settings.general.enterName")}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                        <p>
                          <TranslatedFormMessage t={t} />
                        </p>
                        <p className="text-xs font-normal text-left text-muted-foreground">
                          {field.value?.toString().length || 0} /100{" "}
                          {t("common.characters", "characters")}
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Address  */}
              <FormField
                control={form.control}
                name="address"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      {t("settings.general.address", "Address")}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="address"
                          maxLength={100}
                          placeholder={t("settings.general.enterAddress")}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                        <p>
                          <TranslatedFormMessage t={t} />
                        </p>
                        <p className="text-xs font-normal text-left text-muted-foreground">
                          {field.value?.toString().length || 0} /100{" "}
                          {t("common.characters", "characters")}
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Email  */}
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      {t("settings.general.email", "Email")}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          placeholder={t("settings.general.enterEmailAddress")}
                          aria-invalid={fieldState.invalid}
                          className="bg-gray-50 text-gray-700"
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                        <p>
                          <TranslatedFormMessage t={t} />
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      {t("settings.profile.phoneNumber", "Phone Number")}
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value || ""}
                        onChange={(value) => field.onChange(value || "")}
                        defaultCountry="NP"
                        disabled={isPending}
                        className={cn("opacity-50 cursor-not-allowed")}
                      />
                    </FormControl>
                    <TranslatedFormMessage t={t} />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                {/* Description  */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        {t("settings.general.description", "Description")}
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Textarea
                            {...field}
                            id="description"
                            maxLength={500}
                            placeholder={t("settings.general.enterDescription")}
                            aria-invalid={fieldState.invalid}
                            disabled={isPending}
                          />
                        </FormControl>
                        <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                          <p>
                            <TranslatedFormMessage t={t} />
                          </p>
                          <p className="text-xs font-normal text-left text-muted-foreground">
                            {field.value?.toString().length || 0} /500{" "}
                            {t("common.characters", "characters")}
                          </p>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Facebook URL  */}
              <FormField
                control={form.control}
                name="facebook_url"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      {t("settings.general.facebookURL", "Facebook URL")}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="facebook_url"
                          maxLength={100}
                          placeholder={t("settings.general.enterFacebookURL")}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                        <p>
                          <TranslatedFormMessage t={t} />
                        </p>
                        <p className="text-xs font-normal text-left text-muted-foreground">
                          {field.value?.toString().length || 0} /100{" "}
                          {t("common.characters", "characters")}
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Instagram URL  */}
              <FormField
                control={form.control}
                name="instagram_url"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      {t("settings.general.instagramURL", "Instagram URL")}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="instagram_url"
                          maxLength={100}
                          placeholder={t("settings.general.enterInstagramURL")}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                        <p>
                          <TranslatedFormMessage t={t} />
                        </p>
                        <p className="text-xs font-normal text-left text-muted-foreground">
                          {field.value?.toString().length || 0} /100{" "}
                          {t("common.characters", "characters")}
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Linkedin URL  */}
              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      {t("settings.general.linkedinURL", "Linkedin URL")}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="linkedin_url"
                          maxLength={100}
                          placeholder={t("settings.general.enterLinkedInURL")}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                        <p>
                          <TranslatedFormMessage t={t} />
                        </p>
                        <p className="text-xs font-normal text-left text-muted-foreground">
                          {field.value?.toString().length || 0} /100{" "}
                          {t("common.characters", "characters")}
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Twitter URL  */}
              <FormField
                control={form.control}
                name="twitter_url"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      {t("settings.general.twitterURL", "Twitter URL")}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="twitter_url"
                          maxLength={100}
                          placeholder={t("settings.general.enterTwitterURL")}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                        <p>
                          <TranslatedFormMessage t={t} />
                        </p>
                        <p className="text-xs font-normal text-left text-muted-foreground">
                          {field.value?.toString().length || 0} /100{" "}
                          {t("common.characters", "characters")}
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Website URL  */}
              <FormField
                control={form.control}
                name="website_url"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      {t("settings.general.websiteURL", "Website URL")}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="website_url"
                          maxLength={100}
                          placeholder={t("settings.general.enterWebsiteURL")}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                        <p>
                          <TranslatedFormMessage t={t} />
                        </p>
                        <p className="text-xs font-normal text-left text-muted-foreground">
                          {field.value?.toString().length || 0} /100{" "}
                          {t("common.characters", "characters")}
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Youtube URL  */}
              <FormField
                control={form.control}
                name="youtube_url"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      {t("settings.general.youtubeUrl", "Youtube URL")}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="twitter_url"
                          maxLength={100}
                          placeholder={t("settings.general.enterTwitterURL")}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                        <p>
                          <TranslatedFormMessage t={t} />
                        </p>
                        <p className="text-xs font-normal text-left text-muted-foreground">
                          {field.value?.toString().length || 0} /100{" "}
                          {t("common.characters", "characters")}
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isPending}
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer ${
                  isPending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isPending
                  ? t("settings.profile.saving")
                  : saveMutation.isSuccess
                    ? t("settings.profile.saved")
                    : t("settings.general.saveChanges")}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
