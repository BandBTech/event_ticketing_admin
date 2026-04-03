"use client";

import { Suspense, useRef, useEffect } from "react";
import {
  UserIcon,
  LockKeyIcon,
  GlobeIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  UsersIcon,
  TicketIcon,
  ShieldCheckeredIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import DashboardHeader from "@/components/layout/dashboard-header";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { useSidebarResponsive } from "@/hooks/useSidebarResponsive";

const menuItems = [
  {
    href: "/settings/profile",
    label: "Profile",
    icon: UserIcon,
  },
  {
    href: "/settings/security",
    label: "Security",
    icon: LockKeyIcon,
  },
  {
    href: "/settings/general",
    label: "General",
    icon: GlobeIcon,
  },
  // {
  //   href: "/settings/tickets",
  //   label: "Tickets",
  //   icon: TicketIcon,
  // },
  // {
  //   href: "/settings/payments",
  //   label: "Payments",
  //   icon: CreditCardIcon,
  // },
  // {
  //   href: "/settings/notifications",
  //   label: "Notifications",
  //   icon: BellIcon,
  // },
  // {
  //   href: "/settings/system-security",
  //   label: "SystemSecurity",
  //   icon: ShieldCheckIcon,
  // },
  // {
  //   href: "/settings/api",
  //   label: "API",
  //   icon: UsersIcon,
  // },
  // {
  //   href: "/settings/permission",
  //   label: "Permissions",
  //   icon: ShieldCheckeredIcon,
  // },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  useSidebarResponsive();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty(
          "--header-height",
          `${height}px`,
        );
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    const observer = new ResizeObserver(updateHeight);
    if (headerRef.current) observer.observe(headerRef.current);
    return () => {
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className=" flex h-screen overflow-hidden bg-gray-50/50">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header
            ref={headerRef}
            className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-6"
          >
            <Suspense fallback={<div className="flex-1" />}>
              <DashboardHeader />
            </Suspense>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto py-8 px-4 max-w-6xl">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Settings Sidebar */}
                <aside className="w-full md:w-64 shrink-0">
                  <div className="rounded-xl">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 px-2">
                      {t("settings.title", "Settings")}
                    </h2>
                    <nav className="space-y-1">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === `${item.href}/`;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                              "hover:bg-gray-100",
                              isActive &&
                                "bg-blue-50 text-blue-600 font-medium",
                            )}
                          >
                            <Icon
                              size={20}
                              weight={isActive ? "fill" : "duotone"}
                            />
                            <span className="text-base">
                              {t(
                                `settings.headers.${item.label.toLowerCase()}`,
                              )}
                            </span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
