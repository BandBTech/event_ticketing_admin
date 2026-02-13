"use client";

import React from "react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import PaymentsTable from "./components/PaymentsTable";
import { useRouter } from "next/navigation";

export default function PaymentsSettingsPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();

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
          onClick={() => router.push("/settings/payments/addpayment")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
        >
          Add
        </button>
      </div>

      <div>
        <PaymentsTable />
      </div>
    </div>
  );
}
