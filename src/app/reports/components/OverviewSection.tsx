"use client";

import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { ReportPageProps } from "@/types/reports";
import {MetricCard} from "@/app/reports/components/CardComponents"
import {SectionCard} from "@/app/reports/components/CardComponents"
import {RevenueBar} from "@/app/reports/components/CardComponents"
import {StatRow} from "@/app/reports/components/CardComponents"

export default function ReportPage({ data }: ReportPageProps) {
  const { locale } = useLanguageStore();
  const m = data?.summary_metrics;
  const e = data?.events_statistics;

  const commissionPct = Math.round(
    ((m?.total_commission || 0) / (m?.total_revenue || 0)) * 100,
  );
  const organizerPct = 100 - commissionPct;

  return (
    <main className="flex-1 overflow-y-auto space-y-5">
      {/* ── Row 1: Revenue KPIs ── */}
      <div className="grid grid-cols-4 gap-4 font-medium">
        <MetricCard
          label="Total revenue"
          value={formatCurrency(m?.total_revenue || 0, undefined, locale)}
          sub="Gross collected"
          valueColor="text-blue-600"
        />
        <MetricCard
          label="Commission"
          value={formatCurrency(m?.total_commission || 0, undefined, locale)}
          sub={`${commissionPct}% of revenue`}
          valueColor="text-amber-500"
        />
        <MetricCard
          label="Organizer share"
          value={formatCurrency(m?.organizer_share || 0, undefined, locale)}
          sub={`${organizerPct}% of revenue`}
          valueColor="text-emerald-600"
        />
        <MetricCard
          label="Tickets sold"
          value={m?.total_tickets_sold || 0}
          sub="Across all events"
        />
      </div>

      {/* ── Row 2: Secondary metrics ── */}
      <div className="grid grid-cols-3 gap-4 font-medium">
        <MetricCard
          label="Avg. order value"
          value={formatCurrency(
            Math.round(m?.average_order_value || 0),
            undefined,
            locale,
          )}
        />
        <MetricCard
          label="Conversion rate"
          value={Math.round(m?.conversion_rate || 0).toLocaleString()}
          sub="Visitors per event"
        />
        <MetricCard
          label="Transactions"
          value={m?.total_transactions || 0}
          sub={`${m?.completed_transactions || 0} completed`}
        />
      </div>

      {/* ── Row 3: Revenue split + Transactions | Event stats ── */}
      <div className="grid grid-cols-2 gap-5 font-medium">
        <SectionCard title="Revenue & transactions" key="Revenue & transactions">
          <RevenueBar label="Organizer" pct={organizerPct} color="#10b981" />
          <RevenueBar label="Commission" pct={commissionPct} color="#f59e0b" />

          <div className="mt-5 pt-4 border-t border-gray-50">
            <p className="text-xs font-semibold text-black uppercase mb-3">
              Transactions
            </p>
            <StatRow
              label="Completed"
              value={m?.completed_transactions || 0}
              badge={{ bg: "bg-green-50", text: "text-green-700" }}
            />
            <StatRow
              label="Pending"
              value={m?.pending_transactions || 0}
              badge={{ bg: "bg-yellow-50", text: "text-yellow-700" }}
            />
            <StatRow
              label="Failed"
              value={m?.failed_transactions || 0}
              badge={{ bg: "bg-red-50", text: "text-red-600" }}
            />
          </div>
        </SectionCard>

        <SectionCard key={"Event statistics"} title="Event statistics">
          <StatRow label="Total events" value={e?.total_events || 0} />
          <StatRow
            label="Completed"
            value={e?.completed_events || 0}
            badge={{ bg: "bg-green-50", text: "text-green-700" }}
          />
          <StatRow
            label="On sale"
            value={e?.on_sale_events || 0}
            badge={{ bg: "bg-blue-50", text: "text-blue-700" }}
          />
          <StatRow
            label="Pending"
            value={e?.pending_events || 0}
            badge={{ bg: "bg-yellow-50", text: "text-yellow-700" }}
          />
          <StatRow
            label="Cancelled"
            value={e?.cancelled_events || 0}
            badge={{ bg: "bg-red-50", text: "text-red-600" }}
          />
          <StatRow
            label="Rejected"
            value={e?.rejected_events || 0}
            badge={{ bg: "bg-red-50", text: "text-red-600" }}
          />
          <StatRow
            label="Live"
            value={e?.live_events || 0}
            badge={{ bg: "bg-emerald-50", text: "text-emerald-700" }}
          />
          <StatRow
            label="Draft"
            value={e?.draft_events || 0}
            badge={{ bg: "bg-gray-100", text: "text-black" }}
          />
        </SectionCard>
      </div>

      {/* ── Row 4: Event status visual bar chart ── */}
      <SectionCard title="Event status breakdown">
        <div className="space-y-3">
          {[
            {
              label: "Completed",
              value: e?.completed_events,
              color: "#10b981",
            },
            {
              label: "Cancelled",
              value: e?.cancelled_events,
              color: "#ef4444",
            },
            { label: "Rejected", value: e?.rejected_events, color: "#f87171" },
            { label: "On sale", value: e?.on_sale_events, color: "#3b82f6" },
            { label: "Pending", value: e?.pending_events, color: "#f59e0b" },
            { label: "Live", value: e?.live_events, color: "#6366f1" },
            { label: "Draft", value: e?.draft_events, color: "#9ca3af" },
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
