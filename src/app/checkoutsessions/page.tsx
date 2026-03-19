"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionService } from "@/services/transactionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TooltipProvider,
  TooltipContent,
  Tooltip,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  Funnel as FunnelIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  Eye as EyeIcon,
  User as UserIcon,
  DotsThreeVertical as DotsThreeVerticalIcon,
  ArrowClockwiseIcon,
  CoinsIcon,
  InfoIcon,
  ArrowsLeftRight
} from "@phosphor-icons/react";
import { BanknoteArrowUp, CreditCard, Logs } from "lucide-react";
import { CaretUp, CaretDown, CaretUpDown } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import {
  Transaction,
  TransactionListResponse,
  TransactionStatus,
  TransactionType,
} from "@/types/transaction";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
// import { TransactionFilterSheet } from "./components/TransactionFilterSheet";
import { TransactionFilters, getDefaultFilters } from "@/types/transaction";

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 20;
  const SKELETON_ROWS = itemsPerPage;
  const statusFilter = searchParams.get("status") || "";
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [searchInput, setSearchInput] = React.useState("");
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [appliedFilters, setAppliedFilters] =
    React.useState<TransactionFilters>(getDefaultFilters());

  const debouncedSearch = useDebounce(searchInput, 500);

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
    if (appliedFilters.guest_user_id) count++;
    return count;
  }, [appliedFilters]);

  const sort =
    sorting.length > 0
      ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`
      : undefined;

  const { data: response, isLoading } = useQuery<TransactionListResponse>({
    queryKey: [
      "transactions",
      currentPage,
      itemsPerPage,
      statusFilter,
      appliedFilters.status,
      appliedFilters.event_id,
      appliedFilters.user_id,
      appliedFilters.guest_user_id,
      appliedFilters.start_date,
      appliedFilters.end_date,
      appliedFilters.payment_gateway,
      sort,
      debouncedSearch,
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
        guest_user_id: appliedFilters.guest_user_id,
        start_date: appliedFilters.start_date,
        end_date: appliedFilters.end_date,
        payment_gateway: appliedFilters.payment_gateway,
        sort,
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

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams],
  );

  // Table columns
  const columns: ColumnDef<Transaction>[] = React.useMemo(
    () => [
      {
        id: "date",
        header: t("transactions.table.date"),
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          const formattedDate = date.toISOString().split("T")[0];
          return <span>{formattedDate}</span>;
        },
        title: "Created At",
        enableSorting: true,
      },
      {
        id: "event",
        header: t("transactions.table.event"),
        accessorKey: "event.title",
        enableSorting: true,
      },
      {
        id: "user",
        header: t("transactions.table.user"),
        accessorKey: "user.name",
        enableSorting: true,
      },
      {
        id: "ticket_count",
        header: t("transactions.table.ticket"),
        accessorKey: "ticket_count",
        enableSorting: false,
      },
      {
        id: "amount",
        header: t("transactions.table.amount"),
        accessorKey: "amount",
        title: "Amount",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-2">
            {row.original.currency} {row.original.amount}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="text-yellow-800 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Total Amount: {row.original.amount}
                    <br />
                    Commission Rate: {row.original.commission_rate}%
                    <br />
                    Commission Amount: {row.original.commission_amount}
                    <br />
                    Organizer Share: {row.original.organizer_share}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        ),
      },
      {
        id: "gateway",
        accessorKey: "payment_gateway",
        header: t("transactions.table.gateway"),
        enableSorting: true,
        cell: ({ row }) => {
          const gateway = row.original.payment_gateway;

          const colors: Record<string, string> = {
            khalti: "bg-purple-100 text-purple-700",
            esewa: "bg-green-100 text-green-700",
            stripe: "bg-indigo-100 text-indigo-700",
          };

          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                colors[gateway?.toLowerCase()] || "bg-gray-100 text-gray-700"
              }`}
            >
              {t("transactions.gateway." + gateway)}
            </span>
          );
        },
      },
      {
        id: "status",
        header: t("transactions.table.status"),
        accessorKey: "status",
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status;

          const statusStyles: Record<string, string> = {
            completed: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            failed: "bg-red-100 text-red-700",
            refunded: "bg-gray-200 text-gray-700",
          };

          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
          const transaction = row.original;

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
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <DotsThreeVerticalIcon weight="duotone" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    router.push(
                      `/transactions/transactiondetail?id=${transaction.id}`,
                    );
                  }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                    <EyeIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {t(`users.viewDetails`)}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push(
                      `/transactions/paymentdetail?id=${transaction.id}`,
                    );
                  }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                    <CoinsIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {/* {t(`users.viewDetails`)} */}
                    View Payment
                  </div>
                </DropdownMenuItem>
                {/* <DropdownMenuItem
                onClick={() => {
                  router.push(`/users/userdetail?id=${user.id}`);
                }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                    <BanknoteArrowUp className="mr-2 h-4 w-4" />
                    Refund
                  </div>
                </DropdownMenuItem> */}
                {/* <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(user);
                  }}
                >
                  <ArrowClockwiseIcon className="mr-2 h-4 w-4" />
                  Retry
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
    data: response?.transactions || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleOpenLogs = () => {
    router.push(`/auditlogs`);
  };
  const handleOpenrefunds = () => {
    router.push(`/refunds`);
  };
  const handleOpenPayouts = () => {
    router.push(`/payouts`);
  };
  const handleOpenTransactions = () => {
    router.push(`/transactions`);
  };

  const totalItems = response?.pagination.total ?? 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = response?.pagination.has_next ?? currentPage < totalPages;

  return (
    <div className="min-h-screen p-8 space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="relative flex-1 w-md">
            <MagnifyingGlassIcon
              weight="duotone"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder={t("transactions.searchTransactions")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleOpenrefunds}
              className="gap-2 bg-background/80 backdrop-blur-sm"
            >
              <BanknoteArrowUp className="h-4 w-4" />
              {t("transactions.refund")}
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenLogs}
              className="gap-2 bg-background/80 backdrop-blur-sm"
            >
              <Logs className="h-4 w-4" />
              {t("transactions.auditLogs")}
            </Button>
            <Button
              onClick={handleOpenPayouts}
              variant="outline"
              className="gap-2 bg-background/80 backdrop-blur-sm"
            >
              <CreditCard className="h-4 w-4" />
              {t("transactions.payouts")}
            </Button>
            <Button
              onClick={handleOpenTransactions}
              variant="outline"
              className="gap-2 bg-background/80 backdrop-blur-sm"
            >
              <ArrowsLeftRight className="h-4 w-4" />
              {t("sidebar.transactions")}
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
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
                    <UserIcon className="w-8 h-8" />
                    {/* <span>{t("transactions.noTransactionsFound")}</span> */}
                    <span>No transactions found</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Rows */}
            {!isLoading &&
              table.getRowModel().rows.map((row, index) => (
                <TableRow key={row.id}>
                  {/* Serial number */}
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

      {/* Filter Sheet */}
      {/* <React.Suspense fallback={null}>
        <TransactionFilterSheet
          open={filterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          filters={appliedFilters}
          onApplyFilters={setAppliedFilters}
        />
      </React.Suspense> */}
    </div>
  );
}
