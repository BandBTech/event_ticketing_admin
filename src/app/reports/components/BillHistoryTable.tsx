"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/ReusableTable";
import { useLanguageStore } from "@/store/languageStore";
import { BillHistoryItem } from "@/types/reports";
import { formatCurrency } from "@/lib/utils";

interface BillHistoryTableProps {
  refunds: BillHistoryItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  total?: number;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (
    sortBy: string | undefined,
    sortOrder: "asc" | "desc" | undefined,
  ) => void;
}

export function BillHistoryTable({
  refunds,
  isLoading,
  currentPage,
  totalPages,
  total,
  limit,
  onLimitChange,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
}: BillHistoryTableProps) {
  const { t } = useTranslation();
  const { locale } = useLanguageStore();

  // Table columns
  const columns: ColumnDef<BillHistoryItem>[] = React.useMemo(
    () => [
      {
        id: "bill_number",
        header: t("reports.financial.billNumber", "Bill Number"),
        cell: ({ row }) => {
          const eventTitle = row.original.bill_number;
          return <div className="max-w-[200px] truncate">{eventTitle}</div>;
        },
      },
      {
        id: "date",
        header: t("reports.financial.date", "Date"),
        accessorKey: "created_at",
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          const formattedDate = date.toLocaleDateString("en-CA");
          return <span>{formattedDate}</span>;
        },
      },
      {
        id: "commission_amount",
        header: t("reports.financial.amount", "Amount"),
        accessorKey: "amount",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full">
            {formatCurrency(row.original.amount, row.original.event.symbol)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("reports.financial.status", "Status"),
        accessorKey: "status",
        cell: ({ row }) => {
          const status = row.original.status;

          const statusStyles: Record<string, string> = {
            paid: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            cancelled: "bg-red-100 text-red-700",
            partially_paid: "bg-gray-200 text-gray-700",
          };

          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                statusStyles[status?.toLowerCase()] ||
                "bg-gray-100 text-gray-700"
              }`}
            >
              {t("billings.status." + status)}
            </span>
          );
        },
      },
    ],
    [t],
  );

  return (
    <>
      <ReusableTable
        columns={columns}
        data={refunds}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onLimitChange={onLimitChange}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={onPageChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
        showSerialNumber={true}
        emptyState={
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {t("", "No bill history data found")}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {t("", "You haven't made any bills yet.")}
            </p>
          </div>
        }
      />
    </>
  );
}
