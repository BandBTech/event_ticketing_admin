"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EventService } from "@/services/eventServices";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  CalendarBlank as CalendarBlankIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/lib/queryKeys";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useDebounce } from "@/hooks/useDebounce";
import { OrganizerService, AllOrganizers, OrganizerListResponse } from "@/services/organizerService";
import AnimatedBox from "@/components/AnimatedBox";
import { EventCardSkeleton } from "./components/EventCardSkeleton";
import { EventCard } from "./components/EventCard";
import { StatusFilterSelect } from "./components/StatusFilterSelect";
import { OrganizerFilterSelect } from "./components/OrganizerFilterSelect";

// Empty State
function EmptyState({ searchQuery }: { searchQuery: string }) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <CalendarBlankIcon
          weight="duotone"
          className="w-8 h-8 text-muted-foreground/50"
        />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">
        {t("events.noEventsFound")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center">
        {searchQuery
          ? t("events.tryAdjustingSearch")
          : t("events.noEventsCreated")}
      </p>
    </div>
  );
}


export default function EventsPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read all state from URL params
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";
  const organizerId = searchParams.get("organizer_id") || "";
  const itemsPerPage = 9;
  const [searchInput, setSearchInput] = React.useState(searchQuery);

  const debouncedSearch = useDebounce(searchInput, 500);

  // Helper to update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const queryString = params.toString();
      router.push(`/events${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page === 1 ? null : page.toString() });
    },
    [updateParams],
  );

  useEffect(() => {
    updateParams({ search: debouncedSearch, page: "1" });
  }, [debouncedSearch, updateParams]);

  const handleStatusChange = useCallback(
    (value: string) => {
      updateParams({ status: value, page: null });
    },
    [updateParams],
  );

  const handleClearOrganizerFilter = useCallback(() => {
    updateParams({ organizer_id: null, page: null });
  }, [updateParams]);

  const handleOrganizerChange = useCallback(
    (value: string) => {
      updateParams({ organizer_id: value === "all" ? null : value, page: null });
    },
    [updateParams]
  );

  // Fetch organizers to resolve IDs to names
  const { data: organizersData } = useQuery({
    queryKey: queryKeys.organizers.all({ all_approved: true }),
    queryFn: () => OrganizerService.getOrganizers({ all_approved: true }),
  });

  const organizers = useMemo(() => {
    if (!organizersData) return [];
    if (Array.isArray(organizersData)) return organizersData;
    if (typeof organizersData === "object" && "organizers" in organizersData && Array.isArray((organizersData as OrganizerListResponse).organizers)) {
      return (organizersData as OrganizerListResponse).organizers as unknown as AllOrganizers[];
    }
    return [];
  }, [organizersData]);

  const currentOrganizer = useMemo(
    () => organizers.find((org) => org.id === organizerId),
    [organizers, organizerId]
  );
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.events.all({
      page: currentPage,
      limit: 100, // Fetch more for client-side filtering
      status: statusFilter !== "all" ? statusFilter : undefined,
      organizerId: organizerId || undefined,
    }),
    queryFn: () =>
      EventService.getAdminEvents({
        status:
          statusFilter && statusFilter !== "all" ? statusFilter : undefined,
        organizer_id: organizerId || undefined,
        limit: 100,
        sort: "-created_at",
      }),
  });

  // Client-side search filtering
  const filteredEvents = useMemo(() => {
    const events = response?.events || [];
    if (!searchQuery.trim()) return events;

    const query = searchQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.venue_name?.toLowerCase().includes(query) ||
        event.address?.toLowerCase().includes(query),
    );
  }, [response?.events, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  if (isError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center text-destructive">
          <p className="text-lg font-medium">
            {t("events.failedToLoadEvents")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {(error as Error)?.message || t("events.pleaseTryAgainLater")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 @container">
      {/* Organizer Filter Banner */}
      <AnimatedBox isVisible={!!organizerId} className="w-full">
        <div className="pb-4">
          <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-blue-700">
              {t("events.showingEventsForOrganizer")} -{" "}
              <strong>{currentOrganizer?.name || organizerId}</strong>
            </p>
            <Button
              variant="link"
              onClick={handleClearOrganizerFilter}
              className="text-blue-600 hover:text-blue-800 h-auto p-0"
            >
              {t("events.clearFilter")}
            </Button>
          </div>
        </div>
      </AnimatedBox>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md w-full">
          <MagnifyingGlassIcon
            weight="duotone"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder={t("events.searchEvents")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <OrganizerFilterSelect
            value={organizerId}
            onChange={handleOrganizerChange}
          />
          <StatusFilterSelect value={statusFilter} onChange={handleStatusChange} />
          {/* <Button variant="outline" className="gap-2 bg-background">
            <FunnelIcon weight="duotone" className="h-4 w-4" />
            {t("events.moreFilters")}
          </Button> */}
          {/* <Button
            onClick={() => router.push("/events/createevent")}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <PlusIcon weight="bold" className="h-4 w-4" />
            {t("events.createEvent", "Create Event")}
          </Button> */}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <EventCardSkeleton key={i} />)
        ) : currentEvents.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          currentEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <CaretLeftIcon weight="bold" className="w-4 h-4" />
            {t("pagination.previous")}
          </Button>

          <div className="flex gap-1">
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
            className="gap-1"
          >
            {t("pagination.next")}
            <CaretRightIcon weight="bold" className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && filteredEvents.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-4">
          {t("pagination.showing")} {startIndex + 1}-
          {Math.min(startIndex + itemsPerPage, filteredEvents.length)}{" "}
          {t("pagination.of")} {filteredEvents.length} {t("pagination.events")}
        </div>
      )}
    </div>
  );
}
