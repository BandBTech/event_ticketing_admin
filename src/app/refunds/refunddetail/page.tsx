"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { RefundService } from "@/services/refundService";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { formatDateTimeLong, formatCurrency } from "@/lib/utils";
import { RefundStatusChange } from "@/types/refunds";
import { useRefundStatusHistory } from "@/hooks/useRefunds";
import { RefundData } from "@/types/refunds";
import { cn } from "@/lib/utils";
import {
  CalendarBlank as CalendarBlankIcon,
  ArrowLeft,
  UserIcon,
  BuildingApartmentIcon,
} from "@phosphor-icons/react";
import { BanknoteArrowUp } from "lucide-react";
import StatusHistorySidebar from "./components/StatusHistorySidebar";

function FinRow({
  label,
  value,
  border = true,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-3 ${border ? "border-b border-slate-100" : ""}`}
    >
      <span className="text-sm text-black">{label}</span>
      <span className="text-sm font-semibold px-3 py-1 rounded-full capitalize">
        {value}
      </span>
    </div>
  );
}

export default function RefundDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const refund_id = searchParams.get("id") || "";
  const [refundData, setRefundData] = useState<RefundData | null>(null);
  const [expanded, setExpanded] = useState<
    "event" | "organizer" | "admin" | null
  >(null);

  const { data: refundDetailData, isLoading } = useQuery<RefundData>({
    queryKey: queryKeys.refunds.detail(refund_id),
    queryFn: () => RefundService.getRefundbyId(refund_id),
    enabled: !!refund_id,
  });

  const {
    data: statusHistory1,
    isLoading: isLoadingHistory1,
    refetch: refetchStatusHistory1,
  } = useRefundStatusHistory(refund_id || "");

  useEffect(() => {
    setRefundData(refundDetailData || null);
  }, [refundDetailData]);

  // Ensure statusHistory is an array
  const historyList = Array.isArray(statusHistory1)
    ? statusHistory1
    : statusHistory1 &&
        typeof statusHistory1 === "object" &&
        "status_history" in statusHistory1 &&
        Array.isArray(
          (statusHistory1 as { status_history: unknown[] }).status_history,
        )
      ? (statusHistory1 as { status_history: unknown[] }).status_history
      : [];

  const mappedStatusHistory = (historyList as RefundStatusChange[]).map(
    (h) => ({
      id: h.id,
      refund_id: h.refund_id,
      old_status: h.old_status || "unknown",
      new_status: h.new_status || "unknown",
      changed_by_type: h.changed_by_type || "approval",
      remarks: h.remarks || "",
      created_at: h.changed_at,
    }),
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-7 font-sans">
      {/* Back Button */}
      <button
        onClick={() => router.push("/refunds")}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2 group hover:bg-gray-200 p-2 px-4 rounded-lg"
      >
        <ArrowLeft
          weight="duotone"
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium">{t("refunds.refundDetail.backToRefunds")}</span>
      </button>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 mb-4">
        {/* Bill number + badges */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <BanknoteArrowUp className="w-[26px] h-[26px] text-[#6366f1] stroke-[1.8]" />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">
                  {t("refunds.refundDetail.refundNumber", "Refund Number")}
                </p>
              <h1
                className="text-xl font-bold text-slate-800"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {refundData?.refund_number}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                "bg-yellow-50 text-yellow-800 border border-yellow-200"
              }
            >
              {t("billings.method." + refundData?.transaction.gateway) ?? "N/A"}
            </Badge>
            <Badge
              className={"bg-blue-50 text-blue-700 border border-blue-200"}
              >
              {t("refunds.refundType." + refundData?.refund_type) ?? "N/A"}
            </Badge>
          </div>
        </div>

        {/* Entity Boxes */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Event */}
          <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <CalendarBlankIcon className="text-[#6366f1] w-4 h-4 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {t("refunds.refundDetail.event")}
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
                  expanded === "admin" ? undefined : refundData?.event?.title
                }
              >
                {refundData?.event?.title || "-"}
              </p>
            </div>
          </div>

          {/* Organizer */}
          <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <BuildingApartmentIcon className="text-[#059669] w-4 h-4 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {t("refunds.refundDetail.organizer")}
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
                  expanded === "admin" ? undefined : refundData?.organizer?.name
                }
              >
                {refundData?.organizer?.name || "-"}
              </p>
            </div>
          </div>

          {/* Initiated By */}
          <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <UserIcon className="text-[#d97706] w-4 h-4 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {t("refunds.refundDetail.initiatedBy")}
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
                  expanded === "admin"
                    ? undefined
                    : refundData?.initiated_by.name
                }
              >
                {refundData?.initiated_by.name || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-w-0">
        {/* Financial Summary - 75% */}
        <div className="flex-[6.5] bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            {t("refunds.refundDetail.financialSummary")}
          </h2>

          <FinRow
            label={t("refunds.refundDetail.originalAmount")}
            value={formatCurrency(
              refundData?.transaction.amount || 0,
              refundData?.currency,
              locale,
            )}
          />
          <FinRow
            label={t("refunds.refundDetail.refundAmount")}
            value={
              <>
              <span>{formatCurrency(
              refundData?.amount || 0,
              refundData?.currency,
              locale,
            )}</span> {" "}
            <span className="italic font-normal">( {refundData?.ticket_count} {t("refunds.refundDetail.tickets")} )</span>
              </>
            }
          />
          <FinRow label={t("refunds.refundDetail.reasonForRefund")} value={refundData?.reason} />
          <FinRow
            label={t("refunds.refundDetail.requestedAt")}
            value={formatDateTimeLong(refundData?.requested_at, locale)}
          />
          <FinRow
            label={t("refunds.refundDetail.status")}
            value={
              <>
              {refundData?.status === "succeeded" ? t("status.completed") : t("status." + refundData?.status)}
              </>
            }
          />
        </div>

        {/* Status History - 25% */}
        <div className="flex-[3.5] min-w-0">
          <StatusHistorySidebar
            history={mappedStatusHistory}
            isLoading={isLoadingHistory1}
            onRefresh={() => refetchStatusHistory1()}
          />
        </div>
      </div>
    </div>
  );
}
