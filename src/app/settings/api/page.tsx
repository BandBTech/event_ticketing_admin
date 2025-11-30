"use client";

import React, { useState } from "react";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/ssr";

export default function ApiSettingsPage() {
  const [settings, setSettings] = useState({
    apiRateLimit: 1000,
    apiKeyRotation: 30,
  });
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");

  const handleInputChange = (field: string, value: number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">API Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage API access and limits</p>
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
              ? "Saved!"
              : saveStatus === "saving"
                ? "Saving..."
                : "Save Changes"}
          </span>
        </button>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Rate Limit (Requests/Minute)
            </label>
            <input
              type="number"
              title="API Rate Limit"
              value={settings.apiRateLimit}
              onChange={(e) => handleInputChange("apiRateLimit", parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key Rotation (Days)
            </label>
            <input
              type="number"
              title="API Key Rotation"
              value={settings.apiKeyRotation}
              onChange={(e) => handleInputChange("apiKeyRotation", parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
