"use client";

import React, { useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EventService } from "@/lib/eventServices";
import { Event } from "@/types/event";
import { format } from "date-fns";
import { useEventStore } from "@/store/eventStore";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  CalendarBlank as CalendarBlankIcon,
  MapPin as MapPinIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  Eye as EyeIcon,
  Ticket as TicketIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  WarningCircle as WarningCircleIcon,
  CrownIcon,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryKeys } from "@/lib/queryKeys";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { EventStatusBadge } from "../components/EventStatusBadge";

// Status configuration
// function getStatusConfig(status: string) {
//   switch (status?.toLowerCase()) {
//     case "approved":
//       return {
//         variant: "secondary" as const,
//         className:
//           "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none",
//         icon: CheckCircleIcon,
//         label: "Approved",
//       };
//     case "pending":
//       return {
//         variant: "secondary" as const,
//         className:
//           "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none",
//         icon: ClockIcon,
//         label: "Pending",
//       };
//     case "rejected":
//       return {
//         variant: "destructive" as const,
//         className: "bg-red-100 text-red-700 hover:bg-red-200 border-none",
//         icon: XCircleIcon,
//         label: "Rejected",
//       };
//     case "draft":
//       return {
//         variant: "secondary" as const,
//         className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none",
//         icon: WarningCircleIcon,
//         label: "Draft",
//       };
//     case "live":
//       return {
//         variant: "secondary" as const,
//         className: "bg-green-100 text-green-700 hover:bg-green-200 border-none",
//         icon: CheckCircleIcon,
//         label: "Live",
//       };
//     case "cancelled":
//       return {
//         variant: "destructive" as const,
//         className: "bg-red-100 text-red-700 hover:bg-red-200 border-none",
//         icon: XCircleIcon,
//         label: "Cancelled",
//       };
//     default:
//       return {
//         variant: "secondary" as const,
//         className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none",
//         icon: WarningCircleIcon,
//         label: status || "Unknown",
//       };
//   }
// }

// Skeleton Card
function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="h-44 w-full rounded-none" />
      <CardContent className="p-4 space-y-3 flex-1">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <div className="pt-0 border-t mx-4 my-4 border-border/50">
        <div className="flex justify-between w-full pt-4 gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-10" />
        </div>
      </div>
    </Card>
  );
}

