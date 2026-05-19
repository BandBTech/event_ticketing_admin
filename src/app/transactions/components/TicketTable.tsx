"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DotsThreeVertical as DotsThreeVerticalIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/ReusableTable";
import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { Ticket } from "@/types/paymenttransactiondetail";
import { RefundService } from "@/services/refundService";

interface PayoutTableProps {
  billings: Ticket[];
  symbol: string | undefined;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  total?: number;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (
    sortBy: string | undefined,
    sortOrder: "asc" | "desc" | undefined,
  ) => void;
  setIsCancelBillDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenCancelBill: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function TicketTable({
  billings,
  symbol,
  isLoading,
  currentPage,
  totalPages,
  total,
  limit,
  onLimitChange,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  setIsCancelBillDialogOpen,
  onOpenCancelBill,
  searchQuery,
  onSearchChange,
}: PayoutTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const [ticketData, setTicketData] = React.useState<Ticket | null>(null);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = React.useState(searchQuery ?? "");

  // Add this inside the component, after the searchInput state
  const filteredBillings = React.useMemo(() => {
    if (!searchInput.trim()) return billings;
    return billings.filter((ticket) =>
      ticket.ticket_number
        ?.toLowerCase()
        .includes(searchInput.trim().toLowerCase()),
    );
  }, [billings, searchInput]);

  // Sync local input if parent resets searchQuery externally
  React.useEffect(() => {
    setSearchInput(searchQuery ?? "");
  }, [searchQuery]);

  // Debounced search — waits 400ms after user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (searchQuery ?? "")) {
        onSearchChange?.(searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, onSearchChange]);

  const createMutation = useMutation({
    mutationFn: (data: { reason: string; ticketID: string }) =>
      RefundService.createRefund({
        reason: data.reason,
        ticketID: data.ticketID,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["refunds"] });
      setIsCancelBillDialogOpen(false);
    },
  });

  // Table columns
  const columns: ColumnDef<Ticket>[] = React.useMemo(
    () => [
      {
        id: "ticket_number",
        header: t("transactions.paymentDetails.ticketNumber", "Ticket Number"),
        cell: ({ row }) => (
          <span className="max-w-[200px] text-gray-700 truncate inline-block">
            {row.original.ticket_number || "-"}
          </span>
        ),
      },
      {
        id: "tier",
        header: t("transactions.paymentDetails.tier", "Tier"),
        accessorKey: "tier.tier_name",
      },
      // {
      //   id: "holder",
      //   header: t("transactions.paymentDetails.holder", "Holder"),
      //   accessorKey: "user.name",
      // },
      {
        id: "amount",
        header: t("transactions.table.amount", "Amount"),
        title: "Amount",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-2">
            {formatCurrency(row.original.total_amount, symbol)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("transactions.table.status", "Status"),
        cell: ({ row }) => {
          const status = row.original.status;

          const statusStyles: Record<string, string> = {
            active: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            expired: "bg-yellow-100 text-yellow-700",
            failed: "bg-red-100 text-red-700",
            canceled: "bg-red-100 text-red-700",
            refunded: "bg-gray-200 text-gray-700",
          };

          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                statusStyles[status?.toLowerCase()] ||
                "bg-gray-100 text-gray-700"
              }`}
            >
              {t("status." + status)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const ticket = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={ticket.status.toLowerCase() !== "active"}
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Open menu</span>
                  <DotsThreeVerticalIcon weight="duotone" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    setTicketData(ticket);
                    setIsCancelBillDialogOpen(true);
                  }}
                >
                  <div className="flex justify-start items-center bg-gray-50 text-red-700">
                    <XCircleIcon weight="duotone" className="mr-2 h-4 w-4" />
                    {t("transactions.table.cancelTicket")}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t],
  );

  return (
    <>
      <div className="relative w-full sm:w-80 mb-4 ml-2 flex items-center gap-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={t(
            "transactions.paymentDetails.searchTickets",
            "Search Tickets",
          )}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 shadow-sm"
        />
        {filteredBillings.length > 0 &&
          filteredBillings.find((b) => b.status === "active") && (
            <div>
              <div className="relative group flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-orange-500 cursor-pointer" />
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-100">
                  <div className="bg-orange-100 text-orange-600 text-xs font-semibold rounded-lg px-4 py-3 shadow-lg w-[220px] flex items-center gap-2">
                    <Info className="w-5 h-5 text-orange-700 cursor-pointer" />
                    <p>{t("transactions.paymentDetails.cancelTicket")}</p>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-100 rotate-45" />
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
      <ReusableTable
        columns={columns}
        data={filteredBillings}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onLimitChange={onLimitChange}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={onPageChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
        showSerialNumber={true}
        emptyState={
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {t(
                "transactions.paymentDetails.noTicketsFound",
                "No tickets match your search",
              )}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {t(
                "transactions.paymentDetails.tryDifferentTicket",
                "Try a different ticket number or clear your search.",
              )}
            </p>
          </div>
        }
      />

      <AlertDialog
        open={onOpenCancelBill}
        onOpenChange={setIsCancelBillDialogOpen}
      >
        <AlertDialogContent className="rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              {t("billings.modals.confirmCancelTicket", "Confirm Cancel Ticket")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-base">
              {t(
                "billings.modals.cancelTicketMessage",
                "Are you sure you want to cancel this ticket? This action cannot be undone immediately.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel
              onClick={() => setIsCancelBillDialogOpen(false)}
              className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {t("common.cancelButton", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                createMutation.mutate({
                  reason: "User requested cancellation",
                  ticketID: ticketData?.id || "",
                })
              }
              className="h-11 px-8 active:scale-95 bg-destructive text-white hover:bg-destructive/90 focus:bg-destructive/90 transition-colors"
            >
              {t("common.confirm", "Confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
