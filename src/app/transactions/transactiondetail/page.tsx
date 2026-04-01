"use client";

import React from "react";
import {
  //   ArrowLeft,
  Mail,
  Calendar,
  RefreshCw,
  Ticket,
  CreditCard,
  Hash,
} from "lucide-react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { TransactionService } from "@/services/transactionService";
import { useQuery } from "@tanstack/react-query";
import { UserData } from "@/types/user";
import { queryKeys } from "@/lib/queryKeys";
import { useSearchParams } from "next/navigation";
import { Transaction } from "@/types/transaction";

function fmt(amount?: number, currency?: string): string {
  if (amount == null || !currency) return "—";
  
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TransactionDetailPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactioinId = searchParams.get("id") || "";

  const { data: transactionDetail, isLoading } = useQuery<Transaction>({
    queryKey: queryKeys.users.detail(transactioinId),
    queryFn: () => TransactionService.getTransactionById(transactioinId),
    enabled: !!transactioinId,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Back */}

      <button
        onClick={() => router.push("/transactions")}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2 group hover:bg-gray-200 p-2 px-4 rounded-lg"
      >
        <ArrowLeft
          weight="duotone"
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium">{t("", "Back to Transaction")}</span>
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0"
            style={{ background: "#eef0fb", color: "#6366f1" }} 
          >
            {transactionDetail?.user.name?.trim()?.split(" ")?.[0]?.[0]?.toUpperCase() || "—"}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">
                {transactionDetail?.user.name}
              </h1>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                style={{
                  background:
                    transactionDetail?.status === "completed" ? "#dcfce7" : "#fef9c3",
                  color:
                    transactionDetail?.status === "completed" ? "#16a34a" : "#a16207",
                }}
              >
                {transactionDetail?.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {transactionDetail?.event.title || "—"}
            </p>
            <div className="flex flex-wrap gap-2">
              <span
                className="text-xs font-medium px-3 py-1 rounded-full capitalize"
                style={{
                  background: "#fef3c7",
                  color: "#d97706",
                  border: "1px solid #fde68a",
                }}
              >
                Gateway: {transactionDetail?.payment_gateway || "—"}
              </span>
            </div>
          </div>
        </div>
        <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
          <span className="text-lg leading-none">⋯</span>
        </button>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Transaction Info */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Transaction Information
          </h2>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#eef2ff" }}
              >
                <Hash size={16} color="#6366f1" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Transaction ID</p>
                <p className="text-sm font-semibold text-gray-800 break-all">
                  {transactionDetail?.id}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#f0fdf4" }}
              >
                <Ticket size={16} color="#22c55e" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  Tickets Purchased
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {transactionDetail?.ticket_count} tickets
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#fff7ed" }}
              >
                <CreditCard size={16} color="#f97316" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Payment Gateway</p>
                <p className="text-sm font-semibold text-gray-800">
                  {transactionDetail?.payment_gateway || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#eef2ff" }}
              >
                <Calendar size={16} color="#6366f1" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Updated At</p>
                <p className="text-sm font-semibold text-gray-800">
                  {fmtDate(transactionDetail?.updated_at || "")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#fdf4ff" }}
              >
                <RefreshCw size={16} color="#a855f7" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Created At</p>
                <p className="text-sm font-semibold text-gray-800">
                  {fmtDate(transactionDetail?.created_at || "")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Financial Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Amount</span>
              <span className="text-sm font-semibold text-gray-800">
                {fmt(transactionDetail?.amount, transactionDetail?.currency)}
              </span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Organizer Share</span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "#dcfce7", color: "#16a34a" }}
              >
                {fmt(transactionDetail?.organizer_share, transactionDetail?.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Commission{" "}
                <span className="text-xs text-gray-400">
                  ({transactionDetail?.commission_rate}%)
                </span>
              </span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "#fff7ed", color: "#ea580c" }}
              >
                {fmt(transactionDetail?.commission_amount, transactionDetail?.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
