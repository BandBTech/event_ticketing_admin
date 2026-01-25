"use client";

import React from "react";
import { usePendingOrganizers, usePendingEvents } from "@/hooks/useDashboard";

import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { DashboardStats } from "./components/DashboardStats";
import { OrganizerApprovalList } from "./components/OrganizerApproval";
import { EventApprovalList } from "./components/EventApproval";

const AdminDashboard: React.FC = () => {
  // TanStack Query hooks for stats
  const { data: pendingOrganizersData, isLoading: isLoadingOrganizers } = usePendingOrganizers();
  const { data: pendingEventsData, isLoading: isLoadingEvents } = usePendingEvents();

  const organizers = pendingOrganizersData?.organizers || [];
  const events = pendingEventsData?.events || [];

  // Show full skeleton on initial load
  if (isLoadingOrganizers && isLoadingEvents) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <DashboardStats organizers={organizers} events={events} />

        {/* Organizers Awaiting Approval Section */}
        <OrganizerApprovalList />

        {/* Events Awaiting Approval Section */}
        <EventApprovalList />
      </div>
    </div>
  );
};

export default AdminDashboard;

