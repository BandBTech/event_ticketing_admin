"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUploader } from "@/components/ui/image-uploader";
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
    imageFile,
    imagePreview,
    imageError,
    imageRemoved,
    validateAndProcessImage,
    handleRemoveImage,
  } = useImageUpload({
    initialPreview: "",
    maxHeight: 500,
    maxWidth: 500,
  });

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

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = useCallback(
    (file: File) => {
      validateAndProcessImage(file);
      setSelectedFile(file);

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    },
    [validateAndProcessImage, form],
  );

  const handleImageRemove = useCallback(() => {
    handleRemoveImage();
    setSelectedFile("");
  }, [handleRemoveImage, form]);

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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="min-w-[300px]">
                <ImageUploader
                  label={t("settings.general.uploadLogo", "Upload Logo")}
                  className="w-[300px] h-[250px]"
                  helperText={t(
                    "settings.general.imageUploader.uploadImage",
                    "Upload image or drag & drop",
                  )}
                  helperTextSize={t(
                    "settings.general.imageUploader.recomendedImage",
                    "Recommended: PNG/JPG file of 500x500 px with size up to 5MB",
                  )}
                  value={imageRemoved ? "" : previewUrl || ""}
                  onChange={(file) => {
                    if (file) handleImageChange(file);
                  }}
                  onRemove={handleImageRemove}
                  error={imageError}
                  browseButtonText={t(
                    "imageUploader.browseFile",
                    "Browse File",
                  )}
                />
              </div>

              <div className="grid gap-6">
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
              </div>
            </div>

            {/* Rest of form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email  */}
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel 
                    required
                    className="text-sm font-medium text-gray-900">
                      {t("settings.general.email", "Email")}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          placeholder={t("settings.general.enterEmailAddress")}
                          aria-invalid={fieldState.invalid}
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
