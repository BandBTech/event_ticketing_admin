"use client";

import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { EventPerformanceProps } from "@/types/reports";
import {MetricCard} from "@/app/reports/components/CardComponents"
import {SectionCard} from "@/app/reports/components/CardComponents"
import {StatRow} from "@/app/reports/components/CardComponents"

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  completed:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  on_sale:    { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  live:       { bg: "bg-green-50",   text: "text-green-700",   dot: "bg-green-500" },
  upcoming:   { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500" },
  pending:    { bg: "bg-yellow-50",  text: "text-yellow-700",  dot: "bg-yellow-500" },
  cancelled:  { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500" },
  rejected:   { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-600" },
};


export default function EventPerformance({ data }: EventPerformanceProps) {
  const { locale } = useLanguageStore();

  const statusStyle = STATUS_STYLES[(data?.status || "")] ?? STATUS_STYLES["pending"];
  const commissionPct = (data?.revenue || 0) > 0
    ? Math.round(((data?.commission || 0) / (data?.revenue || 0)) * 100)
    : 0;
  const organizerPct = 100 - commissionPct;

  const startDate = new Date((data?.start_date || 0));
  const endDate = new Date((data?.end_date || 0));
  const dateLabel = startDate.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeLabel = `${startDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} – ${endDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;

  const maxTierRevenue = Math.max(
    ...(data?.tier_performance || []).map((t) => t.revenue),
    1,
  );

  return (
    <div className="space-y-5">

      {/* ── Event header card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {data?.banner_image && (
          <div className="h-36 w-full overflow-hidden">
            <img
              src={data.banner_image}
              alt={data.event_title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 mb-1">
              {data?.event_title}
            </h1>
            <div className="text-sm text-gray-400">{dateLabel}</div>
            <div className="text-xs text-gray-400 mt-0.5">{timeLabel}</div>
          </div>
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {(data?.status ?? "").replace("_", " ")}
          </span>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Revenue"
          value={formatCurrency(data?.revenue || 0, undefined, locale)}
          sub="Gross collected"
          valueColor="text-blue-600"
        />
        <MetricCard
          label="Organizer earnings"
          value={formatCurrency(data?.organizer_earnings || 0, undefined, locale)}
          sub={`${organizerPct}% of revenue`}
          valueColor="text-emerald-600"
        />
        <MetricCard
          label="Commission"
          value={formatCurrency(data?.commission || 0, undefined, locale)}
          sub={`${commissionPct}% of revenue`}
          valueColor="text-amber-500"
        />
        <MetricCard
          label="Avg. ticket price"
          value={formatCurrency(data?.average_ticket_price || 0, undefined, locale)}
          sub={`${data?.total_transactions} transactions`}
        />
      </div>

      {/* ── Capacity + Revenue split ── */}
      <div className="grid grid-cols-2 gap-5">

        <SectionCard title="Ticket sales">
          {/* Capacity bar */}
          <div className="mb-5">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-sm text-gray-600 font-medium">Capacity fill</span>
              <span className="text-sm font-semibold text-gray-800">
                {data?.tickets_sold} / {data?.capacity}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${Math.min(data?.sold_percentage || 0, 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-gray-400">
              {(data?.sold_percentage ?? 0).toFixed(1)}% sold · {(data?.capacity || 0) - (data?.tickets_sold || 0)} remaining
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50">
            <StatRow label="Tickets sold" value={(data?.tickets_sold || 0)} />
            <StatRow label="Total capacity" value={(data?.capacity || 0)} />
            <StatRow
              label="Remaining"
              value={(data?.capacity || 0) - (data?.tickets_sold || 0)}
              badge={{ bg: "bg-gray-100", text: "text-gray-600" }}
            />
            <StatRow label="Transactions" value={(data?.total_transactions || 0)} />
          </div>
        </SectionCard>

        <SectionCard title="Revenue split">
          {/* Split bar */}
          <div className="mb-5">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex mb-2">
              <div
                className="h-full bg-emerald-400 transition-all duration-700"
                style={{ width: `${organizerPct}%` }}
              />
              <div
                className="h-full bg-amber-400 transition-all duration-700"
                style={{ width: `${commissionPct}%` }}
              />
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                Organizer {organizerPct}%
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                Commission {commissionPct}%
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50">
            <StatRow
              label="Gross revenue"
              value={formatCurrency(data?.revenue || 0, undefined, locale)}
            />
            <StatRow
              label="Organizer earnings"
              value={formatCurrency(data?.organizer_earnings || 0, undefined, locale)}
              badge={{ bg: "bg-emerald-50", text: "text-emerald-700" }}
            />
            <StatRow
              label="Commission"
              value={formatCurrency(data?.commission || 0, undefined, locale)}
              badge={{ bg: "bg-amber-50", text: "text-amber-700" }}
            />
          </div>
        </SectionCard>
      </div>

      {/* ── Tier performance ── */}
      <SectionCard title="Tier performance">
        {(data?.tier_performance || []).length === 0 ? (
          <p className="text-sm text-gray-400">No tier data available.</p>
        ) : (
          <div className="space-y-5">
            {(data?.tier_performance || []).map((tier) => {
              const revPct = Math.round((tier.revenue / maxTierRevenue) * 100);
              const capPct = Math.min(tier.sold_percentage, 100);
              return (
                <div key={tier.tier_id} className="pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                  {/* Tier header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">
                        {tier.tier_name}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        {formatCurrency(tier.ticket_price, undefined, locale)} / ticket
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${
                        tier.tickets_sold > 0
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {tier.tickets_sold} sold
                    </span>
                  </div>

                  {/* Capacity fill */}
                  <div className="mb-1.5">
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Capacity fill</span>
                      <span>{tier.tickets_sold} / {tier.ticket_capacity}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-400 transition-all duration-700"
                        style={{ width: `${capPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Revenue bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Revenue</span>
                      <span>{formatCurrency(tier.revenue, undefined, locale)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                        style={{ width: `${revPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

    </div>
  );
}