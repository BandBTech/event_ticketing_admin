"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizerService, Organizer } from "@/lib/organizerService";
import { format } from "date-fns";
import {
  ArrowLeft,
  Envelope,
  Phone,
  CalendarBlank,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserMinus,
  Buildings,
  ShieldCheck,
  DotsThreeVertical,
  PencilSimple,
  Trash,
  ArrowSquareOut,
  Warning,
  Check,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";



function getInitials(firstName: string, lastName: string) {
  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";
  return (first + last).toUpperCase();
}

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return {
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        bgColor: "bg-emerald-50",
        icon: CheckCircle,
        label: "Approved",
      };
    case "pending":
      return {
        color: "bg-amber-100 text-amber-700 border-amber-200",
        bgColor: "bg-amber-50",
        icon: Clock,
        label: "Pending",
      };
    case "rejected":
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        bgColor: "bg-red-50",
        icon: XCircle,
        label: "Rejected",
      };
    case "inactive":
      return {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        bgColor: "bg-gray-50",
        icon: UserMinus,
        label: "Inactive",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        bgColor: "bg-gray-50",
        icon: Clock,
        label: status || "Unknown",
      };
  }
}

function getAccountStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        color: "bg-emerald-500 text-white",
        dotColor: "bg-emerald-400",
        label: "Active",
      };
    case "inactive":
      return {
        color: "bg-gray-500 text-white",
        dotColor: "bg-gray-400",
        label: "Inactive",
      };
    case "suspended":
      return {
        color: "bg-red-500 text-white",
        dotColor: "bg-red-400",
        label: "Suspended",
      };
    default:
      return {
        color: "bg-gray-500 text-white",
        dotColor: "bg-gray-400",
        label: "Unknown",
      };
  }
}

// Skeleton Component
function DetailPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-32 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse" />
          <div className="p-6 pt-0 relative">
            <div className="absolute -top-12 left-6 w-24 h-24 rounded-xl bg-gray-300 border-4 border-white animate-pulse" />
            <div className="pt-14 flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm h-64 animate-pulse bg-gray-100" />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm h-40 animate-pulse bg-gray-100" />
            <div className="bg-white rounded-xl p-6 shadow-sm h-40 animate-pulse bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Approval Modal Component
