"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarBlank,
  Users,
  Ticket,
  CurrencyDollar,
  Funnel,
  Eye,
  CaretDown,
  ArrowUpRight,
  ArrowDownRight,
  TrendUp,
  DownloadSimple,
  ArrowsClockwise,
  ChartBar as ChartBarIcon,
  Pulse,
} from "@phosphor-icons/react";

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  color: "green" | "blue" | "orange" | "purple";
}) {
  const colorClasses = {
    green: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      gradient: "from-emerald-500 to-teal-500",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      gradient: "from-blue-500 to-indigo-500",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      gradient: "from-orange-500 to-amber-500",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      gradient: "from-purple-500 to-pink-500",
    },
  };

  const classes = colorClasses[color];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${classes.bg} group-hover:scale-110 transition-transform`}>
          <Icon weight="duotone" className={`w-6 h-6 ${classes.icon}`} />
        </div>
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${trend === "up"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700"
            }`}
        >
          {trend === "up" ? (
            <ArrowUpRight weight="bold" className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight weight="bold" className="w-3.5 h-3.5" />
          )}
          {change}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}

// Chart Bar Component
function ChartBar({
  height,
  label,
  value,
  color,
}: {
  height: number;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center group">
      <div className="w-full relative h-48 flex items-end">
        <div
          className={`w-full ${color} rounded-t-lg transition-all duration-500 group-hover:opacity-80`}
          style={{ height: `${height}%` }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {value}
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-2 font-medium">{label}</span>
    </div>
  );
}

// Table Row Component for Events
function EventTableRow({
  event,
  index,
  onView,
}: {
  event: {
    id: number;
    name: string;
    organizer: string;
    ticketsSold: number;
    revenue: string;
    conversionRate: string;
    status: string;
  };
  index: number;
  onView: () => void;
}) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{event.name}</p>
            <p className="text-xs text-gray-500">{event.organizer}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Ticket weight="duotone" className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {event.ticketsSold.toLocaleString()}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-gray-900">
          {event.revenue}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: event.conversionRate }}
            />
          </div>
          <span className="text-sm text-gray-600">{event.conversionRate}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${event.status === "Live"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-700"
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${event.status === "Live" ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
              }`}
          />
          {event.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={onView}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <Eye weight="duotone" className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

// Transaction Row Component
function TransactionRow({
  transaction,
}: {
  transaction: {
    id: string;
    event: string;
    customer: string;
    amount: string;
    tickets: number;
    status: string;
    date: string;
    paymentMethod: string;
  };
}) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {transaction.id}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-900 truncate max-w-[200px]">
          {transaction.event}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-900">{transaction.customer}</p>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-gray-900">
          {transaction.amount}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">{transaction.tickets}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {transaction.paymentMethod}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${transaction.status === "Completed"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700"
            }`}
        >
          {transaction.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-500">{transaction.date}</span>
      </td>
    </tr>
  );
}

