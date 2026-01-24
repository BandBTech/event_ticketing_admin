"use client";

import React, { useState } from "react";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/ssr";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from '@/hooks/useTranslation';

export default function SystemSecuritySettingsPage() {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: "standard",
  });
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");

  const {locale} = useLanguageStore();
  const { t } = useTranslation(locale);

  const handleInputChange = (field: string, value: string | number | boolean) => {
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
      console.error(error);
      setSaveStatus("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">{t("settings.systemSecurity.title")}</h1>
          <p className="text-sm text-gray-600">{t("settings.systemSecurity.subtitle")}</p>
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
                : t("settings.systemSecurity.saveChanges")}
          </span>
        </button>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">{t("settings.systemSecurity.twoFactorAuth")}</h3>
              <p className="text-sm text-gray-500">{t("settings.systemSecurity.enforce2FA")}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                title="Two Factor Auth"
                checked={settings.twoFactorAuth}
                onChange={(e) => handleInputChange("twoFactorAuth", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.systemSecurity.sessionTimeout")}
            </label>
            <input
              type="number"
              title="Session Timeout"
              value={settings.sessionTimeout}
              onChange={(e) => handleInputChange("sessionTimeout", parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.systemSecurity.passwordPolicy")}
            </label>
            <select
              title="Password Policy"
              value={settings.passwordPolicy}
              onChange={(e) => handleInputChange("passwordPolicy", e.target.value)}
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            >
              <option value="basic">{t("settings.systemSecurity.basic")}</option>
              <option value="standard">{t("settings.systemSecurity.standard")}</option>
              <option value="strong">{t("settings.systemSecurity.strong")}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
