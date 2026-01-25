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
    <div className="flex flex-col sm:flex-row items-center gap-4 px-4 py-3 border-gray-100 border-b last:border-b-0 hover:bg-gray-100 transition-colors">
      {/* Event Avatar */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-pink-600 text-white font-semibold text-lg shrink-0 shadow-sm">
        {getInitials(event.title)}
      </div>

      {/* Event Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
            {event.title}
          </h3>
          {/* Commission Badge */}
          {event.commission_rate > 0 && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100/50 hover:bg-emerald-100 transition-colors gap-1 shadow-xs w-fit mx-auto sm:mx-0">
              <Percent className="w-3 h-3" />
              {event.commission_rate}% {t("dashboard.commission", "Commission")}
            </Badge>
          )}
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
      <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(event)}
          className="text-primary hover:bg-primary/5 w-full sm:w-auto h-9"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" />
          {t("dashboard.viewEvent")}
        </Button>
        <ButtonGroup className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(event.id)}
            className="text-destructive hover:bg-destructive/5 w-full sm:w-auto h-9"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            {t("dashboard.reject")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApprove(event.id)}
            disabled={isApproving}
            className="text-success hover:bg-success/5 w-full sm:w-auto h-9"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            {t("dashboard.accept")}
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
