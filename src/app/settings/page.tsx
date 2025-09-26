"use client";

import React, { useState } from "react";
import {
  Save,
  Eye,
  EyeOff,
  Bell,
  CreditCard,
  Users,
  Shield,
  Globe,
} from "lucide-react";
import Navbar from "../components/Navbar/Navbar";

// Type definitions
interface Settings {
  // General Settings
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  timezone: string;

  // Ticket Settings
  maxTicketsPerUser: number;
  ticketValidityDays: number;
  refundPolicy: "strict" | "moderate" | "flexible";

  // Payment Settings
  paymentGateway: "stripe" | "paypal" | "square";
  currency: "USD" | "EUR" | "GBP" | "NPR";
  processingFee: number;

  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderConfirmation: boolean;
  eventReminders: boolean;

  // Security Settings
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordPolicy: "basic" | "standard" | "strong";

  // API Settings
  apiRateLimit: number;
  apiKeyRotation: number;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

type SaveStatus = "" | "saving" | "saved";
type ActiveTab =
  | "general"
  | "tickets"
  | "payments"
  | "notifications"
  | "security"
  | "api";

// Component
const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    // General Settings
    siteName: "TicketMaster Pro",
    siteUrl: "https://tickets.example.com",
    supportEmail: "support@tickets.example.com",
    timezone: "UTC-5",

    // Ticket Settings
    maxTicketsPerUser: 10,
    ticketValidityDays: 30,
    refundPolicy: "flexible",

    // Payment Settings
    paymentGateway: "stripe",
    currency: "USD",
    processingFee: 2.5,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderConfirmation: true,
    eventReminders: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: "standard",

    // API Settings
    apiRateLimit: 1000,
    apiKeyRotation: 30,
  });

  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("general");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("");

  const handleInputChange = <K extends keyof Settings>(
    field: K,
    value: Settings[K]
  ): void => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (): Promise<void> => {
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

  const tabs: Tab[] = [
    { id: "general", label: "General", icon: Globe },
    { id: "tickets", label: "Tickets", icon: CreditCard },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "api", label: "API", icon: Users },
  ];

  const renderToggleSwitch = (
    checked: boolean,
    onChange: (checked: boolean) => void,
    disabled: boolean = false
  ): any => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        title="Toggle switch"
      />
      <div
        className={`w-11 h-6 rounded-full ${
          checked ? "bg-blue-600" : "bg-gray-200"
        } relative transition-colors duration-200 ease-in-out ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
            checked ? "transform translate-x-5" : ""
          }`}
        ></div>
      </div>
    </label>
  );

  const renderTabContent = (): any => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                title="Site Name"
                value={settings.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
                className="w-full p-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                placeholder="Enter site name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site URL
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
                Support Email
              </label>
              <input
                type="email"
                title="Support Email"
                value={settings.supportEmail}
                onChange={(e) =>
                  handleInputChange("supportEmail", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                placeholder="support@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
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
        );

      // 🔽 Apply the same fix: add `title="..."` to all <input> and <select> in tickets, payments, notifications, security, api

      // (rest of your code stays the same — just add title attributes everywhere)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 ml-64">
        {/* Navbar  */}
        <div>
          <Navbar title="Settings" addMessage="" handleOpen={() => {}}/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
              <nav
                className="space-y-2"
                role="navigation"
                aria-label="Settings navigation"
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-150 ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
                      }`}
                      aria-current={activeTab === tab.id ? "page" : undefined}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {tabs.find((tab) => tab.id === activeTab)?.label} Settings
                </h2>
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
                  <Save
                    size={16}
                    className={saveStatus === "saving" ? "animate-spin" : ""}
                  />
                  <span>
                    {saveStatus === "saved"
                      ? "Saved!"
                      : saveStatus === "saving"
                      ? "Saving..."
                      : "Save Changes"}
                  </span>
                </button>
              </div>

              <main role="main">{renderTabContent()}</main>
            </div>
          </div>
        </div>
    </div>
  );
};

export default AdminSettingsPage;
