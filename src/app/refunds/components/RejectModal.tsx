"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SpinnerIcon } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  rejectRefundSchema,
  RejectRefundFormValues,
  RejectRefundPayload,
} from "@/lib/validation";
import { RefundService } from "@/services/refundService";
import { Refund } from "@/types/refunds";

interface RejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refund: Refund | null;
}

export default function RejectModal({
  open,
  onOpenChange,
  refund,
}: RejectModalProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();

  const schema = rejectRefundSchema(t);

  const form = useForm<RejectRefundFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      admin_notes: "",
    },
    mode: "onChange",
  });

  const createMutation = useMutation({
    mutationFn: (data: RejectRefundPayload) => RefundService.rejectRefund(data),
    onSuccess: async () => {
      toast.success(t("", "Refund rejected successfully"));
      await queryClient.invalidateQueries({
        queryKey: queryKeys.organizers.list,
      });
      onOpenChange(false);
    },
  });

  const onSubmit = (data: RejectRefundFormValues) => {
    createMutation.mutate({
      refundId: refund?.id || "",
      additionalProp1: data.admin_notes,
    });
  };
  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const isPending = createMutation.isPending;

  // Prevent dialog dismissal (overlay/Escape) while mutation is in-flight
  const handleOpenChange = (open: boolean) => {
    // if (!open && isPending) return;
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] overflow-y-scroll max-h-[90vh] shadow-2xl border-none bg-white/90 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold bg-red-500 bg-clip-text text-transparent">
            {t("", "Reject Refund")}
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
                    {t("", "Admin Notes")}
                  </FormLabel>
                  <div className="relative group">
                    <FormControl>
                      <Textarea
                        placeholder={t("", "Enter reason for rejection")}
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
                      <p>
                        <TranslatedFormMessage t={t} />
                      </p>
                      <p className="text-xs font-normal text-left text-muted-foreground">
                        {field.value?.toString().length || 0} /100 characters
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
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                variant={"destructive"}
                type="submit"
                disabled={isPending}
              >
                {isPending && (
                  <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("", "Reject")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
