"use client";

import { Bell, List } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { LanguageSelector } from "@/app/components/LanguageSelector/LanguageSelector";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useUIStore } from "@/store/uiStore";
import { CalendarClock, Users } from "lucide-react";
import OrganizerApprovalList from "@/app/dashboard/components/OrganizerApproval/OrganizerApprovalList";
import EventApprovalList from "@/app/dashboard/components/EventApproval/EventApprovalList";
import { useEventStore } from "@/store/eventStore";
import { useOrganizerStore } from "@/store/organizerStore";

/**
 * Get time-based greeting message
 */
function getGreeting({ t }: { t: (key: string) => string }): string {
  const hour = new Date().getHours();
  if (hour < 12) return `${t("dashboard.greeting.morning")}`;
  if (hour < 17) return `${t("dashboard.greeting.afternoon")}`;
  return `${t("dashboard.greeting.evening")}`;
}

const pageHeaders: {
  prefix: string;
  titleKey?: string;
  isDynamic?: boolean;
}[] = [
  { prefix: "/dashboard", isDynamic: true },
    { prefix: "/organizers", titleKey: "pages.organizers" },
  { prefix: "/events", titleKey: "pages.events" },
  { prefix: "/users", titleKey: "pages.users" },
  { prefix: "/transactions", titleKey: "pages.transactions" },
  { prefix: "/auditlogs", titleKey: "pages.auditlogs" },
  { prefix: "/refunds", titleKey: "pages.refunds" },
  { prefix: "/payouts", titleKey: "pages.payouts" },
  { prefix: "/reports", titleKey: "pages.reports" },
  { prefix: "/settings", titleKey: "pages.settings" },
];

export default function DashboardHeader() {
  const rawPath = usePathname() ?? "/";
  const pathname = rawPath.replace(/\/+$/, "") || "/";
  const { user } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { toggleSidebar } = useUIStore();
  const [isPendingEventOpen, setIsPendingEventOpen] = React.useState(false);
  const [isPendingOrganizerOpen, setIsPendingOrganizerOpen] =
    React.useState(false);
  const pendingEvents = useEventStore((state) => state.totalPendingEvents);
  const pendingOrganizers = useOrganizerStore((state) => state.totalPendingOrganizers);

  // Get user's first name or fallback
  const userName = user?.firstName || "Admin";

  // Dynamic greeting for dashboard
  const dynamicGreeting = useMemo(() => {
    return `${getGreeting({ t })}, ${userName}!`;
  }, [userName, t]);

  // Pick the best match (longest prefix first)
  const matched = pageHeaders
    .slice()
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find(
      (p) =>
        pathname === p.prefix ||
        pathname.startsWith(p.prefix + "/") ||
        pathname.startsWith(p.prefix),
    );

  // Use dynamic greeting for dashboard
  const headerText = matched?.isDynamic
    ? dynamicGreeting
    : matched?.titleKey
      ? t(matched.titleKey)
      : t("pages.dashboard");

  return (
    <div className="flex flex-1 items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          title="menu-button"
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <List className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg text-gray-900 font-semibold">{headerText}</h2>
      </div>

      <div className="flex items-center gap-3">
        {pathname === "/dashboard" && (
          <div className="relative">
            <button
              title="Pending Events"
              onClick={() => setIsPendingEventOpen(true)}
              className="flex items-center justify-center w-9 h-9 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <CalendarClock className="h-4 w-4 text-gray-700" />
            </button>

            {pendingEvents > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {pendingEvents > 99 ? "99+" : pendingEvents}
              </span>
            )}
          </div>
        )}
        {pathname === "/dashboard" && (
          <div className="relative">
            <button
              title="Pending Organizers"
              onClick={() => setIsPendingOrganizerOpen(true)}
              className="flex items-center justify-center w-9 h-9 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Users className="h-4 w-4 text-gray-700" />
            </button>

            {pendingOrganizers > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {pendingOrganizers > 99 ? "99+" : pendingOrganizers}
              </span>
            )}
          </div>
        )}
        <LanguageSelector />

        {/* Notification Bell */}
        <button
          title="notification-button"
          className="flex items-center justify-center w-9 h-9 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Bell className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      {/* Pending Events Modal */}
      {isPendingEventOpen && (
        <EventApprovalList
          isOpen={isPendingEventOpen}
          setIsOpen={setIsPendingEventOpen}
        />
      )}
      {/* Pending Organizers Modal */}
      {isPendingOrganizerOpen && (
        <OrganizerApprovalList
          isOpen={isPendingOrganizerOpen}
          setIsOpen={setIsPendingOrganizerOpen}
        />
      )}
    </div>
  );
}
