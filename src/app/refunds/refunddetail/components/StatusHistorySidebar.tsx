import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { EventStatusHistory } from "@/types/event";
import { formatDateTime } from "@/lib/utils";
import {
  Circle,
  User,
  ChatCircle,
  CaretDown,
  CaretUp,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  StopCircle,
  ArrowsClockwise,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { RefundStatusChange } from "@/types/refunds";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusHistorySidebarProps {
  history: RefundStatusChange[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function StatusHistorySidebar({
  history,
  isLoading,
  onRefresh,
}: StatusHistorySidebarProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  // Ensure history is an array. If it's an object, check for common list properties.
  const historyList = useMemo(() => {
    let list: RefundStatusChange[] = [];
    if (Array.isArray(history)) {
      list = history;
    } else if (history && typeof history === "object") {
      // Check for common wrappers like { history: [] } or { items: [] }
      const h = history as Record<string, unknown>;
      list = Array.isArray(h.history)
        ? (h.history as RefundStatusChange[])
        : Array.isArray(h.items)
          ? (h.items as RefundStatusChange[])
          : Array.isArray(h.data)
            ? (h.data as RefundStatusChange[])
            : [];
    }

    return list.sort(
      (a, b) =>
        new Date(b.changed_at || "").getTime() -
        new Date(a.changed_at || "").getTime(),
    );
  }, [history]);

  // Determine which items to show
  const displayItems = useMemo(() => {
    if (historyList.length <= 4 || isExpanded) return historyList;

    // Show first 3 and the very last one
    const firstThree = historyList.slice(0, 3);
    const lastOne = historyList[historyList.length - 1];
    return [...firstThree, "DIVIDER", lastOne];
  }, [historyList, isExpanded]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Circle size={16} weight="fill" className="text-amber-500" />;
      case "processing":
        return <SpinnerGapIcon size={16} className="text-yellow-700" />;
      case "succeeded":
        return <CheckCircle size={16} className="text-emerald-500" />;
      case "failed":
        return <XCircle size={16} className="text-destructive" />;
      default:
        return <Circle size={16} className="text-blue-500" />;
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-600 bg-yellow-700 text-yellow-100";
      case "processing":
        return "border-yellow-600 bg-yellow-700 text-yellow-100";
      case "succeeded":
        return "border-green-600 bg-green-700 text-green-100";
      case "failed":
        return "border-red-600 bg-red-700 text-white";
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "succeeded") {
      return "completed";
    }

    return t(`event.badge.${status}`, status);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl glass-card-lower p-6 space-y-4 max-h-[600px] overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 sticky top-0 bg-white pb-2 z-20">
          {t("event.section.statusHistory", "Status History")}
        </h3>
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative pl-10">
              <div className="absolute left-0 -top-1 w-8 h-8 flex items-center justify-center rounded-full bg-white border-2 border-slate-100 z-10">
                <Skeleton className="w-4 h-4 rounded-full" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2 text-xs">
                  <Skeleton className="h-3 w-4" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!historyList || historyList.length === 0) {
    return (
      <div className="rounded-2xl glass-card-lower p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {t("event.section.statusHistory", "Status History")}
        </h3>
        <p className="text-gray-500 text-sm">
          {t(
            "event.text.noStatusHistory",
            "No status changes recorded for this event.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-card-lower p-6 space-y-4 @container">
      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 pb-2 z-20">
        {t("event.section.statusHistory", "Status History")}
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 h-auto py-0.5 px-1.5 flex items-center gap-1"
          >
            <ArrowsClockwise
              size={12}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {t("dashboard.dataDisplay.refresh", "Refresh")}
          </Button>
        )}
      </h3>

      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {displayItems.map((item) => {
          if (item === "DIVIDER") {
            return (
              <div key="divider" className="relative pl-10 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="h-6 -ml-10 mt-8 mb-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-500 px-3 flex gap-1 items-center shadow-sm w-fit"
                >
                  <CaretDown size={12} />
                  {t("common.viewCountMore", "View {count} more").replace(
                    "{count}",
                    (historyList.length - 4).toString(),
                  )}
                </Button>
              </div>
            );
          }

          const historyItem = item as RefundStatusChange;

          return (
            <div key={historyItem.id} className="relative pl-10 group">
              <div className="absolute left-0 -top-1 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 z-10 transition-colors">
                {getStatusIcon(historyItem.new_status)}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex flex-col gap-1 @sm:flex-row @sm:items-center @sm:justify-between">
                  <Badge
                    variant="outline"
                    className={`uppercase text-[10px] px-1.5 py-0 font-semibold rounded-full w-fit ${getStatusBadgeStyles(historyItem.new_status)}`}
                  >
                    {getStatusLabel(historyItem.new_status)}
                  </Badge>
                  <span className="text-[10px] text-black">
                    {formatDateTime(historyItem.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-1 text-[10px] text-black">
                  <User size={10} />
                  <span>
                    {historyItem.changed_by_type ||
                      t("common.text.system", "System")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isExpanded && historyList.length > 4 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-xs text-slate-400 hover:text-slate-600 flex gap-1 h-auto py-1"
          >
            <CaretUp size={12} />
            {t("common.showLess", "Show Less")}
          </Button>
        </div>
      )}
    </div>
  );
}
