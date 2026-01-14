"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { LanguageSelector } from "@/app/components/LanguageSelector/LanguageSelector";

/**
 * Get time-based greeting message
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const pageHeaders: {
  prefix: string;
  title: string;
  isDynamic?: boolean;
}[] = [
  { prefix: "/dashboard", title: "", isDynamic: true },
  { prefix: "/organisers", title: "Organisers" },
  { prefix: "/events", title: "Events" },
  { prefix: "/reports", title: "Reports" },
  { prefix: "/settings", title: "Settings" },
];

export default function DashboardHeader() {
  const rawPath = usePathname() ?? "/";
  const pathname = rawPath.replace(/\/+$/, "") || "/";
  const { user } = useAuthStore();

  // Get user's first name or fallback
  const userName = user?.firstName || "Admin";

  // Dynamic greeting for dashboard
  const dynamicGreeting = useMemo(() => {
    return `${getGreeting()}, ${userName}!`;
  }, [userName]);

  // Pick the best match (longest prefix first)
  const matched = pageHeaders
    .slice()
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find(
      (p) =>
        pathname === p.prefix ||
        pathname.startsWith(p.prefix + "/") ||
        pathname.startsWith(p.prefix)
    );

  // Use dynamic greeting for dashboard
  const headerText = matched?.isDynamic
    ? dynamicGreeting
    : matched?.title ?? "Dashboard";

  return (
    <div className="flex flex-1 items-center justify-between">
      <h2 className="text-lg text-gray-900 font-semibold">{headerText}</h2>

      <div className="flex items-center gap-3">
        <LanguageSelector />

        <button title="notification-button" className="flex items-center justify-center w-9 h-9 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <Bell className="h-4 w-4 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
