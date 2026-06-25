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
import { StatusFilterTabs } from "@/app/dashboard/components/EventCancellation/StatusFilterTabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

export type CancellationStatus = "pending" | "approved" | "rejected";

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
  const [activeStatus, setActiveStatus] =
    useState<CancellationStatus>("pending");

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
      pendingCancellationEventsData?.count?.pending || 0;
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

  const allEvents = pendingCancellationEventsData?.requests || [];
  const events = allEvents.filter((e) => e.status === activeStatus);

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

        <StatusFilterTabs
          activeStatus={activeStatus}
          onChange={setActiveStatus}
        />

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

        {/* Approve Organizer Modal */}
        {acceptEventModal.open && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setAcceptEventModal({ open: false })}
            />
            <AlertDialog
              open={acceptEventModal.open}
              onOpenChange={(open) =>
                setAcceptEventModal((prev) => ({ ...prev, open }))
              }
            >
              <AlertDialogContent className="rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold text-gray-900">
                    {t(
                      "dashboard.modal.approveEventCancellation",
                      "Approve Event Cancellation",
                    )}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-500 text-base">
                    {t(
                      "dashboard.modal.approveEventCancellationDescription",
                      "Are you sure you want to approve this event cancellation?",
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-6">
                  <AlertDialogCancel
                    onClick={() => setAcceptEventModal({ open: false })}
                    className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {t("common.cancelButton", "Cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      handleApproveEvent({ adminRemark: "Approved by admin" })
                    }
                    className="h-11 px-8 active:scale-95"
                  >
                    {t(
                      "events.actions.approveCancellation",
                      "Approve Cancellation",
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default EventCancellationList;
