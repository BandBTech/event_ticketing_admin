"use client";

import React, { useState, useCallback } from "react";
import OverviewScreen from "./components/OverviewSection";
import SalesScreen from "./components/SalesScreen";
import CustomerAnalyticsScreen from "./components/CustomerAnalyticsScreen";
import { ReportService } from "@/services/reportService";
import { useQuery } from "@tanstack/react-query";
import { ReportResponse } from "@/types/reports";
import { adminService } from "@/services/adminService";
import { ReportFilters } from "./components/ReportFilters";
import { ReportTabNav } from "./components/ReportTabNav";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { AsyncComboboxOption } from "@/components/ui/async-combobox";
import FinancialScreen from "@/app/reports/components/FinancialScreen";
import EventPerformanceScreen from "@/app/reports/components//EventPerformanceScreen";

const REPORT_TYPE = [
  { label: "Admin Overview", value: "overview" },
  { label: "Customer Analytics", value: "customer-analytics" },
  { label: "Event Performances", value: "event-performance" },
  { label: "Financial", value: "financial" },
  { label: "Sales Report", value: "sales" },
];
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

function getDateRangeFromPreset(preset: DateRangePreset): {
  startDate: string;
  endDate: string;
} {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  switch (preset) {
    case "today":
      return {
        startDate: today.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    case "yesterday":
      return {
        startDate: yesterday.toISOString().split("T")[0],
        endDate: yesterday.toISOString().split("T")[0],
      };
    case "last-7-days": {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return {
        startDate: sevenDaysAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    case "last-month": {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return {
        startDate: oneMonthAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    case "last-3-months": {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return {
        startDate: threeMonthsAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    case "last-6-months": {
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return {
        startDate: sixMonthsAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    case "last-year": {
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return {
        startDate: oneYearAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    default:
      return {
        startDate: "",
        endDate: "",
      };
  }
}

export default function ReportsPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [activeTab, setActiveTab] = useState<ReportType>("overview");
  const [dateRangePreset, setDateRangePreset] =
    useState<DateRangePreset>("last-7-days");
  const [selectedEventId, setSelectedEventId] = useState("");

  const { data: response, isLoading } = useQuery<ReportResponse>({
    queryKey: ["report", activeTab, selectedEventId],
    queryFn: () =>
      ReportService.getReport({
        type: activeTab,
        event_id: selectedEventId,
      }),
    enabled:
      !!activeTab && (activeTab !== "event-performance" || !!selectedEventId),
    placeholderData: (previousData) => previousData,
  });

  const fetchEvents = useCallback(
    async (search: string): Promise<AsyncComboboxOption[]> => {
      try {
        const response = await adminService.getAllEntities("events");
        if (!response || !Array.isArray(response)) return [];

        const filtered = search
          ? response.filter((event) =>
              event.title.toLowerCase().includes(search.toLowerCase()),
            )
          : response;

        return filtered.map((event) => ({
          value: event.id,
          label: event.title,
        }));
      } catch (error) {
        console.error("Failed to fetch events:", error);
        return [];
      }
    },
    [],
  );

  const isEventIdSelected = selectedEventId ? true : false;

  return (
    <div className="min-h-screen px-8 space-y-6">
      <div className=" rounded-2xl flex-1 flex flex-col">
        {/* Header  */}
        <div className="flex items-start justify-between py-4 gap-2 flex-wrap">
          <ReportTabNav activeTab={activeTab} onTabChange={setActiveTab} />
          <ReportFilters
            dateRangePreset={dateRangePreset}
            onDateRangePresetChange={setDateRangePreset}
            activeTab={activeTab}
            selectedEventId={selectedEventId}
            onEventChange={setSelectedEventId}
            fetchEvents={fetchEvents}
          />
        </div>

        {activeTab === "overview" ? (
          <OverviewScreen data={response} />
        ) : activeTab === "sales" ? (
          <SalesScreen data={response} />
        ) : activeTab === "financial" ? (
          <FinancialScreen data={response} />
        ) : activeTab === "event-performance" ? (
          <EventPerformanceScreen
            data={response}
            isEventIdSelected={isEventIdSelected}
          />
        ) : (
          <CustomerAnalyticsScreen data={response} />
        )}
      </div>
    </div>
  );
}
