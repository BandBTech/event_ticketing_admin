"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useEventStore } from "@/store/eventStore";
import {
  usePendingCancellationEvents,
  useApproveCancellationEvent,
  useRejectCancellationEvent,
} from "@/hooks/useDashboard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EventCard } from "./EventCard";
import { EmptyState } from "../EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import PopupModal from "./PopupModal";

interface ModalState {
  open: boolean;
  id?: string;
}

interface EventCancellation {
  id: string;
  event_id: string;
  event: {
    id: string;
    title: string;
    description: string;
    banner_image: string;
    category: string;
    event_type: string;
    venue_name: string;
    address: string;
    location: string;
    country: string;
    start_date: string;
    end_date: string;
    timezone: string;
    capacity: number;
    available: number;
    price: number;
    currency: string;
    commission_rate: number;
    status: "on_sale";
    sales_status: "active";
    is_featured: false;
    is_cancelled: false;
    is_refundable: true;
    organizer_id: string;
    admin_remark: string;
    created_at: string;
    updated_at: string;
  };
  organizer_id: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ListItemSkeleton = () => {
  return (
    <div className="flex items-center gap-4 px-3 py-2 m-2 border-b max-w-2xl bg-gray-200 rounded-2xl border-gray-100 last:border-b-0 transition-colors">
      <div>
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      </div>
      <div className="grid gap-2">
        <Skeleton className="w-56 h-6 " />
        <Skeleton className="w-56 h-6 " />
      </div>
      <div className="flex gap-2 ml-auto">
        <Skeleton className="w-8 h-8 " />
        <Skeleton className="w-8 h-8 " />
        <Skeleton className="w-8 h-8 " />
      </div>
    </div>
  );
};

const EventCancellationList = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const setSelectedEvent = useEventStore((state) => state.setSelectedEvent);

  // Modal state
  const [rejectEventModal, setRejectEventModal] = useState<ModalState>({
    open: false,
  });
  const [acceptEventModal, setAcceptEventModal] = useState<ModalState>({
    open: false,
  });

  // pending cancellation event section
  const {
    data: pendingCancellationEventsData,
    isLoading: isLoadingCancellationEvents,
  } = usePendingCancellationEvents();

  const setTotalPendingCancellationEvents = useEventStore(
    (state) => state.setTotalPendingCancellationEvents,
  );

  useEffect(() => {
    const totalNumberOfPendingCancellationEvents =
      pendingCancellationEventsData?.pagination?.total || 0;
    setTotalPendingCancellationEvents(totalNumberOfPendingCancellationEvents);
  }, [pendingCancellationEventsData, setTotalPendingCancellationEvents]);

  // Mutation hooks
  const approveEventMutation = useApproveCancellationEvent();
  const rejectEventMutation = useRejectCancellationEvent();

  const handleViewEvent = (event: EventCancellation) => {
    setSelectedEvent(event);
    router.push(`/events/eventdetails?id=${event.event.id}`);
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
      },
    );
  };

  const handleApproveEvent = (data: { adminRemark: string }) => {
    if (!acceptEventModal.id) return;

    approveEventMutation.mutate(
      { eventId: acceptEventModal.id, adminRemark: data.adminRemark },
      {
        onSuccess: () => {
          toast.success(t("dashboard.toast.eventApproved"));
          setAcceptEventModal({ open: false });
        },
      },
    );
  };

  const events = pendingCancellationEventsData?.requests || [];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-[450px] sm:max-w-[450px] flex flex-col bg-[#f5f7f8]"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {t("dashboard.modal.eventCancellationRequests")}
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-auto">
          {isLoadingCancellationEvents ? (
            <div className="space-y-0">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-0">
              {events.map((event) => (
                <EventCard
                  key={event.event_id}
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

        {/* Reject Event Modal */}
        {rejectEventModal.open && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setRejectEventModal({ open: false })}
            />
            <PopupModal
              title={t("dashboard.modal.rejectEventCancellation")}
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
              title={t("dashboard.modal.approveEventCancellation")}
              isApprove={true}
              showCommissionInput={true}
              isLoading={approveEventMutation.isPending}
              onCancel={() => setAcceptEventModal({ open: false })}
              onConfirm={handleApproveEvent}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default EventCancellationList;
