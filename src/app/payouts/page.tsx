"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { PayoutService } from "@/services/payoutService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  Funnel as FunnelIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  User as UserIcon,
  DotsThreeVertical as DotsThreeVerticalIcon,
  ArrowsLeftRight,
  PenIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { BanknoteArrowUp, Logs } from "lucide-react";
import { CaretUp, CaretDown, CaretUpDown } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { PayoutRequestsResponse, PayoutRequest } from "@/types/payout";
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
import { useDebounce } from "@/hooks/useDebounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import ApproveModal from "@/app/payouts/components/ApproveModal";
import RejectModal from "@/app/payouts/components/RejectModal";

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const currentPage = Number(searchParams.get("page")) || 1;
  const statusFilter = searchParams.get("status") || "";
  const itemsPerPage = 10;
  const SKELETON_ROWS = itemsPerPage;
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [searchInput, setSearchInput] = React.useState("");

  const debouncedSearch = useDebounce(searchInput, 500);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(
    null,
  );
  const [isApproveDialogOpen, setIsApproveDialogOpen] = React.useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const sort =
    sorting.length > 0
      ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`
      : undefined;

  const { data: response, isLoading } = useQuery<PayoutRequestsResponse>({
    queryKey: [
      "payouts",
      currentPage,
      itemsPerPage,
      statusFilter,
      sort,
      debouncedSearch,
    ],
    queryFn: () =>
      PayoutService.getPayouts({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        search: debouncedSearch,
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

      router.push(`/payouts?${params.toString()}`, { scroll: false });
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
  const columns: ColumnDef<PayoutRequest>[] = React.useMemo(
    () => [
      {
        id: "event_title",
        header: t("payouts.table.eventTitle"),
        accessorKey: "event.title",
        enableSorting: false,
      },
      {
        id: "amount",
        header: t("payouts.table.amount"),
        accessorKey: "amount",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full">
            USD {row.original.amount}
          </span>
        ),
      },
      {
        id: "event_status",
        header: t("payouts.table.eventStatus"),
        accessorKey: "event.status",
        enableSorting: false,
        cell: ({ row }) => {
          const eventStatus = row.original.event.status;

          const EventStatusStyles: Record<string, string> = {
            completed: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            failed: "bg-red-100 text-red-700",
            live: "bg-gray-200 text-gray-700",
          };

          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                EventStatusStyles[eventStatus?.toLowerCase()] ||
                "bg-gray-100 text-gray-700"
              }`}
            >
              {t("payouts.eventStatus." + eventStatus)}
            </span>
          );
        },
      },
      {
        id: "status",
        header: t("payouts.table.status"),
        accessorKey: "status",
        enableSorting: false,
        cell: ({ row }) => {
          const status = row.original.status;

          const statusStyles: Record<string, string> = {
            completed: "bg-green-100 text-green-700",
            approved: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            failed: "bg-red-100 text-red-700",
            refunded: "bg-gray-200 text-gray-700",
            rejected: "bg-red-100 text-red-700",
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
        id: "request_type",
        header: t("payouts.table.requestType"),
        accessorKey: "request_type",
        cell: ({ row }) => {
          const requestType = row.original.request_type;
          return <span>{t("payouts.requestType." + requestType)}</span>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "actions",
        // header: "Actions",
        cell: ({ row }) => {
          const payoutData = row.original;

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
                    setSelectedPayout(payoutData);
                    setIsApproveDialogOpen(true);
                  }}
                >
                  <CheckCircleIcon weight="duotone" className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPayout(payoutData);
                    setIsRejectDialogOpen(true);
                  }}
                  className="text-red-600"
                >
                  <XCircleIcon weight="duotone" className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
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
    data: response?.requests || [],
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
              placeholder={t("transactions.searchPayouts")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            {/* <Button
              onClick={handleOpenrefunds}
              variant="outline"
              className="gap-2 bg-background/80 backdrop-blur-sm"
            >
              <BanknoteArrowUp className="h-4 w-4" />
              {t("transactions.refund")}
            </Button> */}
            <Button
              onClick={handleOpenLogs}
              variant="outline"
              className="gap-2 bg-background/80 backdrop-blur-sm"
            >
              <Logs className="h-4 w-4" />
              {t("transactions.auditLogs")}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-background/80 backdrop-blur-sm"
              >
                <FunnelIcon weight="duotone" className="h-4 w-4" />
                {/* {t("transactions.filter")} */}
                Filter By Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className={
                  statusFilter === "approved" ? "bg-muted font-medium" : ""
                }
                onClick={() => updateParams({ status: "approved", page: "1" })}
              >
                Approved
              </DropdownMenuItem>
              <DropdownMenuItem
                className={
                  statusFilter === "pending" ? "bg-muted font-medium" : ""
                }
                onClick={() => updateParams({ status: "pending", page: "1" })}
              >
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                className={
                  statusFilter === "rejected" ? "bg-muted font-medium" : ""
                }
                onClick={() => updateParams({ status: "rejected", page: "1" })}
              >
                Rejected
              </DropdownMenuItem>
              <DropdownMenuItem
                className={
                  statusFilter === "paid" ? "bg-muted font-medium" : ""
                }
                onClick={() => updateParams({ status: "paid", page: "1" })}
              >
                Paid
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className={`text-red-600 font-medium ${!statusFilter ? "hidden" : ""}`}
                onClick={() => updateParams({ status: null, page: "1" })}
              >
                {t("users.clearFilters")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ApproveModal
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        payout={selectedPayout}
      />
      <RejectModal
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        payout={selectedPayout}
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
                    <UserIcon className="w-8 h-8" />
                    <span>No Payouts Found</span>
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
    </div>
  );
}
