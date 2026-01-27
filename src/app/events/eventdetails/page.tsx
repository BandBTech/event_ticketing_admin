"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EventService, EventTierAnalytics } from "@/lib/eventServices";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { format, isValid } from "date-fns";
import { toast } from "sonner";
import { useEventStatusHistory, useEventAnalyticsById } from "@/hooks/useEvents";
import { queryKeys } from "@/lib/queryKeys";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Admin Components
import PopupModal from "../../dashboard/components/EventApproval/PopupModal";
import StatusHistorySidebar from "./components/StatusHistorySidebar";
import { SalesStatusBadge } from "@/app/components/SalesStatusBadge";
import { EventStatusBadge } from "@/app/components/EventStatusBadge";
import { CalendarBlankIcon, CheckIcon, ClockIcon, CurrencyCircleDollarIcon, CurrencyDollarIcon, FireIcon, MapPinIcon, ShieldCheckIcon, TicketIcon, TrashIcon, UsersIcon, XCircleIcon, XIcon } from "@phosphor-icons/react";
import { formatDateTime } from "@/lib/utils";

export default function EventDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();

  // Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Queries
  const { data: event, isLoading, error } = useQuery({
    queryKey: queryKeys.events.detail(eventId || ""),
    queryFn: () => EventService.getEventById(eventId!),
    enabled: !!eventId,
  });

  const { data: statusHistory, isLoading: isLoadingHistory } = useEventStatusHistory(eventId || "");
  const { data: analytics, isLoading: analyticsLoading } = useEventAnalyticsById(eventId || "");
  // Note: useEventAnalytics fetches list, not single event details usually, but assuming user request context. 
  // If analytics endpoint is global, we might not get per-event stats here unless filtered.
  // For now we use event.capacity/available logic as before for "Ticket Analytics".

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (data: { commissionRate: number; adminRemark: string }) =>
      EventService.approveEvent({
        eventId: eventId!,
        admin_remark: data.adminRemark,
        status: 'approved',
        commission_rate: data.commissionRate
      }),
    onSuccess: (data) => {
      toast.success(t("events.messages.approveSuccess", "Event approved successfully"));
      queryClient.setQueryData(queryKeys.events.detail(eventId!), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.statusHistory(eventId!) });
      setShowApproveModal(false);
    },
    onError: () => toast.error(t("events.messages.actionError", "Failed to perform action")),
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { adminRemark: string }) =>
      EventService.rejectEvent(eventId!, data),
    onSuccess: (data) => {
      toast.success(t("events.messages.rejectSuccess", "Event rejected successfully"));
      queryClient.setQueryData(queryKeys.events.detail(eventId!), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.statusHistory(eventId!) });
      setShowRejectModal(false);
    },
    onError: () => toast.error(t("events.messages.actionError", "Failed to perform action")),
  });

  // const cancelMutation = useMutation({
  //   mutationFn: (data: { adminRemark: string }) =>
  //     EventService.cancelEvent(eventId!, data.adminRemark),
  //   onSuccess: (updatedEvent) => {
  //     toast.success(t("events.messages.cancelSuccess", "Event cancelled successfully"));
  //     queryClient.setQueryData(queryKeys.events.detail(eventId!), updatedEvent);
  //     queryClient.invalidateQueries({ queryKey: queryKeys.events.list });
  //     queryClient.invalidateQueries({ queryKey: queryKeys.events.statusHistory(eventId!) });
  //     setShowCancelModal(false);
  //   },
  //   onError: () => toast.error(t("events.messages.actionError", "Failed to perform action")),
  // });

  const deleteMutation = useMutation({
    mutationFn: () => EventService.deleteEvent(eventId!),
    onSuccess: () => {
      toast.success(t("events.messages.deleteSuccess", "Event deleted successfully"));
      queryClient.invalidateQueries({ queryKey: queryKeys.events.list });
      router.push("/events");
    },
    onError: () => toast.error(t("events.messages.deleteError", "Failed to delete event")),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: () => EventService.toggleFeatured(eventId!, !event?.is_featured),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.events.detail(eventId!), {
        ...event,
        is_featured: !event?.is_featured,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId!) });
    },
    onError: () => toast.error(t("events.messages.featuredError", "Failed to update featured status")),
  });


  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl my-8 mx-6">
        <h3 className="text-red-800 font-semibold text-lg">{t("common.error", "Error")}</h3>
        <p className="text-red-600 mt-2">{t("events.messages.loadError", "Failed to load event details")}</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4 bg-white">
          {t("events.eventDetails.backToEvents", "Back to Events")}
        </Button>
      </div>
    );
  }



  const totalTicketsSold = analytics?.sold_seats ??
    (event.tiers?.reduce((sum, ticket) => sum + (ticket.sold || 0), 0) || 0);
  const totalCapacity = analytics?.total_seats ??
    (event.tiers?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0);
  const totalRevenue = analytics?.total_revenue ??
    (event.tiers?.reduce((sum, ticket) => sum + ((ticket.sold || 0) * ticket.price), 0) || 0);


  const firstTier = event.tiers?.[0];
  const salesStartDate = firstTier?.sales_start
    ? formatDateTime(firstTier.sales_start)
    : 'Not set';
  const salesEndDate = firstTier?.sales_end
    ? formatDateTime(firstTier.sales_end)
    : 'Not set';

  // Prevent division by zero for progress
  const progress = totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0;

  interface StatusHistoryItem {
    id: string;
    event_id: string;
    from_status?: string;
    old_status?: string;
    to_status?: string;
    new_status?: string;
    status_type?: string;
    reason?: string;
    remark?: string;
    changed_by: string;
    changed_by_name?: string;
    created_at: string;
  }

  // Ensure statusHistory is an array
  const historyList = Array.isArray(statusHistory)
    ? statusHistory
    : statusHistory && typeof statusHistory === 'object' && 'history' in statusHistory && Array.isArray((statusHistory as { history: unknown[] }).history)
      ? (statusHistory as { history: unknown[] }).history
      : [];

  const mappedStatusHistory = (historyList as StatusHistoryItem[]).map((h) => ({
    id: h.id,
    event_id: h.event_id,
    old_status: h.from_status || h.old_status || 'unknown',
    new_status: h.to_status || h.new_status || 'unknown',
    status_type: h.status_type || 'approval',
    remark: h.reason || h.remark || '',
    changed_by: h.changed_by,
    changed_by_name: h.changed_by_name || h.changed_by || 'Unknown',
    created_at: h.created_at
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <div className="grow p-6 space-y-6 container mx-auto max-w-7xl">

        {/* Header - Matching Organizer Layout */}
        <div className="flex flex-col flex-wrap gap-4 md:items-start md:justify-between lg:flex-row">
          <div className="space-y-3">
            {/* <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-gray-500 hover:text-gray-900">
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                {t("common.back", "Back")}
              </Button>
            </div> */}
            <h1 className="text-3xl text-gray-900 font-bold tracking-tight">
              {event.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
              <EventStatusBadge status={event.status} />
              {event.sales_status && (
                <SalesStatusBadge status={event.sales_status} />
              )}
              <div className="flex gap-4 flex-wrap ml-2">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <CalendarBlankIcon size={16} weight="duotone" />
                  <span suppressHydrationWarning>
                    {isValid(new Date(event.start_date))
                      ? format(new Date(event.start_date), "MMM dd, yyyy")
                      : "TBD"}
                  </span>
                  <span className="text-gray-300">|</span>
                  <ClockIcon size={16} weight="duotone" />
                  <span suppressHydrationWarning>
                    {isValid(new Date(event.start_date))
                      ? format(new Date(event.start_date), "h:mm a")
                      : "--:--"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPinIcon size={16} weight="duotone" />
                  <span>{event.address || event.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="flex flex-col md:flex-row gap-3">
            {event.status === 'pending' && (
              <>
                <Button
                  onClick={() => setShowApproveModal(true)}
                  className="gap-2 bg-success hover:bg-success/90 text-white shadow-sm"
                >
                  <CheckIcon weight="duotone" size={18} />
                  {t("events.actions.approve", "Approve")}
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  variant="destructive"
                  className="gap-2 shadow-sm"
                >
                  <XIcon weight="duotone" size={18} />
                  {t("events.actions.reject", "Reject")}
                </Button>
              </>
            )}

            {/* {(event.status === 'approved' || event.status === 'live') && !event.is_cancelled && (
              <Button
                onClick={() => setShowCancelModal(true)}
                variant="destructive"
              >
                <XCircleIcon weight="duotone" size={18} />
                {t("events.actions.cancelEvent", "Cancel Event")}
              </Button>
            )} */}

            {(event.status === 'cancelled' || event.is_cancelled) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 text-600 hover:bg-red-50 hover:text-red-700 border-red-100"
                  >
                    <TrashIcon weight="duotone" size={18} />
                    {t("events.actions.deleteEvent", "Delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("events.modals.deleteConfirm", "Are you sure you want to delete this event?")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("events.modals.deleteDesc", "This action cannot be undone. This will permanently delete the event and remove detailed data from our servers.")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {t("common.delete", "Delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Admin Remark Section - if exists */}
        {event.admin_remark && (
          <div className={`p-4 rounded-xl border ${event.status === 'approved' ? 'bg-green-50 border-green-200 text-green-800' :
            event.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-gray-50 border-gray-200 text-gray-800'
            }`}>
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <ShieldCheckIcon weight="duotone" className="w-5 h-5" />
              {t("common.remark", "Remarks")}
            </h3>
            <p className="text-sm opacity-90">{event.admin_remark}</p>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Banner Image */}
            <div className="glass-card-lowest rounded-2xl overflow-hidden relative aspect-16/10">
              <Image
                src={event.banner_image || "/placeholder.jpg"}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              {event.is_featured && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-orange-400 hover:bg-orange-600 text-white gap-1.5 shadow-lg border-orange-400/50 px-3 py-1">
                    <FireIcon weight="duotone" size={18} />
                    {t("events.fields.featured", "Featured")}
                  </Badge>
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="glass-card-lowest rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("events.sections.description", "Event Description")}</h3>
                <div
                  className="prose prose-gray max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: event.description || "" }}
                />
              </div>

              {/* Categories / Tags */}
              {event.category && event.category.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t("events.fields.tags", "Tags")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(event.category)
                      ? (event.category as string[])
                      : typeof event.category === "string"
                        ? (event.category as string).split(",")
                        : []
                    )
                      .map((tag) => tag.trim().replace(/^[{"]+|[}"]+$/g, ""))
                      .filter(Boolean)
                      .map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">{t("events.fields.venueName", "Venue Name")}</h4>
                    <p className="font-medium text-gray-900">{event.venue_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">{t("events.fields.location", "Location")}</h4>
                    <p className="font-medium text-gray-900">{event.location || event.address}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">{t("events.fields.eventStartsOn", "Event Starts On")}</h4>
                    <p className="font-medium text-gray-900" suppressHydrationWarning>
                      {isValid(new Date(event.start_date))
                        ? format(new Date(event.start_date), "PPpp")
                        : "TBD"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">{t("events.fields.eventEndsOn", "Event Ends On")}</h4>
                    <p className="font-medium text-gray-900" suppressHydrationWarning>
                      {isValid(new Date(event.end_date))
                        ? format(new Date(event.end_date), "PPpp")
                        : "TBD"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">


            {/* Financial Details */}
            <div className="glass-card-lower rounded-2xl p-6 border border-green-300! bg-green-100/40!">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CurrencyCircleDollarIcon weight="duotone" className="w-5 h-5 text-gray-500" />
                {t("events.sections.financialDetails", "Financial Details")}
              </h2>
              <div className="space-y-0">
                {event.commission_rate > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 text-sm">{t("events.fields.commission", "Commission Rate")}</span>
                    <Badge variant="secondary" className="bg-emerald-600 text-white border-emerald-100 px-3 py-1 text-sm">
                      {event.commission_rate}%
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-500 text-sm">{t("events.sections.totalEarnings", "Total Earnings")}</span>
                  <span className="font-semibold text-emerald-700 text-lg">
                    {event.commission_rate && totalRevenue && analytics?.tiers[0].currency && `${Math.round(Number(totalRevenue) * (1 - event.commission_rate / 100), 2)} ${analytics?.tiers[0].currency} `}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Analytics (Renamed from Ticket Tiers as in Organizer, but retaining our logic) */}
            <div className="glass-card-lower rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {t("events.sections.ticketAnalytics", "Ticket Analytics")}
              </h2>
              <div className="space-y-6">
                {/* Sales Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{t("events.analytics.progress", "Sales Progress")}</span>
                    <span className="font-medium text-gray-900">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">{t("event.label.totalSold", "Total Sold")}</p>
                    <p className="text-lg font-bold text-blue-700">{totalTicketsSold}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-600 mb-1">{t("event.label.totalRevenue", "Revenue")}</p>
                    <p className="text-lg font-bold text-emerald-700">
                      {event.tiers?.[0]?.currency || 'NPR'} {totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Tiers List */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900">{t("event.section.ticketTiers", "Ticket Tiers")}</h3>
                  {analytics?.tiers ? (
                    analytics.tiers.map((tier: EventTierAnalytics, index: number) => {
                      const soldPercent = tier.total_seats > 0 ? (tier.sold_seats / tier.total_seats) * 100 : 0;
                      return (
                        <div key={tier.tier_id} className="space-y-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{tier.tier_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-emerald-600">
                                {tier.currency || 'NPR'} {tier.revenue.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(soldPercent, 100)}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-600">
                              <span>{tier.sold_seats} / {tier.total_seats} {t("common.sold", "sold")}</span>

                              <p className="text-xs text-gray-500">
                                {tier.currency || 'NPR'} {tier.price.toLocaleString()} / {t("common.ticket", "ticket")}
                              </p>
                            </div>

                          </div>
                        </div>
                      );
                    })
                  ) : (
                    event.tiers?.map((tier, index) => {
                      const sold = tier.sold || 0;
                      const soldPercent = tier.quantity > 0 ? (sold / tier.quantity) * 100 : 0;
                      const tierRevenue = sold * tier.price;

                      return (
                        <div key={tier.id} className="space-y-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{tier.tier_name}</p>
                              <p className="text-xs text-gray-500">
                                {tier.currency || 'NPR'} {tier.price.toLocaleString()} / {t("common.ticket", "ticket")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-emerald-600">
                                {tier.currency || 'NPR'} {tierRevenue.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-end text-xs text-gray-600">
                              <span>{sold} / {tier.quantity} {t("common.sold", "sold")}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(soldPercent, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions / Featured */}
            <div className="glass-card-lower rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("events.sections.quickActions", "Quick Actions")}</h2>
              <div className="space-y-4">
                {/* Featured Toggle Switch */}
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                      <FireIcon weight="duotone" className="w-4 h-4 text-primary-600" />
                    </div>
                    <Label htmlFor="featured-switch" className="text-sm font-medium text-gray-700 cursor-pointer">
                      {t("events.fields.markFeatured", "Mark as Featured")}
                    </Label>
                  </div>
                  <Switch
                    id="featured-switch"
                    checked={event.is_featured}
                    onCheckedChange={() => toggleFeaturedMutation.mutate()}
                    disabled={toggleFeaturedMutation.isPending}
                  />
                </div>

                {event.organizer_id && (
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2"
                    onClick={() => router.push(`/organisers/detail?id=${event.organizer_id}`)}
                  >
                    <UsersIcon weight="duotone" size={18} />
                    {t("events.actions.viewOrganizer", "View Organizer")}
                  </Button>
                )}
              </div>
            </div>

            {/* Status History */}
            <StatusHistorySidebar
              history={mappedStatusHistory}
              isLoading={isLoadingHistory}
            />

          </div>
        </div>
      </div>

      {/* Modals using generic PopupModal */}

      {/* Approve Modal */}
      {showApproveModal && (
        <PopupModal
          title={t("events.modals.approveTitle", "Approve Event")}
          isApprove={true}
          showCommissionInput={true}
          isLoading={approveMutation.isPending}
          onCancel={() => setShowApproveModal(false)}
          onConfirm={(data) => approveMutation.mutate({
            commissionRate: data.commissionRate || 0,
            adminRemark: data.adminRemark
          })}
          eventName={event.title}
          eventDetails={event}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <PopupModal
          title={t("events.modals.rejectTitle", "Reject Event")}
          isApprove={false}
          isLoading={rejectMutation.isPending}
          onCancel={() => setShowRejectModal(false)}
          onConfirm={(data) => rejectMutation.mutate({ adminRemark: data.adminRemark })}
        />
      )}

      {/* Cancel Modal (Reusing PopupModal as RejectionModal style) */}
      {/* {showCancelModal && (
        <PopupModal
          title={t("events.modals.cancelTitle", "Cancel Event")}
          isApprove={false}
          isLoading={cancelMutation.isPending}
          onCancel={() => setShowCancelModal(false)}
          onConfirm={(data) => cancelMutation.mutate({ adminRemark: data.adminRemark })}
          remarkLabel={t("events.modals.cancellationReason", "Reason for Cancellation")}
          placeholder={t("events.modals.cancellationPlaceholder", "Please provide a reason for cancelling this event...")}
          confirmText={t("events.actions.cancelEvent", "Cancel Event")}
        />
      )} */}

    </div>
  );
}
