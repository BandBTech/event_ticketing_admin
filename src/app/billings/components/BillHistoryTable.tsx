"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { BillingService } from "@/services/billingService";
import { PaymentHistory } from "@/types/billings";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/ReusableTable";
import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";

interface PayoutTableProps {
  billHistory: PaymentHistory[];
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
  wrapperClassName?: string;
}

export function BillHistoryTable({
  billHistory,
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
  wrapperClassName,
}: PayoutTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale } = useLanguageStore();

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ bill_id, status }: { bill_id: string; status: string }) =>
      BillingService.cancelBill(bill_id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bills?.list ?? ["bills"],
      });
    },
  });

  // Table columns
  const columns: ColumnDef<PaymentHistory>[] = React.useMemo(
    () => [
      {
        id: "date",
        header: "Date",
        title: "Created Date",
        meta: { sortKey: "created_at" },
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          const formattedDate = date.toLocaleDateString("en-CA");
          const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          return (
            <div className="flex flex-col">
              <span>{formattedDate}</span>
              <span className="text-xs text-gray-500">at {formattedTime}</span>
            </div>
          );
        },
      },
      {
        id: "processed_by",
        header: t("Processed By"),
        meta: { sortKey: "processed_by" },
        cell: ({ row }) => (
          <span className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original.processed_by || "-"}
          </span>
        ),
      },
      {
        id: "amount",
        header: t("Amount"),
        meta: { sortKey: "amount" },
        cell: ({ row }) => {
          const amount = row.original.amount;
          return (
            <span className="max-w-[200px] text-gray-700 truncate inline-block">
              {formatCurrency(row.original.amount, row.original.event.symbol)}
            </span>
          );
        },
      },
      {
        id: "method",
        header: t("Method"),
        meta: { sortKey: "payment_method" },
        cell: ({ row }) => {
          const gateway = row.original.method || "";
          return (
            <span className="max-w-[200px] text-gray-700 truncate inline-block">
              {gateway ? t(`billings.method.${gateway}`) : "—"}
            </span>
          );
        },
      },
      {
        id: "screenshot",
        header: t("Screenshot"),
        cell: ({ row }) => (
          <span className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original.screenshot_url ? (
              <a
                href={row.original.screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {t("billings.billHistory.viewScreenshot", "View Screenshot")}
              </a>
            ) : (
              "—"
            )}
          </span>
        ),
      },
    ],
    [t],
  );
  return (
    <>
      <ReusableTable
       wrapperClassName={wrapperClassName}
        columns={columns}
        data={billHistory}
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
              {t("", "No billing data found")}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {t(
                "payouts.empty.description",
                "You haven't made any billings yet.",
              )}
            </p>
          </div>
        }
      />
    </>
  );
}
