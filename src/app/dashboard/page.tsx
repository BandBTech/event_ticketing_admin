"use client";

import React from "react";
import { DashboardStats } from "./components/DashboardStats";
import UpcomingEventsList from "./components/UpcomingEvents";
import { DashboardService } from "@/services/dashboardService";
import { useQuery } from "@tanstack/react-query";

const AdminDashboard: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => DashboardService.getDashboard({}),
  });

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (isError) {
    return <div>Error loading dashboard</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="min-h-[80vh] bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="p-6">
        <DashboardStats data={data} />
        <UpcomingEventsList data={data.upcoming_events_list} />
      </div>
    </div>
  );
};

export default AdminDashboard;
