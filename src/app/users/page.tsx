"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Funnel as FunnelIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ApiResponse as UserApiResponse, User } from "@/types/user";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { UserService } from "@/services/userService";
import { useDebounce } from "@/hooks/useDebounce";
import { UsersTable } from "./components/UsersTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePaginationSync } from "@/hooks/usePaginationSync";

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const pathname = usePathname();

  const { currentPage, limit, handlePageChange, handleLimitChange } =
    usePaginationSync();

  const [searchInput, setSearchInput] = React.useState("");
  const roleFilter = searchParams.get("role") || "";
  const statusFilter = searchParams.get("status") || "";
  const accountStatusFilter = searchParams.get("account_status") || "";

  const [isToggleConfirmDialog, setIsToggleConfirmDialog] =
    React.useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);
  const queryClient = useQueryClient();
  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const { data: response, isLoading } = useQuery<UserApiResponse>({
    queryKey: [
      "users",
      currentPage,
      limit,
      debouncedSearch,
      statusFilter,
      roleFilter,
      accountStatusFilter,
      sortBy,
      sortOrder,
    ],

    queryFn: () =>
      UserService.getUsers({
        page: currentPage,
        limit: limit,
        search: debouncedSearch,
        status: statusFilter,
        role: roleFilter,
        account_status: accountStatusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const mockUserData = response?.users || [];

  // Mutation for toggling status
  const toggleStatusMutation = useMutation({
    mutationFn: (employeeId: string) =>
      UserService.toggleStatus(employeeId, {
        status:
          mockUserData.find((c) => c.id === employeeId)?.account_status ===
          "active"
            ? "inactive"
            : "active",
        admin_remark: "Status toggled by admin",
      }),
    onMutate: (employeeId) => {
      // setActionLoading(employeeId);
    },
    onSuccess: (_, employeeId) => {
      const employee = mockUserData.find((c) => c.id === employeeId);
      toast.success(
        `${t("users.userRoles.user")} ${
          employee?.account_status === "active" ? t("common.deactivated") : t("common.activated")
        } ${t("common.successfully")}`,
      );
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
    onError: (err) => {
      toast.error("Failed to update user status");
    },
    onSettled: () => {
      // setActionLoading(null);
    },
  });

  // Handler functions
  const handleToggleStatus = (user: User) => {
    toggleStatusMutation.mutate(user.id);
  };

  const roles = [
    { key: "admin", label: "users.userRoles.admin" },
    { key: "manager", label: "users.userRoles.manager" },
    { key: "organizer", label: "users.userRoles.organizer" },
    { key: "staff", label: "users.userRoles.staff" },
    { key: "user", label: "users.userRoles.user" },
  ];

  // Update URL params for filters (resets page to 1)
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

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
    <div className="h-full p-8 space-y-6 flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("users.title", "User Management")}
          </h1>
          <p className="text-gray-500">
            {t("users.subTitle", "Manage your organization's users.")}
          </p>
        </div>
      </div>

      <div className="glass-card-lowest rounded-2xl flex-1 min-h-0 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("users.searchUsers", "Search Users")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 shadow-sm"
            />
          </div>

          <div className="flex gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={
                    roleFilter
                      ? "gap-2 bg-primary/10 text-black hover:bg-primary/10"
                      : `gap-2 bg-background/80 backdrop-blur-sm`
                  }
                >
                  <FunnelIcon weight="duotone" className="h-4 w-4" />
                  {t("users.filterByRole")}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                {roles.map(({ key, label }) => (
                  <DropdownMenuItem
                    key={key}
                    className={roleFilter === key ? "bg-muted font-medium" : ""}
                    onClick={() => updateParams({ role: key, page: "1" })}
                  >
                    {t(label)}
                  </DropdownMenuItem>
                ))}
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
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  // className="gap-2 bg-background/80 backdrop-blur-sm"
                  className={
                    statusFilter
                      ? "gap-2 bg-primary/10 text-black hover:bg-primary/10"
                      : `gap-2 bg-background/80 backdrop-blur-sm`
                  }
                >
                  <FunnelIcon weight="duotone" className="h-4 w-4" />
                  {t("users.filterByAccountStatus")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className={
                    statusFilter === "active" ? "bg-muted font-medium" : ""
                  }
                  onClick={() => updateParams({ status: "active", page: "1" })}
                >
                  {t("users.accountStatus.active")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={
                    statusFilter === "inactive" ? "bg-muted font-medium" : ""
                  }
                  onClick={() =>
                    updateParams({ status: "inactive", page: "1" })
                  }
                >
                  {t("users.accountStatus.inactive")}
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

        <UsersTable
          wrapperClassName="flex-1 min-h-0 overflow-auto"
          users={response?.users || []}
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
          handleToggleStatus={handleToggleStatus}
          setSelectedUser={setSelectedUser}
          setIsToggleConfirmDialog={setIsToggleConfirmDialog}
        />

        {/* Approve Refund Confirmation Dialog */}
        <AlertDialog
          open={isToggleConfirmDialog}
          onOpenChange={setIsToggleConfirmDialog}
        >
          <AlertDialogContent className="rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                {/* {t("", "Confirm Activate User")} */}
                <span>
                  {t("common.confirm")}{" "}
                  {selectedUser?.account_status == "active"
                    ? t("organizer.management.actions.deactivate")
                    : t("organizer.management.actions.activate")}{" "}
                  {t("users.userRoles.user")}
                </span>
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 text-base">
                <span>
                  {t("users.modals.areYouSure")}{" "}
                  <strong>
                    {" "}
                    {selectedUser?.account_status == "active"
                      ? t(
                          "organizer.management.actions.deactivate",
                        ).toLowerCase()
                      : t(
                          "organizer.management.actions.activate",
                        ).toLowerCase()}{" "}
                  </strong>{" "}
                  {t("users.modals.this")}{" "}
                  <strong>
                    {selectedUser?.first_name} {selectedUser?.last_name}
                  </strong>
                  ?
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-6">
              <AlertDialogCancel
                onClick={() =>
                  setIsToggleConfirmDialog && setIsToggleConfirmDialog(false)
                }
                className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancelButton", "Cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  toggleStatusMutation.mutate(selectedUser?.id || "");
                }}
                className={`h-11 px-8 active:scale-95
  ${selectedUser?.account_status === "active" ? "deactivate bg-destructive hover:bg-destructive/90" : "activate bg-primary"}
  text-white hover:opacity-90 focus:opacity-90 transition-colors`}
              >
                {t("common.confirm", "Confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
