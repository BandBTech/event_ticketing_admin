"use client";

import React from "react";
import {
  Eye as EyeIcon,
  FilePlus as FilePlusIcon,
  DotsThreeVertical as DotsThreeVerticalIcon,
  InfoIcon,
  XCircleIcon,
  HardDrivesIcon,
} from "@phosphor-icons/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { BillingService } from "@/services/billingService";
import { Bill } from "@/types/billings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

interface BillingsTableProps {
  billings: Bill[];
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
  paymentBillData: Bill | null;
  onOpenCancelBill: boolean;
  setPaymentBillData: React.Dispatch<React.SetStateAction<Bill | null>>;
  setIsAddPaymentToBillDialogOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setIsCancelBillDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setHistorySheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function BillingTable({
  billings,
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
  onOpenCancelBill,
  setPaymentBillData,
  paymentBillData,
  setIsAddPaymentToBillDialogOpen,
  setIsCancelBillDialogOpen,
  setHistorySheetOpen,
}: BillingsTableProps) {
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
  const columns: ColumnDef<Bill>[] = React.useMemo(
    () => [
      {
        id: "date",
        header: t("transactions.table.date"),
        title: "Created Date",
        meta: { sortKey: "created_at" },
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          const formattedDate = date.toLocaleDateString("en-CA");
          return <span>{formattedDate}</span>;
        },
      },
      {
        id: "name",
        header: t("billings.table.eventTitle"),
        meta: { sortKey: "event_title" },
        cell: ({ row }) => (
          <span className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original.event.title || "-"}
          </span>
        ),
      },
      {
        id: "organizer_name",
        meta: { sortKey: "organizer_name" },
        header: t("billings.table.organizerName"),
        cell: ({ row }) => (
          <div className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original.organizer.name || "-"}
          </div>
        ),
      },
      {
        id: "billed_amount",
        meta: { sortKey: "billed_amount" },
        header: t("billings.table.billedAmount"),
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-2">
            {formatCurrency(row.original.billed_amount, undefined, locale)}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="text-yellow-800 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Total Amount:{" "}
                    {formatCurrency(
                      row.original.billed_amount,
                      undefined,
                      locale,
                    )}
                    <br />
                    Paid Amount:{" "}
                    {formatCurrency(
                      row.original.paid_amount,
                      undefined,
                      locale,
                    )}
                    <br />
                    Remaining Amount:{" "}
                    {formatCurrency(
                      row.original.remaining_amount,
                      undefined,
                      locale,
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        ),
      },
      {
        id: "status",
        cell: ({ row }) => {
          const status = row.original.status;
          const statusColors: Record<string, string> = {
            paid: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            cancelled: "bg-red-100 text-red-800",
            rejected: "bg-red-100 text-red-800",
            overdue: "bg-red-100 text-red-800",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
            >
              {t(`billings.status.${status}`) || status}
            </span>
          );
        },
        header: t("billings.table.status"),
        meta: { sortKey: "status" },
        title: "Payment Status",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const bills = row.original;

          //   if (actionLoading === bills.id) {
          //     return (
          //       <div className="h-8 w-8 flex items-center p-0">
          //         <Spinner className="w-4 h-4 text-amber-900 animate-spin" />
          //       </div>
          //     );
          //   }

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
                    localStorage.setItem("user_id", bills.id);
                    router.push(`/billings/billdetail?id=${bills.id}`);
                  }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                    <EyeIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {t(`billings.viewDetails`)}
                  </div>
                </DropdownMenuItem>
                {(bills.status === "pending" ||
                  bills.status === "partially_paid") && (
                  <DropdownMenuItem
                    onClick={() => {
                      setPaymentBillData(bills);
                      setIsAddPaymentToBillDialogOpen(true);
                    }}
                  >
                    <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                      <FilePlusIcon weight="duotone" className="mr-2 h-4 w-4" />
                      {t(`billings.addPayment`)}
                    </div>
                  </DropdownMenuItem>
                )}
                {(bills.status === "paid" ||
                  bills.status === "partially_paid") && (
                    <DropdownMenuItem
                      onClick={() => {
                        setPaymentBillData(bills);
                        setHistorySheetOpen(true);
                      }}
                    >
                      <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                        <HardDrivesIcon
                          weight="duotone"
                          className="mr-2 h-4 w-4"
                        />
                        {t("billings.table.viewPaymentHistory")}
                      </div>
                    </DropdownMenuItem>
                  )}
                {bills.status === "pending" && (
                  <DropdownMenuItem
                    onClick={() => {
                      setPaymentBillData(bills);
                      setIsCancelBillDialogOpen(true);
                    }}
                  >
                    <div className="flex justify-start items-center bg-gray-50 text-red-700">
                      <XCircleIcon weight="duotone" className="mr-2 h-4 w-4" />
                      {t("billings.table.cancelBill")}
                    </div>
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

      <AlertDialog
        open={onOpenCancelBill}
        onOpenChange={setIsCancelBillDialogOpen}
      >
        <AlertDialogContent className="rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              {t("billings.modals.confirmCancel", "Confirm Cancel Bill")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-base">
              {t(
                "billings.modals.cancelMessage",
                "Are you sure you want to cancel this bill? This action cannot be undone immediately."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel
              onClick={() => setIsCancelBillDialogOpen(false)}
              className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {t("common.cancelButton", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                createMutation.mutate({
                  bill_id: paymentBillData?.id || "",
                  status: "cancelled",
                })
              }
              className="h-11 px-8 active:scale-95 bg-destructive text-white hover:bg-destructive/90 focus:bg-destructive/90 transition-colors"
            >
              {t("common.confirm", "Confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
