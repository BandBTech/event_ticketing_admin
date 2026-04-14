"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Funnel as FunnelIcon } from "@phosphor-icons/react";
import { AuditlogService } from "@/services/auditlogService";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useDebounce } from "@/hooks/useDebounce";
import { TransactionScreenTabs } from "@/components/TransactionScreenTabs";
import { AuditLogsTable } from "./components/AuditLogsTable";
import {
  BillingFilters,
  getDefaultFilters,
  AuditLogsListResponse,
} from "@/types/auditlogs";
import { usePaginationSync } from "@/hooks/usePaginationSync";

// Lazy load heavy sub-components to reduce initial bundle size
const AuditLogsFilterSheet = React.lazy(() =>
  import("./components/AuditLogsFilterSheet").then((module) => ({
    default: module.AuditLogsFilterSheet,
  })),
);

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [searchInput, setSearchInput] = React.useState("");
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [appliedFilters, setAppliedFilters] =
    React.useState<BillingFilters>(getDefaultFilters());

  const { currentPage, limit, handlePageChange, handleLimitChange } =
    usePaginationSync();

  const debouncedSearch = useDebounce(searchInput, 500);

  const defaultFilters = getDefaultFilters();

  const isFilterApplied = React.useMemo(() => {
    return JSON.stringify(appliedFilters) !== JSON.stringify(defaultFilters);
  }, [appliedFilters]);

  const filterCount = React.useMemo(() => {
    let count = 0;
    if (appliedFilters.start_date) count++;
    if (appliedFilters.end_date) count++;
    if (appliedFilters.user_id) count++;
    if (appliedFilters.event_id) count++;
    return count;
  }, [appliedFilters]);

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const { data: response, isLoading } = useQuery<AuditLogsListResponse>({
    queryKey: [
      "auditlogs",
      currentPage,
      limit,
      debouncedSearch,
      appliedFilters.event_id,
      appliedFilters.user_id,
      appliedFilters.start_date,
      appliedFilters.end_date,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      AuditlogService.getAuditlogs({
        page: currentPage,
        limit: limit,
        search: debouncedSearch,
        event_id: appliedFilters.event_id,
        user_id: appliedFilters.user_id,
        start_date: appliedFilters.start_date,
        end_date: appliedFilters.end_date,
      }),
    placeholderData: (previousData) => previousData,
  });

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
    <div className="min-h-screen p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("auditLogs.title", "Audit Logs Management")}
          </h1>
          <p className="text-gray-500">
            {t("auditLogs.subtitle", "Manage your organization's audit log.")}
          </p>
        </div>
      </div>

      <div className="glass-card-lowest rounded-2xl flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("auditLogs.searchAuditLogs", "Search Audit Logs")}
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

        <TransactionScreenTabs />

        <AuditLogsTable
          auditlogs={response?.logs || []}
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
        />

        {/* Filter Sheet */}
        <React.Suspense fallback={null}>
          <AuditLogsFilterSheet
            open={filterSheetOpen}
            onOpenChange={setFilterSheetOpen}
            filters={appliedFilters}
            onApplyFilters={setAppliedFilters}
          />
        </React.Suspense>
      </div>
    </div>
  );
}
