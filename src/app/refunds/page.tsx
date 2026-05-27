"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { RefundService } from "@/services/refundService";
import { RefundResponse, Refund } from "@/types/refunds";
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
import { Funnel as FunnelIcon } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useDebounce } from "@/hooks/useDebounce";
import { TransactionScreenTabs } from "@/components/TransactionScreenTabs";
import { RefundTable } from "./components/RefundTable";
import RejectModal from "@/app/refunds/components/RejectModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { usePaginationSync } from "@/hooks/usePaginationSync";

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { currentPage, limit, handlePageChange, handleLimitChange } =
    usePaginationSync();

  const [searchInput, setSearchInput] = React.useState("");
  const [status, setStatus] = useState<string>("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [openApproveDialog, setOpenApproveDialog] = React.useState(false);
  const [openRetryDialog, setOpenRetryDialog] = React.useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);
  const queryClient = useQueryClient();

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  useEffect(() => {
    document.title = `${t("webTitle.refunds")} | Timro-Ticket`;
  }, [locale]);

  const { data: response, isLoading } = useQuery<RefundResponse>({
    queryKey: [
      "refunds",
      currentPage,
      limit,
      status,
      debouncedSearch,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      RefundService.getRefunds({
        page: currentPage,
        limit: limit,
        search: debouncedSearch,
        status: status,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: (data: { refundId: string }) =>
      RefundService.approveRefund(data),
    onSuccess: async () => {
      toast.success(t("", "Refund approved successfully"));
      await queryClient.invalidateQueries({
        queryKey: queryKeys.refunds.list,
      });
      setOpenApproveDialog(false);
    },
  });

  const retryMutation = useMutation({
    mutationFn: (data: { refundId: string }) => RefundService.retryRefund(data),
    onSuccess: async () => {
      // toast.success(t("", "Refund retried successfully"));
      await queryClient.invalidateQueries({
        queryKey: queryKeys.refunds.list,
      });
      setOpenApproveDialog(false);
    },
  });

  const handleStatusChange = useCallback(
    (value: string) => {
      if (value === "all") {
        value = "";
      }
      setStatus(value);
      handlePageChange(1);
    },
    [handlePageChange],
  );

  const handleSortChange = useCallback(
    (
      newSortBy: string | undefined,
      newSortOrder: "asc" | "desc" | undefined,
    ) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      handlePageChange(1);
    },
    [handlePageChange],
  );

  const totalItems = response?.pagination.total ?? 0;
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = response?.pagination.has_next ?? currentPage < totalPages;
  const hasPreviousPage = response?.pagination.has_prev ?? currentPage > 1;

  return (
    <div className="h-full px-8 flex flex-col overflow-hidden">
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("refunds.title", "Refund Management")}
          </h1>
          <p className="text-gray-500">
            {t("refunds.subtitle", "Manage your organization's refunds.")}
          </p>
        </div>
      </div> */}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t("refunds.searchRefunds", "Search Refunds")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 shadow-sm"
          />
        </div>

        <div className="relative">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40 pl-9">
              <FunnelIcon
                weight="duotone"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
              />
              <SelectValue placeholder={t("transactions.filter", "Filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                {t("transactions.transactionStatus.pending", "Pending")}
              </SelectItem>
              <SelectItem value="processing">
                {t("transactions.transactionStatus.processing", "Processing")}
              </SelectItem>
              <SelectItem value="rejected">
                {t("transactions.transactionStatus.rejected", "Rejected")}
              </SelectItem>
              <SelectItem value="succeeded">
                {t("transactions.transactionStatus.succeeded", "Succeeded")}
              </SelectItem>
              {status && (
                <SelectItem value="all">
                  <span className="text-red-500 font-semibold">
                    {t("users.clearFilters", "Clear Filters")}
                  </span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="glass-card-lowest rounded-2xl flex-1 min-h-0 flex flex-col">
        <TransactionScreenTabs />

        <RefundTable
          refunds={response?.refunds || []}
          wrapperClassName="flex-1 min-h-0 overflow-auto"
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          total={totalItems}
          limit={limit}
          onLimitChange={handleLimitChange}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={handlePageChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onRejectModalOpen={isRejectDialogOpen}
          setRejectModalOpen={setIsRejectDialogOpen}
          setSelectedRefund={setSelectedRefund}
          onApproveDialogOpen={openApproveDialog}
          setOpenApproveDialog={setOpenApproveDialog}
          onRetryDialogOpen={openRetryDialog}
          setOpenRetryDialog={setOpenRetryDialog}
        />

        <RejectModal
          open={isRejectDialogOpen}
          onOpenChange={setIsRejectDialogOpen}
          refund={selectedRefund}
        />
        {/* Approve Refund Confirmation Dialog */}
        <AlertDialog
          open={openApproveDialog}
          onOpenChange={setOpenApproveDialog}
        >
          <AlertDialogContent className="rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                {t("refunds.modal.confirmRefund", "Confirm Refund Approval")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 text-base">
                {t(
                  "refunds.modal.areYouSure",
                  "Are you sure you want to approve this refund? This action cannot be undone immediately.",
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-6">
              <AlertDialogCancel
                onClick={() =>
                  setOpenApproveDialog && setOpenApproveDialog(false)
                }
                className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancelButton", "Cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  createMutation.mutate({
                    refundId: selectedRefund?.id || "",
                  });
                }}
                className="h-11 px-8 active:scale-95 bg-primary text-white hover:bg-primary/90 focus:bg-primary/90 transition-colors"
              >
                {t("common.confirm", "Confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Retry Confirmation Dialog */}
        <AlertDialog open={openRetryDialog} onOpenChange={setOpenRetryDialog}>
          <AlertDialogContent className="rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                {t("refunds.modal.confirmRefundRetry", "Confirm Refund Retry")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 text-base">
                {t(
                  "refunds.modal.areYouSureYou",
                  "Are you sure you want to retry this refund? This action cannot be undone immediately.",
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-6">
              <AlertDialogCancel
                onClick={() => setOpenRetryDialog && setOpenRetryDialog(false)}
                className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancelButton", "Cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  retryMutation.mutate({
                    refundId: selectedRefund?.id || "",
                  });
                }}
                className="h-11 px-8 active:scale-95 bg-primary text-white hover:bg-primary/90 focus:bg-primary/90 transition-colors"
              >
                {t("refunds.modal.retry", "Retry")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
