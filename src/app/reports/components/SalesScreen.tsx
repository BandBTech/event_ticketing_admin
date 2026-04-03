"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import {ReportResponse} from "@/types/reports"

type DailySale = {
  date: string;
  revenue: number;
  tickets_sold: number;
  transactions: number;
  average_order_value: number;
};

type PaymentGateway = {
  gateway_name: string;
  total_transactions: number;
  total_revenue: number;
  percentage_of_total: number;
  status: string;
};

type SummaryMetrics = {
  total_revenue: number;
  total_commission: number;
  organizer_share: number;
  total_tickets_sold: number;
  active_events: number;
  total_events: number;
  total_transactions: number;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  average_order_value: number;
  conversion_rate: number;
};

type SalesReportData = {
  summary_metrics: SummaryMetrics;
  daily_sales: DailySale[];
  sales_by_payment_gateway: PaymentGateway[];
};

type SalesReportProps = {
  data: ReportResponse | undefined;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-xs text-gray-400 mb-1.5">{label}</div>
      <div className={`text-2xl font-semibold ${valueColor ?? "text-gray-800"}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50">
        <h2 className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

type ChartTab = "revenue" | "tickets" | "aov";

const TAB_CONFIG: Record<ChartTab, { label: string; key: keyof DailySale; color: string }> = {
  revenue: { label: "Revenue", key: "revenue", color: "#3b82f6" },
  tickets: { label: "Tickets sold", key: "tickets_sold", color: "#10b981" },
  aov: { label: "Avg. order value", key: "average_order_value", color: "#f59e0b" },
};

const GATEWAY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

// ── Daily Bar Chart (CSS-only, no external lib needed) ────────────────────────
function DailyBarChart({
  data,
  tab,
}: {
  data: DailySale[] | undefined;
  tab: ChartTab;
}) {
  const { locale } = useLanguageStore();
  const cfg = TAB_CONFIG[tab];
  const values = (data ?? []).map((d) => Number(d[cfg.key]));
  const max = Math.max(...values);

  const fmt = (v: number) =>
    tab === "tickets"
      ? String(Math.round(v))
      : formatCurrency(Math.round(v), undefined, locale);

  return (
    <div className="flex items-end gap-1 h-44 w-full overflow-x-auto pb-1">
      {(data ?? []).map((d, i) => {
        const val = Number(d[cfg.key]);
        const pct = max > 0 ? (val / max) * 100 : 0;
        const dateLabel = new Date(d.date).toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
        });
        return (
          <div
            key={d.date}
            className="flex flex-col items-center gap-1 flex-1 min-w-[28px] group relative"
            title={`${dateLabel}: ${fmt(val)}`}
          >
            <div
              className="w-full rounded-t-sm transition-all duration-500"
              style={{
                height: `${Math.max(pct, 2)}%`,
                background: cfg.color,
                opacity: 0.85,
              }}
            />
            <span className="text-[9px] text-gray-400 leading-none rotate-45 origin-left translate-x-1 mt-0.5 hidden group-hover:block absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
              {dateLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SalesReport({ data }: SalesReportProps) {
  const { locale } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<ChartTab>("revenue");

  const m = data?.summary_metrics;
  const gateways = data?.sales_by_payment_gateway ?? [];

  const topDays = useMemo(
    () =>
      [...data?.daily_sales ?? []]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6),
    [data?.daily_sales],
  );
  const maxTopRevenue = topDays[0]?.revenue ?? 1;

  const activeDays = data?.daily_sales?.length;

  return (
    <div className="space-y-5">

      {/* ── KPI row ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total revenue"
          value={formatCurrency((m?.total_revenue || 0), undefined, locale)}
          sub={`${activeDays} active days`}
          valueColor="text-blue-600"
        />
        <MetricCard
          label="Tickets sold"
          value={(m?.total_tickets_sold || 0)}
          sub="Across all days"
        />
        <MetricCard
          label="Transactions"
          value={(m?.total_transactions || 0)}
          sub="All completed"
        />
        <MetricCard
          label="Avg. order value"
          value={formatCurrency(Math.round((m?.average_order_value || 0)), undefined, locale)}
          sub="Per transaction"
        />
      </div>

      {/* ── Daily chart ── */}
      <SectionCard title="Daily sales trend">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-5">
          {(Object.keys(TAB_CONFIG) as ChartTab[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                activeTab === key
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {TAB_CONFIG[key].label}
            </button>
          ))}
        </div>

        {/* X-axis date labels */}
        <DailyBarChart data={data?.daily_sales} tab={activeTab} />
        <div className="flex gap-1 mt-2">
          {(data?.daily_sales ?? []).map((d) => (
            <div
              key={d.date}
              className="flex-1 min-w-[28px] text-center text-[8px] text-gray-300 truncate"
            >
              {new Date(d.date).getDate()}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-gray-300 text-center mt-0.5">
          March – April 2026
        </div>
      </SectionCard>

      {/* ── Gateway + Top days ── */}
      <div className="grid grid-cols-2 gap-5">

        <SectionCard title="Payment gateway breakdown">
          <div className="space-y-4">
            {gateways.map((gw, i) => (
              <div key={gw.gateway_name}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm text-gray-600 capitalize font-medium">
                    {gw.gateway_name}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-800">
                      {formatCurrency(gw.total_revenue, undefined, locale)}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {gw.percentage_of_total.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${gw.percentage_of_total}%`,
                      background: GATEWAY_COLORS[i % GATEWAY_COLORS.length],
                    }}
                  />
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {gw.total_transactions} transactions · {gw.status}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top days by revenue">
          <div className="space-y-1">
            {topDays.map((d) => {
              const pct = Math.round((d.revenue / maxTopRevenue) * 100);
              const dateLabel = new Date(d.date).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={d.date}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-xs text-gray-400 w-12 flex-shrink-0">
                    {dateLabel}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right flex-shrink-0 w-28">
                    <div className="text-sm font-semibold text-gray-700">
                      {formatCurrency(d.revenue, undefined, locale)}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {d.tickets_sold} tickets
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}