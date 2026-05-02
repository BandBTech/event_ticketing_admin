"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  User,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/userService";
import { useQuery } from "@tanstack/react-query";
import { UserData } from "@/types/user";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useSearchParams } from "next/navigation";
import { formatDateTimeLong } from "@/lib/utils";

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
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>(
    {},
  );

  const { data: response, isLoading } = useQuery<UserData>({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => UserService.getUsersById({ id: userId }),
    enabled: !!userId,
  });

  const data = response;

  const toggleRole = (roleId: string) => {
    setExpandedRoles((prev) => ({ ...prev, [roleId]: !prev[roleId] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <p className="text-sm text-black">{t("users.loadingUsers")}</p>
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
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: "#eef0fb", color: "#6366f1" }}
          >
            {getInitials(data?.first_name, data?.last_name)}
          </div>
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
            <p className="text-sm text-black mb-3">{data?.email}</p>
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
                <p className="text-xs text-black mb-0.5">
                  {t(
                    "organizer.organizerDetails.emailAddress",
                    "Email Address",
                  )}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {data?.email || "—"}
                </p>
              </div>
            </div>

            {/* Phone — show if either country_code or phone is present */}
            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#f0fdf4" }}
              >
                <Phone size={16} color="#22c55e" />
              </div>
              <div>
                <p className="text-xs text-black mb-0.5">
                  {t("organizer.organizerDetails.phoneNumber", "Phone Number")}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {data?.phone
                    ? [data.country_code, data.phone].filter(Boolean).join(" ")
                    : "—"}
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
                <p className="text-xs text-black mb-0.5">
                  {t("users.userDetail.createdOn", "Created On")}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDateTimeLong(data?.created_at, locale) ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            {t("events.sections.statusSummary")}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-black">
                {t("organizer.management.status.account")}
              </span>
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
              <span className="text-sm text-black">
                {t("users.userDetail.email", "Email")}
              </span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={
                  data?.is_email_verified
                    ? { background: "#dcfce7", color: "#16a34a" }
                    : { background: "#f3f4f6", color: "#6b7280" }
                }
              >
                {data?.is_email_verified
                  ? t("users.verifiedStatus.verified", "Verified")
                  : t("users.verifiedStatus.unverified", "Unverified")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Roles & Permissions — now with expandable permissions per role */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Shield size={16} className="text-black" />
            {t("users.userDetail.rolesAndPermissions", "Roles & Permissions")}
          </h2>

          {data?.roles && data.roles.length > 0 ? (
            <div className="space-y-3">
              {data.roles.map((role) => {
                const isExpanded = expandedRoles[role.id] ?? false;
                return (
                  <div
                    key={role.id}
                    className="border border-gray-100 rounded-xl overflow-hidden"
                  >
                    {/* Role header row */}
                    <button
                      onClick={() => toggleRole(role.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium px-3 py-1.5 rounded-full capitalize"
                            style={{
                              background: "#eef2ff",
                              color: "#6366f1",
                              border: "1px solid #c7d2fe",
                            }}
                          >
                            {t(`users.userRoles.${role.name}`, role.name)}
                          </span>
                          {role.permissions?.length > 0 && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-md font-medium"
                              style={{
                                background: "#f1f5f9",
                                color: "#64748b",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              {role.permissions.length}{" "}
                              {t("users.userDetail.permissions", "permissions")}
                            </span>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-xs text-gray-500 leading-relaxed pl-1 mt-0.5">
                            {role.description}
                          </p>
                        )}
                      </div>
                      {role.permissions?.length > 0 &&
                        (isExpanded ? (
                          <ChevronUp
                            size={14}
                            className="text-gray-400 flex-shrink-0"
                          />
                        ) : (
                          <ChevronDown
                            size={14}
                            className="text-gray-400 flex-shrink-0"
                          />
                        ))}
                    </button>

                    {/* Permissions grid */}
                    {isExpanded && role.permissions?.length > 0 && (
                      <div className="px-4 pb-4 border-t border-gray-50">
                        <div className="flex flex-wrap gap-1.5 pt-3">
                          {role.permissions.map((perm) => (
                            <span
                              key={perm.id}
                              title={perm.description}
                              className="text-xs px-2.5 py-1 rounded-md font-mono"
                              style={{
                                background: "#f8fafc",
                                color: "#475569",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              {perm.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-black">
              {t("users.userDetail.noRolesAssigned", "No roles assigned")}
            </p>
          )}
        </div>

        {/* Admin Remark */}
        {data?.admin_remark && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-black" />
              {t("users.userDetail.adminRemark", "Admin Remark")}
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
