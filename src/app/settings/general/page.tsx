"use client";

import React, { useState } from "react";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/ssr";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState({
    name: "TicketMaster Pro",
    address: "www.ticketmasterpro.com",
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
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      // Error handled silently
      setSaveStatus("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            {t("settings.general.title")}
          </h1>
          <p className="text-sm text-gray-600">
            {t("settings.general.subtitle")}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            saveStatus === "saved"
              ? "bg-green-100 text-green-700 border border-green-200 focus:ring-green-500"
              : saveStatus === "saving"
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md"
          }`}
        >
          <FloppyDiskIcon
            size={16}
            weight="duotone"
            className={saveStatus === "saving" ? "animate-spin" : ""}
          />
          <span>
            {saveStatus === "saved"
              ? t("settings.profile.saved")
              : saveStatus === "saving"
                ? t("settings.profile.saving")
                : t("settings.general.saveChanges")}
          </span>
        </button>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="space-y-6">
          <div className="flex gap-6 items-center">
            <div>
              <img
                src="https://img.freepik.com/premium-vector/young-man-avatar-character-due-avatar-man-vector-icon-cartoon-illustration_1186924-4438.jpg?semt=ais_user_personalization&w=740&q=80"
                alt=""
                className="w-32 h-32 rounded-full"
              />
            </div>
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {/* {t("settings.general.siteName")} */}
                  Name
                </label>
                <input
                  type="text"
                  title="Site Name"
                  value={settings.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                  placeholder={t("settings.general.enterSiteName")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {/* {t("settings.general.siteUrl")} */}
                  Address
                </label>
                <input
                  type="text"
                  title="Address"
                  value={settings.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {/* {t("settings.general.supportEmail")} */}
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
              {/* {t("settings.general.supportEmail")} */}
              Description
            </label>
            <textarea
              title="Description"
              value={settings.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="support@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {/* {t("settings.general.supportEmail")} */}
              Phone
            </label>
            <input
              type="text"
              title="Phone"
              value={settings.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="support@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {/* {t("settings.general.supportEmail")} */}
              Logo URL
            </label>
            <input
              type="text"
              title="Logo URL"
              value={settings.logo_url}
              onChange={(e) => handleInputChange("logo_url", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="support@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {/* {t("settings.general.supportEmail")} */}
              Facebook URL
            </label>
            <input
              type="text"
              title="facebook url"
              value={settings.facebook_url}
              onChange={(e) =>
                handleInputChange("facebook_url", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="support@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {/* {t("settings.general.supportEmail")} */}
              Instagram URL
            </label>
            <input
              type="text"
              title="instagram url"
              value={settings.instagram_url}
              onChange={(e) =>
                handleInputChange("instagram_url", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="support@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {/* {t("settings.general.supportEmail")} */}
              LinkedIn URL
            </label>
            <input
              type="text"
              title="linkedin url"
              value={settings.linkedin_url}
              onChange={(e) =>
                handleInputChange("linkedin_url", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="support@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {/* {t("settings.general.supportEmail")} */}
              Twitter URL
            </label>
            <input
              type="text"
              title="twitter url"
              value={settings.twitter_url}
              onChange={(e) => handleInputChange("twitter_url", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="support@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {/* {t("settings.general.supportEmail")} */}
              Website URL
            </label>
            <input
              type="text"
              title="website url"
              value={settings.website_url}
              onChange={(e) => handleInputChange("website_url", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="support@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {/* {t("settings.general.supportEmail")} */}
              Youtube URL
            </label>
            <input
              type="text"
              title="youtube url"
              value={settings.youtube_url}
              onChange={(e) => handleInputChange("youtube_url", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="support@example.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
