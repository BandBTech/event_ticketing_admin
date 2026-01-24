"use client";

import React from "react";
import { Organizer } from "@/lib/organizerService";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

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
    <div className="flex flex-col sm:flex-row items-center gap-4 mx-4 py-3 border-gray-200 hover:bg-gray-100">
      {/* Avatar with Initials */}
      <div className="flex items-center justify-center w-12 h-12 font-semibold text-white bg-primary rounded-full shadow-inner">
        {getInitials(organizer.first_name, organizer.last_name)}
      </div>

      {/* Profile Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {organizer.first_name} {organizer.last_name}
        </h3>
        {organizer.email && (
          <p className="text-xs text-gray-500 truncate">
            {organizer.email}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shrink-0 mt-2 sm:mt-0">
        <ButtonGroup>
          <Button
            variant="outline"
            onClick={() => onReject(organizer.id)}
            className="text-destructive hover:bg-destructive/5 w-full sm:w-auto"
          >
            <X className="w-4 h-4" />
            {t("dashboard.reject")}
          </Button>
          <Button
            variant="outline"
            onClick={() => onApprove(organizer.id)}
            disabled={isApproving}
            className="text-success hover:bg-success/5 w-full sm:w-auto"
          >
            <Check className="w-4 h-4" />
            {t("dashboard.accept")}
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
