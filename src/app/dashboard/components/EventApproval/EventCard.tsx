"use client";

import React from "react";
import { Event } from "@/types/event";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Eye, Check, X } from "lucide-react";

interface EventCardProps {
  event: Event;
  onView: (event: Event) => void;
  onApprove: (eventId: string) => void;
  onReject: (eventId: string) => void;
  isApproving?: boolean;
}

export function EventCard({
  event,
  onView,
  onApprove,
  onReject,
  isApproving,
}: EventCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="group relative flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      {/* Banner Image */}
      <div className="w-20 h-20 rounded-xl shrink-0 overflow-hidden bg-gray-100">
        <img
          src={event.banner_image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Header: Title */}
        <div className="flex items-start justify-between gap-3">
          <h3
            title={event.title}
            className="text-sm font-semibold text-black truncate leading-tight"
          >
            {event.title}
          </h3>
        </div>

        {/* Reason */}
        {event?.description && (
          <div className="relative px-3 py-1 bg-gray-50 border-l-2 border-gray-300 rounded-r-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black">
              {t("events.sections.description", "Description")}
            </span>
            <p
              className="text-xs text-black leading-relaxed mt-0.5 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => onView(event)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-3 h-3" />
            {t("dashboard.viewEvent", "View")}
          </button>

          {event.status === "pending" && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => onApprove(event.id)}
                disabled={isApproving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
              >
                <Check className="w-3 h-3" />
                {t("dashboard.accept", "Approve")}
              </button>
              <button
                onClick={() => onReject(event.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <X className="w-3 h-3" />
                {t("dashboard.reject", "Reject")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
