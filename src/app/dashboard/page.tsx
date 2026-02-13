"use client";

import React from "react";
import { DashboardStats } from "./components/DashboardStats";

const AdminDashboard: React.FC = () => {
  // TanStack Query hooks for stats

  return (
    <div className="min-h-[80vh] bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <DashboardStats />
      </div>
    </div>
  );
};

export default AdminDashboard;
