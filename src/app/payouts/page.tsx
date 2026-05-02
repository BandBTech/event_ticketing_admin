"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Funnel as FunnelIcon } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { PayoutService } from "@/services/payoutService";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useDebounce } from "@/hooks/useDebounce";
import { TransactionScreenTabs } from "@/components/TransactionScreenTabs";
import { PayoutRequestsResponse, PayoutRequest } from "@/types/payout";
import { PayoutTable } from "./components/PayoutTable";
import ApproveModal from "@/app/payouts/components/ApproveModal";
import RejectModal from "@/app/payouts/components/RejectModal";
import { usePaginationSync } from "@/hooks/usePaginationSync";

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [searchInput, setSearchInput] = React.useState("");
  const [status, setStatus] = useState<string>("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [openApproveDialog, setOpenApproveDialog] = React.useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(
    null,
  );

  const { currentPage, limit, handlePageChange, handleLimitChange } =
    usePaginationSync();
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  useEffect(() => {
    document.title = `${t("webTitle.payouts")} | Timro-Ticket`;
  }, [locale]);

  const { data: response, isLoading } = useQuery<PayoutRequestsResponse>({
    queryKey: [
      "payouts",
      currentPage,
      limit,
      status,
      debouncedSearch,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      PayoutService.getPayouts({
        page: currentPage,
        limit: limit,
        search: debouncedSearch,
        status: status,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    placeholderData: (previousData) => previousData,
  });

  const handleStatusChange = useCallback(
    (value: string) => {
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
            {t("payouts.title", "Payout Management")}
          </h1>
          <p className="text-gray-500">
            {t("payouts.subtitle", "Manage your organization's payouts.")}
          </p>
        </div>
      </div> */}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t("payouts.searchPayout", "Search Payouts")}
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
              <SelectValue placeholder={t("common.filter", "Filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">
                {t("status.approved", "Approved")}
              </SelectItem>
              <SelectItem value="paid">
                {t("dashboard.dataDisplay.paid", "Paid")}
              </SelectItem>
              <SelectItem value="pending">
                {t("events.status.pending", "Pending")}
              </SelectItem>
              <SelectItem value="rejected">
                {t("events.status.rejected", "Rejected")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="glass-card-lowest rounded-2xl flex-1 min-h-0 flex flex-col">
        <TransactionScreenTabs />

        <PayoutTable
          payouts={response?.requests || []}
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
          setSelectedRefund={setSelectedPayout}
          onApproveDialogOpen={openApproveDialog}
          setOpenApproveDialog={setOpenApproveDialog}
        />

        <ApproveModal
          open={openApproveDialog}
          onOpenChange={setOpenApproveDialog}
          payout={selectedPayout}
        />
        <RejectModal
          open={isRejectDialogOpen}
          onOpenChange={setIsRejectDialogOpen}
          payout={selectedPayout}
        />
      </div>
    </div>
  );
}
