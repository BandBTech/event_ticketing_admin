"use client";

import React, { useCallback } from "react";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  Funnel as FunnelIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  Phone as PhoneIcon,
  Buildings as BuildingsIcon,
  CalendarBlank as CalendarBlankIcon,
  UserCheck as UserCheckIcon,
  UserMinus as UserMinusIcon,
  Eye as EyeIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  Ticket as TicketIcon,
  Warning as WarningIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  OrganizerService,
  Organizer,
  OrganizerListResponse,
} from "@/lib/organizerService";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { formatPhoneNumber } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import OrganizerFormDialog from "./components/OrganizerFormDialog";

function getInitials(firstName: string, lastName: string) {
  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";
  return (first + last).toUpperCase();
}

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return {
        variant: "secondary" as const,
        className:
          "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
        icon: CheckCircleIcon,
        label: "approved",
      };
    case "pending":
      return {
        variant: "secondary" as const,
        className:
          "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
        icon: ClockIcon,
        label: "pending",
      };
    case "rejected":
      return {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
        icon: XCircleIcon,
        label: "rejected",
      };
    case "inactive":
      return {
        variant: "secondary" as const,
        className:
          "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
        icon: UserMinusIcon,
        label: "inactive",
      };
    default:
      return {
        variant: "secondary" as const,
        className:
          "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
        icon: ClockIcon,
        label: status || "unknown",
      };
  }
}


function getAccountStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        className:
          "bg-emerald-500 text-white hover:bg-emerald-600 border-transparent",
        label: "active",
      };
    case "inactive":
      return {
        className:
          "bg-gray-500 text-white hover:bg-gray-600 border-transparent",
        label: "inactive",
      };
    case "suspended":
      return {
        className: "bg-red-500 text-white hover:bg-red-600 border-transparent",
        label: "suspended",
      };
    default:
      return {
        className:
          "bg-gray-500 text-white hover:bg-gray-600 border-transparent",
        label: status || "unknown",
      };
  }
}

// Skeleton Card Component
function OrganizerCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <div className="flex w-full gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </CardFooter>
    </Card>
  );
}

// Organizer Card Component
function OrganizerCard({ organizer }: { organizer: Organizer }) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const statusConfig = getStatusConfig(organizer.organizer_status);
  const accountStatusConfig = getAccountStatusConfig(organizer.account_status);
  const StatusIcon = statusConfig.icon;

  const formattedDate = organizer.created_at
    ? format(new Date(organizer.created_at), "MMM dd, yyyy")
    : "N/A";

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden border-gray-200">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        <Avatar className="h-16 w-16 border border-gray-100 group-hover:scale-105 transition-transform duration-300">
          {/* {organizer.logo ? (
            <Image
              src={organizer.logo}
              alt={`${organizer.business_name}`}
              fill
              className="object-cover"
            />
          ) : ( */}
          <AvatarFallback className="text-xl font-bold bg-linear-to-br from-indigo-50 to-blue-50 text-indigo-600">
            {getInitials(organizer.first_name, organizer.last_name)}
          </AvatarFallback>
          {/* )} */}
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-gray-900 truncate pr-1 group-hover:text-primary transition-colors">
              {organizer.first_name} {organizer.last_name}
            </h3>
            <Badge
              variant="outline"
              className={`text-[10px] font-bold shrink-0 ${accountStatusConfig.className}`}
            >
              {t(`organizer.${accountStatusConfig.label}`)}
            </Badge>
          </div>
          <p
            className="text-sm text-muted-foreground truncate font-medium"
            title={organizer.email}
          >
            {organizer.email}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 pb-4">
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("organizer.status")}
            </span>
            <Badge
              variant={statusConfig.variant}
              className={`gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${statusConfig.className}`}
            >
              <StatusIcon weight="duotone" className="w-3.5 h-3.5" />
              {t(`organizer.${statusConfig.label}`)}
            </Badge>
          </div>
          {/* {organizer.is_email_verified && (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100 gap-1 px-2 py-0.5"
              title="Email Verified"
            >
              <UserCheckIcon weight="duotone" className="w-3.5 h-3.5" />
              {t("organizer.verified")}
            </Badge>
          )} */}
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          {organizer.phone && (
            <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <PhoneIcon weight="duotone" className="w-4 h-4" />
              </div>
              <span className="font-medium truncate">
                {formatPhoneNumber(organizer.country_code, organizer.phone)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <CalendarBlankIcon weight="duotone" className="w-4 h-4" />
            </div>
            <span className="font-medium">
              {t("organizer.joined")} {formattedDate}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => router.push(`/organisers/detail?id=${organizer.id}`)}
        >
          <EyeIcon weight="duotone" className="w-4.5 h-4.5" />
          {t("organizer.profile")}
        </Button>
        <Button
          className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => router.push(`/events?organizer_id=${organizer.id}`)}
        >
          <TicketIcon weight="duotone" className="w-4.5 h-4.5" />
          {t("organizer.events")}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Empty State Component
function EmptyState({ searchQuery }: { searchQuery: string }) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-muted-foreground">
      <div className="w-20 h-20 rounded-full bg-muted shadow-sm border border-border flex items-center justify-center mb-6">
        <BuildingsIcon
          weight="duotone"
          className="w-10 h-10 text-muted-foreground/50"
        />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {t("organizer.noOrganizerFound")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center">
        {searchQuery
          ? t("organizer.tryAdjustingSearchParams")
          : t("organizer.noOrganizersRegisteredYet")}
      </p>
    </div>
  );
}

