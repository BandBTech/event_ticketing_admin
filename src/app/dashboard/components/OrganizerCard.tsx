"use client";

import React from "react";
import { Organizer } from "@/lib/organizerService";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganizerCardProps {
  organizer: Organizer;
  onApprove: (organizerId: string) => void;
  onReject: (organizerId: string) => void;
  isApproving?: boolean;
}

function getInitials(firstName: string, lastName: string) {
  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";
  return (first + last).toUpperCase();
}

export function OrganizerCard({
  organizer,
  onApprove,
  onReject,
  isApproving,
}: OrganizerCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Avatar with Initials */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-primary to-blue-600 text-white font-semibold text-lg shrink-0 shadow-sm">
        {getInitials(organizer.first_name, organizer.last_name)}
      </div>

      {/* Profile Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {organizer.first_name} {organizer.last_name}
        </h3>
        {organizer.roles[0]?.name && (
          <p className="text-sm text-gray-600 truncate">
            {organizer.roles[0]?.name}
          </p>
        )}
        {organizer.roles[0]?.description && (
          <p className="text-xs text-gray-500 truncate">
            {organizer.roles[0]?.description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shrink-0 mt-2 sm:mt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReject(organizer.id)}
          className="text-destructive border-destructive-foreground hover:bg-destructive-foreground/10 w-full sm:w-auto"
        >
          <X className="w-4 h-4 mr-1" />
          {t("dashboard.reject")}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onApprove(organizer.id)}
          disabled={isApproving}
          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
        >
          <Check className="w-4 h-4 mr-1" />
          {t("dashboard.accept")}
        </Button>
      </div>
    </div>
  );
}
