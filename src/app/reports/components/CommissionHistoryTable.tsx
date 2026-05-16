"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/ReusableTable";
import { useLanguageStore } from "@/store/languageStore";
import { CommissionHistoryItem } from "@/types/reports";
import { formatCurrency } from "@/lib/utils";

interface CommissionHistoryTableProps {
  refunds: CommissionHistoryItem[];
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

export function CommissionHistoryTable({
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
}: CommissionHistoryTableProps) {
  const { t } = useTranslation();
  const { locale } = useLanguageStore();

  // Table columns
  const columns: ColumnDef<CommissionHistoryItem>[] = React.useMemo(
    () => [
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
        id: "event_title",
        header: t("reports.financial.event", "Event"),
        cell: ({ row }) => {
          const eventTitle = row.original.event_title;
          return <div className="max-w-[200px] truncate">{eventTitle}</div>;
        },
      },
      {
        id: "revenue",
        header: t("reports.financial.revenue", "Revenue"),
        accessorKey: "revenue",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full">
            {formatCurrency(row.original.revenue, undefined)}
          </span>
        ),
      },
      {
        id: "commission_rate",
        header: t("reports.financial.rate", "Rate"),
        accessorKey: "commission_rate",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full">
            {row.original.commission_rate} %
          </span>
        ),
      },
      {
        id: "commission_amount",
        header: t("reports.financial.commission", "Commission"),
        accessorKey: "commission_amount",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full">
            {formatCurrency(row.original.commission_amount, undefined)}
          </span>
        ),
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
              {t("", "No commission history data found")}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {t("", "You haven't made any commissions yet.")}
            </p>
          </div>
        }
      />
    </>
  );
}
