"use client";

import React, { useState } from "react";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/ssr";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from '@/hooks/useTranslation';

export default function TicketsSettingsPage() {
  const [settings, setSettings] = useState({
    maxTicketsPerUser: 10,
    ticketValidityDays: 30,
    refundPolicy: "flexible",
  });
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");

    const {locale} = useLanguageStore();
    const { t } = useTranslation(locale);

  const handleInputChange = (field: string, value: string | number) => {
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
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">{t("settings.tickets.title")}</h1>
          <p className="text-sm text-gray-600">{t("settings.tickets.subtitle")}</p>
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
          <FloppyDiskIcon weight="duotone" size={16} className={saveStatus === "saving" ? "animate-spin" : ""} />
          <span>
            {saveStatus === "saved"
              ? t("settings.profile.saved")
              : saveStatus === "saving"
                ? t("settings.profile.saving")
                : t("settings.tickets.saveChanges")}
          </span>
        </button>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.tickets.maxTicketsPerUser")}
            </label>
            <input
              type="number"
              title="Max Tickets Per User"
              value={settings.maxTicketsPerUser}
              onChange={(e) => handleInputChange("maxTicketsPerUser", parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.tickets.ticketValidity")}
            </label>
            <input
              type="number"
              title="Ticket Validity Days"
              value={settings.ticketValidityDays}
              onChange={(e) => handleInputChange("ticketValidityDays", parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.tickets.refundPolicy")}
            </label>
            <select
              title="Refund Policy"
              value={settings.refundPolicy}
              onChange={(e) => handleInputChange("refundPolicy", e.target.value)}
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            >
              <option value="strict">{t("settings.tickets.strict")}</option>
              <option value="moderate">{t("settings.tickets.moderate")}</option>
              <option value="flexible">{t("settings.tickets.flexible")}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
