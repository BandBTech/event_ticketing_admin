"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import ViewPaymentModal from "./components/ViewPaymentModal";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  PaymentGatewayConfig,
  PaymentGatewayListResponse,
} from "@/types/payment";
import { PaymentGatewayService } from "@/services/paymentService";
import AddPaymentModal from "./components/AddPaymentModal";
import EditPaymentModal from "./components/EditPaymentModal";

export default function PaymentsSettingsPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [selectedGateway, setSelectedGateway] =
    useState<PaymentGatewayConfig | null>(null);
  const [isViewPaymentGatewayOpen, setIsViewPaymentGatewayOpen] =
    useState(false);
  const [isAddPaymentGatewayOpen, setIsAddPaymentGatewayOpen] = useState(false);
  const [isEditPaymentGatewayOpen, setIsEditPaymentGatewayOpen] =
    useState(false);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<PaymentGatewayListResponse>({
    queryKey: queryKeys.organizers.all({}),
    queryFn: () => PaymentGatewayService.getPaymentGateways(),
  });

  const gateways = response?.gateways ?? [];

  const openModal = (gateway: PaymentGatewayConfig) => {
    setSelectedGateway(gateway);
    setIsViewPaymentGatewayOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };
  const openAddPaymentModal = () => {
    setIsAddPaymentGatewayOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };
  const openEditPaymentModal = (gateway: PaymentGatewayConfig) => {
    setSelectedGateway(gateway);
    setIsEditPaymentGatewayOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIsViewPaymentGatewayOpen(false);
      setSelectedGateway(null);
    }, 220);
  }, []);

  const closeAddPaymentModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIsAddPaymentGatewayOpen(false);
    }, 220);
  }, []);
  const closeEditPaymentModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIsEditPaymentGatewayOpen(false);
    }, 220);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (isViewPaymentGatewayOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isViewPaymentGatewayOpen, closeModal]);

  useEffect(() => {
    document.body.style.overflow = isViewPaymentGatewayOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isViewPaymentGatewayOpen]);

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
          onClick={() => openAddPaymentModal()}
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

        {/* States */}
        {isLoading && (
          <p className="text-sm text-slate-400 py-4 text-center">
            Loading gateways...
          </p>
        )}

        {isError && (
          <p className="text-sm text-red-500 py-4 text-center">
            Failed to load payment gateways.
          </p>
        )}

        {!isLoading && !isError && gateways.length === 0 && (
          <p className="text-sm text-slate-400 py-4 text-center">
            No payment gateways configured.
          </p>
        )}

        {/* Gateway rows */}
        <div className="space-y-3">
          {gateways.map((gateway) => (
            <div
              key={gateway.gateway_name}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
            >
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
                    {gateway.display_name || "N/A"}
                  </p>
                  <p className="mt-0.5 font-mono text-[12px] text-slate-400">
                    {gateway.gateway_name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium ${
                    gateway.is_enabled
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      gateway.is_enabled ? "bg-green-500" : "bg-slate-400"
                    }`}
                  />
                  {gateway.is_enabled ? "Live" : "Disabled"}
                </span>

                {gateway.is_test_mode && (
                  <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-[12px] font-medium text-yellow-700">
                    Test Mode
                  </span>
                )}

                <button
                  onClick={() => openModal(gateway)}
                  className="rounded-lg bg-blue-600 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 cursor-pointer"
                >
                  View config
                </button>
                <button
                  onClick={() => openEditPaymentModal(gateway)}
                  className="rounded-lg bg-blue-600 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 cursor-pointer"
                >
                  Edit config
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isViewPaymentGatewayOpen && selectedGateway && (
        <ViewPaymentModal
          open={isViewPaymentGatewayOpen}
          closeModal={closeModal}
          visible={visible}
          gateway={selectedGateway}
        />
      )}
      {isAddPaymentGatewayOpen && (
        <AddPaymentModal
          open={isAddPaymentGatewayOpen}
          closeModal={closeAddPaymentModal}
          visible={visible}
        />
      )}
      {isEditPaymentGatewayOpen && selectedGateway && (
        <EditPaymentModal
          open={isEditPaymentGatewayOpen}
          closeModal={closeEditPaymentModal}
          visible={visible}
          gateway={selectedGateway}
        />
      )}
    </div>
  );
}
