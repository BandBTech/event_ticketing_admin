"use client";

import React, { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useSearchParams } from "next/navigation";
import { TransactionService } from "@/services/transactionService";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import {
  ApiResponse as PaymentDetailApiResponse,
  TransactionPaymentData,
} from "@/types/paymenttransactiondetail";

// --- Types ---
interface EventData {
  id: string;
  title: string;
  category: string;
  venue_name: string;
  address: string;
  start_date: string;
  end_date: string;
  timezone: string;
  capacity: number;
  available: number;
  price: number;
  commission_rate: number;
  status: string;
  sales_status: string;
  is_featured: boolean;
  is_cancelled: boolean;
}

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_email_verified: boolean;
  account_status: string;
}

interface TierData {
  id: string;
  tier_name: string;
  price: number;
  currency: string;
  quantity: number;
  available: number;
  sold: number;
  gst: number;
  sales_start: string;
  sales_end: string;
  is_active: boolean;
}

interface Ticket {
  id: string;
  ticket_number: string;
  tier: TierData;
  total_amount: number;
  payment_gateway: string;
  status: string;
  is_guest_purchase: boolean;
  created_at: string;
}

interface Transaction {
  id: string;
  event: EventData;
  user: UserData;
  payment_gateway: string;
  amount: number;
  currency: string;
  quantity: number;
  status: string;
  gateway_txn_id: string;
  commission_rate: number;
  commission_amount: number;
  organizer_share: number;
  processed_at: string;
  created_at: string;
}

// --- Helpers ---
const fmt = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

const fmtDateShort = (d: string) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
  event: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  payment: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  ticket: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  location: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
    <h3 className="text-sm font-bold text-slate-700">{title}</h3>
  </div>
);

