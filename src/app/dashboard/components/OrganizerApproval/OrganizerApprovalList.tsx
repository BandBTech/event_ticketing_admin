
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { OrganizerCard } from "./OrganizerCard";
import { useApproveOrganizer, usePendingOrganizers, useRejectOrganizer } from "@/hooks/useDashboard";
import { toast } from "sonner";
import { EmptyState } from "../EmptyState";
import { useState } from "react";
import PopupModal from "../PopupModal";

interface ModalState {
  open: boolean;
  id?: string;
}

const OrganizerApprovalList = () => {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: pendingOrganizersData, isLoading: isLoadingOrganizers } =
    usePendingOrganizers();
  const approveOrganizerMutation = useApproveOrganizer();
  const rejectOrganizerMutation = useRejectOrganizer();

  const [rejectOrganizerModal, setRejectOrganizerModal] = useState<ModalState>({ open: false });

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
      }
    );
  };


  const organizers = pendingOrganizersData?.organizers || [];
  return (
    <>
      <div className="bg-white rounded-2xl glass-card-lower border border-gray-100/50 mt-4">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("dashboard.orgazinersAwaitingApproval")}
          </h2>
        </div>

        <div>
          {isLoadingOrganizers ? (
            <>Loading...</>
            // <div className="space-y-4">
            //   <ListItemSkeleton />
            //   <ListItemSkeleton />
            // </div>
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
