"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useEventStore } from "@/store/eventStore";
import {
  usePendingEvents,
  useApproveEvent,
  useRejectEvent,
} from "@/hooks/useDashboard";
import { EventCard } from "./EventCard";
import { EmptyState } from "../EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import PopupModal from "./PopupModal";
import { Event } from "@/types/event";

interface ModalState {
  open: boolean;
  id?: string;
}

const ListItemSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 px-4 py-3 border-gray-100 border-b last:border-b-0">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 w-full flex flex-col items-center sm:items-start gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="w-full sm:w-auto flex justify-center sm:justify-end">
        <Skeleton className="h-9 w-[280px]" />
      </div>
    </div>
  );
};

const EventApprovalList = () => {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const setSelectedEvent = useEventStore((state) => state.setSelectedEvent);

  // Modal state
  const [rejectEventModal, setRejectEventModal] = useState<ModalState>({ open: false });
  const [acceptEventModal, setAcceptEventModal] = useState<ModalState>({ open: false });

  // TanStack Query hooks
  const { data: pendingEventsData, isLoading: isLoadingEvents } = usePendingEvents();

  // Mutation hooks
  const approveEventMutation = useApproveEvent();
  const rejectEventMutation = useRejectEvent();

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    router.push(`/events/eventdetails?id=${event.id}`);
  };

  const handleApproveEvent = (data: { commissionRate?: number; adminRemark: string }) => {
    if (!acceptEventModal.id) return;

    if (!data.commissionRate) {
      toast.error(t("dashboard.toast.commissionRequired"));
      return;
    }

    approveEventMutation.mutate(
      {
        eventId: acceptEventModal.id,
        adminRemark: data.adminRemark,
        commissionRate: data.commissionRate,
      },
      {
        onSuccess: () => {
          toast.success(t("dashboard.toast.eventApproved"));
          setAcceptEventModal({ open: false });
        },
      }
    );
  };

  const handleRejectEvent = (data: { adminRemark: string }) => {
    if (!rejectEventModal.id) return;

    rejectEventMutation.mutate(
      { eventId: rejectEventModal.id, adminRemark: data.adminRemark },
      {
        onSuccess: () => {
          toast.success(t("dashboard.toast.eventRejected"));
          setRejectEventModal({ open: false });
        },
      }
    );
  };

  const events = pendingEventsData?.events || [];

  return (
    <>
      <div className="bg-white @container rounded-2xl glass-card-lower border border-gray-100/50 mt-8">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-medium text-muted-foreground">
            {t("dashboard.eventsAwaitingApproval")}
          </h2>
        </div>

        <div>
          {isLoadingEvents ? (
            <div className="space-y-0">
              {[1, 2, 3].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-0">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={handleViewEvent}
                  onApprove={(id) => setAcceptEventModal({ open: true, id })}
                  onReject={(id) => setRejectEventModal({ open: true, id })}
                  isApproving={approveEventMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("dashboard.noEventsAwaitingApproval")}
              message={t("dashboard.noEventsAwaitingApprovalMessage")}
            />
          )}
        </div>
      </div>

      {/* Reject Event Modal */}
      {rejectEventModal.open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setRejectEventModal({ open: false })}
          />
          <PopupModal
            title={t("dashboard.modal.rejectEvent")}
            isApprove={false}
            showCommissionInput={false}
            isLoading={rejectEventMutation.isPending}
            onCancel={() => setRejectEventModal({ open: false })}
            onConfirm={handleRejectEvent}
          />
        </>
      )}

      {/* Approve Event Modal */}
      {acceptEventModal.open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setAcceptEventModal({ open: false })}
          />
          <PopupModal
            title={t("dashboard.modal.approveEvent")}
            isApprove={true}
            showCommissionInput={true}
            isLoading={approveEventMutation.isPending}
            onCancel={() => setAcceptEventModal({ open: false })}
            onConfirm={handleApproveEvent}
            eventName={events.find((e) => e.id === acceptEventModal.id)?.title}
            eventDetails={events.find((e) => e.id === acceptEventModal.id)}
          />
        </>
      )}
    </>
  );
};

export default EventApprovalList;
