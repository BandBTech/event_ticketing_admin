"use client";

import React from "react";
import { Event } from "@/types/event";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Check, X, ExternalLink, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ButtonGroup } from "@/components/ui/button-group";

interface EventCardProps {
  event: Event;
  onView: (event: Event) => void;
  onApprove: (eventId: string) => void;
  onReject: (eventId: string) => void;
  isApproving?: boolean;
}

function getInitials(title: string) {
  const words = title?.trim().split(" ") || [];
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (title?.[0] || "E").toUpperCase();
}

export function EventCard({ event, onView, onApprove, onReject, isApproving }: EventCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="flex flex-col @2xl:flex-row items-center gap-4 px-4 py-3 border-gray-100 border-b last:border-b-0 hover:bg-gray-100 transition-colors">
      {/* Event Avatar */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-pink-600 text-white font-semibold text-lg shrink-0 shadow-sm">
        {getInitials(event.title)}
      </div>

      {/* Event Info */}
      <div className="flex-1 min-w-0 text-center @2xl:text-left">
        <div className="flex flex-col @2xl:flex-row @2xl:items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900 truncate max-w-[200px] @2xl:max-w-none">
            {event.title}
          </h3>
        </div>
        {event?.description && (
          <p
            className="text-xs text-gray-500 max-w-md line-clamp-1 mt-0.5"
            dangerouslySetInnerHTML={{
              __html: event.description,
            }}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col @2xl:flex-row items-center gap-2 shrink-0">
        <Button
          variant="outline"
          onClick={() => onView(event)}
          className="text-primary hover:bg-primary/5 w-full @2xl:w-auto"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" />
          {t("dashboard.viewEvent")}
        </Button>
        <ButtonGroup className="w-1/2">
          <Button
            variant="outline"
            onClick={() => onReject(event.id)}
            className="text-destructive hover:bg-destructive/5"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            {t("dashboard.reject")}
          </Button>
          <Button
            variant="outline"
            onClick={() => onApprove(event.id)}
            disabled={isApproving}
            className="text-success hover:bg-success/5"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            {t("dashboard.accept")}
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
