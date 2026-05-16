"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { BillingService } from "@/services/billingService";
import { Bill } from "@/types/billings";
import {
  CalendarBlank as CalendarBlankIcon,
  ArrowLeft,
  UserIcon,
  ShieldIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { PaymentHistory } from "@/types/billings";
import { usePaginationSync } from "@/hooks/usePaginationSync";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTimeLong } from "@/lib/utils";
import { BillHistoryTable } from "@/app/billings/components/BillHistoryTable";

type StatusKey = "Paid" | "Partial" | "Unpaid" | "Overdue" | string;

const statusStyles: Record<StatusKey, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
};

const InfoRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500 font-medium min-w-[160px]">
      {label}
    </span>
    <span
      className={`text-sm text-slate-800 text-right ${mono ? "font-mono" : "font-medium"}`}
    >
      {value}
    </span>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">
    {children}
  </p>
);

export default function BillDetail() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const searchParams = useSearchParams();

  const { currentPage, limit, handlePageChange, handleLimitChange } =
    usePaginationSync();

  const billId = searchParams.get("id") || "";

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  useEffect(() => {
    document.title = `${t("webTitle.billings")} | Timro-Ticket`;
  }, [locale]);

  const { data: billData, isLoading } = useQuery<Bill>({
    queryKey: queryKeys.users.detail(billId),
    queryFn: () => BillingService.getBillsById(billId),
    enabled: !!billId,
  });

  const [billHistory, setBillHistory] = useState<PaymentHistory[]>([]);
  const [expanded, setExpanded] = React.useState<
    "event" | "organizer" | "admin" | null
  >(null);

  const { data: billHistoryData, isLoading: isBillHistoryLoading } = useQuery<
    PaymentHistory[]
  >({
    queryKey: [
      ...queryKeys.users.detail(billId),
      "history",
      { sortBy, sortOrder },
    ],
    queryFn: () =>
      BillingService.getBillHistoryForTable(billId, {
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    enabled: !!billId,
  });

  useEffect(() => {
    if (billHistoryData) {
      setBillHistory(billHistoryData);
    }
  }, [billHistoryData]);

  const handleSortChange = useCallback(
    (
      newSortBy: string | undefined,
      newSortOrder: "asc" | "desc" | undefined,
    ) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      handlePageChange(1);
    },
    [handlePageChange],
  );

  const billedAmount = billData?.amount ?? 0;
  const paidAmount = billData?.paid_amount ?? 0;

  const paidPct = billedAmount > 0 ? (paidAmount / billedAmount) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Back nav */}
        <button
          onClick={() => router.push("/billings")}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2 group hover:bg-gray-200 p-2 px-4 rounded-lg"
        >
          <ArrowLeft
            weight="duotone"
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">
            {t("billings.detailPage.backToBills", "Back to Bills")}
          </span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {/* Bill number + badges */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <FileTextIcon className="w-[26px] h-[26px] text-[#6366f1] stroke-[1.8]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">
                  {t("billings.detailPage.billNumber", "Bill Number")}
                </p>
                <h1
                  className="text-xl font-bold text-slate-800"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {billData?.bill_number}
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={
                  statusStyles[billData?.status ?? "N/A"] ??
                  "bg-slate-100 text-slate-600 border border-slate-200"
                }
              >
                {t(`billings.status.${billData?.status}`) ?? "N/A"}
              </Badge>
              {/* <Badge
                className={
                  priorityStyles[billData?.priority ?? "N/A"] ??
                  "bg-slate-100 text-slate-600 border border-slate-200"
                }
              >
                {`${t(`billings.billPriority.${billData?.priority}`) ?? "N/A"} ${t("billings.priority")}`}
              </Badge> */}
              {/* <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">
               Bill Type: {t(`billings.billType.${billData?.bill_type}`) ?? "N/A"}
              </Badge> */}
            </div>
          </div>

          {/* Event / Organizer / Admin */}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <CalendarBlankIcon className="text-[#6366f1] w-4 h-4 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {t("billings.detailPage.event", "Event")}
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold text-slate-700 cursor-pointer flex items-center gap-1",
                    expanded === "event"
                      ? "whitespace-normal break-words"
                      : "truncate",
                  )}
                  onClick={() =>
                    setExpanded(expanded === "event" ? null : "event")
                  }
                >
                  <span
                    className={cn(
                      "truncate",
                      expanded === "event" && "whitespace-normal break-words",
                    )}
                  >
                    {billData?.event.title}
                  </span>
                  {/* <CaretDownIcon
                    className={cn(
                      "h-3 w-3 flex-shrink-0 text-slate-400 transition-transform duration-200",
                      expanded === "event" && "rotate-180",
                    )}
                  /> */}
                </p>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <UserIcon className="text-[#059669] w-4 h-4 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {t("billings.detailPage.organizer", "Organizer")}
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold text-slate-700 cursor-pointer",
                    expanded === "organizer"
                      ? "whitespace-normal break-words"
                      : "truncate",
                  )}
                  onClick={() =>
                    setExpanded(expanded === "organizer" ? null : "organizer")
                  }
                  title={
                    expanded === "organizer"
                      ? undefined
                      : billData?.organizer.name
                  }
                >
                  {billData?.organizer.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <ShieldIcon className="text-[#d97706] w-4 h-4 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {t("billings.detailPage.admin", "Admin")}
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold text-slate-700 cursor-pointer",
                    expanded === "admin"
                      ? "whitespace-normal break-words"
                      : "truncate",
                  )}
                  onClick={() =>
                    setExpanded(expanded === "admin" ? null : "admin")
                  }
                  title={
                    expanded === "admin" ? undefined : billData?.actor.name
                  }
                >
                  {billData?.actor.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details — flat, no tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
          {/* Bill Details + Payment Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <SectionTitle>
                {t(
                  "billings.detailPage.billAmountDetails",
                  "Bill Amount Details",
                )}
              </SectionTitle>
              <InfoRow
                label={t("billings.detailPage.totalAmount", "Total Amount")}
                value={
                  billData
                    ? formatCurrency(
                        Number(billData.settlements.total_amount),
                        billData.event.symbol,
                      )
                    : "N/A"
                }
              />
              <InfoRow
                label={t("billings.detailPage.paidAmount", "Paid Amount")}
                value={
                  billData
                    ? formatCurrency(
                        Number(billData.settlements.paid_amount),
                        billData.event.symbol,
                      )
                    : 0
                }
              />
              <InfoRow
                label={t(
                  "billings.detailPage.remainingBalance",
                  "Remaining Balance",
                )}
                value={
                  billData
                    ? formatCurrency(
                        Number(billData.settlements.remaining_balance),
                        billData.event.symbol,
                      )
                    : "N/A"
                }
              />
            </div>
            <div>
              <SectionTitle>
                {t("billings.detailPage.revenueDetails", "Revenue Details")}
              </SectionTitle>
              <InfoRow
                label={t("billings.detailPage.grossRevenue", "Gross Revenue")}
                value={
                  billData
                    ? formatCurrency(
                        Number(billData?.settlements.gross_revenue),
                        billData.event.symbol,
                      )
                    : "N/A"
                }
              />
              <InfoRow
                label={t("billings.detailPage.netRevenue", "Net Revenue")}
                value={
                  billData
                    ? formatCurrency(
                        Number(billData?.settlements.net_revenue),
                        billData.event.symbol,
                      )
                    : "N/A"
                }
              />
              <InfoRow
                label={t(
                  "billings.detailPage.platformCommission",
                  "Platform Commission",
                )}
                value={
                  billData
                    ? formatCurrency(
                        Number(billData?.settlements.platform_commission),
                        billData.event.symbol,
                      )
                    : "N/A"
                }
              />
              <InfoRow
                label={t(
                  "billings.detailPage.organizerEarnings",
                  "Organizer Earnings",
                )}
                value={
                  billData
                    ? formatCurrency(
                        Number(billData?.settlements.organizer_earnings),
                        billData.event.symbol,
                      )
                    : "N/A"
                }
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
          <div>
            <div>
              <SectionTitle>
                {t("billings.detailPage.billDetails", "Bill Details")}
              </SectionTitle>
              <InfoRow
                label={t("billings.detailPage.billType", "Billed Type")}
                value={t(`billings.billType.${billData?.bill_type}`) ?? "N/A"}
              />
              <InfoRow
                label={t("billings.detailPage.notes", "Notes")}
                // value={billData?.notes || "N/A"}
                value={
                  billData?.notes ? (
                    <span className="whitespace-pre-wrap italic font-normal">
                      {billData.notes}
                    </span>
                  ) : (
                    "N/A"
                  )
                }
              />
              <InfoRow
                label={t("billings.detailPage.createdDate", "Created Date")}
                value={
                  formatDateTimeLong(billData?.created_at, locale) || "N/A"
                }
              />
              <InfoRow
                label={t("billings.detailPage.updatedDate", "Updated Date")}
                value={
                  formatDateTimeLong(billData?.updated_at, locale) || "N/A"
                }
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
          {billHistory.length > 0 && (
            <div className="">
              <SectionTitle>
                {t(
                  "billings.detailPage.billPaymentHistory",
                  "Bill Payment History",
                )}
              </SectionTitle>

              <div className="glass-card-lowest rounded-2xl flex-1 min-h-0 flex flex-col">
                <BillHistoryTable
                  wrapperClassName="flex-1 min-h-0 overflow-auto"
                  billHistory={billHistory}
                  isLoading={isLoading}
                  currentPage={1}
                  totalPages={1}
                  total={billHistory.length}
                  limit={10}
                  onLimitChange={() => {}}
                  hasNextPage={false}
                  hasPreviousPage={false}
                  onPageChange={() => {}}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
