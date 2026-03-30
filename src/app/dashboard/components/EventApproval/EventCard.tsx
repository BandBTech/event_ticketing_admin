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
    <div className="flex items-center gap-4 px-3 py-2 m-2 border-b max-w-2xl bg-white rounded-2xl border-gray-100 last:border-b-0 transition-colors">
      {/* Event Avatar */}
      <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden">
        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white font-semibold text-lg">
          {event.title?.[0] || "E"}
        </div>
      </div>

      {/* Event Info */}
      <div className="flex-1 min-w-0 text-left">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {event.title}
        </h3>
        {event?.description && (
          <p
            className="text-xs text-gray-500 mt-0.5 truncate"
            dangerouslySetInnerHTML={{
              __html:
                event.description.replace(/<[^>]*>/g, "").slice(0, 100) +
                (event.description.replace(/<[^>]*>/g, "").length > 100
                  ? "..."
                  : ""),
            }}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          title={t("dashboard.viewEvent", "View Event")}
          onClick={() => onView(event)}
          className="p-2 w-9 h-9 flex items-center justify-center text-primary hover:bg-primary/10"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          title={t("dashboard.reject", "Reject")}
          onClick={() => onReject(event.id)}
          className="p-2 w-9 h-9 flex items-center justify-center text-destructive hover:bg-destructive/10"
        >
          <X className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          title={t("dashboard.accept", "Accept")}
          onClick={() => onApprove(event.id)}
          disabled={isApproving}
          className="p-2 w-9 h-9 flex items-center justify-center text-success hover:bg-success/10"
        >
          <Check className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
