"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  CalendarBlankIcon,
  MapPinIcon,
  UserIcon,
  EnvelopeSimpleIcon,
  WarningCircleIcon
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOrganizerById } from "@/hooks/useOrganizer";
import { AppEvent } from "@/types/event";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

interface EventDetailCardProps {
  eventDetails: AppEvent;
}

export function EventDetailCard({ eventDetails }: EventDetailCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const {
    data: organizer,
    isLoading: organizerLoading,
  } = useOrganizerById(eventDetails.organizer_id);

  const categories = useMemo(() => {
    if (!eventDetails.category) return [];
    if (Array.isArray(eventDetails.category)) return eventDetails.category;
    if (typeof eventDetails.category === "string") {
      return (eventDetails.category as string)
        .split(",")
        .map((c) => c.trim().replace(/^[{"]+|[}"]+$/g, ""));
    }
    return [];
  }, [eventDetails.category]);

  const initials = useMemo(() => {
    if (organizer?.onboarding?.business_name) {
      const name = organizer.onboarding.business_name;
      const parts = name.split(" ");
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (organizer) {
      return (
        (organizer.first_name?.[0] || "") + (organizer.last_name?.[0] || "")
      ).toUpperCase();
    }
    return "";
  }, [organizer]);

  return (
    <div className="space-y-4 pr-6 border-r border-gray-200">
      {/* Event Banner */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
        <Image
          src={eventDetails.banner_image || "/placeholder.jpg"}
          alt={eventDetails.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 leading-tight">
          {eventDetails.title}
        </h3>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories
            .filter(Boolean)
            .slice(0, 3)
            .map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
        </div>

        {/* Event Meta Info */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarBlankIcon
              weight="duotone"
              className="w-4 h-4 text-primary-500"
            />
            <span>
              {format(new Date(eventDetails.start_date), "PPpp")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon
              weight="duotone"
              className="w-4 h-4 text-primary-500"
            />
            <span className="truncate">
              {eventDetails.venue_name}
            </span>
          </div>
        </div>

        {/* Organizer Section */}
        <div className="pt-4 mt-4 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {t("dashboard.modal.organizedBy", "Organized By")}
          </div>

          {organizerLoading ? (
            <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24 bg-gray-200" />
                <Skeleton className="h-3 w-32 bg-gray-200" />
              </div>
            </div>
          ) : organizer ? (
            <Link
              href={`/organisers/detail?id=${organizer.id}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <Avatar className="h-10 w-10 border border-gray-200">
                {organizer.onboarding?.business_logo_url && (
                  <AvatarImage
                    src={organizer.onboarding.business_logo_url}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                  {organizer.onboarding?.business_name ||
                    `${organizer.first_name} ${organizer.last_name}`}
                </div>
              </div>
              {!organizer.onboarding?.is_complete && (
                <div className="text-xs text-warning truncate flex items-center gap-1 ml-auto">
                  <WarningCircleIcon size={16} />
                  {t("dashboard.modal.onboardingIncomplete", "Onboarding Incomplete")}
                </div>
              )}

            </Link>
          ) : (
            <div className="text-sm text-destructive italic">
              {t(
                "dashboard.modal.organizerNotFound",
                "Organizer info not available"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