export default function ReportsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("last-30-days");
  const [reportType, setReportType] = useState("overview");

  // Sample data
  const overviewStats = [
    {
      title: "Total Revenue",
      value: "NPR 2,45,680",
      change: "+12.5%",
      trend: "up" as const,
      icon: CurrencyDollar,
      color: "green" as const,
    },
    {
      title: "Tickets Sold",
      value: "3,247",
      change: "+8.2%",
      trend: "up" as const,
      icon: Ticket,
      color: "blue" as const,
    },
    {
      title: "Active Events",
      value: "42",
      change: "-2.3%",
      trend: "down" as const,
      icon: CalendarBlank,
      color: "orange" as const,
    },
    {
      title: "Total Users",
      value: "1,856",
      change: "+15.7%",
      trend: "up" as const,
      icon: Users,
      color: "purple" as const,
    },
  ];

  const topEvents = [
    {
      id: 1,
      name: "Kathmandu Music Festival 2025",
      organizer: "Event Masters Nepal",
      ticketsSold: 1250,
      revenue: "NPR 87,500",
      conversionRate: "78.5%",
      status: "Live",
    },
    {
      id: 2,
      name: "Tech Conference Nepal",
      organizer: "Tech Nepal Pvt. Ltd.",
      ticketsSold: 580,
      revenue: "NPR 34,800",
      conversionRate: "65.2%",
      status: "Live",
    },
    {
      id: 3,
      name: "Cultural Heritage Festival",
      organizer: "Heritage Events Co.",
      ticketsSold: 890,
      revenue: "NPR 53,400",
      conversionRate: "71.8%",
      status: "Completed",
    },
    {
      id: 4,
      name: "Himalayan Adventure Summit",
      organizer: "Himalayan Events",
      ticketsSold: 320,
      revenue: "NPR 28,800",
      conversionRate: "58.9%",
      status: "Live",
    },
  ];

  const recentTransactions = [
    {
      id: "TXN001",
      event: "Kathmandu Music Festival 2025",
      customer: "Rajesh Sharma",
      amount: "NPR 1,500",
      tickets: 2,
      status: "Completed",
      date: "2025-01-15 14:30",
      paymentMethod: "eSewa",
    },
    {
      id: "TXN002",
      event: "Tech Conference Nepal",
      customer: "Priya Maharjan",
      amount: "NPR 800",
      tickets: 1,
      status: "Completed",
      date: "2025-01-15 13:45",
      paymentMethod: "Khalti",
    },
    {
      id: "TXN003",
      event: "Cultural Heritage Festival",
      customer: "Amit Thapa",
      amount: "NPR 2,100",
      tickets: 3,
      status: "Pending",
      date: "2025-01-15 12:20",
      paymentMethod: "IME Pay",
    },
    {
      id: "TXN004",
      event: "Himalayan Adventure Summit",
      customer: "Sita Gurung",
      amount: "NPR 1,200",
      tickets: 1,
      status: "Completed",
      date: "2025-01-15 11:15",
      paymentMethod: "Bank Transfer",
    },
  ];

  const salesData = [
    { month: "Jan", revenue: 45000, tickets: 580 },
    { month: "Feb", revenue: 52000, tickets: 650 },
    { month: "Mar", revenue: 48000, tickets: 620 },
    { month: "Apr", revenue: 61000, tickets: 780 },
    { month: "May", revenue: 55000, tickets: 710 },
    { month: "Jun", revenue: 67000, tickets: 850 },
  ];

  const maxRevenue = Math.max(...salesData.map((d) => d.revenue));
  const maxTickets = Math.max(...salesData.map((d) => d.tickets));

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="px-6 py-6 space-y-6">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Date Range */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="last-3-months">Last 3 months</option>
                <option value="last-6-months">Last 6 months</option>
                <option value="last-year">Last year</option>
              </select>
              <CaretDown weight="bold" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Report Type */}
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                <option value="overview">Overview</option>
                <option value="sales">Sales Report</option>
                <option value="events">Event Performance</option>
                <option value="customers">Customer Analytics</option>
                <option value="financial">Financial Report</option>
              </select>
              <CaretDown weight="bold" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm text-gray-700">
              <Funnel weight="duotone" className="w-4 h-4" />
              Advanced Filters
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm text-gray-700">
              <ArrowsClockwise weight="duotone" className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
              <DownloadSimple weight="duotone" className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ChartBarIcon weight="duotone" className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Revenue Trend
                  </h3>
                  <p className="text-sm text-gray-500">Monthly revenue overview</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                View Details
              </button>
            </div>
            <div className="flex items-end gap-3 h-56">
              {salesData.map((data, index) => (
                <ChartBar
                  key={index}
                  height={(data.revenue / maxRevenue) * 100}
                  label={data.month}
                  value={`NPR ${(data.revenue / 1000).toFixed(0)}K`}
                  color="bg-linear-to-t from-blue-600 to-blue-400"
                />
              ))}
            </div>
          </div>

          {/* Ticket Sales Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Pulse weight="duotone" className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ticket Sales
                  </h3>
                  <p className="text-sm text-gray-500">Monthly tickets sold</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                View Details
              </button>
            </div>
            <div className="flex items-end gap-3 h-56">
              {salesData.map((data, index) => (
                <ChartBar
                  key={index}
                  height={(data.tickets / maxTickets) * 100}
                  label={data.month}
                  value={`${data.tickets} tickets`}
                  color="bg-linear-to-t from-emerald-600 to-emerald-400"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top Events Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendUp weight="duotone" className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Performing Events
                </h3>
                <p className="text-sm text-gray-500">Events with highest revenue</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/events")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View All Events
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topEvents.map((event, index) => (
                  <EventTableRow
                    key={event.id}
                    event={event}
                    index={index}
                    onView={() => router.push(`/events/eventdetails?id=${event.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <CurrencyDollar weight="duotone" className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h3>
                <p className="text-sm text-gray-500">Latest payment activities</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              View All Transactions
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
