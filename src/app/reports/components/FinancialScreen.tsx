"use client";

import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { RevenueReportProps } from "@/types/reports";
import { MetricCard } from "@/app/reports/components/CardComponents";
import { SectionCard } from "@/app/reports/components/CardComponents";
import { CommissionHistoryTable } from "./CommissionHistoryTable";
import { BillHistoryTable } from "./BillHistoryTable";

function RevenueBar({
  label,
  value,
  maxValue,
  color,
  sub,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  sub?: string;
}) {
  const { locale } = useLanguageStore();
  const pct = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm text-black font-medium truncate pr-2">
          {label}
        </span>
        <span className="text-sm font-semibold text-black flex-shrink-0">
          {formatCurrency(value, undefined, locale)}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {sub && <div className="text-[11px] text-black">{sub}</div>}
    </div>
  );
}

export default function RevenueReport({ data }: RevenueReportProps) {
  const { locale } = useLanguageStore();
  const m = data?.summary_metrics;

  const commissionPct =
    (m?.total_gross_revenue || 0) > 0
      ? Math.round(
          ((m?.total_commission || 0) / (m?.total_gross_revenue || 0)) * 100,
        )
      : 0;
  const organizerPct = 100 - commissionPct;

  const maxEventRevenue = Math.max(
    ...(data?.revenue_breakdown ?? []).map((e) => e.gross_revenue),
    1,
  );

  return (
    <div className="space-y-5">
      {/* ── KPI row ── */}
      <div className="grid grid-cols-4 gap-4 font-medium">
        <MetricCard
          label="Gross revenue"
          value={formatCurrency(m?.total_gross_revenue || 0, undefined, locale)}
          sub="Before deductions"
          valueColor="text-blue-600"
        />
        <MetricCard
          label="Net revenue"
          value={formatCurrency(m?.net_revenue || 0, undefined, locale)}
          sub={`${(m?.total_refunds || 0) > 0 ? `$${m?.total_refunds} refunded` : "No refunds"}`}
          valueColor="text-emerald-600"
        />
        <MetricCard
          label="Platform commission"
          value={formatCurrency(m?.total_commission || 0, undefined, locale)}
          sub={`${commissionPct}% of gross`}
          valueColor="text-amber-500"
        />
        <MetricCard
          label="Organizer share"
          value={formatCurrency(
            m?.total_organizer_share || 0,
            undefined,
            locale,
          )}
          sub={`${organizerPct}% of gross`}
          valueColor="text-violet-600"
        />
      </div>

      {/* ── Secondary KPI row ── */}
      <div className="grid grid-cols-3 gap-4 font-medium">
        <MetricCard
          label="Avg. ticket price"
          value={formatCurrency(
            Math.round(m?.average_ticket_price || 0),
            undefined,
            locale,
          )}
          sub="Per ticket sold"
        />
        <MetricCard
          label="Completed payouts"
          value={formatCurrency(m?.completed_payouts || 0, undefined, locale)}
          sub={
            (m?.pending_payouts || 0) > 0
              ? `${formatCurrency(m?.pending_payouts || 0, undefined, locale)} pending`
              : "None pending"
          }
          valueColor="text-emerald-600"
        />
        <MetricCard
          label="Total transactions"
          value={m?.total_transactions || 0}
          sub="All completed"
        />
      </div>

      {/* ── Revenue split + Event breakdown ── */}
      <div className="grid grid-cols-1 gap-5">


        <SectionCard title="Revenue by event" key="Revenue by event">
          {(data?.revenue_breakdown ?? []).length === 0 ? (
            <p className="text-sm text-black">No event data available.</p>
          ) : (
            data?.revenue_breakdown.map((ev) => (
              <RevenueBar
                key={ev.event_id}
                label={ev.event_title}
                value={ev.gross_revenue}
                maxValue={maxEventRevenue}
                color="#3b82f6"
                sub={`Gross Revenue ${formatCurrency(ev.commission, undefined, locale)} · Commission ${formatCurrency(ev.commission, undefined, locale)} · Organizer Share ${formatCurrency(ev.organizer_share, undefined, locale)} · ${ev.refunds} Refunds · Net Revenue ${formatCurrency(ev.commission, undefined, locale)}`}
              />
            ))
          )}
        </SectionCard>
      </div>

      {/* ── Commission history ── */}
      <SectionCard title="Commission history" key="Commission history">
      <CommissionHistoryTable
        refunds={data?.commission_history || []}
        isLoading={false}
        currentPage={1}
        totalPages={1}
        total={(data?.commission_history || []).length}
        limit={(data?.commission_history || []).length}
        onLimitChange={() => {}}
        hasNextPage={false}
        hasPreviousPage={false}
        onPageChange={() => {}}
        sortBy={""}
        sortOrder={"asc"}
        onSortChange={() => {}}
      />
      </SectionCard>

      {/* ── Bill history ── */}
      <SectionCard title="Bill history" key="Bill history">
      <BillHistoryTable
        refunds={data?.bill_history || []}
        isLoading={false}
        currentPage={1}
        totalPages={1}
        total={(data?.bill_history || []).length}
        limit={(data?.bill_history || []).length}
        onLimitChange={() => {}}
        hasNextPage={false}
        hasPreviousPage={false}
        onPageChange={() => {}}
        sortBy={""}
        sortOrder={"asc"}
        onSortChange={() => {}}
      />
      </SectionCard>

      {/* ── Currency breakdown ── */}
      {(data?.currency_breakdown || []).length > 0 && (
        <SectionCard title="Currency breakdown" key="Currency breakdown">
          <div className="space-y-4">
            {data?.currency_breakdown.map((c) => (
              <div key={c.currency}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">
                      {c.currency}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-medium">
                      {c.percentage_of_total}%
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-black">
                    {formatCurrency(c.gross_revenue, undefined, locale)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                    style={{ width: `${c.percentage_of_total}%` }}
                  />
                </div>
                <div className="flex gap-4 text-[11px] text-black">
                  <span>
                    Commission:{" "}
                    {formatCurrency(c.commission, undefined, locale)}
                  </span>
                  <span>
                    Organizer:{" "}
                    {formatCurrency(c.organizer_share, undefined, locale)}
                  </span>
                  <span>{c.transaction_count} transactions</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
