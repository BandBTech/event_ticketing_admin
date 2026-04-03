"use client";

import { ElementType } from "react";
import { formatCurrency } from "@/lib/utils";
import { AdminDashboardData } from "@/types/dashboard";
import {
  ClockIcon,
  CalendarCheckIcon,
  UsersIcon,
  TicketIcon,
  ArrowsClockwiseIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react";
import { useLanguageStore } from "@/store/languageStore";

type DashboardPageProps = {
  data: AdminDashboardData;
};

// ── Top Stat Card ─────────────────────────────────────────────────────────────
function TopStatCard({
  icon: Icon,
  value,
  label,
  iconBg,
  iconColor,
}: {
  icon: ElementType;
  value: number | string;
  label: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        <span className={iconColor}>
          <Icon size={24} />
        </span>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800 tracking-tight leading-none">
          {value}
        </div>
        <div className="text-sm text-gray-400 mt-2 font-medium">{label}</div>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function SectionCard({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
        <h2 className="text-base font-semibold text-gray-700">{title}</h2>
        {badge}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ── Revenue Progress Row ──────────────────────────────────────────────────────
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
    <div className="flex items-center gap-4 py-2">
      <span className="text-sm text-gray-500 w-44 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-24 text-right flex-shrink-0">
        {formatCurrency(value, undefined, locale)}
      </span>
    </div>
  );
}

// ── Status Grid (reusable) ────────────────────────────────────────────────────
function StatusGrid({
  items,
}: {
  items: {
    label: string;
    value: number | undefined;
    bg: string;
    text: string;
  }[];
}) {
  return (
    <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((s) => (
        <div
          key={s.label}
          className={`rounded-xl px-2 py-3 text-center ${s.bg}`}
        >
          <div className={`text-2xl font-bold leading-none ${s.text}`}>
            {s.value ?? 0}
          </div>
          <div
            className={`text-[11px] font-semibold mt-1.5 ${s.text} opacity-75`}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage({ data }: DashboardPageProps) {
  const { locale } = useLanguageStore();

  return (
    <main className="flex-1 overflow-y-auto space-y-5">
      {/* ── Row 6: Users ── */}
      <SectionCard title="Users">
        <StatusGrid
          items={[
            {
              label: "Total Users",
              value: data?.users.total,
              bg: "bg-gray-100",
              text: "text-gray-700",
            },
            {
              label: "Active Users",
              value: data?.users.active,
              bg: "bg-green-50",
              text: "text-green-700",
            },
            {
              label: "Inactive Users",
              value: data?.users.inactive,
              bg: "bg-yellow-50",
              text: "text-yellow-700",
            },
            {
              label: "Suspended Users",
              value: data?.users.suspended,
              bg: "bg-red-50",
              text: "text-red-600",
            },
          ]}
        />
      </SectionCard>
      {/* ── Row 1: Top KPI cards ── */}
      {/* <div className="grid grid-cols-3 gap-5">
        <TopStatCard
          icon={CalendarCheckIcon}
          value={data?.events.completed ?? 0}
          label="Successful Events"
          iconBg="bg-green-50"
          iconColor="text-green-500"
        />
        <TopStatCard
          icon={ClockIcon}
          value={data?.events.pending ?? 0}
          label="Pending Approval"
          iconBg="bg-yellow-50"
          iconColor="text-yellow-500"
        />
        <TopStatCard
          icon={UsersIcon}
          value={data?.organizers.total ?? 0}
          label="Organizers"
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
      </div> */}

      {/* ── Row 2: Summary mini-cards ── */}
      {/* <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: data?.users.total,
            sub: `${data?.users.active} active`,
            color: "text-blue-600",
            border: "border-blue-100",
          },
          {
            label: "Tickets Sold",
            value: data?.tickets.total_sold,
            sub: `${data?.tickets.active} active`,
            color: "text-violet-600",
            border: "border-violet-100",
          },
          {
            label: "Transactions",
            value: data?.transactions.total,
            sub: `${data?.transactions.completed} completed`,
            color: "text-emerald-600",
            border: "border-emerald-100",
          },
          {
            label: "Gross Revenue",
            value: formatCurrency(
              data?.revenue.gross_revenue ?? 0,
              undefined,
              locale,
            ),
            sub: `${formatCurrency(data?.revenue.gross_organizer_earnings ?? 0, undefined, locale)} to organizers`,
            color: "text-orange-600",
            border: "border-orange-100",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-2xl border ${s.border} p-4 shadow-sm`}
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm font-semibold text-gray-600 mt-1">
              {s.label}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div> */}

      {/* ── Row 3: Revenue + Events ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Revenue Overview */}
        <SectionCard title="Revenue Overview">
          <div className="px-6 pt-2 pb-4 divide-y divide-gray-50">
            <RevenueRow
              label="Gross Revenue"
              value={data?.revenue.gross_revenue ?? 0}
              pct={100}
              color="#3b82f6"
            />
            <RevenueRow
              label="Net Revenue"
              value={data?.revenue.net_revenue ?? 0}
              pct={Math.round(
                ((data?.revenue.net_revenue ?? 0) /
                  (data?.revenue.gross_revenue ?? 1)) *
                  100,
              )}
              color="#6366f1"
            />
            <RevenueRow
              label="Organizer Earnings"
              value={data?.revenue.gross_organizer_earnings ?? 0}
              pct={Math.round(
                ((data?.revenue.gross_organizer_earnings ?? 0) /
                  (data?.revenue.gross_revenue ?? 1)) *
                  100,
              )}
              color="#10b981"
            />
            <RevenueRow
              label="Platform Commission"
              value={data?.revenue.gross_commission ?? 0}
              pct={Math.round(
                ((data?.revenue.gross_commission ?? 0) /
                  (data?.revenue.gross_revenue ?? 1)) *
                  100,
              )}
              color="#f59e0b"
            />
          </div>

          {/* Net split */}
          {/* <div className="mx-6 mb-3 grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
            {[
              {
                label: "Net Organizer Earnings",
                value: data?.revenue.net_organizer_earnings ?? 0,
                color: "text-emerald-600",
              },
              {
                label: "Net Commission",
                value: data?.revenue.net_commission ?? 0,
                color: "text-amber-600",
              },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <div className={`text-lg font-bold ${b.color}`}>
                  {formatCurrency(b.value, undefined, locale)}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {b.label}
                </div>
              </div>
            ))}
          </div> */}
        </SectionCard>

        {/* Event Status Overview */}
        <SectionCard title="Event Status Overview">
          <StatusGrid
            items={[
              {
                label: "Total",
                value: data?.events.total,
                bg: "bg-gray-100",
                text: "text-gray-700",
              },
              {
                label: "Completed",
                value: data?.events.completed,
                bg: "bg-green-50",
                text: "text-green-700",
              },
              {
                label: "On Sale",
                value: data?.events.on_sale,
                bg: "bg-blue-50",
                text: "text-blue-700",
              },
              {
                label: "Upcoming",
                value: data?.events.upcoming,
                bg: "bg-violet-50",
                text: "text-violet-700",
              },
              {
                label: "Pending",
                value: data?.events.pending,
                bg: "bg-yellow-50",
                text: "text-yellow-700",
              },
              {
                label: "Cancelled",
                value: data?.events.cancelled,
                bg: "bg-red-50",
                text: "text-red-600",
              },
              {
                label: "Live",
                value: data?.events.live,
                bg: "bg-emerald-50",
                text: "text-emerald-700",
              },
              {
                label: "Rejected",
                value: data?.events.rejected,
                bg: "bg-red-50",
                text: "text-red-700",
              },
            ]}
          />
        </SectionCard>
      </div>

      {/* ── Row 4: Organizers + Tickets + Transactions ── */}
      <div className="grid grid-cols-3 gap-5">
        {/* Organizers */}
        <SectionCard title="Organizers">
          <StatusGrid
            items={[
              {
                label: "Total",
                value: data?.organizers.total,
                bg: "bg-gray-100",
                text: "text-gray-700",
              },
              {
                label: "Approved",
                value: data?.organizers.approved,
                bg: "bg-green-50",
                text: "text-green-700",
              },
              {
                label: "Pending",
                value: data?.organizers.pending,
                bg: "bg-yellow-50",
                text: "text-yellow-700",
              },
              {
                label: "Rejected",
                value: data?.organizers.rejected,
                bg: "bg-red-50",
                text: "text-red-700",
              },
            ]}
          />
        </SectionCard>

        {/* Tickets */}
        <SectionCard title="Tickets">
          <StatusGrid
            items={[
              {
                label: "Total Sold",
                value: data?.tickets.total_sold,
                bg: "bg-violet-50",
                text: "text-violet-700",
              },
              {
                label: "Active",
                value: data?.tickets.active,
                bg: "bg-blue-50",
                text: "text-blue-700",
              },
              {
                label: "Cancelled",
                value: data?.tickets.cancelled,
                bg: "bg-red-50",
                text: "text-red-600",
              },
              {
                label: "Used",
                value: data?.tickets.used,
                bg: "bg-gray-100",
                text: "text-gray-600",
              },
            ]}
          />
        </SectionCard>

        {/* Transactions */}
        <SectionCard title="Transactions">
          <StatusGrid
            items={[
              {
                label: "Total",
                value: data?.transactions.total,
                bg: "bg-gray-100",
                text: "text-gray-700",
              },
              {
                label: "Completed",
                value: data?.transactions.completed,
                bg: "bg-emerald-50",
                text: "text-emerald-700",
              },
              {
                label: "Pending",
                value: data?.transactions.pending,
                bg: "bg-yellow-50",
                text: "text-yellow-700",
              },
              {
                label: "Failed",
                value: data?.transactions.failed,
                bg: "bg-red-50",
                text: "text-red-600",
              },
            ]}
          />
        </SectionCard>
      </div>

      {/* ── Row 5: Payout Requests + Payment Bills + Refunds ── */}
      <div className="grid grid-cols-3 gap-5">
        {/* Payout Requests */}
        <SectionCard
          title="Payout Requests"
          badge={
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {formatCurrency(
                data?.payout_requests.total_amount ?? 0,
                undefined,
                locale,
              )}
            </span>
          }
        >
          <StatusGrid
            items={[
              {
                label: "Total",
                value: data?.payout_requests.total,
                bg: "bg-gray-100",
                text: "text-gray-700",
              },
              {
                label: "Approved",
                value: data?.payout_requests.approved,
                bg: "bg-green-50",
                text: "text-green-700",
              },
              {
                label: "Pending",
                value: data?.payout_requests.pending,
                bg: "bg-yellow-50",
                text: "text-yellow-700",
              },
              {
                label: "Paid",
                value: data?.payout_requests.paid,
                bg: "bg-blue-50",
                text: "text-blue-700",
              },
              {
                label: "Rejected",
                value: data?.payout_requests.rejected,
                bg: "bg-red-50",
                text: "text-red-600",
              },
              {
                label: "Cancelled",
                value: data?.payout_requests.cancelled,
                bg: "bg-gray-50",
                text: "text-gray-500",
              },
            ]}
          />
        </SectionCard>

        {/* Payment Bills */}
        <SectionCard title="Payment Bills">
          <div className="px-6 py-5 space-y-3">
            {/* Bills status counts */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Total Bills",
                  value: data?.payment_bills.total,
                  bg: "bg-gray-100",
                  text: "text-gray-700",
                },
                {
                  label: "Paid",
                  value: data?.payment_bills.paid,
                  bg: "bg-green-50",
                  text: "text-green-700",
                },
                {
                  label: "Pending",
                  value: data?.payment_bills.pending,
                  bg: "bg-yellow-50",
                  text: "text-yellow-700",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-xl px-2 py-3 text-center ${s.bg}`}
                >
                  <div className={`text-2xl font-bold leading-none ${s.text}`}>
                    {s.value ?? 0}
                  </div>
                  <div
                    className={`text-[11px] font-semibold mt-1.5 ${s.text} opacity-75`}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            {/* Amount breakdown */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Amount Due",
                  value: data?.payment_bills.total_due,
                  color: "text-red-500",
                  bg: "bg-red-50",
                },
                {
                  label: "Paid Out",
                  value: data?.payment_bills.total_paid_out,
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                },
              ].map((b) => (
                <div
                  key={b.label}
                  className={`rounded-xl p-3 text-center ${b.bg}`}
                >
                  <div className={`text-base font-bold ${b.color}`}>
                    {formatCurrency(b.value ?? 0, undefined, locale)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {b.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Refunds */}
        <SectionCard title="Refunds">
          <StatusGrid
            items={[
              {
                label: "Completed",
                value: data?.refunds.completed,
                bg: "bg-green-50",
                text: "text-green-700",
              },
              {
                label: "Pending",
                value: data?.refunds.pending,
                bg: "bg-yellow-50",
                text: "text-yellow-700",
              },
            ]}
          />

          {/* Refunds */}
          <div className="mx-6 mb-3 grid grid-cols-3 gap-3 bg-red-50 rounded-xl p-4">
            {[
              {
                label: "Total Refunds",
                value: data?.revenue.total_refunds ?? 0,
                color: "text-red-500",
              },
              {
                label: "Organizer Refunds",
                value: data?.revenue.organizer_refunds ?? 0,
                color: "text-orange-500",
              },
              {
                label: "Commission Refunds",
                value: data?.revenue.commission_refunds ?? 0,
                color: "text-amber-500",
              },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <div className={`text-lg font-bold ${b.color}`}>
                  {formatCurrency(b.value, undefined, locale)}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {b.label}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
