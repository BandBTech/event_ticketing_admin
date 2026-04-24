"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { RefundService } from "@/services/refundService";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { formatDateTimeLong, formatCurrency } from "@/lib/utils";
import {RefundStatusChange} from "@/types/refunds"
import {
  useEventStatusHistory,
  useEventAnalyticsById,
} from "@/hooks/useEvents";
import {useRefundStatusHistory} from "@/hooks/useRefunds"
import { RefundResponse, RefundData, StatusHistoryItem } from "@/types/refunds";
import { cn } from "@/lib/utils";
import {
  CalendarBlank as CalendarBlankIcon,
  ArrowLeft,
  UserIcon,
  BuildingApartmentIcon,
  ShieldIcon,
  FileTextIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { BanknoteArrowUp } from "lucide-react";
import {
  MoreHorizontal,
  Ticket,
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import StatusHistorySidebar from "./components/StatusHistorySidebar";

// ── Types ─────────────────────────────────────────────────────────────────────

// ── Dummy Data ─────────────────────────────────────────────────────────────────

const DUMMY_STATUS_HISTORY: StatusHistoryItem[] = [
  {
    id: "59a01b4c-6478-4058-bddc-1c56c7dbd39f",
    refund_id: "6ef3a9a7-5d26-4ac4-8419-7718448d1925",
    old_status: "processing",
    new_status: "succeeded",
    changed_by_type: "system",
    remarks: "Refund confirmed via webhook",
    metadata: {
      request_id: "pi_3TOCPJKxcHgCsA3J0X4FJywX",
      source: "webhook_confirmation",
      webhook_event_id: "ch_3TOCPJKxcHgCsA3J0yppy0cY",
    },
    changed_at: "2026-04-22T13:50:30.73426Z",
  },
  {
    id: "70623691-ec41-4e97-9893-7fcaf5f62b18",
    refund_id: "6ef3a9a7-5d26-4ac4-8419-7718448d1925",
    old_status: "processing",
    new_status: "processing",
    changed_by_type: "system",
    remarks:
      "Refund initiated via payment gateway, awaiting webhook confirmation",
    metadata: {
      amount: 800,
      awaiting_webhook: true,
      gateway_refund_id: "re_3TOCPJKxcHgCsA3J0KgUIajw",
    },
    changed_at: "2026-04-22T13:50:29.596149Z",
  },
  {
    id: "c67362f1-768c-4c15-a287-e80201ed0f1d",
    refund_id: "6ef3a9a7-5d26-4ac4-8419-7718448d1925",
    old_status: "pending",
    new_status: "processing",
    changed_by_id: "9c7eebd0-2191-4a20-92c6-1589c982b212",
    changed_by: {
      id: "9c7eebd0-2191-4a20-92c6-1589c982b212",
      name: "Admin updted 123",
      email: "admin@timroticket.com",
    },
    changed_by_type: "admin",
    remarks: "Refund approved and moved to processing",
    changed_at: "2026-04-22T13:50:28.406981Z",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000001",
    refund_id: "6ef3a9a7-5d26-4ac4-8419-7718448d1925",
    old_status: "pending",
    new_status: "pending",
    changed_by_type: "system",
    remarks: "Refund request received and queued for review",
    changed_at: "2026-04-22T13:20:45.509881Z",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatShortDate(dateStr: string) {
  return format(new Date(dateStr), "MM/dd/yyyy, h:mm a");
}

function formatRefundType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Status History Colors ─────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  { badge: string; dot: string; ring: string }
> = {
  succeeded: {
    badge: "bg-emerald-500 text-white",
    dot: "bg-emerald-400",
    ring: "border-emerald-300",
  },
  completed: {
    badge: "bg-emerald-500 text-white",
    dot: "bg-emerald-400",
    ring: "border-emerald-300",
  },
  processing: {
    badge: "bg-blue-500 text-white",
    dot: "bg-blue-400",
    ring: "border-blue-300",
  },
  approved: {
    badge: "bg-emerald-500 text-white",
    dot: "bg-emerald-400",
    ring: "border-emerald-300",
  },
  pending: {
    badge: "bg-amber-500 text-white",
    dot: "bg-amber-400",
    ring: "border-amber-400",
  },
  on_hold: {
    badge: "bg-orange-600 text-white",
    dot: "bg-orange-400",
    ring: "border-orange-400",
  },
  rejected: {
    badge: "bg-red-500 text-white",
    dot: "bg-red-400",
    ring: "border-red-300",
  },
  failed: {
    badge: "bg-red-500 text-white",
    dot: "bg-red-400",
    ring: "border-red-300",
  },
};

function getStatusStyle(status: string) {
  return (
    STATUS_STYLES[status.toLowerCase()] ?? {
      badge: "bg-slate-400 text-white",
      dot: "bg-slate-300",
      ring: "border-slate-300",
    }
  );
}

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

// ── Status History Component ──────────────────────────────────────────────────

const INITIAL_VISIBLE = 3;

function StatusHistory({ items }: { items: StatusHistoryItem[] }) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? items : items.slice(0, INITIAL_VISIBLE);
  const hiddenCount = items.length - INITIAL_VISIBLE;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-slate-800">
          Status History
        </h2>
        <button className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-200" />

        <div className="flex flex-col gap-0">
          {visible.map((item, i) => {
            const style = getStatusStyle(item.new_status);
            const isLast = i === visible.length - 1;
            const isActualLast = i === items.length - 1;

            return (
              <div key={item.id}>
                <div className="flex gap-4 relative">
                  {/* Dot */}
                  <div className="flex-shrink-0 mt-1 z-10">
                    {isActualLast ? (
                      /* Filled circle for the very last (oldest) entry */
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${style.ring} flex items-center justify-center`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${style.dot}`}
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${style.ring} bg-white`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`pb-5 flex-1 ${isLast && !expanded && hiddenCount > 0 ? "pb-2" : ""}`}
                  >
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}
                    >
                      {item.new_status.replace(/_/g, " ")}
                    </span>
                    <p className="text-[11.5px] text-slate-400 mt-1">
                      {formatShortDate(item.changed_at)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <User size={11} className="text-slate-300" />
                      <p className="text-[11.5px] text-slate-400">
                        {item.changed_by?.name ?? item.changed_by_type}
                      </p>
                    </div>
                    {item.remarks && (
                      <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
                        {item.remarks}
                      </p>
                    )}
                  </div>
                </div>

                {/* "View N More" toggle between visible and hidden items */}
                {!expanded && isLast && hiddenCount > 0 && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-full px-3 py-1.5 mb-4 ml-0 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronDown size={13} />
                    View {hiddenCount} More
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Collapse button */}
        {expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(false)}
            className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-full px-3 py-1.5 mt-1 hover:bg-slate-50 transition-colors"
          >
            <ChevronUp size={13} />
            Show Less
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface RefundDetailProps {
  data?: RefundData | null;
  onBack?: () => void;
}

export default function RefundDetail({ onBack }: RefundDetailProps) {
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
    data: statusHistory,
    isLoading: isLoadingHistory,
    refetch: refetchStatusHistory,
  } = useEventStatusHistory("0823d81f-a8fb-42c4-ad2a-2d72f74e6352");

  const {
    data: statusHistory1,
    isLoading: isLoadingHistory1,
    refetch: refetchStatusHistory1,
  } = useRefundStatusHistory(refund_id || "");  

  useEffect(() => {
    setRefundData(refundDetailData || null);
  }, [refundDetailData]);

  const history = DUMMY_STATUS_HISTORY;


  // Ensure statusHistory is an array
const historyList = Array.isArray(statusHistory1)
  ? statusHistory1
  : statusHistory1 &&
      typeof statusHistory1 === "object" &&
      "status_history" in statusHistory1 &&
      Array.isArray((statusHistory1 as { status_history: unknown[] }).status_history)
    ? (statusHistory1 as { status_history: unknown[] }).status_history
    : [];      

  const mappedStatusHistory = (historyList as RefundStatusChange[]).map((h) => ({
    id: h.id,
    event_id: h.refund_id,
    old_status: h.old_status || "unknown",
    new_status: h.new_status || "unknown",
    status_type: h.changed_by_type || "approval",
    remark: h.remarks || "",
    changed_by: h.changed_by_type,
    changed_by_name: h.changed_by_type || "Unknown",
    created_at: h.changed_at,
  }));  

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
        <span className="font-medium">Back to Refunds</span>
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
                {t("", "Refund Number")}
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
              {formatRefundType(refundData?.refund_type || "")}
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

        {/* Entity Boxes */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Event */}
          <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <CalendarBlankIcon className="text-[#6366f1] w-4 h-4 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Event
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
                {refundData?.event?.title}
              </p>
            </div>
          </div>

          {/* Organizer */}
          <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <BuildingApartmentIcon className="text-[#059669] w-4 h-4 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Organizer
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
                {refundData?.organizer?.name}
              </p>
            </div>
          </div>

          {/* Initiated By */}
          <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <UserIcon className="text-[#d97706] w-4 h-4 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Initiated By
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
                {refundData?.initiated_by.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-w-0">
        {/* Financial Summary - 75% */}
        <div className="flex-[6.5] bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Financial Summary
          </h2>

          <FinRow
            label="Original Amount"
            value={formatCurrency(
              refundData?.transaction.amount || 0,
              refundData?.currency,
              locale,
            )}
          />
          <FinRow
            label="Refund Amount"
            value={formatCurrency(
              refundData?.amount || 0,
              refundData?.currency,
              locale,
            )}
          />
          <FinRow label="Reason for Refund" value={refundData?.reason} />
          <FinRow
            label="Requested At"
            value={formatDateTimeLong(refundData?.requested_at, locale)}
          />
        </div>

        {/* Status History - 25% */}
        <div className="flex-[3.5] min-w-0">
          {/* <StatusHistory items={history} /> */}

          {/* Status History */}
          <StatusHistorySidebar
            history={mappedStatusHistory}
            isLoading={isLoadingHistory}
            onRefresh={() => refetchStatusHistory()}
          />
        </div>
      </div>
    </div>
  );
}
