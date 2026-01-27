import { CalendarIcon, CalendarStarIcon, ClockIcon, UsersIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { usePendingOrganizers, usePendingEvents } from "@/hooks/useDashboard";
import { StatCardSkeleton } from "../DashboardSkeleton";

const DashboardStats = () => {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { data: pendingOrganizersData, isLoading: isLoadingOrganizers } = usePendingOrganizers();
  const { data: pendingEventsData, isLoading: isLoadingEvents } = usePendingEvents();

  const organizers = pendingOrganizersData?.organizers || [];
  const events = pendingEventsData?.events || [];

  if (isLoadingOrganizers && isLoadingEvents) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }
  return (

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Successful Events Card */}
      <div className="bg-white glass-card-lower rounded-2xl p-6 shadow-sm border border-gray-100/50">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CalendarStarIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900 mb-1">24</div>
            <div className="text-sm text-gray-600 font-medium">
              {t("dashboard.successfulEvents")}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approval Card */}
      <div className="bg-white glass-card-lower rounded-2xl p-6 shadow-sm border border-gray-100/50">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <ClockIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {organizers.length + events.length}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {t("dashboard.pendingApproval")}
            </div>
          </div>
        </div>
      </div>

      {/* Organizers Card */}
      <div className="bg-white glass-card-lower rounded-2xl p-6 shadow-sm border border-gray-100/50">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <UsersIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900 mb-1">8</div>
            <div className="text-sm text-gray-600 font-medium">
              {t("dashboard.organizers")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
