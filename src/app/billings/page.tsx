"use client";

import React, { useCallback } from "react";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  Funnel as FunnelIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  Eye as EyeIcon,
  FilePlus as FilePlusIcon,
  BookOpenTextIcon,
  DotsThreeVertical as DotsThreeVerticalIcon,
  Spinner,
  CaretUp,
  CaretDown,
  CaretUpDown,
  FileTextIcon,
  InfoIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TooltipProvider,
  TooltipContent,
  Tooltip,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { flexRender } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";
import { BillingService } from "@/services/billingService";
import { Bill, PaymentBillData } from "@/types/billings";
import AddBillPopupModal from "@/app/billings/components/AddBillPopupModal";
import AddPaymentToBillModal from "@/app/billings/components/AddPaymentToBillModal";
import {
  BillingFilters,
  getDefaultFilters,
  PaymentHistoryData,
} from "@/types/billings";
import UpdateBillModal from "./components/UpdateBillModal";
import { create } from "domain";

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

export default function BillingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const itemsPerPage = 10;
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState(searchQuery);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isAddPaymentToBillDialogOpen, setIsAddPaymentToBillDialogOpen] =
    React.useState(false);
  const [isUpdateBillDialogOpen, setIsUpdateBillDialogOpen] =
    React.useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [historySheetOpen, setHistorySheetOpen] = React.useState(false);
  const [appliedFilters, setAppliedFilters] =
    React.useState<BillingFilters>(getDefaultFilters());
  const [paymentBillData, setPaymentBillData] = React.useState<Bill | null>(
    null,
  );

  const defaultFilters = getDefaultFilters();

  const isFilterApplied = React.useMemo(() => {
    return JSON.stringify(appliedFilters) !== JSON.stringify(defaultFilters);
  }, [appliedFilters]);

  const filterCount = React.useMemo(() => {
    let count = 0;

    if (appliedFilters.organizer_id) count++;
    if (appliedFilters.status) count++;
    if (appliedFilters.start_date) count++;
    if (appliedFilters.end_date) count++;

    return count;
  }, [appliedFilters]);

  const debouncedSearch = useDebounce(searchInput, 500);
  const queryClient = useQueryClient();

  // Helper to update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`/billings?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const createMutation = useMutation({
    mutationFn: ({ bill_id, status }: { bill_id: string; status: string }) =>
      BillingService.cancelBill(bill_id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bills?.list ?? ["bills"],
      });
      toast.success(t("", "Bill cancelled successfully."));
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : t("", "Failed to update bill. Please try again."),
      );
    },
  });

  const { data: response, isLoading } = useQuery<PaymentBillData>({
    queryKey: [
      "bills",
      currentPage,
      itemsPerPage,
      appliedFilters.status,
      appliedFilters.organizer_id,
      appliedFilters.start_date,
      appliedFilters.end_date,
      debouncedSearch,
    ],
    queryFn: () =>
      BillingService.getAllBills({
        page: currentPage,
        limit: itemsPerPage,
        status: appliedFilters.status,
        organizer_id: appliedFilters.organizer_id,
        start_date: appliedFilters.start_date,
        end_date: appliedFilters.end_date,
        search: debouncedSearch,
      }),
  });

  const SKELETON_ROWS = itemsPerPage;

  const mockUserData = response?.bills || [];

  // Table columns
  const columns: ColumnDef<Bill>[] = React.useMemo(
    () => [
      {
        id: "date",
        header: "Date",
        title: "Created Date",
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          const formattedDate = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
          return <span>{formattedDate}</span>;
        },
        enableSorting: true,
      },
      {
        id: "name",
        header: t("billings.table.eventTitle"),
        accessorKey: "event.title",
        enableSorting: true,
      },
      {
        id: "organizer_name",
        accessorKey: "organizer.name",
        header: t("billings.table.organizerName"),
        enableSorting: true,
      },
      {
        id: "billed_amount",
        accessorKey: "billed_amount",
        header: t("billings.table.billedAmount"),
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-2">
            {row.original.billed_amount.toFixed(2)}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="text-yellow-800 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Total Amount: {row.original.billed_amount.toFixed(2)}
                    <br />
                    Paid Amount: {row.original.paid_amount.toFixed(2)}
                    <br />
                    Remaining Amount: {row.original.remaining_amount.toFixed(2)}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        ),
        enableSorting: false,
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
        title: "Payment Status",
        enableSorting: true,
      },
      {
        id: "actions",
        // header: "Actions",
        cell: ({ row }) => {
          const bills = row.original;

          if (actionLoading === bills.id) {
            return (
              <div className="h-8 w-8 flex items-center p-0">
                <Spinner className="w-4 h-4 text-amber-900 animate-spin" />
              </div>
            );
          }

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
                <DropdownMenuItem
                  onClick={() => {
                    setPaymentBillData(bills);
                    setHistorySheetOpen(true);
                  }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                    <BookOpenTextIcon
                      weight="duotone"
                      className="mr-2 h-4 w-4"
                    />
                    View Payment History
                  </div>
                </DropdownMenuItem>
                {bills.status === "pending" && (
                  <DropdownMenuItem
                    onClick={() => {
                      setPaymentBillData(bills);
                      createMutation.mutate({
                        bill_id: bills.id,
                        status: "cancelled",
                      });
                    }}
                  >
                    <div className="flex justify-start items-center bg-gray-50 text-red-700">
                      <XCircleIcon weight="duotone" className="mr-2 h-4 w-4" />
                      Cancel Bill
                    </div>
                  </DropdownMenuItem>
                )}
                {/* <DropdownMenuItem
                  onClick={() => {
                    setPaymentBillData(bills);
                    setIsUpdateBillDialogOpen(true);
                  }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                    <BookOpenTextIcon
                      weight="duotone"
                      className="mr-2 h-4 w-4"
                    />
                    {t(`billings.updateBill`)}
                  </div>
                </DropdownMenuItem> */}
                {/* <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(user);
                  }}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [t],
  );

  const table = useReactTable({
    data: mockUserData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams],
  );

  const totalItems = response?.pagination?.total || mockUserData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage =
    response?.pagination?.has_next ?? currentPage < totalPages;

  const startItem =
    mockUserData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = (currentPage - 1) * itemsPerPage + mockUserData.length;

  return (
    <div className="min-h-screen p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon
            weight="duotone"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder={t("billings.searchBillings")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-6">
          {/* Filter Button */}
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
          {/* <Button
            onClick={() => {
              setPaymentBillData(null);
              setIsAddDialogOpen(true);
            }}
            className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm transition-all ease-out duration-300 active:scale-95"
          >
            <FilePlusIcon weight="bold" className="h-5 w-5" />
            {t("billings.addBill", "Add Bills")}
          </Button> */}
        </div>
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
      <UpdateBillModal
        open={isUpdateBillDialogOpen}
        onOpenChange={setIsUpdateBillDialogOpen}
        billData={paymentBillData}
      />

      <div className="rounded-lg border bg-background max-h-[60vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {/* Serial number header */}
                <TableHead className="w-16 text-center">SN</TableHead>

                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}

                      {header.column.getCanSort() && (
                        <>
                          {header.column.getIsSorted() === "asc" && (
                            <CaretUp weight="bold" className="w-3 h-3" />
                          )}

                          {header.column.getIsSorted() === "desc" && (
                            <CaretDown weight="bold" className="w-3 h-3" />
                          )}

                          {!header.column.getIsSorted() && (
                            <CaretUpDown className="w-3 h-3 text-muted-foreground" />
                          )}
                        </>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {/* Loading */}
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {/* SN skeleton */}
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-6 mx-auto" />
                  </TableCell>

                  {/* Column skeletons */}
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full max-w-[220px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty */}
            {!isLoading && table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center py-10 h-[50vh]"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileTextIcon className="w-8 h-8" />
                    <span>{t("", "No Bills Found")}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              table.getRowModel().rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  {/* Main row */}
                  <TableRow>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="max-w-[10vw] overflow-hidden"
                      >
                        <div
                          className="truncate"
                          title={String(cell.getValue() ?? "")}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && !isLoading && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="gap-2 bg-gray-50"
          >
            <CaretLeftIcon weight="bold" className="w-4 h-4" />
            {t("pagination.previous")}
          </Button>

          <div className="flex gap-2 bg-gray-50">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNumber: number;

              // Show pages around current page
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(pageNumber)}
                  className="w-10 h-10"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || currentPage >= totalPages}
            className="gap-2"
          >
            {t("pagination.next")}
            <CaretRightIcon weight="bold" className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Results count */}
      {mockUserData.length > 0 && !isLoading && (
        <div className="text-center text-sm text-muted-foreground">
          {t("pagination.showing")} {startItem}-{endItem} {t("pagination.of")}{" "}
          {totalItems} {t("sidebar.users")}
        </div>
      )}

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
