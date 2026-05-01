"use client";

import { CalendarIcon } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AsyncCombobox,
  AsyncComboboxOption,
} from "@/components/ui/async-combobox";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

export type ReportType =
  | "overview"
  | "sales"
  | "customer-analytics"
  | "financial"
  | "event-performance";

type DateRangePreset =
  | "today"
  | "yesterday"
  | "last-7-days"
  | "last-month"
  | "last-3-months"
  | "last-6-months"
  | "last-year";

interface ReportFiltersProps {
  dateRangePreset: DateRangePreset;
  onDateRangePresetChange: (preset: DateRangePreset) => void;
  activeTab: ReportType;
  selectedEventId: string;
  onEventChange: (eventId: string) => void;
  fetchEvents: (search: string) => Promise<AsyncComboboxOption[]>;
}

export function ReportFilters({
  dateRangePreset,
  onDateRangePresetChange,
  activeTab,
  selectedEventId,
  onEventChange,
  fetchEvents,
}: ReportFiltersProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Select value={dateRangePreset} onValueChange={onDateRangePresetChange}>
          <SelectTrigger className="w-48 h-8 text-sm pl-9 bg-white">
            <SelectValue
              placeholder={t(
                "reports.dateRange.placeholder",
                "Select date range",
              )}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">
              {t("reports.dateRange.today", "Today")}
            </SelectItem>
            <SelectItem value="yesterday">
              {t("reports.dateRange.yesterday", "Yesterday")}
            </SelectItem>
            <SelectItem value="last-7-days">
              {t("reports.dateRange.last7Days", "Last 7 Days")}
            </SelectItem>
            <SelectItem value="last-month">
              {t("reports.dateRange.lastMonth", "Last Month")}
            </SelectItem>
            <SelectItem value="last-3-months">
              {t("reports.dateRange.last3Months", "Last 3 Months")}
            </SelectItem>
            <SelectItem value="last-6-months">
              {t("reports.dateRange.last6Months", "Last 6 Months")}
            </SelectItem>
            <SelectItem value="last-year">
              {t("reports.dateRange.lastYear", "Last Year")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeTab === "event-performance" && (
        <div className="">
          <AsyncCombobox
            queryKey={["filter", "events"]}
            value={selectedEventId}
            onValueChange={onEventChange}
            fetchOptions={fetchEvents}
            placeholder={t("billings.addBillModal.selectEvent")}
            searchPlaceholder={t("billings.addBillModal.searchEvent")}
            emptyText={t("common.noResults")}
            className="w-[200px] text-sm h-8 justify-between px-3!"
            debounceMs={300}
          />
        </div>
      )}
    </div>
  );
}
