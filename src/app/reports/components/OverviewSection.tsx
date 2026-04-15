"use client";

import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { ReportPageProps } from "@/types/reports";
import { MetricCard } from "@/app/reports/components/CardComponents";
import { SectionCard } from "@/app/reports/components/CardComponents";
import { RevenueBar } from "@/app/reports/components/CardComponents";
import { StatRow } from "@/app/reports/components/CardComponents";

export default function ReportPage({ data }: ReportPageProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const m = data?.summary_metrics;
  const e = data?.events_statistics;

  // const commissionPct = Math.round(
  //   ((m?.total_commission || 0) / (m?.total_revenue || 0)) * 100,
  // );
  // const organizerPct = 100 - commissionPct;

  return (
    <main className="flex-1 overflow-y-auto space-y-5">
      {/* ── Row 1: Revenue KPIs ── */}
      <div className="grid grid-cols-4 gap-4 font-medium">
        <MetricCard
          label={t("reports.overview.totalRevenue")}
          value={formatCurrency(m?.total_revenue || 0, undefined, locale)}
          sub={t("reports.overview.grossCollected")}
          // valueColor="text-blue-600"
        />
        <MetricCard
          label={t("reports.overview.commission")}
          value={formatCurrency(m?.total_commission || 0, undefined, locale)}
          // sub={`${commissionPct}% of revenue`}
          // valueColor="text-amber-500"
        />
        <MetricCard
          label={t("reports.overview.organizerShare")}
          value={formatCurrency(m?.organizer_share || 0, undefined, locale)}
          // sub={`${organizerPct}% of revenue`}
          // valueColor="text-emerald-600"
        />
        <MetricCard
          label={t("reports.overview.ticketsSold")}
          value={m?.total_tickets_sold || 0}
          sub={t("reports.overview.acrossAllEvents")}
        />
      </div>

      {/* ── Row 2: Secondary metrics ── */}
      <div className="grid grid-cols-3 gap-4 font-medium">
        <MetricCard
          label={t("reports.overview.avgOrderValue")}
          value={formatCurrency(
            Math.round(m?.average_order_value || 0),
            undefined,
            locale,
          )}
        />
        <MetricCard
          label={t("reports.overview.conversionRate")}
          value={Math.round(m?.conversion_rate || 0).toLocaleString()}
          sub={t("reports.overview.visitorsPerEvent")}
        />
        <MetricCard
          label={t("reports.overview.transactions")}
          value={m?.total_transactions || 0}
          sub={`${m?.completed_transactions || 0} ${t("transactions.transactionStatus.completed")}`}
        />
      </div>

      {/* ── Row 3: Revenue split + Transactions | Event stats ── */}
      <div className="grid grid-cols-2 gap-5 font-medium">
        <SectionCard
          title={t("reports.overview.revenue&Transactions")}
          key={t("reports.overview.revenue&Transactions")}
        >
          {/* <RevenueBar label="Organizer" pct={organizerPct} color="#10b981" /> */}
          {/* <RevenueBar label="Commission" pct={commissionPct} color="#f59e0b" /> */}

          <div className="border-t border-gray-50">
            <p className="text-sm font-semibold text-black uppercase mb-3">
              {t("reports.overview.transactions")}
            </p>
            <StatRow
              label={t("transactions.transactionStatus.completed")}
              value={m?.completed_transactions || 0}
              // badge={{ bg: "bg-green-50", text: "text-green-700" }}
            />
            <StatRow
              label={t("transactions.transactionStatus.pending")}
              value={m?.pending_transactions || 0}
              // badge={{ bg: "bg-yellow-50", text: "text-yellow-700" }}
            />
            <StatRow
              label={t("transactions.transactionStatus.failed")}
              value={m?.failed_transactions || 0}
              // badge={{ bg: "bg-red-50", text: "text-red-600" }}
            />
          </div>
        </SectionCard>

        <SectionCard
          key={t("reports.overview.eventStatistics")}
          title={t("reports.overview.eventStatistics")}
        >
          <StatRow
            label={t("reports.overview.totalEvents")}
            value={e?.total_events || 0}
          />
          <StatRow
            label={t("status.completed")}
            value={e?.completed_events || 0}
            // badge={{ bg: "bg-green-50", text: "text-green-700" }}
          />
          <StatRow
            label={t("status.on_sale")}
            value={e?.on_sale_events || 0}
            // badge={{ bg: "bg-blue-50", text: "text-blue-700" }}
          />
          <StatRow
            label={t("status.pending")}
            value={e?.pending_events || 0}
            // badge={{ bg: "bg-yellow-50", text: "text-yellow-700" }}
          />
          <StatRow
            label={t("status.cancelled")}
            value={e?.cancelled_events || 0}
            // badge={{ bg: "bg-red-50", text: "text-red-600" }}
          />
          <StatRow
            label={t("status.rejected")}
            value={e?.rejected_events || 0}
            // badge={{ bg: "bg-red-50", text: "text-red-600" }}
          />
          <StatRow
            label={t("status.live")}
            value={e?.live_events || 0}
            // badge={{ bg: "bg-emerald-50", text: "text-emerald-700" }}
          />
        </SectionCard>
      </div>

      {/* ── Row 4: Event status visual bar chart ── */}
      <SectionCard title={t("reports.overview.eventStatusBreakdown")}>
        <div className="space-y-3">
          {[
            {
              label: t("status.completed"),
              value: e?.completed_events,
              color: "#10b981",
            },
            {
              label: t("status.cancelled"),
              value: e?.cancelled_events,
              color: "#ef4444",
            },
            {
              label: t("status.rejected"),
              value: e?.rejected_events,
              color: "#f87171",
            },
            {
              label: t("status.on_sale"),
              value: e?.on_sale_events,
              color: "#3b82f6",
            },
            {
              label: t("status.pending"),
              value: e?.pending_events,
              color: "#f59e0b",
            },
            {
              label: t("status.live"),
              value: e?.live_events,
              color: "#6366f1",
            },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-sm text-black w-20 text-right flex-shrink-0">
                {s.label}
              </span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round(((s.value || 0) / (e?.total_events || 0)) * 100)}%`,
                    background: s.color,
                    minWidth: (s.value || 0) > 0 ? "6px" : "0",
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-black w-6 flex-shrink-0">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
