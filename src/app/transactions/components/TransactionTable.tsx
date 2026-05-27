"use client";

import React from "react";
import {
  Eye as EyeIcon,
  DotsThreeVertical as DotsThreeVerticalIcon,
  InfoIcon,
  CoinsIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/transaction";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/ReusableTable";
import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { formatDateTimeLong } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PayoutTableProps {
  transactions: Transaction[];
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

export function TransactionTable({
  transactions,
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

  // Table columns
  const columns: ColumnDef<Transaction>[] = React.useMemo(
    () => [
      {
        id: "date",
        title: "Created At",
        meta: { sortKey: "created_at" },
        header: t("transactions.table.date"),
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
        id: "event",
        header: t("transactions.table.event"),
        meta: { sortKey: "event_title" },
        cell: ({ row }) => (
          <span className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original.event.title || "-"}
          </span>
        ),
      },
      {
        id: "user",
        header: t("transactions.table.user"),
        meta: { sortKey: "user_name" },
        cell: ({ row }) => {
          const user = row.original.user.name;
          const email = row.original.user.email;

          return (
            <div className="flex flex-col gap-0.5 py-1 max-w-[200px] truncate">
              <span className="text-sm font-medium text-gray-900 leading-tight">
                {user}
              </span>
              <span className="text-xs text-gray-400 leading-tight">
                {email}
              </span>
            </div>
          );
        },
      },
      {
        id: "ticket_count",
        header: t("transactions.table.ticket"),
        meta: { sortKey: "quantity" },
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-2">
            {row.original.quantity}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="text-yellow-800 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t("transactions.table.totalTickets")}: {row.original.quantity}
                    <br />
                    {t("transactions.table.refundedTickets")}: {row.original.refunded_count}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        ),
      },
      {
        id: "amount",
        header: t("transactions.table.amount"),
        title: "Amount",
        meta: { sortKey: "amount" },
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-2">
            {formatCurrency(row.original.amount, row.original.symbol)}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="text-yellow-800 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t("transactions.transactionDetails.totalAmount")}:{" "}
                    {formatCurrency(row.original.amount, row.original.symbol)}
                    <br />
                    {t("events.modals.commissionRate")}:{" "}
                    {row.original.commission_rate}%
                    <br />
                    {t("dashboard.modal.commissionAmount")}:{" "}
                    {formatCurrency(
                      row.original.commission_amount,
                      row.original.symbol,
                    )}
                    <br />
                    {t("transactions.table.organizer_share")}:{" "}
                    {formatCurrency(
                      row.original.organizer_share,
                      row.original.symbol,
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        ),
      },
      {
        id: "gateway",
        header: t("transactions.table.gateway"),
        meta: { sortKey: "payment_gateway" },
        cell: ({ row }) => {
          const gateway = row.original.payment_gateway;

          const colors: Record<string, string> = {
            khalti: "bg-purple-100 text-purple-700",
            konbini: "bg-blue-200/50 text-blue-800",
            esewa: "bg-green-100 text-green-700",
            stripe: "bg-indigo-100 text-indigo-700",
          };

          return (
            <div className="flex flex-col items-start gap-0.5">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  colors[gateway?.toLowerCase()] || "bg-gray-100 text-gray-700"
                }`}
              >
                {t("billings.method." + gateway)}
              </span>
              {row.original.gateway_fee > 0 && (
                <span className="text-[11px] font-medium text-red-600 pl-1">
                  −
                  {formatCurrency(
                    row.original.gateway_fee,
                    row.original.symbol,
                  )}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        header: t("transactions.table.status"),
        meta: { sortKey: "status" },
        cell: ({ row }) => {
          const status = row.original.status;

          const statusStyles: Record<string, string> = {
            completed: "bg-green-100 text-green-700",
            succeeded: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            failed: "bg-red-100 text-red-700",
            refunded: "bg-gray-200 text-gray-700",
          };

          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                statusStyles[status?.toLowerCase()] ||
                "bg-gray-100 text-gray-700"
              }`}
            >
              {t("transactions.transactionStatus." + status)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const transaction = row.original;

          // if (actionLoading === user.id) {
          //   return (
          //     <div className="h-8 w-8 flex items-center p-0">
          //       <Spinner className="w-4 h-4 text-amber-900 animate-spin" />
          //     </div>
          //   );
          // }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <DotsThreeVerticalIcon weight="duotone" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    router.push(
                      `/transactions/transactiondetail?id=${transaction.id}`,
                    );
                  }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                    <EyeIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {t(`users.viewDetails`)}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push(
                      `/transactions/paymentdetail?id=${transaction.id}`,
                    );
                  }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                    <CoinsIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {t("transactions.table.viewPayment")}
                  </div>
                </DropdownMenuItem>
                {/* <DropdownMenuItem
                  onClick={() => {
                    router.push(`/users/userdetail?id=${user.id}`);
                  }}
                  >
                    <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                      <BanknoteArrowUp className="mr-2 h-4 w-4" />
                      Refund
                    </div>
                  </DropdownMenuItem> */}
                {/* <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(user);
                    }}
                  >
                    <ArrowClockwiseIcon className="mr-2 h-4 w-4" />
                    Retry
                  </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [t],
  );

  return (
    <>
      <ReusableTable
        wrapperClassName={wrapperClassName}
        columns={columns}
        data={transactions}
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
              {t(
                "transactions.table.noTransactionData",
                "No transaction data found",
              )}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {t(
                "transactions.table.noTransactionDataSubtitle",
                "You haven't made any transactions yet.",
              )}
            </p>
          </div>
        }
      />
    </>
  );
}
