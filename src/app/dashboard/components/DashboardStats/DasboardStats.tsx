"use client";

import { useState } from "react";
import { ElementType } from "react";
import { AdminDashboardData, AdminDashboardResponse } from "@/types/dashboard";
import { ClockIcon, CalendarCheckIcon, UsersIcon } from "@phosphor-icons/react";

type DashboardPageProps = {
  data: AdminDashboardData;
};

function fmtCurrency(n: number) {
  return "$" + n.toLocaleString("en-US");
}

// ── Top Stat Card (matches screenshot style) ──────────────────────────────────
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
        {fmtCurrency(value)}
      </span>
      <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">
        {pct}%
      </span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage({ data }: DashboardPageProps) {
  const successfulEvents = data?.events?.completed ?? 0;

  return (
    <main className="flex-1 overflow-y-auto  space-y-5">
      <div className="grid grid-cols-3 gap-5">
        <TopStatCard
          icon={CalendarCheckIcon}
          value={successfulEvents}
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
      </div>

      <div className="grid grid-cols-4 gap-4">
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
            label: "Total Revenue",
            value: `$${(data?.revenue.total_revenue ?? 0 / 1000).toFixed(1)}`,
            sub: `$${(data?.revenue.total_commission ?? 0 / 1000).toFixed(1)} commission`,
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
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Revenue Overview */}
        <SectionCard title="Revenue Overview">
          <div className="px-6 pt-2 pb-4 divide-y divide-gray-50">
            <RevenueRow
              label="Total Revenue"
              value={data?.revenue.total_revenue ?? 0}
              pct={100}
              color="#3b82f6"
            />
            <RevenueRow
              label="Organizer Earnings"
              value={data?.revenue.organizer_earnings ?? 0}
              pct={Math.round(
                ((data?.revenue.organizer_earnings ?? 0) /
                  (data?.revenue.total_revenue ?? 0)) *
                  100,
              )}
              color="#10b981"
            />
            <RevenueRow
              label="Platform Commission"
              value={data?.revenue.total_commission ?? 0}
              pct={Math.round(
                ((data?.revenue.total_commission ?? 0) /
                  (data?.revenue.total_revenue ?? 0)) *
                  100,
              )}
              color="#f59e0b"
            />
          </div>

          <div className="mx-6 mb-4 grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4">
            {[
              {
                label: "Bills Paid",
                value: data?.payment_bills.paid,
                color: "text-emerald-600",
              },
              {
                label: "Amount Due",
                value: data?.payment_bills.total_due,
                color: "text-red-500",
              },
              {
                label: "Paid Out",
                value: data?.payment_bills.total_paid_out,
                color: "text-blue-500",
              },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <div className={`text-lg font-bold ${b.color}`}>
                  ${b?.value?.toLocaleString() ?? "N/A"}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {b.label}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Event Status Overview">
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
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
                label: "Draft",
                value: data?.events.draft,
                bg: "bg-slate-50",
                text: "text-slate-500",
              },
              {
                label: "Live",
                value: data?.events.live,
                bg: "bg-emerald-50",
                text: "text-emerald-700",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-xl px-2 py-3 text-center ${s.bg}`}
              >
                <div className={`text-2xl font-bold leading-none ${s.text}`}>
                  {s.value}
                </div>
                <div
                  className={`text-[11px] font-semibold mt-1.5 ${s.text} opacity-75`}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
