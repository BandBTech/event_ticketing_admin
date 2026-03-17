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
} from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

// Lazy load heavy sub-components to reduce initial bundle size
const BillingFilterSheet = React.lazy(() =>
  import("./components/BillingFilterSheet").then((module) => ({
    default: module.BillingFilterSheet,
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
  const [appliedFilters, setAppliedFilters] =
    React.useState<BillingFilters>(getDefaultFilters());
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(
    new Set(),
  );
  const [expandLoading, setExpandLoading] = React.useState<Set<string>>(
    new Set(),
  );
  const [expandedData, setExpandedData] = React.useState<
    Record<string, PaymentHistoryData[]>
  >({});
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

  const toggleRow = async (id: string) => {
    const isOpen = expandedRows.has(id);

    // close if already open, otherwise close all and open new
    setExpandedRows(isOpen ? new Set() : new Set([id]));

    if (!isOpen && !expandedData[id]) {
      setExpandLoading((l) => new Set(l).add(id));
      try {
        const data: PaymentHistoryData[] =
          await BillingService.getBillHistory(id);
        setExpandedData((prev) => ({ ...prev, [id]: data }));
      } catch (err) {
        console.error("Failed to fetch bill history", err);
      } finally {
        setExpandLoading((l) => {
          const n = new Set(l);
          n.delete(id);
          return n;
        });
      }
    }
  };

  const debouncedSearch = useDebounce(searchInput, 500);

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
        enableSorting: false,
      },
      {
        id: "payment_method",
        title: "Payment Method",
        cell: ({ row }) => {
          const method = row.original.payment_method;
          return (
            <span className="text-sm text-foreground capitalize">
              {method ? method.replace(/_/g, " ") : "-"}
            </span>
          );
        },
        header: t("billings.table.paymentMethod"),
        enableSorting: true,
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
              {status ? status.replace(/_/g, " ") : "-"}
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
                <DropdownMenuItem
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
                </DropdownMenuItem>
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
            placeholder={t("billings.searchBills")}
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
            Filters{" "}
            {isFilterApplied && (
              <span className="ml-1 text-xs font-medium text-primary">{`(${filterCount})`}</span>
            )}
          </Button>
          <Button
            onClick={() => {
              setPaymentBillData(null);
              setIsAddDialogOpen(true);
            }}
            className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm transition-all ease-out duration-300 active:scale-95"
          >
            <FilePlusIcon weight="bold" className="h-5 w-5" />
            {t("", "Add Bills")}
          </Button>
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

      {/* Table Container */}
      {/* <DataTable
        table={table}
        columns={columns}
        loadingMessage={t("users.loadingUsers")}
        emptyIcon={<UserIcon className="w-8 h-8 text-gray-400" />}
        emptyMessage={t("users.noUsersFound")}
        showSerialNumber
        serialNumberStart={(currentPage - 1) * itemsPerPage + 1}
      /> */}

      <div className="rounded-lg border bg-background max-h-[60vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-10" />
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
                    <TableCell className="w-10 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        title="View Bill History"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(row.original.id);
                        }}
                      >
                        <CaretRightIcon
                          className={`h-3 w-3 transition-transform duration-200 ${
                            expandedRows.has(row.original.id) ? "rotate-90" : ""
                          }`}
                        />
                      </Button>
                    </TableCell>
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

                  {/* Expanded detail row — sibling, not child */}
                  {expandedRows.has(row.original.id) && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + 2}
                        className="py-3 px-14 bg-muted/20 border-b"
                      >
                        <div className="rounded-xl border border-border/60 overflow-hidden">
                          {expandLoading.has(row.original.id) ? (
                            // Skeleton
                            <div className="grid grid-cols-[28px_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-3 bg-background">
                              <Skeleton className="w-6 h-6 rounded-full" />
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="space-y-1.5">
                                  <Skeleton className="h-2.5 w-16" />
                                  <Skeleton className="h-4 w-24" />
                                </div>
                              ))}
                            </div>
                          ) : !expandedData[row.original.id]?.length ? (
                            // Empty
                            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 8v4m0 4h.01" />
                              </svg>
                              No payment history found
                            </div>
                          ) : (
                            // Data
                            expandedData[row.original.id].map((item, i) => (
                              <div
                                key={item.id}
                                className={`grid grid-cols-[28px_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-3 border-b last:border-0 ${
                                  i % 2 === 0 ? "bg-background" : "bg-muted/30"
                                }`}
                              >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                  {i + 1}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                                    Reference
                                  </p>
                                  <p className="text-sm text-foreground font-mono truncate">
                                    {item.payment_ref || "—"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                                    Amount
                                  </p>
                                  <p className="text-sm text-foreground font-semibold">
                                    NPR {item.amount.toLocaleString()}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                                    Method
                                  </p>
                                  <p className="text-sm text-foreground capitalize">
                                    {item.payment_method?.replace(/_/g, " ") ||
                                      "—"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                                    Date
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {new Date(
                                      item.payment_date,
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>

                                <div className="min-w-0">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                                    Processed By
                                  </p>
                                  <p className="text-sm text-foreground truncate">
                                    {item.processed_by || "—"}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
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
    </div>
  );
}
