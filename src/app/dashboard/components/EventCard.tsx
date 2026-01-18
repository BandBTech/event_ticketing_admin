"use client";

import React from "react";
import { Event } from "@/types/event";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: Event;
  onView: (event: Event) => void;
  onApprove: (eventId: string) => void;
  onReject: (eventId: string) => void;
}

function getInitials(title: string) {
  const words = title?.trim().split(" ") || [];
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (title?.[0] || "E").toUpperCase();
}

export function EventCard({ event, onView, onApprove, onReject }: EventCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Event Avatar */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-pink-600 text-white font-semibold text-lg shrink-0 shadow-sm">
        {getInitials(event.title)}
      </div>

      {/* Event Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {event.title}
        </h3>
        {event?.description && (
          <p
            className="text-xs text-gray-500 max-w-md line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: event.description,
            }}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shrink-0 mt-2 sm:mt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(event)}
          className="text-blue-600 border-blue-300 hover:bg-blue-50 w-full sm:w-auto"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          {t("dashboard.viewEvent")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReject(event.id)}
          className="text-red-600 border-red-300 hover:bg-red-50 w-full sm:w-auto"
        >
          <X className="w-4 h-4 mr-1" />
          {t("dashboard.reject")}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onApprove(event.id)}
          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
        >
          <Check className="w-4 h-4 mr-1" />
          {t("dashboard.accept")}
        </Button>
      </div>
    </div>
  );
}
