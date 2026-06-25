"use client";

import React from "react";
import { EventCancellation } from "@/types/event";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Eye, Check, X, Calendar, Clock, User, MessageSquare } from "lucide-react";

interface EventCardProps {
  event: EventCancellation;
  onView: (event: EventCancellation) => void;
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

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    rejected: "bg-red-50 text-red-700 border border-red-200",
    cancelled: "bg-gray-50 text-gray-600 border border-gray-200",
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="group relative flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      {/* Banner Image */}
      <div className="w-20 h-20 rounded-xl shrink-0 overflow-hidden bg-gray-100">
        <img
          src={event.event.banner_image}
          alt={event.event.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Header: Title + Status */}
        <div className="flex items-start justify-between gap-3">
          <h3
            title={event.event.title}
            className="text-sm font-semibold text-black truncate leading-tight"
          >
            {event.event.title}
          </h3>
          {/* <span
            className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
              statusStyles[event.status.toLowerCase()] ?? statusStyles.pending
            }`}
          >
            {t("event.badge." + event.status.toLowerCase(), event.status)}
          </span> */}
        </div>

        {/* Reason */}
        {event?.reason && (
          <div className="relative px-3 py-1 bg-gray-50 border-l-2 border-gray-300 rounded-r-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black">
              {t("events.modals.reason", "Reason")}
            </span>
            <p className="text-xs text-black leading-relaxed mt-0.5">
              {event.reason}
            </p>
          </div>
        )}

        {/* Admin Remark */}
        {event?.admin_remark && (
          <div className="relative px-3 py-1 bg-amber-50 border-l-2 border-amber-300 rounded-r-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black inline-flex items-center gap-1">
              <MessageSquare className="w-2.5 h-2.5" />
              {t("events.reviewerRemark", "Reviewer's Remark")}
            </span>
            <p className="text-xs text-black leading-relaxed mt-0.5">
              {event.admin_remark}
            </p>
          </div>
        )}

        {/* Dates + Reviewer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-black">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {t("events.created", "Created")}: {formatDate(event.created_at)}
          </span>
          {event?.reviewed_at && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {t("events.reviewed", "Reviewed")}:{" "}
              {formatDate(event.reviewed_at)}
            </span>
          )}
          {event?.reviewer && (
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3" />
              {t("events.reviewedBy", "Reviewed by")}:{" "}
              {event.reviewer.name}
            </span>
          )}
        </div>

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