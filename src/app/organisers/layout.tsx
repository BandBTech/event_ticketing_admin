// src/app/organisers/layout.tsx
"use client";

import Sidebar from "@/app/components/Sidebar/Sidebar";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";

export default function OrganisersLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

