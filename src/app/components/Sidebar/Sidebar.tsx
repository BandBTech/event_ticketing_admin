"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Gauge,
  Calendar,
  FileText,
  Settings,
  User,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/authService";
import AdminProfileModal from "@/app/components/AdminProfileModal";

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  defaultCollapsed?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  country_code: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeItem = "dashboard",
  onItemClick,
  defaultCollapsed = false,
}) => {
  const [active, setActive] = useState(activeItem);
  const [isClient, setIsClient] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const res = (await authService.getProfile()) as UserProfile;
      setProfileData(res);
    }
    loadData();
  }, []);

  useEffect(() => {
    setIsClient(true);
    const storedActiveItem = localStorage.getItem("activeItem");
    const storedCollapsed = localStorage.getItem("sidebarCollapsed");

    if (storedActiveItem) {
      setActive(storedActiveItem);
    }
    if (storedCollapsed) {
      setIsCollapsed(JSON.parse(storedCollapsed));
    }
  }, []);

  const handleRedirect = (item: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeItem", item.slice(1));
    }
    router.push(item);
  };

  const handleItemClick = (item: string) => {
    setActive(item);
    onItemClick?.(item);
  };

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "sidebarCollapsed",
        JSON.stringify(newCollapsedState)
      );
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("activeItem");
      localStorage.removeItem("sidebarCollapsed");
    }
    router.push("/auth/login");
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Gauge,
      link: "/dashboard",
    },
    {
      id: "organisers",
      label: "Organisers",
      icon: LayoutDashboard,
      link: "/organisers",
    },
    {
      id: "events",
      label: "Events",
      icon: Calendar,
      link: "/events",
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      link: "/reports",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      link: "/settings",
    },
  ];

  return (
    <>
      <div
        className={`${
          isCollapsed ? "w-16" : "w-64"
        } h-screen fixed top-0 left-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-30`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-semibold text-blue-600 transition-opacity duration-300">
              Timro-Ticket
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronsRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronsLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const storedActiveItem = isClient
                ? localStorage.getItem("activeItem")
                : null;
              const isActive =
                storedActiveItem === item.id ||
                (!storedActiveItem && active === item.id);

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      handleItemClick(item.id);
                      handleRedirect(item.link);
                    }}
                    className={`w-full flex items-center text-sm font-medium rounded-lg transition-all duration-300 relative group ${
                      isCollapsed ? "px-2 py-3 justify-center" : "px-4 py-3"
                    } ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"></div>
                    )}

                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isCollapsed ? "" : "mr-3"
                      } ${isActive ? "text-blue-600" : "text-gray-400"}`}
                    />

                    {!isCollapsed && (
                      <span className="transition-all duration-300 opacity-100">
                        {item.label}
                      </span>
                    )}

                    {isCollapsed && (
                      <div className="absolute left-16 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`w-full flex items-center hover:bg-gray-50 rounded-lg p-2 cursor-pointer transition-colors ${
              isCollapsed ? "justify-center" : "space-x-3"
            }`}
          >
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            {!isCollapsed && (
              <div className="flex min-w-0 transition-opacity duration-300 items-center justify-between gap-5">
                <p className="text-sm font-medium text-gray-900 truncate">
                  <span className="mr-1">{profileData?.first_name}</span>
                  <span>{profileData?.last_name}</span>
                </p>
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </div>
            )}
          </button>
        </div>
      </div>

      {showProfileMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileMenu(false)}
          />

          <div
            className={`absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${
              isCollapsed ? "left-16 bottom-10" : "left-44 bottom-10"
            } w-56`}
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                <span className="mr-1">{profileData?.first_name}</span>
                <span>{profileData?.last_name}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {profileData?.email}
              </p>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  setShowAdminProfile(true);
                  console.log("Navigate to profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4 text-gray-600" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-blue-600" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {showAdminProfile && 
      <AdminProfileModal 
      setShowAdminProfile={setShowAdminProfile}
      profileData={profileData}
      />}
    </>
  );
};

export default Sidebar;
