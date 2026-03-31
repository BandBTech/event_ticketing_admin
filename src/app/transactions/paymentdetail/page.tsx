"use client";

import React from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useSearchParams } from "next/navigation";
import { TransactionService } from "@/services/transactionService";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { TransactionPaymentData } from "@/types/paymenttransactiondetail";

// --- Helpers ---
const fmt = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const capitalize = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

// --- Primitives ---
const Badge = ({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "indigo";
}) => {
  const styles: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    info: "bg-sky-50 text-sky-700 border border-sky-200",
    neutral: "bg-slate-100 text-slate-600 border border-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide ${styles[variant]}`}
    >
      {label}
    </span>
  );
};

const txnVariant = (
  status: string,
): "success" | "warning" | "danger" | "neutral" => {
  if (status === "completed") return "success";
  if (status === "pending") return "warning";
  if (status === "failed") return "danger";
  return "neutral";
};

const ticketVariant = (
  status: string,
): "success" | "info" | "danger" | "neutral" => {
  if (status === "active") return "info";
  if (status === "used") return "success";
  if (status === "cancelled") return "danger";
  return "neutral";
};

const InfoRow = ({
  label,
  value,
  mono,
  last,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  last?: boolean;
}) => (
  <div
    className={`flex items-center justify-between py-3 ${!last ? "border-b border-slate-100" : ""}`}
  >
    <span className="text-sm text-slate-500">{label}</span>
    <span
      className={`text-sm font-semibold text-slate-800 text-right ${mono ? "font-mono tracking-tight" : ""}`}
    >
      {value}
    </span>
  </div>
);

// --- Icons ---
const Icon = {
  user: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  payment: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  ticket: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
    </svg>
  ),
};

const CardHeader = ({
  icon,
  title,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  iconBg: string;
}) => (
  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}
    >
      {icon}
    </div>
    <h3 className="text-sm font-bold text-slate-700">{title}</h3>
  </div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

// --- Main Component ---
export default function PaymentDetail() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("id") || "";

  const { data: paymentDetailData, isLoading } =
    useQuery<TransactionPaymentData>({
      queryKey: queryKeys.users.detail(transactionId),
      queryFn: () =>
        TransactionService.getTransactionPaymentDetailById(transactionId),
      enabled: !!transactionId,
    });

  const transaction = paymentDetailData?.transaction;
  const paymentIntent = paymentDetailData?.payment_intent;
  const tickets = paymentDetailData?.tickets ?? [];

  return (
    <div
      className="min-h-screen bg-[#f4f6f9] py-10 px-4"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .ticket-row:hover { background-color: #f8fafc; }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back button */}
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

        {/* Page header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payment Detail
            </h1>
          </div>
          {transaction && (
            <div className="flex items-center gap-2 mt-1">
              <Badge
                label={capitalize(transaction.status)}
                variant={txnVariant(transaction.status)}
              />
              <Badge
                label={capitalize(transaction.payment_gateway)}
                variant="indigo"
              />
            </div>
          )}
        </div>

        {/* Buyer + Payment Intent */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
              >
                <Skeleton className="h-9 w-full" />
                {[...Array(3)].map((__, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        ) : transaction && paymentIntent ? (
          <div className="grid md:grid-cols-3 gap-4">
            {/* Buyer */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <CardHeader
                icon={<span className="text-violet-500">{Icon.ticket}</span>}
                title="Event"
                iconBg="bg-violet-50"
              />
              <InfoRow label="Event Name" value={transaction.event.name} />
              <InfoRow
                label="Ticket Quantity"
                value={`${transaction.quantity} ticket${transaction.quantity !== 1 ? "s" : ""}`}
              />
            </div>

            {/* Buyer */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <CardHeader
                icon={<span className="text-emerald-500">{Icon.user}</span>}
                title="Buyer"
                iconBg="bg-emerald-50"
              />
              <InfoRow label="User Name" value={transaction.user.name} />
              <InfoRow label="Email" value={transaction.user.email} />
            </div>

            {/* Payment Intent */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <CardHeader
                icon={<span className="text-amber-500">{Icon.payment}</span>}
                title="Payment"
                iconBg="bg-amber-50"
              />
              <InfoRow
                label="Gateway"
                value={
                  <span className="capitalize">
                    {paymentIntent.payment_gateway}
                  </span>
                }
              />
              <InfoRow
                label="Created At"
                value={fmtDate(paymentIntent.created_at)}
              />

              {/* Amount breakdown */}
              <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Total Amount</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {fmt(transaction.amount, transaction.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tickets */}
        {!isLoading && tickets.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Table header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                  {Icon.ticket}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700">Tickets</h3>
                  <p className="text-xs text-slate-400">
                    {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}{" "}
                    issued in this payment
                  </p>
                </div>
              </div>
              <Badge
                label={`${tickets.filter((t) => t.status === "active").length} Active`}
                variant="info"
              />
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-12 px-6 py-2.5 bg-slate-50 border-b border-slate-100">
              <span className="col-span-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                #
              </span>
              <span className="col-span-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Ticket Number
              </span>
              <span className="col-span-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Tier
              </span>
              <span className="col-span-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Holder
              </span>
              <span className="col-span-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-right">
                Amount
              </span>
              <span className="col-span-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">
                Status
              </span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
              {tickets.map((ticket, i) => (
                <div
                  key={ticket.id}
                  className="ticket-row grid grid-cols-12 items-center px-6 py-3.5 transition-colors"
                >
                  <span className="col-span-1 text-xs text-slate-400 font-medium">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="col-span-4 text-sm font-semibold text-slate-700 tracking-tight"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {ticket.ticket_number}
                  </span>
                  <span className="col-span-2 text-sm text-slate-500">
                    {ticket.tier?.tier_name || "General"}
                  </span>
                  <span className="col-span-3 text-sm text-slate-600 truncate">
                    {ticket.user.name}
                  </span>
                  <span className="col-span-1 text-sm font-bold text-slate-800 text-right">
                    {fmt(ticket.total_amount)}
                  </span>
                  <span className="col-span-1 flex justify-center">
                    <Badge
                      label={capitalize(ticket.status)}
                      variant={ticketVariant(ticket.status)}
                    />
                  </span>
                </div>
              ))}
            </div>

            {/* Footer total */}
            {transaction && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">
                  {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
                </span>
                <span className="text-base font-bold text-slate-900">
                  {fmt(transaction.amount, transaction.currency)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Loading skeleton for tickets */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <Skeleton className="h-9 w-48" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
