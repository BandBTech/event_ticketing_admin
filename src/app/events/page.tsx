"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EventService } from "@/lib/eventServices";
import { Event } from "@/types/event";
import { format } from "date-fns";
import { useEventStore } from "@/store/eventStore";
import {
  MagnifyingGlass,
  Funnel,
  CalendarBlank,
  MapPin,
  PencilSimple,
  CaretLeft,
  CaretRight,
  Eye,
  Users,
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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

// Status configuration
function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return {
        variant: "secondary" as const,
        className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none",
        icon: CheckCircle,
        label: "Approved",
      };
    case "pending":
      return {
        variant: "secondary" as const,
        className: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none",
        icon: Clock,
        label: "Pending",
      };
    case "rejected":
      return {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-700 hover:bg-red-200 border-none",
        icon: XCircle,
        label: "Rejected",
      };
    case "draft":
      return {
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none",
        icon: WarningCircle,
        label: "Draft",
      };
    case "live":
      return {
        variant: "secondary" as const,
        className: "bg-green-100 text-green-700 hover:bg-green-200 border-none",
        icon: CheckCircle,
        label: "Live",
      };
    case "cancelled":
      return {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-700 hover:bg-red-200 border-none",
        icon: XCircle,
        label: "Cancelled",
      };
    default:
      return {
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none",
        icon: WarningCircle,
        label: status || "Unknown",
      };
  }
}

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
      <CardFooter className="pt-0 border-t mx-4 my-4 border-border/50">
        <div className="flex justify-between w-full pt-4 gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-10" />
        </div>
      </CardFooter>
    </Card>
  );
}

// Event Card Component
function EventCard({ event }: { event: Event }) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const { setSelectedEvent } = useEventStore();
  const statusConfig = getStatusConfig(event.status);
  const StatusIcon = statusConfig.icon;

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
      ? (event.category as string).split(",").map((tag: string) => tag.trim().replace(/[\[\]"'{}]/g, ""))
      : [];

  const handleViewDetail = () => {
    setSelectedEvent(event);
    router.push(`/events/eventdetails?id=${event.id}`);
  };

  const handleEdit = () => {
    setSelectedEvent(event);
    router.push(`/events/createevent?id=${event.id}&edit=true`);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full border-gray-200 py-0">
      {/* Image */}
      <div className="relative h-full overflow-hidden bg-muted">
        <Image
          src={event.banner_image || "/placeholder.png"}
          alt={event.title}
          width={100}
          height={100}
          className="object-cover w-full h-full aspect-16/10 group-hover:scale-105 transition-transform duration-300"
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={statusConfig.variant}
            className={`gap-1 px-2.5 py-1 backdrop-blur-md shadow-sm border-white/20 ${statusConfig.className}`}
          >
            <StatusIcon weight="duotone" className="w-3.5 h-3.5" />
            {statusConfig.label}
          </Badge>
        </div>
        {/* Featured Badge */}
        {event.is_featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white border-white/20 shadow-sm">
              Featured
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
              <Badge key={tag} variant="outline" className="text-xs font-normal text-muted-foreground bg-muted/50 border-border">
                {tag}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-muted/50 border-border">
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
            <CalendarBlank weight="duotone" className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            <span className="truncate">
              {formattedDate} <span className="text-muted-foreground/40">•</span> {formattedTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin weight="duotone" className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            <span className="truncate">
              {event.address || event.venue_name || "Location TBA"}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 bg-muted/30 p-2 rounded-lg border border-border/50">
          <div className="flex items-center gap-1.5" title="Capacity">
            <Users weight="duotone" className="w-4 h-4 text-muted-foreground/70" />
            <span className="font-medium">{event.capacity || 0}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5" title="Available">
            <Ticket weight="duotone" className="w-4 h-4 text-muted-foreground/70" />
            <span className="font-medium">{event.available || 0}</span>
          </div>
          {event.price > 0 && (
            <>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5 text-foreground font-semibold ml-auto">
                <span>NPR {event.price}</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-border flex gap-2">
          <Button
            variant="default"
            className="flex-1 gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
            onClick={handleViewDetail}
          >
            <Eye weight="duotone" className="w-4 h-4" />
            {t("events.details")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hover:text-primary hover:border-primary/50"
            onClick={handleEdit}
            title="Edit Event"
          >
            <PencilSimple weight="duotone" className="w-4 h-4" />
          </Button>
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
        <CalendarBlank weight="duotone" className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{t("events.noEventsFound")}</h3>
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

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizerId = searchParams.get("organizer_id");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.events.all(statusFilter, organizerId || undefined),
    queryFn: () =>
      EventService.getAdminEvents({
        status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
        organizer_id: organizerId || undefined,
        limit: 100,
        sort: "-created_at",
      }),
  });

  const events = response?.events || [];

  // Client-side search filtering
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;

    const query = searchQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.venue_name?.toLowerCase().includes(query) ||
        event.address?.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
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
    <div className="min-h-screen p-6 space-y-6">
      {/* Organizer Filter Banner */}
      {organizerId && (
        <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-blue-700">
            {t("events.showingEventsForOrganizer")} : <strong>{organizerId}</strong>
          </p>
          <Button
            variant="link"
            onClick={() => router.push("/events")}
            className="text-blue-600 hover:text-blue-800 h-auto p-0"
          >
            {t("events.clearFilter")}
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <MagnifyingGlass weight="duotone" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("events.searchEvents")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          <Button variant="outline" className="gap-2 bg-background">
            <Funnel weight="duotone" className="h-4 w-4" />
            {t("events.moreFilters")}
          </Button>
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
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <CaretLeft weight="bold" className="w-4 h-4" />
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
                  onClick={() => setCurrentPage(pageNumber)}
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
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            {t("pagination.next")}
            <CaretRight weight="bold" className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && filteredEvents.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-4">
          {t("pagination.showing")} {startIndex + 1}-
          {Math.min(startIndex + itemsPerPage, filteredEvents.length)} {t("pagination.of")}{" "}
          {filteredEvents.length} {t("pagination.events")}
        </div>
      )}
    </div>
  );
}
