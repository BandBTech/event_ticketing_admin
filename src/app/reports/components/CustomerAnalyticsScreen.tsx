"use client";

import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { CustomerAnalyticsProps } from "@/types/reports";
import {MetricCard} from "@/app/reports/components/CardComponents"
import {SectionCard} from "@/app/reports/components/CardComponents"
import {RetentionDonut} from "@/app/reports/components/CardComponents"
import {StatRowCAS} from "@/app/reports/components/CardComponents"

const SEGMENT_COLORS: Record<
  string,
  { bar: string; badge: string; text: string }
> = {
  "High Value": {
    bar: "#6366f1",
    badge: "bg-violet-50",
    text: "text-violet-700",
  },
  Regular: { bar: "#3b82f6", badge: "bg-blue-50", text: "text-blue-700" },
  Occasional: {
    bar: "#10b981",
    badge: "bg-emerald-50",
    text: "text-emerald-700",
  },
};
const FALLBACK_COLORS = [
  { bar: "#f59e0b", badge: "bg-amber-50", text: "text-amber-700" },
  { bar: "#ec4899", badge: "bg-pink-50", text: "text-pink-700" },
];

function getSegmentColor(name: string, idx: number) {
  return SEGMENT_COLORS[name] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CustomerAnalytics({ data }: CustomerAnalyticsProps) {
  const { locale } = useLanguageStore();
  const r = data?.customer_retention;

  // Sort segments by total_spent descending so highest value is always on top
  const sortedSegments = [...(data?.customer_segments ?? [])].sort(
    (a, b) => b.total_spent - a.total_spent,
  );
  const maxSpent = sortedSegments[0]?.total_spent ?? 1;

  const repeatPct = Math.round(
    ((data?.repeat_customers || 0) / (data?.total_customers || 0)) * 100,
  );

  return (
    <div className="space-y-5">
      {/* ── KPI row ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total customers"
          value={data?.total_customers || 0}
          sub="All time"
        />
        <MetricCard
          label="Registered users"
          value={data?.registered_users || 0}
          sub={`${data?.guest_purchases} guest purchases`}
          valueColor="text-blue-600"
        />
        <MetricCard
          label="Repeat customers"
          value={data?.repeat_customers || 0}
          sub={`${repeatPct}% of total`}
          valueColor="text-emerald-600"
        />
        <MetricCard
          label="Avg. order value"
          value={formatCurrency(
            Math.round(data?.average_order_value || 0),
            undefined,
            locale,
          )}
          sub="Per transaction"
        />
      </div>

      {/* ── Segments + Retention ── */}
      <div className="grid grid-cols-2 gap-5">
        <SectionCard title="Customer segments">
          <div className="space-y-5">
            {sortedSegments.map((seg, i) => {
              const colors = getSegmentColor(seg.segment_name, i);
              const barPct = Math.round((seg.total_spent / maxSpent) * 100);
              return (
                <div key={seg.segment_name}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {seg.segment_name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors.badge} ${colors.text}`}
                      >
                        {seg.customer_count}{" "}
                        {seg.customer_count === 1 ? "customer" : "customers"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-700">
                      {seg.percentage_of_total}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${barPct}%`, background: colors.bar }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-700">
                    <span>
                      Total:{" "}
                      {formatCurrency(seg.total_spent, undefined, locale)}
                    </span>
                    <span>
                      Avg:{" "}
                      {formatCurrency(seg.average_spent, undefined, locale)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Retention overview">
          <div className="flex justify-center py-2 mb-2">
            <RetentionDonut
              retention={r?.retention_rate || 0}
              churn={r?.churn_rate || 0}
            />
          </div>
          <StatRowCAS
            label="New customers"
            value={r?.new_customers || 0}
            badge={{ bg: "bg-blue-50", text: "text-blue-700" }}
          />
          <StatRowCAS
            label="Returning customers"
            value={r?.returning_customers || 0}
            badge={{ bg: "bg-emerald-50", text: "text-emerald-700" }}
          />
          <StatRowCAS
            label="Retention rate"
            value={`${r?.retention_rate}%`}
            badge={{ bg: "bg-emerald-50", text: "text-emerald-700" }}
          />
          <StatRowCAS
            label="Churn rate"
            value={`${r?.churn_rate}%`}
            badge={{ bg: "bg-red-50", text: "text-red-600" }}
          />
        </SectionCard>
      </div>

      {/* ── Segment spend comparison ── */}
      <SectionCard title="Segment spend comparison">
        <div className="space-y-4">
          {sortedSegments.map((seg, i) => {
            const colors = getSegmentColor(seg.segment_name, i);
            const totalPct = Math.round((seg.total_spent / maxSpent) * 100);
            const avgPct = Math.round((seg.average_spent / maxSpent) * 100);
            return (
              <div key={seg.segment_name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {seg.segment_name}
                  </span>
                  <span className="text-xs text-gray-700">
                    {seg.customer_count}{" "}
                    {seg.customer_count === 1 ? "customer" : "customers"}
                  </span>
                </div>
                {/* Total spent bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-700 w-16 text-right flex-shrink-0">
                    total
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${totalPct}%`,
                        background: colors.bar,
                        opacity: 0.9,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-24 text-right flex-shrink-0">
                    {formatCurrency(seg.total_spent, undefined, locale)}
                  </span>
                </div>
                {/* Avg spent bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-700 w-16 text-right flex-shrink-0">
                    avg
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${avgPct}%`,
                        background: colors.bar,
                        opacity: 0.35,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 w-24 text-right flex-shrink-0">
                    {formatCurrency(seg.average_spent, undefined, locale)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
