"use client";

import React, { useState } from "react";
import { CaretDown, ArrowsClockwise } from "@phosphor-icons/react";
import OverviewScreen from "./components/OverviewSection";
import SalesScreen from "./components/SalesScreen";
import CustomerAnalyticsScreen from "./components/CustomerAnalyticsScreen";
import { ReportService } from "@/services/reportService";
import { useQuery } from "@tanstack/react-query";
import { ReportResponse, Overview } from "@/types/reports";

const overviewData = {
  summary_metrics: {
    total_revenue: 283031,
    total_commission: 28446.225,
    organizer_share: 254584.775,
    total_tickets_sold: 605,
    active_events: 2,
    total_events: 26,
    total_transactions: 119,
    completed_transactions: 119,
    pending_transactions: 0,
    failed_transactions: 0,
    average_order_value: 2378.4117647058824,
    conversion_rate: 2326.923076923077,
  },
  top_performing_events: null,
  recent_transactions: null,
  revenue_trend: null,
  ticket_sales_trend: null,
  events_statistics: {
    total_events: 99,
    draft_events: 0,
    pending_events: 2,
    approved_events: 0,
    rejected_events: 13,
    on_sale_events: 2,
    live_events: 0,
    completed_events: 57,
    cancelled_events: 23,
  },
};

const saleData = {
  summary_metrics: {
    total_revenue: 283031,
    total_commission: 28446.225,
    organizer_share: 254584.775,
    total_tickets_sold: 605,
    active_events: 2,
    total_events: 26,
    total_transactions: 119,
    completed_transactions: 119,
    pending_transactions: 0,
    failed_transactions: 0,
    average_order_value: 2378.4117647058824,
    conversion_rate: 2326.923076923077,
  },
  daily_sales: [
    {
      date: "2026-03-04T00:00:00Z",
      revenue: 12005,
      tickets_sold: 25,
      transactions: 4,
      average_order_value: 3001.25,
    },
    {
      date: "2026-03-06T00:00:00Z",
      revenue: 9600,
      tickets_sold: 24,
      transactions: 3,
      average_order_value: 3200,
    },
    {
      date: "2026-03-08T00:00:00Z",
      revenue: 1492,
      tickets_sold: 5,
      transactions: 3,
      average_order_value: 497.3333333333333,
    },
    {
      date: "2026-03-11T00:00:00Z",
      revenue: 8110,
      tickets_sold: 15,
      transactions: 2,
      average_order_value: 4055,
    },
    {
      date: "2026-03-14T00:00:00Z",
      revenue: 40848,
      tickets_sold: 48,
      transactions: 6,
      average_order_value: 6808,
    },
    {
      date: "2026-03-15T00:00:00Z",
      revenue: 15000,
      tickets_sold: 30,
      transactions: 3,
      average_order_value: 5000,
    },
    {
      date: "2026-03-16T00:00:00Z",
      revenue: 11620,
      tickets_sold: 27,
      transactions: 6,
      average_order_value: 1936.6666666666667,
    },
    {
      date: "2026-03-17T00:00:00Z",
      revenue: 23500,
      tickets_sold: 42,
      transactions: 17,
      average_order_value: 1382.3529411764705,
    },
    {
      date: "2026-03-18T00:00:00Z",
      revenue: 1100,
      tickets_sold: 2,
      transactions: 1,
      average_order_value: 1100,
    },
    {
      date: "2026-03-20T00:00:00Z",
      revenue: 79832,
      tickets_sold: 118,
      transactions: 12,
      average_order_value: 6652.666666666667,
    },
    {
      date: "2026-03-22T00:00:00Z",
      revenue: 1900,
      tickets_sold: 3,
      transactions: 1,
      average_order_value: 1900,
    },
    {
      date: "2026-03-23T00:00:00Z",
      revenue: 1800,
      tickets_sold: 6,
      transactions: 1,
      average_order_value: 1800,
    },
    {
      date: "2026-03-24T00:00:00Z",
      revenue: 14500,
      tickets_sold: 51,
      transactions: 14,
      average_order_value: 1035.7142857142858,
    },
    {
      date: "2026-03-26T00:00:00Z",
      revenue: 100,
      tickets_sold: 1,
      transactions: 1,
      average_order_value: 100,
    },
    {
      date: "2026-03-27T00:00:00Z",
      revenue: 1280,
      tickets_sold: 15,
      transactions: 2,
      average_order_value: 640,
    },
    {
      date: "2026-03-29T00:00:00Z",
      revenue: 11450,
      tickets_sold: 42,
      transactions: 11,
      average_order_value: 1040.909090909091,
    },
    {
      date: "2026-03-30T00:00:00Z",
      revenue: 7150,
      tickets_sold: 74,
      transactions: 19,
      average_order_value: 376.3157894736842,
    },
    {
      date: "2026-03-31T00:00:00Z",
      revenue: 9844,
      tickets_sold: 16,
      transactions: 4,
      average_order_value: 2461,
    },
    {
      date: "2026-04-01T00:00:00Z",
      revenue: 21700,
      tickets_sold: 27,
      transactions: 4,
      average_order_value: 5425,
    },
    {
      date: "2026-04-02T00:00:00Z",
      revenue: 10200,
      tickets_sold: 34,
      transactions: 5,
      average_order_value: 2040,
    },
  ],
  top_product_events: null,
  sales_by_payment_gateway: [
    {
      gateway_name: "cash",
      total_transactions: 48,
      total_revenue: 207701,
      percentage_of_total: 73.38454091601272,
      status: "active",
    },
    {
      gateway_name: "stripe",
      total_transactions: 71,
      total_revenue: 75330,
      percentage_of_total: 26.615459083987265,
      status: "active",
    },
  ],
};

const customerAnalytics = {
  total_customers: 8,
  registered_users: 4,
  guest_purchases: 4,
  repeat_customers: 6,
  average_order_value: 2378.4117647058824,
  customer_segments: [
    {
      segment_name: "Regular",
      customer_count: 2,
      total_spent: 79984,
      average_spent: 39992,
      percentage_of_total: 25,
    },
    {
      segment_name: "Occasional",
      customer_count: 5,
      total_spent: 19150,
      average_spent: 3830,
      percentage_of_total: 62.5,
    },
    {
      segment_name: "High Value",
      customer_count: 1,
      total_spent: 183897,
      average_spent: 183897,
      percentage_of_total: 12.5,
    },
  ],
  top_customers: null,
  customer_retention: {
    new_customers: 5,
    returning_customers: 3,
    retention_rate: 25,
    churn_rate: 75,
  },
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [reportType, setReportType] = useState("overview");

  const { data: response, isLoading } = useQuery<ReportResponse>({
    queryKey: ["report", reportType],
    queryFn: () =>
      ReportService.getReport({
        type: reportType,
      }),
    placeholderData: (previousData) => previousData,
  });

  console.log("report data", response);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="px-6 py-6 space-y-6">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
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
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                <option value="overview">Overview</option>
                <option value="sales">Sales Report</option>
                {/* <option value="event-performance">Event Performance</option> */}
                <option value="customer-analytics">Customer Analytics</option>
                {/* <option value="financial">Financial Report</option> */}
              </select>
              <CaretDown
                weight="bold"
                className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm text-gray-700"
            >
              <ArrowsClockwise weight="duotone" className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {reportType === "overview" ? (
          <OverviewScreen data={response} />
        ) : reportType === "sales" ? (
          <SalesScreen data={response} />
        ) : (
          <CustomerAnalyticsScreen data={response} />
        )}
      </div>
    </div>
  );
}
