"use client";

import React from "react";
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
import { RefundResponse, Refund, RefundData } from "@/types/refunds";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { RefundService } from "@/services/refundService";
import { formatCurrency, formatDateTimeLong } from "@/lib/utils";
import { useEffect } from "react";

interface PayoutRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEventId?: string;
  refundData: Refund | null;
}

export function RefundDetail({
  refundData,
  open,
  onOpenChange,
}: PayoutRequestDialogProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const refund_id = refundData?.id;
  const [data, setData] = React.useState<RefundData | null>(null);

  const { data: refundDetailData, isLoading } = useQuery<RefundData>({
    queryKey: queryKeys.refunds.detail(refund_id),
    queryFn: () => RefundService.getRefundbyId(refund_id),
    enabled: open,
  });

  useEffect(() => {
    setData(refundDetailData || null);
  }, [refundDetailData]);

  const ListItemSkeleton = () => {
    return (
      <div className="flex items-center justify-around gap-8 px-3 py-2 m-2 border-b max-w-2xl h-30 bg-gray-200 rounded-2xl border-gray-100 last:border-b-0 transition-colors">
        <div className="grid gap-2">
          <Skeleton className="w-40 h-6 " />
          <Skeleton className="w-40 h-6 " />
        </div>
        <div className="grid gap-2">
          <Skeleton className="w-40 h-6 " />
          <Skeleton className="w-40 h-6 " />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg text-gray-900">
        <DialogHeader>
          <DialogTitle>
            {t("payouts.create.title", "Refund Detail")}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>
            <div>
              <ListItemSkeleton />
            </div>
            <div>
              <ListItemSkeleton />
            </div>
            <div>
              <ListItemSkeleton />
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            {/* Initiated By */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
              <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                Initiated By
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="text-gray-500">Name</div>
                <div>{data?.initiated_by.name}</div>

                <div className="text-gray-500">Email</div>
                <div className="text-blue-600">{data?.initiated_by.email}</div>
              </div>
            </div>

            {/* Refund Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                  Refund Info
                </h3>
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      data?.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : data?.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {data?.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="text-gray-500">Refund Number</div>
                <div className="font-medium break-all">
                  {data?.refund_number}
                </div>

                <div className="text-gray-500">Amount</div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-green-600">
                    {formatCurrency(data?.amount || 0, data?.currency, locale)}
                  </div>
                  <div className="font-semibold">
                    ( {data?.ticket_count} ticket(s) )
                  </div>
                </div>

                <div className="text-gray-500">Reason</div>
                <div className="italic text-gray-700">{data?.reason}</div>

                <div className="text-gray-500">Requested At</div>
                <div>{formatDateTimeLong(data?.requested_at, locale)}</div>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                  Transaction
                </h3>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {data?.transaction.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="text-gray-500">Transaction Amount</div>
                <div className="font-semibold">
                  {formatCurrency(
                    data?.transaction.amount || 0,
                    data?.currency,
                    locale,
                  )}
                </div>

                <div className="text-gray-500">Gateway</div>
                <div className="capitalize">{data?.transaction.gateway}</div>

                <div className="text-gray-500">Date</div>
                <div>
                  {formatDateTimeLong(data?.transaction?.created_at, locale)}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 mt-4">
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
