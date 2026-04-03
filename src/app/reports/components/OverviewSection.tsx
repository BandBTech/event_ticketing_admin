"use client";

import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { ReportResponse } from "@/types/reports";

type ReportPageProps = {
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
      <div
        className={`text-2xl font-semibold ${valueColor ?? "text-gray-800"}`}
      >
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
        <h2 className="text-sm font-semibold text-gray-500 tracking-wide uppercase">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function RevenueBar({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-sm text-gray-500 w-24 text-right flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-8 flex-shrink-0">
        {pct}%
      </span>
    </div>
  );
}

function StatRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string | number;
  badge?: { bg: string; text: string };
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      {badge ? (
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${badge.bg} ${badge.text}`}
        >
          {value}
        </span>
      ) : (
        <span className="text-sm font-semibold text-gray-700">{value}</span>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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
      <div className="grid grid-cols-4 gap-4">
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
      <div className="grid grid-cols-3 gap-4">
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
      <div className="grid grid-cols-2 gap-5">
        <SectionCard title="Revenue & transactions">
          <RevenueBar label="Organizer" pct={organizerPct} color="#10b981" />
          <RevenueBar label="Commission" pct={commissionPct} color="#f59e0b" />

          <div className="mt-5 pt-4 border-t border-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
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

        <SectionCard title="Event statistics">
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
            badge={{ bg: "bg-gray-100", text: "text-gray-500" }}
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
              <span className="text-sm text-gray-500 w-20 text-right flex-shrink-0">
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
              <span className="text-sm font-semibold text-gray-700 w-6 flex-shrink-0">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
