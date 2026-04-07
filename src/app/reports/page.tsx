"use client";

import React, { useState, useCallback } from "react";
import { ArrowsClockwise } from "@phosphor-icons/react";
import OverviewScreen from "./components/OverviewSection";
import SalesScreen from "./components/SalesScreen";
import CustomerAnalyticsScreen from "./components/CustomerAnalyticsScreen";
import { ReportService } from "@/services/reportService";
import { useQuery } from "@tanstack/react-query";
import { ReportResponse } from "@/types/reports";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/adminService";
import {
  AsyncCombobox,
  AsyncComboboxOption,
} from "@/components/ui/async-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FinancialScreen from "@/app/reports/components/FinancialScreen"
import EventPerformanceScreen from "@/app/reports/components//EventPerformanceScreen"

const REPORT_TYPE = [
  { label: "Admin Overview", value: "overview" },
  { label: "Customer Analytics", value: "customer-analytics" },
  { label: "Event Performances", value: "event-performance" },
  { label: "Financial", value: "financial" },
  { label: "Sales Report", value: "sales" },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [reportType, setReportType] = useState("overview");
  const [eventId, setEventId] = useState("");
  

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

const { data: response, isLoading } = useQuery<ReportResponse>({
  queryKey: ["report", reportType, eventId],

  queryFn: () =>
    ReportService.getReport({
      type: reportType,
      event_id: eventId,
    }),

  enabled:
    !!reportType &&
    (reportType !== "event-performance" || !!eventId),

  placeholderData: (previousData) => previousData,
});


  return (
    <div className="min-h-screen p-8 space-y-6">
      <div className=" rounded-2xl flex-1 flex flex-col">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
          <div className="flex gap-4">
            {" "}
            <div className="">
              {/* Date Range */}
              {/* <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="last-3-months">Last 3 months</option>
                <option value="last-6-months">Last 6 months</option>
                <option value="last-year">Last year</option>
              </select>
              <CaretDown
                weight="bold"
                className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div> */}

              {/* Report Type */}

              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full text-sm h-9 justify-between px-3 bg-white font-medium">
                  <SelectValue placeholder={"Select Type"} />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPE.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Event ID */}
            {reportType === "event-performance" && (
              <div className="space-y-2 w-[250px] font-medium">
                <AsyncCombobox
                  queryKey={["filter", "events"]}
                  value={eventId}
                  onValueChange={setEventId}
                  fetchOptions={fetchEvents}
                  placeholder="Select Event"
                  searchPlaceholder="Search Events"
                  emptyText="No events found."
                  className="w-full text-sm h-9 justify-between px-3! font-medium"
                  debounceMs={300}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2 bg-background/80 backdrop-blur-sm"
            >
              <ArrowsClockwise weight="duotone" className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {reportType === "overview" ? (
          <OverviewScreen data={response} />
        ) : reportType === "sales" ? (
          <SalesScreen data={response} />
        ) : reportType === "financial" ? (
          <FinancialScreen data={response} />
        ) : reportType === "event-performance" ? (
          <EventPerformanceScreen data={response} />
        ) : (
          <CustomerAnalyticsScreen data={response} />
        )}
      </div>
    </div>
  );
}
