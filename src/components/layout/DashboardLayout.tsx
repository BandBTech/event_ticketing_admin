"use client";

import { Suspense, useRef, useEffect } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import DashboardHeader from "@/components/layout/dashboard-header";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { useSidebarResponsive } from "@/hooks/useSidebarResponsive";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSidebarResponsive();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty("--header-height", `${height}px`);
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
      <div className="flex h-screen overflow-hidden bg-gray-50/50">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header ref={headerRef} className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-6">
            <Suspense fallback={<div className="flex-1" />}>
              <DashboardHeader />
            </Suspense>
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