function ApprovalModal({
  isOpen,
  onClose,
  organizer,
  action,
}: {
  isOpen: boolean;
  onClose: () => void;
  organizer: Organizer;
  action: "approve" | "reject";
}) {
  const [remark, setRemark] = useState("");
  const queryClient = useQueryClient();

  const approvalMutation = useMutation({
    mutationFn: () =>
      OrganizerService.approveOrganizer({
        organizerId: organizer.id,
        admin_remark: remark,
        status: action === "approve" ? "approved" : "rejected",
      }),
    onSuccess: () => {
      toast.success(
        action === "approve"
          ? "Organizer approved successfully"
          : "Organizer rejected"
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.organizers.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizers.detail(organizer.id) });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update organizer status");
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div
          className={`p-6 ${action === "approve" ? "bg-emerald-50" : "bg-red-50"}`}
        >
          <div
            className={`w-12 h-12 rounded-full ${action === "approve" ? "bg-emerald-100" : "bg-red-100"} flex items-center justify-center mb-4`}
          >
            {action === "approve" ? (
              <Check weight="duotone" className="w-6 h-6 text-emerald-600" />
            ) : (
              <X weight="duotone" className="w-6 h-6 text-red-600" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {action === "approve" ? "Approve Organizer" : "Reject Organizer"}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {action === "approve"
              ? `Are you sure you want to approve ${organizer.first_name} ${organizer.last_name}?`
              : `Are you sure you want to reject ${organizer.first_name} ${organizer.last_name}?`}
          </p>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Remark {action === "reject" && "(Required)"}
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder={
              action === "approve"
                ? "Optional: Add a note..."
                : "Please provide a reason for rejection..."
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => approvalMutation.mutate()}
            disabled={
              approvalMutation.isPending ||
              (action === "reject" && !remark.trim())
            }
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action === "approve"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-red-600 hover:bg-red-700"
              }`}
          >
            {approvalMutation.isPending
              ? "Processing..."
              : action === "approve"
                ? "Approve"
                : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [showActions, setShowActions] = useState(false);

  // If no ID is present, we should probably redirect or show error
  // But here we rely on the query hook to fail or return nothing if !id

  const {
    data: organizer,
    isLoading,
    isError,
    error,
  } = useQuery<Organizer | null>({
    queryKey: queryKeys.organizers.detail(id!),
    queryFn: () => OrganizerService.getOrganizerById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (isError || !organizer || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Warning weight="duotone" className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {!id ? "No Organizer Selected" : isError ? "Error Loading Organizer" : "Organizer Not Found"}
          </h2>
          <p className="text-gray-500 mb-6">
            {!id ? "Please select an organizer from the list." : (error as Error)?.message || "The organizer you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push("/organisers")}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Organisers
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(organizer.organizer_status);
  const accountStatusConfig = getAccountStatusConfig(organizer.account_status);
  const StatusIcon = statusConfig.icon;

  const formattedCreatedDate = organizer.created_at
    ? format(new Date(organizer.created_at), "MMMM dd, yyyy 'at' hh:mm a")
    : "N/A";

  const formattedUpdatedDate = organizer.updated_at
    ? format(new Date(organizer.updated_at), "MMMM dd, yyyy 'at' hh:mm a")
    : "N/A";

  const isPending = organizer.organizer_status?.toLowerCase() === "pending";

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/organisers")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft weight="duotone" className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Organisers</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center text-3xl font-bold border border-indigo-100 shadow-sm">
                  {getInitials(organizer.first_name, organizer.last_name)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {organizer.first_name} {organizer.last_name}
                      </h1>
                      {organizer.is_email_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <UserCheck weight="duotone" className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accountStatusConfig.color.replace('text-white', 'bg-opacity-10 text-current')}`}
                        style={{ backgroundColor: accountStatusConfig.color.includes('emerald') ? '#ecfdf5' : accountStatusConfig.color.includes('red') ? '#fef2f2' : '#f3f4f6', color: accountStatusConfig.color.includes('emerald') ? '#059669' : accountStatusConfig.color.includes('red') ? '#dc2626' : '#4b5563' }}
                      >
                        {accountStatusConfig.label}
                      </span>
                    </div>
                    <p className="text-gray-500 mb-4">{organizer.email}</p>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.color} bg-white`}
                      >
                        <StatusIcon weight="duotone" className="w-4 h-4" />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 relative">
                    {isPending && (
                      <>
                        <button
                          onClick={() => {
                            setApprovalAction("approve");
                            setShowApprovalModal(true);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setApprovalAction("reject");
                            setShowApprovalModal(true);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <div className="relative">
                      <button
                        onClick={() => setShowActions(!showActions)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      >
                        <DotsThreeVertical weight="duotone" className="w-5 h-5" />
                      </button>
                      {showActions && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              router.push(`/events?organizer_id=${organizer.id}`);
                              setShowActions(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ArrowSquareOut weight="duotone" className="w-4 h-4" />
                            View Events
                          </button>
                          <button
                            onClick={() => setShowActions(false)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <PencilSimple weight="duotone" className="w-4 h-4" />
                            Edit Details
                          </button>
                          <hr className="my-1" />
                          <button
                            onClick={() => setShowActions(false)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash weight="duotone" className="w-4 h-4" />
                            Delete Organizer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Envelope weight="duotone" className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">
                      {organizer.email}
                    </p>
                  </div>
                </div>

                {organizer.phone && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <Phone weight="duotone" className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">
                        {organizer.country_code} {organizer.phone}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <CalendarBlank weight="duotone" className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {formattedCreatedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <CalendarBlank weight="duotone" className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {formattedUpdatedDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Roles & Permissions */}
            {organizer.roles && organizer.roles.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Roles & Permissions
                </h2>
                <div className="space-y-4">
                  {organizer.roles.map((role) => (
                    <div
                      key={role.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck weight="duotone" className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {role.name}
                        </h3>
                      </div>
                      {role.description && (
                        <p className="text-sm text-gray-600">
                          {role.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {organizer.organizer_status.toLowerCase() !== "approved" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setApprovalAction("approve");
                        setShowApprovalModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <CheckCircle weight="duotone" className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setApprovalAction("reject");
                        setShowApprovalModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                      <XCircle weight="duotone" className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      router.push(`/events?organizer_id=${organizer.id}`)
                    }
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Buildings weight="duotone" className="w-4 h-4" />
                    View Events
                  </button>
                )}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Envelope weight="duotone" className="w-4 h-4" />
                  Send Email
                </button>
              </div>
            </div>   {/* Status Summary */}
            {/* <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Status Summary
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Organizer Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                  >
                    <StatusIcon weight="duotone" className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Account Status</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${accountStatusConfig.color}`}
                  >
                    {accountStatusConfig.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Email Verified</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${organizer.is_email_verified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {organizer.is_email_verified ? (
                      <>
                        <CheckCircle weight="duotone" className="w-3.5 h-3.5" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle weight="duotone" className="w-3.5 h-3.5" />
                        Not Verified
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        organizer={organizer}
        action={approvalAction}
      />
    </div>
  );
}
