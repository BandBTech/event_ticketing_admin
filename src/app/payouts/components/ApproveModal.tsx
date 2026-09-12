"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SpinnerIcon,
  CheckCircleIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { useLanguageStore } from "@/store/languageStore";
import { Textarea } from "@/components/ui/textarea";
import { PayoutService } from "@/services/payoutService";
import {
  approvePayoutSchema,
  ApprovePayoutFormValues,
  ApprovePayoutPayload,
} from "@/lib/validation";
import { PayoutRequest } from "@/types/payout";

interface ApproveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payout: PayoutRequest | null;
}

// ─── Post-approval confirmation dialog ───────────────────────────────────────

interface ViewBillsDialogProps {
  open: boolean;
  onViewBills: () => void;
  onSkip: () => void;
  t: (key: string, fallback: string) => string;
}

function ViewBillsDialog({
  open,
  onViewBills,
  onSkip,
  t,
}: ViewBillsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => onSkip()}>
      <DialogContent className="sm:max-w-[400px] shadow-2xl border-none bg-white/90 backdrop-blur-xl">
        <DialogHeader className="space-y-3 text-center items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircleIcon
              weight="fill"
              size={32}
              className="text-green-600"
            />
          </div>
          <DialogTitle className="text-xl font-bold">
            {t("payouts.modals.payoutApproved", "Payout Approved!")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {t(
              "payouts.modals.wannaViewBills",
              "Would you like to view the bills associated with this payout?",
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 pt-4 sm:flex-col">
          <Button onClick={onViewBills} className="w-full gap-2">
            <ReceiptIcon size={18} />
            {t("payouts.modals.viewBills", "View Bills")}
          </Button>
          <Button
            variant="outline"
            onClick={onSkip}
            className="w-full border-gray-200 hover:bg-gray-50"
          >
            {t("payouts.modals.noThanks", "No, thanks")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ApproveModal ────────────────────────────────────────────────────────

export default function ApproveModal({
  open,
  onOpenChange,
  payout,
}: ApproveModalProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();
  const router = useRouter();

  const [showViewBills, setShowViewBills] = useState(false);

  const schema = approvePayoutSchema(t);

  const form = useForm<ApprovePayoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { admin_notes: "" },
    mode: "onChange",
  });

  const createMutation = useMutation({
    mutationFn: (data: ApprovePayoutPayload) =>
      PayoutService.approvePayout(data),
    onSuccess: async () => {
      toast.success(t("", "Payout approved successfully"));
      await queryClient.invalidateQueries({
        queryKey: queryKeys.payouts.list,
      });
      onOpenChange(false);
      setShowViewBills(true);
    },
  });

  const onSubmit = (data: ApprovePayoutFormValues) => {
    createMutation.mutate({
      payoutId: payout?.id || "",
      admin_notes: data.admin_notes,
      status: "approved",
    });
  };

  const isPending = createMutation.isPending;

  const handleOpenChange = (open: boolean) => {
    if (!open && isPending) return;
    onOpenChange(open);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  // ── ViewBills dialog handlers ──
  const handleViewBills = () => {
    setShowViewBills(false);
    router.push(`/billings`);
  };

  const handleSkipBills = () => {
    setShowViewBills(false);
    onOpenChange(false);
  };

  return (
    <>
      {/* ── Approve form dialog ── */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[520px] overflow-y-scroll max-h-[90vh] shadow-2xl border-none bg-white/90 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold bg-primary bg-clip-text text-transparent">
              {t("payouts.modals.approvePayout", "Approve Payout")}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pt-4"
            >
              <FormField
                control={form.control}
                name="admin_notes"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel
                      required
                      className="text-sm font-semibold text-gray-700"
                    >
                      {t("payouts.modals.adminNotes", "Admin Notes")}
                    </FormLabel>
                    <div className="relative group">
                      <FormControl>
                        <Textarea
                          placeholder={t("payouts.modals.approvalReason", "Enter reason for approval")}
                          {...field}
                          maxLength={100}
                          className={cn(
                            "h-12 pr-4 max-w-[470px] bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                            fieldState.error &&
                              "border-destructive focus:ring-destructive/20",
                          )}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                        <p><TranslatedFormMessage t={t} /></p>
                        <p className="text-xs font-normal text-left text-muted-foreground">
                          {field.value?.toString().length || 0} /100 {t(
                            "common.characters",
                            "characters",
                          )}
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-3 pt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {t("common.cancelButton", "Cancel")}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("common.approve", "Approve")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Post-approval: View Bills? dialog ── */}
      <ViewBillsDialog
        open={showViewBills}
        onViewBills={handleViewBills}
        onSkip={handleSkipBills}
        t={t}
      />
    </>
  );
}
