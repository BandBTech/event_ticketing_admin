"use client";

import React from "react";
import { DashboardStats } from "./components/DashboardStats";
import UpcomingEventsList from "./components/UpcomingEvents";
import { DashboardService } from "@/services/dashboardService";
import { useQuery } from "@tanstack/react-query";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import {
  WarningIcon,
  ArrowsClockwiseIcon,
  ArchiveIcon,
} from "@phosphor-icons/react";

const AdminDashboard: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => DashboardService.getDashboard({}),
  });

  if (isLoading) {
    return (
      <div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid justify-center items-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-100">
            <WarningIcon size={32} className="text-red-500" />
          </div>

          {/* Text */}
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold text-gray-800">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Failed to load dashboard data. Please try again later or contact
              support if the issue persists.
            </p>
          </div>

          {/* Action */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            <ArrowsClockwiseIcon size={18} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid justify-center items-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 border border-gray-200">
            <ArchiveIcon size={32} className="text-gray-400" />
          </div>

          {/* Text */}
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold text-gray-800">
              No data available
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              There&apos;s nothing to display here yet. Data will appear once it
              becomes available.
            </p>
          </div>

          {/* Action */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowsClockwiseIcon size={18} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="p-6 rounded-lg shadow-sm grid gap-6">
        <DashboardStats data={data} />
        {data.upcoming_events_list.length > 0 && (
          <UpcomingEventsList data={data.upcoming_events_list} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
