"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  DotsThreeVertical as DotsThreeVerticalIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import RejectModal from "@/app/transactions/components/RejectModal";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/ReusableTable";
import { formatCurrency } from "@/lib/utils";
import { Ticket } from "@/types/paymenttransactiondetail";

interface PayoutTableProps {
  wrapperClassName?: string;
  billings: Ticket[];
  symbol: string | undefined;
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
  setIsCancelBillDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenCancelBill: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  transactionId: string;
}

export function TicketTable({
  wrapperClassName,
  billings,
  symbol,
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
  transactionId,
}: PayoutTableProps) {
  const { t } = useTranslation();
  const [ticketData, setTicketData] = React.useState<Ticket | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);

  // Table columns
  const columns: ColumnDef<Ticket>[] = React.useMemo(
    () => [
      {
        id: "ticket_number",
        header: t("transactions.paymentDetails.ticketNumber", "Ticket Number"),
        cell: ({ row }) => (
          <span className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original.ticket_number || "-"}
          </span>
        ),
      },
      {
        id: "tier",
        header: t("transactions.paymentDetails.tier", "Tier"),
        accessorKey: "tier.tier_name",
      },
      // {
      //   id: "holder",
      //   header: t("transactions.paymentDetails.holder", "Holder"),
      //   accessorKey: "user.name",
      // },
      {
        id: "amount",
        header: t("transactions.table.amount", "Amount"),
        title: "Amount",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-2">
            {formatCurrency(row.original.total_amount, symbol)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("transactions.table.status", "Status"),
        cell: ({ row }) => {
          const status = row.original.status;

          const statusStyles: Record<string, string> = {
            active: "bg-blue-100 text-blue-700",
            checked_in: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            partially_refunded: "bg-yellow-100 text-yellow-700",
            expired: "bg-yellow-100 text-yellow-700",
            failed: "bg-red-100 text-red-700",
            canceled: "bg-red-100 text-red-700",
            refunded: "bg-gray-200 text-gray-700",
          };

          return (
            <span
              className={`px-2 py-1 font-semibold rounded-full ${
                statusStyles[status?.toLowerCase()] ||
                "bg-gray-100 text-gray-700"
              }`}
            >
              {t("status." + status)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const ticket = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={ticket.status.toLowerCase() !== "active"}
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Open menu</span>
                  <DotsThreeVerticalIcon weight="duotone" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    setTicketData(ticket);
                    setIsRejectDialogOpen(true);
                  }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-red-700">
                    <XCircleIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {t("transactions.table.cancelTicket")}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t],
  );

  return (
    <>
      <ReusableTable
        wrapperClassName={wrapperClassName}
        columns={columns}
        data={billings}
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
          <div className="flex flex-col items-center justify-center py-32 text-center">
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
                "transactions.paymentDetails.noTicketsFound",
                "No tickets match your search",
              )}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {t(
                "transactions.paymentDetails.tryDifferentTicket",
                "Try a different ticket number or clear your search.",
              )}
            </p>
          </div>
        }
      />

      <RejectModal
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        ticket={ticketData}
        transactionId={transactionId}
      />
    </>
  );
}
