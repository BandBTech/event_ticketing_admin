"use client";

import React, { useState, useEffect } from "react";
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
  CaretDownIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { PaymentHistory } from "@/types/billings";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTimeLong } from "@/lib/utils";
import { BillHistoryTable } from "@/app/billings/components/BillHistoryTable";

type StatusKey = "Paid" | "Partial" | "Unpaid" | "Overdue" | string;
type PriorityKey = "High" | "Medium" | "Low" | string;

const statusStyles: Record<StatusKey, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
};

const priorityStyles: Record<PriorityKey, string> = {
  high: "bg-rose-50 text-rose-700 border border-rose-200",
  normal: "bg-sky-50 text-sky-700 border border-sky-200",
  low: "bg-slate-100 text-slate-600 border border-slate-200",
};

const InfoStringRow = ({
  label,
  value,
  ref_value,
}: {
  label: string;
  value: React.ReactNode;
  ref_value?: string;
}) => {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const displayValue =
    value === null || value === undefined || value === ""
      ? t("N/A")
      : typeof value === "string"
        ? t(`billings.method.${value}`)
        : value;

  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 font-medium min-w-[160px]">
        {label}
      </span>
      <span className={`text-sm text-slate-800 text-right font-medium`}>
        {ref_value ? (
          <span className="font-mono text-blue-600 hover:underline cursor-pointer">
            {ref_value}
          </span>
        ) : (
          displayValue
        )}
      </span>
    </div>
  );
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

const MoneyCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) => {
  const { locale } = useLanguageStore();
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-1">
      <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
        {label}
      </span>
      <span className={`text-2xl font-bold ${accent ?? "text-slate-800"}`}>
        {formatCurrency(value, undefined, locale)}
      </span>
    </div>
  );
};

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

  const billId = searchParams.get("id") || "";

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
    queryKey: [...queryKeys.users.detail(billId), "history"],
    queryFn: () => BillingService.getBillHistory(billId),
    enabled: !!billId,
  });

  useEffect(() => {
    if (billHistoryData) {
      setBillHistory(billHistoryData);
    }
  }, [billHistoryData]);

  const billedAmount = billData?.billed_amount ?? 0;
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
                    {billData?.event_title}
                  </span>
                  <CaretDownIcon
                    className={cn(
                      "h-3 w-3 flex-shrink-0 text-slate-400 transition-transform duration-200",
                      expanded === "event" && "rotate-180",
                    )}
                  />
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
                      : billData?.organizer_name
                  }
                >
                  {billData?.organizer_name || "N/A"}
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
                    expanded === "admin" ? undefined : billData?.admin_name
                  }
                >
                  {billData?.admin_name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Money Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MoneyCard
            label={t("billings.detailPage.totalRevenue", "Total Revsenue")}
            value={billData?.total_revenue ?? 0}
          />
          <MoneyCard
            label={t("billings.detailPage.commission", "Commission")}
            value={billData?.total_commission ?? 0}
            accent="text-indigo-600"
          />
          <MoneyCard
            label={t(
              "billings.detailPage.organizerEarnings",
              "Organizer Earnings",
            )}
            value={billData?.organizer_earnings ?? 0}
            accent="text-emerald-600"
          />
          <MoneyCard
            label={t("billings.detailPage.billedAmount", "Billed Amount")}
            value={billData?.billed_amount ?? 0}
            accent="text-amber-600"
          />
        </div>

        {/* Details — flat, no tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
          {/* Bill Details + Payment Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <SectionTitle>
                {t("billings.detailPage.billDetails", "Bill Details")}
              </SectionTitle>
              <InfoRow
                label={t("billings.detailPage.billedDate", "Billed Date")}
                // value={fmtDate(billData?.bill_date ?? "N/A")}
                value={formatDateTimeLong(billData?.bill_date, locale) || "N/A"}
              />
              <InfoRow
                label={t("billings.detailPage.createdDate", "Created Date")}
                value={
                  formatDateTimeLong(billData?.created_at, locale) || "N/A"
                }
              />
              <InfoRow
                label={t("billings.detailPage.paidDate", "Paid Date")}
                value={formatDateTimeLong(billData?.paid_date, locale) || "N/A"}
              />
            </div>
            <div>
              <SectionTitle>
                {t(
                  "billings.detailPage.paymentInformation",
                  "Payment Information",
                )}
              </SectionTitle>
              <InfoStringRow
                label={t("billings.detailPage.paymentMethod", "Payment Method")}
                value={billData?.payment_method}
              />
              {/* <InfoStringRow
                label={t(
                  "billings.detailPage.paymentReference",
                  "Payment Reference",
                )}
                value={""}
                ref_value={billData?.payment_ref}
              /> */}
              <InfoRow
                label={t("billings.detailPage.billedAmount", "Billed Amount")}
                value={formatCurrency(
                  billData?.billed_amount ?? 0,
                  undefined,
                  locale,
                )}
              />
              <InfoRow
                label={t("billings.detailPage.paidAmount", "Paid Amount")}
                value={
                  <span className="text-emerald-600">
                    {formatCurrency(
                      billData?.paid_amount ?? 0,
                      undefined,
                      locale,
                    )}
                  </span>
                }
              />
              <InfoRow
                label={t("billings.detailPage.remaining", "Remaining")}
                value={
                  <span className="text-rose-500">
                    {formatCurrency(
                      billData?.remaining_amount ?? 0,
                      undefined,
                      locale,
                    )}
                  </span>
                }
              />
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {billHistory.length > 0 && (
            <div>
              <SectionTitle>
                {t(
                  "billings.detailPage.billPaymentHistory",
                  "Bill Payment History",
                )}
              </SectionTitle>

              <BillHistoryTable
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
                sortBy={""}
                sortOrder={"asc"}
                onSortChange={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