// Event Card Component
function EventCard({ event }: { event: Event }) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const { setSelectedEvent } = useEventStore();
  // const statusConfig = getStatusConfig(event.status);
  // const StatusIcon = statusConfig.icon;

  const formattedDate = event.start_date
    ? format(new Date(event.start_date), "MMM dd, yyyy")
    : "TBA";
  const formattedTime = event.start_date
    ? format(new Date(event.start_date), "hh:mm a")
    : "";

  // Parse categories
  const categories: string[] = Array.isArray(event.category)
    ? event.category
    : typeof event.category === "string"
      ? (event.category as string)
        .split(",")
        .map((tag: string) => tag.trim().replace(/[\[\]"'{}]/g, ""))
      : [];

  const handleViewDetail = () => {
    setSelectedEvent(event);
    router.push(`/events/eventdetails?id=${event.id}`);
  };

  // const handleEdit = () => {
  //   setSelectedEvent(event);
  //   router.push(`/events/edit?id=${event.id}`);
  // };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full border-gray-200 py-0">
      {/* Image */}
      <div className="relative overflow-hidden bg-muted">
        <Image
          src={event.banner_image || "/placeholder.png"}
          alt={event.title}
          width={100}
          height={100}
          className="object-cover w-full aspect-16/10 group-hover:scale-105 transition-transform duration-300"
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {/* <Badge
            variant={statusConfig.variant}
            className={`gap-1 px-2.5 py-1 backdrop-blur-md shadow-sm border-white/20 ${statusConfig.className}`}
          >
            <StatusIcon weight="duotone" className="w-3.5 h-3.5" />
            {statusConfig.label}
          </Badge> */}
          <EventStatusBadge status={event.status} />
        </div>
        {/* Featured Badge */}
        {event.is_featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white text-sm text-shadow-md border-white/20 shadow-sm">
              <CrownIcon weight="fill" className="size-4!" />
              {t("events.badge.featured", "Featured")}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-5 flex flex-col flex-1 pb-4">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categories.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-normal text-muted-foreground bg-muted/50 border-border whitespace-pre-wrap break-all max-w-full rounded-xl"
              >
                {tag}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs font-normal text-muted-foreground bg-muted/50 border-border whitespace-pre-wrap break-all max-w-full  rounded-xl"
              >
                +{categories.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <CalendarBlankIcon
              weight="duotone"
              className="w-4 h-4 text-muted-foreground/70 shrink-0"
            />
            <span className="truncate">
              {formattedDate}{" "}
              <span className="text-muted-foreground/40">•</span> {formattedTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon
              weight="duotone"
              className="w-4 h-4 text-muted-foreground/70 shrink-0"
            />
            <span className="truncate">
              {event.address || event.venue_name || "Location TBA"}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        {
          event.status !== "rejected" && (
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4 bg-muted/30 p-2 rounded-lg border border-border/50">
              {/* <div className="flex items-center gap-1.5" title="Capacity">
            <UsersIcon
              weight="duotone"
              className="w-4 h-4 text-muted-foreground/70"
            />
            <span className="font-medium">{event.capacity || 0}</span>
          </div>
          <div className="w-px h-4 bg-border" /> */}
              <div title="Titckets Sold">
                <div className="flex items-center gap-2">
                  <TicketIcon
                    weight="duotone"
                    className="w-4 h-4 text-muted-foreground/70"
                  />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold leading-none">
                    Tickets Sold
                  </span>
                </div>
                <span className="font-medium">{event.capacity - event.available} / {event.capacity}</span>
              </div>
              {(event.status === "live" || event.status === "approved" || event.status === "pending") && (
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold leading-none mb-1">
                      Commission
                    </span>
                    <div className="flex items-center gap-0.5 text-emerald-600 font-bold">
                      <span>{event.commission_rate || 0}%</span>
                    </div>
                  </div>
                  <div className="w-px h-6 bg-border/60" />
                  {/* <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold leading-none mb-1">
                      Est. Earnings
                    </span>
                    <span className="text-emerald-700 font-bold">
                      {event.tiers?.[0]?.currency || "NPR"}{" "}
                      {((((event.capacity || 0) - (event.available || 0)) * (event.price || 0)) *
                        ((event.commission_rate || 0) / 100)).toFixed(2)}
                    </span>
                  </div> */}
                </div>
              )}
            </div>)
        }

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <Button
            variant="default"
            className="flex-1 gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
            onClick={handleViewDetail}
          >
            <EyeIcon weight="duotone" className="w-4 h-4" />
            {t("events.details")}
          </Button>
          {/* <Button
            variant="outline"
            size="icon"
            className="hover:text-primary hover:border-primary/50"
            onClick={handleEdit}
            title="Edit Event"
          >
            <PencilSimpleIcon weight="duotone" className="w-4 h-4" />
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}

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

// Filter Dropdown
function StatusFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] bg-background">
        <SelectValue placeholder={t("events.allStatus")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("events.allStatus")}</SelectItem>
        <SelectItem value="pending">{t("status.pending")}</SelectItem>
        <SelectItem value="approved">{t("status.approved")}</SelectItem>
        <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
        <SelectItem value="draft">{t("status.draft")}</SelectItem>
        <SelectItem value="live">{t("status.live")}</SelectItem>
        <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
      </SelectContent>
    </Select>
  );
}

// Organizer Filter
// function OrganizerFilter({
//   value,
//   onChange,
// }: {
//   value: string;
//   onChange: (value: string) => void;
// }) {
//   const { locale } = useLanguageStore();
//   const { t } = useTranslation(locale);

//   const { data: organizersData, isLoading } = useQuery({
//     queryKey: queryKeys.organizers.all({ all_approved: true }),
//     queryFn: () => OrganizerService.getOrganizers({ all_approved: true }),
//   });

//   const organizers = organizersData?.organizers || [];

//   return (
//     <Select value={value || "all"} onValueChange={onChange} disabled={isLoading}>
//       <SelectTrigger className="w-[200px] bg-background">
//         <SelectValue placeholder={isLoading ? t("common.loading") : t("events.filterByOrganizer", "Filter by Organizer")} />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="all">{t("events.allOrganizers", "All Organizers")}</SelectItem>
//         {organizers.map((organizer) => (
//           <SelectItem key={organizer.id} value={organizer.id}>
//             {organizer.onboarding?.business_name || `${organizer.first_name} ${organizer.last_name}`}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// }

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
    [router, searchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page === 1 ? null : page.toString() });
    },
    [updateParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams({ search: value, page: null });
    },
    [updateParams]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      updateParams({ status: value, page: null });
    },
    [updateParams]
  );

  // const handleClearOrganizerFilter = useCallback(() => {
  //   updateParams({ organizer_id: null, page: null });
  // }, [updateParams]);

  // const handleOrganizerChange = useCallback(
  //   (value: string) => {
  //     updateParams({ organizer_id: value === "all" ? null : value, page: null });
  //   },
  //   [updateParams]
  // );

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
        event.address?.toLowerCase().includes(query)
    );
  }, [response?.events, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (isError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center text-destructive">
          <p className="text-lg font-medium">{t("events.failedToLoadEvents")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {(error as Error)?.message || t("events.pleaseTryAgainLater")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6 @container">
      {/* Organizer Filter Banner */}
      {/* {organizerId && (
        <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-blue-700">
            {t("events.showingEventsForOrganizer")}:{" "}
            <strong>{organizerId}</strong>
          </p>
          <Button
            variant="link"
            onClick={handleClearOrganizerFilter}
            className="text-blue-600 hover:text-blue-800 h-auto p-0"
          >
            {t("events.clearFilter")}
          </Button>
        </div>
      )} */}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <MagnifyingGlassIcon
            weight="duotone"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder={t("events.searchEvents")}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* <OrganizerFilter
            value={organizerId}
            onChange={handleOrganizerChange}
          /> */}
          <StatusFilter value={statusFilter} onChange={handleStatusChange} />
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
