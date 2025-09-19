// src/app/dashboard/layout.tsx
import Sidebar from "@/app/components/Sidebar/Sidebar";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
