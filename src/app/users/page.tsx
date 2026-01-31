"use client";

import React, { useCallback } from "react";
import type { IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
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
  CrownIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserService } from "@/lib/userService";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse as UserApiResponse } from "@/types/user";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { User } from "@/types/user";

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const accountStatusFilter = searchParams.get("account_status") || "";
  const itemsPerPage = 10;

  const { data: response, isLoading } = useQuery<UserApiResponse>({
    queryKey: queryKeys.users.all(
      currentPage,
      itemsPerPage,
      searchQuery,
      statusFilter,
      accountStatusFilter,
    ),
    queryFn: () =>
      UserService.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: statusFilter,
        account_status: accountStatusFilter,
      }),
  });

  const mockUserData = response?.users || [];

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
      router.push(`/users?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams({ search: value, page: "1" });
    },
    [updateParams],
  );

  // const filteredData = useMemo(() => {
  //   let result = mockUserData;

  //   if (searchQuery.trim() && !response?.users) {
  //     const query = searchQuery.toLowerCase();
  //     result = result.filter(
  //       (user) =>
  //         user.first_name?.toLowerCase().includes(query) ||
  //         user.last_name?.toLowerCase().includes(query) ||
  //         user.email?.toLowerCase().includes(query) ||
  //         user.phone?.includes(query) ||
  //         user.organizer_onboarding?.business_name
  //           ?.toLowerCase()
  //           .includes(query),
  //     );
  //   }

  //   if (statusFilter && !response?.users) {
  //     result = result.filter(
  //       (user) =>
  //         user.organizer_status?.toLowerCase() === statusFilter.toLowerCase(),
  //     );
  //   }

  //   if (accountStatusFilter && !response?.users) {
  //     result = result.filter(
  //       (user) =>
  //         user.account_status?.toLowerCase() ===
  //         accountStatusFilter.toLowerCase(),
  //     );
  //   }

  //   return result;
  // }, [searchQuery, statusFilter, accountStatusFilter, mockUserData, response]);

  // const paginatedData = mockUserData;

  const ROLE_CONFIG: Record<
    string,
    {
      bg: string;
      text: string;
      border: string;
      Icon: ComponentType<IconProps>;
    }
  > = {
    admin: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      Icon: CrownIcon,
    },
    organizer: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      Icon: ShieldIcon,
    },
    staff: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      Icon: UsersIcon,
    },
    user: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      Icon: UserIcon,
    },
  };

  // Table columns
  const columns: ColumnDef<User>[] = React.useMemo(
    () => [
      {
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        id: "name",
        header: t("users.userTable.name"),
      },
      {
        accessorKey: "contact",
        header: t("users.userTable.contact"),
        cell: ({ row }) => {
          const { email, phone, country_code } = row.original;

          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-foreground">{email || "-"}</span>

              <span className="text-xs text-muted-foreground">
                {phone ? `${country_code ?? ""} ${phone}` : "-"}
              </span>
            </div>
          );
        },
      },
      {
        id: "role",
        header: t("users.userTable.role"),
        cell: ({ row }) => {
          const roles = row.original.roles;

          if (!roles || roles.length === 0) {
            return (
              <span className="text-sm text-muted-foreground">
                {t("users.noRole")}
              </span>
            );
          }

          // highest priority role first
          const ROLE_PRIORITY = ["admin", "organizer", "staff", "user"];

          const primaryRole =
            roles
              .map((r) => r.name.toLowerCase())
              .sort(
                (a, b) => ROLE_PRIORITY.indexOf(a) - ROLE_PRIORITY.indexOf(b),
              )[0] ?? "user";

          const config = ROLE_CONFIG[primaryRole] ?? ROLE_CONFIG.user;
          const Icon = config.Icon;

          return (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`gap-1.5 ${config.bg} ${config.text} ${config.border}`}
              >
                <Icon weight="duotone" className="w-3 h-3" />
                {t(`users.userRoles.${primaryRole}`)}
              </Badge>

              {roles.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  +{roles.length - 1} {t("users.more")}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "account_status",
        header: t("users.userTable.accountStatus"),
        cell: ({ row }) => {
          const accountStatus = row.original.account_status;

          return (
            <div className="flex items-center gap-2">
              {accountStatus === "active" ? (
                <div>
                  <Badge
                    variant="outline"
                    className="gap-1.5 bg-green-50 text-green-700"
                  >
                    <CheckCircleIcon weight="duotone" className="w-3 h-3" />
                    {t(`users.organizerStatus.${accountStatus}`)}
                  </Badge>
                </div>
              ) : (
                <div>
                  <Badge
                    variant="outline"
                    className="gap-1.5 bg-red-50 text-red-700"
                  >
                    <XCircleIcon weight="duotone" className="w-3 h-3" />
                    {t(`users.organizerStatus.${accountStatus}`)}
                  </Badge>
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "joinedDate",
        header: t("users.userTable.joinedDate"),
        cell: ({ row }) => {
          const createdAt = row.original.created_at;

          return (
            <span className="text-sm">
              {createdAt ? format(new Date(createdAt), "MMM dd, yyyy") : "-"}
            </span>
          );
        },
      },
      {
        id: "actions",
        // header: "Actions",
        cell: ({ row }) => {
          const user = row.original;

          //   if (actionLoading === employee.id) {
          //     return (
          //       <div className="h-8 w-8 flex items-center p-0">
          //         <EyeIcon className="w-4 h-4 text-amber-900 animate-spin" />
          //       </div>
          //     );
          //   }

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
                //   onClick={(e) => {
                //     e.stopPropagation();
                //     handleViewDetails(employee);
                //   }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                    <EyeIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {t(`users.viewDetails`)}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                // onClick={(e) => {
                //   e.stopPropagation();
                //   handleToggleStatus(employee);
                // }}
                >
                  {user.account_status === "active" ? (
                    <div className="flex justify-start items-center bg-red-50 text-red-700">
                      <XCircleIcon weight="duotone" className="mr-2 h-4 w-4" />
                      {t(`users.deactivate`)}
                    </div>
                  ) : (
                    <div className="flex justify-start items-center bg-green-50 text-green-700">
                      <CheckCircleIcon
                        weight="duotone"
                        className="mr-2 h-4 w-4"
                      />
                      {t(`users.activate`)}
                    </div>
                  )}
                </DropdownMenuItem>
                {/* <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(employee);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const totalItems = response?.total || mockUserData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = response?.has_more ?? currentPage < totalPages;

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
            placeholder={t("users.searchUsers")}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          className="gap-2 bg-background/80 backdrop-blur-sm"
        >
          <FunnelIcon weight="duotone" className="h-4 w-4" />
          {t("users.filter")}
        </Button>
      </div>

      {/* Table Container */}
      <DataTable
        table={table}
        columns={columns}
        loadingMessage={t("users.loadingUsers")}
        emptyIcon={<UserIcon className="w-8 h-8 text-gray-400" />}
        emptyMessage={t("users.noUsersFound")}
        showSerialNumber
        serialNumberStart={(currentPage - 1) * itemsPerPage + 1}
      />

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
    </div>
  );
}
