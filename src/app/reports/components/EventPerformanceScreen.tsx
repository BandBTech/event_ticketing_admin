"use client";

import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { EventPerformanceProps } from "@/types/reports";
import { MetricCard } from "@/app/reports/components/CardComponents";
import { SectionCard } from "@/app/reports/components/CardComponents";
import { StatRow } from "@/app/reports/components/CardComponents";
import {
  InfoIcon,
  CalendarBlankIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    completed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    on_sale: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    live: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    upcoming: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      dot: "bg-violet-500",
    },
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
    },
    cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
    rejected: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-600" },
  };

export default function EventPerformance({
  data,
  isEventIdSelected,
}: EventPerformanceProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const statusStyle =
    STATUS_STYLES[data?.status || ""] ?? STATUS_STYLES["pending"];
  const commissionPct =
    (data?.revenue || 0) > 0
      ? Math.round(((data?.commission || 0) / (data?.revenue || 0)) * 100)
      : 0;
  const organizerPct = 100 - commissionPct;

  const startDate = new Date(data?.start_date || 0);
  const endDate = new Date(data?.end_date || 0);
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
      {!isEventIdSelected ? (
        <div className="flex items-center justify-center min-h-[480px] w-full">
          <div className="flex flex-col items-center gap-6 max-w-[360px] text-center">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-muted border flex items-center justify-center">
                <CalendarBlankIcon
                  weight="light"
                  className="w-9 h-9 text-muted-foreground"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-background border flex items-center justify-center">
                <MagnifyingGlassIcon className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-base font-medium">
                {t("reports.eventPerformance.noEvent")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("reports.eventPerformance.noEventSubtitle")}
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg border w-full text-left">
              <InfoIcon
                weight="light"
                className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("reports.eventPerformance.noEventSubtext")}
              </p>
            </div>
          </div>
        </div>
      ) : (
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
                <h1 className="text-xl font-semibold text-black mb-1">
                  {data?.event_title}
                </h1>
                <div className="text-sm text-black">{dateLabel}</div>
                <div className="text-xs text-black mt-0.5">{timeLabel}</div>
              </div>
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${statusStyle.bg} ${statusStyle.text}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                />
                {t("status." + data?.status)}
              </span>
            </div>
          </div>

          {/* ── KPI row ── */}
          <div className="grid grid-cols-4 gap-4 font-medium">
            <MetricCard
              label={t("reports.eventPerformance.revenue")}
              value={formatCurrency(data?.revenue || 0, undefined, locale)}
              sub={t("reports.eventPerformance.grossCollected")}
              // valueColor="text-blue-600"
            />
            <MetricCard
              label={t("reports.eventPerformance.organizerEarnings")}
              value={formatCurrency(
                data?.organizer_earnings || 0,
                undefined,
                locale,
              )}
              sub={`${organizerPct}% ${t("reports.eventPerformance.ofRevenue")}`}
              // valueColor="text-emerald-600"
            />
            <MetricCard
              label={t("reports.eventPerformance.commission")}
              value={formatCurrency(data?.commission || 0, undefined, locale)}
              sub={`${commissionPct}% ${t("reports.eventPerformance.ofRevenue")}`}
              // valueColor="text-amber-500"
            />
            <MetricCard
              label={t("reports.eventPerformance.avgTicketPrice")}
              value={formatCurrency(
                data?.average_ticket_price || 0,
                undefined,
                locale,
              )}
              sub={`${data?.total_transactions} ${t("reports.eventPerformance.transactions")}`}
            />
          </div>

          {/* ── Capacity + Revenue split ── */}
          <div className="grid grid-cols-2 gap-5">
            <SectionCard title={t("reports.eventPerformance.ticketSales")}>
              {/* Capacity bar */}
              <div className="mb-5">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm text-black font-medium">
                    {t("reports.eventPerformance.capacityFill")}
                  </span>
                  <span className="text-sm font-semibold text-black">
                    {data?.tickets_sold} / {data?.capacity}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(data?.sold_percentage || 0, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-black">
                  {(data?.sold_percentage ?? 0).toFixed(1)}%{" "}
                  {t("reports.eventPerformance.sold")} ·{" "}
                  {(data?.capacity || 0) - (data?.tickets_sold || 0)}{" "}
                  {t("reports.eventPerformance.remaining")}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <StatRow
                  label={t("reports.eventPerformance.ticketSold")}
                  value={data?.tickets_sold || 0}
                />
                <StatRow
                  label={t("reports.eventPerformance.totalCapacity")}
                  value={data?.capacity || 0}
                />
                <StatRow
                  label={t("reports.eventPerformance.remaining")}
                  value={(data?.capacity || 0) - (data?.tickets_sold || 0)}
                  badge={{ bg: "bg-gray-100", text: "text-black" }}
                />
                <StatRow
                  label={t("reports.eventPerformance.transactions")}
                  value={data?.total_transactions || 0}
                />
              </div>
            </SectionCard>

            <SectionCard title={t("reports.eventPerformance.revenueSplt")}>
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
                  <span className="flex items-center gap-1.5 text-[11px] text-black">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                    {t("reports.eventPerformance.organizer")} {organizerPct}%
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-black">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                    {t("reports.eventPerformance.commission")} {commissionPct}%
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <StatRow
                  label={t("reports.eventPerformance.grossRevenue")}
                  value={formatCurrency(data?.revenue || 0, undefined, locale)}
                />
                <StatRow
                  label={t("reports.eventPerformance.organizerEarnings")}
                  value={formatCurrency(
                    data?.organizer_earnings || 0,
                    undefined,
                    locale,
                  )}
                  // badge={{ bg: "bg-emerald-50", text: "text-emerald-700" }}
                />
                <StatRow
                  label={t("reports.eventPerformance.commission")}
                  value={formatCurrency(
                    data?.commission || 0,
                    undefined,
                    locale,
                  )}
                  // badge={{ bg: "bg-amber-50", text: "text-amber-700" }}
                />
              </div>
            </SectionCard>
          </div>

          {/* ── Tier performance ── */}
          <SectionCard title={t("reports.eventPerformance.tierPerformance")}>
            {(data?.tier_performance || []).length === 0 ? (
              <p className="text-sm text-black">
                {t("reports.eventPerformance.noTierData")}
              </p>
            ) : (
              <div className="space-y-5">
                {(data?.tier_performance || []).map((tier) => {
                  const revPct = Math.round(
                    (tier.revenue / maxTierRevenue) * 100,
                  );
                  const capPct = Math.min(tier.sold_percentage, 100);
                  return (
                    <div
                      key={tier.tier_id}
                      className="pb-5 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                      {/* Tier header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-sm font-semibold text-black">
                            {tier.tier_name}
                            {/* {t("reports.eventPerformance." + tier.tier_name)} */}
                          </span>
                          <span className="ml-2 text-xs text-black">
                            {formatCurrency(
                              tier.ticket_price,
                              undefined,
                              locale,
                            )}{" "}
                            / {t("reports.eventPerformance.ticket")}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${
                            tier.tickets_sold > 0
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-100 text-black"
                          }`}
                        >
                          {tier.tickets_sold}{" "}
                          {t("reports.eventPerformance.sold")}
                        </span>
                      </div>

                      {/* Capacity fill */}
                      <div className="mb-1.5">
                        <div className="flex justify-between text-[11px] text-black mb-1">
                          <span>
                            {t("reports.eventPerformance.capacityFill")}
                          </span>
                          <span>
                            {tier.tickets_sold} / {tier.ticket_capacity}
                          </span>
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
                        <div className="flex justify-between text-[11px] text-black mb-1">
                          <span>{t("reports.eventPerformance.revenue")}</span>
                          <span>
                            {formatCurrency(tier.revenue, undefined, locale)}
                          </span>
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
      )}
    </div>
  );
}
