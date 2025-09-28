"use client";

import React, { useState } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Ticket,
  DollarSign,
  BarChart3,
  PieChart,
  FileText,
  Filter,
  RefreshCw,
  Eye,
  Globe,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Navbar from "../components/Navbar/Navbar";

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [reportType, setReportType] = useState("overview");

  // Sample data for reports
  const overviewStats = [
    {
      title: "Total Revenue",
      value: "NPR 2,45,680",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Tickets Sold",
      value: "3,247",
      change: "+8.2%",
      trend: "up",
      icon: Ticket,
      color: "blue",
    },
    {
      title: "Active Events",
      value: "42",
      change: "-2.3%",
      trend: "down",
      icon: Calendar,
      color: "orange",
    },
    {
      title: "Total Users",
      value: "1,856",
      change: "+15.7%",
      trend: "up",
      icon: Users,
      color: "purple",
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
      organizer: "Tech Conference Nepal",
      ticketsSold: 580,
      revenue: "NPR 34,800",
      conversionRate: "65.2%",
      status: "Live",
    },
    {
      id: 3,
      name: "Cultural Heritage Festival",
      organizer: "Cultural Heritage Events",
      ticketsSold: 890,
      revenue: "NPR 53,400",
      conversionRate: "71.8%",
      status: "Completed",
    },
    {
      id: 4,
      name: "Himalayan Adventure Summit",
      organizer: "Himalayan Events Co.",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 ml-64">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>English</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none bg-white border text-gray-500 border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select date range"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last-7-days">Last 7 days</option>
                  <option value="last-30-days">Last 30 days</option>
                  <option value="last-3-months">Last 3 months</option>
                  <option value="last-6-months">Last 6 months</option>
                  <option value="last-year">Last year</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="appearance-none bg-white border text-gray-500 border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select report type"
                >
                  <option value="overview">Overview</option>
                  <option value="sales">Sales Report</option>
                  <option value="events">Event Performance</option>
                  <option value="customers">Customer Analytics</option>
                  <option value="financial">Financial Report</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button className="flex items-center px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </button>
          </div>
        </div>
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat, index) => {
            const Icon = stat.icon;
            const getIconBg = (color: string) => {
              switch (color) {
                case "green":
                  return "bg-green-50";
                case "blue":
                  return "bg-blue-50";
                case "orange":
                  return "bg-orange-50";
                case "purple":
                  return "bg-purple-50";
                default:
                  return "bg-gray-50";
              }
            };
            const getIconColor = (color: string) => {
              switch (color) {
                case "green":
                  return "text-green-600";
                case "blue":
                  return "text-blue-600";
                case "orange":
                  return "text-orange-600";
                case "purple":
                  return "text-purple-600";
                default:
                  return "text-gray-600";
              }
            };
            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${getIconBg(stat.color)}`}>
                    <Icon className={`w-6 h-6 ${getIconColor(stat.color)}`} />
                  </div>
                  <div
                    className={`flex items-center text-sm ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Trend
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Details
              </button>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {salesData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(data.revenue / 70000) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Sales Chart */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Ticket Sales
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Details
              </button>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {salesData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${(data.tickets / 1000) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Events Table */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Performing Events
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Events
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizer
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
              <tbody className="bg-white divide-y divide-gray-200">
                {topEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {event.organizer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.ticketsSold.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.revenue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event.conversionRate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          event.status === "Live"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        aria-label="View"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Transactions
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Transactions
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
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
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {transaction.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.event}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.customer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.tickets}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {transaction.date}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
