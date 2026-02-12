import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { OrganizerCard } from "./OrganizerCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApproveOrganizer,
  usePendingOrganizers,
  useRejectOrganizer,
} from "@/hooks/useDashboard";
import { toast } from "sonner";
import { EmptyState } from "../EmptyState";
import { useState } from "react";
import PopupModal from "../EventApproval/PopupModal";

interface ModalState {
  open: boolean;
  id?: string;
}

const ListItemSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 px-4 py-3 border-gray-100 border-b last:border-b-0">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 w-full flex flex-col items-center sm:items-start gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="w-full sm:w-auto flex justify-center sm:justify-end">
        <Skeleton className="h-9 w-[180px]" />
      </div>
    </div>
  );
};

const OrganizerApprovalList = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: pendingOrganizersData, isLoading: isLoadingOrganizers } =
    usePendingOrganizers();
  const approveOrganizerMutation = useApproveOrganizer();
  const rejectOrganizerMutation = useRejectOrganizer();

  const [rejectOrganizerModal, setRejectOrganizerModal] = useState<ModalState>({
    open: false,
  });

  const handleApproveOrganizer = (organizerId: string) => {
    approveOrganizerMutation.mutate(organizerId, {
      onSuccess: () => {
        toast.success(t("dashboard.toast.organizerApproved"));
      },
    });
  };

  const handleRejectOrganizer = (data: { adminRemark: string }) => {
    if (!rejectOrganizerModal.id) return;

    rejectOrganizerMutation.mutate(
      { organizerId: rejectOrganizerModal.id, adminRemark: data.adminRemark },
      {
        onSuccess: () => {
          toast.success(t("dashboard.toast.organizerRejected"));
          setRejectOrganizerModal({ open: false });
        },
      },
    );
  };

  const organizers = pendingOrganizersData?.organizers || [];
  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full z-50 w-[400px] bg-white rounded-l-2xl border shadow-xl transform transition-transform duration-700 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-medium text-muted-foreground">
            {t("dashboard.orgazinersAwaitingApproval")}
          </h2>
          <button
            className="text-gray-500 font-bold hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <div>
          {isLoadingOrganizers ? (
            <div className="space-y-0">
              {[1, 2, 3].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          ) : organizers?.length > 0 ? (
            <>
              {organizers?.map((organizer) => (
                <OrganizerCard
                  key={organizer.id}
                  organizer={organizer}
                  onApprove={handleApproveOrganizer}
                  onReject={(id) => setRejectOrganizerModal({ open: true, id })}
                  isApproving={approveOrganizerMutation.isPending}
                />
              ))}
            </>
          ) : (
            <EmptyState
              title={t("dashboard.noOrganizersAwaitingApproval")}
              message={t("dashboard.noOrganizersAwaitingApprovalMessage")}
            />
          )}
        </div>
      </div>

      {/* Reject Organizer Modal */}
      {rejectOrganizerModal.open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setRejectOrganizerModal({ open: false })}
          />
          <PopupModal
            title={t("dashboard.modal.rejectOrganizer")}
            isApprove={false}
            showCommissionInput={false}
            isLoading={rejectOrganizerMutation.isPending}
            onCancel={() => setRejectOrganizerModal({ open: false })}
            onConfirm={handleRejectOrganizer}
          />
        </>
      )}
    </>
  );
};

export default OrganizerApprovalList;
