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
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Eye as EyeIcon,
  Shield as ShieldIcon,
  User as UserIcon,
  DotsThreeVertical as DotsThreeVerticalIcon,
} from "@phosphor-icons/react";
import { CaretUp, CaretDown, CaretUpDown } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import {
  Transaction,
  TransactionListResponse,
  TransactionStatus,
  TransactionType,
} from "@/types/transaction";
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
  getFilteredRowModel,
  ColumnDef,
  SortingState,
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

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 10;
  const SKELETON_ROWS = itemsPerPage;
  const [filterType, setFilterType] = useState<TransactionType | "">("");
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "">("");
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [searchInput, setSearchInput] = React.useState("");

  const filter =
    filterStatus || filterType
      ? `${filterType || ""},${filterStatus || ""}`
      : undefined;

  const sort =
    sorting.length > 0
      ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`
      : undefined;

  const { data: response, isLoading } = useQuery<TransactionListResponse>({
    queryKey: ["transactions", currentPage, itemsPerPage, filter, sort],
    queryFn: () =>
      TransactionService.getTransactions({
        page: currentPage,
        limit: itemsPerPage,
        filter,
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
        id: "event",
        header: "Event",
        accessorKey: "event_title",
        enableSorting: false,
      },
      {
        id: "user",
        header: "User",
        accessorKey: "user_name",
        enableSorting: false,
      },
      {
        id: "ticket_count",
        header: "Ticket",
        accessorKey: "ticket_count",
        enableSorting: false,
      },
      {
        id: "amount",
        header: "Amount",
        accessorKey: "amount",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full">
            {row.original.currency} {row.original.amount}
          </span>
        ),
      },
      {
        id: "commission",
        header: "Commission",
        accessorKey: "commission_amount",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full">
            {row.original.currency} {row.original.commission_amount}
          </span>
        ),
      },
      {
        id: "organizer_share",
        header: "Organizer Share",
        accessorKey: "organizer_share",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full">
            {row.original.currency} {row.original.organizer_share}
          </span>
        ),
      },
      {
        id: "gateway",
        accessorKey: "payment_gateway",
        header: "Gateway",
        enableSorting: false,
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
              🏦 {gateway}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        enableSorting: false,
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
              {status}
            </span>
          );
        },
      },
      {
        id: "date",
        header: "Date",
        accessorKey: "created_at",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {new Date(row.original.created_at).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
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

  const totalItems = response?.pagination.total ?? 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = response?.pagination.has_next ?? currentPage < totalPages;

  return (
   <div className="min-h-screen p-8 space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          {/* <MagnifyingGlassIcon
            weight="duotone"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder={t("users.searchUsers")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          /> */}
        </div>

        <div className="flex gap-6">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-background/80 backdrop-blur-sm"
              >
                <FunnelIcon weight="duotone" className="h-4 w-4" />
                {/* {t("users.filterByAccountStatus")} */}
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                // className={
                //   statusFilter === "active" ? "bg-muted font-medium" : ""
                // }
                onClick={() => updateParams({ status: "active", page: "1" })}
              >
                {/* {t("users.accountStatus.active")} */}
                Status
              </DropdownMenuItem>
              <DropdownMenuItem
                // className={
                //   statusFilter === "inactive" ? "bg-muted font-medium" : ""
                // }
                onClick={() => updateParams({ status: "inactive", page: "1" })}
              >
                {/* {t("users.accountStatus.inactive")} */}
                Payment Gateway
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                className={
                  statusFilter === "suspended" ? "bg-muted font-medium" : ""
                }
                onClick={() => updateParams({ status: "suspended", page: "1" })}
              >
                {t("users.accountStatus.suspended")}
              </DropdownMenuItem> */}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                // className={`text-red-600 font-medium ${!statusFilter ? "hidden" : ""}`}
                onClick={() => updateParams({ status: null, page: "1" })}
              >
                {t("users.clearFilters")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                    <span>{t("users.noUsersFound")}</span>
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
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
