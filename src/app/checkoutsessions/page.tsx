"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
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
  UserCircleDashedIcon,
  PlayCircleIcon,
} from "@phosphor-icons/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
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
import { usePathname } from "next/navigation";
import { BanknoteArrowUp, CreditCard, Logs } from "lucide-react";
import { CaretUp, CaretDown, CaretUpDown } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useDebounce } from "@/hooks/useDebounce";
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
import { TransactionFilters, getDefaultFilters } from "@/types/transaction";
import { CheckoutSessionService } from "@/services/checkoutSessionService";
import { CheckoutSessionsData, CheckoutSession } from "@/types/checkoutsession";
import { toast } from "@/lib/toast";

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const pathname = usePathname();
  const isCheckoutSessionsPage = pathname === "/checkoutsessions/";

  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 20;
  const SKELETON_ROWS = itemsPerPage;
  const statusFilter = searchParams.get("status") || "";
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [searchInput, setSearchInput] = React.useState("");
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [appliedFilters, setAppliedFilters] =
    React.useState<TransactionFilters>(getDefaultFilters());
  const [showConfirm, setShowConfirm] = React.useState(false);
  const queryClient = useQueryClient();

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
    return count;
  }, [appliedFilters]);

  const sort =
    sorting.length > 0
      ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`
      : undefined;

  const { data: response, isLoading } = useQuery<CheckoutSessionsData>({
    queryKey: [
      "checkoutsession",
      currentPage,
      itemsPerPage,
      statusFilter,
      appliedFilters.status,
      sort,
      debouncedSearch,
    ],
    queryFn: () =>
      CheckoutSessionService.getCheckoutSessions({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        status: appliedFilters.status,
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

      router.push(`/checkoutsessions?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams],
  );

  const createMutation = useMutation({
    mutationFn: (data: { checkout_token: string }) =>
      CheckoutSessionService.processCheckout(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.checkoutsession?.list ?? ["checkoutsessions"],
      });
      toast.success(t("", "Checkout processed successfully."));
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : t("", "Failed to update bill. Please try again."),
      );
    },
  });

  // Table columns
  const columns: ColumnDef<CheckoutSession>[] = React.useMemo(
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
        id: "amount",
        header: t("transactions.table.amount"),
        accessorKey: "amount",
        title: "Amount",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-2">
            {row.original.currency} {row.original.amount}
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
                <Button 
                disabled={transaction.status !== "pending"}
                variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <DotsThreeVerticalIcon weight="duotone" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              {transaction.status === "pending" && (
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <div
                      onClick={() =>
                        createMutation.mutate({
                          checkout_token: transaction.checkout_token,
                        })
                      }
                      className="flex justify-start items-center bg-gray-50 text-gray-700"
                    >
                      <PlayCircleIcon
                        weight="duotone"
                        className="mr-2 h-4 w-4"
                      />
                      Process Checkout
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
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
    data: response?.sessions || [],
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
      <div className="grid gap-2">
        <div className="flex justify-between">
          <div>
            <div className="relative flex-1 w-md">
              <MagnifyingGlassIcon
                weight="duotone"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder={t("transactions.searchCheckoutSessions")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => setFilterSheetOpen(true)}
              className="gap-2 bg-background/80 backdrop-blur-sm"
            >
              <FunnelIcon weight="duotone" className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
        <div className="flex justify-start gap-2">
          <Button
            onClick={handleOpenTransactions}
            variant="outline"
            className="gap-2 bg-background/80 backdrop-blur-sm"
          >
            <ArrowsLeftRight className="h-4 w-4" />
            {t("sidebar.transactions")}
          </Button>
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
            variant="outline"
            className={
              isCheckoutSessionsPage
                ? "gap-2 bg-primary/10 text-black hover:bg-primary/10"
                : `gap-2 bg-background/80 backdrop-blur-sm`
            }
          >
            <UserCircleDashedIcon className="h-4 w-4" />
            {t("transactions.checkoutsessions")}
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

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              {t("", "Confirm Process Checkout")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-base">
              {t(
                "dashboard.modal.confirmCheckoutDesc",
                "Are you sure you want to process this checkout? This action cannot be undone immediately.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel
              onClick={() => setShowConfirm(false)}
              className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              // onClick={createMutation.mutate.bind(null, { checkout_token: "example_checkout_token" })}
              className="h-11 px-8 active:scale-95"
            >
              {t("common.confirm", "Confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
