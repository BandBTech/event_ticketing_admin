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
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      {/* Event Avatar */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-pink-600 text-white font-semibold text-lg shrink-0 shadow-sm">
        {getInitials(event.title)}
      </div>

      {/* Event Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {event.title}
        </h3>
        {/* Commission Badge */}
        {event.commission_rate > 0 && (
          <div className="flex justify-center sm:justify-start mt-1 mb-2">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100/50 hover:bg-emerald-100 transition-colors gap-1 shadow-xs">
              <Percent className="w-3 h-3" />
              {event.commission_rate}% {t("dashboard.commission", "Commission")}
            </Badge>
          </div>
        )}
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
          onClick={() => onView(event)}
          className="text-primary hover:bg-primary/5 w-full sm:w-auto"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          {t("dashboard.viewEvent")}
        </Button>
        <ButtonGroup>
          <Button
            variant="outline"
            onClick={() => onReject(event.id)}
            className="text-destructive hover:bg-destructive/5 w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-1" />
            {t("dashboard.reject")}

          </Button>
          <Button
            variant="outline"
            onClick={() => onApprove(event.id)}
            className="text-success hover:bg-success/5 w-full sm:w-auto"
          >
            <Check className="w-4 h-4 mr-1" />
            {t("dashboard.accept")}
          </Button>

        </ButtonGroup>
      </div>
    </div>
  );
}
