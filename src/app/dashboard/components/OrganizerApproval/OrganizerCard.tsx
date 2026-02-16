"use client";

import React from "react";
import { Organizer } from "@/services/organizerService";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";

interface OrganizerCardProps {
  organizer: Organizer;
  onApprove: (organizerId: string) => void;
  onReject: (organizerId: string) => void;
  isApproving?: boolean;
}

export function OrganizerCard({
  organizer,
  onApprove,
  onReject,
  isApproving,
}: OrganizerCardProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  console.log(organizer);

  return (
    <div
      className="flex flex-col sm:flex-row items-center gap-4 px-4 py-3 border-gray-100 border-b last:border-b-0"
      onClick={() => router.push(`/organizers/detail?id=${organizer.id}`)}
    >
      {/* Avatar with Initials */}
      <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden">
        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white font-semibold text-lg">
          {organizer?.name
            ? getInitials(organizer.name)
            : getInitials({
              first_name: organizer?.first_name || "",
              last_name: organizer?.last_name || "",
            })}
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {organizer.name || `${organizer.first_name} ${organizer.last_name}`}
        </h3>
        {organizer.email && (
          <p className="text-xs text-gray-500 truncate">{organizer.email}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          title={t("dashboard.reject", "Reject")}
          onClick={(e) => {
            e.stopPropagation();
            onReject(organizer.id);
          }}
          className="p-2 w-9 h-9 flex items-center justify-center text-destructive hover:bg-destructive/10"
        >
          <X className="w-4 h-4" />
          {/* {t("dashboard.reject")} */}
        </Button>
        <Button
          variant="outline"
          title={t("dashboard.accept", "Accept")}
          onClick={(e) => {
            e.stopPropagation();
            onApprove(organizer.id);
          }}
          disabled={isApproving}
          className="p-2 w-9 h-9 flex items-center justify-center text-success hover:bg-success/10"
        >
          <Check className="w-4 h-4" />
          {/* {t("common.approve")} */}
        </Button>
      </div>
    </div>
  );
}
