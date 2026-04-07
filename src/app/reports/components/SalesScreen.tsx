"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { DailySale, SalesReportProps, ChartTab } from "@/types/reports";
import { MetricCard } from "@/app/reports/components/CardComponents";
import { SectionCard } from "@/app/reports/components/CardComponents";

export function DailyBarChart({
  data,
  tab,
}: {
  data: DailySale[] | undefined;
  tab: ChartTab;
}) {
  const { locale } = useLanguageStore();
  const cfg = TAB_CONFIG[tab];
  const values = (data ?? []).map((d) => Number(d[cfg.key]));
  const max = Math.max(...values, 0);

  const HEIGHT = 200;

  const fmt = (v: number) =>
    tab === "tickets"
      ? String(Math.round(v))
      : formatCurrency(Math.round(v), undefined, locale);

  const yTicks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <div className="flex gap-3 w-full px-1">
      {/* Y-axis labels */}
      <div
        className="relative shrink-0 text-right"
        style={{ height: HEIGHT, width: 48 }}
      >
        {yTicks.map((t) => (
          <span
            key={t}
            className="absolute text-[10px] font-medium leading-none right-0"
            style={{
              bottom: `${t * 100}%`,
              transform: "translateY(50%)",
            }}
          >
            {fmt(max * t)}
          </span>
        ))}
      </div>

      {/* Chart area */}
      <div className="flex flex-col flex-1 min-w-0">
        <div
          className="relative flex items-end gap-[3px] w-full"
          style={{ height: HEIGHT }}
        >
          {/* Gridlines */}
          {yTicks.map((t) => (
            <div
              key={t}
              className="absolute w-full"
              style={{ bottom: `${t * 100}%` }}
            >
              <div
                className={`w-full border-t ${
                  t === 0 ? "border-muted-foreground/30" : "border-dashed"
                }`}
              />
            </div>
          ))}

          {/* Bars */}
          {(data ?? []).map((d) => {
            const val = Number(d[cfg.key]);
            const pct = max > 0 ? (val / max) * 100 : 0;
            const barHeight = Math.max((pct / 100) * HEIGHT, 2);
            const dateLabel = new Date(d.date).toLocaleDateString(locale, {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={d.date}
                className="group relative flex-1 min-w-[28px] h-full flex flex-col justify-end"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="bg-popover text-popover-foreground text-[11px] font-medium rounded-md shadow-md border border-border px-2 py-1 whitespace-nowrap">
                    <p className="">{dateLabel}</p>
                    <p>{fmt(val)}</p>
                  </div>
                  {/* Arrow */}
                  <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 mx-auto -mt-1" />
                </div>

                {/* Bar */}
                <div
                  className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-100"
                  style={{
                    height: `${barHeight}px`,
                    background: `linear-gradient(to top, ${cfg.color}cc, ${cfg.color})`,
                    opacity: 0.75,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis date labels — show every nth to avoid crowding */}
        <div className="relative flex gap-[3px] mt-1" style={{ height: 24 }}>
          {(data ?? []).map((d) => {
            const dateLabel = new Date(d.date).toLocaleDateString(locale, {
              month: "short",
              day: "numeric",
            });
            return (
              <div
                key={d.date}
                className="flex-1 min-w-[28px] flex items-start justify-center"
              >
                <span className="text-[9px] whitespace-nowrap rotate-45 origin-left translate-x-2">
                  {dateLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const TAB_CONFIG: Record<
  ChartTab,
  { label: string; key: keyof DailySale; color: string }
> = {
  revenue: { label: "Revenue", key: "revenue", color: "#3b82f6" },
  tickets: { label: "Tickets sold", key: "tickets_sold", color: "#10b981" },
  aov: {
    label: "Avg. order value",
    key: "average_order_value",
    color: "#f59e0b",
  },
};

const GATEWAY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function SalesReport({ data }: SalesReportProps) {
  const { locale } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<ChartTab>("revenue");
  console.log("data", data);

  const m = data?.summary_metrics;
  const gateways = data?.sales_by_payment_gateway ?? [];

  const topDays = useMemo(
    () =>
      [...(data?.daily_sales ?? [])]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6),
    [data?.daily_sales],
  );
  const maxTopRevenue = topDays[0]?.revenue ?? 1;

  const activeDays = data?.daily_sales?.length;

  return (
    <div className="space-y-5">
      {/* ── KPI row ── */}
      <div className="grid grid-cols-4 gap-4 font-medium">
        <MetricCard
          label="Total revenue"
          value={formatCurrency(m?.total_revenue || 0, undefined, locale)}
          sub={`${activeDays} active days`}
          valueColor="text-blue-600"
        />
        <MetricCard
          label="Tickets sold"
          value={m?.total_tickets_sold || 0}
          sub="Across all days"
        />
        <MetricCard
          label="Transactions"
          value={m?.total_transactions || 0}
          sub="All completed"
        />
        <MetricCard
          label="Avg. order value"
          value={formatCurrency(
            Math.round(m?.average_order_value || 0),
            undefined,
            locale,
          )}
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
                  : "border-gray-200 text-black hover:bg-gray-50"
              }`}
            >
              {TAB_CONFIG[key].label}
            </button>
          ))}
        </div>

        {/* X-axis date labels */}
        <DailyBarChart data={data?.daily_sales} tab={activeTab} />
        {/* <div className="flex gap-1 mt-2">
          {(data?.daily_sales ?? []).map((d) => (
            <div
              key={d.date}
              className="flex-1 min-w-[28px] text-center text-[8px] text-black truncate"
            >
              {new Date(d.date).getDate()}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-black text-center mt-0.5">
          March – April 2026
        </div> */}
      </SectionCard>

      {/* ── Gateway + Top days ── */}
      <div className="grid grid-cols-2 gap-5">
        <SectionCard title="Payment gateway breakdown">
          <div className="space-y-4">
            {gateways.map((gw, i) => (
              <div key={gw.gateway_name}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm text-black capitalize font-medium">
                    {gw.gateway_name}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-black">
                      {formatCurrency(gw.total_revenue, undefined, locale)}
                    </span>
                    <span className="text-xs text-black ml-2">
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
                <div className="text-[11px] text-black mt-1">
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
                  <span className="text-xs text-black w-12 flex-shrink-0">
                    {dateLabel}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right flex-shrink-0 w-28">
                    <div className="text-sm font-semibold text-black">
                      {formatCurrency(d.revenue, undefined, locale)}
                    </div>
                    <div className="text-[11px] text-black">
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
