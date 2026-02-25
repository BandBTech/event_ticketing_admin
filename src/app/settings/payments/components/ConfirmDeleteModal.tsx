"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { useLanguageStore } from "@/store/languageStore";
import { usePaymentStore } from "@/store/paymentStore";
import { PaymentGatewayService } from "@/services/paymentService";
import { useRouter } from "next/navigation";
import { SpinnerIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  open: boolean;
  closePasswordModal: () => void;
  onClose: () => void;
  onPasswordFieldOpen: () => void;
}

export default function ConfirmDeleteModal({
  open,
  closePasswordModal,
  onClose,
  onPasswordFieldOpen,
}: ConfirmDeleteModalProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();
  const router = useRouter();

  const paymentData = usePaymentStore((state) => state);
  const id = paymentData?.id;

  const deleteMutation = useMutation({
    mutationFn: () =>
      id ? PaymentGatewayService.deletePaymentGateway(id) : Promise.reject(),
    onSuccess: async () => {
      toast.success("Payment gateway deleted successfully");

      await queryClient.invalidateQueries({
        queryKey: queryKeys.organizers.list,
      });

      onClose();
      router.push("/settings/payments");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete payment gateway");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={closePasswordModal}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Top Danger Section */}
        <div className=" px-6 py-5 border-b border-red-100 flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full">
            <WarningCircleIcon
              size={22}
              weight="fill"
              className="text-red-600"
            />
          </div>

          <div>
            <DialogTitle className="text-lg font-semibold text-red-700">
              Delete Payment Gateway
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-red-600">
              This action cannot be undone.
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to permanently delete this payment gateway?
            This will disable all transactions connected to it.
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={closePasswordModal}
            disabled={deleteMutation.isPending}
            className="h-10 px-5"
          >
            Cancel
          </Button>

          <Button
            onClick={onPasswordFieldOpen}
            disabled={deleteMutation.isPending}
            className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteMutation.isPending && (
              <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
