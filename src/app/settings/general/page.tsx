"use client";

import React, { useEffect, useState } from "react";
import { FloppyDiskIcon, UploadSimple, X } from "@phosphor-icons/react/dist/ssr";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import { SettingService } from "@/lib/settingService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState({
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
  });
  
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");

  const queryClient = useQueryClient();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["company"],
    queryFn: () => SettingService.getCompany({}),
  });

  useEffect(() => {
    if (response) {
      const companyData = {
        name: response?.name || "",
        address: response?.address || "",
        email: response?.email || "",
        description: response?.description || "",
        phone: response?.phone || "",
        logo_url: response?.logo_url || "",
        facebook_url: response?.facebook_url || "",
        instagram_url: response?.instagram_url || "",
        linkedin_url: response?.linkedin_url || "",
        twitter_url: response?.twitter_url || "",
        website_url: response?.website_url || "",
        youtube_url: response?.youtube_url || "",
      };
      setSettings(companyData);
      setPreviewUrl(response?.logo_url || "");
    }
  }, [response]);

  // Mutation for saving settings
  const saveMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      let uploadedLogoUrl = data.logo_url;
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        uploadedLogoUrl = uploadData.url;
      }

      // Then save all settings including the new logo URL
      const settingsToSave = {
        ...data,
        logo_url: uploadedLogoUrl,
      };

      return await SettingService.updateCompany(settingsToSave);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      setSelectedFile(null);
    },
    onError: (error) => {
      console.error("Save error:", error);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size should be less than 5MB");
      return;
    }

    setUploadError("");
    setSelectedFile(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    setSelectedFile(null);
    handleInputChange("logo_url", "");
    
    // Clean up object URL if it exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-red-500">Error loading settings</p>
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
          <p className="text-gray-600 mt-1">
            {t("settings.general.subtitle")}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Logo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
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
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X size={16} weight="bold" />
                  </button>
                  {selectedFile && (
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-b-lg">
                      New image selected
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <span className="text-gray-400 text-sm">No logo</span>
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
                    saveMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <UploadSimple size={20} />
                  {selectedFile ? "Change Logo" : "Upload Logo"}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or WEBP. Max size 5MB.
                </p>
                {selectedFile && (
                  <p className="text-sm text-blue-600 mt-1">
                    Selected: {selectedFile.name}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                title="Name"
                value={settings.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                title="Address"
                value={settings.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                title="Email"
                value={settings.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                placeholder="support@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                title="Phone"
                value={settings.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                placeholder="9845784574"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                title="Description"
                value={settings.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook URL
              </label>
              <input
                type="url"
                title="Facebook URL"
                value={settings.facebook_url}
                onChange={(e) => handleInputChange("facebook_url", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                title="Instagram URL"
                value={settings.instagram_url}
                onChange={(e) => handleInputChange("instagram_url", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                title="LinkedIn URL"
                value={settings.linkedin_url}
                onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                placeholder="https://linkedin.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter URL
              </label>
              <input
                type="url"
                title="Twitter URL"
                value={settings.twitter_url}
                onChange={(e) => handleInputChange("twitter_url", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                title="Website URL"
                value={settings.website_url}
                onChange={(e) => handleInputChange("website_url", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Youtube URL
              </label>
              <input
                type="url"
                title="Youtube URL"
                value={settings.youtube_url}
                onChange={(e) => handleInputChange("youtube_url", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FloppyDiskIcon size={20} weight="fill" />
              {saveMutation.isPending
                ? t("settings.profile.saving")
                : saveMutation.isSuccess
                ? t("settings.profile.saved")
                : t("settings.general.saveChanges")}
            </button>
          </div>

          {/* Error Message */}
          {saveMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Failed to save settings. Please try again.
            </div>
          )}

          {/* Success Message */}
          {saveMutation.isSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Settings saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}