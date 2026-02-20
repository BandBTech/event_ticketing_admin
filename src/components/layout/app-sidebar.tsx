"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Gauge,
  SquaresFour,
  CalendarBlank,
  FileText,
  Gear,
  CaretDoubleLeft,
  CaretDoubleRight,
  CaretRight,
  SignOut,
  User,
  Ticket,
  ArrowsLeftRight,
  InvoiceIcon,
} from "@phosphor-icons/react";

import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useUIStore } from "@/store/uiStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const {
    isCollapsed: collapsed,
    toggleCollapse: onToggle,
    sidebarOpen,
    setSidebarOpen,
  } = useUIStore();

  // Define navLinks with translation keys
  const navLinks = useMemo(
    () => [
      { href: "/dashboard", labelKey: "sidebar.dashboard", icon: Gauge },
      {
        href: "/organizers",
        labelKey: "sidebar.organizers",
        icon: SquaresFour,
      },
      { href: "/events", labelKey: "sidebar.events", icon: CalendarBlank },
      { href: "/users", labelKey: "sidebar.users", icon: User },
      { href: "/billings", labelKey: "sidebar.billings", icon: InvoiceIcon },
      {
        href: "/transactions",
        labelKey: "sidebar.transactions",
        icon: ArrowsLeftRight,
      },
      { href: "/reports", labelKey: "sidebar.reports", icon: FileText },
      { href: "/settings", labelKey: "sidebar.settings", icon: Gear },
    ],
    [],
  );

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch {
      router.push("/auth/login");
    }
  };

  // Get user display name
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      t("sidebar.admin", "Admin")
    : t("sidebar.admin", "Admin");
  const displayEmail = user?.email || "";

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
          collapsed ? "w-20" : "w-56"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header with Logo and Collapse Button */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          {collapsed ? (
            <div className="flex justify-center w-full">
              <Ticket weight="duotone" size={28} className="text-blue-600" />
            </div>
          ) : (
            <>
              <span className="text-xl font-bold text-blue-600">E-Ticket</span>
              <button
                title="toggle-button"
                onClick={onToggle}
                className="hidden md:block p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CaretDoubleLeft
                  weight="bold"
                  className="size-4 text-gray-500"
                />
              </button>
            </>
          )}
          {collapsed && (
            <button
              title="toggle-button"
              onClick={onToggle}
              className="absolute -right-3 top-6 z-50 bg-white border border-gray-300 rounded-lg shadow-sm p-1.5 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all hidden md:block"
            >
              <CaretDoubleRight weight="bold" className="size-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navLinks.map(({ href, labelKey, icon: Icon }) => {
            // Check if current path matches or starts with the nav item path
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className="no-underline"
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`group flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all relative ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-blue-600 before:shadow-md"
                      : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon
                    weight="duotone"
                    className={`${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                    size={22}
                  />
                  {!collapsed && (
                    <span
                      className={`text-sm ${
                        isActive
                          ? "text-blue-700 font-medium"
                          : "text-gray-700 font-normal"
                      }`}
                    >
                      {t(labelKey)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={`flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <div className="relative w-9 h-9 shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
                  <User weight="duotone" className="h-5 w-5 text-gray-600" />
                </div>

                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="text-sm text-gray-800 font-medium truncate">
                      {displayName}
                    </span>
                    <CaretRight
                      weight="bold"
                      className="h-4 w-4 text-gray-400 shrink-0 ml-1"
                    />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 rounded-xl bg-white"
              side={collapsed ? "right" : "top"}
              align="start"
              sideOffset={8}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-3 border-b">
                <div className="relative w-10 h-10 shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
                  <User weight="duotone" className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {displayEmail}
                  </p>
                </div>
              </div>

              {/* Profile */}
              <DropdownMenuItem
                onClick={() => {
                  router.push("/settings/profile");
                  setSidebarOpen(false);
                }}
                className="cursor-pointer"
              >
                <User weight="duotone" className="mr-2 h-4 w-4 text-gray-600" />
                <span className="text-gray-700">
                  {t("sidebar.profile", "Profile")}
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <SignOut weight="duotone" className="mr-2 h-4 w-4" />
                <span>{t("sidebar.logout", "Logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
