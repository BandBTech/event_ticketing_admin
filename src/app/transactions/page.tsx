"use client";

import { useState } from "react";

type TransactionStatus = "Completed" | "Pending" | "Failed" | "Refunded";
type TransactionType = "Credit" | "Debit" | "Transfer" | "Withdrawal";

interface Transaction {
  id: number;
  transactionId: string;
  name: string;
  email: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
}

const transactions: Transaction[] = [
  {
    id: 1,
    transactionId: "TXN-000182",
    name: "Alice Johnson",
    email: "alice.johnson@yopmail.com",
    amount: 1250.0,
    type: "Credit",
    status: "Completed",
    date: "Feb 12, 2026",
  },
  {
    id: 2,
    transactionId: "TXN-000181",
    name: "Robert Smith",
    email: "robert.smith@yopmail.com",
    amount: 340.5,
    type: "Debit",
    status: "Pending",
    date: "Feb 11, 2026",
  },
  {
    id: 3,
    transactionId: "TXN-000180",
    name: "Maria Garcia",
    email: "maria.garcia@yopmail.com",
    amount: 89.99,
    type: "Transfer",
    status: "Completed",
    date: "Feb 10, 2026",
  },
  {
    id: 4,
    transactionId: "TXN-000179",
    name: "James Wilson",
    email: "james.wilson@yopmail.com",
    amount: 5000.0,
    type: "Withdrawal",
    status: "Failed",
    date: "Feb 09, 2026",
  },
  {
    id: 5,
    transactionId: "TXN-000178",
    name: "Emily Davis",
    email: "emily.davis@yopmail.com",
    amount: 212.75,
    type: "Credit",
    status: "Refunded",
    date: "Feb 08, 2026",
  },
  {
    id: 6,
    transactionId: "TXN-000177",
    name: "Michael Brown",
    email: "michael.brown@yopmail.com",
    amount: 670.0,
    type: "Debit",
    status: "Completed",
    date: "Feb 07, 2026",
  },
];

const STATUS_STYLES: Record<TransactionStatus, { badge: string; dot: string }> = {
  Completed: {
    badge: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-500",
  },
  Pending: {
    badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    dot: "bg-yellow-500",
  },
  Failed: {
    badge: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  Refunded: {
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-400",
  },
};

const TYPE_STYLES: Record<TransactionType, string> = {
  Credit: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Debit: "bg-orange-50 text-orange-700 border border-orange-200",
  Transfer: "bg-purple-50 text-purple-700 border border-purple-200",
  Withdrawal: "bg-slate-100 text-slate-600 border border-slate-200",
};

const TYPE_ICONS: Record<TransactionType, string> = {
  Credit: "↓",
  Debit: "↑",
  Transfer: "⇄",
  Withdrawal: "⊖",
};

function SortIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline ml-1 text-gray-400"
    >
      <path d="M7 2L10 6H4L7 2Z" fill="currentColor" />
      <path d="M7 12L4 8H10L7 12Z" fill="currentColor" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 4h12M4 8h8M6 12h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ThreeDotsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="3" r="1.2" fill="currentColor" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="13" r="1.2" fill="currentColor" />
    </svg>
  );
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "">("");
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "">("");
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.transactionId.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType ? t.type === filterType : true;
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Content */}
      <div className="px-8 py-6">
        {/* Search + Filters */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M10 10l3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Filter By Type */}
            <div className="relative">
              <button
                onClick={() => {
                  setTypeDropdownOpen(!typeDropdownOpen);
                  setStatusDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FilterIcon />
                {filterType ? `Type: ${filterType}` : "Filter By Type"}
              </button>
              {typeDropdownOpen && (
                <div className="absolute right-0 top-11 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setFilterType("");
                      setTypeDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50"
                  >
                    All Types
                  </button>
                  {(["Credit", "Debit", "Transfer", "Withdrawal"] as TransactionType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setFilterType(t);
                        setTypeDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter By Status */}
            <div className="relative">
              <button
                onClick={() => {
                  setStatusDropdownOpen(!statusDropdownOpen);
                  setTypeDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FilterIcon />
                {filterStatus ? `Status: ${filterStatus}` : "Filter By Status"}
              </button>
              {statusDropdownOpen && (
                <div className="absolute right-0 top-11 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setFilterStatus("");
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50"
                  >
                    All Statuses
                  </button>
                  {(["Completed", "Pending", "Failed", "Refunded"] as TransactionStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setFilterStatus(s);
                        setStatusDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left font-semibold text-gray-700 w-14">
                  SN
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Transaction ID <SortIcon />
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Name / Email <SortIcon />
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Amount <SortIcon />
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">
                  Date <SortIcon />
                </th>
                <th className="px-4 py-4 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn, i) => (
                <tr
                  key={txn.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* SN */}
                  <td className="px-6 py-4 text-gray-500 font-medium">{txn.id}</td>

                  {/* Transaction ID */}
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                      {txn.transactionId}
                    </span>
                  </td>

                  {/* Name / Email */}
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">{txn.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{txn.email}</div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4">
                    <span
                      className={`font-semibold ${
                        txn.type === "Credit"
                          ? "text-emerald-600"
                          : txn.type === "Debit" || txn.type === "Withdrawal"
                          ? "text-red-500"
                          : "text-gray-700"
                      }`}
                    >
                      {txn.type === "Credit" ? "+" : txn.type === "Transfer" ? "" : "-"}$
                      {txn.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${TYPE_STYLES[txn.type]}`}
                    >
                      <span className="text-sm leading-none">{TYPE_ICONS[txn.type]}</span>
                      {txn.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[txn.status].badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[txn.status].dot}`}
                      />
                      {txn.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4 text-gray-600">{txn.date}</td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors">
                      <ThreeDotsIcon />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400 text-sm"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            ‹ Previous
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm">
            1
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}