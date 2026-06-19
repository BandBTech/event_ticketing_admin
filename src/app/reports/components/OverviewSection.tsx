"use client";

import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { MetricCard, SectionCard, StatRow } from "@/app/reports/components/CardComponents";

// New API response shape
interface NewOverviewData {
  events: {
    approved: number; cancel_pending: number; cancelled: number;
    completed: number; draft: number; held: number; hold: number;
    live: number; on_sale: number; pending: number; rejected: number;
    sales_end: number; sales_upcoming: number; scheduled: number; total: number;
  };
  users: { active: number; inactive: number; total: number };
  guests: { total: number };
  organizers: { approved: number; pending: number; rejected: number; total: number };
  transactions: {
    canceled: number; expired: number; failed: number; pending: number;
    processing: number; succeeded: number; total: number;
  };
  refunds: {
    cancelled: number; failed: number; pending: number;
    processing: number; rejected: number; succeeded: number; total: number;
  };
  billing: { cancelled: number; paid: number; partially_paid: number; pending: number; total: number };
  payouts: { cancelled: number; paid: number; partially_paid: number; pending: number; total: number };
  sales_trend: unknown[];
}

interface ReportPageProps {
  data: NewOverviewData;
}

export default function ReportPage({ data }: ReportPageProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const ev = data?.events;
  const tx = data?.transactions;
  const rf = data?.refunds;
  const bl = data?.billing;
  const py = data?.payouts;
  const or = data?.organizers;
  const us = data?.users;

  return (
    <main className="flex-1 overflow-y-auto space-y-5">

      {/* ── Row 1: Top KPIs ── */}
      <div className="grid grid-cols-4 gap-4 font-medium">
        <MetricCard
          label={t("reports.overview.transactions")}
          value={tx?.total || 0}
          sub={`${tx?.succeeded || 0} ${t("transactions.transactionStatus.completed")}`}
        />
        <MetricCard
          label={t("reports.overview.totalEvents")}
          value={ev?.total || 0}
          sub={`${ev?.live || 0} live · ${ev?.on_sale || 0} on sale`}
        />
        <MetricCard
          label={t("dashboard.dataDisplay.organizers")}
          value={or?.total || 0}
          sub={`${or?.approved || 0} approved · ${or?.pending || 0} pending`}
        />
        <MetricCard
          label={t("dashboard.dataDisplay.users")}
          value={us?.total || 0}
          sub={`${us?.active || 0} active · ${us?.inactive || 0} inactive`}
        />
      </div>

      {/* ── Row 2: Secondary metrics ── */}
      <div className="grid grid-cols-3 gap-4 font-medium">
        <MetricCard
          label={t("dashboard.dataDisplay.refunds")}
          value={rf?.total || 0}
          sub={`${rf?.pending || 0} pending · ${rf?.succeeded || 0} succeeded`}
        />
        <MetricCard
          label={t("pages.billings")}
          value={bl?.total || 0}
          sub={`${bl?.paid || 0} paid · ${bl?.pending || 0} pending`}
        />
        <MetricCard
          label={t("pages.payouts")}
          value={py?.total || 0}
          sub={`${py?.paid || 0} paid · ${py?.pending || 0} pending`}
        />
      </div>

      {/* ── Row 3: Transactions | Event stats ── */}
      <div className="grid grid-cols-2 gap-5 font-medium">
        <SectionCard title={t("reports.overview.revenue&Transactions")}>
          <div className="border-t border-gray-50">
            <p className="text-sm font-semibold text-black uppercase mb-3">
              {t("reports.overview.transactions")}
            </p>
            <StatRow label={t("transactions.transactionStatus.completed")} value={tx?.succeeded || 0} />
            <StatRow label={t("transactions.transactionStatus.pending")}   value={tx?.pending || 0} />
            <StatRow label={t("transactions.transactionStatus.failed")}    value={tx?.failed || 0} />
            <StatRow label={t("transactions.transactionStatus.expired")}                                       value={tx?.expired || 0} />
            <StatRow label={t("transactions.transactionStatus.cancelled")}                                      value={tx?.canceled || 0} />
          </div>

          <div className="border-t border-gray-50 mt-4 pt-3">
            <p className="text-sm font-semibold text-black uppercase mb-3">Refunds</p>
            <StatRow label="Succeeded"  value={rf?.succeeded || 0} />
            <StatRow label="Pending"    value={rf?.pending || 0} />
            <StatRow label="Processing" value={rf?.processing || 0} />
            <StatRow label="Failed"     value={rf?.failed || 0} />
            <StatRow label="Rejected"   value={rf?.rejected || 0} />
          </div>
        </SectionCard>

        {/* <SectionCard title={t("reports.overview.eventStatistics")}>
          <StatRow label={t("reports.overview.totalEvents")} value={ev?.total || 0} />
          <StatRow label={t("status.completed")}             value={ev?.completed || 0} />
          <StatRow label={t("status.on_sale")}               value={ev?.on_sale || 0} />
          <StatRow label={t("status.live")}                  value={ev?.live || 0} />
          <StatRow label={t("status.scheduled")}                          value={ev?.scheduled || 0} />
          <StatRow label={t("status.pending")}               value={ev?.pending || 0} />
          <StatRow label={t("status.cancelled")}             value={ev?.cancelled || 0} />
          <StatRow label="Cancel pending"                     value={ev?.cancel_pending || 0} />
          <StatRow label={t("status.rejected")}              value={ev?.rejected || 0} />
          <StatRow label={t("event.badge.sales_end")}                          value={ev?.sales_end || 0} />
          <StatRow label={t("event.badge.sales_upcoming")}                     value={ev?.sales_upcoming || 0} />
        </SectionCard> */}
      </div>

      {/* ── Row 4: Event status breakdown bars ── */}
      <SectionCard title={t("reports.overview.eventStatusBreakdown")}>
        <div className="space-y-3">
          {[
            { label: t("status.total"), value: ev?.total,     color: "#10b981" },
            { label: t("status.completed"), value: ev?.completed,     color: "#10b981" },
            { label: t("status.on_sale"),   value: ev?.on_sale,       color: "#3b82f6" },
            { label: t("status.live"),      value: ev?.live,          color: "#6366f1" },
            { label: "Scheduled",           value: ev?.scheduled,     color: "#06b6d4" },
            { label: t("status.pending"),   value: ev?.pending,       color: "#f59e0b" },
            { label: t("status.cancelled"), value: ev?.cancelled,     color: "#ef4444" },
            { label: t("status.cancel_pending"), value: ev?.cancel_pending,     color: "#10b981" },
            { label: t("status.rejected"),  value: ev?.rejected,      color: "#f87171" },
            { label: t("status.sales_end"), value: ev?.sales_end,     color: "#10b981" },
            { label: t("status.sales_upcoming"), value: ev?.sales_upcoming,     color: "#10b981" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-sm text-black w-20 text-right flex-shrink-0">
                {s.label}
              </span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round(((s.value || 0) / (ev?.total || 1)) * 100)}%`,
                    background: s.color,
                    minWidth: (s.value || 0) > 0 ? "6px" : "0",
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-black w-6 flex-shrink-0">
                {s.value ?? 0}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

    </main>
  );
}