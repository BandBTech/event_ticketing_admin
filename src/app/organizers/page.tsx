"use client";

import React, { useCallback, useEffect } from "react";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  Funnel as FunnelIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  Phone as PhoneIcon,
  Buildings as BuildingsIcon,
  Warning as WarningIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  OrganizerService,
  OrganizerListResponse,
} from "@/services/organizerService";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import Head from "next/head";
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
import { useDebounce } from "@/hooks/useDebounce";
import { OrganizerCard } from "./components/OrganizerCard";

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

export default function OrganizersPage() {
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
  const [searchInput, setSearchInput] = React.useState(searchQuery);

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
      router.push(`/organizers?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams],
  );

  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      updateParams({ search: debouncedSearch, page: "1" });
    }
  }, [debouncedSearch, searchQuery, updateParams]);

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

  const paginationInfo = response?.pagination;
  const totalItems = paginationInfo?.total || 0;
  const totalPages =
    paginationInfo?.total_pages || Math.ceil(totalItems / itemsPerPage) || 1;

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
    <>
      <Head>
        <title>Organizer | Timro-ticket</title>
      </Head>
      <div className="min-h-screen p-8 @container">
        {/* Search, Filter and Add Organizer Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 w-full sm:w-auto flex-1 max-w-2xl">
            <div className="relative flex-1">
              <MagnifyingGlassIcon
                weight="duotone"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder={t("organizer.searchOrganizers")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-11"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-11 gap-2 bg-background/80 backdrop-blur-sm border-gray-200 ${statusFilter ? "border-primary text-primary bg-primary/5" : ""}`}
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
                  onValueChange={(value) =>
                    updateParams({ status: value, page: "1" })
                  }
                >
                  <DropdownMenuRadioItem value="">
                    {t("events.allStatus")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="approved">
                    {t("organizer.approved")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="inactive">
                    {t("organizer.inactive")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending">
                    {t("organizer.pending")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="rejected">
                    {t("organizer.rejected")}
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
          <div className="flex items-center justify-center gap-2 mt-10 mb-4">
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
    </>
  );
}
