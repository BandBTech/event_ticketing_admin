"use client";

import React, { useState } from "react";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/ssr";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from '@/hooks/useTranslation';

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "TicketMaster Pro",
    siteUrl: "https://tickets.example.com",
    supportEmail: "support@tickets.example.com",
    timezone: "UTC-5",
  });
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");

  const {locale} = useLanguageStore();
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
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">{t("settings.general.title")}</h1>
          <p className="text-sm text-gray-600">{t("settings.general.subtitle")}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${saveStatus === "saved"
            ? "bg-green-100 text-green-700 border border-green-200 focus:ring-green-500"
            : saveStatus === "saving"
              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md"
            }`}
        >
          <FloppyDiskIcon size={16} weight="duotone" className={saveStatus === "saving" ? "animate-spin" : ""} />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.general.siteName")}
            </label>
            <input
              type="text"
              title="Site Name"
              value={settings.siteName}
              onChange={(e) => handleInputChange("siteName", e.target.value)}
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder={t("settings.general.enterSiteName")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.general.siteUrl")}
            </label>
            <input
              type="url"
              title="Site URL"
              value={settings.siteUrl}
              onChange={(e) => handleInputChange("siteUrl", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.general.supportEmail")}
            </label>
            <input
              type="email"
              title="Support Email"
              value={settings.supportEmail}
              onChange={(e) => handleInputChange("supportEmail", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="support@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.general.timezone")}
            </label>
            <select
              title="Timezone"
              value={settings.timezone}
              onChange={(e) => handleInputChange("timezone", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            >
              <option value="UTC-12">UTC-12</option>
              <option value="UTC-8">UTC-8 (PST)</option>
              <option value="UTC-5">UTC-5 (EST)</option>
              <option value="UTC+0">UTC+0 (GMT)</option>
              <option value="UTC+5:30">UTC+5:30 (IST)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
