"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MagnifyingGlass,
  Funnel,
  CaretLeft,
  CaretRight,
  Phone,
  Buildings,
  CalendarBlank,
  UserCheck,
  UserMinus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Ticket,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { OrganizerService, Organizer, OrganizerListResponse } from "@/lib/organizerService";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
        className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
        icon: CheckCircle,
        label: "Approved",
      };
    case "pending":
      return {
        variant: "secondary" as const,
        className: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
        icon: Clock,
        label: "Pending",
      };
    case "rejected":
      return {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
        icon: XCircle,
        label: "Rejected",
      };
    case "inactive":
      return {
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
        icon: UserMinus,
        label: "Inactive",
      };
    default:
      return {
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
        icon: Clock,
        label: status || "Unknown",
      };
  }
}

function getAccountStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        className: "bg-emerald-500 text-white hover:bg-emerald-600 border-transparent",
        label: "Active",
      };
    case "inactive":
      return {
        className: "bg-gray-500 text-white hover:bg-gray-600 border-transparent",
        label: "Inactive",
      };
    case "suspended":
      return {
        className: "bg-red-500 text-white hover:bg-red-600 border-transparent",
        label: "Suspended",
      };
    default:
      return {
        className: "bg-gray-500 text-white hover:bg-gray-600 border-transparent",
        label: status || "Unknown",
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
          {/* Assuming we might have an image url in the future, simpler to use fallback for now */}
          <AvatarFallback className="text-xl font-bold bg-linear-to-br from-indigo-50 to-blue-50 text-indigo-600">
            {getInitials(organizer.first_name, organizer.last_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-gray-900 truncate pr-1 group-hover:text-primary transition-colors">
              {organizer.first_name} {organizer.last_name}
            </h3>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase font-bold shrink-0 ${accountStatusConfig.className}`}
            >
              {accountStatusConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate font-medium" title={organizer.email}>
            {organizer.email}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 pb-4">
        {/* Status Line */}
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
            <Badge
              variant={statusConfig.variant}
              className={`gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${statusConfig.className}`}
            >
              <StatusIcon weight="duotone" className="w-3.5 h-3.5" />
              {statusConfig.label}
            </Badge>
          </div>
          {organizer.is_email_verified && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100 gap-1 px-2 py-0.5" title="Email Verified">
              <UserCheck weight="duotone" className="w-3.5 h-3.5" />
              Verified
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-1 text-sm text-muted-foreground">
          {organizer.phone && (
            <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Phone weight="duotone" className="w-4 h-4" />
              </div>
              <span className="font-medium truncate">
                {organizer.country_code} {organizer.phone}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <CalendarBlank weight="duotone" className="w-4 h-4" />
            </div>
            <span className="font-medium">Joined {formattedDate}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => router.push(`/organisers/detail?id=${organizer.id}`)}
        >
          <Eye weight="duotone" className="w-4.5 h-4.5" />
          Profile
        </Button>
        <Button
          className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() =>
            router.push(`/events?organizer_id=${organizer.id}`)
          }
        >
          <Ticket weight="duotone" className="w-4.5 h-4.5" />
          Events
        </Button>
      </CardFooter>
    </Card>
  );
}

// Empty State Component
function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-muted-foreground">
      <div className="w-20 h-20 rounded-full bg-muted shadow-sm border border-border flex items-center justify-center mb-6">
        <Buildings weight="duotone" className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No organisers found
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center">
        {searchQuery
          ? "Try adjusting your search terms or filters"
          : "No organisers have registered yet."}
      </p>
    </div>
  );
}

export default function OrganisersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Data Fetching with Pagination
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery<OrganizerListResponse>({
    queryKey: ["organizers", currentPage, itemsPerPage],
    queryFn: () => OrganizerService.getOrganizers({ page: currentPage, limit: itemsPerPage }),
  });

  const organizers = response?.organizers || [];

  // Filter organizers based on search query (Client-side filtering for now as API might not support search)
  // Note: If backend supports search, we should push this to the API too.
  const filteredOrganizers = useMemo(() => {
    if (!searchQuery.trim()) return organizers;

    const query = searchQuery.toLowerCase();
    return organizers.filter(
      (org) =>
        org.first_name?.toLowerCase().includes(query) ||
        org.last_name?.toLowerCase().includes(query) ||
        org.email?.toLowerCase().includes(query) ||
        org.phone?.includes(query)
    );
  }, [organizers, searchQuery]);

  // Pagination Logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const totalItems = response?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentOrganizers = filteredOrganizers;

  useEffect(() => {
    // Check pagination logic if search is implemented
  }, [searchQuery]);

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-destructive">
          <p className="text-lg font-medium">Failed to load organisers</p>
          <p className="text-sm text-muted-foreground mt-1">
            {(error as Error)?.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass weight="duotone" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search organisers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 backdrop-blur-sm"
          />
        </div>

        <Button variant="outline" className="gap-2 bg-background/80 backdrop-blur-sm">
          <Funnel weight="duotone" className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <OrganizerCardSkeleton key={i} />
          ))
        ) : currentOrganizers.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          currentOrganizers.map((organizer) => (
            <OrganizerCard key={organizer.id} organizer={organizer} />
          ))
        )}
        </div>

        {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <CaretLeft weight="bold" className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
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
            className="gap-2"
          >
            Next
            <CaretRight weight="bold" className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Results summary */}
      {!isLoading && filteredOrganizers.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
          {totalItems} organisers
        </div>
      )}
    </div>
  );
}
