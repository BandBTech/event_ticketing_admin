"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import PaymentModal from "./components/PaymentModal";

interface GatewayConfig {
  api_key: string;
  api_secret: string;
  webhook_secret: string;
  display_name: string;
  gateway_name: string;
  is_enabled: boolean;
  is_test_mode: boolean;
}

const config: GatewayConfig = {
  api_key: "stripe_test_key_placeholder",
  api_secret: "stripe_test_key_placeholder",
  webhook_secret: "stripe_test_key_placeholder",
  display_name: "Stripe Payments",
  gateway_name: "stripe",
  is_enabled: true,
  is_test_mode: false,
};

export default function PaymentsSettingsPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const openModal = () => {
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => setOpen(false), 220);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, closeModal]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

      {/* Page */}
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Payment Gateways
        </p>

        {/* Gateway row */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-blue-200 bg-blue-50">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.8"
              >
                <rect x="1" y="4" width="22" height="16" rx="3" ry="3" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-slate-900">
                {config.display_name}
              </p>
              <p className="mt-0.5 font-mono text-[12px] text-slate-400">
                {config.gateway_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[12px] font-medium text-green-700">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              Live
            </span>
            <button
              onClick={openModal}
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 cursor-pointer"
            >
              View config
            </button>
          </div>
        </div>
      </div>

      <PaymentModal open={open} closeModal={closeModal} visible={visible} />
    </div>
  );
}
