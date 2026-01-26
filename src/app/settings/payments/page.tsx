"use client";

import React, { useState } from "react";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/ssr";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function PaymentsSettingsPage() {
  const [settings, setSettings] = useState({
    paymentGateway: "stripe",
    currency: "USD",
    processingFee: 2.5,
  });
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");
  const { locale } = useLanguageStore();
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
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            {t("settings.payments.title")}
          </h1>
          <p className="text-sm text-gray-600">
            {t("settings.payments.subtitle")}
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
                : t("settings.payments.saveChanges")}
          </span>
        </button>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.payments.paymentGateway")}
            </label>
            <select
              title="Payment Gateway"
              value={settings.paymentGateway}
              onChange={(e) =>
                handleInputChange("paymentGateway", e.target.value)
              }
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            >
              <option value="stripe">{t("settings.payments.stripe")}</option>
              <option value="paypal">{t("settings.payments.paypal")}</option>
              <option value="square">{t("settings.payments.square")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.payments.currency")}
            </label>
            <select
              title="Currency"
              value={settings.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="NPR">NPR (Rs.)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.payments.processingFee")}
            </label>
            <input
              type="number"
              step="0.1"
              title="Processing Fee"
              value={settings.processingFee}
              onChange={(e) =>
                handleInputChange("processingFee", parseFloat(e.target.value))
              }
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
