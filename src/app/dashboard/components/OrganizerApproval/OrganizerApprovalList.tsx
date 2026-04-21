import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { OrganizerCard } from "./OrganizerCard";
import { useOrganizerStore } from "@/store/organizerStore";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApproveOrganizer,
  usePendingOrganizers,
  useRejectOrganizer,
} from "@/hooks/useDashboard";
import { toast } from "sonner";
import { EmptyState } from "../EmptyState";
import { useEffect, useState } from "react";
import PopupModal from "../EventApproval/PopupModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ModalState {
  open: boolean;
  id?: string;
}

const ListItemSkeleton = () => {
  return (
    <div className="flex items-center gap-4 px-3 py-2 m-2 border-b max-w-2xl bg-gray-200 rounded-2xl border-gray-100 last:border-b-0 transition-colors">
      <div>
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      </div>
      <div className="grid gap-2">
        <Skeleton className="w-56 h-6 " />
        <Skeleton className="w-56 h-6 " />
      </div>
      <div className="flex gap-2 ml-auto">
        <Skeleton className="w-8 h-8 " />
        <Skeleton className="w-8 h-8 " />
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

  const setTotalPendingOrganizers = useOrganizerStore(
    (state) => state.setTotalPendingOrganizers,
  );

  useEffect(() => {
    const totalNumberOfPendingOrganizer =
      pendingOrganizersData?.pagination?.total || 0;
    setTotalPendingOrganizers(totalNumberOfPendingOrganizer);
  }, [pendingOrganizersData, setTotalPendingOrganizers]);

  const approveOrganizerMutation = useApproveOrganizer();
  const rejectOrganizerMutation = useRejectOrganizer();

  const [rejectOrganizerModal, setRejectOrganizerModal] = useState<ModalState>({
    open: false,
  });

  const [approveOrganizerModal, setApproveOrganizerModal] =
    useState<ModalState>({
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-[450px] sm:max-w-[450px] flex flex-col bg-[#f5f7f8]"
      >
        <SheetHeader>
          <SheetTitle>{t("dashboard.orgazinersAwaitingApproval")}</SheetTitle>
        </SheetHeader>

        <div className="overflow-auto">
          {isLoadingOrganizers ? (
            <div className="space-y-0">
              {[1, 2, 3, 4,5, 6, 7].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          ) : organizers?.length > 0 ? (
            <>
              {organizers?.map((organizer) => (
                <OrganizerCard
                  key={organizer.id}
                  organizer={organizer}
                  onApprove={(id) =>
                    setApproveOrganizerModal({ open: true, id })
                  }
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

        {/* Approve Organizer Modal */}
        {approveOrganizerModal.open && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setApproveOrganizerModal({ open: false })}
            />
            <AlertDialog
              open={approveOrganizerModal.open}
              onOpenChange={(open) =>
                setApproveOrganizerModal((prev) => ({ ...prev, open }))
              }
            >
              <AlertDialogContent className="rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold text-gray-900">
                    {t("organizer.management.modals.approveTitle", "")}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-500 text-base">
                    {t("organizer.management.modals.approveDesc", "")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-6">
                  <AlertDialogCancel
                    onClick={() => setApproveOrganizerModal({ open: false })}
                    className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {t("common.cancelButton", "Cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      handleApproveOrganizer(approveOrganizerModal.id!)
                    }
                    className="h-11 px-8 active:scale-95"
                  >
                    {t("common.confirm", "Confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default OrganizerApprovalList;
