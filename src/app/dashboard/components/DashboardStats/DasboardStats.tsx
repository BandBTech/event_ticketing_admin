"use client";

import { useState } from "react";
import { ElementType } from "react";

// ── Sample Data from API ──────────────────────────────────────────────────────
const data = {
  events: {
    approved: 0,
    cancelled: 11,
    completed: 13,
    draft: 0,
    live: 0,
    on_sale: 3,
    pending: 6,
    total: 41,
    upcoming: 3,
  },
  organizers: { approved: 40, pending: 0, rejected: 11, total: 51 },
  payment_bills: {
    paid: 0,
    pending: 0,
    total: 0,
    total_due: 0,
    total_paid_out: 0,
  },
  revenue: {
    organizer_earnings: 71460,
    total_commission: 7940,
    total_revenue: 79400,
  },
  tickets: { active: 127, cancelled: 0, total_sold: 53, used: 0 },
  transactions: { completed: 16, failed: 0, pending: 0, total: 16 },
  upcoming_events_list: [
    {
      id: "7daa69c1",
      title: "Music Festival - New Year 2026 updated",
      category: "Music, Festival, Concert",
      start_date: "2026-02-28T03:15:00Z",
      status: "on_sale",
      is_featured: false,
      venue_name: "Chysal Ground2",
      organizer: "Yuli Frank",
      organizer_initials: "YF",
      organizer_color: "#f97316",
    },
    {
      id: "0794441f",
      title: "Cultural Event",
      category: "Cultural, Nepal, Tourism",
      start_date: "2026-02-28T04:45:00Z",
      status: "on_sale",
      is_featured: false,
      venue_name: "Basantapur Durbar Square",
      organizer: "Ram Shrestha",
      organizer_initials: "RS",
      organizer_color: "#8b5cf6",
    },
    {
      id: "2e0a2646",
      title: "TestUI Event",
      category: "Music, Cultural",
      start_date: "2027-01-15T07:20:00Z",
      status: "on_sale",
      is_featured: true,
      venue_name: "Royal Arena",
      organizer: "Test Organizer",
      organizer_initials: "TO",
      organizer_color: "#3b82f6",
    },
  ],
  users: { active: 127, inactive: 7, suspended: 0, total: 134 },
};

function fmtCurrency(n: number) {
  return "$" + n.toLocaleString("en-US");
}

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
function IconDashboard() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconOrganizers() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconEvents() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconTransactions() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}
function IconReports() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function IconTicket() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 000 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 000-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z" />
      <line x1="9" y1="9" x2="9" y2="15" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconUserGroup() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconEmptyCalendar() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#d1d5db"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

