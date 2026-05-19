"use client";

import React from "react";
import { format } from "date-fns";
import {formatDateTimeLong} from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
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
  const {locale} = useLanguageStore()
  const { t } = useTranslation(locale);

const formatAction = (log: Logs) => {
  const action = log.action.replace(/_/g, " ");
  const actor = log.actor?.name || "Unknown user";
  const event = log.event?.title;
  const createdDate = log.created_at;
  const date = formatDateTimeLong(createdDate, locale);

  return (
    <span className="capitalize text-black font-stretch-50%">
      <span className="font-semibold">{action}</span> by{" "}
      <span className="font-semibold">{actor}</span>
      {event && (
        <>
          {" "}for <span className="font-semibold">{event}</span>
        </>
      )}
      {" "}on <span className="font-semibold">{date}</span>
    </span>
  );
};

  const columns: ColumnDef<Logs>[] = React.useMemo(
    () => [
      {
        id: "sn",
        header: t("auditLogs.table.sn", "SN"),
        cell: ({ row }) => (
          <span className="text-gray-500">{row.index + 1 + (currentPage - 1) * (limit || 10)}</span>
        ),
        enableSorting: false,
        size: 60,
      },
      {
        id: "action",
        header: t("auditLogs.table.action"),
        cell: ({ row }) => (
          <span className="capitalize text-gray-700">
            {formatAction(row.original)}
          </span>
        ),
      }
    ],
    [t, currentPage, limit],
  );

  return (
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
      showSerialNumber={false}
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
  );
}