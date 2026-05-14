"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { AdminDashboardData } from "@/types/dashboard";
import { EventsDonutChart } from "../EventDoughnutChart";

type DashboardPageProps = {
  data: AdminDashboardData;
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="text-xs font-semibold text-black uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-xl font-semibold text-black leading-tight">
        {value}
      </div>
      <div className="text-xs text-black mt-1">{subtitle}</div>
    </div>
  );
}

// ── Stat Row with Colored Dot ─────────────────────────────────────────────────
function StatRow({
  label,
  count,
  percentage,
  dotColor,
}: {
  label: string;
  count: number;
  percentage?: number;
  dotColor: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-b-0">
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      <span className="text-xs text-black flex-1">{label}</span>
      <span className="text-xs font-semibold text-black min-w-12 text-right">
        {count}
      </span>
      {percentage !== undefined && (
        <span className="text-xs text-black min-w-10 text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
}

// ── Revenue Row with Progress ─────────────────────────────────────────────────
function RevenueRow({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: number;
  pct: number;
  color: string;
}) {
  const { locale } = useLanguageStore();
  return (
    <div className="py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-black">{label}</span>
        <span className="text-xs font-semibold text-black">
          {formatCurrency(value, undefined, locale)}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Card Container ────────────────────────────────────────────────────────────
function Card({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-black">{title}</h3>
        {badge}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CurrencySelect({
  selected,
  currencies,
  symbols,
  onChange,
}: {
  selected: string;
  currencies: string[];
  symbols: Record<string, string>;
  onChange: (currency: string) => void;
}) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1 text-xs font-semibold border border-gray-200 rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
    >
      {currencies.map((c) => (
        <option key={c} value={c}>
          {c} ({symbols[c]})
        </option>
      ))}
    </select>
  );
}
// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage({ data }: DashboardPageProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const earnings = data?.earnings ?? [];
  const currencies = earnings.map((e: { currency: string }) => e.currency);
  const [selectedCurrency, setSelectedCurrency] = useState(
    currencies[0] ?? "NPR",
  );
  const activeEarning = earnings.find(
    (e: { currency: string }) => e.currency === selectedCurrency,
  );
  const symbolMap = Object.fromEntries(
    earnings.map((e) => [e.currency, e.symbol]),
  );

  // Calculate totals and percentages
  const totalEvents = data?.events?.total ?? 0;
  const totalOrganizers = data?.organizers?.total ?? 0;
  const totalTickets = data?.tickets?.total_sold ?? 0;
  const totalTransactions = data?.transactions?.total ?? 0;

  const completedTickets = data?.tickets?.used ?? 0;
  const activeTickets = data?.tickets?.active ?? 0;
  const cancelledTickets = data?.tickets?.cancelled ?? 0;

  const completedRefunds = data?.refunds?.completed ?? 0;
  const pendingRefunds = data?.refunds?.pending ?? 0;
  const failedRefunds = data?.refunds?.failed ?? 0;
  const processingRefunds = data?.refunds?.processing ?? 0;

  return (
    <main className="flex-1 overflow-y-auto space-y-4 p-0">
      {/* ── Top KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label={t("dashboard.dataDisplay.users")}
          value={data?.users.total ?? 0}
          subtitle={`${data?.users.active ?? 0} ${t("status.active")} · ${data?.users.inactive ?? 0} ${t("status.inactive")}`}
        />
        <KPICard
          label={t("events.ticketsSold")}
          value={totalTickets}
          subtitle={`${activeTickets} ${t("status.active")} · ${cancelledTickets} ${t("status.cancelled")}`}
        />
        <KPICard
          label={t("dashboard.dataDisplay.transactions")}
          value={totalTransactions}
          subtitle={`${data?.transactions.completed ?? 0} ${t("status.completed")} · ${data?.transactions.pending ?? 0} ${t("status.pending")}`}
        />
        <KPICard
          label={t("dashboard.dataDisplay.refunds")}
          value={formatCurrency(
            data?.refunds.completed ?? 0,
            undefined,
            locale,
          )}
          subtitle={`${data?.refunds.completed ?? 0} ${t("status.completed")} · ${data?.refunds.pending ?? 0} ${t("status.pending")}`}
        />
      </div>

      {/* ── Earnings Cards ── */}
      <div>
        <div className="flex items-center justify-start gap-5 mb-3">
          <h2 className="text-sm font-semibold text-black">
            {t("dashboard.dataDisplay.earnings") ?? "Earnings"}{" "}
            {activeEarning?.symbol && `(${activeEarning.symbol})`}
          </h2>
          {currencies.length > 1 && (
            <CurrencySelect
              selected={selectedCurrency}
              currencies={currencies}
              symbols={symbolMap}
              onChange={setSelectedCurrency}
            />
          )}
        </div>
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            label={t("dashboard.dataDisplay.grossRevenue") ?? "Gross Revenue"}
            value={formatCurrency(
              activeEarning?.gross_revenue ?? 0,
              activeEarning?.currency,
              locale,
            )}
            subtitle={`${t("dashboard.dataDisplay.netRevenue") ?? "Net"}: ${formatCurrency(
              activeEarning?.net_revenue ?? 0,
              activeEarning?.currency,
              locale,
            )}`}
          />
          <KPICard
            label={
              t("dashboard.dataDisplay.platformCommission") ?? "Commission"
            }
            value={formatCurrency(
              activeEarning?.platform_commission ?? 0,
              activeEarning?.currency,
              locale,
            )}
            subtitle={`${t("dashboard.dataDisplay.gatewayFee") ?? "Gateway Fee"}: ${formatCurrency(
              activeEarning?.gateway_fee ?? 0,
              activeEarning?.currency,
              locale,
            )}`}
          />
          <KPICard
            label={t("dashboard.dataDisplay.paidOut") ?? "Paid Out"}
            value={formatCurrency(
              activeEarning?.paid_out ?? 0,
              activeEarning?.currency,
              locale,
            )}
            subtitle={`${t("dashboard.dataDisplay.pendingPayout") ?? "Pending"}: ${formatCurrency(
              activeEarning?.pending_payout ?? 0,
              activeEarning?.currency,
              locale,
            )}`}
          />
          <KPICard
            label={t("dashboard.dataDisplay.refundAmount") ?? "Refunds"}
            value={formatCurrency(
              activeEarning?.refund_amount ?? 0,
              activeEarning?.currency,
              locale,
            )}
            subtitle=""
          />
        </div>
      </div>

      {/* ── Event Status ── */}
      <div className="">
        <Card title={t("dashboard.dataDisplay.eventStatusOverview")}>
          <div className="flex justify-center">
            <EventsDonutChart data={data?.events} />
          </div>
        </Card>
      </div>

      {/* ── Organizers + Payout Requests + Payout Bills ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Organizers */}
        <Card title={t("dashboard.dataDisplay.organizers")}>
          <StatRow
            label={t("dashboard.dataDisplay.approved")}
            count={data?.organizers.approved ?? 0}
            dotColor="#1d9e75"
          />
          <StatRow
            label={t("dashboard.dataDisplay.pending")}
            count={data?.organizers.pending ?? 0}
            dotColor="#ef9f27"
          />
          <StatRow
            label={t("dashboard.dataDisplay.rejected")}
            count={data?.organizers.rejected ?? 0}
            dotColor="#e24b4a"
          />
        </Card>

        {/* Payout Requests */}
        <Card
          title={t("dashboard.dataDisplay.payoutRequest")}
          badge={
            <span className="text-xs text-black font-semibold">
              {formatCurrency(
                data?.payout_requests.total_amount ?? 0,
                undefined,
                locale,
              )}
            </span>
          }
        >
          <StatRow
            label={t("dashboard.dataDisplay.approved")}
            count={data?.payout_requests.approved ?? 0}
            dotColor="#1d9e75"
          />
          <StatRow
            label={t("dashboard.dataDisplay.pending")}
            count={data?.payout_requests.pending ?? 0}
            dotColor="#ef9f27"
          />
          <StatRow
            label={t("dashboard.dataDisplay.rejected")}
            count={data?.payout_requests.rejected ?? 0}
            dotColor="#e24b4a"
          />
          <StatRow
            label={t("dashboard.dataDisplay.paid")}
            count={data?.payout_requests.paid ?? 0}
            dotColor="#888780"
          />
          <StatRow
            label={t("dashboard.dataDisplay.cancelled")}
            count={data?.payout_requests.cancelled ?? 0}
            dotColor="#e24b4a"
          />
        </Card>

        {/* Payout Bills */}
        <Card title={t("dashboard.dataDisplay.paymentBills")}>
          <StatRow
            label={t("dashboard.dataDisplay.paid")}
            count={data?.payment_bills.paid ?? 0}
            dotColor="#1d9e75"
          />
          <StatRow
            label={t("dashboard.dataDisplay.pending")}
            count={data?.payment_bills.pending ?? 0}
            dotColor="#ef9f27"
          />
          <StatRow
            label={t("billings.status.partially_paid")}
            count={data?.payment_bills.partially_paid ?? 0}
            dotColor="#888780"
          />
          <StatRow
            label={t("dashboard.dataDisplay.cancelled")}
            count={data?.payment_bills.cancelled ?? 0}
            dotColor="#e24b4a"
          />
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs text-black mb-1">
                {t("dashboard.dataDisplay.amountDue")}
              </div>
              <div className="text-sm font-semibold text-black">
                {formatCurrency(
                  data?.payment_bills.total_due ?? 0,
                  undefined,
                  locale,
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-black mt-2">
                {t("dashboard.dataDisplay.paidOut")}
              </div>
              <div className="text-sm font-semibold text-black">
                {formatCurrency(
                  data?.payment_bills.total_paid_out ?? 0,
                  undefined,
                  locale,
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Refunds + Tickets ── */}
      {/* <div className="grid grid-cols-2 gap-4 pb-4">
        <Card title={t("dashboard.dataDisplay.refunds")}>
          <StatRow
            label={t("dashboard.dataDisplay.completed")}
            count={completedRefunds}
            dotColor="#1d9e75"
          />
          <StatRow
            label={t("dashboard.dataDisplay.pending")}
            count={pendingRefunds}
            dotColor="#ef9f27"
          />
          <StatRow
            label={t("dashboard.dataDisplay.processing")}
            count={processingRefunds}
            dotColor="#888780"
          />
          <StatRow
            label={t("dashboard.dataDisplay.failed")}
            count={failedRefunds}
            dotColor="#e24b4a"
          />
          <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-black">
                {t("dashboard.dataDisplay.totalRefunds")}
              </span>
              <span className="text-xs font-semibold text-black">
                {formatCurrency(
                  data?.revenue.total_refunds ?? 0,
                  undefined,
                  locale,
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-black">
                {t("dashboard.dataDisplay.organizerRefunds")}
              </span>
              <span className="text-xs font-semibold text-black">
                {formatCurrency(
                  data?.revenue.organizer_refunds ?? 0,
                  undefined,
                  locale,
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-black">
                {t("dashboard.dataDisplay.commissionRefunds")}
              </span>
              <span className="text-xs font-semibold text-black">
                {formatCurrency(
                  data?.revenue.commission_refunds ?? 0,
                  undefined,
                  locale,
                )}
              </span>
            </div>
          </div>
        </Card>

        <Card title={t("dashboard.dataDisplay.tickets")}>
          <StatRow
            label={t("dashboard.dataDisplay.active")}
            count={activeTickets}
            dotColor="#1d9e75"
          />
          <StatRow
            label={t("dashboard.dataDisplay.cancelled")}
            count={cancelledTickets}
            dotColor="#e24b4a"
          />
          <StatRow
            label={t("dashboard.dataDisplay.used")}
            count={completedTickets}
            dotColor="#d3d1c7"
          />
        </Card>
      </div> */}
    </main>
  );
}
