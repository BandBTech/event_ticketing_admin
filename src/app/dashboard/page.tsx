"use client";

import React from "react";
import { DashboardStats } from "./components/DashboardStats";
import { OrganizerApprovalList } from "./components/OrganizerApproval";
import { EventApprovalList } from "./components/EventApproval";

const AdminDashboard: React.FC = () => {
  // TanStack Query hooks for stats

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <DashboardStats />

        {/* Organizers Awaiting Approval Section */}
        <OrganizerApprovalList />

        {/* Events Awaiting Approval Section */}
        <EventApprovalList />
      </div>
    </div>
  );
};

export default AdminDashboard;
