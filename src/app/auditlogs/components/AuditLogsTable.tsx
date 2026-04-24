"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/ReusableTable";
import { Logs } from "@/types/auditlogs";

interface RefundTableProps {
  auditlogs: Logs[];
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

export function AuditLogsTable({
  auditlogs,
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
}: RefundTableProps) {
  const { t } = useTranslation();

  // Table columns
  const columns: ColumnDef<Logs>[] = React.useMemo(
    () => [
      {
        id: "action",
        header: t("auditLogs.table.action"),
        cell: ({ row }) => {
          const action = row.original.action;
          return (
            <span className="capitalize">{action.replace(/_/g, " ")}</span>
          );
        },
      },
      {
        id: "initiator",
        header: t("auditLogs.table.initiator"),
        cell: ({ row }) => (
          <div className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original.actor?.name || "-"}
          </div>
        ),
      },
      {
        id: "entity",
        header: t("auditLogs.table.entity"),
        cell: ({ row }) => {
          const entity = row.original.entity_type;
          return (
            <div className="max-w-[200px] text-gray-700 truncate inline-block">
              {entity.replace(/_/g, " ")}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "actor",
        header: t("auditLogs.table.event"),
        cell: ({ row }) => (
          <div className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original?.event?.title || "-"}
          </div>
        ),
      },
      {
        id: "date",
        header: t("auditLogs.table.created"),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {formatDistanceToNow(new Date(row.original.timestamp), {
              addSuffix: true,
            })}
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
        wrapperClassName={wrapperClassName}
        data={auditlogs}
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
              {t("auditLogs.noAuditlogsData", "No audit log data found")}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {t(
                "auditLogs.noAuditlogsDataSubtitle",
                "You haven't made any audit logs yet.",
              )}
            </p>
          </div>
        }
      />
    </>
  );
}
