"use client";

import React, {useState} from "react";
import {
  ArrowLeft,
  TicketIcon,
  UserIcon,
  CreditCardIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useSearchParams } from "next/navigation";
import { TransactionService } from "@/services/transactionService";
import { formatCurrency } from "@/lib/utils";
import { formatDateTimeLong } from "@/lib/utils";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { TransactionPaymentData } from "@/types/paymenttransactiondetail";
import { TicketTable } from "../components/TicketTable";

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
  if (status === "succeeded") return "success";
  if (status === "pending") return "warning";
  if (status === "failed") return "danger";
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
    <span className="text-sm text-black">{label}: </span>
    <span
      className={`text-sm font-semibold text-slate-800 text-right ${mono ? "tracking-tight" : ""}`}
    >
      {value}
    </span>
  </div>
);

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

export default function PaymentDetail() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("id") || "";
    const [isCancelBillDialogOpen, setIsCancelBillDialogOpen] = useState(false);

  const { data: paymentDetailData, isLoading } =
    useQuery<TransactionPaymentData>({
      queryKey: queryKeys.users.detail(transactionId),
      queryFn: () =>
        TransactionService.getTransactionPaymentDetailById(transactionId),
      enabled: !!transactionId,
    });

  const transaction = paymentDetailData?.transaction;
  const symbol = transaction?.symbol;
  const paymentIntent = paymentDetailData?.payment_intent;
  const tickets = paymentDetailData?.tickets ?? [];

  return (
    <div
      className="min-h-screen bg-[#f4f6f9] py-10 px-4"
    >
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
          <span className="font-medium">
            {t("transactions.backToTransactions", "Back to Transactions")}
          </span>
        </button>

        {/* Page header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t("transactions.paymentDetails.paymentDetail", "Payment Detail")}
            </h1>
          </div>
          {transaction && (
            <div className="flex items-center gap-2 mt-1">
              <Badge
                label={t("status." + transaction.status)}
                variant={txnVariant(transaction.status)}
              />
              <Badge
                label={t(
                  "billings.method." + transaction.payment_gateway,
                  transaction.payment_gateway || "—",
                )}
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
                icon={
                  <span className="text-violet-500">
                    <TicketIcon className="w-4 h-4" />
                  </span>
                }
                title={t("transactions.paymentDetails.event", "Event")}
                iconBg="bg-violet-50"
              />
              <InfoRow
                label={t("transactions.paymentDetails.eventName", "Event Name")}
                value={transaction.event.name}
              />
              <InfoRow
                label={t(
                  "transactions.paymentDetails.ticketQty",
                  "Ticket Quantity",
                )}
                value={`${transaction.quantity} ${" "} ${t("transactions.paymentDetails.tickets")}`}
              />
            </div>

            {/* Buyer */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <CardHeader
                icon={
                  <span className="text-emerald-500">
                    <UserIcon className="w-4 h-4" />
                  </span>
                }
                title={t("transactions.paymentDetails.buyer", "Buyer")}
                iconBg="bg-emerald-50"
              />
              <InfoRow
                label={t("transactions.paymentDetails.userName", "User Name")}
                value={transaction.user.name}
              />
              <InfoRow
                label={t("transactions.paymentDetails.email", "Email")}
                value={transaction.user.email}
              />
            </div>

            {/* Payment Intent */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <CardHeader
                icon={
                  <span className="text-amber-500">
                    <CreditCardIcon className="w-4 h-4" />
                  </span>
                }
                title={t("transactions.paymentDetails.payment", "Payment")}
                iconBg="bg-amber-50"
              />
              <InfoRow
                label={t("transactions.paymentDetails.gateway", "Gateway")}
                value={
                  <span className="capitalize">
                    {t(
                      "billings.method." + paymentIntent.payment_gateway,
                      paymentIntent.payment_gateway || "—",
                    )}
                  </span>
                }
              />
              <InfoRow
                label={t("transactions.paymentDetails.createdAt", "Created At")}
                value={formatDateTimeLong(paymentIntent.created_at, locale)}
              />

              {/* Amount breakdown */}
              <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-2">
                <div className="flex justify-between text-xs text-black">
                  <span>
                    {t(
                      "transactions.paymentDetails.totalAmount",
                      "Total Amount",
                    )}
                    :{" "}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {formatCurrency(
                      transaction.amount,
                      symbol
                    )}
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
            <div className="px-2 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                  <TicketIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black">
                    {t("transactions.paymentDetails.tickets", "Tickets")}
                  </h3>
                  <p className="text-xs text-black">
                    {tickets.length}{" "}
                    {t(
                      "transactions.paymentDetails.ticketsIssued",
                      "tickets issued in this payment",
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Table  */}
            <TicketTable
              billings={tickets}
              symbol={symbol}
              isLoading={isLoading}
              currentPage={1}
              totalPages={1}
              total={tickets.length}
              limit={0}
              onLimitChange={() => {}}
              hasNextPage={false}
              hasPreviousPage={false}
              onPageChange={() => {}}
              sortBy={""}
              sortOrder={"asc"}
              onSortChange={() => {}}
              setIsCancelBillDialogOpen={setIsCancelBillDialogOpen}
              onOpenCancelBill={isCancelBillDialogOpen}
            />
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
