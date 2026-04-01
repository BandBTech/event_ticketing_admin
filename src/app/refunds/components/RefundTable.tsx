"use client";

import React from "react";
import {
  Eye as EyeIcon,
  DotsThreeVertical as DotsThreeVerticalIcon,
  InfoIcon,
  CoinsIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/transaction";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/ReusableTable";
import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";

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
import { RefundResponse, Refund } from "@/types/refunds";
import { set } from "zod";

interface RefundTableProps {
  refunds: Refund[];
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
  onRejectModalOpen?: boolean;
  setRejectModalOpen?: (open: boolean) => void;
  selectedRefund?: Refund | null;
  setSelectedRefund?: (refund: Refund | null) => void;
  onApproveDialogOpen?: boolean;
  setOpenApproveDialog?: (open: boolean) => void;
  approveRefund?: (refundId: string) => void;
}

export function RefundTable({
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
  onRejectModalOpen,
  selectedRefund,
  setSelectedRefund,
  setRejectModalOpen,
  onApproveDialogOpen,
  setOpenApproveDialog,
  approveRefund,
}: RefundTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale } = useLanguageStore();

  // Table columns
  const columns: ColumnDef<Refund>[] = React.useMemo(
    () => [
      {
        id: "date",
        header: t("transactions.table.date"),
        accessorKey: "created_at",
        meta: { sortKey: "created_at" },
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          const formattedDate = date.toLocaleDateString("en-CA");
          return <span>{formattedDate}</span>;
        },
      },
      {
        id: "initiated_by",
        header: t("", "Initiated By"),
        accessorKey: "initiated_by.name",
        meta: { sortKey: "initiated_by" },
      },
      {
        id: "reason",
        header: t("", "Reason"),
        accessorKey: "reason",
        meta: { sortKey: "refund_reason" },
        cell: ({ row }) => (
          <span className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original.reason || "-"}
          </span>
        ),
      },
      {
        id: "amount",
        header: t("transactions.table.amount"),
        accessorKey: "amount",
        meta: { sortKey: "amount" },
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full">
            {row.original.currency} {row.original.amount}
          </span>
        ),
      },
      {
        id: "status",
        header: t("transactions.table.status"),
        accessorKey: "status",
        meta: { sortKey: "status" },
        cell: ({ row }) => {
          const status = row.original.status;

          const statusStyles: Record<string, string> = {
            completed: "bg-green-100 text-green-700",
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
                  setSelectedRefund && setSelectedRefund(transaction);
                  setOpenApproveDialog && setOpenApproveDialog(true);
                }}
                >
                  <CheckCircleIcon weight="duotone" className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setSelectedRefund && setSelectedRefund(transaction);
                    setRejectModalOpen && setRejectModalOpen(true);
                  }}
                  className="text-red-600"
                >
                  <XCircleIcon weight="duotone" className="mr-2 h-4 w-4" />
                  Reject
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
              {t("", "No refund data found")}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {t(
                "refunds.empty.description",
                "You haven't made any refunds yet.",
              )}
            </p>
          </div>
        }
      />


    </>
  );
}
