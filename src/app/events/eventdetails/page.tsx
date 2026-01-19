"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EventService } from "@/lib/eventServices";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  CalendarBlank as CalendarBlankIcon,
  MapPin as MapPinIcon,
  Ticket as TicketIcon,
  Users as UsersIcon,
  Fire as FireIcon,
  ArrowClockwise as ArrowClockwiseIcon,
  Trash as TrashIcon,
  ArrowUpLeft as ArrowUpLeftIcon,
  Clock as ClockIcon,
  Check as CheckIcon,
  X as XIcon,
  XCircle as XCircleIcon,
  ShieldCheck as ShieldCheckIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";
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
import PopupModal from "../../dashboard/components/PopupModal";
import StatusHistorySidebar from "./components/StatusHistorySidebar";

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
      EventService.approveEvent(eventId!, data),
    onSuccess: (data) => {
      toast.success(t("events.messages.approveSuccess", "Event approved successfully"));
      queryClient.setQueryData(queryKeys.events.detail(eventId!), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.statusHistory(eventId!) });
      setShowRejectModal(false);
    },
    onError: () => toast.error(t("events.messages.actionError", "Failed to perform action")),
  });

  const cancelMutation = useMutation({
    mutationFn: (data: { adminRemark: string }) =>
      EventService.cancelEvent(eventId!, { reason: data.adminRemark }),
    onSuccess: (updatedEvent) => {
      toast.success(t("events.messages.cancelSuccess", "Event cancelled successfully"));
      queryClient.setQueryData(queryKeys.events.detail(eventId!), updatedEvent);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.statusHistory(eventId!) });
      setShowCancelModal(false);
    },
    onError: () => toast.error(t("events.messages.actionError", "Failed to perform action")),
  });

  const deleteMutation = useMutation({
    mutationFn: () => EventService.deleteEvent(eventId!),
    onSuccess: () => {
      toast.success(t("events.messages.deleteSuccess", "Event deleted successfully"));
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      router.push("/events");
    },
    onError: () => toast.error(t("events.messages.deleteError", "Failed to delete event")),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: () => EventService.toggleFeatured(eventId!, !event?.is_featured),
    onSuccess: (updatedEvent) => {
      const isFeatured = updatedEvent.is_featured;
      toast.success(
        isFeatured
          ? t("events.messages.featuredSuccess", "Event marked as featured!")
          : t("events.messages.unfeaturedSuccess", "Event removed from featured")
      );
      queryClient.setQueryData(queryKeys.events.detail(eventId!), updatedEvent);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
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


  const statusConfig: {
    label: string;
    color: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  } = {
    label: event.status,
    color: "",
    variant: "default"
  };

  switch (event.status) {
    case "pending":
      statusConfig.color = "bg-amber-100 text-amber-700 hover:bg-amber-100";
      statusConfig.variant = "secondary";
      break;
    case "approved":
      statusConfig.color = "bg-green-100 text-green-700 hover:bg-green-100";
      statusConfig.variant = "secondary";
      break;
    case "rejected":
    case "cancelled":
      statusConfig.color = "bg-red-100 text-red-700 hover:bg-red-100";
      statusConfig.variant = "destructive";
      break;
    default:
      statusConfig.color = "bg-gray-100 text-gray-700 hover:bg-gray-100";
      statusConfig.variant = "secondary";
  }



  const sold = analytics?.sold_tickets || 0;
  const capacity = analytics?.total_tickets || event.capacity || 0;

  // Prevent division by zero
  const progress = capacity > 0 ? (sold / capacity) * 100 : 0;
  const revenue = analytics?.revenue || 0;

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
              <Badge variant={statusConfig.variant} className={`capitalize flex items-center gap-1.5 px-3 py-1 ${statusConfig.color}`}>
                <span className="w-2 h-2 rounded-full bg-current opacity-75" />
                {event.status}
              </Badge>
              {event.sales_status && (
                <Badge variant="outline" className="capitalize bg-white flex items-center gap-1.5 px-3 py-1">
                  {event.sales_status}
                </Badge>
              )}
              <div className="flex gap-4 flex-wrap ml-2">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <CalendarBlankIcon size={16} weight="duotone" />
                  <span>{format(new Date(event.start_date), "MMM dd, yyyy")}</span>
                  <span className="text-gray-300">|</span>
                  <ClockIcon size={16} weight="duotone" />
                  <span>{format(new Date(event.start_date), "h:mm a")}</span>
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
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                >
                  <CheckIcon weight="bold" className="w-4 h-4" />
                  {t("events.actions.approve", "Approve")}
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  variant="destructive"
                  className="gap-2 shadow-sm"
                >
                  <XIcon weight="bold" className="w-4 h-4" />
                  {t("events.actions.reject", "Reject")}
                </Button>
              </>
            )}

            {(event.status === 'approved' || event.status === 'live') && !event.is_cancelled && (
              <Button
                onClick={() => setShowCancelModal(true)}
                variant="destructive"
              >
                <XCircleIcon weight="duotone" className="w-4 h-4" />
                {t("events.actions.cancelEvent", "Cancel Event")}
              </Button>
            )}

            {(event.status === 'cancelled' || event.is_cancelled) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
                  >
                    <TrashIcon weight="duotone" className="w-4 h-4" />
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
            <div className="rounded-2xl overflow-hidden relative h-64 md:h-80 lg:h-96 shadow-sm bg-gray-100 border border-gray-100">
              <Image
                src={event.banner_image || "/placeholder.jpg"}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              {event.is_featured && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 shadow-lg border-orange-400/50 px-3 py-1">
                    <FireIcon weight="fill" className="w-3.5 h-3.5" />
                    {t("events.fields.featured", "Featured")}
                  </Badge>
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6">
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
                    <p className="font-medium text-gray-900">{format(new Date(event.start_date), "PPpp")}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">{t("events.fields.eventEndsOn", "Event Ends On")}</h4>
                    <p className="font-medium text-gray-900">{format(new Date(event.end_date), "PPpp")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">

            {/* Ticket Analytics (Renamed from Ticket Tiers as in Organizer, but retaining our logic) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TicketIcon weight="duotone" className="w-5 h-5 text-gray-500" />
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
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">{t("events.analytics.sold", "Sold")}</p>
                    <p className="text-lg font-bold text-blue-700">{sold}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-600 mb-1">{t("events.analytics.revenue", "Revenue")}</p>
                    <p className="text-lg font-bold text-emerald-700">
                      {new Intl.NumberFormat(locale === 'ja' ? 'ja-JP' : locale === 'it' ? 'it-IT' : 'en-US', {
                        style: 'currency',
                        currency: 'NPR',
                        maximumFractionDigits: 0
                      }).format(revenue)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{t("events.fields.price", "Price per Ticket")}</span>
                    <span className="font-medium">{event.price} NPR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions / Featured */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("events.sections.quickActions", "Quick Actions")}</h2>
              <div className="space-y-4">
                {/* Featured Toggle Switch */}
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                      <FireIcon weight="duotone" className="w-4 h-4 text-primary-600" />
                    </div>
                    <Label htmlFor="featured-switch" className="text-sm font-medium text-gray-700 cursor-pointer">
                      {t("events.fields.featured", "Featured")}
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
                    <UsersIcon weight="duotone" className="w-4 h-4" />
                    {t("events.actions.viewOrganizer", "View Organizer")}
                  </Button>
                )}
              </div>
            </div>

            {/* Status History */}
            <StatusHistorySidebar
              history={statusHistory || []}
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
      {showCancelModal && (
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
      )}

    </div>
  );
}
