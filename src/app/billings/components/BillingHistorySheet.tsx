import React from "react";
import {
  DeviceMobileCameraIcon,
  BankIcon,
  ReceiptIcon,
  StripeLogoIcon,
  MoneyIcon,
} from "@phosphor-icons/react";
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
import { PaymentHistory, BillingHistorySheetProps } from "@/types/billings";
import { formatCurrency } from "@/lib/utils";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-CA");
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
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      {method === "bank_transfer" ? (
        <BankIcon className="h-3 w-3" />
      ) : method === "mobile_payment" ? (
        <DeviceMobileCameraIcon className="h-3 w-3" />
      ) : method === "cheque" || method === "check" ? (
        <ReceiptIcon className="h-3 w-3" />
      ) : method === "stripe" ? (
        <StripeLogoIcon className="h-3 w-3" />
      ) : (
        <MoneyIcon className="h-3 w-3" />
      )}
      {t("billings.method." + method)}
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
  } = useQuery<PaymentHistory[]>({
    queryKey: ["billHistory", billsId],
    queryFn: () => BillingService.getBillHistory(billsId),
    enabled: open,
  });

  const historyData = billHistoryData || [];

  const totalTransactions = historyData.length || 0;
  const totalAmount = Array.isArray(historyData)
    ? historyData.reduce((sum, item) => sum + (item.amount || 0), 0)
    : 0;
  const symbol =
    Array.isArray(historyData) && historyData.length > 0
      ? historyData[0].event.symbol
      : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[450px] sm:max-w-[450px] flex flex-col bg-[#f5f7f8]"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {t("billings.billHistory.billingHistory")}
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
              <div className="flex items-center gap-2 text-sm text-black">
                <ReceiptIcon className="h-4 w-4" />
                <span>
                  {totalTransactions} {t("dashboard.dataDisplay.transactions")}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {t("dashboard.dataDisplay.total")}:{" "}
                <span className="text-indigo-600">
                  {formatCurrency(totalAmount, symbol)}
                </span>
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2 px-1">
              {!Array.isArray(historyData) || historyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                  <ReceiptIcon className="h-8 w-8 mb-2 opacity-40" />
                  {t("billings.billHistory.noPaymentHistoryFound")}
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
                        {formatCurrency(item.amount, item.event.symbol)}
                      </span>
                      <PaymentMethodBadge method={item.method} />
                    </div>

                    {/* Middle: dates */}
                    <div className="flex items-center justify-between text-xs text-black">
                      <span>
                        {t("billings.billHistory.processedBy")}:{" "}
                        <span className="font-semibold text-black">
                          {item.processed_by}
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
                            {t("billings.billHistory.viewScreenshot")}
                          </a>
                        )}
                      </span>
                    </div>

                    {/* Bottom: processed by */}
                    <div className="text-xs text-black">
                      {t("billings.addPaymentToBill.paymentDate")}:{" "}
                      <span className="font-semibold text-black">
                        {formatDate(item.paid_at)}
                      </span>
                    </div>

                    {/* Bottom: processed by */}
                    <div className="text-xs text-black">
                      {t("billings.addPaymentToBill.billCreationDate")}:{" "}
                      <span className="font-semibold text-black">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <div className="text-xs text-black overflow-hidden text-ellipsis whitespace-nowrap">
                        {t("billings.billUpdate.notes")}:{" "}
                        <span className="font-semibold text-black">
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
