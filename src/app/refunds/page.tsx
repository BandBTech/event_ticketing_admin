"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  Funnel as FunnelIcon,
  ArrowsLeftRight,
  UserCircleDashedIcon,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";

import { BanknoteArrowUp, CreditCard, Search, Logs } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { PayoutFilterTabs } from "@/app/transactions/components/PayoutFilterTabs";
import { TransactionFilters, getDefaultFilters } from "@/types/transaction";
import { RefundTable } from "./components/RefundTable";
import { PaginationState } from "@tanstack/react-table";
import RejectModal from "@/app/refunds/components/RejectModal";
import { PayoutRequestsResponse, PayoutRequest } from "@/types/payout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  rejectRefundSchema,
  RejectRefundFormValues,
  RejectRefundPayload,
} from "@/lib/validation";

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const pathname = usePathname();
  const isTransactionsPage = pathname === "/transactions/";

  const itemsPerPage = 10;
  const [searchInput, setSearchInput] = React.useState("");
  const [limit, setLimit] = useState(itemsPerPage);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );
  const [activeTab, setActiveTab] = useState("all");
  const [status, setStatus] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [openApproveDialog, setOpenApproveDialog] = React.useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);
  const queryClient = useQueryClient();

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const { data: response, isLoading } = useQuery<RefundResponse>({
    queryKey: [
      "refunds",
      currentPage,
      itemsPerPage,
      status,
      debouncedSearch,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      RefundService.getRefunds({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        status: status,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: (data: { refundId: string }) => RefundService.approveRefund(data),
    onSuccess: async () => {
      toast.success(t("", "Refund approved successfully"));
      // await queryClient.invalidateQueries({
      //   queryKey: queryKeys.organizers.list,
      // });
      setOpenApproveDialog(false);
    },
  });

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(window.location.search);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`/refunds?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams],
  );

  const handleSortChange = useCallback(
    (
      newSortBy: string | undefined,
      newSortOrder: "asc" | "desc" | undefined,
    ) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      setCurrentPage(1);
    },
    [],
  );

  const totalItems = response?.pagination.total ?? 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = response?.pagination.has_next ?? currentPage < totalPages;
  const hasPreviousPage = response?.pagination.has_prev ?? currentPage > 1;

  return (
    <div className="min-h-screen p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("", "Refund Management")}
          </h1>
          <p className="text-gray-500">
            {t("", "Manage your organization's refunds.")}
          </p>
        </div>
      </div>

      <div className="glass-card-lowest rounded-2xl flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("", "Search Refunds")}
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
                <SelectValue placeholder={t("", "Filter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="canceled">{t("", "Canceled")}</SelectItem>
                <SelectItem value="failed">{t("", "Failed")}</SelectItem>
                <SelectItem value="pending">{t("", "Pending")}</SelectItem>
                <SelectItem value="succeeded">{t("", "Succeeded")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <PayoutFilterTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <RefundTable
          refunds={response?.refunds || []}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          total={totalItems}
          limit={limit}
          onLimitChange={setLimit}
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
        />

        <RejectModal
          open={isRejectDialogOpen}
          onOpenChange={setIsRejectDialogOpen}
          refund={selectedRefund}
        />

        <AlertDialog
          open={openApproveDialog}
          onOpenChange={setOpenApproveDialog}
        >
          <AlertDialogContent className="rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                {t("", "Confirm Refund Approval")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 text-base">
                {t(
                  "",
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
                {t("common.cancel", "Cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  createMutation.mutate({
                    refundId: selectedRefund?.id || "",
                  });
                }}
                className="h-11 px-8 active:scale-95 bg-destructive text-white hover:bg-destructive/90 focus:bg-destructive/90 transition-colors"
              >
                {t("common.confirm", "Confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
