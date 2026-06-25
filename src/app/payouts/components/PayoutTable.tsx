"use client";

import React from "react";
import {
  DotsThreeVertical as DotsThreeVerticalIcon,
  XCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowsCounterClockwiseIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/ReusableTable";
import { useLanguageStore } from "@/store/languageStore";
import { PayoutRequestsResponse, PayoutRequest } from "@/types/payout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Refund } from "@/types/refunds";
import { formatCurrency } from "@/lib/utils";

interface PayoutTableProps {
  payouts: PayoutRequest[];
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
  setSelectedRefund?: (refund: PayoutRequest | null) => void;
  onApproveDialogOpen?: boolean;
  setOpenApproveDialog?: (open: boolean) => void;
  approveRefund?: (refundId: string) => void;
  wrapperClassName?: string;
}

export function PayoutTable({
  payouts,
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
  setSelectedRefund,
  setRejectModalOpen,
  setOpenApproveDialog,
  wrapperClassName,
}: PayoutTableProps) {
  const { t } = useTranslation();
  const { locale } = useLanguageStore();
  const router = useRouter();

  // Table columns
  const columns: ColumnDef<PayoutRequest>[] = React.useMemo(
    () => [
      {
        id: "request_number",
        header: t("payouts.table.requestNumber", "Request Number"),
        accessorKey: "request_number",
        meta: { sortKey: "request_number" },
      },
      {
        id: "date",
        header: t("transactions.table.date"),
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
            <div className="flex flex-col min-w-[80px]">
              <span>{formattedDate}</span>
              <span className="text-gray-500">at {formattedTime}</span>
            </div>
          );
        },
      },
      {
        id: "organizer_name",
        header: t("billings.table.organizerName"),
        meta: { sortKey: "organizer_name" },
        cell: ({ row }) => (
          <span className="max-w-[180px] grid grid-cols-1">
            <span
              title={row.original.organizer.name}
              className="font-medium max-w-[180px] truncate inline-block"
            >
              {row.original.organizer.name}
            </span>
            {row.original.organizer.email && (
              <span
                title={row.original.organizer.email}
                className="text-slate-600 max-w-[180px] truncate inline-block font-normal"
              >
                {row.original.organizer.email}
              </span>
            )}
          </span>
        ),
      },
      {
        id: "event_title",
        header: t("payouts.table.eventTitle"),
        meta: { sortKey: "event_title" },
        cell: ({ row }) => (
          <span
            title={row.original.event.title}
            className="font-medium max-w-[180px] truncate inline-block"
          >
            {row.original.event.title}
          </span>
        ),
      },
      {
        id: "amount",
        header: t("payouts.table.amount"),
        meta: { sortKey: "amount" },
        cell: ({ row }) => (
          <span className="px-1 py-1 font-medium rounded-full">
            {formatCurrency(row.original.amount, row.original.event.symbol)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("payouts.table.status"),
        meta: { sortKey: "status" },
        cell: ({ row }) => {
          const status = row.original.status;

          const statusStyles: Record<string, string> = {
            completed: "bg-green-100 text-green-700",
            approved: "bg-green-100 text-green-700",
            paid: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            failed: "bg-red-100 text-red-700",
            cancelled: "bg-red-100 text-red-700",
            refunded: "bg-gray-200 text-gray-700",
            rejected: "bg-red-100 text-red-700",
          };

          return (
            <span
              className={`px-2 py-1 font-semibold rounded-full ${
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
        // header: "Actions",
        cell: ({ row }) => {
          const payoutData = row.original;

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
                <Button
                  disabled={payoutData.status === "rejected"}
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Open menu</span>
                  <DotsThreeVerticalIcon weight="duotone" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {payoutData.status === "approved" && (
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(
                        `/billings/billdetail?id=${payoutData.bill_id}`,
                      );
                    }}
                  >
                    <FileTextIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {t(`payouts.table.viewBillDetail`)}
                  </DropdownMenuItem>
                )}

                {payoutData.status === "pending" && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedRefund && setSelectedRefund(payoutData);
                      setOpenApproveDialog && setOpenApproveDialog(true);
                    }}
                  >
                    <CheckCircleIcon
                      weight="duotone"
                      className="mr-2 h-4 w-4"
                    />
                    {t("events.actions.approve")}
                  </DropdownMenuItem>
                )}
                {payoutData.status === "pending" && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedRefund && setSelectedRefund(payoutData);
                      setRejectModalOpen && setRejectModalOpen(true);
                    }}
                    className="text-red-600"
                  >
                    <XCircleIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {t("events.actions.reject")}
                  </DropdownMenuItem>
                )}
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
        wrapperClassName={wrapperClassName}
        data={payouts}
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
              {t("payouts.noPayoutData", "No payout data found")}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {t(
                "payouts.noPayoutDataSubtitle",
                "You haven't made any payouts yet.",
              )}
            </p>
          </div>
        }
      />
    </>
  );
}
