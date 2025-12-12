"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, ExternalLink } from "lucide-react";
import Navbar from "../components/Navbar/Navbar";
import { OrganizerService } from "@/lib/organizerService";
import { EventService } from "@/lib/eventServices";
import { toast } from "sonner";
import { Event } from "@/types/event";
import { useRouter } from "next/navigation";
import { useEventStore } from "@/store/eventStore";
import { PendingEvent } from "@/types/pendingEvents";
import PopupModal from "./components/PopupModal";

const AdminDashboard: React.FC = () => {
  interface Organizer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    country_code: string;
    is_email_verified: boolean;
    organizer_status: string;
    account_status: string;
    roles: {
      id: string;
      name: string;
      description: string;
    }[];
    created_at: string;
    updated_at: string;
  }

  interface OrganizerListResponse {
    limit: number;
    page: number;
    total: number;
    organizers: Organizer[];
  }

  interface EventResponse {
    events: Event[];
    limit: number;
    page: number;
    total: number;
  }

  const router = useRouter();
  const setSelectedEvent = useEventStore((state) => state.setSelectedEvent);

  const [pendingData, setPendingData] = useState<OrganizerListResponse | null>(
    null
  );
  const [pendingEventsData, setPendingEnventsData] =
    useState<EventResponse | null>(null);

  const handleOpen = () => {
    // Modal open handler
  };

  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    organizerId?: string;
  }>({ open: false });
  const [rejectEventModal, setRejectEventModal] = useState<{
    open: boolean;
    eventId?: string;
  }>({ open: false });
  const [acceptEventModal, setAcceptEventModal] = useState<{
    open: boolean;
    eventId?: string;
  }>({ open: false });
  const [adminRemark, setAdminRemark] = useState("");

  const handleViewEvent = (event: PendingEvent) => {
    setSelectedEvent(event);
    router.push(`/events/eventdetails`);
  };

  const handleApprove = async (organizerId: string) => {
    const payload = {
      organizerId,
      admin_remark: "approved by admin",
      status: "approved",
    };

    try {
      await OrganizerService.approveOrganizer(payload);
      toast.success("Organizer approved successfully!");

      // Refresh list
      const res = await OrganizerService.getPendingOrganizers();
      setPendingData(res);
    } catch (error) {
      // Error handled by toast
    }
  };
  const handleReject = async (organizerId: string, admin_remark: string) => {
    const payload = {
      organizerId,
      admin_remark,
      status: "rejected",
    };

    try {
      await OrganizerService.approveOrganizer(payload);
      toast.success("Organizer rejected successfully!");

      // Refresh list
      const res = await OrganizerService.getPendingOrganizers();
      setPendingData(res);
    } catch (error) {
      // Error handled by toast
    }
  };
  const handleEventReject = async (eventId: string, admin_remark: string) => {
    const payload = {
      eventId,
      admin_remark,
      status: "rejected",
      commission_rate: 0,
    };

    try {
      await EventService.approveEvent(payload);
      toast.success("Event rejected successfully!");

      // Refresh list
      const res = await EventService.getPendingtEvent();
      setPendingEnventsData(res);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reject event";
      toast.error(message);
    }
  };

  const handleEventAccept = async (
    eventId: string,
    admin_remark: string,
    commission_rate: number
  ) => {
    const payload = {
      eventId,
      admin_remark,
      commission_rate,
      status: "approved",
    };

    try {
      await EventService.approveEvent(payload);
      toast.success("Event approved successfully!");

      // Refresh list
      const res = await EventService.getPendingtEvent();
      setPendingEnventsData(res);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to approve event";
      toast.error(message);
    }
  };

  useEffect(() => {
    async function loadData() {
      const res = await OrganizerService.getPendingOrganizers();
      const res2 = await EventService.getPendingtEvent();
      setPendingData(res);
      setPendingEnventsData(res2);
    }
    loadData();
  }, []);

  function getInitials(firstName: string, lastName: string) {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase();
  }

  const organizers = pendingData?.organizers || [];
  const events = pendingEventsData?.events || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Successful Events Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-1">24</div>
                <div className="text-sm text-gray-600 font-medium">
                  Successful Events
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approval Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-1">11</div>
                <div className="text-sm text-gray-600 font-medium">
                  Pending approval
                </div>
              </div>
            </div>
          </div>

          {/* Organizers Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-1">8</div>
                <div className="text-sm text-gray-600 font-medium">
                  Organizers
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organizers Awaiting Approval Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 mt-10">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Organizers awaiting approval
            </h2>
          </div>

          {/* Data Embedded State */}
          <div className="p-6">
            {organizers.length > 0 ? (
              <div className="space-y-4">
                {organizers.map((organizer) => (
                  <div
                    key={organizer.id}
                    className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Avatar with Initials */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-300 text-white font-semibold text-lg flex-shrink-0">
                      {getInitials(organizer.first_name, organizer.last_name)}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {organizer.first_name} {organizer.last_name}
                      </h3>
                      {organizer.roles[0]?.name && (
                        <p className="text-sm text-gray-600 truncate">
                          {organizer.roles[0]?.name}
                        </p>
                      )}
                      {organizer.roles[0].description && (
                        <p className="text-xs text-gray-500 truncate">
                          {organizer.roles[0]?.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-shrink-0 mt-2 sm:mt-0">
                      <button
                        onClick={() =>
                          setRejectModal({
                            open: true,
                            organizerId: organizer.id,
                          })
                        }
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors cursor-pointer w-full sm:w-auto"
                      >
                        <span className="mr-2">X</span> REJECT
                      </button>
                      <button
                        onClick={() => handleApprove(organizer.id)}
                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-200 rounded-md hover:bg-green-300 hover:text-green-800 transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        ACCEPT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Empty state  */}
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No organizers awaiting approval
                  </p>
                  <p className="text-sm text-gray-400">
                    When organizers submit for registration, they&apos;ll appear
                    here
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Events Awaiting Approval Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 mt-10">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Events awaiting approval
            </h2>
          </div>

          {/* Data Embedded State */}
          <div className="p-6">
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-300 text-white font-semibold text-lg flex-shrink-0">
                      {getInitials("Test", "Test")}
                    </div>

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {event.title}
                      </h3>
                      {/* {organizer.roles[0]?.name && (
                        <p className="text-sm text-gray-600 truncate">
                          {organizer.roles[0]?.name}
                        </p>
                      )} */}
                      {event?.description && (
                        <p
                          className="text-xs text-gray-500 max-w-md line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: event.description,
                          }}
                        />
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-shrink-0 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleViewEvent(event)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors cursor-pointer w-full sm:w-auto"
                      >
                        <span className="mr-2 flex justify-around items-center gap-1">
                          <span>
                            <ExternalLink className="h-4 w-4" />
                          </span>
                          <span>VIEW EVENT</span>
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          setRejectEventModal({
                            open: true,
                            eventId: event.id,
                          })
                        }
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors cursor-pointer w-full sm:w-auto"
                      >
                        <span className="mr-2">X</span> REJECT
                      </button>
                      <button
                        onClick={() =>
                          setAcceptEventModal({
                            open: true,
                            eventId: event.id,
                          })
                        }
                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-200 rounded-md hover:bg-green-300 hover:text-green-800 transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        ACCEPT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Empty state  */}
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No events awaiting approval
                  </p>
                  <p className="text-sm text-gray-400">
                    When events submit for registration, they&apos;ll appear
                    here
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {rejectModal.open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setRejectModal({ open: false })}
          />
          <PopupModal
            title="Reject Organizer"
            isApprove={false}
            showCommissionInput={false}
            onCancel={() => setRejectEventModal({ open: false })}
            onConfirm={async () => {
              if (!rejectModal.organizerId) return;
              await handleReject(rejectModal.organizerId, adminRemark);
              setRejectModal({ open: false });
              setAdminRemark("");
            }}
          />
        </>
      )}
      {rejectEventModal.open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setRejectEventModal({ open: false })}
          />
          <PopupModal
            title="Reject Event"
            isApprove={false}
            showCommissionInput={false}
            onCancel={() => setRejectEventModal({ open: false })}
            onConfirm={async (data) => {
              if (!rejectEventModal.eventId) return;
              await handleEventReject(
                rejectEventModal.eventId,
                data.adminRemark
              );
              setRejectEventModal({ open: false });
            }}
          />
        </>
      )}
      {acceptEventModal.open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setRejectEventModal({ open: false })}
          />
          <PopupModal
            title="Approve Event"
            isApprove={true}
            showCommissionInput={true}
            onCancel={() => setAcceptEventModal({ open: false })}
            onConfirm={async (data) => {
              if (!acceptEventModal.eventId) return; // ✅ Use acceptEventModal

              // ✅ Validate commission rate for approval
              if (!data.commissionRate) {
                toast.error("Commission rate is required for approval");
                return;
              }

              await handleEventAccept(
                acceptEventModal.eventId, // ✅ Use acceptEventModal
                data.adminRemark,
                data.commissionRate // ✅ Now guaranteed to be string
              );
              setAcceptEventModal({ open: false }); // ✅ Close acceptEventModal
            }}
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
