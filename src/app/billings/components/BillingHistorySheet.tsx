import React from "react";
import { Banknote, Building2, Receipt } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useQuery } from "@tanstack/react-query";
import { BillingService } from "@/services/billingService";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PaymentHistoryData,
  BillingHistorySheetProps,
  PaymentHistory,
} from "@/types/billings";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const ListItemSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2 m-2 border-b max-w-2xl bg-gray-200 rounded-2xl border-gray-100 last:border-b-0 transition-colors">
      <div className="grid gap-2">
        <Skeleton className="w-56 h-6 " />
        <Skeleton className="w-56 h-6 " />
      </div>
      <div className="grid gap-2">
        <Skeleton className="w-32 h-6 " />
        <Skeleton className="w-32 h-6 " />
      </div>
    </div>
  );
};

function PaymentMethodBadge({ method }: { method: string }) {
  const isBankTransfer = method === "bank_transfer";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isBankTransfer
          ? "bg-blue-100 text-blue-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {isBankTransfer ? (
        <Building2 className="h-3 w-3" />
      ) : (
        <Banknote className="h-3 w-3" />
      )}
      {isBankTransfer ? "Bank Transfer" : "Cash"}
    </span>
  );
}

export function BillingHistorySheet({
  open,
  onOpenChange,
  billId,
}: BillingHistorySheetProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const userId = "7da6bd9d-81f6-4ae6-a0a4-6f910f806ce2";
  const billsId = billId || userId;

  const {
    data: billHistoryData,
    isLoading,
    isError,
  } = useQuery<PaymentHistoryData[]>({
    queryKey: ["billHistory", billsId],
    queryFn: () => BillingService.getBillHistory(billsId),
    enabled: open,
  });

  const historyData = billHistoryData || [];

  const totalTransactions = historyData.length || 0;
  const totalAmount = Array.isArray(historyData)
    ? historyData.reduce((sum, item) => sum + (item.amount || 0), 0)
    : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[450px] sm:max-w-[450px] flex flex-col bg-[#f5f7f8]"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Billing History
          </SheetTitle>
        </SheetHeader>

        {/* Summary */}
        {isLoading ? (
          <div className="space-y-0 grid gap-6">
            <div>
              <div className=" gap-4 px-3 py-2 m-2 border-b max-w-2xl bg-gray-200 rounded-2xl border-gray-100 last:border-b-0 transition-colors">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-30 h-6 " />
                  <Skeleton className="w-30 h-6 " />
                </div>
              </div>
            </div>
            <div>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 py-2 px-1">
            <div className="mx-1 mt-3 mb-1 rounded-xl bg-white border border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Receipt className="h-4 w-4" />
                <span>{totalTransactions} transactions</span>
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Total:{" "}
                <span className="text-indigo-600">
                  ${totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2 px-1">
              {!Array.isArray(historyData) || historyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                  <Receipt className="h-8 w-8 mb-2 opacity-40" />
                  No payment history found.
                </div>
              ) : (
                Array.isArray(historyData) &&
                historyData.map((item: PaymentHistory) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-2"
                  >
                    {/* Top row: amount + method */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">
                        ${item.amount?.toLocaleString()}
                      </span>
                      <PaymentMethodBadge method={item.payment_method} />
                    </div>

                    {/* Middle: dates */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Payment date:{" "}
                        <span className="font-medium text-gray-700">
                          {formatDate(item.payment_date)}
                        </span>
                      </span>
                      <span>
                        {item.screenshot_url && (
                          <a
                            href={item.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            View Screenshot
                          </a>
                        )}
                      </span>
                    </div>

                    {/* Bottom: processed by */}
                    <div className="text-xs text-gray-500">
                      Processed by:{" "}
                      <span className="font-medium text-gray-700">
                        {item.processed_by}
                      </span>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <div className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                        Notes:{" "}
                        <span className="font-medium text-gray-700">
                          {item.notes}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