// --- Loading skeleton ---
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

  const { data: paymentDetailData, isLoading } = useQuery<TransactionPaymentData>({
    queryKey: queryKeys.users.detail(transactionId),
    queryFn: () => TransactionService.getTransactionPaymentDetailById(transactionId),
    enabled: !!transactionId,
  });

  // Pull data from API response
  const transactionDetail: Transaction | undefined = paymentDetailData?.transaction;
  const tickets: Ticket[] = paymentDetailData?.tickets ?? [];

  const event = transactionDetail?.event;
  const user = transactionDetail?.user;

  return (
    <div
      className="min-h-screen bg-[#f4f6f9] py-10 px-4"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .chevron { transition: transform 0.2s ease; }
        .chevron.open { transform: rotate(180deg); }
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payment Detail</h1>
            {transactionDetail ? (
              <p className="text-sm text-slate-500 mt-0.5 font-mono">
                #{transactionDetail.id.toUpperCase().slice(0, 8)}
              </p>
            ) : (
              <Skeleton className="h-4 w-32 mt-1" />
            )}
          </div>
          {transactionDetail && (
            <div className="flex items-center gap-2 mt-8">
              <Badge
                label={capitalize(transactionDetail.status)}
                variant={txnVariant(transactionDetail.status)}
              />
              <Badge
                label={capitalize(transactionDetail.payment_gateway)}
                variant="indigo"
              />
            </div>
          )}
        </div>

        {/* Summary metric strip */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        ) : transactionDetail ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Paid",
                value: fmt(transactionDetail.amount, transactionDetail.currency),
                color: "text-slate-900",
              },
              {
                label: `Commission (${transactionDetail.commission_rate}%)`,
                value: fmt(transactionDetail.commission_amount, transactionDetail.currency),
                color: "text-rose-600",
              },
              {
                label: "Organizer Share",
                value: fmt(transactionDetail.organizer_share, transactionDetail.currency),
                color: "text-emerald-600",
              },
              {
                label: "Tickets Issued",
                value: `${transactionDetail.quantity}`,
                color: "text-indigo-600",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  {label}
                </p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Middle row: Event + Buyer + Payment */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <Skeleton className="h-9 w-full" />
                {[...Array(4)].map((__, j) => <Skeleton key={j} className="h-4 w-full" />)}
              </div>
            ))}
          </div>
        ) : transactionDetail && event && user ? (
          <div className="grid md:grid-cols-3 gap-4">

            {/* Event */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <CardHeader
                icon={<span className="text-indigo-500">{Icon.event}</span>}
                title="Event"
                iconBg="bg-indigo-50"
              />
              <div className="mb-3">
                <p className="text-base font-bold text-slate-800 leading-snug truncate">
                  {event.title}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-slate-400">{Icon.location}</span>
                  <p className="text-xs text-slate-500 truncate">{event.address}</p>
                </div>
              </div>
              <InfoRow label="Category" value={event.category} />
              <InfoRow label="Start" value={fmtDateShort(event.start_date)} />
              <InfoRow label="End" value={fmtDateShort(event.end_date)} />
              <InfoRow
                label="Capacity"
                value={`${event.capacity - event.available} / ${event.capacity}`}
              />
              <InfoRow
                label="Sales Status"
                value={<Badge label={capitalize(event.sales_status)} variant="success" />}
              />
              <InfoRow
                label="Event Status"
                value={<Badge label={capitalize(event.status.replace("_", " "))} variant="success" />}
                last
              />
            </div>

            {/* Buyer */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <CardHeader
                icon={<span className="text-emerald-500">{Icon.user}</span>}
                title="Buyer"
                iconBg="bg-emerald-50"
              />
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-700">
                    {user.first_name?.[0]?.toUpperCase()}
                    {user.last_name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 capitalize">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <InfoRow label="Phone" value={user.phone} />
              <InfoRow
                label="Account"
                value={<Badge label={capitalize(user.account_status)} variant="success" />}
              />
              <InfoRow
                label="Email Verified"
                value={
                  user.is_email_verified ? (
                    <Badge label="Verified" variant="info" />
                  ) : (
                    <Badge label="Unverified" variant="warning" />
                  )
                }
                last
              />
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <CardHeader
                icon={<span className="text-amber-500">{Icon.payment}</span>}
                title="Payment"
                iconBg="bg-amber-50"
              />
              <InfoRow
                label="Gateway"
                value={<span className="capitalize">{transactionDetail.payment_gateway}</span>}
              />
              <InfoRow label="Currency" value={transactionDetail.currency} />
              <InfoRow
                label="Commission Rate"
                value={`${transactionDetail.commission_rate}%`}
              />
              <InfoRow
                label="Processed At"
                value={fmtDateShort(transactionDetail.processed_at)}
              />

              {/* Breakdown */}
              <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-700">
                    {fmt(transactionDetail.amount, transactionDetail.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Commission</span>
                  <span className="font-semibold text-rose-500">
                    −{fmt(transactionDetail.commission_amount, transactionDetail.currency)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-xs">
                  <span className="font-bold text-slate-700">Organizer Net</span>
                  <span className="font-bold text-emerald-600">
                    {fmt(transactionDetail.organizer_share, transactionDetail.currency)}
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
                    {tickets.length} tickets issued in this payment
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
              <span className="col-span-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">#</span>
              <span className="col-span-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Ticket Number</span>
              <span className="col-span-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Tier</span>
              <span className="col-span-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-right">Amount</span>
              <span className="col-span-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</span>
              <span className="col-span-1" />
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
              {tickets.map((ticket, i) => (
                <div key={ticket.id}>
                  <button
                    className="ticket-row w-full grid grid-cols-12 items-center px-6 py-3.5 text-left transition-colors"
                  >
                    <span className="col-span-1 text-xs text-slate-400 font-medium">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="col-span-5 text-sm font-semibold text-slate-700 tracking-tight"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {ticket.ticket_number}
                    </span>
                    <span className="col-span-2 text-sm text-slate-500">
                      {ticket.tier?.tier_name || "General"}
                    </span>
                    <span className="col-span-2 text-sm font-bold text-slate-800 text-right">
                      {fmt(ticket.total_amount)}
                    </span>
                    <span className="col-span-1 flex justify-center">
                      <Badge
                        label={capitalize(ticket.status)}
                        variant={ticketVariant(ticket.status)}
                      />
                    </span>

                  </button>

                </div>
              ))}
            </div>

            {/* Table footer total */}
            {transactionDetail && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">
                  {tickets.length} tickets × {fmt(tickets[0]?.total_amount ?? 0)}
                </span>
                <span className="text-base font-bold text-slate-900">
                  {fmt(transactionDetail.amount, transactionDetail.currency)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Loading skeleton for tickets */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <Skeleton className="h-9 w-48" />
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        )}

      </div>
    </div>
  );
}