// ── Nav Item ──────────────────────────────────────────────────────────────────
function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      <span className={active ? "text-blue-500" : "text-gray-400"}>
        <Icon />
      </span>
      {label}
    </button>
  );
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
          <Icon />
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
export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  const navItems = [
    { label: "Dashboard", Icon: IconDashboard },
    { label: "Organizers", Icon: IconOrganizers },
    { label: "Events", Icon: IconEvents },
    { label: "Users", Icon: IconUsers },
    { label: "Transactions", Icon: IconTransactions },
    { label: "Reports", Icon: IconReports },
    { label: "Settings", Icon: IconSettings },
  ];

  const successfulEvents = data.events.completed + data.events.on_sale;

  return (
    <main className="flex-1 overflow-y-auto  space-y-5">
      {/* ── Top 3 KPI Cards (matches screenshot exactly) ── */}
      <div className="grid grid-cols-3 gap-5">
        <TopStatCard
          icon={IconTicket}
          value={successfulEvents}
          label="Successful Events"
          iconBg="bg-green-50"
          iconColor="text-green-500"
        />
        <TopStatCard
          icon={IconClock}
          value={data.events.pending}
          label="Pending Approval"
          iconBg="bg-yellow-50"
          iconColor="text-yellow-500"
        />
        <TopStatCard
          icon={IconUserGroup}
          value={data.organizers.total}
          label="Organizers"
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: data.users.total,
            sub: `${data.users.active} active`,
            color: "text-blue-600",
            border: "border-blue-100",
          },
          {
            label: "Tickets Sold",
            value: data.tickets.total_sold,
            sub: `${data.tickets.active} active`,
            color: "text-violet-600",
            border: "border-violet-100",
          },
          {
            label: "Transactions",
            value: data.transactions.total,
            sub: `${data.transactions.completed} completed`,
            color: "text-emerald-600",
            border: "border-emerald-100",
          },
          {
            label: "Total Revenue",
            value: `$${(data.revenue.total_revenue / 1000).toFixed(1)}K`,
            sub: `$${(data.revenue.total_commission / 1000).toFixed(1)}K commission`,
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

      {/* ── Two column: Organizers awaiting + Revenue ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Revenue Overview */}
        <SectionCard title="Revenue Overview">
          <div className="px-6 pt-2 pb-4 divide-y divide-gray-50">
            <RevenueRow
              label="Total Revenue"
              value={data.revenue.total_revenue}
              pct={100}
              color="#3b82f6"
            />
            <RevenueRow
              label="Organizer Earnings"
              value={data.revenue.organizer_earnings}
              pct={Math.round(
                (data.revenue.organizer_earnings / data.revenue.total_revenue) *
                  100,
              )}
              color="#10b981"
            />
            <RevenueRow
              label="Platform Commission"
              value={data.revenue.total_commission}
              pct={Math.round(
                (data.revenue.total_commission / data.revenue.total_revenue) *
                  100,
              )}
              color="#f59e0b"
            />
          </div>

          <div className="mx-6 mb-4 grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4">
            {[
              {
                label: "Bills Paid",
                value: data.payment_bills.paid,
                color: "text-emerald-600",
              },
              {
                label: "Amount Due",
                value: data.payment_bills.total_due,
                color: "text-red-500",
              },
              {
                label: "Paid Out",
                value: data.payment_bills.total_paid_out,
                color: "text-blue-500",
              },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <div className={`text-lg font-bold ${b.color}`}>
                  ${b.value.toLocaleString()}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {b.label}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Event Status Grid ── */}
        <SectionCard title="Event Status Overview">
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Total",
                value: data.events.total,
                bg: "bg-gray-100",
                text: "text-gray-700",
              },
              {
                label: "Completed",
                value: data.events.completed,
                bg: "bg-green-50",
                text: "text-green-700",
              },
              {
                label: "On Sale",
                value: data.events.on_sale,
                bg: "bg-blue-50",
                text: "text-blue-700",
              },
              {
                label: "Upcoming",
                value: data.events.upcoming,
                bg: "bg-violet-50",
                text: "text-violet-700",
              },
              {
                label: "Pending",
                value: data.events.pending,
                bg: "bg-yellow-50",
                text: "text-yellow-700",
              },
              {
                label: "Cancelled",
                value: data.events.cancelled,
                bg: "bg-red-50",
                text: "text-red-600",
              },
              {
                label: "Draft",
                value: data.events.draft,
                bg: "bg-slate-50",
                text: "text-slate-500",
              },
              {
                label: "Live",
                value: data.events.live,
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

      {/* ── User Status Bar ── */}
      {/* <SectionCard title="User Status">
            <div className="px-6 py-5 flex items-center gap-6">
              <div className="flex items-center gap-6">
                {[
                  {
                    label: "Active",
                    value: data.users.active,
                    dot: "bg-green-400",
                  },
                  {
                    label: "Inactive",
                    value: data.users.inactive,
                    dot: "bg-gray-300",
                  },
                  {
                    label: "Suspended",
                    value: data.users.suspended,
                    dot: "bg-red-400",
                  },
                ].map((u) => (
                  <div key={u.label} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${u.dot}`} />
                    <span className="text-sm text-gray-500">{u.label}</span>
                    <span className="text-sm font-bold text-gray-800">
                      {u.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex-1 h-2.5 rounded-full overflow-hidden flex bg-gray-100">
                <div
                  className="h-full bg-green-400"
                  style={{
                    width: `${(data.users.active / data.users.total) * 100}%`,
                  }}
                />
                <div
                  className="h-full bg-gray-300"
                  style={{
                    width: `${(data.users.inactive / data.users.total) * 100}%`,
                  }}
                />
                <div
                  className="h-full bg-red-400"
                  style={{
                    width: `${(data.users.suspended / data.users.total) * 100}%`,
                  }}
                />
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-gray-800">
                  {data.users.total}
                </div>
                <div className="text-xs text-gray-400">Total Users</div>
              </div>
            </div>
          </SectionCard> */}

      {/* Footer */}
      {/* <p className="text-center text-xs text-gray-300 pb-2">
        Last updated: Feb 12, 2026 · 08:09 UTC
      </p> */}
    </main>
  );
}
