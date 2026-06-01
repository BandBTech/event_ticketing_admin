"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Funnel as FunnelIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { SortingState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";
import { BillingService } from "@/services/billingService";
import { Bill, PaymentBillData } from "@/types/billings";
import AddBillPopupModal from "@/app/billings/components/AddBillPopupModal";
import AddPaymentToBillModal from "@/app/billings/components/AddPaymentToBillModal";
import { Plus, Search, Users } from "lucide-react";
import { BillingFilters, getDefaultFilters } from "@/types/billings";
import UpdateBillModal from "./components/UpdateBillModal";
import { BillingTable } from "@/app/billings/components/BillingsTable";

// Lazy load heavy sub-components to reduce initial bundle size
const BillingFilterSheet = React.lazy(() =>
  import("./components/BillingFilterSheet").then((module) => ({
    default: module.BillingFilterSheet,
  })),
);

// Lazy load heavy sub-components to reduce initial bundle size
const BillingHistorySheet = React.lazy(() =>
  import("./components/BillingHistorySheet").then((module) => ({
    default: module.BillingHistorySheet,
  })),
);

import { usePaginationSync } from "@/hooks/usePaginationSync";

export default function BillingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const searchQuery = searchParams.get("search") || "";
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddPaymentToBillDialogOpen, setIsAddPaymentToBillDialogOpen] =
    useState(false);
  const [isCancelBillDialogOpen, setIsCancelBillDialogOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<BillingFilters>(getDefaultFilters());
  const [paymentBillData, setPaymentBillData] = useState<Bill | null>(null);

  const { currentPage, limit, handlePageChange, handleLimitChange } =
    usePaginationSync();

  const defaultFilters = getDefaultFilters();

  const isFilterApplied = useMemo(() => {
    return JSON.stringify(appliedFilters) !== JSON.stringify(defaultFilters);
  }, [appliedFilters]);

  const filterCount = useMemo(() => {
    let count = 0;

   if (appliedFilters.organizer_ids && appliedFilters.organizer_ids.length > 0) count++;
    if (appliedFilters.status) count++;
    if (appliedFilters.start_date) count++;
    if (appliedFilters.end_date) count++;

    return count;
  }, [appliedFilters]);  

  const debouncedSearch = useDebounce(searchInput, 500);

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  useEffect(() => {
    document.title = `${t("webTitle.billings")} | Timro-Ticket`;
  }, [locale]);

  const { data: response, isLoading } = useQuery<PaymentBillData>({
    queryKey: [
      "bills",
      currentPage,
      limit,
      appliedFilters.status,
      appliedFilters.organizer_ids,
      appliedFilters.start_date,
      appliedFilters.end_date,
      debouncedSearch,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      BillingService.getAllBills({
        page: currentPage,
        limit: limit,
        status: appliedFilters.status,
        organizer_id: appliedFilters.organizer_ids,
        start_date: appliedFilters.start_date,
        end_date: appliedFilters.end_date,
        search: debouncedSearch,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const mockUserData = response?.bills || [];

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

  const totalItems = response?.pagination?.total || mockUserData.length;
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage =
    response?.pagination?.has_next ?? currentPage < totalPages;

  const startItem = mockUserData.length > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = (currentPage - 1) * limit + mockUserData.length;

  return (
    <div className="h-full px-8 flex flex-col overflow-hidden">
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("billings.title", "Billings Management")}
          </h1>
          <p className="text-gray-500">
            {t("billings.subtitle", "Manage your organization's billings.")}
          </p>
        </div>
      </div> */}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
        <div className="relative  w-full sm:w-auto flex-1 max-w-[50%]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t("billings.searchBillings", "Search By Event Title / Organizer Name / Business Name")}
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
      <div className="glass-card-lowest rounded-2xl flex-1 min-h-0 flex flex-col">
        <BillingTable
          wrapperClassName="flex-1 min-h-0 overflow-auto"
          billings={mockUserData}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          total={totalItems}
          limit={limit}
          onLimitChange={handleLimitChange}
          hasNextPage={hasNextPage}
          hasPreviousPage={currentPage > 1}
          onPageChange={handlePageChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onOpenCancelBill={isCancelBillDialogOpen}
          setPaymentBillData={setPaymentBillData}
          setIsAddPaymentToBillDialogOpen={setIsAddPaymentToBillDialogOpen}
          setIsCancelBillDialogOpen={setIsCancelBillDialogOpen}
          setHistorySheetOpen={setHistorySheetOpen}
          paymentBillData={paymentBillData}
        />
      </div>

      <AddBillPopupModal
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        billData={paymentBillData}
      />
      <AddPaymentToBillModal
        open={isAddPaymentToBillDialogOpen}
        onOpenChange={setIsAddPaymentToBillDialogOpen}
        billData={paymentBillData}
      />
      {/* <UpdateBillModal
        open={isUpdateBillDialogOpen}
        onOpenChange={setIsUpdateBillDialogOpen}
        billData={paymentBillData}
      /> */}

      {/* Filter Sheet */}
      <React.Suspense fallback={null}>
        <BillingFilterSheet
          open={filterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          filters={appliedFilters}
          onApplyFilters={setAppliedFilters}
        />
      </React.Suspense>

      {/* Filter Sheet */}
      <React.Suspense fallback={null}>
        <BillingHistorySheet
          open={historySheetOpen}
          onOpenChange={setHistorySheetOpen}
          billId={paymentBillData?.id || ""}
        />
      </React.Suspense>
    </div>
  );
}