export default function OrganisersPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read state from URL params
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const itemsPerPage = 12;
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

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
      router.push(`/organisers?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      // Reset to page 1 when searching
      updateParams({ search: value, page: "1" });
    },
    [updateParams]
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<OrganizerListResponse>({
    queryKey: queryKeys.organizers.all({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      status: statusFilter,
    }),
    queryFn: () =>
      OrganizerService.getOrganizers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: statusFilter,
      }),
  });

  // Server-side filtering now, so we use response?.organizers directly
  const filteredOrganizers = response?.organizers || [];

  const totalItems = response?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-destructive">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <WarningIcon weight="duotone" className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-lg font-medium">
            {t("organizer.failedToLoadOrganizers")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {(error as Error)?.message || t("organizer.pleaseTryAgainLater")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 space-y-8 @container">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              weight="duotone"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder={t("organizer.searchOrganizers")}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`h-11 gap-2 bg-background/80 backdrop-blur-sm border-gray-200 ${statusFilter ? 'border-primary text-primary bg-primary/5' : ''}`}
              >
                <FunnelIcon
                  weight={statusFilter ? "bold" : "duotone"}
                  className="h-4 w-4"
                />
                {statusFilter
                  ? t(`organizer.${statusFilter.toLowerCase()}`)
                  : t("common.filter")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t("organizer.status")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(value) => updateParams({ status: value, page: "1" })}
              >
                <DropdownMenuRadioItem value="">
                  {t("events.allStatus")}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending">
                  {t("organizer.pending")}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="approved">
                  {t("organizer.approved")}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rejected">
                  {t("organizer.rejected")}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="inactive">
                  {t("organizer.inactive")}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm transition-all ease-out duration-300 active:scale-95"
        >
          <UserPlusIcon weight="bold" className="h-5 w-5" />
          {t("organizer.addOrganizer", "Add Organizer")}
        </Button>
      </div>

      <OrganizerFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <div className="grid grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3 gap-6">
        {isLoading || isFetching ? (
          Array.from({ length: 8 }).map((_, i) => (
            <OrganizerCardSkeleton key={i} />
          ))
        ) : filteredOrganizers.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          filteredOrganizers.map((organizer) => (
            <OrganizerCard key={organizer.id} organizer={organizer} />
          ))
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <CaretLeftIcon weight="bold" className="w-4 h-4" />
            {t("pagination.previous")}
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNumber = i + 1;
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
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="gap-2"
          >
            {t("pagination.next")}
            <CaretRightIcon weight="bold" className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!isLoading && filteredOrganizers.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {t("pagination.showing")} {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, totalItems)}{" "}
          {t("pagination.of")} {totalItems} {t("pagination.organizers")}
        </div>
      )}
    </div>
  );
}
