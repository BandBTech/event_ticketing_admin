"use client";

import React from "react";
import { Organizer } from "@/services/organizerService";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useRouter } from "next/navigation";
import { Eye, Check, X } from "lucide-react";

interface OrganizerCardProps {
  organizer: Organizer;
  onApprove: (organizerId: string) => void;
  onReject: (organizerId: string) => void;
  isApproving?: boolean;
}

export function OrganizerCard({
  organizer,
  onApprove,
  onReject,
  isApproving,
}: OrganizerCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();

  return (
    <div className="group relative flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      {/* Organizer Avatar */}
      <div className="mt-1 w-10 h-10 rounded-xl shrink-0 overflow-hidden cursor-pointer">
        <div className="w-full h-full bg-blue-200 flex items-center justify-center text-white font-semibold text-xl capitalize">
          {organizer.first_name?.[0] || "O"}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Profile Info */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h3
            title={
              organizer.name || `${organizer.first_name} ${organizer.last_name}`
            }
            className="text-base font-semibold text-gray-900 truncate cursor-pointer"
          >
            {organizer.name || `${organizer.first_name} ${organizer.last_name}`}
          </h3>
          {organizer.email && (
            <p
              title={`${organizer.email}`}
              className="text-xs text-gray-500 truncate cursor-pointer"
            >
              {organizer.email}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => router.push(`/organizers/detail?id=${organizer.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-3 h-3" />
            {t("events.actions.viewOrganizer", "View")}
          </button>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove(organizer.id);
              }}
              disabled={isApproving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >
              <Check className="w-3 h-3" />
              {t("dashboard.accept", "Approve")}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReject(organizer.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <X className="w-3 h-3" />
              {t("dashboard.reject", "Reject")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
