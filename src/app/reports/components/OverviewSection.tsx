"use client";

import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import {
  MetricCard,
  SectionCard,
  StatRow,
} from "@/app/reports/components/CardComponents";
import { OverviewReportProps } from "@/types/reports";

export default function ReportPage({ data }: OverviewReportProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

    console.log("📊 Report data:", data); // add this
  console.log("📊 Overview:", data?.overview); // and this

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
          sub={`${ev?.live || 0} ${t("status.live")} · ${ev?.on_sale || 0} ${t("status.on_sale")}`}
        />
        <MetricCard
          label={t("dashboard.dataDisplay.organizers")}
          value={or?.total || 0}
          sub={`${or?.approved || 0} ${t("status.approved")} · ${or?.pending || 0} ${t("status.pending")}`}
        />
        <MetricCard
          label={t("dashboard.dataDisplay.users")}
          value={us?.total || 0}
          sub={`${us?.active || 0} ${t("status.active")} · ${us?.inactive || 0} ${t("status.inactive")}`}
        />
      </div>

      {/* ── Row 2: Secondary metrics ── */}
      <div className="grid grid-cols-3 gap-4 font-medium">
        <MetricCard
          label={t("dashboard.dataDisplay.refunds")}
          value={rf?.total || 0}
          sub={`${rf?.pending || 0} ${t("status.pending")} · ${rf?.succeeded || 0} ${t("status.succeeded")}`}
        />
        <MetricCard
          label={t("pages.billings")}
          value={bl?.total || 0}
          sub={`${bl?.paid || 0} ${t("dashboard.dataDisplay.paid")} · ${bl?.pending || 0} ${t("status.pending")}`}
        />
        <MetricCard
          label={t("pages.payouts")}
          value={py?.total || 0}
          sub={`${py?.paid || 0} ${t("dashboard.dataDisplay.paid")} · ${py?.pending || 0} ${t("status.pending")}`}
        />
      </div>

      {/* ── Row 3: Transactions | Event stats ── */}
      <div className="font-medium">
        <SectionCard title={t("reports.overview.revenue&Transactions")}>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            {/* Transactions */}
            <div className="pr-6">
              <p className="text-xs font-semibold text-black uppercase tracking-wider mb-3">
                {t("reports.overview.transactions")}
              </p>
              <StatRow
                label={t("transactions.transactionStatus.completed")}
                value={tx?.succeeded || 0}
              />
              <StatRow
                label={t("transactions.transactionStatus.pending")}
                value={tx?.pending || 0}
              />
              <StatRow
                label={t("transactions.transactionStatus.failed")}
                value={tx?.failed || 0}
              />
              <StatRow
                label={t("transactions.transactionStatus.expired")}
                value={tx?.expired || 0}
              />
              <StatRow
                label={t("transactions.transactionStatus.cancelled")}
                value={tx?.canceled || 0}
              />
            </div>

            {/* Refunds */}
            <div className="pl-6">
              <p className="text-xs font-semibold text-black uppercase tracking-wider mb-3">
                {t("reports.financial.refunds")}
              </p>
              <StatRow
                label={t("dashboard.dataDisplay.succeeded")}
                value={rf?.succeeded || 0}
              />
              <StatRow
                label={t("dashboard.dataDisplay.pending")}
                value={rf?.pending || 0}
              />
              <StatRow
                label={t("dashboard.dataDisplay.processing")}
                value={rf?.processing || 0}
              />
              <StatRow
                label={t("dashboard.dataDisplay.failed")}
                value={rf?.failed || 0}
              />
              <StatRow
                label={t("dashboard.dataDisplay.rejected")}
                value={rf?.rejected || 0}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Row 4: Event status breakdown bars ── */}
      <SectionCard title={t("reports.overview.eventStatusBreakdown")}>
        <div className="space-y-3">
          {[
            {
              label: t("reports.overview.totalEvents"),
              value: ev?.total,
              color: "#10b981",
            },
            {
              label: t("status.approved"),
              value: ev?.approved,
              color: "#10b981",
            },
            {
              label: t("status.cancel_pending"),
              value: ev?.cancel_pending,
              color: "#10b981",
            },
            {
              label: t("status.cancelled"),
              value: ev?.cancelled,
              color: "#ef4444",
            },
            {
              label: t("status.completed"),
              value: ev?.completed,
              color: "#10b981",
            },
            { label: t("status.live"), value: ev?.live, color: "#6366f1" },
            {
              label: t("status.on_hold"),
              value: ev?.on_hold,
              color: "#3b82f6",
            },
            {
              label: t("status.on_sale"),
              value: ev?.on_sale,
              color: "#3b82f6",
            },
            {
              label: t("status.pending"),
              value: ev?.pending,
              color: "#f59e0b",
            },
            {
              label: t("status.rejected"),
              value: ev?.rejected,
              color: "#f87171",
            },
            {
              label: t("status.sales_end"),
              value: ev?.sales_end,
              color: "#10b981",
            },
            {
              label: t("status.sales_upcoming"),
              value: ev?.sales_upcoming,
              color: "#10b981",
            },
            {
              label: t("status.scheduled"),
              value: ev?.scheduled,
              color: "#06b6d4",
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
