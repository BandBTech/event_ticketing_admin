"use client";

import { usePendingEvents, usePendingOrganizers } from "@/hooks/useDashboard";
import { useTranslation } from "@/hooks/useTranslation";
import { DashboardService } from "@/services/dashboardService";
import { useEventStore } from "@/store/eventStore";
import { useLanguageStore } from "@/store/languageStore";
import { useOrganizerStore } from "@/store/organizerStore";
import {
  ArchiveIcon,
  ArrowsClockwiseIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { DashboardStats } from "./components/DashboardStats";
import UpcomingEventsList from "./components/UpcomingEvents";
import Head from "next/head";

const AdminDashboard: React.FC = () => {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => DashboardService.getDashboard({}),
  });

  const { data: pendingEventsData, isLoading: isLoadingEvents } =
    usePendingEvents();

  const setTotalPendingEvents = useEventStore(
    (state) => state.setTotalPendingEvents,
  );

  useEffect(() => {
    const totalNumberOfPendingEvents =
      pendingEventsData?.pagination?.total || 0;
    setTotalPendingEvents(totalNumberOfPendingEvents);
  }, [pendingEventsData, setTotalPendingEvents]);

  const { data: pendingOrganizersData, isLoading: isLoadingOrganizers } =
    usePendingOrganizers();

  const setTotalPendingOrganizers = useOrganizerStore(
    (state) => state.setTotalPendingOrganizers,
  );

  useEffect(() => {
    const totalNumberOfPendingOrganizer =
      pendingOrganizersData?.pagination?.total || 0;
    setTotalPendingOrganizers(totalNumberOfPendingOrganizer);
  }, [pendingOrganizersData, setTotalPendingOrganizers]);

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
              {t("dashboard.dataDisplay.errorTitle")}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("dashboard.dataDisplay.errorSubtitle")}
            </p>
          </div>

          {/* Action */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            <ArrowsClockwiseIcon size={18} />
            {t("dashboard.dataDisplay.tryAgain")}
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
              {t("dashboard.dataDisplay.noDataTitle")}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("dashboard.dataDisplay.noDataSubtitle")}
            </p>
          </div>

          {/* Action */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowsClockwiseIcon size={18} />
            {t("dashboard.dataDisplay.refresh")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | Timro-Ticket</title>
      </Head>
      <div className="min-h-[80vh] bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="p-4">
          <DashboardStats data={data} />
          {data.upcoming_events_list.length > 0 && (
            <UpcomingEventsList data={data.upcoming_events_list} />
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
