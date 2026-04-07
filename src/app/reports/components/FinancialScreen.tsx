"use client";

import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { RevenueReportProps } from "@/types/reports";
import {MetricCard} from "@/app/reports/components/CardComponents"
import {SectionCard} from "@/app/reports/components/CardComponents"

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
      <div className="grid grid-cols-2 gap-5">
        <SectionCard title="Revenue split" key="Revenue split">
          {/* Gross → Net visual */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-black mb-1.5">
              <span>Gross revenue</span>
              <span>
                {formatCurrency(m?.total_gross_revenue || 0, undefined, locale)}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-400 transition-all duration-700"
                style={{ width: `${organizerPct}%` }}
                title={`Organizer share ${organizerPct}%`}
              />
              <div
                className="h-full bg-amber-400 transition-all duration-700"
                style={{ width: `${commissionPct}%` }}
                title={`Commission ${commissionPct}%`}
              />
            </div>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-[11px] text-black">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                Organizer {organizerPct}%
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-black">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                Commission {commissionPct}%
              </span>
            </div>
          </div>

          {/* Payout status */}
          <div className="pt-4 border-t border-gray-50 space-y-0">
            {[
              {
                label: "Completed payouts",
                value: m?.completed_payouts,
                badge: "bg-green-50 text-green-700",
              },
              {
                label: "Pending payouts",
                value: m?.pending_payouts,
                badge: "bg-yellow-50 text-yellow-700",
              },
              {
                label: "Total refunds",
                value: m?.total_refunds,
                badge:
                  (m?.total_refunds || 0) > 0
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-100 text-black",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm text-black">{row.label}</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${row.badge}`}
                >
                  {formatCurrency(row.value || 0, undefined, locale)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

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
                sub={`${ev.transaction_count} txns · commission ${formatCurrency(ev.commission, undefined, locale)} · organizer ${formatCurrency(ev.organizer_share, undefined, locale)}`}
              />
            ))
          )}
        </SectionCard>
      </div>

      {/* ── Commission history ── */}
      <SectionCard title="Commission history" key="Commission history">
        {(data?.commission_history || []).length === 0 ? (
          <p className="text-sm text-black">No commission records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "22%" }} />
              </colgroup>
              <thead>
                <tr className="text-left text-xs text-black border-b border-gray-100">
                  <th className="pb-2 font-medium">Event</th>
                  <th className="pb-2 font-medium text-right">Revenue</th>
                  <th className="pb-2 font-medium text-right">Rate</th>
                  <th className="pb-2 font-medium text-right">Commission</th>
                  <th className="pb-2 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.commission_history.map((c) => (
                  <tr
                    key={c.transaction_id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-2.5 text-black truncate pr-2">
                      {c.event_title}
                    </td>
                    <td className="py-2.5 text-black text-right">
                      {formatCurrency(c.revenue, undefined, locale)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700">
                        {c.commission_rate}%
                      </span>
                    </td>
                    <td className="py-2.5 text-amber-600 font-medium text-right">
                      {formatCurrency(c.commission_amount, undefined, locale)}
                    </td>
                    <td className="py-2.5 text-black text-right text-xs">
                      {new Date(c.created_at).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ── Currency breakdown ── */}
      {(data?.currency_breakdown || []).length  > 0 && (
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
