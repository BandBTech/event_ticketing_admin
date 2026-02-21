"use client";

import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  User,
  MessageSquare,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ArrowLeft } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/userService";
import { useQuery } from "@tanstack/react-query";
import { UserData } from "@/types/user";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useSearchParams } from "next/navigation";

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function getStatusStyle(status: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    approved: {
      background: "#dcfce7",
      color: "#16a34a",
      border: "1px solid #bbf7d0",
    },
    pending: {
      background: "#fef9c3",
      color: "#a16207",
      border: "1px solid #fde68a",
    },
    rejected: {
      background: "#fee2e2",
      color: "#dc2626",
      border: "1px solid #fca5a5",
    },
    active: {
      background: "#dbeafe",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    },
    inactive: {
      background: "#f3f4f6",
      color: "#6b7280",
      border: "1px solid #e5e7eb",
    },
  };
  return (
    map[status?.toLowerCase()] ?? { background: "#f3f4f6", color: "#6b7280" }
  );
}

export default function OrganizerProfilePage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id") || "";

  const { data: response, isLoading } = useQuery<UserData>({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => UserService.getUsersById({ id: userId }),
    enabled: !!userId,
  });

  const data = response;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Back Button */}

      <button
        onClick={() => router.push("/users")}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2 group hover:bg-gray-200 p-2 px-4 rounded-lg"
      >
        <ArrowLeft
          weight="duotone"
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium">
          {t("users.userDetail.backToUsers", "Back to Users")}
        </span>
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 flex items-start justify-between">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: "#eef0fb", color: "#6366f1" }}
          >
            {getInitials(data?.first_name, data?.last_name)}
          </div>

          {/* Name + email + badges */}
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {data?.first_name} {data?.last_name}
              </h1>
              {data?.account_status && (
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                  style={getStatusStyle(data.account_status)}
                >
                  {t(
                    `users.accountStatus.${data.account_status.toLowerCase()}`,
                  )}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-3">{data?.email}</p>
            <div className="flex flex-wrap gap-2">
              {data?.organizer_status && (
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1"
                  style={getStatusStyle(data.organizer_status)}
                >
                  {data.organizer_status.toLowerCase() === "approved" && "✓ "}
                  {t(
                    `users.organizerStatus.${data.organizer_status.toLowerCase()}`,
                  )}
                </span>
              )}
              {data?.is_email_verified !== undefined && (
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={
                    data.is_email_verified
                      ? {
                          background: "#f0fdf4",
                          color: "#16a34a",
                          border: "1px solid #bbf7d0",
                        }
                      : {
                          background: "#fef3c7",
                          color: "#d97706",
                          border: "1px solid #fde68a",
                        }
                  }
                >
                  {data.is_email_verified
                    ? `⚠ ${t("users.userDetail.onboardingIncomplete", "Email Verified")}`
                    : "Email Not Verified"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Contact Information */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            {t("users.userDetail.contactInformation", "Contact Information")}
          </h2>

          <div className="space-y-5">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#eef2ff" }}
              >
                <Mail size={16} color="#6366f1" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t("users.userDetail.email", "Email")}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {data?.email || "—"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#f0fdf4" }}
              >
                <Phone size={16} color="#22c55e" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t("users.userDetail.phone", "Phone")}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {data?.country_code && data?.phone
                    ? `${data.country_code} ${data.phone}`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Created */}
            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#eef2ff" }}
              >
                <Calendar size={16} color="#6366f1" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t("users.userDetail.createdOn", "Joined")}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {data?.created_at
                    ? format(new Date(data.created_at), "PPp")
                    : "—"}
                </p>
              </div>
            </div>

            {/* Updated */}
            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#fdf4ff" }}
              >
                <RefreshCw size={16} color="#a855f7" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t("users.userDetail.updatedOn", "Last Updated")}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {data?.updated_at
                    ? format(new Date(data.updated_at), "PPp")
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Status Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Organizer Status</span>
              {data?.organizer_status && (
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                  style={getStatusStyle(data.organizer_status)}
                >
                  {t(
                    `users.organizerStatus.${data.organizer_status.toLowerCase()}`,
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Account Status</span>
              {data?.account_status && (
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                  style={getStatusStyle(data.account_status)}
                >
                  {t(
                    `users.accountStatus.${data.account_status.toLowerCase()}`,
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Verified</span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={
                  data?.is_email_verified
                    ? { background: "#dcfce7", color: "#16a34a" }
                    : { background: "#f3f4f6", color: "#6b7280" }
                }
              >
                {data?.is_email_verified ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Roles & Admin Remark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Roles */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Shield size={16} className="text-gray-400" />
            {t("users.userDetail.rolesAndPermissions", "Roles & Permissions")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {data?.roles?.map((role) => (
              <div key={role.id} className="group relative">
                <span
                  className="text-xs font-medium px-3 py-1.5 rounded-full capitalize cursor-default"
                  style={{
                    background: "#eef2ff",
                    color: "#6366f1",
                    border: "1px solid #c7d2fe",
                  }}
                >
                  {t(`users.userRoles.${role.name}`)}
                </span>
                {role.description && (
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                      {role.description}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {(!data?.roles || data.roles.length === 0) && (
              <p className="text-sm text-gray-400">No roles assigned</p>
            )}
          </div>
        </div>

        {/* Admin Remark */}
        {data?.admin_remark && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-400" />
              Admin Remark
            </h2>
            <p className="text-sm text-gray-600 italic leading-relaxed">
              {data.admin_remark}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
