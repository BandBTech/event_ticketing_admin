"use client";

import React from "react";
import type { IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/ReusableTable";
import { useLanguageStore } from "@/store/languageStore";
import { User } from "@/types/user";
import { format } from "date-fns";
import {formatDateTimeLong} from "@/lib/utils"
import {
  DotsThreeVertical as DotsThreeVerticalIcon,
  XCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  Shield as ShieldIcon,
  User as UserIcon,
  CrownIcon,
  UsersIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RefundTableProps {
  users: User[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  total?: number;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (
    sortBy: string | undefined,
    sortOrder: "asc" | "desc" | undefined,
  ) => void;
  handleToggleStatus?: (user: User) => void;
  setSelectedUser?: (user: User) => void;
  setIsToggleConfirmDialog?: (open: boolean) => void;
  wrapperClassName?: string;
}

export function UsersTable({
  users,
  isLoading,
  currentPage,
  totalPages,
  total,
  limit,
  onLimitChange,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  handleToggleStatus,
  setSelectedUser,
  setIsToggleConfirmDialog,
  wrapperClassName,
}: RefundTableProps) {
  const { t } = useTranslation();
  const { locale } = useLanguageStore();

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
    manager: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      Icon: UserCircleIcon,
    },
  };

  const router = useRouter();

  // Table columns
  const columns: ColumnDef<User>[] = React.useMemo(
    () => [
      {
        id: "name",
        header: t("users.userTable.name"),
        cell: ({ row }) => (
          <span className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original.first_name || "-"} {row.original.last_name || "-"}
          </span>
        ),
        meta: { sortKey: "name" },
      },
      {
        id: "email",
        header: t("users.userTable.contact"),
        meta: { sortKey: "email" },
        cell: ({ row }) => {
          const { email, phone, country_code } = row.original;

          return (
            <div className="flex flex-col gap-0.5 max-w-[200px] text-gray-700 truncate ">
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
        meta: { sortKey: "role" },
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
          const ROLE_PRIORITY = [
            "admin",
            "organizer",
            "staff",
            "user",
            "manager",
          ];

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
        id: "account_status",
        header: t("users.userTable.accountStatus"),
        meta: { sortKey: "account_status" },
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
        id: "created_at",
        header: t("users.userTable.joinedDate"),
        meta: { sortKey: "created_at" },
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
                    router.push(`/users/userdetail?id=${user.id}`);
                  }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-gray-700">
                    <EyeIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {t(`users.viewDetails`)}
                  </div>
                </DropdownMenuItem>

                {!user.roles.some((r) => r.name.toLowerCase() === "admin") && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser && setSelectedUser(user)
                      setIsToggleConfirmDialog && setIsToggleConfirmDialog(true);
                    }}
                  >
                    {user.account_status === "active" ? (
                      <div className="flex justify-start items-center bg-red-50 text-red-700">
                        <XCircleIcon
                          weight="duotone"
                          className="mr-2 h-4 w-4"
                        />
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
                )}
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

  return (
    <>
      <ReusableTable
        wrapperClassName={wrapperClassName}
        columns={columns}
        data={users}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onLimitChange={onLimitChange}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={onPageChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
        showSerialNumber={true}
        emptyState={
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {t("users.userTable.noUserData", "No user data found")}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {t(
                "users.userTable.noUserDataSubtitle",
                "You haven't made any users yet.",
              )}
            </p>
          </div>
        }
      />
    </>
  );
}
