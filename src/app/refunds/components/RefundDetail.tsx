"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { Skeleton } from "@/components/ui/skeleton";

interface PayoutRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEventId?: string;
}

export function RefundDetail({
  open,
  onOpenChange,
}: PayoutRequestDialogProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-gray-900">
        <DialogHeader>
          <DialogTitle>
            {t("payouts.create.title", "Refund Detail")}
          </DialogTitle>
          {/* <DialogDescription>
            {t(
              "payouts.create.description",
              "Submit a request to withdraw your earnings.",
            )}
          </DialogDescription> */}
        </DialogHeader>
        <div><Skeleton className="h-4 w-full" /></div>
        <div><Skeleton className="h-4 w-full" /></div>
        <div><Skeleton className="h-4 w-full" /></div>
        <div><Skeleton className="h-4 w-full" /></div>
        <div><Skeleton className="h-4 w-full" /></div>
        <div><Skeleton className="h-4 w-full" /></div>
        <div><Skeleton className="h-4 w-full" /></div>
        <div><Skeleton className="h-4 w-full" /></div>

        <DialogFooter className="gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
