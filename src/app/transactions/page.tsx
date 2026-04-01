"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionService } from "@/services/transactionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  Funnel as FunnelIcon,
  ArrowsLeftRight,
  UserCircleDashedIcon,
} from "@phosphor-icons/react";
import { BanknoteArrowUp, CreditCard, Search, Logs } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { TransactionListResponse } from "@/types/transaction";
import { usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { PayoutFilterTabs } from "@/app/transactions/components/PayoutFilterTabs";
import { TransactionFilterSheet } from "./components/TransactionFilterSheet";
import { TransactionFilters, getDefaultFilters } from "@/types/transaction";
import { TransactionTable } from "./components/TransactionTable";

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const pathname = usePathname();
  const isTransactionsPage = pathname === "/transactions/";

  const itemsPerPage = 10;
  const statusFilter = searchParams.get("status") || "";
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [searchInput, setSearchInput] = React.useState("");
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [appliedFilters, setAppliedFilters] =
    React.useState<TransactionFilters>(getDefaultFilters());
  const [limit, setLimit] = useState(itemsPerPage);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [activeTab, setActiveTab] = useState("all");

  const debouncedSearch = useDebounce(searchInput, 500);

    // Sorting state
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
      undefined,
    );

    console.log("sort by", sortBy);
    console.log("sort order", sortOrder);
    

  const defaultFilters = getDefaultFilters();

  const isFilterApplied = React.useMemo(() => {
    return JSON.stringify(appliedFilters) !== JSON.stringify(defaultFilters);
  }, [appliedFilters]);

  const filterCount = React.useMemo(() => {
    let count = 0;
    if (appliedFilters.start_date) count++;
    if (appliedFilters.end_date) count++;
    if (appliedFilters.organizer_id) count++;
    if (appliedFilters.status !== "") count++;
    if (appliedFilters.payment_gateway !== "") count++;
    if (appliedFilters.event_id) count++;
    if (appliedFilters.user_id) count++;
    return count;
  }, [appliedFilters]);

  const { data: response, isLoading } = useQuery<TransactionListResponse>({
    queryKey: [
      "transactions",
      currentPage,
      itemsPerPage,
      statusFilter,
      appliedFilters.status,
      appliedFilters.event_id,
      appliedFilters.user_id,
      appliedFilters.start_date,
      appliedFilters.end_date,
      appliedFilters.payment_gateway,
      debouncedSearch,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      TransactionService.getTransactions({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        filter: statusFilter,
        status: appliedFilters.status,
        event_id: appliedFilters.event_id,
        user_id: appliedFilters.user_id,
        start_date: appliedFilters.start_date,
        end_date: appliedFilters.end_date,
        payment_gateway: appliedFilters.payment_gateway,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    placeholderData: (previousData) => previousData,
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

      router.push(`/transactions?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

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
            {t("", "Transaction Management")}
          </h1>
          <p className="text-gray-500">
            {t("", "Manage your organization's transactions.")}
          </p>
        </div>
      </div>

      <div className="glass-card-lowest rounded-2xl flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("", "Search Transactions")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 shadow-sm"
            />
          </div>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setFilterSheetOpen(true)}
              className={
                isFilterApplied
                  ? "gap-2 bg-primary/10 text-black hover:bg-primary/10"
                  : `gap-2 bg-background/80 backdrop-blur-sm`
              }
            >
              <FunnelIcon weight="duotone" className="h-4 w-4" />
              {t("billings.filters")}{" "}
              {isFilterApplied && (
                <span className="ml-1 text-xs font-medium text-primary">{`(${filterCount})`}</span>
              )}
            </Button>
          </div>
        </div>

        <PayoutFilterTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <TransactionTable
          billings={response?.transactions || []}
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
        />
      </div>

      {/* Filter Sheet */}
      <React.Suspense fallback={null}>
        <TransactionFilterSheet
          open={filterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          filters={appliedFilters}
          onApplyFilters={setAppliedFilters}
        />
      </React.Suspense>
    </div>
  );
}
