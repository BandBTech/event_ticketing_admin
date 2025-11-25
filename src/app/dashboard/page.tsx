"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import Navbar from "../components/Navbar/Navbar";
import { OrganizerService } from "@/lib/organizerService";
import { toast } from "sonner";

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

  const [pendingData, setPendingData] = useState<OrganizerListResponse | null>(
    null
  );
  const handleOpen = () => {
    console.log("Open modal clicked!");
  };

  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    organizerId?: string;
  }>({ open: false });
  const [acceptModal, setAcceptModal] = useState<{
    open: boolean;
    organizerId?: string;
  }>({ open: false });
  const [adminRemark, setAdminRemark] = useState("");

  const handleApprove = async (organizerId: string, admin_remark: string) => {
    const payload = {
      organizerId,
      admin_remark,
      status: "approved",
    };

    try {
      await OrganizerService.approveOrganizer(payload);
      toast.success("Organizer approved successfully!");

      // Refresh list
      const res = await OrganizerService.getPendingOrganizers();
      setPendingData(res);
    } catch (error) {
      console.error("Error approving organizer:", error);
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
      console.error("Error rejecting organizer:", error);
    }
  };

  useEffect(() => {
    async function loadData() {
      const res = await OrganizerService.getPendingOrganizers();
      setPendingData(res);
    }
    loadData();
  }, []);

  function getInitials(firstName: string, lastName: string) {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase();
  }

  const organizers = pendingData?.organizers || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 ml-64">
      {/* Header */}
      <div className="">
        <Navbar title="Admin Dashboard" addMessage="" handleOpen={handleOpen} />
      </div>

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
                        onClick={() =>
                          setAcceptModal({
                            open: true,
                            organizerId: organizer.id,
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
      </div>

      {acceptModal.open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setAcceptModal({ open: false })}
          />

          <div className="fixed z-50 inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
              <h2 className="text-lg font-semibold mb-4">Accept Organizer</h2>

              <textarea
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Enter reason for approval..."
                value={adminRemark}
                onChange={(e) => setAdminRemark(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setAcceptModal({ open: false })}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (!acceptModal.organizerId) return;
                    await handleApprove(acceptModal.organizerId, adminRemark);
                    setAcceptModal({ open: false });
                    setAdminRemark("");
                  }}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {rejectModal.open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setRejectModal({ open: false })}
          />

          <div className="fixed z-50 inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
              <h2 className="text-lg font-semibold mb-4">Reject Organizer</h2>

              <textarea
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Enter reason for rejection..."
                value={adminRemark}
                onChange={(e) => setAdminRemark(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRejectModal({ open: false })}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (!rejectModal.organizerId) return;
                    await handleReject(rejectModal.organizerId, adminRemark);
                    setRejectModal({ open: false });
                    setAdminRemark("");
                  }}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
