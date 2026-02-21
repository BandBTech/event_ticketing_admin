"use client";

import React from "react";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  Funnel as FunnelIcon,
  Eye as EyeIcon,
  User as UserIcon,
  DotsThreeVertical as DotsThreeVerticalIcon,
  Spinner,
  TrashIcon,
  CaretUp,
   CaretDown, 
  CaretUpDown
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
  DropdownMenuSeparator,
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

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const roleFilter = searchParams.get("role") || "";
  const accountStatusFilter = searchParams.get("account_status") || "";
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState(searchQuery);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const debouncedSearch = useDebounce(searchInput, 500);

  const { data: response, isLoading } = useQuery<PaymentBillData>({
    queryKey: ["bills", currentPage, itemsPerPage],
    queryFn: () =>
      BillingService.getAllBills({
        page: currentPage,
        limit: itemsPerPage,
      }),
  });

  console.log("response", response);

  const SKELETON_ROWS = itemsPerPage;

  const mockUserData = response?.bills || [];

  // Mutation for toggling status
  // const toggleStatusMutation = useMutation({
  //   mutationFn: (employeeId: string) =>
  //     UserService.toggleStatus(employeeId, {
  //       status:
  //         mockUserData.find((c) => c.id === employeeId)?.account_status ===
  //         "active"
  //           ? "inactive"
  //           : "active",
  //       admin_remark: "Status toggled by admin",
  //     }),
  //   onMutate: (employeeId) => {
  //     setActionLoading(employeeId);
  //   },
  //   onSuccess: (_, employeeId) => {
  //     const employee = mockUserData.find((c) => c.id === employeeId);
  //     toast.success(
  //       `User ${
  //         employee?.account_status === "active" ? "deactivated" : "activated"
  //       } successfully`,
  //     );
  //     queryClient.invalidateQueries({
  //       queryKey: ["users"],
  //     });
  //   },
  //   onError: (err) => {
  //     toast.error("Failed to update user status");
  //   },
  //   onSettled: () => {
  //     setActionLoading(null);
  //   },
  // });

  // const updateParams = useCallback(
  //   (updates: Record<string, string | null>) => {
  //     const params = new URLSearchParams(window.location.search);

  //     Object.entries(updates).forEach(([key, value]) => {
  //       if (!value) {
  //         params.delete(key);
  //       } else {
  //         params.set(key, value);
  //       }
  //     });

  //     router.push(`/billings?${params.toString()}`, { scroll: false });
  //   },
  //   [router],
  // );

  // Handler functions
  // const handleToggleStatus = (user: User) => {
  //   toggleStatusMutation.mutate(user.id);
  // };

  // const handlePageChange = useCallback(
  //   (page: number) => {
  //     updateParams({ page: page.toString() });
  //   },
  //   [updateParams],
  // );

  // Table columns
  const columns: ColumnDef<Bill>[] = React.useMemo(
    () => [
      {
        id: "name",
        header: "Event Title",
        accessorKey: "event_title",
        // cell: ({ row }) => {
        //   const { email, phone, country_code } = row.original;

        //   return (
        //     <div className="flex flex-col gap-0.5">
        //       <span className="text-sm text-foreground">{email || "-"}</span>

        //       <span className="text-xs text-muted-foreground">
        //         {phone ? `${country_code ?? ""} ${phone}` : "-"}
        //       </span>
        //     </div>
        //   );
        // },
        enableSorting: false,
      },
      {
        id: "organizer_name",
        accessorKey: "organizer_name",
        header: "Organizer Name",
        // cell: ({ row }) => {
        //   const { email, phone, country_code } = row.original;

        //   return (
        //     <div className="flex flex-col gap-0.5">
        //       <span className="text-sm text-foreground">{email || "-"}</span>

        //       <span className="text-xs text-muted-foreground">
        //         {phone ? `${country_code ?? ""} ${phone}` : "-"}
        //       </span>
        //     </div>
        //   );
        // },
        enableSorting: false,
      },
      {
        id: "admin_name",
        accessorKey: "admin_name",
        header: "Admin Name",
        enableSorting: false,
      },
      // {
      //   id: "total_revenue",
      //   accessorKey: "total_revenue",
      //   header: "Total Revenue",
      //   enableSorting: false,
      // },
      // {
      //   id: "total_commission",
      //   accessorKey: "total_commission",
      //   header: "Total Commission",rting: true,
      // },
      // {
      //   id: "organizer_earnings",
      //   accessorKey: "organizer_earnings",
      //   header: "Organizer Earnings",
      //   enableSorting: true,
      // },
      {
        id: "billed_amount",
        accessorKey: "billed_amount",
        header: "Billed Amount",
        enableSorting: false,
      },
      {
        id: "paid_amount",
        accessorKey: "paid_amount",
        header: "Paid Amount",
        enableSorting: false,
      },
      // {
      //   id: "remaining_amount",
      //   accessorKey: "remaining_amount",
      //   header: "Remaining Amount",
      //   enableSorting: true,
      // },
      {
        id: "payment_method",
        accessorKey: "payment_method",
        header: "Payment Method",
        enableSorting: false,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
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
                    {t(`users.viewDetails`)}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      // handleDeleteClick(user);
                    }}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
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
    data: mockUserData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

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
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-background/80 backdrop-blur-sm"
              >
                <FunnelIcon weight="duotone" className="h-4 w-4" />
                {t("users.filterByRole")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className={roleFilter === "admin" ? "bg-muted font-medium" : ""}
                onClick={() => updateParams({ role: "admin", page: "1" })}
              >
                {t("users.userRoles.admin")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className={
                  roleFilter === "organizer" ? "bg-muted font-medium" : ""
                }
                onClick={() => updateParams({ role: "organizer", page: "1" })}
              >
                {t("users.userRoles.organizer")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className={roleFilter === "staff" ? "bg-muted font-medium" : ""}
                onClick={() => updateParams({ role: "staff", page: "1" })}
              >
                {t("users.userRoles.staff")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className={
                  roleFilter === "manager" ? "bg-muted font-medium" : ""
                }
                onClick={() => updateParams({ role: "manager", page: "1" })}
              >
                {t("users.userRoles.manager")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className={roleFilter === "user" ? "bg-muted font-medium" : ""}
                onClick={() => updateParams({ role: "user", page: "1" })}
              >
                {t("users.userRoles.user")}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className={`text-red-600 font-medium ${
                  !roleFilter ? "hidden" : ""
                }`}
                onClick={() => updateParams({ role: null, page: "1" })}
              >
                {t("users.clearFilters")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-background/80 backdrop-blur-sm"
              >
                <FunnelIcon weight="duotone" className="h-4 w-4" />
                {t("billings.filterByStatus")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className={
                  statusFilter === "active" ? "bg-muted font-medium" : ""
                }
                // onClick={() => updateParams({ status: "active", page: "1" })}
              >
                {t("billings.status.pending")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={
                  statusFilter === "inactive" ? "bg-muted font-medium" : ""
                }
                // onClick={() => updateParams({ status: "inactive", page: "1" })}
              >
                {t("billings.status.paid")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={
                  statusFilter === "suspended" ? "bg-muted font-medium" : ""
                }
                // onClick={() => updateParams({ status: "suspended", page: "1" })}
              >
                {t("billings.status.overdue")}
                {/* Overdue */}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={
                  statusFilter === "suspended" ? "bg-muted font-medium" : ""
                }
                // onClick={() => updateParams({ status: "suspended", page: "1" })}
              >
                {t("billings.status.cancelled")}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className={`text-red-600 font-medium ${!statusFilter ? "hidden" : ""}`}
                // onClick={() => updateParams({ status: null, page: "1" })}
              >
                {t("billings.status.clearFilter")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
      {/* {totalPages > 0 && !isLoading && (
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
      )} */}

      {/* Results count */}
      {mockUserData.length > 0 && !isLoading && (
        <div className="text-center text-sm text-muted-foreground">
          {t("pagination.showing")} {startItem}-{endItem} {t("pagination.of")}{" "}
          {totalItems} {t("sidebar.users")}
        </div>
      )}
    </div>
  );
}
