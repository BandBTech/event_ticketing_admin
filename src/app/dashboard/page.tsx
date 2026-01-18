"use client";

import React, { useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Event } from "@/types/event";
import { useEventStore } from "@/store/eventStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import {
  usePendingOrganizers,
  usePendingEvents,
  useApproveOrganizer,
  useRejectOrganizer,
  useApproveEvent,
  useRejectEvent,
} from "@/hooks/useDashboard";

import { OrganizerCard } from "./components/OrganizerCard";
import { EventCard } from "./components/EventCard";
import { EmptyState } from "./components/EmptyState";
import { DashboardSkeleton, ListItemSkeleton } from "./components/DashboardSkeleton";
import PopupModal from "./components/PopupModal";

interface ModalState {
  open: boolean;
  id?: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const setSelectedEvent = useEventStore((state) => state.setSelectedEvent);

  // Modal state
  const [rejectOrganizerModal, setRejectOrganizerModal] = useState<ModalState>({ open: false });
  const [rejectEventModal, setRejectEventModal] = useState<ModalState>({ open: false });
  const [acceptEventModal, setAcceptEventModal] = useState<ModalState>({ open: false });

  // TanStack Query hooks
  const { data: pendingOrganizersData, isLoading: isLoadingOrganizers } = usePendingOrganizers();
  const { data: pendingEventsData, isLoading: isLoadingEvents } = usePendingEvents();

  // Mutation hooks
  const approveOrganizerMutation = useApproveOrganizer();
  const rejectOrganizerMutation = useRejectOrganizer();
  const approveEventMutation = useApproveEvent();
  const rejectEventMutation = useRejectEvent();

  // Handlers
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    router.push(`/events/eventdetails`);
  };

  const handleApproveOrganizer = (organizerId: string) => {
    approveOrganizerMutation.mutate(organizerId, {
      onSuccess: () => {
        toast.success(t("dashboard.toast.organizerApproved"));
      },
    });
  };

  const handleRejectOrganizer = (data: { adminRemark: string }) => {
    if (!rejectOrganizerModal.id) return;

    rejectOrganizerMutation.mutate(
      { organizerId: rejectOrganizerModal.id, adminRemark: data.adminRemark },
      {
        onSuccess: () => {
          toast.success(t("dashboard.toast.organizerRejected"));
          setRejectOrganizerModal({ open: false });
        },
      }
    );
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

  const organizers = pendingOrganizersData?.organizers || [];
  const events = pendingEventsData?.events || [];

  // Show full skeleton on initial load
  if (isLoadingOrganizers && isLoadingEvents) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Successful Events Card */}
          <div className="bg-white glass-card-lower rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-1">24</div>
                <div className="text-sm text-gray-600 font-medium">
                  {t("dashboard.successfulEvents")}
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approval Card */}
          <div className="bg-white glass-card-lower rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {organizers.length + events.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {t("dashboard.pendingApproval")}
                </div>
              </div>
            </div>
          </div>

          {/* Organizers Card */}
          <div className="bg-white glass-card-lower rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-1">8</div>
                <div className="text-sm text-gray-600 font-medium">
                  {t("dashboard.organizers")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organizers Awaiting Approval Section */}
        <div className="bg-white rounded-2xl glass-card-lower border border-gray-100/50 mt-10">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("dashboard.orgazinersAwaitingApproval")}
            </h2>
          </div>

          <div className="p-6">
            {isLoadingOrganizers ? (
              <div className="space-y-4">
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            ) : organizers.length > 0 ? (
              <div className="space-y-4">
                {organizers.map((organizer) => (
                  <OrganizerCard
                    key={organizer.id}
                    organizer={organizer}
                    onApprove={handleApproveOrganizer}
                    onReject={(id) => setRejectOrganizerModal({ open: true, id })}
                    isApproving={approveOrganizerMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={t("dashboard.noOrganizersAwaitingApproval")}
                message={t("dashboard.noOrganizersAwaitingApprovalMessage")}
              />
            )}
          </div>
        </div>

        {/* Events Awaiting Approval Section */}
        <div className="bg-white rounded-2xl glass-card-lower border border-gray-100/50 mt-10">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("dashboard.eventsAwaitingApproval")}
            </h2>
          </div>

          <div className="p-6">
            {isLoadingEvents ? (
              <div className="space-y-4">
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onView={handleViewEvent}
                    onApprove={(id) => setAcceptEventModal({ open: true, id })}
                    onReject={(id) => setRejectEventModal({ open: true, id })}
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
      </div>

      {/* Reject Organizer Modal */}
      {rejectOrganizerModal.open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setRejectOrganizerModal({ open: false })}
          />
          <PopupModal
            title={t("dashboard.modal.rejectOrganizer")}
            isApprove={false}
            showCommissionInput={false}
            isLoading={rejectOrganizerMutation.isPending}
            onCancel={() => setRejectOrganizerModal({ open: false })}
            onConfirm={handleRejectOrganizer}
          />
        </>
      )}

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
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
